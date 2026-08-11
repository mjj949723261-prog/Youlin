<template>
  <view class="detail-container">
    <!-- 1. 常驻固定在最顶部的 Navigation Header (不随列表滑动) -->
    <view class="fixed-nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-inner">
        <view class="back-btn-box" @click="onBack">
          <text class="back-icon">‹</text>
        </view>
        <text class="page-title">帖子详情</text>
        <view class="nav-placeholder"></view>
      </view>
    </view>

    <!-- 2. 可平滑滚动的主体列表区 (顶部留出 Header 避查距离) -->
    <scroll-view
      scroll-y
      class="detail-body"
      :style="{ paddingTop: (statusBarHeight + 48) + 'px' }"
    >
      
      <!-- 主发帖卡片 (楼主) -->
      <view class="main-post-card">
        <view class="author-row">
          <image class="author-avatar" :src="post.authorAvatar || defaultAvatar" mode="aspectFill" />
          <view class="author-info">
            <view class="name-line">
              <text class="author-name">{{ post.authorName }}</text>
              <text class="building-badge">{{ post.building }}</text>
              <text class="role-badge">{{ post.roleTag || '社区住户' }}</text>
            </view>
            <text class="post-time">楼主 · 发布于 {{ post.publishTime }}</text>
          </view>

          <!-- 右侧操作区：如果是作者本人显示【删除】，否则显示【举报】 -->
          <view class="action-box">
            <text
              v-if="isMyPost"
              class="action-btn delete-btn"
              @click="onDeleteMainPost"
            >
              🗑️ 删除
            </text>
            <text
              v-else
              class="action-btn report-btn"
              @click="onReportMainPost"
            >
              🚨 举报
            </text>
          </view>
        </view>

        <!-- 帖子完整正文 -->
        <view class="post-content">
          <text class="content-text">{{ post.content }}</text>
        </view>

        <!-- 按照微信朋友圈标准规则展示图片 (未点开时) -->
        <view v-if="postImages && postImages.length > 0" class="moment-media-box">
          <!-- 朋友圈规则 1：单张图片 (自适应宽高限制) -->
          <view v-if="postImages.length === 1" class="single-image-wrapper">
            <image
              class="moment-single-img"
              :src="postImages[0]"
              mode="aspectFill"
              @click="previewPostImages(0)"
            />
          </view>

          <!-- 朋友圈规则 2：2张 或 4张图片 (强制左右横向并排正方形 110px * 110px) -->
          <view v-else-if="postImages.length === 2 || postImages.length === 4" class="moment-grid-2col">
            <image
              v-for="(img, idx) in postImages"
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
              v-for="(img, idx) in postImages"
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
            <image class="video-cover-img" :src="post.videoPoster || postImages[0] || defaultVideoPoster" mode="aspectFill" />
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
            # {{ post.tagName || '社区交流' }}
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
              <image class="comment-avatar" :src="comment.authorAvatar || defaultAvatar" mode="aspectFill" />
              <view class="comment-user-meta">
                <view class="comment-name-line">
                  <text class="comment-name">{{ comment.authorName }}</text>
                  <text class="floor-badge">{{ comment.floorNum || (index + 1) }}楼</text>
                </view>
                <text class="comment-time">{{ comment.publishTime }}</text>
              </view>

              <view class="comment-actions">
                <text
                  v-if="isMyComment(comment)"
                  class="action-btn delete-btn"
                  @click="onDeleteCommentItem(comment.id)"
                >
                  🗑️ 删除
                </text>
                <text class="reply-action-btn" @click="setReplyTarget(comment)">回复</text>
              </view>
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

            <!-- 贴吧嵌套子回复 -->
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

    <!-- 手机号快捷授权绑定弹窗 -->
    <PhoneBindModal
      :visible="isPhoneModalVisible"
      @close="isPhoneModalVisible = false"
      @success="onPhoneBindSuccess"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { chooseAndCompressImages, chooseAndCompressVideo } from '@/utils/media'
import { apiGetPostDetail, apiGetComments, apiAddComment, apiDeletePost, apiDeleteComment, apiReportContent } from '@/utils/api'
import { state as communityState, useCommunityStore } from '@/store/community'
import PhoneBindModal from '@/components/PhoneBindModal.vue'

const communityStore = useCommunityStore()
const statusBarHeight = ref(20)
const postId = ref(null)
const inputContent = ref('')
const replyTargetComment = ref(null)
const replyTargetUser = ref('')
const commentMedia = ref({ type: null, path: '' })
const isPlayingVideo = ref(false)
const isPhoneModalVisible = ref(false)

const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
const defaultVideoPoster = 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=600'

const post = ref({})
const postImages = ref([])
const commentList = ref([])

// 判断当前帖子是否由我发布
const isMyPost = computed(() => {
  if (!communityState.isLoggedIn) return false
  const currentOpenId = communityState.currentUser.openId || communityState.currentUser.id
  return post.value && post.value.authorId && post.value.authorId === currentOpenId
})

// 判断某条评论是否由我发布
const isMyComment = (commentItem) => {
  if (!communityState.isLoggedIn) return false
  const currentOpenId = communityState.currentUser.openId || communityState.currentUser.id
  return commentItem && commentItem.authorId && commentItem.authorId === currentOpenId
}

// 加载帖子详情及盖楼回复
const loadPostData = async (id) => {
  try {
    const detailData = await apiGetPostDetail(id)
    if (detailData && detailData.post) {
      post.value = detailData.post
      postImages.value = detailData.imageList || []
    }
    
    const commentsData = await apiGetComments(id)
    if (commentsData) {
      commentList.value = commentsData
    }
  } catch (e) {
    console.log('读取后端详情或回复失败', e)
  }
}

onLoad((options) => {
  if (options && options.id) {
    postId.value = options.id
    loadPostData(options.id)
  }
})

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync()
  if (sysInfo.statusBarHeight) {
    statusBarHeight.value = sysInfo.statusBarHeight
  }
})

const canSend = computed(() => {
  return inputContent.value.trim().length > 0 || commentMedia.value.path !== ''
})

// 主贴删除
const onDeleteMainPost = () => {
  uni.showModal({
    title: '🗑️ 删除动态提醒',
    content: '确定要彻底删除这条邻里动态吗？',
    confirmColor: '#DC2626',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '删除中...' })
        const resDel = await apiDeletePost(postId.value)
        uni.hideLoading()
        if (resDel) {
          uni.showToast({ title: '动态已成功删除！', icon: 'success' })
          setTimeout(() => {
            onBack()
          }, 800)
        }
      }
    }
  })
}

// 评论回复删除
const onDeleteCommentItem = (commentId) => {
  uni.showModal({
    title: '🗑️ 删除回复提醒',
    content: '确定要删除这条回复吗？',
    confirmColor: '#DC2626',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '删除中...' })
        const resDel = await apiDeleteComment(commentId)
        uni.hideLoading()
        if (resDel) {
          uni.showToast({ title: '回复已删除！', icon: 'success' })
          loadPostData(postId.value)
        }
      }
    }
  })
}

// 主贴违规举报
const onReportMainPost = () => {
  uni.showActionSheet({
    itemList: ['垃圾广告营销', '涉嫌违规/敏感内容', '人身攻击或不文明用语', '虚假诈骗信息'],
    success: async (res) => {
      const reasons = ['垃圾广告营销', '涉嫌违规/敏感内容', '人身攻击或不文明用语', '虚假诈骗信息']
      const selectedReason = reasons[res.tapIndex]
      
      uni.showLoading({ title: '提交举报中...' })
      await apiReportContent({
        postId: Number(postId.value),
        reason: selectedReason
      })
      uni.hideLoading()
      
      uni.showModal({
        title: '🚨 举报已提交',
        content: `感谢您的监督！已收到对该帖子的【${selectedReason}】举报，社区管理员将优先核查并处理。`,
        showCancel: false
      })
    }
  })
}

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
    urls: postImages.value,
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

const onSendComment = async () => {
  if (!canSend.value) return

  if (!communityState.isLoggedIn) {
    communityStore.openLoginModal()
    return
  }

  // 实名合规：校验是否绑定手机号，未绑定则唤起一键授权弹窗
  if (!communityState.currentUser.phone) {
    isPhoneModalVisible.value = true
    return
  }

  doSendComment()
}

const onPhoneBindSuccess = () => {
  doSendComment()
}

const doSendComment = async () => {
  const text = inputContent.value.trim()
  uni.showLoading({ title: '正在回复...' })

  try {
    await apiAddComment({
      postId: Number(postId.value),
      content: text,
      image: commentMedia.value.type === 'IMAGE' ? commentMedia.value.path : '',
      video: commentMedia.value.type === 'VIDEO' ? commentMedia.value.path : '',
      parentCommentId: replyTargetComment.value ? replyTargetComment.value.id : null,
      replyToUser: replyTargetUser.value !== (replyTargetComment.value ? replyTargetComment.value.authorName : '') ? replyTargetUser.value : ''
    })

    uni.hideLoading()
    uni.showToast({ title: '回复成功！', icon: 'success' })

    inputContent.value = ''
    clearReplyTarget()
    clearCommentMedia()
    loadPostData(postId.value)

  } catch (e) {
    uni.hideLoading()
    console.log('写入回复失败', e)
  }
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

.fixed-nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #FFFFFF;
  z-index: 999;
  border-bottom: 1px solid #F1F5F9;
}

.header-inner {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  justify-content: space-between;
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
  flex: 1;
  margin-left: 10px;
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

.action-box {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 8px;
}

.delete-btn {
  color: #DC2626;
  background-color: #FEE2E2;
}

.report-btn {
  color: #D97706;
  background-color: #FEF3C7;
}

.post-content {
  margin-bottom: 14px;
}

.content-text {
  font-size: 15px;
  color: #1F2937;
  line-height: 1.7;
}

.moment-media-box {
  margin-bottom: 14px;
}

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

.moment-grid-2col {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: wrap !important;
  gap: 8px !important;
  width: 230px !important;
}

.moment-square-img-2col {
  width: 108px !important;
  height: 108px !important;
  border-radius: 10px !important;
  flex-shrink: 0 !important;
}

.moment-grid-3col {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: wrap !important;
  gap: 6px !important;
  width: 270px !important;
}

.moment-square-img-3col {
  width: 84px !important;
  height: 84px !important;
  border-radius: 8px !important;
  flex-shrink: 0 !important;
}

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
  gap: 6px;
}

.comment-name {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.floor-badge {
  font-size: 10px;
  color: #6B7280;
  background: #F3F4F6;
  padding: 1px 5px;
  border-radius: 4px;
}

.comment-time {
  font-size: 11px;
  color: #9CA3AF;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reply-action-btn {
  font-size: 12px;
  color: #059669;
  font-weight: 700;
}

.comment-text-box {
  margin-bottom: 8px;
  padding-left: 46px;
}

.comment-text {
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
}

.comment-media-box {
  padding-left: 46px;
  margin-bottom: 8px;
}

.comment-moment-img {
  width: 120px;
  height: 120px;
  border-radius: 8px;
}

.comment-video {
  width: 180px;
  height: 120px;
  border-radius: 8px;
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
  color: #111827;
}

.sub-reply-to {
  color: #9CA3AF;
  font-size: 12px;
}

.sub-target {
  color: #059669;
  font-weight: 600;
}

.sub-colon {
  color: #6B7280;
}

.sub-content {
  color: #4B5563;
}

.empty-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  gap: 8px;
}

.empty-icon {
  font-size: 32px;
}

.empty-text {
  font-size: 13px;
  color: #9CA3AF;
}

.bottom-spacer {
  height: 90px;
}

.reply-input-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  padding: 10px 16px 24px 16px;
  border-top: 1px solid #F1F5F9;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.04);
  z-index: 998;
}

.reply-target-strip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #E6F4EA;
  padding: 6px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.target-text {
  font-size: 12px;
  color: #059669;
  font-weight: 700;
}

.cancel-target {
  font-size: 12px;
  color: #DC2626;
}

.attach-media-preview {
  position: relative;
  display: inline-block;
  margin-bottom: 8px;
}

.attach-img {
  width: 60px;
  height: 60px;
  border-radius: 8px;
}

.attach-video {
  width: 90px;
  height: 60px;
  border-radius: 8px;
}

.remove-attach-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #DC2626;
  color: #FFFFFF;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  text-align: center;
  line-height: 18px;
  font-size: 11px;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.media-icon-btns {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  font-size: 20px;
}

.reply-input {
  flex: 1;
  height: 38px;
  background: #F3F4F6;
  border-radius: 19px;
  padding: 0 16px;
  font-size: 14px;
  color: #111827;
}

.send-btn {
  background: #E5E7EB;
  color: #9CA3AF;
  font-size: 13px;
  font-weight: 800;
  border-radius: 19px;
  padding: 0 16px;
  height: 38px;
  line-height: 38px;
  border: none;
}

.send-btn.active {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}
</style>
