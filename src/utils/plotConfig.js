/**
 * 地块配置注册表 (优化版本)
 *
 * 集中管理所有地块的元信息，包括ID、别名、瓦片配置、mock地块等
 * 新增地块时只需在这里添加配置即可
 *
 * 保留的核心功能:
 * - PLOT_REGISTRY: 地块主配置表（包含别名映射）
 * - generatePlotIdMapping(): 用于WMTSTileMap中的name->id映射
 * - getTilePreset(): 用于获取瓦片网格预设配置（当后端无数据时的fallback）
 * - getDefaultZoomLevel(): 用于某些特定地块的默认缩放级别
 * - generateMockPlotConfig(): 用于RegionDetailMap的mock地块生成
 * - getAllPlotNames(): 用于PlotDetail中的坐标数据别名查找
 *
 * 已移除的功能:
 * - 产业链配置 (SUPPLY_CHAIN_STAGES, SUPPLY_CHAIN_NODES): 无实际使用
 * - 产业链查询函数: getSupplyChainNodesForPlot(), getEdgeNodesForPlot(), getCentralNodes(), findSupplyChainNode()
 *
 * 后续优化方向:
 * - 将getTilePreset和getDefaultZoomLevel的配置迁移到后端API（长期规划）
 * - 简化PLOT_REGISTRY，只保留实际使用的地块配置
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
                key: 'mock-star-anise-1',
                displayName: '八角种植基地',
                routeName: '雷哥',
                type: 'star-anise',
                offset: { lat: 0.008, lng: -0.015 }
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
    },

    // 024 林业产业智能园区
    林业产业智能园区: {
        id: 1024,
        displayName: '林业产业智能园区',
        aliases: ['1024'],
        tilePreset: { cols: 13, rows: 10, offsetX: -17, offsetY: -6 },
        description: '林业产业智能园区',
        defaultZoomLevel: 5,
        tileLayerName: 'plot_1024_晒场0',
        mockPlots: [
            {
                key: 'mock-forestry-park-1',
                displayName: '林业产业智能园区',
                routeName: '林业产业智能园区',
                type: '中心工厂',
                owner: '香源科技',
                offset: { lat: 0.01, lng: 0.01 }
            }
        ]
    },

    // 1025 潘总八角晒场
    潘总八角晒场: {
        id: 1025,
        displayName: '潘总八角晒场',
        aliases: ['1025'],
        tilePreset: { cols: 11, rows: 8, offsetX: -3, offsetY: -4 },
        tilematrix: 4,
        description: '潘总八角晒场',
        mockPlots: [
            {
                key: 'mock-drying-yard-1',
                displayName: '潘总八角晒场',
                routeName: '潘总八角晒场',
                type: '晒场',
                owner: '潘总',
                offset: { lat: 0.01, lng: 0.01 }
            }
        ]
    },

    // 1026 海南国际商品交易所香辛料指定交收仓
    海南国际商品交易所香辛料指定交收仓: {
        id: 1026,
        displayName: '海南国际商品交易所香辛料指定交收仓',
        aliases: ['1026', '交收仓'],
        tilePreset: { cols: 15, rows: 11, offsetX: -17, offsetY: -6 },
        description: '海南国际商品交易所香辛料指定交收仓',
        defaultZoomLevel: 5,
        tileLayerName: 'plot_1026_晒场2',
        mockPlots: [
            {
                key: 'mock-trading-warehouse-1',
                displayName: '海南国际商品交易所香辛料指定交收仓',
                routeName: '海南国际商品交易所香辛料指定交收仓',
                type: '交收仓',
                owner: '百色一号',
                offset: { lat: 0.01, lng: 0.01 }
            }
        ]
    },

    // 1027 八角智能烘干工厂
    八角智能烘干工厂: {
        id: 1027,
        displayName: '八角智能烘干工厂',
        aliases: ['1027'],
        tilePreset: { cols: 3, rows: 3, offsetX: 0, offsetY: 0 },
        defaultZoomLevel: 2,
        description: '八角智能烘干工厂',
        tileLayerName: 'plot_1027_晒场3',
        mockPlots: [
            {
                key: 'mock-drying-factory-1',
                displayName: '八角智能烘干工厂',
                routeName: '八角智能烘干工厂',
                type: 'drying-facility',
                owner: '香源科技',
                offset: { lat: 0.01, lng: 0.01 }
            }
        ]
    },

    // 1003 新寨八角（林类型）
    新寨八角: {
        id: 1003,
        displayName: '新寨八角',
        aliases: ['1003', '新寨'],
        tilePreset: { cols: 17, rows: 13, offsetX: -8, offsetY: -6 },
        defaultZoomLevel: 5,
        description: '新寨八角林地',
        tileLayerName: 'plot_1003_新寨',
        mockPlots: [
            {
                key: 'mock-forestland-xinzhai',
                displayName: '新寨八角',
                routeName: '新寨八角',
                type: '林',
                offset: { lat: 0.008, lng: -0.015 }
            }
        ]
    },

    // 1004 上泮八角（林类型）
    上泮八角: {
        id: 1004,
        displayName: '上泮八角',
        aliases: ['1004', '上泮'],
        tilePreset: { cols: 19, rows: 16, offsetX: -9, offsetY: -8 },
        defaultZoomLevel: 5,
        description: '上泮八角林地',
        tileLayerName: 'plot_1004_上泮',
        mockPlots: [
            {
                key: 'mock-forestland-shangpan',
                displayName: '上泮八角',
                routeName: '上泮八角',
                type: '林',
                offset: { lat: 0.008, lng: -0.015 }
            }
        ]
    },

    // 1005 大楞乡龙洪屯八角（林类型）
    大楞乡龙洪屯八角: {
        id: 1005,
        displayName: '大楞乡龙洪屯八角',
        aliases: ['1005', '龙洪屯', '大楞乡龙洪屯'],
        tilePreset: { cols: 19, rows: 18, offsetX: -9, offsetY: -9 },
        defaultZoomLevel: 5,
        description: '大楞乡龙洪屯八角林地',
        tileLayerName: 'plot_1005_大楞乡龙洪屯八角',
        mockPlots: [
            {
                key: 'mock-forestland-longhongdun',
                displayName: '大楞乡龙洪屯八角',
                routeName: '大楞乡龙洪屯八角',
                type: '林',
                offset: { lat: 0.008, lng: -0.015 }
            }
        ]
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

