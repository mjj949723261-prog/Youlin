import { reactive } from 'vue'
import { apiWxLogin, apiUpdateProfile, apiBindPhone, apiSwitchRole } from '@/utils/api'

// 缓存持久化 Key
const STORAGE_KEY_USER = 'YOULIN_USER_STATE'
const STORAGE_KEY_COMMUNITY = 'YOULIN_CURRENT_COMMUNITY'

// 加载本地持久化缓存
const loadSavedUser = () => {
  try {
    const saved = uni.getStorageSync(STORAGE_KEY_USER)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.error('读取用户缓存失败', e)
  }
  return null
}

const savedUser = loadSavedUser()

// 初始游客默认数据
const guestUser = {
  id: 'usr_guest',
  openId: null,
  nickname: '未登录游客',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
  building: '未绑定',
  room: '',
  isOwner: false,
  roleTag: '👀 游客模式',
  roleCode: 'GUEST',
  phone: null
}

export const state = reactive({
  isLoggedIn: savedUser ? true : false,
  userToken: savedUser ? savedUser.token : null,
  currentUser: savedUser ? savedUser.user : { ...guestUser },
  isLoginModalOpen: false,
  
  // 辖区多站点列表 (一个小区就是一个站点 siteId)
  myCommunities: [
    { id: 'site_comm_001', name: '金翠园小区', building: '5栋 302', isCurrent: true },
    { id: 'site_comm_002', name: '银杉家园小区', building: '2栋 101', isCurrent: false },
    { id: 'site_comm_003', name: '紫薇名苑小区', building: '8栋 605', isCurrent: false }
  ],
  currentCommunity: {
    id: 'site_comm_001',
    name: '金翠园小区',
    building: '5栋',
    room: '302'
  }
})

export function useCommunityStore() {

  const saveStateToStorage = () => {
    try {
      if (state.isLoggedIn) {
        uni.setStorageSync(STORAGE_KEY_USER, JSON.stringify({
          token: state.userToken,
          user: state.currentUser
        }))
      } else {
        uni.removeStorageSync(STORAGE_KEY_USER)
      }
    } catch (e) {
      console.error('写用户缓存失败', e)
    }
  }

  // 1. 微信授权登录鉴权
  const loginWithWxCode = async () => {
    return new Promise((resolve) => {
      uni.login({
        provider: 'weixin',
        success: async (loginRes) => {
          if (loginRes.code) {
            console.log('🔑 [获取到微信登录凭证 code]:', loginRes.code)
            const backendData = await apiWxLogin(loginRes.code)
            if (backendData && backendData.userInfo) {
              state.isLoggedIn = true
              state.userToken = backendData.token
              state.currentUser = {
                ...backendData.userInfo,
                openId: backendData.openId || backendData.userInfo.id,
                roleCode: backendData.userInfo.roleCode || 'OWNER'
              }
              saveStateToStorage()
              resolve(true)
              return
            }
          }
          resolve(false)
        },
        fail: () => resolve(false)
      })
    })
  }

  // 2. 一键切换 5 大角色 (极速体验社区管理者、业委会、物业、商户、业主视角)
  const switchUserRole = async (roleCode) => {
    const targetOpenId = state.currentUser.openId || state.currentUser.id
    const resUser = await apiSwitchRole(targetOpenId, roleCode)
    if (resUser) {
      state.currentUser = {
        ...state.currentUser,
        roleCode: roleCode,
        roleTag: resUser.roleTag
      }
      saveStateToStorage()
      return true
    }
    return false
  }

  // 3. 微信 Profile 同步更新
  const syncWxProfile = async (nickname = null, avatar = null) => {
    if (nickname) state.currentUser.nickname = nickname
    if (avatar) state.currentUser.avatar = avatar
    
    if (state.isLoggedIn) {
      await apiUpdateProfile({ nickname, avatar })
      saveStateToStorage()
    }
  }

  // 4. 手机号绑定
  const bindWxPhone = async (phoneCode, phoneStr = '') => {
    const boundUser = await apiBindPhone(phoneCode, phoneStr)
    if (boundUser && boundUser.phone) {
      state.currentUser.phone = boundUser.phone
      saveStateToStorage()
      return boundUser.phone
    }
    return '159****6666'
  }

  // 5. getUserProfile 扩展资料获取
  const fetchUserProfile = () => {
    return new Promise((resolve) => {
      uni.getUserProfile({
        desc: '用于完善社区住户名片资料',
        success: async (res) => {
          if (res.userInfo) {
            const { nickName, avatarUrl, city, province, gender } = res.userInfo
            state.currentUser.nickname = nickName || state.currentUser.nickname
            state.currentUser.avatar = avatarUrl || state.currentUser.avatar
            state.currentUser.city = city
            state.currentUser.province = province
            
            await apiUpdateProfile({
              nickname: state.currentUser.nickname,
              avatar: state.currentUser.avatar,
              city,
              province,
              gender
            })
            saveStateToStorage()
            resolve(res.userInfo)
          } else {
            resolve(null)
          }
        },
        fail: () => resolve(null)
      })
    })
  }

  // 6. 切换小区站点
  const switchCommunity = (targetComm) => {
    state.currentCommunity = { ...targetComm }
    state.myCommunities.forEach(c => {
      c.isCurrent = c.id === targetComm.id
    })
  }

  const openLoginModal = () => { state.isLoginModalOpen = true }
  const closeLoginModal = () => { state.isLoginModalOpen = false }

  const clearLoginState = () => {
    state.isLoggedIn = false
    state.userToken = null
    state.currentUser = { ...guestUser }
    saveStateToStorage()
    uni.showToast({ title: '已退出登录', icon: 'none' })
  }

  return {
    state,
    currentUser: state.currentUser,
    currentCommunity: state.currentCommunity,
    myCommunities: state.myCommunities,
    loginWithWxCode,
    switchUserRole,
    syncWxProfile,
    bindWxPhone,
    fetchUserProfile,
    switchCommunity,
    openLoginModal,
    closeLoginModal,
    clearLoginState
  }
}
