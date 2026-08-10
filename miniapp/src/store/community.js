import { reactive } from 'vue'
import { apiWxLogin, apiUpdateProfile, apiBindPhone } from '@/utils/api'

// 强制清空小程序前端本地的所有缓存，让用户亲自体验全新流程
try {
  uni.clearStorageSync()
} catch (e) {}

export const state = reactive({
  currentCommunity: {
    id: 'comm_001',
    name: '这儿有邻社区',
    subDistrictId: 'sub_101',
    subDistrictName: '社区服务中心',
    building: '1期'
  },
  currentUser: {
    id: 'usr_guest',
    nickname: '未登录游客',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    building: '未绑定门牌',
    room: '',
    isOwner: false,
    roleTag: '游客身份',
    phone: ''
  },
  isLoggedIn: false, // 初始置为未登录
  showLoginModal: true, // 初始弹窗提示
  userToken: '',
  myCommunities: [
    {
      id: 'comm_001',
      name: '这儿有邻 1期',
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
    state.currentUser.nickname = (userInfo && userInfo.nickname) || '张先生'
    state.currentUser.avatar = (userInfo && userInfo.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
    state.currentUser.phone = (userInfo && userInfo.phone) || '138****8888'
    state.currentUser.building = '5栋'
    state.currentUser.room = '302'
    state.currentUser.roleTag = '本小区住户'
    state.currentUser.isOwner = true
    uni.setStorageSync('hasLoggedIn', true)
    uni.setStorageSync('userPhone', state.currentUser.phone)
  }

  // 微信授权登录
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

  // 绑定微信一键获取手机号 (getPhoneNumber)
  const bindWxPhone = async (phoneCode, phoneStr = '') => {
    try {
      const updatedUser = await apiBindPhone(phoneCode, phoneStr)
      if (updatedUser && updatedUser.phone) {
        state.currentUser.phone = updatedUser.phone
      } else {
        state.currentUser.phone = '138****8888'
      }
    } catch (e) {
      state.currentUser.phone = '138****8888'
    }
    uni.setStorageSync('userPhone', state.currentUser.phone)
    return state.currentUser.phone
  }

  // 进入游客模式
  const enterGuestMode = () => {
    state.showLoginModal = false
    uni.showToast({ title: '已进入游客浏览模式', icon: 'none' })
  }

  // 弹出登录框
  const openLoginModal = () => {
    state.showLoginModal = true
  }

  // 清空/退出登录
  const clearLoginState = () => {
    uni.clearStorageSync()
    state.isLoggedIn = false
    state.currentUser.nickname = '未登录游客'
    state.currentUser.avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
    state.currentUser.phone = ''
    state.currentUser.roleTag = '游客身份'
    state.currentUser.isOwner = false
    state.showLoginModal = true
    uni.showToast({ title: '已清空登录状态与缓存', icon: 'none' })
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
    bindWxPhone,
    enterGuestMode,
    openLoginModal,
    clearLoginState,
    setSuccessState,
    syncWxProfile,
    switchCommunity
  }
}
