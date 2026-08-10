// 友邻 Youlin - Uni-app 统一 API 网络请求封装
const BASE_URL = 'http://localhost:8080/api/v1'

export const request = (options = {}) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          resolve(res.data.data)
        } else {
          const errorMsg = (res.data && res.data.message) || '请求失败'
          uni.showToast({ title: errorMsg, icon: 'none' })
          reject(new Error(errorMsg))
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络连接失败，请检查后端服务', icon: 'none' })
        reject(err)
      }
    })
  })
}

// 核心 API 导出
export const apiGetCurrentCommunity = () => request({ url: '/community/current' })
export const apiGetPostList = (categoryKey = 'ALL') => request({ url: `/posts?categoryKey=${categoryKey}` })
export const apiGetPostDetail = (id) => request({ url: `/posts/${id}` })
export const apiCreatePost = (data) => request({ url: '/posts', method: 'POST', data })
export const apiGetComments = (postId) => request({ url: `/posts/${postId}/comments` })
export const apiAddComment = (data) => request({ url: '/comments', method: 'POST', data })
