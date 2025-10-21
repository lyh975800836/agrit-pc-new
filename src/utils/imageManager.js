/**
 * 集中式图片管理工具
 * 统一管理项目中所有图片资源路径
 */

// 图片基础路径
const IMAGE_BASE_PATH = '/images/'

// 图片资源配置
export const IMAGES = {
  // 应用主要背景
  APP: {
    BACKGROUND: `${IMAGE_BASE_PATH}app-background.png`
  },

  // 头部相关
  HEADER: {
    BACKGROUND: `${IMAGE_BASE_PATH}header-background.png`,
    WEATHER_ICON: `${IMAGE_BASE_PATH}weather-icon.png`,
    USER_AVATAR: `${IMAGE_BASE_PATH}user-avatar.png`,
    CENTER_DECORATION_BG: `${IMAGE_BASE_PATH}center-decoration-bg.png`,
    CENTER_DECORATION_MAIN: `${IMAGE_BASE_PATH}center-decoration-main.png`,
    CENTER_DECORATION_SUB: `${IMAGE_BASE_PATH}center-decoration-sub.png`,
    DECORATION_LINE: `${IMAGE_BASE_PATH}decoration-line.png`,
    BOTTOM_DECORATION: `${IMAGE_BASE_PATH}bottom-decoration.png`,
    NAV_BUTTON_BG: `${IMAGE_BASE_PATH}nav-button-bg.png`,
    PAGE_TITLE_BG: `${IMAGE_BASE_PATH}page-title-bg.png`
  },

  // 左侧面板
  LEFT_PANEL: {
    BACKGROUND: `${IMAGE_BASE_PATH}left-panel-bg.png`,
    TITLE_DECORATION: `${IMAGE_BASE_PATH}title-decoration.png`,
    TITLE_UNDERLINE: `${IMAGE_BASE_PATH}title-underline.png`,
    BLOCK_COUNT_CARD: `${IMAGE_BASE_PATH}block-count-card.png`,
    TOTAL_AREA_CARD: `${IMAGE_BASE_PATH}total-area-card.png`,
    CARD_LABEL_BLOCK: `${IMAGE_BASE_PATH}card-label-block.png`,
    CARD_LABEL_AREA: `${IMAGE_BASE_PATH}card-label-area.png`,
    PRICE_CHART_CONTAINER: `${IMAGE_BASE_PATH}price-chart-container.png`,
    PRICE_CHART_BG: `${IMAGE_BASE_PATH}price-chart-bg.png`,
    PRICE_INDICATOR: `${IMAGE_BASE_PATH}price-indicator.png`,
    PRICE_ICON: `${IMAGE_BASE_PATH}price-icon.png`,
    TABLE_DIVIDER: `${IMAGE_BASE_PATH}table-divider.png`,
    LEFT_SLIDE: `${IMAGE_BASE_PATH}left-slide.png`
  },

  // 右侧排名面板
  RIGHT_PANEL: {
    BACKGROUND: `${IMAGE_BASE_PATH}ranking-panel-bg.png`,
    PRODUCTION_RANKING_HEADER: `${IMAGE_BASE_PATH}production-ranking-header.png`,
    TEAM_RANKING_HEADER: `${IMAGE_BASE_PATH}team-ranking-header.png`,
    PRODUCTION_UNDERLINE: `${IMAGE_BASE_PATH}production-underline.png`,
    TEAM_UNDERLINE: `${IMAGE_BASE_PATH}team-underline.png`,
    SECTION_DIVIDER: `${IMAGE_BASE_PATH}section-divider.png`,
    RANKING_DECORATION: `${IMAGE_BASE_PATH}ranking-decoration.png`,
    // 排名背景
    FIRST_PLACE_BG: `${IMAGE_BASE_PATH}first-place-bg.png`,
    SECOND_PLACE_BG: `${IMAGE_BASE_PATH}second-place-bg.png`,
    THIRD_PLACE_BG: `${IMAGE_BASE_PATH}third-place-bg.png`,
    // 排名图标
    FIRST_PLACE_ICON: `${IMAGE_BASE_PATH}first-place-icon.png`,
    SECOND_PLACE_ICON: `${IMAGE_BASE_PATH}second-place-icon.png`,
    THIRD_PLACE_ICON: `${IMAGE_BASE_PATH}third-place-icon.png`,
    // 管理员背景
    FIRST_MANAGER_BG: `${IMAGE_BASE_PATH}first-manager-bg.png`,
    SECOND_MANAGER_BG: `${IMAGE_BASE_PATH}second-manager-bg.png`,
    THIRD_MANAGER_BG: `${IMAGE_BASE_PATH}third-manager-bg.png`,
    // 质量相关
    QUALITY_ICON: `${IMAGE_BASE_PATH}quality-icon.png`,
    QUALITY_DIVIDER: `${IMAGE_BASE_PATH}quality-divider.png`,
    QUALITY_GOOD: `${IMAGE_BASE_PATH}quality-good.png`,
    QUALITY_AVERAGE: `${IMAGE_BASE_PATH}quality-average.png`,
    QUALITY_POOR: `${IMAGE_BASE_PATH}quality-poor.png`
  },

  // 弹窗相关
  POPUP: {
    MAIN_BG: `${IMAGE_BASE_PATH}popup-main-bg.png`,
    CONTENT_BG: `${IMAGE_BASE_PATH}popup-content-bg.png`,
    TOP3_BG: `${IMAGE_BASE_PATH}popup-top3-bg.png`,
    BOTTOM_BTN_BG: `${IMAGE_BASE_PATH}popup-bottom-btn-bg.png`,
    TEMPERATURE_ICON: `${IMAGE_BASE_PATH}popup-temperature-icon.png`,
    CLOSE_BTN: `${IMAGE_BASE_PATH}popup-close-btn.png`,
    DETAIL_BTN: `${IMAGE_BASE_PATH}popup-detail-btn.png`,
    DIVIDER_1: `${IMAGE_BASE_PATH}popup-divider-1.png`,
    DIVIDER_2: `${IMAGE_BASE_PATH}popup-divider-2.png`
  }
}

/**
 * 获取图片路径的辅助函数
 * @param {string} category 图片类别 (如 'HEADER', 'LEFT_PANEL' 等)
 * @param {string} name 图片名称 (如 'BACKGROUND', 'TITLE' 等)
 * @returns {string} 完整的图片路径
 */
export function getImagePath(category, name) {
  const categoryImages = IMAGES[category]
  if (!categoryImages) {
    console.warn(`图片类别 '${category}' 不存在`)
    return ''
  }
  
  const imagePath = categoryImages[name]
  if (!imagePath) {
    console.warn(`图片 '${name}' 在类别 '${category}' 中不存在`)
    return ''
  }
  
  return imagePath
}

/**
 * 将 CONSTANT_CASE 转换为 camelCase
 * @param {string} str CONSTANT_CASE 字符串
 * @returns {string} camelCase 字符串
 */
function toCamelCase(str) {
  return str.toLowerCase().replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())
}

/**
 * 批量获取某个类别的所有图片
 * @param {string} category 图片类别
 * @returns {Object} 该类别的所有图片路径对象，键名转换为 camelCase
 */
export function getCategoryImages(category) {
  const categoryImages = IMAGES[category]
  if (!categoryImages) {
    console.warn(`图片类别 '${category}' 不存在`)
    return {}
  }

  // 将 CONSTANT_CASE 键转换为 camelCase
  const result = {}
  Object.keys(categoryImages).forEach(key => {
    const camelKey = toCamelCase(key)
    result[camelKey] = categoryImages[key]
  })

  return result
}

/**
 * 预加载图片的辅助函数
 * @param {string|Array} imagePaths 单个图片路径或图片路径数组
 * @returns {Promise} 预加载完成的Promise
 */
export function preloadImages(imagePaths) {
  const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths]
  
  const loadPromises = paths.map(path => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(path)
      img.onerror = () => reject(new Error(`Failed to load image: ${path}`))
      img.src = path
    })
  })
  
  return Promise.allSettled(loadPromises)
}

/**
 * 验证图片是否存在的辅助函数
 * @param {string} imagePath 图片路径
 * @returns {Promise<boolean>} 图片是否存在
 */
export function validateImage(imagePath) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = imagePath
  })
}

// 默认导出图片配置
export default IMAGES