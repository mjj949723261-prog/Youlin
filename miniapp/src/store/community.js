import { reactive } from 'vue'
import { apiWxLogin, apiUpdateProfile } from '@/utils/api'

const state = reactive({
  currentCommunity: {
    id: 'comm_001',
    name: '云彩之城',
    subDistrictId: 'sub_101',
    subDistrictName: '新塘街道彩虹社区',
    building: '云彩之城 1期'
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
  isLoggedIn: false, // 初始未登录状态，触发一键授权弹窗
  showLoginModal: true, // 进入小程序弹窗
  userToken: '',
  myCommunities: [
    {
      id: 'comm_001',
      name: '云彩之城 1期',
      subDistrictId: 'sub_101',
      subDistrictName: '新塘街道彩虹社区',
      building: '5栋 302室 (自住)'
    },
    {
      id: 'comm_002',
      name: '云彩之城 2期',
      subDistrictId: 'sub_101',
      subDistrictName: '新塘街道彩虹社区',
      building: '8栋 1104室 (出租)'
    }
  ]
})

export const useCommunityStore = () => {
  // 点击弹窗微信一键登录
  const performWxLogin = async () => {
    return new Promise((resolve) => {
      // #ifdef MP-WEIXIN
      uni.login({
        provider: 'weixin',
        success: async (res) => {
          if (res.code) {
            console.log('微信登录获取 code 成功:', res.code)
            const loginRes = await apiWxLogin(res.code)
            if (loginRes) {
              state.userToken = loginRes.token || ''
              state.isLoggedIn = true
              state.showLoginModal = false
              if (loginRes.userInfo) {
                Object.assign(state.currentUser, loginRes.userInfo)
              }
            } else {
              state.isLoggedIn = true
              state.showLoginModal = false
            }
          } else {
            state.isLoggedIn = true
            state.showLoginModal = false
          }
          resolve(true)
        },
        fail: () => {
          state.isLoggedIn = true
          state.showLoginModal = false
          resolve(false)
        }
      })
      // #endif
      // #ifndef MP-WEIXIN
      state.isLoggedIn = true
      state.showLoginModal = false
      resolve(true)
      // #endif
    })
  }

  const closeLoginModal = () => {
    state.showLoginModal = false
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
    closeLoginModal,
    syncWxProfile,
    switchCommunity
  }
}
