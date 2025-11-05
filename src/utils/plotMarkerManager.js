/**
 * 地块标记管理器
 * 处理地块标记的创建、配置、可见性管理等
 */

const DEFAULT_PLOT_TYPE = 'star-anise';

/**
 * 规范化地块类型
 * @param {string} plotType - 原始地块类型
 * @returns {string} 规范化后的地块类型
 */
export function normalizePlotType(plotType) {
    const typeMap = {
        'star-anise': 'star-anise',
        'premium': 'star-anise',
        'tea-oil': 'tea-oil',
        'normal': 'tea-oil',
        'drying-facility': 'drying-facility',
        'average': 'drying-facility',
        '产地仓': '产地仓',
        '中心工厂': '中心工厂',
        '农资商店': '农资商店',
        '交收仓': '交收仓',
        '云仓': '云仓',
        '晒场': '晒场'
    };

    return typeMap[plotType] || DEFAULT_PLOT_TYPE;
}

/**
 * 获取地块标记的视觉配置
 * @param {string} plotType - 地块类型
 * @returns {object} 视觉配置对象
 */
export function getPlotMarkerVisualConfig(plotType) {
    const normalizedType = normalizePlotType(plotType);

    const visualConfigMap = {
        'star-anise': {
            backgroundImage: '/images/map-filter1.png',
            typeClass: 'plot-type-star-anise',
            width: 174,
            height: 82,
            anchorYOffset: 8,
            positionOffset: { lat: 0.02, lng: -0.02 }
        },
        'tea-oil': {
            backgroundImage: '/images/map-filter2.png',
            typeClass: 'plot-type-tea-oil',
            width: 174,
            height: 82,
            anchorYOffset: 8,
            positionOffset: { lat: 0.02, lng: -0.02 }
        },
        'drying-facility': {
            backgroundImage: '/images/map-filter3.png',
            typeClass: 'plot-type-drying-facility',
            width: 174,
            height: 82,
            anchorYOffset: 8,
            positionOffset: { lat: 0.02, lng: -0.02 }
        },
        '产地仓': {
            backgroundImage: '/images/map-filter6.png',
            typeClass: 'plot-type-产地仓',
            width: 174,
            height: 82,
            anchorYOffset: 8,
            positionOffset: { lat: 0.02, lng: -0.02 }
        },
        '中心工厂': {
            backgroundImage: '/images/map-filter5.png',
            typeClass: 'plot-type-中心工厂',
            width: 174,
            height: 82,
            anchorYOffset: 8,
            positionOffset: { lat: 0.02, lng: -0.02 }
        },
        '农资商店': {
            backgroundImage: '/images/map-filter4.png',
            typeClass: 'plot-type-农资商店',
            width: 174,
            height: 82,
            anchorYOffset: 8,
            positionOffset: { lat: 0.02, lng: -0.02 }
        },
        '交收仓': {
            backgroundImage: '/images/map-filter7.png',
            typeClass: 'plot-type-交收仓',
            width: 174,
            height: 82,
            anchorYOffset: 8,
            positionOffset: { lat: 0.02, lng: -0.02 }
        },
        '云仓': {
            backgroundImage: '/images/map-filter8.png',
            typeClass: 'plot-type-云仓',
            width: 174,
            height: 82,
            anchorYOffset: 8,
            positionOffset: { lat: 0.02, lng: -0.02 }
        },
        '晒场': {
            backgroundImage: '/images/map-filter9.png',
            typeClass: 'plot-type-晒场',
            width: 174,
            height: 82,
            anchorYOffset: 8,
            positionOffset: { lat: 0.02, lng: -0.02 }
        }
    };

    return visualConfigMap[normalizedType] || visualConfigMap['star-anise'];
}

/**
 * 获取分类图标
 * @param {string} plotType - 地块类型
 * @returns {string} 图标路径
 */
export function getCategoryIcon(plotType) {
    const normalizedType = normalizePlotType(plotType);

    const categoryMap = {
        'star-anise': '/images/map-filter1.png',
        'tea-oil': '/images/map-filter2.png',
        'drying-facility': '/images/map-filter3.png',
        '农资商店': '/images/map-filter4.png',
        '中心工厂': '/images/map-filter5.png',
        '产地仓': '/images/map-filter6.png',
        '交收仓': '/images/map-filter7.png',
        '云仓': '/images/map-filter8.png',
        '晒场': '/images/map-filter9.png'
    };

    return categoryMap[normalizedType] || categoryMap['star-anise'];
}

/**
 * 检查地块类型是否匹配分类
 * @param {string} plotType - 地块类型
 * @param {string} categoryType - 分类类型
 * @param {object} categoryTypeMapping - 分类映射表
 * @returns {boolean} 是否匹配
 */
export function isPlotMatchCategory(plotType, categoryType, categoryTypeMapping) {
    if (categoryType === 'all') {
        return true;
    }

    const categoryTypes = categoryTypeMapping[categoryType] || [];
    return categoryTypes.includes(plotType);
}

/**
 * 创建地块标记 HTML
 * @param {object} plot - 地块数据
 * @param {string} plotType - 地块类型
 * @returns {string} HTML 字符串
 */
export function createPlotMarkerHtml(plot, plotType) {
    const visualConfig = getPlotMarkerVisualConfig(plotType);
    const encodedName = (plot.displayName || plot.name || '').replace(/"/g, '&quot;');

    return `<div
        class="plot-marker ${visualConfig.typeClass}"
        data-plot-type="${plotType}"
        data-plot-name="${encodedName}"
        style="
            background-image: url('${visualConfig.backgroundImage}');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            width: ${visualConfig.width}px;
            height: ${visualConfig.height}px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border-radius: 4px;
            overflow: hidden;
        "
    >
        <span style="
            color: #333;
            font-size: 11px;
            font-weight: 500;
            text-align: center;
            padding: 4px;
            word-break: break-all;
            text-shadow: 0 1px 2px rgba(255,255,255,0.8);
        ">${encodedName}</span>
    </div>`;
}

/**
 * 应用分类过滤
 * @param {array} plotMarkerLayers - 地块标记层数组
 * @param {string} selectedCategoryType - 选中的分类类型
 * @param {string} selectedPlotFilter - 选中的地块过滤类型
 * @param {object} categoryTypeMapping - 分类映射表
 * @returns {void}
 */
export function applyPlotFilter(
    plotMarkerLayers,
    selectedCategoryType,
    selectedPlotFilter,
    categoryTypeMapping
) {
    if (!plotMarkerLayers || plotMarkerLayers.length === 0) {
        return;
    }

    plotMarkerLayers.forEach(entry => {
        updateMarkerVisibility(entry, selectedCategoryType, selectedPlotFilter, categoryTypeMapping);
    });
}

/**
 * 更新标记可见性
 * @param {object} entry - 标记层条目
 * @param {string} selectedCategoryType - 选中的分类类型
 * @param {string} selectedPlotFilter - 选中的地块过滤类型
 * @param {object} categoryTypeMapping - 分类映射表
 * @returns {void}
 */
export function updateMarkerVisibility(
    entry,
    selectedCategoryType,
    selectedPlotFilter,
    categoryTypeMapping
) {
    if (!entry || !entry.layer) {
        return;
    }

    const targetType = entry.type || DEFAULT_PLOT_TYPE;
    const categoryTypes = categoryTypeMapping[selectedCategoryType] || [];
    const matchesCategory = selectedCategoryType === 'all' || categoryTypes.includes(targetType);

    const shouldShow = (
        (selectedPlotFilter === 'all' || targetType === selectedPlotFilter) &&
        matchesCategory
    );

    entry.visible = shouldShow;

    // 如果有map实例，处理显示/隐藏
    if (entry.map) {
        if (shouldShow) {
            if (!entry.map.hasLayer(entry.layer)) {
                entry.layer.addTo(entry.map);
            }
            if (entry.layer.setOpacity) {
                entry.layer.setOpacity(1);
            }
        } else {
            if (entry.map.hasLayer(entry.layer)) {
                entry.map.removeLayer(entry.layer);
            }
        }
    }
}
