/**
 * Dashboard 配置文件
 * 统一管理数据驾驶舱的静态配置数据
 */

// 应用信息
export const APP_INFO = {
    name: '百色农林大数据中心',
    version: '1.0.0',
    theme: 'default'
};

// 默认系统设置
export const DEFAULT_SETTINGS = {
    autoRefresh: true,
    refreshInterval: 300000, // 5分钟
    language: 'zh-CN',
    timezone: 'Asia/Shanghai'
};

// 默认选中时间周期
export const DEFAULT_PERIOD = '12'; // 12个月

// 统计数据
export const STATISTICS_DATA = [
    {
        id: 'monitoring-area',
        value: '10,273',
        unit: '亩',
        label: '百燕AI监测面积',
        trendValue: '+1.5%',
        trendDirection: 'up',
        trendIcon: '/images/trend-up-arrow.png',
        backgroundImage: '/images/stat-card-1.png'
    },
    {
        id: 'productive-forest',
        value: '1,136',
        unit: '亩',
        label: '百燕AI监测丰产林面积',
        trendValue: '+7.7%',
        trendDirection: 'up',
        trendIcon: '/images/trend-up-arrow.png',
        backgroundImage: '/images/stat-card-2.png'
    },
    {
        id: 'farmer-income',
        value: '3000',
        unit: '万元',
        label: '农户收入增加总量',
        trendValue: '+4.8%',
        trendDirection: 'up',
        trendIcon: '/images/trend-up-arrow.png',
        backgroundImage: '/images/stat-card-3.png'
    },
    {
        id: 'fertilizer-reduction',
        value: '1000',
        unit: '吨',
        label: '化肥和农药减少总量',
        trendValue: '-28%',
        trendDirection: 'down',
        trendIcon: '/images/trend-down-arrow.png',
        backgroundImage: '/images/stat-card-4.png'
    }
];

// 金融数据
export const FINANCE_DATA = [
    { bank: '农业银行百色分行', amount: '--' },
    { bank: '百色市商业银行', amount: '--' },
    { bank: '邮储银行百色支行', amount: '--' },
    { bank: '农村信用合作社', amount: '--' }
];

// 采购数据
export const PURCHASE_DATA = [
    { buyer: '王守义十三香', quantity: '3000吨' },
    { buyer: '仲景食品', quantity: '600吨' },
    { buyer: '海底捞', quantity: '500吨' },
    { buyer: '杨安镇调味品集团', quantity: '500吨' }
];

// 服务队数据
export const SERVICE_TEAM_DATA = [
    { name: '顺达农林', leader: '李子顺', area: '田林', members: '50人' },
    { name: '梁油农林', leader: '李丽', area: '右江区', members: '30人' },
    { name: '龙少坤劳务', leader: '龙少坤', area: '田林', members: '30人' },
    { name: '韦仕德劳务', leader: '韦仕德', area: '德保', members: '30人' },
    { name: '杨瑞红劳务', leader: '杨瑞红', area: '右江区', members: '30人' }
];

// 地块数据
export const PLOT_DATA = [
    { name: '北山地块', location: '右江区', area: '500亩' },
    { name: '南畔地块', location: '田阳区', area: '380亩' },
    { name: '西侧地块', location: '田东县', area: '420亩' },
    { name: '东部地块', location: '德保县', area: '350亩' }
];

// 图片资源配置
export const DASHBOARD_IMAGES = {
    // 主要背景
    mainBg: '/images/dashboard-content-bg.png',
    // 统计卡片背景
    statCard1: '/images/stat-card-1.png',
    statCard2: '/images/stat-card-2.png',
    statCard3: '/images/stat-card-3.png',
    statCard4: '/images/stat-card-4.png',
    // 趋势箭头
    upArrow: '/images/trend-up-arrow.png',
    downArrow: '/images/trend-down-arrow.png',
    // 价格分析面板
    priceChartBg: '/images/price-panel-bg.png',
    insightCard: '/images/price-insight-bg.png',
    chartDisplay: '/images/price-chart-bg.png',
    // 产量统计面板
    productionChartBg: '/images/production-panel-bg.png',
    barChartBg: '/images/production-chart-bg.png',
    chartBars: '/images/production-chart-bg.png',
    // 种植面积面板
    areaChartBg: '/images/area-panel-bg.png',
    areaBars: '/images/area-chart-bg.png',
    // 分布面板
    distributionBg: '/images/map-panel-bg.png',
    backBtn: '/images/map-button-1.png',
    resetBtn: '/images/map-button-2.png',
    pieChart: '/images/map-chart-bg.png',
    // 数据表格面板
    tableBg: '/images/data-table-panel-bg.png',
    tableContentBg: '/images/data-table-bg.png',
    searchBg: '/images/search-button-bg.png',
    // 病虫害面板
    diseaseBg: '/images/disease-panel-bg.png',
    yearSelectorBg: '/images/disease-control-bg.png',
    diseasePieChartBg: '/images/disease-chart-bg.png',
    diseasePieChart: '/images/disease-indicator-bg.png',
    activeYearBg: '/images/disease-filter-bg.png',
    // 图标
    priceIcon: '/images/price-insight-icon.png',
    forecastIcon: '/images/forecast-icon.png',
    healthyIcon: '/images/disease-legend-healthy.png',
    mildIcon: '/images/disease-legend-healthy.png',
    moderateIcon: '/images/disease-legend-healthy.png',
    severeIcon: '/images/disease-legend-severe.png',
    // 下拉选择器
    timeSelectorBg: '/images/price-insight-bg.png',
    dropdownArrow: '/images/trend-down-arrow.png'
};
