/**
 * 农户配置文件
 * 统一管理所有地块的农户/所有人信息
 */

// 地块名称到农户的映射
export const FARMER_CONFIG = {
    // 宏哥地块 - 周建华
    宏哥: {
        name: '周建华',
        age: '50',
        avatar: '/images/zjh.jpg'
    },
    // 雷哥地块 - 隆启雷
    雷哥: {
        name: '隆启雷',
        age: '54',
        avatar: '/images/farmer-avatar.jpg'
    },
    // 八角智能烘干工厂 - 香源科技
    八角智能烘干工厂: {
        name: '香源科技',
        age: '经营',
        avatar: '/images/honggan.png'
    },
    // 默认配置（其他地块使用虚拟农户）
    default: {
        name: '陈启伟',
        age: '50',
        avatar: '/images/farmer-avatar.jpg'
    }
};

/**
 * 三农服务配置
 */
export const SERVICES_CONFIG = [
    { label: '-农投-', provider: '泮香科技' },
    { label: '-农资-', provider: '泮香科技' },
    { label: '-农服-', provider: '绿农科技' }
];

/**
 * 排名数据配置
 */
export const RANKING_CONFIG = [
    {
        manager: '周建华',
        location: '周建华八角林',
        area: 10,
        yield: 1970,
        district: '右江区'
    },
    {
        manager: '李子顺',
        location: '李子顺八角林',
        area: 10,
        yield: 1680,
        district: '右江区'
    },
    {
        manager: '隆起雷',
        location: '隆起雷八角林',
        area: 100,
        yield: 800,
        district: '右江区'
    }
];

/**
 * 默认地块数据常数定义
 */
// 万斤
const DEFAULT_YIELD = 48;
// 斤/亩
const DEFAULT_UNIT_YIELD = 1200;
// 产量
const DEFAULT_OUTPUT = 25;
const CONVERSION_FACTOR = 2000;
const CONVERSION_DIVISOR = 10000;

export const DEFAULT_PLOT_DATA = {
    area: 40,
    price: 4.10,
    yield: DEFAULT_YIELD,
    unitYield: DEFAULT_UNIT_YIELD,
    output: DEFAULT_OUTPUT,
    conversionFactor: CONVERSION_FACTOR,
    conversionDivisor: CONVERSION_DIVISOR
};

/**
 * 获取农户信息
 * @param {string} plotName - 地块名称
 * @returns {Object} 农户信息对象
 */
export function getFarmerInfo(plotName) {
    return FARMER_CONFIG[plotName] || FARMER_CONFIG.default;
}
