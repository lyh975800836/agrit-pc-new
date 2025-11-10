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

/**
 * ==========================================
 * 产业链流程配置 (通用型)
 * ==========================================
 *
 * 产业流程：农资店 → 作物地 → 边端初加工 → 边端仓库 → 集中工厂 → 集中仓库
 * 特点：与作物类型无关，所有作物都适用
 * 核心概念：因农户地块小，需要"边端仓"来汇集后送集中工厂处理
 */

/**
 * 产业链阶段定义
 */
export const SUPPLY_CHAIN_STAGES = {
    // 第1阶段：农资采购
    SUPPLY: {
        id: 1,
        name: '农资采购',
        label: '农资店',
        icon: '🛒',
        color: '#66BB6A',
        description: '农资销售点'
    },
    // 第2阶段：田间管护
    FIELD: {
        id: 2,
        name: '田间管护',
        label: '作物地',
        icon: '🌾',
        color: '#C69C6D',
        description: '种植地块'
    },
    // 第3阶段：边端初加工
    EDGE_PROCESSING: {
        id: 3,
        name: '边端初加工',
        label: '边端加工',
        icon: '⚙️',
        color: '#FFA726',
        description: '初步处理点'
    },
    // 第4阶段：边端仓库
    EDGE_WAREHOUSE: {
        id: 4,
        name: '边端仓库',
        label: '边端仓',
        icon: '📦',
        color: '#AB47BC',
        description: '边端临时存储'
    },
    // 第5阶段：集中工厂
    CENTRAL_FACTORY: {
        id: 5,
        name: '集中工厂',
        label: '中心工厂',
        icon: '🏭',
        color: '#FF7043',
        description: '中心加工工厂'
    },
    // 第6阶段：集中仓库
    CENTRAL_WAREHOUSE: {
        id: 6,
        name: '集中仓库',
        label: '中心仓',
        icon: '🏢',
        color: '#29B6F6',
        description: '中心存储仓库'
    }
};

/**
 * 通用产业链节点定义
 * 适用于所有地块，产业流程统一
 *
 * 节点设计原则：
 * - 中心节点（plotId: null）：集中工厂和集中仓库，所有地块共享
 * - 边端节点（plotId: 具体ID）：靠近地块的节点（农资、初加工、边端仓）
 * - 地块本身：田间管护阶段
 */
export const SUPPLY_CHAIN_NODES = [
    // ========== 中心节点（所有地块共享）==========

    // 集中工厂
    {
        id: 'central-factory',
        nodeType: 'central-factory',
        stage: SUPPLY_CHAIN_STAGES.CENTRAL_FACTORY.id,
        stageName: SUPPLY_CHAIN_STAGES.CENTRAL_FACTORY.name,
        name: '集中加工工厂',
        description: '统一的中心加工工厂',
        icon: SUPPLY_CHAIN_STAGES.CENTRAL_FACTORY.icon,
        color: SUPPLY_CHAIN_STAGES.CENTRAL_FACTORY.color,
        plotId: null, // 中心节点，所有地块共享
        lat: 24.345,
        lng: 106.560,
        flowStep: 5
    },

    // 集中仓库
    {
        id: 'central-warehouse',
        nodeType: 'central-warehouse',
        stage: SUPPLY_CHAIN_STAGES.CENTRAL_WAREHOUSE.id,
        stageName: SUPPLY_CHAIN_STAGES.CENTRAL_WAREHOUSE.name,
        name: '集中仓储库',
        description: '产品最终存储仓库',
        icon: SUPPLY_CHAIN_STAGES.CENTRAL_WAREHOUSE.icon,
        color: SUPPLY_CHAIN_STAGES.CENTRAL_WAREHOUSE.color,
        plotId: null, // 中心节点，所有地块共享
        lat: 24.346,
        lng: 106.561,
        flowStep: 6
    },

    // ========== 地块1000（雷哥）的边端节点 ==========

    {
        id: 'supply-leige',
        nodeType: 'supply-store',
        stage: SUPPLY_CHAIN_STAGES.SUPPLY.id,
        stageName: SUPPLY_CHAIN_STAGES.SUPPLY.name,
        name: '农资销售点（雷哥村）',
        description: '八角种植农资销售',
        icon: SUPPLY_CHAIN_STAGES.SUPPLY.icon,
        color: SUPPLY_CHAIN_STAGES.SUPPLY.color,
        plotId: 1000,
        lat: 24.230,
        lng: 106.200,
        flowStep: 1
    },

    {
        id: 'edge-process-leige',
        nodeType: 'edge-processing',
        stage: SUPPLY_CHAIN_STAGES.EDGE_PROCESSING.id,
        stageName: SUPPLY_CHAIN_STAGES.EDGE_PROCESSING.name,
        name: '边端初加工点（雷哥）',
        description: '初步干制处理',
        icon: SUPPLY_CHAIN_STAGES.EDGE_PROCESSING.icon,
        color: SUPPLY_CHAIN_STAGES.EDGE_PROCESSING.color,
        plotId: 1000,
        lat: 24.245,
        lng: 106.215,
        flowStep: 3
    },

    {
        id: 'edge-warehouse-leige',
        nodeType: 'edge-warehouse',
        stage: SUPPLY_CHAIN_STAGES.EDGE_WAREHOUSE.id,
        stageName: SUPPLY_CHAIN_STAGES.EDGE_WAREHOUSE.name,
        name: '边端仓库（雷哥）',
        description: '干制产品临时存储',
        icon: SUPPLY_CHAIN_STAGES.EDGE_WAREHOUSE.icon,
        color: SUPPLY_CHAIN_STAGES.EDGE_WAREHOUSE.color,
        plotId: 1000,
        lat: 24.250,
        lng: 106.220,
        flowStep: 4
    },

    // ========== 地块1001（宏哥）的边端节点 ==========

    {
        id: 'supply-hongge',
        nodeType: 'supply-store',
        stage: SUPPLY_CHAIN_STAGES.SUPPLY.id,
        stageName: SUPPLY_CHAIN_STAGES.SUPPLY.name,
        name: '农资销售点（宏哥）',
        description: '油茶种植农资销售',
        icon: SUPPLY_CHAIN_STAGES.SUPPLY.icon,
        color: SUPPLY_CHAIN_STAGES.SUPPLY.color,
        plotId: 1001,
        lat: 24.350,
        lng: 106.520,
        flowStep: 1
    },

    {
        id: 'edge-process-hongge',
        nodeType: 'edge-processing',
        stage: SUPPLY_CHAIN_STAGES.EDGE_PROCESSING.id,
        stageName: SUPPLY_CHAIN_STAGES.EDGE_PROCESSING.name,
        name: '边端初加工点（宏哥）',
        description: '油茶初步榨油处理',
        icon: SUPPLY_CHAIN_STAGES.EDGE_PROCESSING.icon,
        color: SUPPLY_CHAIN_STAGES.EDGE_PROCESSING.color,
        plotId: 1001,
        lat: 24.360,
        lng: 106.530,
        flowStep: 3
    },

    {
        id: 'edge-warehouse-hongge',
        nodeType: 'edge-warehouse',
        stage: SUPPLY_CHAIN_STAGES.EDGE_WAREHOUSE.id,
        stageName: SUPPLY_CHAIN_STAGES.EDGE_WAREHOUSE.name,
        name: '边端仓库（宏哥）',
        description: '油茶产品临时存储',
        icon: SUPPLY_CHAIN_STAGES.EDGE_WAREHOUSE.icon,
        color: SUPPLY_CHAIN_STAGES.EDGE_WAREHOUSE.color,
        plotId: 1001,
        lat: 24.365,
        lng: 106.535,
        flowStep: 4
    },

    // ========== 地块1002（巴塘）的边端节点 ==========

    {
        id: 'supply-batang',
        nodeType: 'supply-store',
        stage: SUPPLY_CHAIN_STAGES.SUPPLY.id,
        stageName: SUPPLY_CHAIN_STAGES.SUPPLY.name,
        name: '农资销售点（巴塘）',
        description: '八角种植农资销售',
        icon: SUPPLY_CHAIN_STAGES.SUPPLY.icon,
        color: SUPPLY_CHAIN_STAGES.SUPPLY.color,
        plotId: 1002,
        lat: 23.850,
        lng: 106.150,
        flowStep: 1
    },

    {
        id: 'edge-process-batang',
        nodeType: 'edge-processing',
        stage: SUPPLY_CHAIN_STAGES.EDGE_PROCESSING.id,
        stageName: SUPPLY_CHAIN_STAGES.EDGE_PROCESSING.name,
        name: '边端初加工点（巴塘）',
        description: '初步干制处理',
        icon: SUPPLY_CHAIN_STAGES.EDGE_PROCESSING.icon,
        color: SUPPLY_CHAIN_STAGES.EDGE_PROCESSING.color,
        plotId: 1002,
        lat: 23.855,
        lng: 106.160,
        flowStep: 3
    },

    {
        id: 'edge-warehouse-batang',
        nodeType: 'edge-warehouse',
        stage: SUPPLY_CHAIN_STAGES.EDGE_WAREHOUSE.id,
        stageName: SUPPLY_CHAIN_STAGES.EDGE_WAREHOUSE.name,
        name: '边端仓库（巴塘）',
        description: '干制产品临时存储',
        icon: SUPPLY_CHAIN_STAGES.EDGE_WAREHOUSE.icon,
        color: SUPPLY_CHAIN_STAGES.EDGE_WAREHOUSE.color,
        plotId: 1002,
        lat: 23.860,
        lng: 106.170,
        flowStep: 4
    }
];

/**
 * 获取特定地块的供应链节点
 * @param {number} plotId - 地块ID
 * @returns {Array} 该地块的所有供应链节点（包括共享的中心节点）
 */
export function getSupplyChainNodesForPlot(plotId) {
    return SUPPLY_CHAIN_NODES.filter(node =>
        node.plotId === plotId || node.plotId === null);
}

/**
 * 获取特定地块的边端节点
 * @param {number} plotId - 地块ID
 * @returns {Array} 该地块特有的边端节点
 */
export function getEdgeNodesForPlot(plotId) {
    return SUPPLY_CHAIN_NODES.filter(node => node.plotId === plotId);
}

/**
 * 获取中心节点（所有地块共享）
 * @returns {Array} 中心工厂和中心仓库节点
 */
export function getCentralNodes() {
    return SUPPLY_CHAIN_NODES.filter(node => node.plotId === null);
}

/**
 * 根据节点ID查找节点
 * @param {string} nodeId - 节点ID
 * @returns {Object|null} 节点对象
 */
export function findSupplyChainNode(nodeId) {
    return SUPPLY_CHAIN_NODES.find(node => node.id === nodeId) || null;
}
