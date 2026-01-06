/**
 * 缓存配置文件
 * 统一管理缓存相关配置
 */

// 缓存TTL配置（单位：毫秒）
export const CACHE_TTL = {
    // 地块数据缓存时间 - 5分钟
    PLOT: 5 * 60 * 1000,

    // 统计数据缓存时间 - 10分钟
    STATISTICS: 10 * 60 * 1000,

    // 地图数据缓存时间 - 15分钟
    MAP_DATA: 15 * 60 * 1000,

    // 用户数据缓存时间 - 30分钟
    USER: 30 * 60 * 1000,

    // API响应缓存时间 - 1分钟
    API_RESPONSE: 1 * 60 * 1000
};

// 缓存键前缀
export const CACHE_KEY_PREFIX = {
    PLOT: 'plot_',
    STATISTICS: 'stats_',
    MAP_DATA: 'map_',
    USER: 'user_',
    API: 'api_'
};

// LocalStorage键名
export const STORAGE_KEYS = {
    USER_INFO: 'user_info',
    APP_SETTINGS: 'app_settings',
    APP_THEME: 'app_theme'
};
