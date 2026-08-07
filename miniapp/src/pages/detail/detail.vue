<template>
  <view class="detail-container">
    <!-- 1. 顶部自定义导航 -->
    <view class="nav-bar">
      <view class="back-btn-box" @click="onBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="page-title">帖子详情</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 2. 可滚动的主体区 -->
    <scroll-view scroll-y class="detail-body">
      
      <!-- 主发帖卡片 (楼主) -->
      <view class="main-post-card">
        <view class="author-row">
          <image class="author-avatar" :src="post.avatar" mode="aspectFill" />
          <view class="author-info">
            <view class="name-line">
              <text class="author-name">{{ post.authorName }}</text>
              <text class="building-badge">{{ post.building }}</text>
              <text class="role-badge">{{ post.roleTag }}</text>
            </view>
            <text class="post-time">楼主 · 发布于 {{ post.publishTime }}</text>
          </view>
        </view>

        <!-- 帖子完整正文 -->
        <view class="post-content">
          <text class="content-text">{{ post.content }}</text>
        </view>

        <!-- 按照微信朋友圈标准规则展示图片 (未点开时) -->
        <view v-if="post.images && post.images.length > 0" class="moment-media-box">
          <!-- 朋友圈规则 1：单张图片 (自适应宽高限制) -->
          <view v-if="post.images.length === 1" class="single-image-wrapper">
            <image
              class="moment-single-img"
              :src="post.images[0]"
              mode="aspectFill"
              @click="previewPostImages(0)"
            />
          </view>

          <!-- 朋友圈规则 2：2张 或 4张图片 (双列并排正方形网格 110px * 110px) -->
          <view v-else-if="post.images.length === 2 || post.images.length === 4" class="moment-grid-2col">
            <image
              v-for="(img, idx) in post.images"
              :key="idx"
              class="moment-square-img-2col"
              :src="img"
              mode="aspectFill"
              @click="previewPostImages(idx)"
            />
          </view>

          <!-- 朋友圈规则 3：3张 / 5~9张图片 (三列标准九宫格正方形 84px * 84px) -->
          <view v-else class="moment-grid-3col">
            <image
              v-for="(img, idx) in post.images"
              :key="idx"
              class="moment-square-img-3col"
              :src="img"
              mode="aspectFill"
              @click="previewPostImages(idx)"
            />
          </view>
        </view>

        <!-- 朋友圈规则 4：未点开时的视频封面与 ▶ 播放大图标 -->
        <view v-if="post.videoUrl" class="moment-video-box">
          <view v-if="!isPlayingVideo" class="video-cover-card" @click="isPlayingVideo = true">
            <image class="video-cover-img" :src="post.videoPoster || post.images[0] || defaultVideoPoster" mode="aspectFill" />
            <view class="play-btn-overlay">
              <view class="play-icon-circle">
                <text class="play-arrow">▶</text>
              </view>
            </view>
            <text class="video-duration-tag">00:15</text>
          </view>
          <video v-else class="active-video-player" :src="post.videoUrl" autoplay controls />
        </view>

        <!-- 底部 Tag 标签 -->
        <view class="post-tag-row">
          <text class="tag-pill" :class="{ urgent: post.tagType === 'URGENT' }">
            # {{ post.tagName }}
          </text>
        </view>
      </view>

      <!-- 3. 贴吧风盖楼评论回复区 -->
      <view class="comments-section">
        <view class="comments-header">
          <text class="section-title">全部回复 <text class="count-num">({{ commentList.length }})</text></text>
          <text class="sort-tip">按时间倒序</text>
        </view>

        <view v-if="commentList.length > 0" class="comment-list">
          <view
            v-for="(comment, index) in commentList"
            :key="comment.id"
            class="comment-card"
          >
            <view class="comment-user-row">
              <image class="comment-avatar" :src="comment.avatar" mode="aspectFill" />
              <view class="comment-user-meta">
                <view class="comment-name-line">
                  <text class="comment-name">{{ comment.authorName }}</text>
                  <text class="floor-badge">{{ index + 1 }}楼</text>
                </view>
                <text class="comment-time">{{ comment.publishTime }}</text>
              </view>
              <text class="reply-action-btn" @click="setReplyTarget(comment)">回复</text>
            </view>

            <view class="comment-text-box">
              <text class="comment-text">{{ comment.content }}</text>
            </view>

            <view v-if="comment.image" class="comment-media-box">
              <image class="comment-moment-img" :src="comment.image" mode="aspectFill" @click="previewSingleImg(comment.image)" />
            </view>
            <view v-if="comment.video" class="comment-media-box">
              <video class="comment-video" :src="comment.video" controls />
            </view>

            <view v-if="comment.subReplies && comment.subReplies.length > 0" class="sub-reply-container">
              <view
                v-for="sub in comment.subReplies"
                :key="sub.id"
                class="sub-reply-item"
                @click="setReplyTarget(comment, sub.authorName)"
              >
                <text class="sub-author">{{ sub.authorName }}</text>
                <text v-if="sub.replyToUser" class="sub-reply-to"> 回复 <text class="sub-target">{{ sub.replyToUser }}</text></text>
                <text class="sub-colon">：</text>
                <text class="sub-content">{{ sub.content }}</text>
              </view>
            </view>
          </view>
        </view>

        <view v-else class="empty-comments">
          <text class="empty-icon">💬</text>
          <text class="empty-text">暂无邻里回复，快来抢沙发吧~</text>
        </view>
      </view>

      <view class="bottom-spacer"></view>
    </scroll-view>

    <!-- 4. 底部固定贴吧回复输入栏 -->
    <view class="reply-input-bar">
      <view v-if="replyTargetUser" class="reply-target-strip">
        <text class="target-text">正在回复 @{{ replyTargetUser }}</text>
        <text class="cancel-target" @click="clearReplyTarget">✕ 取消回复</text>
      </view>

      <view v-if="commentMedia.path" class="attach-media-preview">
        <image v-if="commentMedia.type === 'IMAGE'" class="attach-img" :src="commentMedia.path" mode="aspectFill" />
        <video v-else-if="commentMedia.type === 'VIDEO'" class="attach-video" :src="commentMedia.path" />
        <text class="remove-attach-btn" @click="clearCommentMedia">✕</text>
      </view>

      <view class="input-row">
        <view class="media-icon-btns">
          <text class="icon-btn" @click="onChooseCommentImage">📷</text>
          <text class="icon-btn" @click="onChooseCommentVideo">🎥</text>
        </view>

        <input
          v-model="inputContent"
          class="reply-input"
          :placeholder="replyTargetUser ? '回复 @' + replyTargetUser + '...' : '跟帖跟邻居聊聊...'"
          confirm-type="send"
          @confirm="onSendComment"
        />

        <button
          class="send-btn"
          :disabled="!canSend"
          :class="{ active: canSend }"
          @click="onSendComment"
        >
          发送
        </button>
      </view>
    </view>

  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { chooseAndCompressImages, chooseAndCompressVideo } from '@/utils/media'

const inputContent = ref('')
const replyTargetComment = ref(null)
const replyTargetUser = ref('')
const commentMedia = ref({ type: null, path: '' })
const isPlayingVideo = ref(false)

const defaultVideoPoster = 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=600'

const post = ref({
  id: 'p1',
  authorName: '王阿姨',
  building: '3栋 1202',
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
  roleTag: '本小区住户',
  publishTime: '10分钟前',
  content: '谁家有电钻可以借用半小时？想要在客厅墙上装个挂衣置物架。由于家里只有我和小孙女，急需借用一会儿，用完立即归还，并且必有重谢！麻烦有电钻的邻居联系我呀~',
  images: [
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600'
  ],
  videoUrl: '',
  videoPoster: '',
  tagName: '邻里求助',
  tagType: 'NORMAL'
})

const commentList = ref([
  {
    id: 'c1',
    authorName: '张先生',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    publishTime: '8分钟前',
    content: '王阿姨，我家正好有一套冲击钻，放在 5栋 门卫室了，您可以随时去拿取使用~',
    image: '',
    video: '',
    subReplies: [
      {
        id: 'sub1',
        authorName: '王阿姨',
        replyToUser: '张先生',
        content: '太感谢张先生了！我这就叫我儿子去门卫室拿，谢谢好邻居！'
      },
      {
        id: 'sub2',
        authorName: '张先生',
        replyToUser: '王阿姨',
        content: '不客气！用的时候注意安全哈~'
      }
    ]
  },
  {
    id: 'c2',
    authorName: '陈女士',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    publishTime: '5分钟前',
    content: '我也在 3栋 6楼，如果张先生的借不到，我家里也有把手电钻。',
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&q=80&w=300',
    video: '',
    subReplies: []
  }
])

const canSend = computed(() => {
  return inputContent.value.trim().length > 0 || commentMedia.value.path !== ''
})

const onBack = () => {
  const pages = getCurrentPages()
  if (pages && pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({
      url: '/pages/index/index'
    })
  }
}

const previewPostImages = (index) => {
  uni.previewImage({
    urls: post.value.images,
    current: index
  })
}

const previewSingleImg = (url) => {
  uni.previewImage({
    urls: [url]
  })
}

const setReplyTarget = (mainComment, targetUserName = '') => {
  replyTargetComment.value = mainComment
  replyTargetUser.value = targetUserName || mainComment.authorName
}

const clearReplyTarget = () => {
  replyTargetComment.value = null
  replyTargetUser.value = ''
}

const onChooseCommentImage = async () => {
  try {
    const paths = await chooseAndCompressImages({ count: 1, maxMB: 2 })
    if (paths && paths.length > 0) {
      commentMedia.value = {
        type: 'IMAGE',
        path: paths[0]
      }
    }
  } catch (e) {
    console.log('取消选择图片')
  }
}

const onChooseCommentVideo = async () => {
  try {
    const path = await chooseAndCompressVideo({ isReply: true, maxMB: 15 })
    if (path) {
      commentMedia.value = {
        type: 'VIDEO',
        path
      }
    }
  } catch (e) {
    console.log('取消选择视频')
  }
}

const clearCommentMedia = () => {
  commentMedia.value = { type: null, path: '' }
}

const onSendComment = () => {
  if (!canSend.value) return

  const text = inputContent.value.trim()
  
  if (replyTargetComment.value) {
    if (!replyTargetComment.value.subReplies) {
      replyTargetComment.value.subReplies = []
    }
    replyTargetComment.value.subReplies.push({
      id: 'sub_' + Date.now(),
      authorName: '我 (李先生)',
      replyToUser: replyTargetUser.value !== replyTargetComment.value.authorName ? replyTargetUser.value : '',
      content: text
    })
  } else {
    commentList.value.unshift({
      id: 'c_' + Date.now(),
      authorName: '我 (李先生)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      publishTime: '刚刚',
      content: text,
      image: commentMedia.value.type === 'IMAGE' ? commentMedia.value.path : '',
      video: commentMedia.value.type === 'VIDEO' ? commentMedia.value.path : '',
      subReplies: []
    })
  }

  inputContent.value = ''
  clearReplyTarget()
  clearCommentMedia()
  uni.showToast({ title: '回复成功！', icon: 'success' })
}
</script>

<style scoped>
.detail-container {
  height: 100vh;
  background-color: #F0F7F4;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  position: relative;
}

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

.detail-body {
  flex: 1;
  padding: 16px;
  box-sizing: border-box;
}

.main-post-card {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.05);
}

.author-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.author-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name-line {
  display: flex;
  align-items: center;
  gap: 6px;
}

.author-name {
  font-size: 16px;
  font-weight: 800;
  color: #111827;
}

.building-badge {
  font-size: 11px;
  color: #059669;
  background: #E6F4EA;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 600;
}

.role-badge {
  font-size: 11px;
  color: #6B7280;
  background: #F3F4F6;
  padding: 2px 6px;
  border-radius: 6px;
}

.post-time {
  font-size: 12px;
  color: #9CA3AF;
}

.post-content {
  margin-bottom: 14px;
}

.content-text {
  font-size: 15px;
  color: #1F2937;
  line-height: 1.7;
}

/* 微信朋友圈媒体显示规范 (未点开时) */
.moment-media-box {
  margin-bottom: 14px;
}

/* 规则 1: 朋友圈单张图片 (自适应宽度，高度上限220px，不强制正方形) */
.single-image-wrapper {
  max-width: 70%;
}

.moment-single-img {
  width: 100%;
  height: auto;
  max-height: 220px;
  border-radius: 12px;
  display: block;
}

/* 规则 2: 朋友圈 2 张或 4 张图片 (并排双列正方形卡片 110px × 110px，绝不拉爆上下) */
.moment-grid-2col {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-width: 230px;
}

.moment-square-img-2col {
  width: 110px;
  height: 110px;
  border-radius: 10px;
  flex-shrink: 0;
}

/* 规则 3: 朋友圈 3张 / 5~9张图片 (三列标准九宫格正方形 84px × 84px) */
.moment-grid-3col {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-width: 270px;
}

.moment-square-img-3col {
  width: 84px;
  height: 84px;
  border-radius: 8px;
  flex-shrink: 0;
}

/* 规则 4: 朋友圈未点开时的视频卡片 */
.moment-video-box {
  margin-bottom: 14px;
  width: 70%;
}

.video-cover-card {
  position: relative;
  width: 100%;
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  background: #000000;
}

.video-cover-img {
  width: 100%;
  height: 100%;
  opacity: 0.85;
}

.play-btn-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-icon-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-arrow {
  color: #FFFFFF;
  font-size: 18px;
  margin-left: 2px;
}

.video-duration-tag {
  position: absolute;
  right: 8px;
  bottom: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: #FFFFFF;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}

.active-video-player {
  width: 100%;
  height: 200px;
  border-radius: 12px;
}

.post-tag-row {
  display: flex;
  align-items: center;
}

.tag-pill {
  font-size: 13px;
  font-weight: 700;
  color: #059669;
}

.tag-pill.urgent {
  color: #DC2626;
}

/* 评论区 */
.comments-section {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 18px;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.03);
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #F3F4F6;
  margin-bottom: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 800;
  color: #111827;
}

.count-num {
  color: #059669;
}

.sort-tip {
  font-size: 12px;
  color: #9CA3AF;
}

.comment-card {
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid #F9FAFB;
}

.comment-user-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.comment-user-meta {
  flex: 1;
  margin-left: 10px;
}

.comment-name-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-name {
  font-size: 14px;
  font-weight: 700;
  color: #374151;
}

.floor-badge {
  font-size: 10px;
  color: #9CA3AF;
  background: #F3F4F6;
  padding: 1px 5px;
  border-radius: 4px;
}

.comment-time {
  font-size: 11px;
  color: #9CA3AF;
}

.reply-action-btn {
  font-size: 12px;
  font-weight: 600;
  color: #059669;
  background: #ECFDF5;
  padding: 3px 10px;
  border-radius: 12px;
}

.comment-text-box {
  margin-left: 46px;
  margin-bottom: 8px;
}

.comment-text {
  font-size: 14px;
  color: #1F2937;
  line-height: 1.5;
}

.comment-media-box {
  margin-left: 46px;
  margin-bottom: 8px;
}

.comment-moment-img {
  width: 120px;
  max-height: 160px;
  border-radius: 10px;
}

.comment-video {
  width: 180px;
  height: 120px;
  border-radius: 10px;
}

.sub-reply-container {
  margin-left: 46px;
  background: #F9FAFB;
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sub-reply-item {
  font-size: 13px;
  line-height: 1.5;
}

.sub-author {
  font-weight: 700;
  color: #1F2937;
}

.sub-reply-to {
  color: #6B7280;
  font-size: 12px;
}

.sub-target {
  font-weight: 600;
  color: #059669;
}

.sub-colon {
  color: #6B7280;
}

.sub-content {
  color: #374151;
}

.empty-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  gap: 6px;
}

.empty-icon {
  font-size: 36px;
}

.empty-text {
  font-size: 13px;
  color: #9CA3AF;
}

.bottom-spacer {
  height: 100px;
}

.reply-input-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  padding: 10px 16px 28px 16px;
  border-top: 1px solid #F1F5F9;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reply-target-strip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ECFDF5;
  padding: 4px 10px;
  border-radius: 8px;
}

.target-text {
  font-size: 12px;
  font-weight: 700;
  color: #059669;
}

.cancel-target {
  font-size: 11px;
  color: #EF4444;
}

.attach-media-preview {
  position: relative;
  width: 50px;
  height: 50px;
}

.attach-img, .attach-video {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.remove-attach-btn {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  background: #EF4444;
  color: #FFF;
  border-radius: 50%;
  font-size: 10px;
  text-align: center;
  line-height: 16px;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.media-icon-btns {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-btn {
  font-size: 22px;
}

.reply-input {
  flex: 1;
  height: 38px;
  background: #F3F4F6;
  border-radius: 19px;
  padding: 0 14px;
  font-size: 14px;
  color: #111827;
}

.send-btn {
  font-size: 13px;
  font-weight: 700;
  color: #9CA3AF;
  background: #E5E7EB;
  border-radius: 19px;
  padding: 0 16px;
  height: 38px;
  line-height: 38px;
  border: none;
  margin: 0;
}

.send-btn.active {
  color: #FFFFFF;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}
</style>
