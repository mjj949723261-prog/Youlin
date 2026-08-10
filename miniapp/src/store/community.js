import { reactive } from 'vue'
import { apiWxLogin, apiUpdateProfile } from '@/utils/api'

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
  isLoggedIn: false, // 强制未登录状态
  showLoginModal: true, // 强制弹出全屏微信登录遮罩，必须登录才可以使用
  userToken: '',
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
  // 必须登录才可以使用
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
