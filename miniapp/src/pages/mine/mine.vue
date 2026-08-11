<template>
  <view class="mine-container">
    <!-- 1. 顶部 用户 Profile 卡片 -->
    <view class="user-profile-card" :style="{ paddingTop: (statusBarHeight + 12) + 'px' }">
      <view class="user-row">
        
        <!-- 已登录状态：头像与昵称支持点击进入设置/修改资料页面 -->
        <template v-if="communityState.isLoggedIn">
          <view class="avatar-box" @click="onOpenSettings">
            <image class="avatar" :src="communityState.currentUser.avatar" mode="aspectFill" />
          </view>
          
          <view class="user-info" @click="onOpenSettings">
            <view class="name-line">
              <text class="user-name-text">{{ communityState.currentUser.nickname }}</text>
              <view class="role-badge-tag" :class="getRoleBadgeClass(communityState.currentUser.roleCode)">
                <text class="role-badge-text">{{ communityState.currentUser.roleTag || '🏠 认证业主' }}</text>
              </view>
            </view>
            <view class="property-line">
              <text class="location-icon">📍</text>
              <text class="property-text">{{ communityStore.currentCommunity.name }} {{ communityStore.currentUser.building }} {{ communityStore.currentUser.room }}</text>
              <text class="setting-hint-text">（点击进入设置）</text>
            </view>
          </view>
        </template>

        <!-- 未登录状态：默认头像 + 去登录按钮 -->
        <template v-else>
          <view class="avatar-box" @click="onTriggerLogin">
            <image class="avatar" :src="guestAvatar" mode="aspectFill" />
          </view>
          
          <view class="user-info">
            <text class="guest-title-text">未登录社区住户</text>
            <text class="guest-sub-text">登录后参与邻里交流与社区服务</text>
          </view>

          <button class="go-login-btn" @click="onTriggerLogin">
            <text class="login-btn-text">去登录</text>
          </button>
        </template>
      </view>

      <!-- 2. 下一行数据栏：精简仅显示【我的发帖】与【收到的回复】 -->
      <view class="stats-row">
        <view class="stat-item" @click="onNavToMyPosts('POSTS')">
          <text class="stat-num">{{ communityState.isLoggedIn ? stats.postCount : '--' }}</text>
          <text class="stat-label">我的发帖</text>
        </view>
        <view class="stat-divider"></view>

        <view class="stat-item" @click="onNavToMyPosts('REPLIES')">
          <text class="stat-num">{{ communityState.isLoggedIn ? stats.replyCount : '--' }}</text>
          <text class="stat-label">收到的回复</text>
        </view>
      </view>
    </view>

    <!-- 3. 主体滚动功能区 -->
    <scroll-view scroll-y class="mine-scroll-body">
      
      <!-- 微信授权与个人设置组 -->
      <view class="menu-group">
        <text class="group-title">账号与资料设置</text>

        <!-- 1. 微信原生头像与昵称快捷设置 -->
        <view class="menu-item" @click="onOpenSettings">
          <view class="menu-left">
            <text class="menu-icon">⚙️</text>
            <text class="menu-label">个人资料与设置</text>
          </view>
          <view class="menu-right">
            <text v-if="communityState.isLoggedIn" class="bound-phone-text">修改头像与昵称</text>
            <text v-else class="menu-sub-tip">未登录</text>
            <text class="arrow">›</text>
          </view>
        </view>

        <!-- 2. 微信手机号绑定 -->
        <view class="menu-item">
          <view class="menu-left">
            <text class="menu-icon">📱</text>
            <text class="menu-label">微信关联手机号</text>
          </view>

          <view class="menu-right">
            <template v-if="communityState.isLoggedIn && communityState.currentUser.phone">
              <text class="bound-phone-text">{{ communityState.currentUser.phone }}</text>
              <text class="verified-badge">已验证</text>
            </template>

            <button
              v-else-if="communityState.isLoggedIn"
              class="wx-phone-btn"
              open-type="getPhoneNumber"
              @getphonenumber="onGetPhoneNumber"
            >
              <text class="phone-btn-text">一键授权绑定手机号</text>
            </button>

            <text v-else class="menu-sub-tip">未登录</text>
            <text class="arrow">›</text>
          </view>
        </view>

        <!-- 3. 微信 getUserProfile 扩展资料 -->
        <view class="menu-item" @click="onCallGetUserProfile">
          <view class="menu-left">
            <text class="menu-icon">🌐</text>
            <text class="menu-label">微信地区资料同步</text>
          </view>
          <view class="menu-right">
            <text v-if="communityState.isLoggedIn" class="bound-phone-text">{{ communityState.currentUser.city || '点击同步' }}</text>
            <text v-else class="menu-sub-tip">未登录</text>
            <text class="arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 账号管理 -->
      <view class="menu-group">
        <text class="group-title">账号状态</text>

        <view v-if="communityState.isLoggedIn" class="menu-item" @click="onResetLogin">
          <view class="menu-left">
            <text class="menu-icon">🚪</text>
            <text class="menu-label" style="color: #DC2626;">退出微信登录 (返回游客模式)</text>
          </view>
          <view class="menu-right">
            <text class="arrow">›</text>
          </view>
        </view>

        <view v-else class="menu-item" @click="onTriggerLogin">
          <view class="menu-left">
            <text class="menu-icon">🔑</text>
            <text class="menu-label" style="color: #059669;">微信账号安全登录</text>
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
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useCommunityStore, state as communityState } from '@/store/community'
import { apiGetUserStats } from '@/utils/api'

const communityStore = useCommunityStore()
const statusBarHeight = ref(44)

const guestAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'

const stats = ref({
  postCount: 0,
  replyCount: 0
})

const fetchUserStats = async () => {
  if (communityState.isLoggedIn) {
    const targetOpenId = communityStore.currentUser.openId || communityStore.currentUser.id
    if (targetOpenId && targetOpenId !== 'usr_guest') {
      const data = await apiGetUserStats(targetOpenId)
      if (data) stats.value = data
    }
  }
}

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync()
  if (sysInfo.statusBarHeight) {
    statusBarHeight.value = sysInfo.statusBarHeight
  }
  fetchUserStats()
})

onShow(() => {
  fetchUserStats()
})

// 点击头像或昵称进入【设置 / 资料修改】弹窗
const onOpenSettings = () => {
  if (!communityState.isLoggedIn) {
    onTriggerLogin()
    return
  }

  uni.showActionSheet({
    itemList: ['📷 快捷修改微信头像 (chooseAvatar)', '🏷️ 快捷修改微信昵称 (nickname)', '🌐 同步微信地区资料 (getUserProfile)'],
    success: (res) => {
      if (res.tapIndex === 0) {
        uni.showModal({
          title: '📷 微信原生选头像',
          content: '请直接在界面顶部头像图标上点击触发微信官方原生 chooseAvatar 相册选图！',
          showCancel: false
        })
      } else if (res.tapIndex === 1) {
        uni.showModal({
          title: '🏷️ 微信原生填昵称',
          content: '请在输入框点击调起微信键盘上方浮现的官方真实微信昵称快捷填入！',
          showCancel: false
        })
      } else if (res.tapIndex === 2) {
        onCallGetUserProfile()
      }
    }
  })
}

const getRoleBadgeClass = (roleCode) => {
  if (roleCode === 'COMMUNITY_ADMIN') return 'badge-gov'
  if (roleCode === 'COMMITTEE_ADMIN') return 'badge-committee'
  if (roleCode === 'PROPERTY_STAFF') return 'badge-property'
  if (roleCode === 'MERCHANT') return 'badge-merchant'
  return 'badge-owner'
}

const onGetPhoneNumber = async (e) => {
  uni.showLoading({ title: '绑定中...' })
  let phoneStr = ''
  let phoneCode = ''
  if (e.detail) {
    if (e.detail.phoneNumber || e.detail.purePhoneNumber) phoneStr = e.detail.phoneNumber || e.detail.purePhoneNumber
    if (e.detail.code) phoneCode = e.detail.code
  }
  const boundPhone = await communityStore.bindWxPhone(phoneCode, phoneStr)
  uni.hideLoading()
  uni.showToast({ title: `绑定成功: ${boundPhone}`, icon: 'success' })
}

const onCallGetUserProfile = async () => {
  if (!communityState.isLoggedIn) { onTriggerLogin(); return }
  uni.showLoading({ title: '同步中...' })
  const res = await communityStore.fetchUserProfile()
  uni.hideLoading()
  if (res) uni.showToast({ title: '微信资料已授权！', icon: 'success' })
}

const onTriggerLogin = () => {
  communityStore.openLoginModal()
  uni.switchTab({ url: '/pages/index/index' })
}

const onResetLogin = () => {
  communityStore.clearLoginState()
  stats.value = { postCount: 0, replyCount: 0 }
}

const onNavToMyPosts = () => {
  if (!communityState.isLoggedIn) { onTriggerLogin(); return }
  uni.showModal({
    title: '📝 我的发帖与回复记录',
    content: `根据数据库真实统计：您在【这儿有邻】共发布了 ${stats.value.postCount} 条动态，收到/参与了 ${stats.value.replyCount} 条楼层回复。`,
    showCancel: false
  })
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

.avatar-box {
  line-height: 1;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: block;
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

.user-name-text {
  font-size: 20px;
  font-weight: 800;
  color: #FFFFFF;
}

.role-badge-tag {
  padding: 3px 8px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.role-badge-text {
  font-size: 11px;
  font-weight: 700;
  color: #FFFFFF;
}

.badge-gov { background: rgba(220, 38, 38, 0.4); }
.badge-committee { background: rgba(217, 119, 6, 0.4); }
.badge-property { background: rgba(37, 99, 235, 0.4); }
.badge-merchant { background: rgba(147, 51, 234, 0.4); }
.badge-owner { background: rgba(255, 255, 255, 0.2); }

.property-line {
  display: flex;
  align-items: center;
  gap: 4px;
}

.location-icon { font-size: 12px; }

.property-text {
  font-size: 12px;
  font-weight: 600;
  color: #E6F4EA;
}

.setting-hint-text {
  font-size: 11px;
  color: #A7F3D0;
}

.guest-title-text {
  font-size: 18px;
  font-weight: 800;
  color: #FFFFFF;
}

.guest-sub-text {
  font-size: 11px;
  color: #E6F4EA;
}

.go-login-btn {
  background: #FFFFFF;
  border-radius: 18px;
  padding: 6px 16px;
  line-height: 1;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.login-btn-text {
  font-size: 13px;
  font-weight: 800;
  color: #059669;
}

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
  flex: 1;
}

.stat-num {
  font-size: 20px;
  font-weight: 800;
  color: #FFFFFF;
}

.stat-label {
  font-size: 12px;
  color: #E6F4EA;
}

.stat-divider {
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.25);
}

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

.group-title {
  font-size: 13px;
  font-weight: 800;
  color: #6B7280;
  margin-bottom: 10px;
  display: block;
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

.menu-icon { font-size: 20px; }
.menu-label { font-size: 15px; font-weight: 700; color: #111827; }
.menu-right { display: flex; align-items: center; gap: 6px; }
.menu-sub-tip { font-size: 12px; color: #9CA3AF; }
.bound-phone-text { font-size: 13px; font-weight: 700; color: #059669; }

.verified-badge {
  font-size: 10px; font-weight: 700; color: #065F46; background: #D1FAE5; padding: 2px 6px; border-radius: 4px;
}

.wx-phone-btn {
  background: linear-gradient(135deg, #07C160 0%, #059669 100%);
  padding: 4px 10px; border-radius: 12px; line-height: 1.4; border: none;
}

.phone-btn-text { font-size: 11px; font-weight: 800; color: #FFFFFF; }
.arrow { font-size: 16px; color: #9CA3AF; }
.bottom-space { height: 80px; }
</style>
