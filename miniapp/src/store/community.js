import { reactive } from 'vue'
import { apiWxLogin, apiUpdateProfile } from '@/utils/api'

// 检查离线缓存是否已有已登录标记
const hasLoggedInStorage = uni.getStorageSync('hasLoggedIn') === true

export const state = reactive({
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
  isLoggedIn: hasLoggedInStorage,
  showLoginModal: !hasLoggedInStorage, // 如果未登录，严格保持显示弹窗阻断
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
    uni.setStorageSync('hasLoggedIn', true)
  }

  // 必须用户手动点击微信登录按钮才触发调用
  const performWxLogin = async () => {
    return new Promise((resolve) => {
      // #ifdef MP-WEIXIN
      uni.login({
        provider: 'weixin',
        success: async (res) => {
          if (res.code) {
            console.log('微信登录 code:', res.code)
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

  const clearLoginState = () => {
    uni.removeStorageSync('hasLoggedIn')
    uni.removeStorageSync('userToken')
    state.isLoggedIn = false
    state.showLoginModal = true
    uni.showToast({ title: '已重置登录信息，请重新登录', icon: 'none' })
  }

  const syncWxProfile = async (newNickname, newAvatar) => {
    if (newNickname) state.currentUser.nickname = newNickname
    if (newAvatar) state.currentUser.avatar = newAvatar

    try {
      await apiUpdateProfile({
        nickname: state.currentUser.nickname,
        avatar: state.currentUser.avatar
      })
    } catch (e) {
      console.warn('同步头像失败降级', e)
    }
  }

  const switchCommunity = (community) => {
    state.currentCommunity = community
  }

  return {
    state,
    currentUser: state.currentUser,
    currentCommunity: state.currentCommunity,
    myCommunities: state.myCommunities,
    performWxLogin,
    initWxAuth: performWxLogin,
    clearLoginState,
    setSuccessState,
    syncWxProfile,
    switchCommunity
  }
}
