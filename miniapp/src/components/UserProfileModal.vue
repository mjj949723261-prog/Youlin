<template>
  <view v-if="visible" class="modal-overlay" @click.stop>
    <view class="modal-card" @click.stop>
      <view class="modal-header">
        <text class="modal-title">完善微信个人资料</text>
        <text class="modal-sub">依照微信官方规则，请授权设置您的头像与昵称</text>
      </view>

      <view class="modal-body">
        <!-- 1. 微信原生头像选择区域 -->
        <view class="avatar-choose-box">
          <button class="choose-avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
            <image class="preview-avatar" :src="currentAvatar" mode="aspectFill" />
            <view class="camera-badge">
              <text class="camera-icon">📷</text>
            </view>
          </button>
          <text class="choose-tip">点击更换微信头像</text>
        </view>

        <!-- 2. 微信原生昵称快捷填入输入框 -->
        <view class="input-group">
          <text class="input-label">社区昵称</text>
          <input
            type="nickname"
            v-model="inputNickname"
            class="nickname-input"
            placeholder="点击调起微信快捷昵称"
            @blur="onNicknameBlur"
          />
        </view>
      </view>

      <view class="modal-footer">
        <button class="skip-btn" @click="onSkip">暂不设置</button>
        <button class="save-btn" @click="onSaveProfile">确认保存资料</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'
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
const currentAvatar = ref(defaultAvatar)
const inputNickname = ref('')

watch(() => props.visible, (newVal) => {
  if (newVal) {
    currentAvatar.value = communityState.currentUser.avatar || defaultAvatar
    inputNickname.value = communityState.currentUser.nickname || '微信用户'
  }
})

// 接收微信原生 chooseAvatar 回调
const onChooseAvatar = (e) => {
  if (e.detail && e.detail.avatarUrl) {
    currentAvatar.value = e.detail.avatarUrl
    uni.showToast({ title: '已选中微信头像', icon: 'success' })
  }
}

const onNicknameBlur = (e) => {
  if (e.detail && e.detail.value) {
    inputNickname.value = e.detail.value
  }
}

const onSkip = () => {
  emit('close')
}

const onSaveProfile = async () => {
  const name = inputNickname.value.trim() || '微信住户'
  const avatar = currentAvatar.value
  
  uni.showLoading({ title: '保存中...' })
  await communityStore.syncWxProfile(name, avatar)
  uni.hideLoading()

  uni.showToast({ title: '个人资料已更新！', icon: 'success' })
  emit('saved', { name, avatar })
  emit('close')
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
  margin-bottom: 24px;
  text-align: center;
}

.modal-title {
  font-size: 19px;
  font-weight: 800;
  color: #111827;
}

.modal-sub {
  font-size: 12px;
  color: #6B7280;
  line-height: 1.4;
}

.modal-body {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
}

.avatar-choose-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.choose-avatar-btn {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  padding: 0;
  background: transparent;
  border: none;
  line-height: 1;
  overflow: visible;
}

.choose-avatar-btn::after {
  border: none;
}

.preview-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #10B981;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
}

.camera-badge {
  position: absolute;
  right: 0;
  bottom: 0;
  background: #10B981;
  border: 2px solid #FFFFFF;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-icon {
  font-size: 12px;
  line-height: 1;
}

.choose-tip {
  font-size: 12px;
  font-weight: 700;
  color: #059669;
}

.input-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
}

.nickname-input {
  width: 100%;
  height: 44px;
  background: #F3F4F6;
  border-radius: 14px;
  padding: 0 16px;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  box-sizing: border-box;
}

.modal-footer {
  width: 100%;
  display: flex;
  gap: 12px;
}

.skip-btn {
  flex: 1;
  background: #F3F4F6;
  color: #6B7280;
  font-size: 14px;
  font-weight: 700;
  border-radius: 20px;
  padding: 12px 0;
  line-height: 1.4;
  border: none;
}

.save-btn {
  flex: 2;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 800;
  border-radius: 20px;
  padding: 12px 0;
  line-height: 1.4;
  border: none;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
}
</style>
