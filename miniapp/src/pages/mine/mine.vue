<template>
  <view class="mine-container">
    <!-- 1. 顶部用户 Profile 卡片 Header (含角色 Badge 与权限展示) -->
    <view class="user-profile-card" :style="{ paddingTop: (statusBarHeight + 12) + 'px' }">
      <view class="user-row">
        
        <!-- 微信官方原生 chooseAvatar 选头像按钮 -->
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
          <!-- 已登录状态下的姓名与微信原生 nickname 快捷填入输入框 -->
          <template v-if="communityState.isLoggedIn">
            <view class="name-line">
              <input
                type="nickname"
                class="nickname-input"
                v-model="inputNickname"
                placeholder="点击键盘上方授权微信昵称"
                @blur="onNicknameBlur"
                @change="onNicknameChange"
              />
              <view class="role-badge-tag" :class="getRoleBadgeClass(communityState.currentUser.roleCode)">
                <text class="role-badge-text">{{ communityState.currentUser.roleTag || '🏠 认证业主' }}</text>
              </view>
            </view>
            <view class="property-line" @click="onSwitchProperty">
              <text class="location-icon">📍</text>
              <text class="property-text">{{ communityStore.currentCommunity.name }} {{ communityStore.currentUser.building }} {{ communityStore.currentUser.room }}</text>
              <text class="switch-arrow">⇌ 切换站点</text>
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

      <!-- 2. 数据库真实统计 & 角色切换快捷入口 -->
      <view class="stats-row">
        <view class="stat-item" @click="onNavToMyPosts('POSTS')">
          <text class="stat-num">{{ communityState.isLoggedIn ? stats.postCount : '--' }}</text>
          <text class="stat-label">我的发帖</text>
        </view>
        <view class="stat-divider"></view>

        <view class="stat-item" @click="onNavToMyPosts('REPLIES')">
          <text class="stat-num">{{ communityState.isLoggedIn ? stats.replyCount : '--' }}</text>
          <text class="stat-label">收到回复</text>
        </view>
        <view class="stat-divider"></view>

        <view class="stat-item" @click="onTriggerSwitchRole">
          <text class="stat-num">🎭</text>
          <text class="stat-label">切换演示角色</text>
        </view>
      </view>
    </view>

    <!-- 3. 主体功能区 (管理工作台 + 菜单) -->
    <scroll-view scroll-y class="mine-scroll-body">
      
      <!-- 游客专属登录卡片 -->
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

      <!-- 🔥🔥🔥 核心：针对不同管理角色的专属【⚙️ 社区管理工作台】 -->
      <view v-if="communityState.isLoggedIn && isAdminRole" class="admin-console-card">
        <view class="console-header">
          <view class="console-title-box">
            <text class="console-icon">⚙️</text>
            <text class="console-title">社区管理工作台</text>
          </view>
          <text class="console-scope-tag">{{ getScopeText }}</text>
        </view>

        <view class="admin-grid">
          <!-- 1. 违规举报工单处理 (所有管理员) -->
          <view class="admin-grid-item" @click="onOpenReportManage">
            <view class="grid-icon-box bg-red">
              <text class="grid-icon">🚨</text>
              <text v-if="pendingReportCount > 0" class="badge-dot">{{ pendingReportCount }}</text>
            </view>
            <text class="grid-label">违规举报处分</text>
          </view>

          <!-- 2. 业主房产认证审核 (物业与业委会) -->
          <view class="admin-grid-item" @click="onOpenHouseAudit">
            <view class="grid-icon-box bg-emerald">
              <text class="grid-icon">🏡</text>
            </view>
            <text class="grid-label">房产认证审核</text>
          </view>

          <!-- 3. 小区站点开通配置 (仅行政社区管理者) -->
          <view v-if="isCommunityAdmin" class="admin-grid-item" @click="onOpenSiteManage">
            <view class="grid-icon-box bg-blue">
              <text class="grid-icon">🏢</text>
            </view>
            <text class="grid-label">站点开通配置</text>
          </view>

          <!-- 4. 官方通知公告发布 (物业/业委会/社区) -->
          <view class="admin-grid-item" @click="onOpenPublishNotice">
            <view class="grid-icon-box bg-amber">
              <text class="grid-icon">📢</text>
            </view>
            <text class="grid-label">发布官方通告</text>
          </view>
        </view>
      </view>

      <!-- 微信授权与身份绑定 -->
      <view class="menu-group">
        <text class="group-title">微信授权与身份绑定</text>

        <view class="menu-item">
          <view class="menu-left">
            <text class="menu-icon">👤</text>
            <text class="menu-label">快捷微信头像与昵称</text>
          </view>
          <view class="menu-right">
            <text v-if="communityState.isLoggedIn" class="bound-phone-text">点击上方头像/昵称即刻授权</text>
            <text v-else class="menu-sub-tip">未登录</text>
            <text class="arrow">›</text>
          </view>
        </view>

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

        <view class="menu-item" @click="onCallGetUserProfile">
          <view class="menu-left">
            <text class="menu-icon">🌐</text>
            <text class="menu-label">微信 getUserProfile 地区</text>
          </view>
          <view class="menu-right">
            <text v-if="communityState.isLoggedIn" class="bound-phone-text">{{ communityState.currentUser.city || '点击同步' }}</text>
            <text v-else class="menu-sub-tip">未登录</text>
            <text class="arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 社区服务与档案 -->
      <view class="menu-group">
        <view class="group-header-row">
          <text class="group-title">社区服务与档案</text>
          <text class="paid-feature-tag">业主专属</text>
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

      <!-- 账号管理 -->
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
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useCommunityStore, state as communityState } from '@/store/community'
import { apiGetUserStats, apiGetPendingReports, apiResolveReport } from '@/utils/api'

const communityStore = useCommunityStore()
const statusBarHeight = ref(44)
const inputNickname = ref('')
const pendingReportCount = ref(0)

const stats = ref({
  postCount: 0,
  replyCount: 0
})

// 计算是否为具备管理工作台的角色
const isAdminRole = computed(() => {
  const code = communityState.currentUser.roleCode
  return code === 'COMMUNITY_ADMIN' || code === 'COMMITTEE_ADMIN' || code === 'PROPERTY_STAFF'
})

const isCommunityAdmin = computed(() => {
  return communityState.currentUser.roleCode === 'COMMUNITY_ADMIN'
})

const getScopeText = computed(() => {
  const code = communityState.currentUser.roleCode
  if (code === 'COMMUNITY_ADMIN') return '🌐 辖区多站点全局管辖'
  if (code === 'COMMITTEE_ADMIN') return '🏛️ 金翠园小区业委会专属'
  if (code === 'PROPERTY_STAFF') return '🏢 金翠物业服务中心专属'
  return '🏠 单站点专属'
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

// 调阅待处理举报工单
const fetchPendingReports = async () => {
  if (isAdminRole.value) {
    const siteId = isCommunityAdmin.value ? 'ALL' : communityStore.currentCommunity.id
    const reports = await apiGetPendingReports(siteId)
    if (reports) {
      pendingReportCount.value = reports.length
    }
  }
}

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync()
  if (sysInfo.statusBarHeight) {
    statusBarHeight.value = sysInfo.statusBarHeight
  }
  inputNickname.value = communityStore.currentUser.nickname || '微信用户'
  fetchUserStats()
  fetchPendingReports()
})

onShow(() => {
  fetchUserStats()
  fetchPendingReports()
})

// 🎭 演示一键切换 5 大角色弹窗
const onTriggerSwitchRole = () => {
  if (!communityState.isLoggedIn) {
    onTriggerLogin()
    return
  }

  const roleList = [
    { code: 'COMMUNITY_ADMIN', name: '🛡️ 社区行政管理者 (跨小区通管)' },
    { code: 'COMMITTEE_ADMIN', name: '🏛️ 业委会代表 (本小区公示监督)' },
    { code: 'PROPERTY_STAFF', name: '🏢 物业服务管家 (本小区工单审核)' },
    { code: 'MERCHANT', name: '🏪 周边便民商户 (优惠优惠发布)' },
    { code: 'OWNER', name: '🏠 认证业主 (5栋302 居民)' }
  ]

  uni.showActionSheet({
    itemList: roleList.map(r => r.name),
    success: async (res) => {
      const targetRole = roleList[res.tapIndex]
      uni.showLoading({ title: '切换角色中...' })
      const ok = await communityStore.switchUserRole(targetRole.code)
      uni.hideLoading()
      if (ok) {
        uni.showToast({ title: `角色已切换为: ${targetRole.name.split(' ')[0]}`, icon: 'none' })
        fetchPendingReports()
      }
    }
  })
}

// ⚙️ 处分违规举报工单
const onOpenReportManage = async () => {
  const siteId = isCommunityAdmin.value ? 'ALL' : communityStore.currentCommunity.id
  uni.showLoading({ title: '加载举报工单...' })
  const reports = await apiGetPendingReports(siteId)
  uni.hideLoading()

  if (!reports || reports.length === 0) {
    uni.showModal({
      title: '🚨 违规举报管理',
      content: '当前小区暂无待处理的违规举报工单，社区风控环境良好！',
      showCancel: false
    })
    return
  }

  const items = reports.map(r => `帖子ID:${r.postId || '未知'} [原因:${r.reason}]`)
  uni.showActionSheet({
    itemList: items,
    success: (res) => {
      const selectedReport = reports[res.tapIndex]
      uni.showModal({
        title: '🛡️ 违规处分下架判定',
        content: `举报原因：${selectedReport.reason}\n被举报帖子ID：${selectedReport.postId}\n判定结果：确认违规并一键从数据库撤销删除？`,
        confirmColor: '#DC2626',
        success: async (mRes) => {
          if (mRes.confirm) {
            uni.showLoading({ title: '处分下架中...' })
            await apiResolveReport(selectedReport.id, 'DELETE_POST')
            uni.hideLoading()
            uni.showToast({ title: '该违规帖子已从全网下架！', icon: 'success' })
            fetchPendingReports()
          }
        }
      })
    }
  })
}

// 🏡 房产认证审核
const onOpenHouseAudit = () => {
  uni.showModal({
    title: '🏡 业主房产认证审核',
    content: '待审核申请：\n1. 张三 (5栋 302) 提交不动产产证截图\n2. 李四 (2栋 101) 提交租房合同\n\n判定：已帮您一键全量审核通过并赋予【业主认证】标识！',
    confirmText: '一键全通过',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '房产认证审核通过！', icon: 'success' })
      }
    }
  })
}

// 🏢 站点开通配置 (仅行政社区管理者)
const onOpenSiteManage = () => {
  uni.showActionSheet({
    itemList: ['➕ 一键开通新小区站点 (自动生成 site_id)', '⚙️ 配置社区管辖地图', '🔑 重新生成物业/业委会授权码'],
    success: (res) => {
      if (res.tapIndex === 0) {
        uni.showModal({
          title: '🏢 开通新小区站点',
          content: '请输入新小区名称：【紫竹园小区】\n系统已分配全新站点ID：site_comm_004\n对应街道社区：翠竹街道行政社区',
          showCancel: false
        })
      } else {
        uni.showToast({ title: '配置已更新', icon: 'none' })
      }
    }
  })
}

// 📢 发布官方通告
const onOpenPublishNotice = () => {
  const roleCode = communityState.currentUser.roleCode
  let noticeType = '物业通知'
  if (roleCode === 'COMMUNITY_ADMIN') noticeType = '街道政务公告'
  if (roleCode === 'COMMITTEE_ADMIN') noticeType = '业委会收益公示'

  uni.showModal({
    title: `📢 发布【${noticeType}】`,
    content: `将以【${communityState.currentUser.roleTag}】身份向本小区全体住户推送官方通告？`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '官方通告已全小区推送！', icon: 'success' })
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

// 微信原生回调
const onChooseWxAvatar = (e) => {
  if (e.detail && e.detail.avatarUrl) {
    communityStore.syncWxProfile(null, e.detail.avatarUrl)
    uni.showToast({ title: '微信头像授权成功！', icon: 'success' })
  }
}

const onNicknameBlur = (e) => {
  const val = e.detail.value || inputNickname.value
  if (val && val !== communityStore.currentUser.nickname) {
    communityStore.syncWxProfile(val, null)
  }
}

const onNicknameChange = (e) => {
  if (e.detail.value) communityStore.syncWxProfile(e.detail.value, null)
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

const onAvatarClick = () => { if (!communityState.isLoggedIn) onTriggerLogin() }
const onTriggerLogin = () => { communityStore.openLoginModal(); uni.switchTab({ url: '/pages/index/index' }) }
const onResetLogin = () => { communityStore.clearLoginState(); stats.value = { postCount: 0, replyCount: 0 } }

const onSwitchProperty = () => {
  if (!communityState.isLoggedIn) { onTriggerLogin(); return }
  uni.showActionSheet({
    itemList: communityStore.myCommunities.map(c => c.name + ' (' + c.id + ')'),
    success: (res) => {
      communityStore.switchCommunity(communityStore.myCommunities[res.tapIndex])
      fetchUserStats()
      fetchPendingReports()
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

const onNavToProperty = () => {
  if (!communityState.isLoggedIn) { onTriggerLogin(); return }
  uni.showModal({
    title: '🏢 我的房产认证',
    content: `当前绑定：${communityStore.currentCommunity.name} ${communityStore.currentUser.building} ${communityStore.currentUser.room}\n身份状态：🛡️ 业主已认证`,
    showCancel: false
  })
}

const onNavToNotice = () => {
  if (!communityState.isLoggedIn) { onTriggerLogin(); return }
  uni.showModal({
    title: '🔔 消息通知中心',
    content: '1. 张先生 回复了您的【邻里求助】帖子\n2. 社区服务中心成立通知',
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
  font-size: 18px;
  font-weight: 800;
  color: #FFFFFF;
  width: 130px;
  height: 28px;
  background: rgba(255, 255, 255, 0.15);
  padding: 0 8px;
  border-radius: 6px;
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

.guest-name {
  font-size: 20px;
  font-weight: 800;
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
  padding: 12px 10px;
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
  font-size: 17px;
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

/* ⚙️ 社区管理工作台 */
.admin-console-card {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 14px;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.08);
  border: 1px solid #A7F3D0;
}

.console-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.console-title-box {
  display: flex;
  align-items: center;
  gap: 6px;
}

.console-icon {
  font-size: 18px;
}

.console-title {
  font-size: 15px;
  font-weight: 800;
  color: #065F46;
}

.console-scope-tag {
  font-size: 11px;
  color: #059669;
  background: #ECFDF5;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 700;
}

.admin-grid {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.admin-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.grid-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.bg-red { background: #FEE2E2; }
.bg-emerald { background: #D1FAE5; }
.bg-blue { background: #DBEAFE; }
.bg-amber { background: #FEF3C7; }

.grid-icon {
  font-size: 20px;
}

.badge-dot {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #DC2626;
  color: #FFF;
  font-size: 10px;
  font-weight: 800;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-label {
  font-size: 12px;
  font-weight: 700;
  color: #374151;
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
.unread-badge { font-size: 11px; font-weight: 700; color: #EF4444; background: #FEE2E2; padding: 2px 8px; border-radius: 10px; }
.arrow { font-size: 16px; color: #9CA3AF; }
.bottom-space { height: 80px; }
</style>
