import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiWxLogin, apiUpdateProfile } from '@/utils/api'

export const useCommunityStore = defineStore('community', () => {
  const currentCommunity = ref({
    id: 'comm_001',
    name: '云彩之城',
    subDistrictId: 'sub_101',
    subDistrictName: '新塘街道彩虹社区',
    building: '云彩之城 1期'
  })

  const currentUser = ref({
    id: 'usr_888',
    nickname: '张先生',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    building: '5栋',
    room: '302',
    isOwner: true,
    roleTag: '本小区住户'
  })

  const isLoggedIn = ref(false)
  const userToken = ref('')

  const myCommunities = ref([
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
  ])

  // 小程序进入时静默调用 uni.login
  const initWxAuth = async () => {
    return new Promise((resolve) => {
      // #ifdef MP-WEIXIN
      uni.login({
        provider: 'weixin',
        success: async (res) => {
          if (res.code) {
            console.log('微信静默登录获取 code 成功:', res.code)
            const loginRes = await apiWxLogin(res.code)
            if (loginRes) {
              userToken.value = loginRes.token || ''
              isLoggedIn.value = true
              if (loginRes.userInfo) {
                currentUser.value = { ...currentUser.value, ...loginRes.userInfo }
              }
            }
          }
          resolve(true)
        },
        fail: (err) => {
          console.log('微信登录授权 fail:', err)
          resolve(false)
        }
      })
      // #endif
      // #ifndef MP-WEIXIN
      isLoggedIn.value = true
      resolve(true)
      // #endif
    })
  }

  // 手动更新同步微信头像与昵称
  const syncWxProfile = async (newNickname, newAvatar) => {
    if (newNickname) currentUser.value.nickname = newNickname
    if (newAvatar) currentUser.value.avatar = newAvatar

    await apiUpdateProfile({
      nickname: currentUser.value.nickname,
      avatar: currentUser.value.avatar
    })
  }

  const switchCommunity = (community) => {
    currentCommunity.value = community
  }

  return {
    currentCommunity,
    currentUser,
    isLoggedIn,
    userToken,
    myCommunities,
    initWxAuth,
    syncWxProfile,
    switchCommunity
  }
})
