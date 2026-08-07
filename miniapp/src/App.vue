<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('悦邻里 App 启动')
})

onShow(() => {
  console.log('悦邻里 App 显示')
})

onHide(() => {
  console.log('悦邻里 App 隐藏')
})
</script>

<style>
/* 全局规范 - 悦邻里米绿温暖风 */
page {
  background-color: #F0F7F4;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
  color: #111827;
  font-size: 14px;
}

/* 隐藏小程序与 H5 默认滚动条 */
::-webkit-scrollbar {
  display: none;
  width: 0 !important;
  height: 0 !important;
  -webkit-appearance: none;
  background: transparent;
}
</style>
