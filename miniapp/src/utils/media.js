/**
 * 悦邻里 - 全局统一媒体 (图片/视频) 上传约束与压缩工具
 * 兼顾高清画质体验与服务器存储/带宽流量控制
 */

// 图片默认配置与限制
export const IMAGE_CONFIG = {
  maxCount: 9,          // 最多9张
  maxSingleSizeMB: 3.5, // 单张图片上限 3.5MB (压缩后)
  sizeType: ['compressed'], // 优先强制压缩
}

// 视频默认配置与限制
export const VIDEO_CONFIG = {
  maxPostDuration: 60,   // 主贴视频上限 60秒
  maxReplyDuration: 15,  // 评论视频上限 15秒
  maxSingleSizeMB: 20,   // 单个视频上限 20MB
  compressed: true,      // 强制开启视频压缩
}

/**
 * 统一选择并压缩图片
 * @param {Object} options { count, maxMB }
 * @returns {Promise<Array<string>>}
 */
export function chooseAndCompressImages(options = {}) {
  const count = options.count || IMAGE_CONFIG.maxCount
  const maxMB = options.maxMB || IMAGE_CONFIG.maxSingleSizeMB

  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count,
      sizeType: IMAGE_CONFIG.sizeType,
      sourceType: ['album', 'camera'],
      success: (res) => {
        // 校验单张图片体积
        const validPaths = []
        let overSizeCount = 0

        res.tempFiles.forEach(file => {
          const fileSizeMB = file.size / (1024 * 1024)
          if (fileSizeMB <= maxMB) {
            validPaths.push(file.path)
          } else {
            overSizeCount++
          }
        })

        if (overSizeCount > 0) {
          uni.showToast({
            title: `${overSizeCount}张图片超过${maxMB}MB限制，已自动过滤`,
            icon: 'none',
            duration: 2500
          })
        }

        resolve(validPaths)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

/**
 * 统一选择并压缩视频
 * @param {Object} options { isReply, maxMB }
 * @returns {Promise<string>}
 */
export function chooseAndCompressVideo(options = {}) {
  const maxDuration = options.isReply ? VIDEO_CONFIG.maxReplyDuration : VIDEO_CONFIG.maxPostDuration
  const maxMB = options.maxMB || VIDEO_CONFIG.maxSingleSizeMB

  return new Promise((resolve, reject) => {
    uni.chooseVideo({
      sourceType: ['album', 'camera'],
      compressed: VIDEO_CONFIG.compressed,
      maxDuration,
      camera: 'back',
      success: (res) => {
        const fileSizeMB = res.size / (1024 * 1024)
        if (fileSizeMB > maxMB) {
          uni.showToast({
            title: `视频大小(${fileSizeMB.toFixed(1)}MB)超过限制(${maxMB}MB)，请重新剪辑或选择短视频`,
            icon: 'none',
            duration: 3000
          })
          reject(new Error('Video size limit exceeded'))
          return
        }

        resolve(res.tempFilePath)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}
