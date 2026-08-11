import { state } from '@/store/community'

const BASE_URL = 'http://localhost:8080/api/v1'

const request = (url, method = 'GET', data = {}) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': state.userToken ? `Bearer ${state.userToken}` : '',
        'X-Site-Id': state.currentCommunity.id || 'site_comm_001' // 🔥 全局请求自动附带站点 ID Header
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          resolve(res.data.data)
        } else {
          console.warn('API 返回非 200 或业务错误:', res.data)
          resolve(null)
        }
      },
      fail: (err) => {
        console.error('API 请求网络失败:', err)
        resolve(null)
      }
    })
  })
}

// 微信授权登录 code2session
export const apiWxLogin = (code) => {
  return request('/user/wx-login', 'POST', { code })
}

// 获取用户发帖数与回复数真实统计
export const apiGetUserStats = (openId) => {
  return request(`/user/stats?openId=${openId}`, 'GET')
}

// 更新用户微信 Profile 扩展资料
export const apiUpdateProfile = (profileData) => {
  return request('/user/update-profile', 'POST', {
    openId: state.currentUser.openId || state.currentUser.id,
    ...profileData
  })
}

// 微信手机号授权解密
export const apiBindPhone = (phoneCode, phone = '') => {
  return request('/user/bind-phone', 'POST', {
    openId: state.currentUser.openId || state.currentUser.id,
    phoneCode,
    phone
  })
}

// 获取多站点社区帖子列表 (支持根据当前选中的 siteId 数据隔离)
export const apiGetPostList = (categoryKey = 'ALL', siteId = '') => {
  const currentSiteId = siteId || state.currentCommunity.id || 'site_comm_001'
  return request(`/posts?category=${categoryKey}&siteId=${currentSiteId}`, 'GET')
}

// 获取帖子详情
export const apiGetPostDetail = (id) => {
  return request(`/posts/${id}`, 'GET')
}

// 发布新帖子 (带上当前小区的站点 siteId)
export const apiCreatePost = (postData) => {
  const currentSiteId = state.currentCommunity.id || 'site_comm_001'
  return request('/posts', 'POST', {
    siteId: currentSiteId,
    authorId: state.currentUser.openId || state.currentUser.id,
    authorName: state.currentUser.nickname,
    authorAvatar: state.currentUser.avatar,
    building: state.currentUser.building ? `${state.currentUser.building} ${state.currentUser.room || ''}` : '5栋 302',
    ...postData
  })
}

// 删除动态帖子 (需校验作者 OpenID)
export const apiDeletePost = (id) => {
  const currentOpenId = state.currentUser.openId || state.currentUser.id
  return request(`/posts/${id}?openId=${currentOpenId}`, 'DELETE')
}

// 获取评论列表
export const apiGetComments = (postId) => {
  return request(`/posts/${postId}/comments`, 'GET')
}

// 发表评论回复
export const apiCreateComment = (commentData) => {
  return request('/comments', 'POST', {
    authorId: state.currentUser.openId || state.currentUser.id,
    authorName: state.currentUser.nickname,
    authorAvatar: state.currentUser.avatar,
    ...commentData
  })
}

export const apiAddComment = apiCreateComment

// 删除评论楼层
export const apiDeleteComment = (commentId) => {
  const currentOpenId = state.currentUser.openId || state.currentUser.id
  return request(`/comments/${commentId}?openId=${currentOpenId}`, 'DELETE')
}

// 提交违规举报 (自动附带站点 siteId)
export const apiReportContent = (reportData) => {
  const currentSiteId = state.currentCommunity.id || 'site_comm_001'
  return request('/reports', 'POST', {
    siteId: currentSiteId,
    reporterId: state.currentUser.openId || state.currentUser.id,
    ...reportData
  })
}
