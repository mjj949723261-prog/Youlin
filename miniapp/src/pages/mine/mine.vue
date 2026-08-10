<template>
  <view class="mine-container">
    <!-- 1. 顶部个人基本信息名片卡片 (微信授权同步) -->
    <view class="user-profile-card">
      <view class="avatar-wrapper">
        <!-- 微信官方最新快捷选择头像按钮 -->
        <button class="wx-avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseWxAvatar">
          <image class="user-avatar" :src="communityStore.currentUser.avatar" mode="aspectFill" />
          <view class="avatar-edit-badge">
            <text class="camera-icon">📷</text>
          </view>
        </button>
      </view>

      <view class="profile-info">
        <view class="name-line">
          <input
            type="nickname"
            class="nickname-input"
            v-model="inputNickname"
            placeholder="点击同步微信昵称"
            @blur="onNicknameBlur"
          />
          <text class="owner-badge">🛡️ 业主已认证</text>
        </view>

        <text class="house-desc">云彩之城 1期 · 5栋 302室</text>
        <text class="community-belong">隶属：新塘街道彩虹社区</text>

        <!-- 微信账号同步状态标记 -->
        <view class="sync-status-strip" @click="triggerWxSync">
          <text class="status-icon">🟢</text>
          <text class="status-text">已与微信账号绑定登录 (点击可重新同步头像昵称)</text>
        </view>
      </view>
    </view>

    <!-- 2. 社区房产列表卡片 (支持多房产切换) -->
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">我的社区房产</text>
        <text class="add-house-btn" @click="onAddHouse">+ 绑定新房产</text>
      </view>

      <view class="house-list">
        <view
          v-for="house in communityStore.myCommunities"
          :key="house.id"
          class="house-item"
          :class="{ active: house.id === communityStore.currentCommunity.id }"
          @click="onSwitchHouse(house)"
        >
          <view class="house-left">
            <text class="house-icon">🏡</text>
            <view class="house-meta">
              <text class="house-name">{{ house.name }}</text>
              <text class="house-detail">{{ house.building }}</text>
            </view>
          </view>
          <text v-if="house.id === communityStore.currentCommunity.id" class="current-tag">当前选择</text>
        </view>
      </view>
    </view>

    <!-- 3. 互动统计卡片 -->
    <view class="stats-row">
      <view class="stat-card" @click="onMyPosts">
        <text class="stat-num">12</text>
        <text class="stat-label">我的动态</text>
      </view>
      <view class="stat-card" @click="onMyReplies">
        <text class="stat-num">38</text>
        <text class="stat-label">收到回复</text>
      </view>
      <view class="stat-card" @click="onMyLikes">
        <text class="stat-num">95</text>
        <text class="stat-label">获得的赞</text>
      </view>
    </view>

    <!-- 4. 商业化增值功能入口 -->
    <view class="section-card">
      <text class="section-title margin-bottom">社区高级服务 (商业扩展预留)</text>

      <view class="menu-list">
        <view class="menu-item" @click="onOpenVip">
          <view class="menu-left">
            <text class="menu-icon">👑</text>
            <text class="menu-label">社区 VIP 业主权益特权包</text>
          </view>
          <view class="menu-right">
            <text class="vip-tag">首月 ¥9.9</text>
            <text class="arrow">›</text>
          </view>
        </view>

        <view class="menu-item" @click="onOpenParking">
          <view class="menu-left">
            <text class="menu-icon">🅿️</text>
            <text class="menu-label">车位共享出租 / 智能便民找车位</text>
          </view>
          <view class="menu-right">
            <text class="menu-badge">热热门</text>
            <text class="arrow">›</text>
          </view>
        </view>

        <view class="menu-item" @click="onOpenCleaning">
          <view class="menu-left">
            <text class="menu-icon">🧹</text>
            <text class="menu-label">专属家政保洁 / 抽油烟机清洗直订</text>
          </view>
          <view class="menu-right">
            <text class="menu-sub">邻里团购价</text>
            <text class="arrow">›</text>
          </view>
        </view>
      </view>
    </view>

  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCommunityStore } from '@/store/community'

const communityStore = useCommunityStore()
const inputNickname = ref('')

onMounted(() => {
  inputNickname.value = communityStore.currentUser.nickname || '微信用户'
})

// 微信官方快捷获取头像回调
const onChooseWxAvatar = (e) => {
  if (e.detail && e.detail.avatarUrl) {
    const newAvatar = e.detail.avatarUrl
    communityStore.syncWxProfile(null, newAvatar)
    uni.showToast({ title: '已同步微信头像', icon: 'success' })
  }
}

// 微信官方快捷获取昵称回调
const onNicknameBlur = (e) => {
  const newName = e.detail.value || inputNickname.value
  if (newName) {
    communityStore.syncWxProfile(newName, null)
    uni.showToast({ title: '已同步微信昵称', icon: 'success' })
  }
}

// 手动触发微信重新授权登录同步
const triggerWxSync = async () => {
  uni.showLoading({ title: '正在同步微信登录...' })
  await communityStore.initWxAuth()
  uni.hideLoading()
  uni.showToast({ title: '微信账号已同步最新登录态', icon: 'success' })
}

const onSwitchHouse = (house) => {
  communityStore.switchCommunity(house)
  uni.showToast({ title: '已切换至: ' + house.name, icon: 'none' })
}

const onAddHouse = () => {
  uni.showModal({
    title: '绑定新房产认证',
    content: '请联系【新塘街道彩虹社区】物业管家获取房间专属认证邀请码。',
    showCancel: false
  })
}

const onMyPosts = () => { uni.showToast({ title: '已进入我的动态', icon: 'none' }) }
const onMyReplies = () => { uni.showToast({ title: '已进入回复列表', icon: 'none' }) }
const onMyLikes = () => { uni.showToast({ title: '已进入获赞列表', icon: 'none' }) }

const onOpenVip = () => {
  uni.showModal({
    title: '👑 社区 VIP 业主权益特权包',
    content: '解锁家政折扣、优先修缮派单、免费二手闲置极速曝光等 8 大社区专属特权！',
    confirmText: '立即开通',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '调起微信支付...', icon: 'none' })
      }
    }
  })
}

const onOpenParking = () => {
  uni.showModal({
    title: '🅿️ 邻里共享车位',
    content: '业主闲置车位按时段出租，临时停靠省心划算！',
    showCancel: false
  })
}

const onOpenCleaning = () => {
  uni.showModal({
    title: '🧹 社区品质家政预订',
    content: '彩虹社区合作优质家政公司，业主专属团购价 85 折！',
    showCancel: false
  })
}
</script>

<style scoped>
.mine-container {
  padding: 16px;
  background-color: #F0F7F4;
  min-height: 100vh;
  box-sizing: border-box;
}

.user-profile-card {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.05);
}

.avatar-wrapper {
  position: relative;
}

.wx-avatar-btn {
  padding: 0;
  margin: 0;
  background: transparent;
  line-height: 1;
  border-radius: 50%;
  overflow: visible;
  position: relative;
}

.user-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px solid #E6F4EA;
  display: block;
}

.avatar-edit-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: #10B981;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #FFF;
}

.camera-icon {
  font-size: 10px;
  line-height: 1;
}

.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nickname-input {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  width: 110px;
  height: 24px;
}

.owner-badge {
  font-size: 10px;
  font-weight: 700;
  color: #D97706;
  background: #FEF3C7;
  padding: 2px 6px;
  border-radius: 6px;
}

.house-desc {
  font-size: 13px;
  font-weight: 600;
  color: #059669;
}

.community-belong {
  font-size: 11px;
  color: #9CA3AF;
}

.sync-status-strip {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: #F0FDF4;
  padding: 2px 6px;
  border-radius: 6px;
  width: fit-content;
}

.status-icon {
  font-size: 8px;
}

.status-text {
  font-size: 9px;
  color: #166534;
}

.section-card {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 18px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.03);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.section-title {
  font-size: 15px;
  font-weight: 800;
  color: #111827;
}

.margin-bottom {
  display: block;
  margin-bottom: 14px;
}

.add-house-btn {
  font-size: 12px;
  font-weight: 700;
  color: #059669;
}

.house-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.house-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #F9FAFB;
  border-radius: 12px;
  padding: 12px;
  border: 1px solid transparent;
}

.house-item.active {
  background: #E6F4EA;
  border-color: #10B981;
}

.house-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.house-icon {
  font-size: 20px;
}

.house-meta {
  display: flex;
  flex-direction: column;
}

.house-name {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.house-detail {
  font-size: 11px;
  color: #6B7280;
}

.current-tag {
  font-size: 11px;
  font-weight: 700;
  color: #059669;
}

.stats-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.stat-card {
  flex: 1;
  background: #FFFFFF;
  border-radius: 16px;
  padding: 14px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.03);
}

.stat-num {
  font-size: 18px;
  font-weight: 800;
  color: #059669;
}

.stat-label {
  font-size: 11px;
  color: #6B7280;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #F9FAFB;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.menu-icon {
  font-size: 18px;
}

.menu-label {
  font-size: 13px;
  color: #374151;
  font-weight: 600;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.vip-tag {
  font-size: 10px;
  font-weight: 700;
  color: #DC2626;
  background: #FEE2E2;
  padding: 2px 6px;
  border-radius: 6px;
}

.menu-badge {
  font-size: 10px;
  font-weight: 700;
  color: #D97706;
  background: #FEF3C7;
  padding: 2px 6px;
  border-radius: 6px;
}

.menu-sub {
  font-size: 11px;
  color: #9CA3AF;
}

.arrow {
  font-size: 16px;
  color: #9CA3AF;
}
</style>
