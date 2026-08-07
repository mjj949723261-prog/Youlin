import { reactive, ref } from 'vue'

// 当前所在小区与街道社区信息
export const currentCommunity = reactive({
  id: 'comm_001',
  name: '云彩之城',
  subDistrictId: 'sub_101',
  subDistrictName: '新塘街道彩虹社区'
})

// 当前用户身份状态
export const currentUser = reactive({
  id: 'usr_888',
  nickname: '张先生',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  building: '5栋',
  room: '302',
  isOwner: true,
  roleTag: '本小区住户'
})

// 当前支持的房产/小区列表
export const myCommunities = ref([
  {
    id: 'comm_001',
    name: '云彩之城',
    building: '5栋302',
    roleTag: '自住·已认证'
  },
  {
    id: 'comm_002',
    name: '云彩之城 2期',
    building: '12栋501',
    roleTag: '出租·已认证'
  }
])

// 切换当前小区
export const switchCommunity = (item) => {
  currentCommunity.id = item.id
  currentCommunity.name = item.name
}

export const useCommunityStore = () => {
  return {
    currentCommunity,
    currentUser,
    myCommunities,
    switchCommunity
  }
}
