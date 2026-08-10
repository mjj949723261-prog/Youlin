<template>
  <view class="publish-container">
    <!-- 1. 顶部 Navigation Bar -->
    <view class="publish-nav-bar">
      <view class="back-btn-box" @click="safeNavigateBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">发布动态</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 主体表单内容区 -->
    <scroll-view scroll-y class="publish-body">
      
      <!-- 2. 板块类别选择条目 (弹窗 Drawer) -->
      <view class="selector-card" @click="openCategoryPopup">
        <view class="selector-left">
          <text class="selector-label">发布板块</text>
          <text class="selected-value">{{ selectedCategoryLabel }}</text>
        </view>
        <text class="arrow-right">›</text>
      </view>

      <!-- 3. 文字内容输入区 -->
      <view class="input-card">
        <textarea
          v-model="contentText"
          class="content-textarea"
          placeholder="邻居，分享你发现的新鲜事，或者需要什么帮忙..."
          placeholder-style="color: #9CA3AF;"
          maxlength="500"
        ></textarea>
        <view class="word-count">
          <text>{{ contentText.length }}/500</text>
        </view>
      </view>

      <!-- 4. 媒体选择区 (9图或1视频互斥限制) -->
      <view class="media-card">
        <view class="media-header">
          <text class="media-title">添加图片/视频</text>
          <text class="media-tip">{{ mediaTipText }}</text>
        </view>

        <view class="media-grid">
          <!-- 已添加的媒体预览列表 -->
          <view
            v-for="(item, index) in mediaList"
            :key="index"
            class="media-item-box"
          >
            <!-- 图片预览 -->
            <image
              v-if="item.type === 'IMAGE'"
              class="media-preview"
              :src="item.path"
              mode="aspectFill"
              @click="previewImage(index)"
            />
            <!-- 视频预览 -->
            <video
              v-else-if="item.type === 'VIDEO'"
              class="media-preview"
              :src="item.path"
              controls
            />
            <!-- 删除小按钮 -->
            <text class="delete-badge" @click="removeMedia(index)">✕</text>
          </view>

          <!-- 90px 正方形高颜值图片上传入口 -->
          <view
            v-if="canAddImage"
            class="upload-btn-box"
            @click="onChooseImages"
          >
            <text class="upload-icon">📷</text>
            <text class="upload-text">图片 ({{ imageCount }}/9)</text>
          </view>

          <!-- 90px 正方形高颜值视频上传入口 -->
          <view
            v-if="canAddVideo"
            class="upload-btn-box video-box"
            @click="onChooseVideo"
          >
            <text class="upload-icon">🎥</text>
            <text class="upload-text">短视频 ({{ videoCount }}/1)</text>
          </view>
        </view>
      </view>

      <!-- 5. 悦邻里友好发帖公约 Card -->
      <view class="convention-card">
        <view class="convention-header">
          <text class="shield-icon">🛡️</text>
          <text class="convention-title">悦邻里 · 友好发帖公约</text>
        </view>
        <text class="convention-desc">
          本板块为云彩之城邻里真实交流空间。请遵守国家法律法规，拒绝广告营销骚扰、虚假信息及人身攻击，共同维护文明温馨的社区环境。
        </text>
      </view>

      <view class="bottom-spacer"></view>
    </scroll-view>

    <!-- 6. 底部固定发布提交按钮 -->
    <view class="bottom-fixed-bar">
      <button
        class="submit-btn"
        :disabled="!canSubmit || isSubmitting"
        :class="{ active: canSubmit && !isSubmitting }"
        @click="onSubmit"
      >
        <text v-if="isSubmitting">正在发布...</text>
        <text v-else>确认发布动态</text>
      </button>
    </view>

    <!-- 7. 板块选择 Drawer 弹窗 -->
    <view class="popup-mask" :class="{ show: showCategoryPopup }" @click="closeCategoryPopup"></view>
    <view class="popup-panel" :class="{ show: showCategoryPopup }">
      <view class="popup-header">
        <text class="popup-title">选择发布板块</text>
        <text class="popup-close" @click="closeCategoryPopup">✕</text>
      </view>

      <view class="popup-body">
        <view
          v-for="cat in categoryList"
          :key="cat.key"
          class="category-option-item"
          :class="{ active: selectedCategoryKey === cat.key }"
          @click="selectCategory(cat)"
        >
          <text class="cat-label">{{ cat.label }}</text>
          <text v-if="selectedCategoryKey === cat.key" class="check-icon">✓</text>
        </view>
      </view>
    </view>

  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCommunityStore } from '@/store/community'
import { chooseAndCompressImages, chooseAndCompressVideo } from '@/utils/media'
import { apiCreatePost } from '@/utils/api'

const communityStore = useCommunityStore()

const contentText = ref('')
const mediaList = ref([]) // { type: 'IMAGE'|'VIDEO', path: string }
const isSubmitting = ref(false)

const showCategoryPopup = ref(false)
const selectedCategoryKey = ref('HELP')
const selectedCategoryLabel = ref('邻里求助')

const categoryList = ref([
  { key: 'HELP', label: '邻里求助' },
  { key: 'IDLE', label: '闲置面交' },
  { key: 'RENT', label: '房屋出租' },
  { key: 'EVENT', label: '社区活动' },
  { key: 'SUGGEST', label: '吐槽建议' },
  { key: 'COMMITTEE', label: '业委会公示' }
])

const imageCount = computed(() => mediaList.value.filter(m => m.type === 'IMAGE').length)
const videoCount = computed(() => mediaList.value.filter(m => m.type === 'VIDEO').length)

const canAddImage = computed(() => videoCount.value === 0 && imageCount.value < 9)
const canAddVideo = computed(() => imageCount.value === 0 && videoCount.value === 0)

const mediaTipText = computed(() => {
  if (videoCount.value > 0) return '已添加视频 (不可混选图片)'
  if (imageCount.value > 0) return `已选 ${imageCount.value}/9 张图片 (不可混选视频)`
  return '支持选择 9 张图片或 1 个视频'
})

const canSubmit = computed(() => {
  return contentText.value.trim().length > 0 || mediaList.value.length > 0
})

const safeNavigateBack = () => {
  const pages = getCurrentPages()
  if (pages && pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({
      url: '/pages/index/index'
    })
  }
}

const openCategoryPopup = () => { showCategoryPopup.value = true }
const closeCategoryPopup = () => { showCategoryPopup.value = false }

const selectCategory = (cat) => {
  selectedCategoryKey.value = cat.key
  selectedCategoryLabel.value = cat.label
  showCategoryPopup.value = false
}

const onChooseImages = async () => {
  try {
    const remainCount = 9 - imageCount.value
    const paths = await chooseAndCompressImages({ count: remainCount, maxMB: 3.5 })
    if (paths && paths.length > 0) {
      paths.forEach(p => {
        mediaList.value.push({ type: 'IMAGE', path: p })
      })
    }
  } catch (e) {
    console.log('取消图片选择')
  }
}

const onChooseVideo = async () => {
  try {
    const path = await chooseAndCompressVideo({ isReply: false, maxMB: 20 })
    if (path) {
      mediaList.value.push({ type: 'VIDEO', path })
    }
  } catch (e) {
    console.log('取消视频选择')
  }
}

const removeMedia = (index) => {
  mediaList.value.splice(index, 1)
}

const previewImage = (index) => {
  const imagePaths = mediaList.value.filter(m => m.type === 'IMAGE').map(m => m.path)
  uni.previewImage({
    urls: imagePaths,
    current: index
  })
}

// 真正写入 Spring Boot 后端服务数据库
const onSubmit = async () => {
  if (!canSubmit.value || isSubmitting.value) return

  isSubmitting.value = true
  uni.showLoading({ title: '正在发布中...' })

  try {
    const videoItem = mediaList.value.find(m => m.type === 'VIDEO')
    const imagePaths = mediaList.value.filter(m => m.type === 'IMAGE').map(m => m.path)

    await apiCreatePost({
      authorName: communityStore.currentUser.nickname || '李先生',
      authorAvatar: communityStore.currentUser.avatar,
      building: (communityStore.currentUser.building || '5栋') + ' ' + (communityStore.currentUser.room || '302'),
      roleTag: communityStore.currentUser.roleTag || '本小区住户',
      roleType: 'RESIDENT',
      categoryKey: selectedCategoryKey.value,
      tagName: selectedCategoryLabel.value,
      tagType: selectedCategoryKey.value === 'HELP' ? 'URGENT' : 'NORMAL',
      content: contentText.value.trim(),
      images: imagePaths.join(','),
      videoUrl: videoItem ? videoItem.path : '',
      videoPoster: videoItem ? (videoItem.thumb || '') : '',
      communityId: communityStore.currentCommunity.id || 'comm_001'
    })

    uni.hideLoading()
    uni.showToast({ title: '动态发布成功！', icon: 'success' })

    setTimeout(() => {
      safeNavigateBack()
    }, 1000)

  } catch (e) {
    uni.hideLoading()
    isSubmitting.value = false
    console.log('发帖写入数据库失败', e)
  }
}
</script>

<style scoped>
.publish-container {
  height: 100vh;
  background-color: #F0F7F4;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.publish-nav-bar {
  padding: 44px 16px 12px 16px;
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #F1F5F9;
}

.back-btn-box {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 28px;
  color: #111827;
  font-weight: 300;
  margin-top: -2px;
}

.nav-title {
  font-size: 17px;
  font-weight: 800;
  color: #111827;
}

.nav-placeholder {
  width: 36px;
}

.publish-body {
  flex: 1;
  padding: 16px;
  box-sizing: border-box;
}

.selector-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.03);
}

.selector-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selector-label {
  font-size: 14px;
  font-weight: 700;
  color: #374151;
}

.selected-value {
  font-size: 14px;
  font-weight: 700;
  color: #059669;
  background: #ECFDF5;
  padding: 2px 10px;
  border-radius: 12px;
}

.arrow-right {
  font-size: 18px;
  color: #9CA3AF;
}

.input-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.03);
  position: relative;
}

.content-textarea {
  width: 100%;
  height: 140px;
  font-size: 15px;
  color: #111827;
  line-height: 1.6;
}

.word-count {
  text-align: right;
  font-size: 12px;
  color: #9CA3AF;
}

.media-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.03);
}

.media-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.media-title {
  font-size: 14px;
  font-weight: 700;
  color: #374151;
}

.media-tip {
  font-size: 11px;
  color: #9CA3AF;
}

.media-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.media-item-box {
  position: relative;
  width: 90px;
  height: 90px;
  border-radius: 12px;
  overflow: hidden;
}

.media-preview {
  width: 100%;
  height: 100%;
  border-radius: 12px;
}

.delete-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.6);
  color: #FFFFFF;
  border-radius: 50%;
  font-size: 11px;
  text-align: center;
  line-height: 20px;
}

.upload-btn-box {
  width: 90px;
  height: 90px;
  border-radius: 12px;
  background: #F9FAFB;
  border: 1px dashed #D1D5DB;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.upload-icon {
  font-size: 24px;
}

.upload-text {
  font-size: 10px;
  color: #6B7280;
}

.convention-card {
  background: #ECFDF5;
  border: 1px solid #A7F3D0;
  border-radius: 16px;
  padding: 14px;
  margin-bottom: 12px;
}

.convention-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.shield-icon {
  font-size: 14px;
}

.convention-title {
  font-size: 13px;
  font-weight: 800;
  color: #065F46;
}

.convention-desc {
  font-size: 12px;
  color: #047857;
  line-height: 1.5;
}

.bottom-spacer {
  height: 80px;
}

.bottom-fixed-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  padding: 12px 16px 28px 16px;
  border-top: 1px solid #F1F5F9;
  z-index: 100;
}

.submit-btn {
  height: 44px;
  line-height: 44px;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 700;
  color: #9CA3AF;
  background: #E5E7EB;
  border: none;
}

.submit-btn.active {
  color: #FFFFFF;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
}

.popup-mask {
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

.popup-mask.show {
  opacity: 1;
  pointer-events: auto;
}

.popup-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  border-radius: 24px 24px 0 0;
  z-index: 1000;
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  padding-bottom: 28px;
}

.popup-panel.show {
  transform: translateY(0);
}

.popup-header {
  padding: 18px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #F3F4F6;
}

.popup-title {
  font-size: 16px;
  font-weight: 800;
  color: #111827;
}

.popup-close {
  font-size: 18px;
  color: #9CA3AF;
}

.popup-body {
  padding: 10px 20px;
}

.category-option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #F9FAFB;
}

.cat-label {
  font-size: 15px;
  color: #374151;
  font-weight: 500;
}

.category-option-item.active .cat-label {
  color: #059669;
  font-weight: 800;
}

.check-icon {
  font-size: 16px;
  color: #059669;
  font-weight: 800;
}
</style>
