<script>
import { useCommunityStore } from '@/store/community'

export default {
  onLaunch: function () {
    console.log('App Launch - 这儿有邻 社区小程序启动')
    
    // 进入小程序时尝试初始化微信登录授权
    const communityStore = useCommunityStore()
    if (typeof communityStore.initWxAuth === 'function') {
      communityStore.initWxAuth()
    } else if (typeof communityStore.performWxLogin === 'function') {
      communityStore.performWxLogin()
    }
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  }
}
</script>

<style>
/* 每个页面公共 CSS */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background-color: #F0F7F4;
  color: #111827;
}

button::after {
  border: none;
}
</style>
