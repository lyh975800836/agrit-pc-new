/**
 * 地块标记配置
 */

export const MARKER_CONFIG = {
    // 标记图标尺寸
    iconSize: 48,
    iconHalfSize: 24,

    // CSS 类名
    className: 'leaflet-marker-icon custom-plot-marker preview-mark-container',

    // 标记外观
    wrapperClass: 'plot-marker-wrapper',
    iconClass: 'plot-marker-icon',
    labelClass: 'plot-marker-label'
};

/**
 * 生成地块标记 HTML
 * @param {Object} plot - 地块数据
 * @param {Function} getTypeIcon - 获取类型图标的函数
 * @returns {String} 标记 HTML
 */
export function generatePlotMarkerHtml(plot, getTypeIcon) {
    const plotName = plot.name || plot.displayName || '';
    const icon = getTypeIcon(plot.property_type_name || '');

    return `
        <div class="${MARKER_CONFIG.wrapperClass}">
            <div class="${MARKER_CONFIG.iconClass}"
                 style="background-image: url('${icon}');
                         width: ${MARKER_CONFIG.iconSize}px;
                         height: ${MARKER_CONFIG.iconSize}px;">
            </div>
            <div class="${MARKER_CONFIG.labelClass}">${plotName}</div>
        </div>
    `.trim();
}

/**
 * 获取标记配置选项
 * @returns {Object} Leaflet divIcon 配置
 */
export function getMarkerIconConfig(htmlContent) {
    return {
        className: MARKER_CONFIG.className,
        html: htmlContent,
        iconSize: [MARKER_CONFIG.iconSize, MARKER_CONFIG.iconSize],
        iconAnchor: [MARKER_CONFIG.iconHalfSize, MARKER_CONFIG.iconHalfSize]
    };
}
