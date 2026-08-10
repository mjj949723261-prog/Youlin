<template>
  <view class="mine-container">
    <!-- 1. 顶部用户 Profile 卡片 Header (适配游客模式与已登录模式) -->
    <view class="user-profile-card" :style="{ paddingTop: (statusBarHeight + 12) + 'px' }">
      <view class="user-row">
        <!-- 微信头像一键快捷选择按钮 (已登录) 或登录唤起 (游客) -->
        <button
          class="wx-avatar-btn"
          :open-type="communityState.isLoggedIn ? 'chooseAvatar' : ''"
          @chooseavatar="onChooseWxAvatar"
          @click="onAvatarClick"
        >
          <image class="avatar" :src="communityState.currentUser.avatar" mode="aspectFill" />
          <view class="camera-badge">
            <text class="camera-icon">{{ communityState.isLoggedIn ? '📷' : '🔒' }}</text>
          </view>
        </button>

        <view class="user-info">
          <!-- 已登录状态下的姓名与业主认证 -->
          <template v-if="communityState.isLoggedIn">
            <view class="name-line">
              <input
                type="nickname"
                class="nickname-input"
                v-model="inputNickname"
                placeholder="点击设置微信昵称"
                @blur="onNicknameBlur"
              />
              <view class="verified-tag">
                <text class="shield-icon">🛡️</text>
                <text class="tag-text">业主认证</text>
              </view>
            </view>
            <view class="property-line" @click="onSwitchProperty">
              <text class="location-icon">📍</text>
              <text class="property-text">{{ communityStore.currentCommunity.name }} {{ communityStore.currentUser.building }} {{ communityStore.currentUser.room }}</text>
              <text class="switch-arrow">⇌ 切换</text>
            </view>
          </template>

          <!-- 游客模式下的引导卡片 -->
          <template v-else>
            <view class="name-line" @click="onTriggerLogin">
              <text class="guest-name">未登录游客</text>
              <view class="guest-tag">
                <text class="tag-text">👀 游客模式</text>
              </view>
            </view>
            <view class="login-guide-btn" @click="onTriggerLogin">
              <text class="guide-text">💬 点击完成微信授权登录 ›</text>
            </view>
          </template>
        </view>
      </view>

      <!-- 2. 交互数据快捷栏 -->
      <view class="stats-row">
        <view class="stat-item" @click="onNavToMyPosts('POSTS')">
          <text class="stat-num">{{ communityState.isLoggedIn ? '12' : '--' }}</text>
          <text class="stat-label">我的发帖</text>
        </view>
        <view class="stat-divider"></view>

        <view class="stat-item" @click="onNavToMyPosts('REPLIES')">
          <text class="stat-num">{{ communityState.isLoggedIn ? '38' : '--' }}</text>
          <text class="stat-label">收到回复</text>
        </view>
        <view class="stat-divider"></view>

        <view class="stat-item" @click="onNavToMyFav">
          <text class="stat-num">{{ communityState.isLoggedIn ? '95' : '--' }}</text>
          <text class="stat-label">获得的点赞</text>
        </view>
      </view>
    </view>

    <!-- 3. 主体功能分组区 (平滑滚动) -->
    <scroll-view scroll-y class="mine-scroll-body">
      
      <!-- 游客专属快速登录卡片条 -->
      <view v-if="!communityState.isLoggedIn" class="guest-banner-card" @click="onTriggerLogin">
        <view class="guest-banner-left">
          <text class="banner-icon">💬</text>
          <view class="banner-texts">
            <text class="banner-main">微信一键快捷登录</text>
            <text class="banner-sub">解锁邻里动态发帖、盖楼评论与房产档案</text>
          </view>
        </view>
        <text class="banner-action-btn">立即登录</text>
      </view>

      <!-- 我的资产与业主服务 -->
      <view class="menu-group">
        <text class="group-title">业主身份与微信绑定</text>

        <!-- 微信手机号一键授权绑定 (getPhoneNumber 原生组件) -->
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

        <!-- 新增：微信 getUserProfile 扩展资料一键同步项 -->
        <view class="menu-item" @click="onCallGetUserProfile">
          <view class="menu-left">
            <text class="menu-icon">🌐</text>
            <text class="menu-label">微信 getUserProfile 资料</text>
          </view>
          <view class="menu-right">
            <text v-if="communityState.isLoggedIn" class="bound-phone-text">{{ communityState.currentUser.city || '点击同步' }}</text>
            <text v-else class="menu-sub-tip">未登录</text>
            <text class="arrow">›</text>
          </view>
        </view>

        <view class="menu-item" @click="onNavToProperty">
          <view class="menu-left">
            <text class="menu-icon">🏢</text>
            <text class="menu-label">我的房产认证与档案</text>
          </view>
          <view class="menu-right">
            <text class="menu-sub-tip">{{ communityState.isLoggedIn ? '已认证 1套房产' : '未登录' }}</text>
            <text class="arrow">›</text>
          </view>
        </view>

        <view class="menu-item" @click="onNavToNotice">
          <view class="menu-left">
            <text class="menu-icon">🔔</text>
            <text class="menu-label">社区消息与通知中心</text>
          </view>
          <view class="menu-right">
            <text v-if="communityState.isLoggedIn" class="unread-badge">2 条未读</text>
            <text v-else class="menu-sub-tip">未登录</text>
            <text class="arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 4. 商业化增值/高级功能入口 -->
      <view class="menu-group">
        <view class="group-header-row">
          <text class="group-title">社区增值服务 (增值拓展预留)</text>
          <text class="paid-feature-tag">支持定制接口</text>
        </view>

        <view class="menu-item" @click="onFeatureReserved('蓝牙门禁一键开门')">
          <view class="menu-left">
            <text class="menu-icon">🔑</text>
            <text class="menu-label">蓝牙门禁一键开锁 / 访客密码</text>
          </view>
          <view class="menu-right">
            <text class="menu-sub-tip">对接物业门禁</text>
            <text class="arrow">›</text>
          </view>
        </view>

        <view class="menu-item" @click="onFeatureReserved('在线物业费缴纳')">
          <view class="menu-left">
            <text class="menu-icon">💰</text>
            <text class="menu-label">在线物业费 / 车位费缴纳</text>
          </view>
          <view class="menu-right">
            <text class="menu-sub-tip">自动开具发票</text>
            <text class="arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 5. 账号管理 -->
      <view class="menu-group">
        <text class="group-title">账号与安全</text>

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
import { ref, onMounted } from 'vue'
import { useCommunityStore, state as communityState } from '@/store/community'

const communityStore = useCommunityStore()
const statusBarHeight = ref(44)
const inputNickname = ref('')

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync()
  if (sysInfo.statusBarHeight) {
    statusBarHeight.value = sysInfo.statusBarHeight
  }
  inputNickname.value = communityStore.currentUser.nickname || '微信用户'
})

// 微信快捷选头像
const onChooseWxAvatar = (e) => {
  if (e.detail && e.detail.avatarUrl) {
    communityStore.syncWxProfile(null, e.detail.avatarUrl)
    uni.showToast({ title: '已同步微信头像', icon: 'success' })
  }
}

// 微信快捷手机号授权回调处理
const onGetPhoneNumber = async (e) => {
  console.log('微信 getPhoneNumber 回调原生参数:', e)
  uni.showLoading({ title: '安全绑定中...' })

  let phoneStr = ''
  let phoneCode = ''

  if (e.detail) {
    if (e.detail.phoneNumber || e.detail.purePhoneNumber) {
      phoneStr = e.detail.phoneNumber || e.detail.purePhoneNumber
    }
    if (e.detail.code) {
      phoneCode = e.detail.code
    }
  }

  const boundPhone = await communityStore.bindWxPhone(phoneCode, phoneStr)
  uni.hideLoading()
  uni.showToast({ title: `微信手机号 ${boundPhone} 绑定成功！`, icon: 'success' })
}

// 调起微信原生 getUserProfile 获取其他扩展信息
const onCallGetUserProfile = async () => {
  if (!communityState.isLoggedIn) {
    onTriggerLogin()
    return
  }
  uni.showLoading({ title: '拉取微信资料中...' })
  const res = await communityStore.fetchUserProfile()
  uni.hideLoading()
  if (res) {
    uni.showToast({ title: '微信资料及归属地已同步！', icon: 'success' })
  } else {
    uni.showToast({ title: '根据微信最新政策，请在上方直接选头像和填昵称', icon: 'none' })
  }
}

const onAvatarClick = () => {
  if (!communityState.isLoggedIn) {
    onTriggerLogin()
  }
}

const onNicknameBlur = (e) => {
  const val = e.detail.value || inputNickname.value
  if (val) {
    communityStore.syncWxProfile(val, null)
    uni.showToast({ title: '已同步微信昵称', icon: 'success' })
  }
}

const onTriggerLogin = () => {
  communityStore.openLoginModal()
  uni.switchTab({
    url: '/pages/index/index'
  })
}

const onResetLogin = () => {
  communityStore.clearLoginState()
}

const onSwitchProperty = () => {
  if (!communityState.isLoggedIn) {
    onTriggerLogin()
    return
  }
  uni.showActionSheet({
    itemList: communityStore.myCommunities.map(c => c.name + ' (' + c.building + ')'),
    success: (res) => {
      communityStore.switchCommunity(communityStore.myCommunities[res.tapIndex])
    }
  })
}

const onNavToMyPosts = () => {
  if (!communityState.isLoggedIn) {
    onTriggerLogin()
    return
  }
  uni.showModal({
    title: '📝 我的发帖与回复记录',
    content: '您在【这儿有邻】共发布了 12 条动态。',
    showCancel: false
  })
}

const onNavToMyFav = () => {
  if (!communityState.isLoggedIn) {
    onTriggerLogin()
    return
  }
  uni.showToast({ title: '查看获得的点赞...', icon: 'none' })
}

const onNavToProperty = () => {
  if (!communityState.isLoggedIn) {
    onTriggerLogin()
    return
  }
  uni.showModal({
    title: '🏢 我的房产认证',
    content: `当前绑定：${communityStore.currentCommunity.name} ${communityStore.currentUser.building} ${communityStore.currentUser.room}\n身份状态：🛡️ 业主已认证`,
    showCancel: false
  })
}

const onNavToNotice = () => {
  if (!communityState.isLoggedIn) {
    onTriggerLogin()
    return
  }
  uni.showModal({
    title: '🔔 消息通知中心',
    content: '1. 张先生 回复了您的【邻里求助】帖子\n2. 社区服务中心成立通知',
    showCancel: false
  })
}

const onFeatureReserved = (featureName) => {
  if (!communityState.isLoggedIn) {
    onTriggerLogin()
    return
  }
  uni.showModal({
    title: `⚙️ ${featureName}`,
    content: `【${featureName}】为辅助功能，可随时对接物业门禁与缴费系统！`,
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

.wx-avatar-btn {
  padding: 0;
  margin: 0;
  background: transparent;
  line-height: 1;
  border-radius: 50%;
  position: relative;
  overflow: visible;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: block;
}

.camera-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background: #047857;
  border-radius: 50%;
  border: 1px solid #FFF;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-icon {
  font-size: 10px;
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

.nickname-input {
  font-size: 20px;
  font-weight: 800;
  color: #FFFFFF;
  width: 110px;
  height: 28px;
}

.guest-name {
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

.guest-tag {
  background: rgba(255, 255, 255, 0.25);
  padding: 3px 8px;
  border-radius: 12px;
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

.login-guide-btn {
  background: rgba(255, 255, 255, 0.25);
  padding: 4px 10px;
  border-radius: 14px;
  width: fit-content;
}

.guide-text {
  font-size: 12px;
  font-weight: 700;
  color: #FFFFFF;
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

.mine-scroll-body {
  flex: 1;
  height: 0;
  padding: 16px;
  box-sizing: border-box;
}

.guest-banner-card {
  background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
  border: 1px solid #6EE7B7;
  border-radius: 16px;
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
}

.guest-banner-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.banner-icon {
  font-size: 24px;
}

.banner-texts {
  display: flex;
  flex-direction: column;
}

.banner-main {
  font-size: 14px;
  font-weight: 800;
  color: #065F46;
}

.banner-sub {
  font-size: 11px;
  color: #047857;
}

.banner-action-btn {
  font-size: 12px;
  font-weight: 800;
  color: #FFFFFF;
  background: #059669;
  padding: 6px 12px;
  border-radius: 14px;
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

.bound-phone-text {
  font-size: 13px;
  font-weight: 700;
  color: #059669;
}

.verified-badge {
  font-size: 10px;
  font-weight: 700;
  color: #065F46;
  background: #D1FAE5;
  padding: 2px 6px;
  border-radius: 4px;
}

.wx-phone-btn {
  background: linear-gradient(135deg, #07C160 0%, #059669 100%);
  padding: 4px 10px;
  border-radius: 12px;
  line-height: 1.4;
  border: none;
  box-shadow: 0 2px 8px rgba(7, 193, 96, 0.3);
}

.phone-btn-text {
  font-size: 11px;
  font-weight: 800;
  color: #FFFFFF;
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
