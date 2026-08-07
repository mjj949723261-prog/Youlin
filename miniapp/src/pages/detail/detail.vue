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

        <!-- 媒体展示 (九宫格图片 / 视频) -->
        <view v-if="post.images && post.images.length > 0" class="post-media-grid">
          <image
            v-for="(img, idx) in post.images"
            :key="idx"
            class="media-img"
            :src="img"
            mode="aspectFill"
            @click="previewPostImages(idx)"
          />
        </view>

        <view v-if="post.videoUrl" class="post-video-box">
          <video class="post-video" :src="post.videoUrl" controls />
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

        <!-- 评论楼层列表 -->
        <view v-if="commentList.length > 0" class="comment-list">
          <view
            v-for="(comment, index) in commentList"
            :key="comment.id"
            class="comment-card"
          >
            <!-- 楼层主回复 -->
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

            <!-- 评论文字 -->
            <view class="comment-text-box">
              <text class="comment-text">{{ comment.content }}</text>
            </view>

            <!-- 评论附带图片/视频 -->
            <view v-if="comment.image" class="comment-media-box">
              <image class="comment-img" :src="comment.image" mode="aspectFill" @click="previewSingleImg(comment.image)" />
            </view>
            <view v-if="comment.video" class="comment-media-box">
              <video class="comment-video" :src="comment.video" controls />
            </view>

            <!-- 盖楼楼中楼 (Nested Reply Sub-List) -->
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

        <!-- 空评论提示 -->
        <view v-else class="empty-comments">
          <text class="empty-icon">💬</text>
          <text class="empty-text">暂无邻里回复，快来抢沙发吧~</text>
        </view>
      </view>

      <view class="bottom-spacer"></view>
    </scroll-view>

    <!-- 4. 底部固定贴吧回复输入栏 -->
    <view class="reply-input-bar">
      <!-- 动态回复目标提示小标签 (若选中了具体回复对象) -->
      <view v-if="replyTargetUser" class="reply-target-strip">
        <text class="target-text">正在回复 @{{ replyTargetUser }}</text>
        <text class="cancel-target" @click="clearReplyTarget">✕ 取消回复</text>
      </view>

      <!-- 评论附带媒体预览缩略图 -->
      <view v-if="commentMedia.path" class="attach-media-preview">
        <image v-if="commentMedia.type === 'IMAGE'" class="attach-img" :src="commentMedia.path" mode="aspectFill" />
        <video v-else-if="commentMedia.type === 'VIDEO'" class="attach-video" :src="commentMedia.path" />
        <text class="remove-attach-btn" @click="clearCommentMedia">✕</text>
      </view>

      <view class="input-row">
        <!-- 媒体选择图标 (📷 图片 / 🎥 15秒微视频，支持控制流量与画质) -->
        <view class="media-icon-btns">
          <text class="icon-btn" @click="onChooseCommentImage">📷</text>
          <text class="icon-btn" @click="onChooseCommentVideo">🎥</text>
        </view>

        <!-- 输入框 -->
        <input
          v-model="inputContent"
          class="reply-input"
          :placeholder="replyTargetUser ? '回复 @' + replyTargetUser + '...' : '跟帖跟邻居聊聊...'"
          confirm-type="send"
          @confirm="onSendComment"
        />

        <!-- 发送按钮 -->
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
import { ref, computed, onMounted } from 'vue'
import { chooseAndCompressImages, chooseAndCompressVideo } from '@/utils/media'

const inputContent = ref('')
const replyTargetComment = ref(null) // 选中的目标主评论
const replyTargetUser = ref('')      // 选中的目标用户名
const commentMedia = ref({ type: null, path: '' }) // 评论附带图片/视频

// 预设高保真帖子详情
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
  tagName: '邻里求助',
  tagType: 'NORMAL'
})

// 盖楼评论列表数据
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

onMounted(() => {
  // 页面加载逻辑
})

// 返回
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

// 预览帖子多图
const previewPostImages = (index) => {
  uni.previewImage({
    urls: post.value.images,
    current: index
  })
}

// 预览单图
const previewSingleImg = (url) => {
  uni.previewImage({
    urls: [url]
  })
}

// 设置回复目标
const setReplyTarget = (mainComment, targetUserName = '') => {
  replyTargetComment.value = mainComment
  replyTargetUser.value = targetUserName || mainComment.authorName
}

// 清除回复目标
const clearReplyTarget = () => {
  replyTargetComment.value = null
  replyTargetUser.value = ''
}

// 评论附带上传图片 (自动压缩与限重)
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

// 评论附带上传微视频 (15秒流量控制与自动压缩)
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

// 发送评论 / 盖楼子回复
const onSendComment = () => {
  if (!canSend.value) return

  const text = inputContent.value.trim()
  
  if (replyTargetComment.value) {
    // 盖楼：追加到目标主评论的 subReplies 中
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
    // 新的主楼层评论
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

  // 重置输入状态
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

/* 1. 顶部导航 */
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

/* 2. 滚动区 */
.detail-body {
  flex: 1;
  padding: 16px;
  box-sizing: border-box;
}

/* 楼主主发帖卡片 */
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

/* 多图九宫格 */
.post-media-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}

.media-img {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
}

.post-video-box {
  margin-bottom: 14px;
}

.post-video {
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

/* 3. 贴吧风盖楼评论区 */
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

.comment-img {
  width: 120px;
  height: 120px;
  border-radius: 10px;
}

.comment-video {
  width: 180px;
  height: 120px;
  border-radius: 10px;
}

/* 盖楼二层子回复 (Nested Reply Thread) */
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

/* 4. 固定回复输入栏 */
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
