/**
 * 地图配置文件
 * 集中管理所有地图相关配置
 */

// 瓦片服务提供商配置
export const TILE_PROVIDERS = {
  // 高德地图服务
  GAODE: {
    STANDARD: {
      url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
      options: {
        attribution: '© 高德地图',
        subdomains: ['1', '2', '3', '4'],
        maxZoom: 18,
        minZoom: 3,
        tileSize: 256,
        crossOrigin: true
      }
    },
    SATELLITE: {
      url: 'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
      options: {
        attribution: '© 高德地图',
        subdomains: ['1', '2', '3', '4'],
        maxZoom: 18,
        minZoom: 3,
        tileSize: 256,
        crossOrigin: true
      }
    },
    HYBRID: {
      url: 'https://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}',
      options: {
        attribution: '© 高德地图',
        subdomains: ['1', '2', '3', '4'],
        maxZoom: 18,
        minZoom: 3,
        tileSize: 256,
        crossOrigin: true
      }
    }
  },

  // CartoDB清爽底图
  CARTO: {
    LIGHT: {
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      options: {
        attribution: '© OpenStreetMap contributors © CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }
    },
    DARK: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      options: {
        attribution: '© OpenStreetMap contributors © CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }
    }
  },

  // OpenStreetMap
  OSM: {
    STANDARD: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      options: {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }
    }
  }
};

// 默认地图配置
export const DEFAULT_MAP_CONFIG = {
  center: [23.9, 106.6], // 百色市中心坐标
  zoom: 10,
  minZoom: 3,
  maxZoom: 18,
  zoomControl: true,
  attributionControl: true,
  scrollWheelZoom: true,
  doubleClickZoom: true,
  dragging: true
};

// 区域中心坐标配置
export const REGION_COORDINATES = {
  百色市: [23.9, 106.6],
  右江区: [23.9, 106.6],
  田林县: [24.3, 106.2],
  德保县: [23.3, 106.6],
  靖西市: [23.1, 106.4],
  田阳区: [23.7, 106.9],
  田东县: [23.6, 107.1],
  巴塘: [24.236, 106.205],
  大楞乡: [24.236, 106.205],
  新村合作地块: [24.236, 106.205]
};

// 地图样式配置
export const MAP_STYLES = {
  // 区域样式
  REGION: {
    default: {
      fillColor: '#3388ff',
      fillOpacity: 0.2,
      color: '#3388ff',
      weight: 2,
      opacity: 1
    },
    hover: {
      fillOpacity: 0.4,
      weight: 3
    },
    selected: {
      fillColor: '#ff7800',
      fillOpacity: 0.6,
      color: '#ff7800',
      weight: 3
    }
  },

  // 地块样式
  PLOT: {
    default: {
      fillColor: '#00ff00',
      fillOpacity: 0.3,
      color: '#00aa00',
      weight: 2,
      opacity: 1
    },
    hover: {
      fillOpacity: 0.6,
      weight: 3
    },
    selected: {
      fillColor: '#ffaa00',
      fillOpacity: 0.7,
      color: '#ff6600',
      weight: 3
    }
  }
};

// 图层配置
export const LAYER_CONFIG = {
  // 图层控制选项
  CONTROL: {
    position: 'topright',
    collapsed: false
  },

  // 默认可用图层
  BASE_LAYERS: {
    '清爽底图': TILE_PROVIDERS.CARTO.LIGHT,
    '标准地图': TILE_PROVIDERS.OSM.STANDARD,
    '卫星影像': TILE_PROVIDERS.GAODE.SATELLITE
  }
};

// 弹窗配置
export const POPUP_CONFIG = {
  maxWidth: 300,
  closeButton: false,
  autoPan: true,
  className: 'map-popup'
};

// 标记图标配置
export const MARKER_CONFIG = {
  default: {
    iconUrl: '/images/marker-default.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  },
  selected: {
    iconUrl: '/images/marker-selected.png',
    iconSize: [30, 46],
    iconAnchor: [15, 46],
    popupAnchor: [1, -40]
  }
};

// 加载状态配置
export const LOADING_CONFIG = {
  text: {
    init: '正在初始化地图...',
    loading: '正在加载数据...',
    error: '地图加载失败',
    success: '地图加载完成'
  },
  timeout: 10000 // 10秒超时
};