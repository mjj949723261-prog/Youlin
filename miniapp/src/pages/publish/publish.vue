<template>
  <view class="publish-container">
    <!-- 1. 自定义顶部导航栏 (左上角返回按钮) -->
    <view class="nav-bar">
      <view class="back-btn-box" @click="onBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="page-title">发布动态</text>
      <view class="nav-placeholder"></view>
    </view>

    <scroll-view scroll-y class="publish-body">
      
      <!-- 2. 高颜值“板块选择与回显栏” -->
      <view class="section-box category-select-bar" @click="openCategoryPopup">
        <view class="bar-left">
          <text class="bar-icon">📌</text>
          <text class="bar-label">发布板块</text>
          <text class="required">*</text>
        </view>
        <view class="bar-right">
          <text v-if="selectedCategoryObj" class="selected-val">
            {{ selectedCategoryObj.icon }} {{ selectedCategoryObj.label }}
          </text>
          <text v-else class="placeholder-val">请选择板块</text>
          <text class="arrow">›</text>
        </view>
      </view>

      <!-- 3. 文字内容输入区 -->
      <view class="section-box">
        <textarea
          v-model="content"
          class="content-input"
          placeholder="分享你身边的邻里故事、求助事项、闲置物品或吐槽建议..."
          maxlength="500"
        />
        <text class="char-count">{{ content.length }}/500</text>
      </view>

      <!-- 4. 媒体选择区 (图片 9 张 / 视频 1 个，严格互斥) -->
      <view class="section-box">
        <view class="media-title-row">
          <text class="section-title">添加图片/视频</text>
          <text v-if="mediaType === 'IMAGE'" class="media-hint">已选图片 {{ images.length }}/9 张</text>
          <text v-else-if="mediaType === 'VIDEO'" class="media-hint">已选视频 1/1 个</text>
          <text v-else class="media-hint">图片或视频二选一</text>
        </view>

        <!-- 已选图片九宫格 -->
        <view v-if="mediaType === 'IMAGE' || mediaType === 'NONE'" class="media-grid">
          <view v-for="(img, index) in images" :key="index" class="media-item">
            <image class="preview-img" :src="img" mode="aspectFill" @click="previewImage(index)" />
            <view class="delete-badge" @click.stop="removeImage(index)">✕</view>
          </view>

          <!-- 添加图片按钮 -->
          <view
            v-if="images.length < 9 && mediaType !== 'VIDEO'"
            class="upload-btn"
            @click="chooseImages"
          >
            <text class="upload-icon">📷</text>
            <text class="upload-label">图片({{ images.length }}/9)</text>
          </view>
        </view>

        <!-- 已选视频预览区域 -->
        <view v-if="mediaType === 'VIDEO'" class="video-preview-box">
          <video class="preview-video" :src="videoUrl" controls />
          <view class="delete-video-btn" @click="removeVideo">删除视频重新选择</view>
        </view>

        <!-- 添加视频按钮 -->
        <view
          v-if="mediaType === 'NONE'"
          class="upload-video-entry"
          @click="chooseVideo"
        >
          <text class="upload-icon">🎥</text>
          <text class="upload-label">添加视频 (最多1个，与图片互斥)</text>
        </view>
      </view>

      <!-- 5. 邻里友善发帖公约温馨提示 -->
      <view class="convention-card">
        <view class="convention-title">
          <text class="heart-icon">💚</text>
          <text class="title-text">悦邻里 · 友好发帖公约</text>
        </view>
        <text class="convention-desc">
          请文明理性沟通，严禁发布虚假信息、广告垃圾、侵权或人身攻击内容，让我们共同营造温暖、真实、互助的小区氛围。
        </text>
      </view>

      <view class="bottom-padding"></view>
    </scroll-view>

    <!-- 6. 最下方固定大粒度发布按钮 -->
    <view class="fixed-footer">
      <button
        class="bottom-submit-btn"
        :disabled="!canSubmit"
        :class="{ active: canSubmit }"
        @click="onSubmit"
      >
        确认发布
      </button>
    </view>

    <!-- 7. 符合 UI 视觉的半屏平滑板块选择弹窗 -->
    <view class="popup-mask" :class="{ show: showPopup }" @click="closeCategoryPopup"></view>
    <view class="popup-panel" :class="{ show: showPopup }">
      <view class="popup-header">
        <text class="popup-title">选择发布板块</text>
        <view class="close-btn-box" @click="closeCategoryPopup">
          <text class="close-icon">✕</text>
        </view>
      </view>

      <scroll-view scroll-y class="popup-scroll-body">
        <view class="popup-options-list">
          <view
            v-for="cat in categories"
            :key="cat.value"
            class="cat-option-card"
            :class="{ active: selectedCategory === cat.value }"
            @click="selectCategory(cat)"
          >
            <view class="option-left">
              <text class="cat-icon">{{ cat.icon }}</text>
              <view class="cat-info">
                <text class="cat-name">{{ cat.label }}</text>
                <text class="cat-desc">{{ cat.desc }}</text>
              </view>
            </view>
            <view v-if="selectedCategory === cat.value" class="check-circle">
              <text class="check-mark">✓</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const content = ref('')
const selectedCategory = ref('HELP')
const showPopup = ref(false)
const mediaType = ref('NONE')
const images = ref([])
const videoUrl = ref('')

const categories = [
  { icon: '🤝', label: '邻里求助', value: 'HELP', desc: '借用工具、急用药品、代遛狗喂猫等' },
  { icon: '♻️', label: '闲置面交', value: 'IDLE', desc: '同小区物品面交转让、免费赠送' },
  { icon: '🏠', label: '房屋出租', value: 'RENT', desc: '小区房源直租、找合租室友（免中介费）' },
  { icon: '⚽', label: '社区活动', value: 'EVENT', desc: '约跑打球、亲子活动、户外组团' },
  { icon: '💬', label: '吐槽建议', value: 'SUGGEST', desc: '小区公区吐槽、给物业/业委会意见' }
]

const selectedCategoryObj = computed(() => {
  return categories.find(c => c.value === selectedCategory.value)
})

const canSubmit = computed(() => {
  return content.value.trim().length > 0 && selectedCategory.value !== ''
})

const openCategoryPopup = () => {
  showPopup.value = true
}

const closeCategoryPopup = () => {
  showPopup.value = false
}

const selectCategory = (cat) => {
  selectedCategory.value = cat.value
  showPopup.value = false
}

const chooseImages = () => {
  const maxCount = 9 - images.value.length
  uni.chooseImage({
    count: maxCount,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      images.value = [...images.value, ...res.tempFilePaths]
      mediaType.value = 'IMAGE'
    }
  })
}

const removeImage = (index) => {
  images.value.splice(index, 1)
  if (images.value.length === 0) {
    mediaType.value = 'NONE'
  }
}

const previewImage = (index) => {
  uni.previewImage({
    urls: images.value,
    current: index
  })
}

const chooseVideo = () => {
  uni.chooseVideo({
    sourceType: ['album', 'camera'],
    maxDuration: 60,
    camera: 'back',
    success: (res) => {
      videoUrl.value = res.tempFilePath
      mediaType.value = 'VIDEO'
    }
  })
}

const removeVideo = () => {
  videoUrl.value = ''
  mediaType.value = 'NONE'
}

// 🛡️ 安全返回处理 (自动防御 navigateBack:fail cannot navigate back at first page 报错)
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

const onBack = () => {
  if (content.value.length > 0 || images.value.length > 0 || videoUrl.value !== '') {
    uni.showModal({
      title: '提示',
      content: '退出后编辑的内容将不保留，是否确认离开？',
      success: (res) => {
        if (res.confirm) {
          safeNavigateBack()
        }
      }
    })
  } else {
    safeNavigateBack()
  }
}

const onSubmit = () => {
  if (!canSubmit.value) return

  uni.showLoading({ title: '正在发布...' })
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({ title: '发布成功！', icon: 'success' })
    setTimeout(() => {
      safeNavigateBack()
    }, 1200)
  }, 800)
}
</script>

<style scoped>
.publish-container {
  height: 100vh;
  background-color: #F0F7F4;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  position: relative;
}

/* 1. 顶部导航栏 */
.nav-bar {
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

.page-title {
  font-size: 17px;
  font-weight: 800;
  color: #111827;
}

.nav-placeholder {
  width: 36px;
}

/* 2. 主体可滚动区 */
.publish-body {
  flex: 1;
  padding: 16px;
  box-sizing: border-box;
}

.section-box {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 14px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.03);
  box-sizing: border-box;
}

.category-select-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border: 1px solid #F3F4F6;
}

.bar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bar-icon {
  font-size: 16px;
}

.bar-label {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.required {
  color: #EF4444;
  font-size: 14px;
}

.bar-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.selected-val {
  font-size: 13px;
  font-weight: 700;
  color: #059669;
  background: #ECFDF5;
  border: 1px solid #A7F3D0;
  padding: 4px 12px;
  border-radius: 16px;
}

.placeholder-val {
  font-size: 14px;
  color: #9CA3AF;
}

.arrow {
  font-size: 18px;
  color: #9CA3AF;
}

.content-input {
  width: 100%;
  height: 120px;
  font-size: 14px;
  line-height: 1.6;
  color: #111827;
  box-sizing: border-box;
}

.char-count {
  font-size: 11px;
  color: #9CA3AF;
  text-align: right;
  display: block;
  margin-top: 4px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #374151;
}

.media-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.media-hint {
  font-size: 12px;
  color: #9CA3AF;
}

.media-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.media-item {
  position: relative;
  width: 90px;
  height: 90px;
  flex-shrink: 0;
}

.preview-img {
  width: 100%;
  height: 100%;
  border-radius: 12px;
}

.delete-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 22px;
  height: 22px;
  background: #EF4444;
  color: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  z-index: 10;
}

.upload-btn {
  width: 90px;
  height: 90px;
  border-radius: 12px;
  border: 2px dashed #D1D5DB;
  background: #F9FAFB;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-shrink: 0;
}

.upload-icon {
  font-size: 24px;
}

.upload-label {
  font-size: 11px;
  color: #6B7280;
}

.upload-video-entry {
  margin-top: 10px;
  padding: 14px;
  border-radius: 12px;
  border: 2px dashed #D1D5DB;
  background: #F9FAFB;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.video-preview-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-video {
  width: 100%;
  height: 180px;
  border-radius: 12px;
}

.delete-video-btn {
  font-size: 12px;
  color: #EF4444;
  text-align: center;
  padding: 6px;
}

.convention-card {
  background: linear-gradient(135deg, #ECFDF5 0%, #E0F2FE 100%);
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 20px;
  border: 1px solid #A7F3D0;
}

.convention-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.heart-icon {
  font-size: 14px;
}

.title-text {
  font-size: 13px;
  font-weight: 700;
  color: #065F46;
}

.convention-desc {
  font-size: 12px;
  color: #047857;
  line-height: 1.5;
  display: block;
}

.bottom-padding {
  height: 90px;
}

.fixed-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  padding: 12px 20px 30px 20px;
  border-top: 1px solid #F1F5F9;
  z-index: 100;
}

.bottom-submit-btn {
  width: 100%;
  height: 46px;
  line-height: 46px;
  font-size: 16px;
  font-weight: 700;
  color: #9CA3AF;
  background: #E5E7EB;
  border-radius: 24px;
  border: none;
  text-align: center;
}

.bottom-submit-btn.active {
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
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
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
  left: 0;
  right: 0;
  bottom: 0;
  background: #FFFFFF;
  border-radius: 24px 24px 0 0;
  z-index: 1000;
  transform: translateY(100%);
  transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1);
  display: flex;
  flex-direction: column;
  max-height: 70vh;
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
}

.popup-panel.show {
  transform: translateY(0);
}

.popup-header {
  padding: 20px 20px 14px 20px;
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

.close-btn-box {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-icon {
  font-size: 16px;
  color: #9CA3AF;
}

.popup-scroll-body {
  height: 340px;
  padding: 12px 16px;
  box-sizing: border-box;
}

.popup-options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cat-option-card {
  padding: 14px 16px;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #F9FAFB;
  border: 1px solid #F3F4F6;
  transition: all 0.2s ease;
}

.cat-option-card.active {
  background: #ECFDF5;
  border: 1px solid #10B981;
}

.option-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cat-icon {
  font-size: 24px;
}

.cat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cat-name {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.cat-option-card.active .cat-name {
  color: #059669;
}

.cat-desc {
  font-size: 12px;
  color: #6B7280;
}

.check-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #10B981;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-mark {
  font-size: 14px;
  font-weight: 800;
  color: #FFFFFF;
}
</style>
