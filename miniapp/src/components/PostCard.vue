<template>
  <view class="post-card" @click="onCardClick">
    <!-- 发帖人基本信息 -->
    <view class="user-row">
      <view class="user-info">
        <image class="avatar" :src="post.authorAvatar || post.avatar || defaultAvatar" mode="aspectFill" />
        <view class="meta">
          <view class="name-box">
            <text class="user-name">{{ post.authorName }} · {{ post.building }}</text>
            <text class="role-tag" :class="getRoleTagClass(post.roleType)">
              {{ post.roleTag || '本小区住户' }}
            </text>
          </view>
          <text class="publish-time">{{ post.publishTime }}</text>
        </view>
      </view>
    </view>

    <!-- 帖子标题/正文与单图模式组合 -->
    <view class="content-row">
      <view class="text-area">
        <text class="post-text">{{ post.content }}</text>
      </view>

      <!-- 单张图片时：只在右侧展示 1 张精简正方形缩略图 -->
      <image
        v-if="parsedImages.length === 1"
        class="single-right-img"
        :src="parsedImages[0]"
        mode="aspectFill"
        @click.stop="previewImage(parsedImages[0])"
      />
    </view>

    <!-- 多张图片时 (2张及以上)：列表最多展示 3 张并排正方形缩略图 -->
    <view v-if="parsedImages.length > 1" class="multi-img-grid">
      <image
        v-for="(img, idx) in displayMultiImages"
        :key="idx"
        class="multi-img"
        :src="img"
        mode="aspectFill"
        @click.stop="previewImages(parsedImages, idx)"
      />
    </view>

    <!-- 视频封面预览卡片 (视频帖) -->
    <view v-if="post.videoUrl" class="video-preview-strip">
      <view class="video-cover-box">
        <image class="video-cover-img" :src="post.videoPoster || parsedImages[0] || defaultVideoPoster" mode="aspectFill" />
        <view class="play-overlay">
          <text class="play-icon">▶</text>
        </view>
      </view>
      <text class="video-tip">包含 1 个短视频</text>
    </view>

    <!-- 底部 Tag 标签 -->
    <view class="post-footer">
      <text class="tag-pill" :class="getTagClass(post.tagType)">
        # {{ post.tagName || '社区交流' }}
      </text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
const defaultVideoPoster = 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=600'

// 智能安全解析后端返回的 images (支持逗号分隔的字符串或数组)
const parsedImages = computed(() => {
  if (!props.post) return []
  
  const imgs = props.post.images || props.post.singleImg
  if (!imgs) return []
  
  if (Array.isArray(imgs)) {
    return imgs.filter(Boolean)
  }
  
  if (typeof imgs === 'string') {
    return imgs.split(',').map(s => s.trim()).filter(Boolean)
  }
  
  return []
})

// 在列表 Feed 流中，多图最多展示前 3 张 (保持列表卡片紧凑整洁)
const displayMultiImages = computed(() => {
  return parsedImages.value.slice(0, 3)
})

const onCardClick = () => {
  emit('click')
}

const getRoleTagClass = (roleType) => {
  if (roleType === 'GOV') return 'tag-gov'
  if (roleType === 'COMMITTEE') return 'tag-committee'
  return 'tag-resident'
}

const getTagClass = (tagType) => {
  if (tagType === 'URGENT') return 'tag-urgent'
  if (tagType === 'IDLE') return 'tag-idle'
  if (tagType === 'RENT') return 'tag-rent'
  return 'tag-normal'
}

const previewImage = (img) => {
  uni.previewImage({ urls: [img] })
}

const previewImages = (urls, currentIdx) => {
  uni.previewImage({ urls, current: currentIdx })
}
</script>

<style scoped>
.post-card {
  background-color: #FFFFFF;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.03);
}

.user-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background-color: #E5E7EB;
}

.meta {
  display: flex;
  flex-direction: column;
}

.name-box {
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-name {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.role-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.tag-resident {
  background-color: #E6F4EA;
  color: #137333;
}

.tag-gov {
  background-color: #FCE8E6;
  color: #C5221F;
}

.tag-committee {
  background-color: #FEF7E0;
  color: #B06000;
}

.publish-time {
  font-size: 11px;
  color: #9CA3AF;
  margin-top: 2px;
}

.content-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.text-area {
  flex: 1;
}

.post-text {
  font-size: 14px;
  color: #1F2937;
  line-height: 1.6;
  white-space: pre-wrap;
}

.single-right-img {
  width: 84px;
  height: 84px;
  border-radius: 12px;
  background-color: #F3F4F6;
  flex-shrink: 0;
}

.multi-img-grid {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}

.multi-img {
  width: 90px;
  height: 90px;
  border-radius: 10px;
  background-color: #F3F4F6;
  flex-shrink: 0;
}

.video-preview-strip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  background: #F9FAFB;
  padding: 6px 10px;
  border-radius: 10px;
  width: fit-content;
}

.video-cover-box {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 6px;
  overflow: hidden;
  background: #000;
}

.video-cover-img {
  width: 100%;
  height: 100%;
  opacity: 0.8;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-icon {
  color: #FFF;
  font-size: 12px;
}

.video-tip {
  font-size: 12px;
  font-weight: 600;
  color: #4B5563;
}

.post-footer {
  display: flex;
  align-items: center;
  margin-top: 12px;
  padding-top: 8px;
}

.tag-pill {
  font-size: 12px;
  font-weight: 600;
}

.tag-normal {
  color: #059669;
}

.tag-urgent {
  color: #DC2626;
}

.tag-idle {
  color: #4F46E5;
}

.tag-rent {
  color: #2563EB;
}
</style>
