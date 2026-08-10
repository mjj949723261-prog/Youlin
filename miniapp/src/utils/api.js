// 友邻 Youlin - Uni-app 统一 API 网络请求封装 (支持本地与后端无缝切合)
const BASE_URL = 'http://localhost:8080/api/v1'

// 兜底本地默认数据，防止后端断连时弹窗干扰
const mockPosts = [
  {
    id: 1,
    authorName: '王阿姨',
    building: '3栋 1202',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    roleTag: '本小区住户',
    roleType: 'RESIDENT',
    categoryKey: 'HELP',
    publishTime: '10分钟前',
    content: '谁家有电钻可以借用半小时？想要在客厅墙上装个挂衣置物架。由于家里只有我和小孙女，急需借用一会儿，用完立即归还，并且必有重谢！麻烦有电钻的邻居联系我呀~',
    images: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=600,https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600',
    tagName: '邻里求助',
    tagType: 'NORMAL'
  },
  {
    id: 2,
    authorName: '小林',
    building: '8栋',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    roleTag: '本小区住户',
    roleType: 'RESIDENT',
    categoryKey: 'HELP',
    publishTime: '18分钟前',
    content: '寻找橘猫团团，昨晚在南门附近走失，特征是脖子上有蓝色项圈，有看到的邻居请联系我，必有重谢！希望大家能帮忙留意一下，非常感谢！',
    images: '',
    tagName: '紧急求助',
    tagType: 'URGENT'
  },
  {
    id: 3,
    authorName: '陈阿姨',
    building: '5栋',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    roleTag: '5号楼业主',
    roleType: 'RESIDENT',
    categoryKey: 'RENT',
    publishTime: '40分钟前',
    content: '云彩之城 2期 3号楼精装两居室业主直租，免中介费！首次出租家电齐全，看房方便。',
    images: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=300',
    tagName: '房屋出租',
    tagType: 'RENT'
  }
]

export const request = (options = {}) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          resolve(res.data.data)
        } else {
          resolve(null)
        }
      },
      fail: (err) => {
        // 静默处理连接失败，不向用户弹错误框，维持优雅降级
        console.warn('后端服务未联通或域名未配置，使用静默降级数据', err)
        resolve(null)
      }
    })
  })
}

export const apiGetCurrentCommunity = () => request({ url: '/community/current' })

export const apiGetPostList = async (categoryKey = 'ALL') => {
  const data = await request({ url: `/posts?categoryKey=${categoryKey}` })
  if (data && Array.isArray(data)) {
    return data
  }
  // 降级兜底
  return mockPosts.filter(p => categoryKey === 'ALL' || p.categoryKey === categoryKey)
}

export const apiGetPostDetail = async (id) => {
  const data = await request({ url: `/posts/${id}` })
  if (data) return data
  
  const post = mockPosts.find(p => String(p.id) === String(id)) || mockPosts[0]
  return {
    post,
    imageList: post.images ? post.images.split(',') : []
  }
}

export const apiCreatePost = (data) => request({ url: '/posts', method: 'POST', data })

export const apiGetComments = async (postId) => {
  const data = await request({ url: `/posts/${postId}/comments` })
  if (data) return data
  return []
}

export const apiAddComment = (data) => request({ url: '/comments', method: 'POST', data })
