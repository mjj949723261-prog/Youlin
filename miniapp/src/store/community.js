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
    id: uni.getStorageSync('userOpenId') || 'usr_guest',
    openId: uni.getStorageSync('userOpenId') || '',
    nickname: hasLoggedInStorage ? (uni.getStorageSync('userName') || '微信用户') : '未登录游客',
    avatar: hasLoggedInStorage ? (uni.getStorageSync('userAvatar') || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250') : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
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
  const setSuccessState = (token = '', userInfo = null, openId = '') => {
    state.isLoggedIn = true
    state.showLoginModal = false
    if (token) {
      state.userToken = token
      uni.setStorageSync('userToken', token)
    }

    if (openId || (userInfo && userInfo.id)) {
      const realOpenId = openId || userInfo.id
      state.currentUser.id = realOpenId
      state.currentUser.openId = realOpenId
      uni.setStorageSync('userOpenId', realOpenId)
    }

    const defaultNickname = '微信邻居_' + Math.floor(1000 + Math.random() * 9000)
    state.currentUser.nickname = (userInfo && userInfo.nickname) ? userInfo.nickname : (uni.getStorageSync('userName') || defaultNickname)
    state.currentUser.avatar = (userInfo && userInfo.avatar) ? userInfo.avatar : (uni.getStorageSync('userAvatar') || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250')
    state.currentUser.phone = (userInfo && userInfo.phone) ? userInfo.phone : (uni.getStorageSync('userPhone') || '')
    state.currentUser.city = (userInfo && userInfo.city) ? userInfo.city : (uni.getStorageSync('userCity') || '广东·深圳')
    state.currentUser.building = '5栋'
    state.currentUser.room = '302'
    state.currentUser.roleTag = '本小区住户'
    state.currentUser.isOwner = true

    console.log('==================================================')
    console.log('✅ [前端 Store 日志] 用户登录与名片状态构建完成:')
    console.log('👤 [真实 OpenID]:', state.currentUser.openId)
    console.log('🏷️ [微信昵称]:', state.currentUser.nickname)
    console.log('🖼️ [微信头像]:', state.currentUser.avatar)
    console.log('📱 [绑定的手机号]:', state.currentUser.phone || '未绑定')
    console.log('==================================================')

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
      console.log('🔍 [登录发起] 正在调用微信官方 uni.login 发起静默鉴权...')
      uni.login({
        provider: 'weixin',
        success: async (res) => {
          console.log('📥 [微信 API 返回 code]:', res.code)
          if (res.code) {
            const loginRes = await apiWxLogin(res.code)
            console.log('📡 [后端响应登录数据]:', JSON.stringify(loginRes))
            if (loginRes) {
              setSuccessState(loginRes.token, loginRes.userInfo, loginRes.openId)
            } else {
              setSuccessState()
            }
          } else {
            setSuccessState()
          }
          resolve(true)
        },
        fail: (err) => {
          console.error('❌ [微信登录接口失败]:', err)
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
      console.log('🔍 [Profile 发起] 正在调起微信官方 uni.getUserProfile 接口...')
      uni.getUserProfile({
        desc: '用于完善社区居民归属地与个人资料',
        success: async (res) => {
          console.log('==================================================')
          console.log('🎉 [微信 getUserProfile 原生返回全量数据]:', res)
          console.log('👤 [微信昵称 nickName]:', res.userInfo.nickName)
          console.log('🖼️ [微信头像 avatarUrl]:', res.userInfo.avatarUrl)
          console.log('📍 [城市 city]:', res.userInfo.city)
          console.log('🗺️ [省份 province]:', res.userInfo.province)
          console.log('==================================================')

          if (res.userInfo) {
            const info = res.userInfo
            if (info.nickName && info.nickName !== '微信用户') {
              state.currentUser.nickname = info.nickName
            }
            if (info.avatarUrl) {
              state.currentUser.avatar = info.avatarUrl
            }
            if (info.city || info.province) {
              state.currentUser.city = `${info.province || ''}·${info.city || ''}`
            }
            if (info.gender !== undefined) {
              state.currentUser.gender = info.gender
            }

            uni.setStorageSync('userName', state.currentUser.nickname)
            uni.setStorageSync('userAvatar', state.currentUser.avatar)
            uni.setStorageSync('userCity', state.currentUser.city)

            await apiUpdateProfile({
              openId: state.currentUser.openId,
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
          console.warn('⚠️ [getUserProfile 调用未授权或返回限制]:', err)
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
      console.log('📱 [发起绑定手机号] phoneCode:', phoneCode, 'phoneStr:', phoneStr)
      const updatedUser = await apiBindPhone(phoneCode, phoneStr)
      console.log('📡 [后端手机号解密结果]:', JSON.stringify(updatedUser))
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
    state.currentUser.openId = ''
    state.currentUser.id = 'usr_guest'
    state.currentUser.nickname = '未登录游客'
    state.currentUser.avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
    state.currentUser.phone = ''
    state.currentUser.roleTag = '游客身份'
    state.currentUser.isOwner = false
    state.showLoginModal = true
    uni.showToast({ title: '已清空登录状态与缓存', icon: 'none' })
  }

  const syncWxProfile = async (newNickname, newAvatar) => {
    console.log('🔄 [手动同步微信资料] 昵称:', newNickname, '头像:', newAvatar)
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
        openId: state.currentUser.openId,
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
