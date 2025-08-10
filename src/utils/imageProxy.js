/**
 * 图片代理工具 - 解决跨域访问问题
 */

const IMAGE_PROXY_BASE = process.env.NODE_ENV === 'production' 
  ? '/api/lanhu/'  // 生产环境使用Nginx代理
  : '/api/lanhu/'  // 开发环境使用webpack代理

/**
 * 将lanhu图床链接转换为代理链接
 * @param {string} lanhuUrl - lanhu图床原始URL
 * @returns {string} 代理后的URL
 */
export function proxyLanhuImage(lanhuUrl) {
  if (!lanhuUrl || typeof lanhuUrl !== 'string') {
    return ''
  }
  
  // 检查是否是lanhu链接
  if (lanhuUrl.includes('lanhu-oss-proxy.lanhuapp.com')) {
    // 提取图片ID部分
    const imageId = lanhuUrl.split('/').pop()
    return `${IMAGE_PROXY_BASE}${imageId}`
  }
  
  // 如果不是lanhu链接，直接返回
  return lanhuUrl
}

/**
 * 批量处理图片URL
 * @param {Object} styleObj - 样式对象
 * @returns {Object} 处理后的样式对象
 */
export function proxyImageUrls(styleObj) {
  const result = { ...styleObj }
  
  for (const [key, value] of Object.entries(result)) {
    if (typeof value === 'string' && value.includes('lanhu-oss-proxy.lanhuapp.com')) {
      result[key] = proxyLanhuImage(value)
    }
  }
  
  return result
}

/**
 * CSS样式中的URL替换
 * @param {string} cssValue - CSS值（如background-image）
 * @returns {string} 处理后的CSS值
 */
export function proxyCSSImageUrl(cssValue) {
  if (!cssValue || typeof cssValue !== 'string') {
    return cssValue
  }
  
  // 匹配CSS中的url()
  return cssValue.replace(
    /url\(['"]?(https:\/\/lanhu-oss-proxy\.lanhuapp\.com\/[^'"]+)['"]?\)/g,
    (match, url) => {
      const proxiedUrl = proxyLanhuImage(url)
      return `url('${proxiedUrl}')`
    }
  )
}

export default {
  proxyLanhuImage,
  proxyImageUrls,
  proxyCSSImageUrl
}