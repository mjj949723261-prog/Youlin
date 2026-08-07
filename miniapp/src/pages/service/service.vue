<template>
  <view class="service-container">
    <!-- 1. 顶部服务大厅 Header -->
    <view class="service-header-card" :style="{ paddingTop: (statusBarHeight + 16) + 'px' }">
      <view class="header-top">
        <view class="location-box">
          <text class="location-icon">📍</text>
          <text class="location-name">{{ communityStore.currentCommunity.name }} · 服务大厅</text>
        </view>
        <text class="sub-district-tag">新塘街道彩虹社区</text>
      </view>

      <view class="weather-strip">
        <text class="weather-text">☀️ 今日 28°C 晴朗 · 宜邻里出行与公区活动</text>
      </view>
    </view>

    <!-- 可滚动主体服务区 -->
    <scroll-view scroll-y class="service-body">
      
      <!-- 2. 核心物业增值服务金刚区 (后续收费/定制卖点入口) -->
      <view class="section-card">
        <view class="section-header">
          <text class="section-title">物业与智慧开门</text>
          <text class="paid-badge">定制收费项目</text>
        </view>

        <view class="quick-grid">
          <view class="grid-item" @click="onServiceClick('智能门禁', '手机蓝牙一键开门、生成访客密码通行码')">
            <view class="icon-wrapper green">
              <text class="grid-icon">🔑</text>
            </view>
            <text class="grid-label">智能门禁</text>
            <text class="grid-sub">蓝牙/访客码</text>
          </view>

          <view class="grid-item" @click="onServiceClick('物业缴费', '在线缴纳物业费、水电气费及月租车位费')">
            <view class="icon-wrapper blue">
              <text class="grid-icon">💳</text>
            </view>
            <text class="grid-label">物业缴费</text>
            <text class="grid-sub">查账单/缴费</text>
          </view>

          <view class="grid-item" @click="onServiceClick('在线报修', '公区设施报修、居家维修提交及工单进度跟踪')">
            <view class="icon-wrapper orange">
              <text class="grid-icon">🛠️</text>
            </view>

            <text class="grid-label">在线报修</text>
            <text class="grid-sub">管家响应</text>
          </view>

          <view class="grid-item" @click="onServiceClick('业委会决策', '小区公共收益公示、业委会表决与邻里议事')">
            <view class="icon-wrapper purple">
              <text class="grid-icon">🗳️</text>
            </view>
            <text class="grid-label">业委会决策</text>
            <text class="grid-sub">在线投票表决</text>
          </view>
        </view>
      </view>

      <!-- 3. 社区政务与公共服务区 -->
      <view class="section-card">
        <view class="section-header">
          <text class="section-title">彩虹社区政务与便民</text>
          <text class="header-more" @click="onServiceClick('政务大厅', '彩虹社区便民服务中心')">更多 ›</text>
        </view>

        <view class="list-services">
          <view class="service-row-item" @click="onServiceClick('社区办事指南', '居住证办理、高龄津贴申请、户籍政策')">
            <view class="row-left">
              <text class="row-icon">📋</text>
              <view class="row-info">
                <text class="row-title">社区办事指南</text>
                <text class="row-desc">居住证、高龄津贴申请流程与材料清单</text>
              </view>
            </view>
            <text class="arrow">›</text>
          </view>

          <view class="service-row-item" @click="onServiceClick('网格员直通车', '一键联系彩虹社区第三网格员')">
            <view class="row-left">
              <text class="row-icon">👮</text>
              <view class="row-info">
                <text class="row-title">网格员直通车</text>
                <text class="row-desc">彩虹社区第3网格员 微信/电话直连</text>
              </view>
            </view>
            <text class="arrow">›</text>
          </view>

          <view class="service-row-item" @click="onServiceClick('社区卫生站', '云彩之城社区卫生服务站及疫苗接种预约')">
            <view class="row-left">
              <text class="row-icon">🏥</text>
              <view class="row-info">
                <text class="row-title">社区卫生服务站</text>
                <text class="row-desc">免费体检预约、儿童疫苗接种安排</text>
              </view>
            </view>
            <text class="arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 4. 周边邻里商圈与家政便民区 (未来的商户入驻收费变现入口) -->
      <view class="section-card">
        <view class="section-header">
          <text class="section-title">周边便民与优选商家</text>
          <text class="paid-badge">商户加盟变现</text>
        </view>

        <view class="merchant-grid">
          <view class="merchant-card" @click="onServiceClick('家政清洁', '小区认证家政阿姨，保洁保姆')">
            <text class="m-icon">🧹</text>
            <text class="m-name">邻里家政保洁</text>
            <text class="m-tag">业主认证</text>
          </view>

          <view class="merchant-card" @click="onServiceClick('开锁换锁', '24小时应急开锁换锁，公安备案')">
            <text class="m-icon">🔑</text>
            <text class="m-name">应急开锁换锁</text>
            <text class="m-tag">公安备案</text>
          </view>

          <view class="merchant-card" @click="onServiceClick('生鲜超市', '云彩之城南门生鲜超市，送货上楼')">
            <text class="m-icon">🥦</text>
            <text class="m-name">南门生鲜配送</text>
            <text class="m-tag">送货上门</text>
          </view>

          <view class="merchant-card" @click="onServiceClick('干洗洗护', '羽绒服干洗、鞋履护理')">
            <text class="m-icon">👔</text>
            <text class="m-name">品质干洗店</text>
            <text class="m-tag">免费上门取</text>
          </view>
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCommunityStore } from '@/store/community'

const communityStore = useCommunityStore()
const statusBarHeight = ref(44)

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync()
  if (sysInfo.statusBarHeight) {
    statusBarHeight.value = sysInfo.statusBarHeight
  }
})

// 服务接口点击处理
const onServiceClick = (title, desc) => {
  uni.showModal({
    title: `🛠️ ${title}`,
    content: `${desc}\n\n【悦邻里服务大厅】接口全量预留！可随时对接小区物业、硬件门禁及周边入驻商户。`,
    showCancel: false
  })
}
</script>

<style scoped>
.service-container {
  height: 100vh;
  background-color: #F0F7F4;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}

/* 1. 顶部 Header */
.service-header-card {
  background: linear-gradient(180deg, #10B981 0%, #059669 100%);
  padding: 16px 20px 20px 20px;
  border-radius: 0 0 28px 28px;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.25);
  color: #FFFFFF;
  flex-shrink: 0;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.location-box {
  display: flex;
  align-items: center;
  gap: 6px;
}

.location-icon {
  font-size: 18px;
}

.location-name {
  font-size: 18px;
  font-weight: 800;
  color: #FFFFFF;
}

.sub-district-tag {
  font-size: 11px;
  background: rgba(255, 255, 255, 0.2);
  padding: 3px 8px;
  border-radius: 12px;
  color: #E6F4EA;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.weather-strip {
  background: rgba(0, 0, 0, 0.12);
  padding: 6px 12px;
  border-radius: 12px;
}

.weather-text {
  font-size: 12px;
  color: #E6F4EA;
}

/* 2. 滚动区 */
.service-body {
  flex: 1;
  height: 0;
  padding: 16px;
  box-sizing: border-box;
}

.section-card {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 18px;
  margin-bottom: 14px;
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.section-title {
  font-size: 16px;
  font-weight: 800;
  color: #111827;
}

.paid-badge {
  font-size: 10px;
  font-weight: 700;
  color: #D97706;
  background: #FEF3C7;
  padding: 2px 6px;
  border-radius: 4px;
}

.header-more {
  font-size: 12px;
  color: #059669;
  font-weight: 600;
}

/* 金刚区 */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.icon-wrapper.green { background: #ECFDF5; }
.icon-wrapper.blue { background: #EFF6FF; }
.icon-wrapper.orange { background: #FFF7ED; }
.icon-wrapper.purple { background: #F5F3FF; }

.grid-icon {
  font-size: 22px;
}

.grid-label {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
}

.grid-sub {
  font-size: 10px;
  color: #9CA3AF;
}

/* 列表服务行 */
.list-services {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.service-row-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 14px;
  background: #F9FAFB;
}

.row-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.row-icon {
  font-size: 24px;
}

.row-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.row-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.row-desc {
  font-size: 11px;
  color: #6B7280;
}

.arrow {
  font-size: 16px;
  color: #9CA3AF;
}

/* 商家网格 */
.merchant-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.merchant-card {
  background: #F9FAFB;
  border-radius: 14px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.m-icon {
  font-size: 22px;
}

.m-name {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
}

.m-tag {
  font-size: 10px;
  color: #059669;
  background: #E6F4EA;
  padding: 1px 6px;
  border-radius: 4px;
  width: fit-content;
}

.bottom-space {
  height: 80px;
}
</style>
