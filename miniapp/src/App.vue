<script>
export default {
  onLaunch: function () {
    console.log('App Launch - 这儿有邻 社区小程序启动')
    // 保持静默启动，必须等待用户手动点击【微信一键快捷登录】按钮才触发登录
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
