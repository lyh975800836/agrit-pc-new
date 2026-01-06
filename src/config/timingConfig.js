/**
 * Timing 配置文件
 * 统一管理全局的时间相关配置(延迟、超时、动画时长等)
 */

// ========== 通用延迟配置 ==========
export const DELAYS = {
    // 短延迟 (< 200ms)
    DEBOUNCE_SHORT: 100,        // 防抖短延迟
    THROTTLE_SHORT: 150,        // 节流短延迟
    ANIMATION_QUICK: 200,       // 快速动画

    // 中等延迟 (200ms - 500ms)
    DEBOUNCE_MEDIUM: 300,       // 防抖中等延迟
    ANIMATION_NORMAL: 400,      // 正常动画
    TRANSITION_DEFAULT: 300,    // 默认过渡时长

    // 长延迟 (> 500ms)
    DEBOUNCE_LONG: 500,         // 防抖长延迟
    ANIMATION_SLOW: 700,        // 慢速动画
    RETRY_DELAY: 1000,          // 重试延迟
    MESSAGE_DISPLAY: 3000       // 消息显示时长
};

// ========== 超时配置 ==========
export const TIMEOUTS = {
    // API 请求超时
    API_REQUEST_SHORT: 5000,    // 5秒 - 短超时(用于快速操作)
    API_REQUEST_NORMAL: 10000,  // 10秒 - 正常超时
    API_REQUEST_LONG: 30000,    // 30秒 - 长超时(用于大数据加载)

    // 资源加载超时
    IMAGE_LOAD: 8000,           // 8秒 - 图片加载
    TILE_LOAD: 3000,            // 3秒 - 瓦片加载
    SCRIPT_LOAD: 10000,         // 10秒 - 脚本加载

    // 用户操作超时
    USER_IDLE: 300000,          // 5分钟 - 用户空闲
    SESSION_WARNING: 60000,     // 1分钟 - 会话警告
};

// ========== 地图相关延迟 ==========
export const MAP_DELAYS = {
    // 地图交互延迟
    ZOOM_SETTLE: 300,           // 缩放稳定延迟
    PAN_SETTLE: 200,            // 平移稳定延迟
    MARKER_CLICK_DEBOUNCE: 100, // 标记点击防抖

    // 地图更新延迟
    TILE_RELOAD: 500,           // 瓦片重新加载
    LAYER_UPDATE: 300,          // 图层更新延迟
    POPUP_OPEN: 100,            // 弹窗打开延迟
    POPUP_CLOSE: 200,           // 弹窗关闭延迟

    // 地图初始化延迟
    INIT_DELAY: 100,            // 地图初始化延迟
    FIT_BOUNDS_DELAY: 300,      // 适配边界延迟
};

// ========== 图表相关延迟 ==========
export const CHART_DELAYS = {
    // 图表渲染延迟
    RENDER_DELAY: 100,          // 渲染延迟
    RESIZE_DEBOUNCE: 100,       // resize 防抖
    UPDATE_ANIMATION: 300,      // 更新动画时长

    // 数据更新延迟
    DATA_LOAD: 200,             // 数据加载延迟
    REFRESH_INTERVAL: 5000,     // 刷新间隔(可根据需要调整)
};

// ========== 动画时长配置 ==========
export const ANIMATIONS = {
    // 基础动画时长
    FADE_IN: 300,               // 淡入
    FADE_OUT: 200,              // 淡出
    SLIDE_IN: 400,              // 滑入
    SLIDE_OUT: 300,             // 滑出

    // 特殊动画
    EARTH_INTRO: {
        CAMERA_MOVE: 2000,      // 相机移动时长
        SCENE_TRANSITION: 1500, // 场景过渡时长
        TEXT_DISPLAY: 3000,     // 文字显示时长
    },

    // 脉冲动画
    PULSE_SLOW: 2000,           // 慢速脉冲
    PULSE_NORMAL: 1500,         // 正常脉冲
    PULSE_FAST: 1000,           // 快速脉冲
};

// ========== 轮询配置 ==========
export const POLLING = {
    // 自动刷新间隔
    DASHBOARD_REFRESH: 300000,  // 5分钟 - 仪表板自动刷新
    MAP_REFRESH: 60000,         // 1分钟 - 地图数据刷新
    PRICE_REFRESH: 180000,      // 3分钟 - 价格数据刷新

    // 状态检查间隔
    HEALTH_CHECK: 30000,        // 30秒 - 健康检查
    CONNECTION_CHECK: 10000,    // 10秒 - 连接检查
};

// ========== 缓存过期时间 ==========
export const CACHE_EXPIRY = {
    // 短期缓存 (< 5分钟)
    IMMEDIATE: 60000,           // 1分钟
    SHORT: 300000,              // 5分钟

    // 中期缓存 (5分钟 - 1小时)
    MEDIUM: 1800000,            // 30分钟
    LONG: 3600000,              // 1小时

    // 长期缓存 (> 1小时)
    VERY_LONG: 86400000,        // 24小时
    PERSISTENT: Infinity,        // 永久缓存(需手动清理)
};

// ========== 导出默认配置对象 ==========
export default {
    DELAYS,
    TIMEOUTS,
    MAP_DELAYS,
    CHART_DELAYS,
    ANIMATIONS,
    POLLING,
    CACHE_EXPIRY
};
