import { reactive } from 'vue'
import { apiWxLogin, apiUpdateProfile } from '@/utils/api'

// 检查本地持久化存储，防止页面 onShow / 重新加载时状态重置导致弹窗反复跳出
const hasLoggedInStorage = uni.getStorageSync('hasLoggedIn') === true

const state = reactive({
  currentCommunity: {
    id: 'comm_001',
    name: '我的社区',
    subDistrictId: 'sub_101',
    subDistrictName: '社区服务中心',
    building: '1期'
  },
  currentUser: {
    id: 'usr_888',
    nickname: '微信用户',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    building: '5栋',
    room: '302',
    isOwner: true,
    roleTag: '本小区住户'
  },
  isLoggedIn: hasLoggedInStorage, // 如果缓存已有登录标记，则直接为 true
  showLoginModal: !hasLoggedInStorage, // 如果已登录，不再显示弹窗
  userToken: uni.getStorageSync('userToken') || '',
  myCommunities: [
    {
      id: 'comm_001',
      name: '我的社区 1期',
      subDistrictId: 'sub_101',
      subDistrictName: '社区服务中心',
      building: '5栋 302室'
    }
  ]
})

export const useCommunityStore = () => {
  // 点击微信一键登录
  const performWxLogin = async () => {
    return new Promise((resolve) => {
      // 成功登录后持久化记录，防止弹窗再次跳出
      const setSuccessState = (token = '', userInfo = null) => {
        state.isLoggedIn = true
        state.showLoginModal = false
        if (token) {
          state.userToken = token
          uni.setStorageSync('userToken', token)
        }
        if (userInfo) {
          Object.assign(state.currentUser, userInfo)
        }
        // 本地永久记录已登录状态
        uni.setStorageSync('hasLoggedIn', true)
      }

      // #ifdef MP-WEIXIN
      uni.login({
        provider: 'weixin',
        success: async (res) => {
          if (res.code) {
            console.log('微信登录获取 code 成功:', res.code)
            const loginRes = await apiWxLogin(res.code)
            if (loginRes) {
              setSuccessState(loginRes.token, loginRes.userInfo)
            } else {
              setSuccessState()
            }
          } else {
            setSuccessState()
          }
          resolve(true)
        },
        fail: () => {
          setSuccessState()
          resolve(false)
        }
      })
      // #endif
      // #ifndef MP-WEIXIN
      setSuccessState()
      resolve(true)
      // #endif
    })
  }

  const syncWxProfile = async (newNickname, newAvatar) => {
    if (newNickname) state.currentUser.nickname = newNickname
    if (newAvatar) state.currentUser.avatar = newAvatar

    await apiUpdateProfile({
      nickname: state.currentUser.nickname,
      avatar: state.currentUser.avatar
    })
  }

  const switchCommunity = (community) => {
    state.currentCommunity = community
  }

  return {
    ...state,
    currentUser: state.currentUser,
    currentCommunity: state.currentCommunity,
    myCommunities: state.myCommunities,
    performWxLogin,
    syncWxProfile,
    switchCommunity
  }
}
