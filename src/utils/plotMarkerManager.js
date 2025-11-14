/**
 * 地块标记管理器
 * 基于后端的 property_category_code（林/厂/仓）和 property_type_name（二级属性）进行分类和过滤
 */

// 一级分类映射：property_category_code -> 显示信息
const CATEGORY_MAP = {
    forest: {
        code: 'forest',
        name: '林',
        icon: '/images/map-filter1.png'
    },
    factory: {
        code: 'factory',
        name: '厂',
        icon: '/images/map-filter3.png'
    },
    warehouse: {
        code: 'warehouse',
        name: '仓',
        icon: '/images/map-filter7.png'
    }
};

// 二级属性映射：property_type_name -> 图标和配置
const TYPE_ICON_MAP = {
    '八角基地': '/images/map-filter1.png',        // 林
    '晒场': '/images/map-filter9.png',            // 厂
    '烘干工厂': '/images/map-filter3.png',        // 厂
    '林业产业智能园区': '/images/map-filter5.png', // 厂
    '交收仓': '/images/map-filter7.png'           // 仓
};

/**
 * 获取一级分类（林/厂/仓）的信息
 * @param {string} categoryCode - property_category_code (forest/factory/warehouse)
 * @returns {object} 分类信息
 */
export function getCategoryInfo(categoryCode) {
    return CATEGORY_MAP[categoryCode] || CATEGORY_MAP.forest;
}

/**
 * 获取二级属性（property_type_name）的图标
 * @param {string} typeName - property_type_name
 * @returns {string} 图标路径
 */
export function getTypeIcon(typeName) {
    return TYPE_ICON_MAP[typeName] || '/images/map-filter1.png';
}

/**
 * 获取地块标记的视觉配置
 * @param {object} plotData - 地块数据（包含后端返回的字段）
 * @returns {object} 视觉配置对象
 */
export function getPlotMarkerVisualConfig(plotData) {
    const categoryCode = plotData.property_category_code || 'forest';
    const typeName = plotData.property_type_name || '';
    const icon = getTypeIcon(typeName);

    return {
        backgroundImage: icon,
        typeClass: `plot-type-${categoryCode}`,
        width: 174,
        height: 82,
        anchorYOffset: 8,
        positionOffset: { lat: 0.02, lng: -0.02 },
        categoryCode,
        typeName
    };
}

/**
 * 创建地块标记 HTML
 * @param {object} plot - 地块数据
 * @param {object} plotData - 包含后端分类信息的数据
 * @returns {string} HTML 字符串
 */
export function createPlotMarkerHtml(plot, plotData) {
    const visualConfig = getPlotMarkerVisualConfig(plotData);
    const encodedName = (plot.displayName || plot.name || '').replace(/"/g, '&quot;');

    return `<div
        class="plot-marker ${visualConfig.typeClass}"
        data-category-code="${visualConfig.categoryCode}"
        data-type-name="${visualConfig.typeName}"
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
 * 检查地块是否匹配选中的分类
 * @param {string} categoryCode - property_category_code
 * @param {string} selectedCategory - 选中的分类 (all/forest/factory/warehouse)
 * @returns {boolean}
 */
export function matchCategory(categoryCode, selectedCategory) {
    return selectedCategory === 'all' || categoryCode === selectedCategory;
}

/**
 * 应用分类过滤
 * @param {array} plotMarkerLayers - 地块标记层数组
 * @param {string} selectedCategory - 选中的一级分类 (all/forest/factory/warehouse)
 * @param {string} selectedType - 选中的二级属性类型 (all/property_type_name)
 * @returns {void}
 */
export function applyPlotFilter(plotMarkerLayers, selectedCategory, selectedType) {
    if (!plotMarkerLayers || plotMarkerLayers.length === 0) {
        return;
    }

    plotMarkerLayers.forEach(entry => {
        updateMarkerVisibility(entry, selectedCategory, selectedType);
    });
}

/**
 * 更新标记可见性
 * @param {object} entry - 标记层条目 {marker, layer, categoryCode, typeName, map}
 * @param {string} selectedCategory - 选中的一级分类
 * @param {string} selectedType - 选中的二级属性
 * @returns {void}
 */
export function updateMarkerVisibility(entry, selectedCategory, selectedType) {
    if (!entry || !entry.layer) {
        return;
    }

    const categoryMatch = matchCategory(entry.categoryCode, selectedCategory);
    const typeMatch = selectedType === 'all' || entry.typeName === selectedType;
    const shouldShow = categoryMatch && typeMatch;

    entry.visible = shouldShow;

    // 处理 Leaflet 地图显示/隐藏
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

/**
 * 获取所有可用的二级属性列表（根据选中的一级分类）
 * @param {array} allPlots - 所有地块数据
 * @param {string} selectedCategory - 选中的一级分类
 * @returns {array} 二级属性名称列表
 */
export function getAvailableTypes(allPlots, selectedCategory) {
    if (!allPlots || allPlots.length === 0) {
        return [];
    }

    const filtered = selectedCategory === 'all'
        ? allPlots
        : allPlots.filter(p => p.property_category_code === selectedCategory);

    const types = new Set(filtered.map(p => p.property_type_name).filter(Boolean));
    return Array.from(types).sort();
}
