import { reactive } from 'vue'
import { apiWxLogin, apiUpdateProfile } from '@/utils/api'

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
  showLoginModal: !hasLoggedInStorage,
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

  const performWxLogin = async () => {
    return new Promise((resolve) => {
      // 容错安全包装，全面防御 tourist appid 游客模式
      try {
        // #ifdef MP-WEIXIN
        uni.login({
          provider: 'weixin',
          success: async (res) => {
            if (res.code) {
              try {
                const loginRes = await apiWxLogin(res.code)
                if (loginRes) {
                  setSuccessState(loginRes.token, loginRes.userInfo)
                } else {
                  setSuccessState()
                }
              } catch (e) {
                setSuccessState()
              }
            } else {
              setSuccessState()
            }
            resolve(true)
          },
          fail: (err) => {
            // 防御微信游客模式 (tourist appid) 不支持 wx.login 限制
            console.warn('游客模式或未配置AppID，已降级为演示登录:', err)
            setSuccessState()
            resolve(true)
          }
        })
        // #endif
        // #ifndef MP-WEIXIN
        setSuccessState()
        resolve(true)
        // #endif
      } catch (e) {
        console.warn('登录异常捕获:', e)
        setSuccessState()
        resolve(true)
      }
    })
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
    setSuccessState,
    syncWxProfile,
    switchCommunity
  }
}
