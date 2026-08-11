<template>
  <view v-if="visible" class="modal-overlay" @click.stop="onClose">
    <view class="modal-card" @click.stop>
      <view class="modal-header">
        <text class="modal-icon">📱</text>
        <text class="modal-title">实名社区合规绑定</text>
      </view>

      <view class="modal-body">
        <text class="body-tip">遵从国家《网络跟帖评论服务管理规定》，在【这儿有邻】社区内发帖、发表回复与申请认证前，需完成基于手机号的实名身份绑定。</text>
        <view class="priv-box">
          <text class="priv-icon">🔒</text>
          <text class="priv-text">您的手机号仅用于社区实名校验与物业身份核对，平台严格保护隐私安全。</text>
        </view>
      </view>

      <view class="modal-footer">
        <button class="cancel-btn" @click="onClose">暂不绑定</button>

        <button
          class="auth-phone-btn"
          open-type="getPhoneNumber"
          @getphonenumber="onGetPhoneNumber"
        >
          <text class="auth-btn-text">一键授权绑定手机号</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { useCommunityStore } from '@/store/community'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'success'])
const communityStore = useCommunityStore()

const onClose = () => {
  emit('close')
}

const onGetPhoneNumber = async (e) => {
  uni.showLoading({ title: '绑定中...' })
  let phoneStr = ''
  let phoneCode = ''
  if (e.detail) {
    if (e.detail.phoneNumber || e.detail.purePhoneNumber) phoneStr = e.detail.phoneNumber || e.detail.purePhoneNumber
    if (e.detail.code) phoneCode = e.detail.code
  }
  const boundPhone = await communityStore.bindWxPhone(phoneCode, phoneStr)
  uni.hideLoading()
  if (boundPhone) {
    uni.showToast({ title: `绑定成功: ${boundPhone}`, icon: 'success' })
    emit('success', boundPhone)
    emit('close')
  } else {
    uni.showToast({ title: '绑定失败，请稍后重试', icon: 'none' })
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.modal-card {
  background: #FFFFFF;
  border-radius: 24px;
  width: 100%;
  max-width: 320px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.modal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.modal-icon {
  font-size: 36px;
}

.modal-title {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
}

.modal-body {
  margin-bottom: 24px;
}

.body-tip {
  font-size: 13px;
  color: #4B5563;
  line-height: 1.6;
  display: block;
  margin-bottom: 12px;
  text-align: center;
}

.priv-box {
  background: #F0F7F4;
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.priv-icon {
  font-size: 12px;
}

.priv-text {
  font-size: 11px;
  color: #059669;
  line-height: 1.4;
}

.modal-footer {
  width: 100%;
  display: flex;
  gap: 12px;
}

.cancel-btn {
  flex: 1;
  background: #F3F4F6;
  color: #6B7280;
  font-size: 13px;
  font-weight: 700;
  border-radius: 16px;
  padding: 10px 0;
  line-height: 1.4;
  border: none;
}

.auth-phone-btn {
  flex: 2;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  border-radius: 16px;
  padding: 10px 0;
  line-height: 1.4;
  border: none;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.auth-btn-text {
  font-size: 13px;
  font-weight: 800;
  color: #FFFFFF;
}
</style>
