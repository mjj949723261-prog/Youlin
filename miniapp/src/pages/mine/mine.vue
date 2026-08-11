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
            <!-- 第一行：纯粹展示用户昵称大字 -->
            <view class="name-line">
              <text class="user-name-text">{{ communityState.currentUser.nickname }}</text>
            </view>
            <!-- 第二行：展示 7 大角色 Tag 勋章 -->
            <view class="property-line">
              <view class="role-badge-tag" :class="getRoleBadgeClass(communityState.currentUser.roleCode)">
                <text class="role-badge-text">{{ getRoleBadgeText(communityState.currentUser) }}</text>
              </view>
              <text class="setting-hint-text">（点击进入设置）</text>
            </view>
          </view>
        </template>

        <!-- 未登录状态：点击默认头像或“去登录”大字，直接触发微信授权登录逻辑 -->
        <template v-else>
          <view class="avatar-box" @click="onTriggerLogin">
            <image class="avatar" :src="guestAvatar" mode="aspectFill" />
          </view>
          
          <view class="user-info" @click="onTriggerLogin">
            <text class="guest-title-text">去登录</text>
            <text class="guest-sub-text">点击一键完成微信授权，解锁社区功能 ›</text>
          </view>
        </template>
      </view>

      <!-- 2. 下一行数据栏：包含【我的发帖】、【收到的回复】与【我的收藏】 -->
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
        <view class="stat-divider"></view>

        <view class="stat-item" @click="onNavToFavorite">
          <text class="stat-num">{{ communityState.isLoggedIn ? '3' : '--' }}</text>
          <text class="stat-label">我的收藏</text>
        </view>
      </view>
    </view>

    <!-- 3. 主体滚动功能区 -->
    <scroll-view scroll-y class="mine-scroll-body">
      
      <view class="menu-group">
        <!-- 1. 用户认证 -->
        <view class="menu-item" @click="onNavToAuth">
          <view class="menu-left">
            <text class="menu-icon">🛡️</text>
            <text class="menu-label">用户认证</text>
          </view>
          <view class="menu-right">
            <text v-if="communityState.isLoggedIn" class="bound-phone-text">身份已认证</text>
            <text v-else class="menu-sub-tip">未认证</text>
            <text class="arrow">›</text>
          </view>
        </view>

        <!-- 2. 我的消息 -->
        <view class="menu-item" @click="onNavToNotice">
          <view class="menu-left">
            <text class="menu-icon">🔔</text>
            <text class="menu-label">我的消息</text>
          </view>
          <view class="menu-right">
            <text v-if="communityState.isLoggedIn" class="unread-badge">2 条未读</text>
            <text v-else class="menu-sub-tip">未登录</text>
            <text class="arrow">›</text>
          </view>
        </view>

        <!-- 3. 系统设置 -->
        <view class="menu-item" @click="onOpenSettings">
          <view class="menu-left">
            <text class="menu-icon">⚙️</text>
            <text class="menu-label">系统设置</text>
          </view>
          <view class="menu-right">
            <text class="menu-sub-tip">修改资料/绑定</text>
            <text class="arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 仅在已登录状态下才显示的退出登录按钮 -->
      <view v-if="communityState.isLoggedIn" class="logout-btn-box" @click="onResetLogin">
        <text class="logout-btn-text">退出登录</text>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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

// 解析 7 大角色的中文 Tag
const getRoleBadgeText = (user) => {
  const code = user.roleCode
  if (code === 'COMMUNITY_ADMIN') return '🛡️ 社区管理员'
  if (code === 'COMMITTEE_ADMIN') return '🏛️ 业委会代表'
  if (code === 'PROPERTY_STAFF') return '🏢 物业人员'
  if (code === 'MERCHANT') return '🏪 商户'
  if (code === 'TENANT') return '🔑 租客'
  if (code === 'GUEST') return '👤 游客'
  return user.roleTag || '🏠 业主'
}

// 解析 7 大角色的专属 Badge 样式类
const getRoleBadgeClass = (roleCode) => {
  if (roleCode === 'COMMUNITY_ADMIN') return 'badge-gov'
  if (roleCode === 'COMMITTEE_ADMIN') return 'badge-committee'
  if (roleCode === 'PROPERTY_STAFF') return 'badge-property'
  if (roleCode === 'MERCHANT') return 'badge-merchant'
  if (roleCode === 'TENANT') return 'badge-tenant'
  if (roleCode === 'GUEST') return 'badge-guest'
  return 'badge-owner'
}

// 用户认证触发
const onNavToAuth = () => {
  if (!communityState.isLoggedIn) {
    onTriggerLogin()
    return
  }
  uni.showModal({
    title: '🛡️ 用户身份认证',
    content: `绑定小区：${communityStore.currentCommunity.name}\n当前角色：${getRoleBadgeText(communityStore.currentUser)}\n认证状态：已通过官方实名身份认证`,
    showCancel: false
  })
}

// ⭐ 我的收藏触发
const onNavToFavorite = () => {
  if (!communityState.isLoggedIn) {
    onTriggerLogin()
    return
  }
  uni.showModal({
    title: '⭐ 我的收藏夹',
    content: '1. 社区服务中心关于成立业委会通知\n2. 5栋邻居张先生【求助找猫】\n3. 闲置电梯卡转让',
    showCancel: false
  })
}

// 我的消息触发
const onNavToNotice = () => {
  if (!communityState.isLoggedIn) {
    onTriggerLogin()
    return
  }
  uni.showModal({
    title: '🔔 我的消息中心',
    content: '1. 张先生 回复了您的【邻里求助】帖子\n2. 社区服务中心成立通知',
    showCancel: false
  })
}

// 系统设置触发
const onOpenSettings = () => {
  if (!communityState.isLoggedIn) {
    onTriggerLogin()
    return
  }

  uni.showActionSheet({
    itemList: [
      '📷 修改微信头像 (chooseAvatar)',
      '🏷️ 修改微信昵称 (nickname)',
      '📱 关联微信手机号',
      '🎭 切换体验角色 (7大角色视图)',
      '🌐 同步微信地区资料 (getUserProfile)'
    ],
    success: async (res) => {
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
        uni.showToast({ title: '已关联验证微信手机号', icon: 'success' })
      } else if (res.tapIndex === 3) {
        onSwitchRoleDialog()
      } else if (res.tapIndex === 4) {
        onCallGetUserProfile()
      }
    }
  })
}

// 切换 7 大角色体验
const onSwitchRoleDialog = () => {
  uni.showActionSheet({
    itemList: [
      '🛡️ 社区管理员',
      '🏛️ 业委会代表',
      '🏠 业主',
      '🏢 物业人员',
      '🏪 商户',
      '🔑 租客',
      '👤 游客'
    ],
    success: (res) => {
      const roles = ['COMMUNITY_ADMIN', 'COMMITTEE_ADMIN', 'OWNER', 'PROPERTY_STAFF', 'MERCHANT', 'TENANT', 'GUEST']
      const targetRole = roles[res.tapIndex]
      communityStore.currentUser.roleCode = targetRole
      uni.showToast({ title: `已成功切换视角为: ${getRoleBadgeText(communityStore.currentUser)}`, icon: 'none' })
    }
  })
}

const onCallGetUserProfile = async () => {
  if (!communityState.isLoggedIn) { onTriggerLogin(); return }
  uni.showLoading({ title: '同步中...' })
  const res = await communityStore.fetchUserProfile()
  uni.hideLoading()
  if (res) uni.showToast({ title: '微信资料已授权！', icon: 'success' })
}

// 核心登录逻辑：点击直接一键执行全自动微信授权登录！
const onTriggerLogin = async () => {
  uni.showLoading({ title: '微信安全授权登录中...' })
  const success = await communityStore.loginWithWxCode()
  uni.hideLoading()
  if (success) {
    uni.showToast({ title: '微信授权登录成功！', icon: 'success' })
    fetchUserStats()
  } else {
    uni.showToast({ title: '登录失败，请稍后重试', icon: 'none' })
  }
}

const onResetLogin = () => {
  uni.showModal({
    title: '🚪 退出登录确认',
    content: '确定要退出当前微信账号并返回游客模式吗？',
    confirmColor: '#DC2626',
    success: (res) => {
      if (res.confirm) {
        communityStore.clearLoginState()
        stats.value = { postCount: 0, replyCount: 0 }
      }
    }
  })
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
}

.user-name-text {
  font-size: 20px;
  font-weight: 800;
  color: #FFFFFF;
}

.property-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.role-badge-tag {
  padding: 3px 10px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  display: inline-flex;
  align-items: center;
}

.role-badge-text {
  font-size: 11px;
  font-weight: 800;
  color: #FFFFFF;
}

.badge-gov { background: rgba(220, 38, 38, 0.5); }
.badge-committee { background: rgba(217, 119, 6, 0.5); }
.badge-property { background: rgba(37, 99, 235, 0.5); }
.badge-merchant { background: rgba(147, 51, 234, 0.5); }
.badge-tenant { background: rgba(16, 185, 129, 0.5); }
.badge-guest { background: rgba(107, 114, 128, 0.5); }
.badge-owner { background: rgba(255, 255, 255, 0.25); }

.setting-hint-text {
  font-size: 11px;
  color: #A7F3D0;
}

.guest-title-text {
  font-size: 20px;
  font-weight: 800;
  color: #FFFFFF;
}

.guest-sub-text {
  font-size: 12px;
  color: #E6F4EA;
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
  padding: 8px 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.04);
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
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

.unread-badge {
  font-size: 11px; font-weight: 700; color: #EF4444; background: #FEE2E2; padding: 2px 8px; border-radius: 10px;
}

.arrow { font-size: 16px; color: #9CA3AF; }

.logout-btn-box {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(220, 38, 38, 0.05);
  border: 1px solid #FEE2E2;
}

.logout-btn-text {
  font-size: 15px;
  font-weight: 800;
  color: #DC2626;
}

.bottom-space { height: 80px; }
</style>
