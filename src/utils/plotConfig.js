/**
 * 地块配置注册表
 * 集中管理所有地块的元信息，包括ID、别名、瓦片配置、mock地块等
 * 新增地块时只需在这里添加配置即可
 */

export const PLOT_REGISTRY = {
    // 雷哥地块
    雷哥: {
        id: 1000,
        displayName: '雷哥',
        aliases: ['千户十亩-大楞乡基地'],
        tilePreset: { cols: 10, rows: 6, offsetX: 0, offsetY: 0 },
        description: '烘干示范工厂所在地块',
        mockPlots: [
            {
                key: 'mock-drying-1',
                displayName: '烘干示范工厂',
                routeName: '雷哥',
                type: 'drying-facility',
                offset: { lat: -0.012, lng: 0.02 }
            }
        ]
    },

    // 宏哥地块
    宏哥: {
        id: 1001,
        displayName: '宏哥',
        aliases: ['千户十亩-宏哥'],
        tilePreset: { cols: 9, rows: 10, offsetX: -2, offsetY: 0 },
        description: '油茶示范基地所在地块',
        mockPlots: [
            {
                key: 'mock-tea-oil-1',
                displayName: '油茶示范基地',
                routeName: '油茶示范基地',
                type: 'tea-oil',
                offset: { lat: 0.015, lng: 0.018 }
            }
        ]
    },

    // 巴塘地块
    巴塘: {
        id: 1002,
        displayName: '巴塘',
        aliases: ['巴塘2', '千户十亩-田林县那色村巴塘八角基地'],
        tilePreset: { cols: 12, rows: 6, offsetX: -2, offsetY: 0 },
        description: '油茶精品园所在地块',
        mockPlots: [
            {
                key: 'mock-tea-oil-2',
                displayName: '油茶精品园',
                routeName: '油茶精品园',
                type: 'tea-oil',
                offset: { lat: 0.02, lng: -0.015 }
            }
        ]
    },

    // 油茶精品园独立地块（包含油茶示范基地别名）
    油茶精品园: {
        id: 1039,
        displayName: '油茶精品园',
        aliases: ['油茶示范基地', '田林县'],
        tilePreset: { cols: 3, rows: 3, offsetX: 0, offsetY: 0 },
        defaultZoomLevel: 2,
        description: '独立的油茶精品园地块',
        tileLayerName: 'plot_1039_田林县'
    }
};

// 默认瓦片配置（当没有特定配置时使用）
export const DEFAULT_TILE_PRESET = {
    cols: 12,
    rows: 6,
    offsetX: 0,
    offsetY: 0
};

/**
 * 根据地块名称查找配置
 * @param {string} plotName - 地块名称
 * @returns {Object|null} 地块配置对象
 */
export function findPlotConfig(plotName) {
    if (!plotName) {
        return null;
    }

    const normalizedName = String(plotName).trim();

    // 1. 直接查找
    if (PLOT_REGISTRY[normalizedName]) {
        return PLOT_REGISTRY[normalizedName];
    }

    // 2. 通过别名查找
    for (const [, config] of Object.entries(PLOT_REGISTRY)) {
        if (config.aliases && config.aliases.includes(normalizedName)) {
            return config;
        }
    }

    return null;
}

/**
 * 根据plotId查找地块名称
 * @param {number} plotId - 地块ID
 * @returns {string|null} 地块名称
 */
export function findPlotNameById(plotId) {
    for (const [name, config] of Object.entries(PLOT_REGISTRY)) {
        if (config.id === plotId) {
            return name;
        }
    }
    return null;
}

/**
 * 解析plotId - 统一的ID解析逻辑
 * @param {string|number} plotId - 地块ID或名称
 * @returns {number} 解析后的plotId
 */
export function resolveToPlotId(plotId) {
    // 1. 如果已经是数字ID，直接返回
    if (Number.isFinite(plotId)) {
        return Number(plotId);
    }

    // 2. 将其作为名称查找
    const config = findPlotConfig(plotId);
    if (config) {
        return config.id;
    }

    // 3. 默认返回1000（雷哥）
    return 1000;
}

/**
 * 获取瓦片预设配置
 * @param {number} plotId - 地块ID
 * @returns {Object} 瓦片配置
 */
export function getTilePreset(plotId) {
    const plotName = findPlotNameById(plotId);
    if (plotName && PLOT_REGISTRY[plotName]) {
        return PLOT_REGISTRY[plotName].tilePreset || DEFAULT_TILE_PRESET;
    }
    return DEFAULT_TILE_PRESET;
}

/**
 * 生成地块配置映射表 (用于WMTSTileMap中的映射)
 * @returns {Object} name -> id 的映射
 */
export function generatePlotIdMapping() {
    const mapping = {};

    for (const [mainName, config] of Object.entries(PLOT_REGISTRY)) {
        // 主名称映射
        mapping[mainName] = config.id;

        // 别名映射
        if (config.aliases && Array.isArray(config.aliases)) {
            config.aliases.forEach(alias => {
                mapping[alias] = config.id;
            });
        }
    }

    return mapping;
}

/**
 * 生成Mock地块配置列表 (用于RegionDetailMap)
 * @returns {Array} Mock地块配置数组
 */
export function generateMockPlotConfig() {
    const mockConfigs = [];
    const processedKeys = new Set();

    for (const [mainName, config] of Object.entries(PLOT_REGISTRY)) {
        if (config.mockPlots && Array.isArray(config.mockPlots)) {
            config.mockPlots.forEach(mockPlot => {
                // 避免重复处理（如果多个地块有相同的mock地块）
                if (!processedKeys.has(mockPlot.key)) {
                    mockConfigs.push({
                        ...mockPlot,
                        baseKey: mainName
                    });
                    processedKeys.add(mockPlot.key);
                }
            });
        }

        // 特殊处理：有独立routeName的地块需要在RegionDetailMap中展示
        if (config.mockPlots && config.mockPlots.length === 0 && !config.aliases.includes(mainName)) {
            // 如果是独立地块（没有baseKey）且不是别名，可能需要在RegionDetailMap中展示
        }
    }

    return mockConfigs;
}

/**
 * 检查名称是否是某个地块的别名
 * @param {string} plotName - 地块名称或别名
 * @param {string} mainName - 主名称
 * @returns {boolean}
 */
export function isAliasOf(plotName, mainName) {
    const config = PLOT_REGISTRY[mainName];
    if (!config) {
        return false;
    }

    return config.aliases && config.aliases.includes(plotName);
}

/**
 * 获取地块的所有别名（包括主名称）
 * @param {string|number} plotIdentifier - 地块名称或ID
 * @returns {Array} 别名列表
 */
export function getAllPlotNames(plotIdentifier) {
    let config;

    if (Number.isFinite(plotIdentifier)) {
        config = PLOT_REGISTRY[findPlotNameById(plotIdentifier)];
    }
    else {
        config = findPlotConfig(plotIdentifier);
    }

    if (!config) {
        return [];
    }

    // 找到config的主名称
    const mainName = Object.keys(PLOT_REGISTRY).find(
        key => PLOT_REGISTRY[key] === config
    );

    return [mainName, ...(config.aliases || [])];
}

/**
 * 获取地块的默认缩放级别
 * @param {number} plotId - 地块ID
 * @returns {number|null} 默认缩放级别，如果未定义则返回null
 */
export function getDefaultZoomLevel(plotId) {
    const plotName = findPlotNameById(plotId);
    if (plotName && PLOT_REGISTRY[plotName]) {
        return PLOT_REGISTRY[plotName].defaultZoomLevel || null;
    }
    return null;
}
