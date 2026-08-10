const BASE_URL = 'http://localhost:8080/api/v1'

const request = (url, method, data) => {
  return new Promise((resolve) => {
    uni.request({
      url: `${BASE_URL}${url}`,
      method: method,
      data: data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': uni.getStorageSync('userToken') ? `Bearer ${uni.getStorageSync('userToken')}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          resolve(res.data.data)
        } else {
          resolve(null)
        }
      },
      fail: () => {
        resolve(null)
      }
    })
  })
}

// 微信登录 code2session
export const apiWxLogin = (code) => request('/user/wx-login', 'POST', { code })

// 同步更新用户 Profile
export const apiUpdateProfile = (profileData) => request('/user/update-profile', 'POST', profileData)

// 微信一键手机号授权绑定 API
export const apiBindPhone = (phoneCode, phone = '') => request('/user/bind-phone', 'POST', { phoneCode, phone })

// 获取帖子 Feed 列表
export const apiGetPostList = (category = 'ALL') => request(`/posts?category=${category}`, 'GET')

// 获取帖子详情
export const apiGetPostDetail = (id) => request(`/posts/${id}`, 'GET')

// 发布新动态
export const apiCreatePost = (postData) => request('/posts', 'POST', postData)

// 获取帖子跟帖评论楼层
export const apiGetComments = (postId) => request(`/posts/${postId}/comments`, 'GET')

// 发表跟帖评论
export const apiAddComment = (commentData) => request('/comments', 'POST', commentData)
