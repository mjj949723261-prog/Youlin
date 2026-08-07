<template>
  <view class="mine-container">
    <!-- 1. 顶部用户高感度个人卡片 Header -->
    <view class="user-profile-card" :style="{ paddingTop: (statusBarHeight + 16) + 'px' }">
      <view class="user-row">
        <image class="avatar" :src="communityStore.currentUser.avatar" mode="aspectFill" @click="onEditProfile" />
        <view class="user-info">
          <view class="name-line" @click="onEditProfile">
            <text class="user-name">{{ communityStore.currentUser.nickname }}</text>
            <view class="verified-tag">
              <text class="shield-icon">🛡️</text>
              <text class="tag-text">业主已认证</text>
            </view>
          </view>

          <!-- 房产绑定门牌号信息 -->
          <view class="property-line" @click="onSwitchProperty">
            <text class="location-icon">🏡</text>
            <text class="property-text">
              {{ communityStore.currentCommunity.name }} {{ communityStore.currentUser.building }}{{ communityStore.currentUser.room }}
            </text>
            <text class="switch-arrow">切换 ›</text>
          </view>
        </view>
      </view>

      <!-- 2. 个人互动数据快捷条 -->
      <view class="stats-row">
        <view class="stat-item" @click="onNavToMyPosts('ALL')">
          <text class="stat-num">12</text>
          <text class="stat-label">我的发帖</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item" @click="onNavToMyPosts('HELP')">
          <text class="stat-num">3</text>
          <text class="stat-label">邻里求助</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item" @click="onNavToMyPosts('IDLE')">
          <text class="stat-num">5</text>
          <text class="stat-label">闲置面交</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item" @click="onNavToMyFav">
          <text class="stat-num">18</text>
          <text class="stat-label">我的收藏</text>
        </view>
      </view>
    </view>

    <!-- 3. 主体功能菜单区 -->
    <scroll-view scroll-y class="mine-scroll-body">
      
      <!-- 核心社区房产与资产管理组 -->
      <view class="menu-group">
        <text class="group-title">社区与房产管理</text>
        
        <view class="menu-item" @click="onNavToProperty">
          <view class="menu-left">
            <text class="menu-icon">🏢</text>
            <text class="menu-label">我的房产与同住人</text>
          </view>
          <view class="menu-right">
            <text class="menu-sub-tip">云彩之城 1套房产</text>
            <text class="arrow">›</text>
          </view>
        </view>

        <view class="menu-item" @click="onNavToMyPosts('ALL')">
          <view class="menu-left">
            <text class="menu-icon">📝</text>
            <text class="menu-label">我的发帖与回复记录</text>
          </view>
          <view class="menu-right">
            <text class="arrow">›</text>
          </view>
        </view>

        <view class="menu-item" @click="onNavToNotice">
          <view class="menu-left">
            <text class="menu-icon">🔔</text>
            <text class="menu-label">消息通知中心</text>
          </view>
          <view class="menu-right">
            <text class="unread-badge">2条新消息</text>
            <text class="arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 4. 辅助收费与物业增值服务预留组 (后期定制与收费项目) -->
      <view class="menu-group">
        <view class="group-header-row">
          <text class="group-title">物业增值与便捷服务</text>
          <text class="paid-feature-tag">辅助定制服务</text>
        </view>
        
        <view class="menu-item" @click="onFeatureReserved('手机门禁与蓝牙开门')">
          <view class="menu-left">
            <text class="menu-icon">🔑</text>
            <text class="menu-label">手机门禁与蓝牙开门</text>
          </view>
          <view class="menu-right">
            <text class="menu-sub-tip">未开通</text>
            <text class="arrow">›</text>
          </view>
        </view>

        <view class="menu-item" @click="onFeatureReserved('物业费与停车费缴纳')">
          <view class="menu-left">
            <text class="menu-icon">💳</text>
            <text class="menu-label">物业费与停车费缴纳</text>
          </view>
          <view class="menu-right">
            <text class="menu-sub-tip">按月缴费</text>
            <text class="arrow">›</text>
          </view>
        </view>

        <view class="menu-item" @click="onFeatureReserved('公区工单与报修记录')">
          <view class="menu-left">
            <text class="menu-icon">🛠️</text>
            <text class="menu-label">公区工单与报修记录</text>
          </view>
          <view class="menu-right">
            <text class="arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 5. 邻里工具与系统设置 -->
      <view class="menu-group">
        <text class="group-title">工具与支持</text>

        <view class="menu-item" @click="onInviteNeighbor">
          <view class="menu-left">
            <text class="menu-icon">💌</text>
            <text class="menu-label">邀请邻居入驻云彩之城</text>
          </view>
          <view class="menu-right">
            <text class="menu-sub-tip">共享生成邀请码</text>
            <text class="arrow">›</text>
          </view>
        </view>

        <view class="menu-item" @click="onCallProperty">
          <view class="menu-left">
            <text class="menu-icon">📞</text>
            <text class="menu-label">新塘街道彩虹社区 / 物业电话</text>
          </view>
          <view class="menu-right">
            <text class="menu-sub-tip">一键拨打</text>
            <text class="arrow">›</text>
          </view>
        </view>

        <view class="menu-item" @click="onFeedback">
          <view class="menu-left">
            <text class="menu-icon">💬</text>
            <text class="menu-label">意见反馈与建议</text>
          </view>
          <view class="menu-right">
            <text class="arrow">›</text>
          </view>
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCommunityStore } from '@/store/community'

const communityStore = useCommunityStore()
const statusBarHeight = ref(44)

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync()
  if (sysInfo.statusBarHeight) {
    statusBarHeight.value = sysInfo.statusBarHeight
  }
})

// 修改资料
const onEditProfile = () => {
  uni.showToast({ title: '修改个人资料/头像...', icon: 'none' })
}

// 切换房产/小区
const onSwitchProperty = () => {
  uni.showActionSheet({
    itemList: communityStore.myCommunities.map(c => c.name + ' (' + c.building + ')'),
    success: (res) => {
      communityStore.switchCommunity(communityStore.myCommunities[res.tapIndex])
    }
  })
}

// 查看我的发帖
const onNavToMyPosts = (type) => {
  uni.showModal({
    title: '📝 我的发帖与回复记录',
    content: '您在【云彩之城】共发布了 12 条动态，包括 3 条邻里求助与 5 条闲置面交。',
    showCancel: false
  })
}

// 查看我的收藏
const onNavToMyFav = () => {
  uni.showToast({ title: '查看我的收藏...', icon: 'none' })
}

// 房产管理
const onNavToProperty = () => {
  uni.showModal({
    title: '🏢 我的房产认证',
    content: `当前绑定：${communityStore.currentCommunity.name} ${communityStore.currentUser.building}${communityStore.currentUser.room}\n身份状态：业主认证`,
    showCancel: false
  })
}

// 消息中心
const onNavToNotice = () => {
  uni.showModal({
    title: '🔔 消息通知中心',
    content: '1. 张先生 回复了您的【邻里求助】帖子\n2. 社区公告：新塘街道彩虹社区正式成立通知',
    showCancel: false
  })
}

// 预留辅助收费功能接口点击提示
const onFeatureReserved = (featureName) => {
  uni.showModal({
    title: `⚙️ ${featureName}`,
    content: `【${featureName}】为辅助定制功能（后期增值收费项目），目前接口已全量预留，可随时对接小区物业门禁与缴费系统！`,
    showCancel: false
  })
}

// 邀请邻居
const onInviteNeighbor = () => {
  uni.showModal({
    title: '💌 邀请邻居入驻',
    content: '感谢您邀请邻居加入【云彩之城】社区交流圈！转发分享小程序即可邀请邻居完成房产认证。',
    showCancel: false
  })
}

// 拨打物业/社区电话
const onCallProperty = () => {
  uni.showActionSheet({
    itemList: ['拨打 彩虹社区服务中心: 0571-88889999', '拨打 云彩之城物业处: 0571-66668888'],
    success: (res) => {
      const num = res.tapIndex === 0 ? '057188889999' : '057166668888'
      uni.makePhoneCall({ phoneNumber: num })
    }
  })
}

// 反馈
const onFeedback = () => {
  uni.showToast({ title: '感谢您的意见反馈！', icon: 'none' })
}
</script>

<style scoped>
.mine-container {
  height: 100vh;
  background-color: #F0F7F4;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}

/* 1. 顶部用户 Profile 卡片 Header */
.user-profile-card {
  background: linear-gradient(180deg, #10B981 0%, #059669 100%);
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 24px;
  border-radius: 0 0 28px 28px;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.25);
  color: #FFFFFF;
  flex-shrink: 0;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.name-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-size: 20px;
  font-weight: 800;
  color: #FFFFFF;
}

.verified-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  padding: 3px 8px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.shield-icon {
  font-size: 11px;
}

.tag-text {
  font-size: 11px;
  font-weight: 700;
  color: #FFFFFF;
}

.property-line {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.12);
  padding: 4px 10px;
  border-radius: 14px;
  width: fit-content;
}

.location-icon {
  font-size: 12px;
}

.property-text {
  font-size: 12px;
  font-weight: 600;
  color: #E6F4EA;
}

.switch-arrow {
  font-size: 11px;
  color: #A7F3D0;
  margin-left: 2px;
}

/* 2. 交互数据快捷栏 */
.stats-row {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(6px);
  border-radius: 16px;
  padding: 14px 10px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-num {
  font-size: 18px;
  font-weight: 800;
  color: #FFFFFF;
}

.stat-label {
  font-size: 11px;
  color: #E6F4EA;
}

.stat-divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.25);
}

/* 主体功能分组区 */
.mine-scroll-body {
  flex: 1;
  height: 0;
  padding: 16px;
  box-sizing: border-box;
}

.menu-group {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 14px;
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.04);
}

.group-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.group-title {
  font-size: 13px;
  font-weight: 800;
  color: #6B7280;
  margin-bottom: 10px;
  display: block;
}

.group-header-row .group-title {
  margin-bottom: 0;
}

.paid-feature-tag {
  font-size: 10px;
  font-weight: 700;
  color: #D97706;
  background: #FEF3C7;
  padding: 2px 6px;
  border-radius: 4px;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #F9FAFB;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-icon {
  font-size: 20px;
}

.menu-label {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.menu-sub-tip {
  font-size: 12px;
  color: #9CA3AF;
}

.unread-badge {
  font-size: 11px;
  font-weight: 700;
  color: #EF4444;
  background: #FEE2E2;
  padding: 2px 8px;
  border-radius: 10px;
}

.arrow {
  font-size: 16px;
  color: #9CA3AF;
}

.bottom-space {
  height: 80px;
}
</style>
