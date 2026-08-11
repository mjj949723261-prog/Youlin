import { reactive } from 'vue'
import { apiWxLogin, apiUpdateProfile, apiBindPhone } from '@/utils/api'

const hasLoggedInStorage = uni.getStorageSync('hasLoggedIn') === true

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
    nickname: hasLoggedInStorage ? (uni.getStorageSync('userName') || '微信用户_8888') : '未登录游客',
    avatar: hasLoggedInStorage ? (uni.getStorageSync('userAvatar') || 'https://thirdwx.qlogo.cn/mmopen/vi_32/POGEflWWzs7gHrzHF6j86yA5n58qG8eY563n/132') : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    building: hasLoggedInStorage ? '5栋' : '未绑定门牌',
    room: hasLoggedInStorage ? '302' : '',
    isOwner: hasLoggedInStorage,
    roleTag: hasLoggedInStorage ? '本小区住户' : '游客身份',
    phone: hasLoggedInStorage ? (uni.getStorageSync('userPhone') || '') : '',
    city: uni.getStorageSync('userCity') || '广东·深圳',
    province: uni.getStorageSync('userProvince') || '广东',
    gender: uni.getStorageSync('userGender') || 1
  },
  isLoggedIn: hasLoggedInStorage,
  showLoginModal: !hasLoggedInStorage,
  userToken: uni.getStorageSync('userToken') || '',
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

    // 点击微信登录瞬间，全自动同步带出头像与昵称
    const defaultNickname = '微信用户_' + Math.floor(1000 + Math.random() * 9000)
    state.currentUser.nickname = (userInfo && userInfo.nickname) ? userInfo.nickname : (uni.getStorageSync('userName') || defaultNickname)
    state.currentUser.avatar = (userInfo && userInfo.avatar) ? userInfo.avatar : (uni.getStorageSync('userAvatar') || 'https://thirdwx.qlogo.cn/mmopen/vi_32/POGEflWWzs7gHrzHF6j86yA5n58qG8eY563n/132')
    state.currentUser.phone = (userInfo && userInfo.phone) ? userInfo.phone : (uni.getStorageSync('userPhone') || '')
    state.currentUser.city = (userInfo && userInfo.city) ? userInfo.city : (uni.getStorageSync('userCity') || '广东·深圳')
    state.currentUser.building = '5栋'
    state.currentUser.room = '302'
    state.currentUser.roleTag = '本小区住户'
    state.currentUser.isOwner = true

    uni.setStorageSync('hasLoggedIn', true)
    if (state.currentUser.nickname) uni.setStorageSync('userName', state.currentUser.nickname)
    if (state.currentUser.avatar) uni.setStorageSync('userAvatar', state.currentUser.avatar)
    if (state.currentUser.phone) uni.setStorageSync('userPhone', state.currentUser.phone)
    if (state.currentUser.city) uni.setStorageSync('userCity', state.currentUser.city)
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

  // 调起 uni.getUserProfile / wx.getUserProfile 授权读取微信扩展资料
  const fetchUserProfile = async () => {
    return new Promise((resolve) => {
      // #ifdef MP-WEIXIN
      uni.getUserProfile({
        desc: '用于完善社区居民归属地与个人资料',
        success: async (res) => {
          console.log('getUserProfile 成功返回:', res)
          if (res.userInfo) {
            const info = res.userInfo
            if (info.nickName) state.currentUser.nickname = info.nickName
            if (info.avatarUrl) state.currentUser.avatar = info.avatarUrl
            if (info.city || info.province) {
              state.currentUser.city = `${info.province || ''}·${info.city || ''}`
            }
            if (info.gender !== undefined) state.currentUser.gender = info.gender

            uni.setStorageSync('userName', state.currentUser.nickname)
            uni.setStorageSync('userAvatar', state.currentUser.avatar)
            uni.setStorageSync('userCity', state.currentUser.city)

            await apiUpdateProfile({
              nickname: state.currentUser.nickname,
              avatar: state.currentUser.avatar,
              city: info.city,
              province: info.province,
              gender: info.gender
            })
          }
          resolve(true)
        },
        fail: (err) => {
          console.warn('getUserProfile 调用或拒绝对接:', err)
          resolve(false)
        }
      })
      // #endif
      // #ifndef MP-WEIXIN
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
        uni.setStorageSync('userPhone', updatedUser.phone)
        return updatedUser.phone
      }
    } catch (e) {
      console.error('绑定手机号失败:', e)
    }
    return state.currentUser.phone || ''
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
    if (newNickname) {
      state.currentUser.nickname = newNickname
      uni.setStorageSync('userName', newNickname)
    }
    if (newAvatar) {
      state.currentUser.avatar = newAvatar
      uni.setStorageSync('userAvatar', newAvatar)
    }

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
    fetchUserProfile,
    bindWxPhone,
    enterGuestMode,
    openLoginModal,
    clearLoginState,
    setSuccessState,
    syncWxProfile,
    switchCommunity
  }
}
