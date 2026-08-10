<template>
  <view class="home-container">
    <!-- 1. 自定义顶部 Header 栏 -->
    <view class="custom-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-content">
        <image class="user-avatar" :src="communityState.currentUser.avatar" mode="aspectFill" />
        <view class="community-selector">
          <text class="location-icon">🏡</text>
          <text class="community-name">这儿有邻</text>
        </view>
      </view>
    </view>

    <!-- 2. 温暖风格公告/问候 Banner 卡片 -->
    <view class="banner-card">
      <view class="banner-text-box">
        <text class="banner-title">欢迎使用 这儿有邻</text>
        <text class="banner-sub">今天也有温暖的邻里故事</text>
      </view>

      <!-- 公告广播小条 -->
      <view class="banner-notice-strip" @click="onViewNotice">
        <text class="badge-tag">📢 公告</text>
        <text class="notice-text">社区纯粹交流平台服务公约与使用须知...</text>
        <text class="arrow">›</text>
      </view>
    </view>

    <!-- 3. 分类 Tab 栏与极简筛选器 -->
    <view class="tab-filter-bar">
      <view class="tabs">
        <view
          v-for="(tab, index) in tabs"
          :key="index"
          class="tab-item"
          :class="{ active: currentTab === index }"
          @click="onTabSelect(index)"
        >
          <text class="tab-text">{{ tab }}</text>
          <view v-if="currentTab === index" class="active-line"></view>
        </view>
      </view>

      <!-- 右侧筛选按钮 -->
      <view class="filter-btn" :class="{ 'has-filter': selectedCategory !== 'ALL' }" @click="openFilterDrawer">
        <text class="filter-icon">⇌</text>
      </view>
    </view>

    <!-- 4. 放置在 Tab 栏正下方的列表刷新指示条 (动态显示最新刷新时间) -->
    <view class="tab-bottom-refresh-bar" @click="manualRefresh">
      <view class="refresh-left">
        <text class="refresh-dot"></text>
        <text class="refresh-title">最新动态列表</text>
      </view>

      <view class="refresh-right">
        <text class="refresh-time-text">{{ isRefreshing ? '正在拉取最新数据...' : (lastRefreshTimeText + ' 刷新') }}</text>
        <text class="refresh-spin-icon" :class="{ spinning: isRefreshing }">↺</text>
      </view>
    </view>

    <!-- 5. 邻里圈沉浸式 Feed 帖子列表 -->
    <view class="feed-list">
      <block v-if="posts.length > 0">
        <PostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
          @click="onPostDetail(post.id)"
        />
      </block>
      <view v-else class="empty-state">
        <text class="empty-icon">🍃</text>
        <text class="empty-text">暂无动态，点击上方 ↺ 刷新试试吧~</text>
      </view>
    </view>

    <!-- 6. 右下角悬浮发帖大按钮 (FAB) -->
    <view class="fab-post-btn" @click="onPublishClick">
      <text class="plus-icon">+</text>
    </view>

    <!-- 7. 微信授权登录 Modal 遮罩层 -->
    <view class="wx-login-mask" :class="{ show: communityState.showLoginModal }">
      <view class="wx-login-card">
        <view class="login-header">
          <text class="app-icon">🏡</text>
          <text class="app-title">欢迎使用 这儿有邻</text>
        </view>
        <text class="login-sub">邻里纯粹交流与互助平台</text>
        <text class="login-desc">微信授权登录后可解锁发帖互动、社区服务与专属门牌身份。</text>

        <button class="wx-login-btn" @click="handleWxLogin">
          <text class="wx-icon">💬</text>
          <text class="btn-text">微信一键快捷登录</text>
        </button>

        <text class="guest-btn" @click="handleGuestLook">👀 暂不登录，以游客身份先逛逛</text>
      </view>
    </view>

    <!-- 8. 右侧平滑动画抽屉筛选弹窗 -->
    <view class="drawer-mask" :class="{ show: showDrawer }" @click="closeFilterDrawer"></view>
    <view class="drawer-panel" :class="{ show: showDrawer }">
      <view class="drawer-header">
        <text class="drawer-title">板块筛选</text>
        <text class="close-btn" @click="closeFilterDrawer">✕</text>
      </view>

      <scroll-view scroll-y class="drawer-body">
        <view class="filter-group">
          <text class="group-title">选择社区板块</text>
          <view class="chip-grid">
            <view
              v-for="cat in categoryOptions"
              :key="cat.value"
              class="chip-item"
              :class="{ active: selectedCategory === cat.value }"
              @click="onSelectCategory(cat.value)"
            >
              <text class="chip-text">{{ cat.label }}</text>
            </view>
          </view>
        </view>
      </scroll-view>

      <view class="drawer-footer">
        <button class="reset-btn" @click="onResetFilter">重置</button>
        <button class="confirm-btn" @click="onApplyFilter">确认筛选</button>
      </view>
    </view>

  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { useCommunityStore, state as communityState } from '@/store/community'
import { apiGetPostList } from '@/utils/api'
import PostCard from '@/components/PostCard.vue'

const communityStore = useCommunityStore()
const statusBarHeight = ref(44)

const tabs = ref(['推荐', '邻里圈', '同城'])
const currentTab = ref(0)

const showDrawer = ref(false)
const selectedCategory = ref('ALL')
const isRefreshing = ref(false)
const lastRefreshTimeText = ref('')

const getNowTimeStr = () => {
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

const categoryOptions = ref([
  { label: '全部板块', value: 'ALL' },
  { label: '邻里求助', value: 'HELP' },
  { label: '闲置面交', value: 'IDLE' },
  { label: '房屋出租', value: 'RENT' },
  { label: '社区活动', value: 'EVENT' },
  { label: '吐槽建议', value: 'SUGGEST' },
  { label: '业委会公示', value: 'COMMITTEE' }
])

const posts = ref([])

const fetchPostList = async (showToast = false) => {
  isRefreshing.value = true
  try {
    const data = await apiGetPostList(selectedCategory.value)
    if (data) {
      posts.value = data
    }
    lastRefreshTimeText.value = getNowTimeStr()
    if (showToast) {
      uni.showToast({ title: '列表数据已刷新', icon: 'success' })
    }
  } catch (e) {
    console.log('读取后端动态失败', e)
  } finally {
    isRefreshing.value = false
    uni.stopPullDownRefresh()
  }
}

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync()
  if (sysInfo.statusBarHeight) {
    statusBarHeight.value = sysInfo.statusBarHeight
  }
  lastRefreshTimeText.value = getNowTimeStr()
  fetchPostList()
})

onShow(() => {
  fetchPostList()
})

onPullDownRefresh(() => {
  fetchPostList(true)
})

const manualRefresh = () => {
  fetchPostList(true)
}

// 微信登录点击
const handleWxLogin = async () => {
  uni.showLoading({ title: '正在安全登录...' })
  try {
    await communityStore.performWxLogin()
  } catch (e) {
    console.log(e)
  } finally {
    uni.hideLoading()
    communityState.isLoggedIn = true
    communityState.showLoginModal = false
    uni.setStorageSync('hasLoggedIn', true)
    uni.showToast({ title: '微信登录成功！', icon: 'success' })
  }
}

// 点击暂不登录，进入游客模式
const handleGuestLook = () => {
  communityStore.enterGuestMode()
}

const openFilterDrawer = () => { showDrawer.value = true }
const closeFilterDrawer = () => { showDrawer.value = false }

const onSelectCategory = (val) => {
  selectedCategory.value = val
}

const onResetFilter = () => {
  selectedCategory.value = 'ALL'
  fetchPostList(true)
}

const onApplyFilter = () => {
  showDrawer.value = false
  fetchPostList(true)
}

const onTabSelect = (index) => {
  currentTab.value = index
}

const onViewNotice = () => {
  uni.showModal({
    title: '📢 社区纯粹交流平台使用须知',
    content: '欢迎使用【这儿有邻】！为更好地服务广大用户，请遵守法律法规与邻里公约，共建温馨和谐交流空间。',
    showCancel: false
  })
}

// 发帖强鉴权
const onPublishClick = () => {
  if (!communityState.isLoggedIn) {
    uni.showModal({
      title: '🔒 登录提醒',
      content: '发布邻里交流动态需要先完成微信登录授权，是否立即登录？',
      confirmText: '去微信登录',
      cancelText: '再逛逛',
      success: (res) => {
        if (res.confirm) {
          communityState.showLoginModal = true
        }
      }
    })
    return
  }
  uni.navigateTo({
    url: '/pages/publish/publish'
  })
}

const onPostDetail = (id) => {
  uni.navigateTo({
    url: '/pages/detail/detail?id=' + id
  })
}
</script>

<style scoped>
.home-container {
  padding: 0 16px 80px 16px;
  background-color: #F0F7F4;
  min-height: 100vh;
  box-sizing: border-box;
  position: relative;
}

.custom-header {
  padding-bottom: 12px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 44px;
}

.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
}

.community-selector {
  display: flex;
  align-items: center;
  gap: 6px;
}

.location-icon {
  font-size: 18px;
  color: #10B981;
}

.community-name {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
}

.banner-card {
  background: linear-gradient(180deg, #FEF9E7 0%, #EBF6ED 100%);
  border-radius: 20px;
  padding: 20px 16px 14px 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.05);
}

.banner-title {
  font-size: 20px;
  font-weight: 800;
  color: #1B4D3E;
  display: block;
  margin-bottom: 4px;
}

.banner-sub {
  font-size: 12px;
  color: #5C7F73;
  display: block;
}

.banner-notice-strip {
  margin-top: 14px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 10px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.badge-tag {
  font-size: 10px;
  font-weight: 700;
  color: #D97706;
  background: #FEF3C7;
  padding: 2px 6px;
  border-radius: 4px;
}

.notice-text {
  font-size: 12px;
  color: #374151;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.tabs {
  display: flex;
  align-items: center;
  gap: 24px;
}

.tab-item {
  position: relative;
  padding-bottom: 6px;
}

.tab-text {
  font-size: 16px;
  color: #6B7280;
  font-weight: 500;
}

.tab-item.active .tab-text {
  color: #059669;
  font-size: 18px;
  font-weight: 800;
}

.active-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: #059669;
  border-radius: 2px;
}

.filter-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 50%;
  background-color: #E6F4EA;
}

.filter-btn.has-filter::after {
  content: '';
  position: absolute;
  top: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  background-color: #EF4444;
  border-radius: 50%;
}

.filter-icon {
  font-size: 18px;
  color: #059669;
  font-weight: 700;
}

.tab-bottom-refresh-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #E6F4EA;
  border-radius: 12px;
  padding: 8px 12px;
  margin-bottom: 12px;
  cursor: pointer;
}

.refresh-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.refresh-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10B981;
}

.refresh-title {
  font-size: 12px;
  font-weight: 700;
  color: #065F46;
}

.refresh-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.refresh-time-text {
  font-size: 11px;
  color: #059669;
  font-weight: 500;
}

.refresh-spin-icon {
  font-size: 16px;
  font-weight: 800;
  color: #059669;
}

.spinning {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 8px;
}

.empty-icon {
  font-size: 40px;
}

.empty-text {
  font-size: 13px;
  color: #9CA3AF;
}

.fab-post-btn {
  position: fixed;
  right: 20px;
  bottom: 80px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 24px rgba(16, 185, 129, 0.4);
  z-index: 99;
}

.plus-icon {
  font-size: 32px;
  color: #FFFFFF;
  font-weight: 300;
  line-height: 1;
  margin-top: -2px;
}

.wx-login-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.wx-login-mask.show {
  opacity: 1;
  pointer-events: auto;
}

.wx-login-card {
  width: 100%;
  background: #FFFFFF;
  border-radius: 24px;
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
}

.login-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.app-icon {
  font-size: 26px;
}

.app-title {
  font-size: 20px;
  font-weight: 800;
  color: #111827;
}

.login-sub {
  font-size: 13px;
  color: #059669;
  font-weight: 700;
  margin-bottom: 14px;
}

.login-desc {
  font-size: 13px;
  color: #4B5563;
  line-height: 1.6;
  text-align: center;
  margin-bottom: 20px;
  background: #F9FAFB;
  padding: 14px;
  border-radius: 14px;
}

.wx-login-btn {
  width: 100%;
  height: 48px;
  border-radius: 24px;
  background: linear-gradient(135deg, #07C160 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 8px 20px rgba(7, 193, 96, 0.4);
  border: none;
  margin-bottom: 12px;
}

.wx-icon {
  font-size: 20px;
  color: #FFFFFF;
}

.btn-text {
  font-size: 16px;
  font-weight: 800;
  color: #FFFFFF;
}

.guest-btn {
  font-size: 13px;
  color: #6B7280;
  padding: 6px 12px;
  font-weight: 600;
}

.drawer-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.drawer-mask.show {
  opacity: 1;
  pointer-events: auto;
}

.drawer-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 75%;
  background: #FFFFFF;
  z-index: 1000;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  border-radius: 20px 0 0 20px;
}

.drawer-panel.show {
  transform: translateX(0);
}

.drawer-header {
  padding: 44px 20px 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #F3F4F6;
}

.drawer-title {
  font-size: 16px;
  font-weight: 800;
  color: #111827;
}

.close-btn {
  font-size: 18px;
  color: #9CA3AF;
  padding: 4px;
}

.drawer-body {
  flex: 1;
  padding: 20px;
}

.filter-group {
  margin-bottom: 24px;
}

.group-title {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 12px;
  display: block;
}

.chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip-item {
  padding: 8px 16px;
  border-radius: 20px;
  background: #F3F4F6;
  transition: all 0.2s ease;
}

.chip-item.active {
  background: #E6F4EA;
  border: 1px solid #10B981;
}

.chip-text {
  font-size: 12px;
  color: #4B5563;
  font-weight: 500;
}

.chip-item.active .chip-text {
  color: #059669;
  font-weight: 700;
}

.drawer-footer {
  padding: 16px 20px 30px 20px;
  display: flex;
  gap: 12px;
  border-top: 1px solid #F3F4F6;
}

.reset-btn {
  flex: 1;
  background: #F3F4F6;
  color: #4B5563;
  font-size: 14px;
  font-weight: 600;
  border-radius: 24px;
  border: none;
}

.confirm-btn {
  flex: 2;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 700;
  border-radius: 24px;
  border: none;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}
</style>
