<template>
  <view v-if="visible" class="modal-overlay" @click.stop>
    <view class="modal-card" @click.stop>
      <view class="modal-header">
        <text class="app-icon">🏡</text>
        <text class="modal-title">获取微信公开信息</text>
        <text class="modal-sub">【这儿有邻】申请获取您的微信公开信息（昵称、头像、地区）用于完善社区住户名片</text>
      </view>

      <view class="modal-body">
        <view class="profile-preview-box">
          <image class="preview-avatar" :src="communityState.currentUser.avatar || defaultAvatar" mode="aspectFill" />
          <view class="preview-info">
            <text class="preview-name">{{ communityState.currentUser.nickname || '微信住户' }}</text>
            <text class="preview-tip">点击下方按钮授权同步真实微信资料</text>
          </view>
        </view>
      </view>

      <view class="modal-footer">
        <button class="skip-btn" @click="onSkip">暂不授权</button>
        <button class="auth-btn" @click="onAuthorizeUserProfile">
          <text class="wx-auth-icon">💬</text>
          <text class="auth-btn-text">一键授权微信资料</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useCommunityStore, state as communityState } from '@/store/community'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'saved'])
const communityStore = useCommunityStore()

const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'

const onSkip = () => {
  emit('close')
}

// 核心手势触发：用户点击直接调用 uni.getUserProfile 调起微信官方授权弹窗！
const onAuthorizeUserProfile = () => {
  uni.getUserProfile({
    desc: '用于完善社区住户名片资料',
    success: async (res) => {
      if (res.userInfo) {
        uni.showLoading({ title: '正在同步微信资料...' })
        const { nickName, avatarUrl, city, province, gender } = res.userInfo
        
        await communityStore.syncWxProfile(nickName, avatarUrl)
        
        uni.hideLoading()
        uni.showToast({ title: '微信资料成功同步！', icon: 'success' })
        emit('saved', res.userInfo)
        emit('close')
      }
    },
    fail: (err) => {
      console.log('用户取消授权或授权失败:', err)
      uni.showToast({ title: '未完成授权，可稍后在设置中同步', icon: 'none' })
      emit('close')
    }
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.modal-card {
  background: #FFFFFF;
  border-radius: 28px;
  width: 100%;
  max-width: 320px;
  padding: 28px 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.modal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-bottom: 20px;
  text-align: center;
}

.app-icon {
  font-size: 32px;
}

.modal-title {
  font-size: 19px;
  font-weight: 800;
  color: #111827;
}

.modal-sub {
  font-size: 12px;
  color: #6B7280;
  line-height: 1.5;
  margin-top: 4px;
}

.modal-body {
  width: 100%;
  margin-bottom: 24px;
}

.profile-preview-box {
  background: #F0F7F4;
  border-radius: 16px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 2px solid #10B981;
}

.preview-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.preview-name {
  font-size: 15px;
  font-weight: 800;
  color: #111827;
}

.preview-tip {
  font-size: 11px;
  color: #059669;
}

.modal-footer {
  width: 100%;
  display: flex;
  gap: 10px;
}

.skip-btn {
  flex: 1;
  background: #F3F4F6;
  color: #6B7280;
  font-size: 13px;
  font-weight: 700;
  border-radius: 20px;
  padding: 12px 0;
  line-height: 1.4;
  border: none;
}

.auth-btn {
  flex: 2;
  background: linear-gradient(135deg, #07C160 0%, #059669 100%);
  border-radius: 20px;
  padding: 12px 0;
  line-height: 1.4;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 4px 14px rgba(7, 193, 96, 0.35);
}

.wx-auth-icon {
  font-size: 16px;
  color: #FFFFFF;
}

.auth-btn-text {
  font-size: 14px;
  font-weight: 800;
  color: #FFFFFF;
}
</style>
