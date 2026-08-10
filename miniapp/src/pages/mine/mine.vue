<template>
  <view class="mine-container">
    <!-- 1. 顶部用户 Profile 卡片 Header (高颜值绿色渐变沉浸背景) -->
    <view class="user-profile-card" :style="{ paddingTop: (statusBarHeight + 12) + 'px' }">
      <view class="user-row">
        <!-- 微信头像一键快捷选择按钮 -->
        <button class="wx-avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseWxAvatar">
          <image class="avatar" :src="communityStore.currentUser.avatar" mode="aspectFill" />
          <view class="camera-badge">
            <text class="camera-icon">📷</text>
          </view>
        </button>

        <view class="user-info">
          <view class="name-line">
            <!-- 微信快捷昵称填充组件 -->
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

          <!-- 绑定的社区与门牌信息 (可点击切换) -->
          <view class="property-line" @click="onSwitchProperty">
            <text class="location-icon">📍</text>
            <text class="property-text">{{ communityStore.currentCommunity.name }} {{ communityStore.currentUser.building }} {{ communityStore.currentUser.room }}</text>
            <text class="switch-arrow">⇌ 切换</text>
          </view>
        </view>
      </view>

      <!-- 2. 交互数据快捷栏 -->
      <view class="stats-row">
        <view class="stat-item" @click="onNavToMyPosts('POSTS')">
          <text class="stat-num">12</text>
          <text class="stat-label">我的发帖</text>
        </view>
        <view class="stat-divider"></view>

        <view class="stat-item" @click="onNavToMyPosts('REPLIES')">
          <text class="stat-num">38</text>
          <text class="stat-label">收到回复</text>
        </view>
        <view class="stat-divider"></view>

        <view class="stat-item" @click="onNavToMyFav">
          <text class="stat-num">95</text>
          <text class="stat-label">获得的点赞</text>
        </view>
      </view>
    </view>

    <!-- 3. 主体功能分组区 (平滑滚动) -->
    <scroll-view scroll-y class="mine-scroll-body">
      
      <!-- 我的资产与业主服务 -->
      <view class="menu-group">
        <text class="group-title">业主服务与资产</text>

        <view class="menu-item" @click="onNavToProperty">
          <view class="menu-left">
            <text class="menu-icon">🏢</text>
            <text class="menu-label">我的房产认证与档案</text>
          </view>
          <view class="menu-right">
            <text class="menu-sub-tip">已认证 1套房产</text>
            <text class="arrow">›</text>
          </view>
        </view>

        <view class="menu-item" @click="onNavToNotice">
          <view class="menu-left">
            <text class="menu-icon">🔔</text>
            <text class="menu-label">社区消息与通知中心</text>
          </view>
          <view class="menu-right">
            <text class="unread-badge">2 条未读</text>
            <text class="arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 4. 商业化增值/高级功能入口 (商业拓展预留) -->
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

        <view class="menu-item" @click="onFeatureReserved('公区报修与工单跟踪')">
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
const inputNickname = ref('')

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync()
  if (sysInfo.statusBarHeight) {
    statusBarHeight.value = sysInfo.statusBarHeight
  }
  inputNickname.value = communityStore.currentUser.nickname || '张先生'
})

// 微信快捷选头像
const onChooseWxAvatar = (e) => {
  if (e.detail && e.detail.avatarUrl) {
    communityStore.syncWxProfile(null, e.detail.avatarUrl)
    uni.showToast({ title: '已同步微信头像', icon: 'success' })
  }
}

// 微信快捷填昵称
const onNicknameBlur = (e) => {
  const val = e.detail.value || inputNickname.value
  if (val) {
    communityStore.syncWxProfile(val, null)
    uni.showToast({ title: '已同步微信昵称', icon: 'success' })
  }
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
const onNavToMyPosts = () => {
  uni.showModal({
    title: '📝 我的发帖与回复记录',
    content: '您在【云彩之城】共发布了 12 条动态，包括 3 条邻里求助与 5 条闲置面交。',
    showCancel: false
  })
}

// 查看我的收藏
const onNavToMyFav = () => {
  uni.showToast({ title: '查看获得的点赞...', icon: 'none' })
}

// 房产管理
const onNavToProperty = () => {
  uni.showModal({
    title: '🏢 我的房产认证',
    content: `当前绑定：${communityStore.currentCommunity.name} ${communityStore.currentUser.building} ${communityStore.currentUser.room}\n身份状态：🛡️ 业主已认证`,
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

/* 1. 顶部用户 Profile 卡片 Header (高颜值绿色渐变) */
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
