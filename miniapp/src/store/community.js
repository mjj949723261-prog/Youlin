import { reactive } from 'vue'
import { apiWxLogin, apiUpdateProfile } from '@/utils/api'

// 使用 Vue3 标准 reactive 实现集中式状态 Store，免去依赖兼容困扰
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
    nickname: '张先生',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    building: '5栋',
    room: '302',
    isOwner: true,
    roleTag: '本小区住户'
  },
  isLoggedIn: false,
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
  const initWxAuth = async () => {
    return new Promise((resolve) => {
      // #ifdef MP-WEIXIN
      uni.login({
        provider: 'weixin',
        success: async (res) => {
          if (res.code) {
            console.log('微信静默登录 code:', res.code)
            const loginRes = await apiWxLogin(res.code)
            if (loginRes) {
              state.userToken = loginRes.token || ''
              state.isLoggedIn = true
              if (loginRes.userInfo) {
                Object.assign(state.currentUser, loginRes.userInfo)
              }
            }
          }
          resolve(true)
        },
        fail: () => resolve(false)
      })
      // #endif
      // #ifndef MP-WEIXIN
      state.isLoggedIn = true
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
    initWxAuth,
    syncWxProfile,
    switchCommunity
  }
}
