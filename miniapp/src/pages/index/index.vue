<template>
  <view class="home-container">
    <!-- 1. 自定义顶部 Header 栏 -->
    <view class="custom-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-content">
        <image class="user-avatar" :src="communityStore.currentUser.avatar" mode="aspectFill" />
        <view class="community-selector" @click="onSwitchCommunity">
          <text class="location-icon">📍</text>
          <text class="community-name">{{ communityStore.currentCommunity.name }}</text>
        </view>
      </view>
    </view>

    <!-- 2. 温暖风格公告/问候 Banner 卡片 -->
    <view class="banner-card">
      <view class="banner-text-box">
        <text class="banner-title">早上好，{{ communityStore.currentCommunity.name }}</text>
        <text class="banner-sub">今天也有温暖的邻里故事</text>
      </view>

      <!-- 公告实时广播小条 -->
      <view class="banner-notice-strip" @click="onViewNotice">
        <text class="badge-tag">📢 公告</text>
        <text class="notice-text">8月8日翠竹街道防汛隐患排查通知...</text>
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

    <!-- 4. 邻里圈沉浸式 Feed 帖子列表 -->
    <view class="feed-list">
      <block v-if="filteredPosts.length > 0">
        <PostCard
          v-for="post in filteredPosts"
          :key="post.id"
          :post="post"
          @click="onPostDetail(post.id)"
        />
      </block>
      <view v-else class="empty-state">
        <text class="empty-icon">🍃</text>
        <text class="empty-text">该板块下暂无帖子动态~</text>
      </view>
    </view>

    <!-- 5. 右下角高颜值悬浮发帖加号大按钮 (FAB) -->
    <view class="fab-post-btn" @click="onPublishClick">
      <text class="plus-icon">+</text>
    </view>

    <!-- 6. 右侧平滑动画抽屉筛选弹窗 (纯粹纯文字板块筛选) -->
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
              @click="selectedCategory = cat.value"
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
import { ref, computed, onMounted } from 'vue'
import { useCommunityStore } from '@/store/community'
import PostCard from '@/components/PostCard.vue'

const communityStore = useCommunityStore()
const statusBarHeight = ref(44)

// 顶部 Tab
const tabs = ref(['推荐', '邻里圈', '同城'])
const currentTab = ref(0)

// 抽屉与板块筛选状态
const showDrawer = ref(false)
const selectedCategory = ref('ALL')

// 纯粹纯文字板块选项
const categoryOptions = ref([
  { label: '全部板块', value: 'ALL' },
  { label: '邻里求助', value: 'HELP' },
  { label: '闲置面交', value: 'IDLE' },
  { label: '房屋出租', value: 'RENT' },
  { label: '社区活动', value: 'EVENT' },
  { label: '吐槽建议', value: 'SUGGEST' },
  { label: '业委会公示', value: 'COMMITTEE' }
])

// 预设帖子数据集
const allPosts = ref([
  {
    id: 'p1',
    authorName: '王阿姨',
    building: '3栋',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    roleTag: '本小区住户',
    roleType: 'RESIDENT',
    categoryKey: 'HELP',
    publishTime: '10分钟前',
    content: '谁家有电钻可以借用半小时？装个置物架~',
    singleImg: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=300',
    tagName: '邻里求助',
    tagType: 'NORMAL'
  },
  {
    id: 'p2',
    authorName: '小林',
    building: '8栋',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    roleTag: '本小区住户',
    roleType: 'RESIDENT',
    categoryKey: 'HELP',
    publishTime: '18分钟前',
    content: '寻找橘猫团团，昨晚在南门附近走失，特征是脖子上有蓝色项圈，有看到的邻居请联系我，必有重谢！希望大家能帮忙留意一下，非常感谢！',
    singleImg: '',
    tagName: '紧急求助',
    tagType: 'URGENT'
  },
  {
    id: 'p3',
    authorName: '陈阿姨',
    building: '5栋',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    roleTag: '5号楼业主',
    roleType: 'RESIDENT',
    categoryKey: 'RENT',
    publishTime: '40分钟前',
    content: '阳光花园 2期 3号楼精装两居室业主直租，免中介费！首次出租家电齐全，看房方便。',
    singleImg: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=300',
    tagName: '房屋出租',
    tagType: 'RENT'
  },
  {
    id: 'p4',
    authorName: '张先生',
    building: '5栋',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    roleTag: '本小区住户',
    roleType: 'RESIDENT',
    categoryKey: 'SUGGEST',
    publishTime: '1小时前',
    content: '今天天气真不错，在楼下看到这只可爱的小猫在晒太阳。',
    singleImg: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=300',
    tagName: '生活交流',
    tagType: 'NORMAL'
  }
])

const filteredPosts = computed(() => {
  return allPosts.value.filter(post => {
    return selectedCategory.value === 'ALL' || post.categoryKey === selectedCategory.value
  })
})

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync()
  if (sysInfo.statusBarHeight) {
    statusBarHeight.value = sysInfo.statusBarHeight
  }
})

// 抽屉控制
const openFilterDrawer = () => {
  showDrawer.value = true
}

const closeFilterDrawer = () => {
  showDrawer.value = false
}

const onResetFilter = () => {
  selectedCategory.value = 'ALL'
}

const onApplyFilter = () => {
  showDrawer.value = false
  uni.showToast({ title: '筛选已应用', icon: 'none' })
}

const onTabSelect = (index) => {
  currentTab.value = index
}

const onSwitchCommunity = () => {
  uni.showActionSheet({
    itemList: communityStore.myCommunities.map(c => c.name + ' (' + c.building + ')'),
    success: (res) => {
      communityStore.switchCommunity(communityStore.myCommunities[res.tapIndex])
    }
  })
}

const onViewNotice = () => {
  uni.showModal({
    title: '📢 翠竹街道社区防汛通告',
    content: '预计本周末有强降雨，请各位业主检查关好阳台窗户，清理阳台花盆，注意出行安全。',
    showCancel: false
  })
}

// 直接跳转到专属发布页面
const onPublishClick = () => {
  uni.navigateTo({
    url: '/pages/publish/publish'
  })
}

const onPostDetail = (id) => {
  console.log('查看帖子详情', id)
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
  margin-bottom: 14px;
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

/* 5. 高颜值悬浮加号发帖大按钮 (FAB) */
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

/* 6. 右侧滑出抽屉平滑动画 */
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
