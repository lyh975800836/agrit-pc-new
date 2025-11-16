/**
 * 图表工具函数库
 * 提供通用的图表配置、颜色方案、格式化等工具
 */

// 默认颜色方案
export const DEFAULT_COLORS = {
    primary: '#4ECDC4',
    secondary: '#C69C6D',
    accent: '#FF6B35',
    success: '#00FF7F',
    warning: '#FAAF3B',
    danger: '#FF6B6B',
    light: '#E8E8E8',
    dark: '#1D1D1D'
};

// 渐变色配置
export const GRADIENT_COLORS = {
    cyan: ['#4ECDC4', '#2C5F5A'],
    gold: ['#C69C6D', '#8B6F47'],
    coral: ['#FF6B35', '#D94A1A'],
    green: ['#00FF7F', '#00CC64']
};

/**
 * 获取图表通用配置
 */
export function getCommonChartOption() {
    return {
        textStyle: {
            fontFamily: 'SourceHanSansCN-Regular',
            color: '#C69C6D'
        },
        tooltip: {
            backgroundColor: '#041F1C',
            borderColor: '#4ECDC4',
            textStyle: {
                color: '#C69C6D'
            }
        }
    };
}

/**
 * 获取坐标轴通用配置
 */
export function getAxisConfig(axisType = 'xy') {
    const config = {};

    if (axisType.includes('x')) {
        config.xAxis = {
            type: 'category',
            axisLine: {
                lineStyle: {
                    color: '#4ECDC4'
                }
            },
            axisLabel: {
                color: '#C69C6D'
            },
            splitLine: {
                show: false
            }
        };
    }

    if (axisType.includes('y')) {
        config.yAxis = {
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: '#4ECDC4'
                }
            },
            axisLabel: {
                color: '#C69C6D'
            },
            splitLine: {
                lineStyle: {
                    color: '#4ECDC41A'
                }
            }
        };
    }

    return config;
}

/**
 * 获取图例配置
 */
export function getLegendConfig(options = {}) {
    return {
        legend: {
            textStyle: {
                color: '#C69C6D'
            },
            ...options
        }
    };
}

/**
 * 格式化数字显示
 */
export function formatNumber(value, decimal = 0) {
    if (!value) {
        return 0;
    }
    return parseFloat(value).toFixed(decimal);
}

/**
 * 格式化百分比
 */
export function formatPercent(value, decimal = 1) {
    if (!value) {
        return '0%';
    }
    return `${ formatNumber(value * 100, decimal) }%`;
}

/**
 * 获取网格配置
 */
export function getGridConfig(options = {}) {
    return {
        grid: {
            left: '10%',
            right: '10%',
            top: '20%',
            bottom: '15%',
            containLabel: true,
            ...options
        }
    };
}

/**
 * 合并图表配置
 */
export function mergeChartOption(baseOption, customOption = {}) {
    return {
        ...baseOption,
        ...customOption,
        // 递归合并嵌套对象
        xAxis: customOption.xAxis ? { ...baseOption.xAxis, ...customOption.xAxis } : baseOption.xAxis,
        yAxis: customOption.yAxis ? { ...baseOption.yAxis, ...customOption.yAxis } : baseOption.yAxis,
        grid: customOption.grid ? { ...baseOption.grid, ...customOption.grid } : baseOption.grid,
        legend: customOption.legend ? { ...baseOption.legend, ...customOption.legend } : baseOption.legend,
        tooltip: customOption.tooltip ? { ...baseOption.tooltip, ...customOption.tooltip } : baseOption.tooltip
    };
}
