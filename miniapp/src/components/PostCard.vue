<template>
  <view class="post-card" @click="onCardClick">
    <!-- 发帖人基本信息 -->
    <view class="user-row">
      <view class="user-info">
        <image class="avatar" :src="post.avatar || defaultAvatar" mode="aspectFill" />
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

    <!-- 帖子标题/主体内容与右侧单图组合 -->
    <view class="content-row" :class="{ 'has-single-img': post.singleImg }">
      <view class="text-area">
        <text class="post-text">{{ post.content }}</text>
      </view>
      <image
        v-if="post.singleImg"
        class="single-img"
        :src="post.singleImg"
        mode="aspectFill"
        @click.stop="previewImage(post.singleImg)"
      />
    </view>

    <!-- 多图展示网格 (如果有) -->
    <view v-if="post.images && post.images.length > 0" class="multi-img-grid">
      <image
        v-for="(img, idx) in post.images"
        :key="idx"
        class="multi-img"
        :src="img"
        mode="aspectFill"
        @click.stop="previewImages(post.images, idx)"
      />
    </view>

    <!-- 底部仅保留 Tag 标签 -->
    <view class="post-footer">
      <text class="tag-pill" :class="getTagClass(post.tagType)">
        # {{ post.tagName }}
      </text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'

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

.single-img {
  width: 84px;
  height: 84px;
  border-radius: 12px;
  background-color: #F3F4F6;
  flex-shrink: 0;
}

.multi-img-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-top: 10px;
}

.multi-img {
  width: 100%;
  height: 90px;
  border-radius: 8px;
  background-color: #F3F4F6;
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
