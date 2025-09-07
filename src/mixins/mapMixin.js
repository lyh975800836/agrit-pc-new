/**
 * 地图混入 - 提供通用地图功能
 * 复用地图初始化、事件处理等逻辑
 */

import mapService from '@/services/mapService.js';

export default {
  data() {
    return {
      // 地图实例
      map: null,
      
      // 加载状态
      isLoading: true,
      loadingText: '正在初始化地图...',
      
      // 图层管理
      layers: {
        regions: [],
        markers: [],
        plots: [],
        labels: []
      },
      
      // 控制器
      layerControl: null,
      
      // 当前选中项
      selectedFeature: null
    };
  },

  computed: {
    /**
     * 获取加载配置
     */
    loadingConfig() {
      return mapService.getLoadingConfig();
    },

    /**
     * 地图容器ID
     */
    mapContainerId() {
      return this.containerId || 'leaflet-map';
    }
  },

  mounted() {
    this.initializeMap();
  },

  beforeDestroy() {
    this.cleanup();
  },

  methods: {
    /**
     * 初始化地图
     */
    async initializeMap() {
      try {
        this.setLoadingText('正在初始化地图...');
        
        // 等待DOM渲染完成
        await this.$nextTick();
        
        // 创建地图实例
        this.map = mapService.createMap(this.mapContainerId, this.getMapConfig());
        
        // 添加默认瓦片图层
        this.addDefaultTileLayer();
        
        // 添加图层控制器
        if (this.enableLayerControl !== false) {
          this.addLayerControl();
        }
        
        // 加载地图数据
        await this.loadMapData();
        
        // 地图加载完成
        this.onMapReady();
        
      } catch (error) {
        console.error('地图初始化失败:', error);
        this.handleMapError(error);
      }
    },

    /**
     * 获取地图配置 - 子组件可重写
     */
    getMapConfig() {
      return {
        center: this.initialCenter || [23.9, 106.6],
        zoom: this.initialZoom || 10
      };
    },

    /**
     * 添加默认瓦片图层
     */
    addDefaultTileLayer() {
      const provider = this.tileProvider || 'GAODE';
      const type = this.tileType || 'SATELLITE';
      
      this.baseTileLayer = mapService.addTileLayer(this.map, provider, type);
    },

    /**
     * 添加图层控制器
     */
    addLayerControl() {
      this.layerControl = mapService.addLayerControl(this.map);
    },

    /**
     * 加载地图数据 - 子组件需实现
     */
    async loadMapData() {
      // 子组件实现具体的数据加载逻辑
      console.log('loadMapData 需要在子组件中实现');
    },

    /**
     * 地图准备就绪回调
     */
    onMapReady() {
      this.isLoading = false;
      this.loadingText = this.loadingConfig.text.success;
      this.$emit('map-ready', this.map);
      
      // 触发地图准备就绪事件
      this.$nextTick(() => {
        this.$emit('map-initialized');
      });
    },

    /**
     * 处理地图错误
     */
    handleMapError(error) {
      this.isLoading = false;
      this.loadingText = this.loadingConfig.text.error;
      this.$emit('map-error', error);
    },

    /**
     * 设置加载文本
     */
    setLoadingText(text) {
      this.loadingText = text;
    },

    /**
     * 添加区域图层
     */
    addRegionLayer(geojsonData, options = {}) {
      const regionLayer = mapService.addGeoJSONLayer(this.map, geojsonData, {
        onFeatureClick: this.onRegionClick,
        ...options
      });
      
      this.layers.regions.push(regionLayer);
      return regionLayer;
    },

    /**
     * 添加标记图层
     */
    addMarkerLayer(coordinates, options = {}) {
      const marker = mapService.addMarker(this.map, coordinates, options);
      
      // 绑定点击事件
      if (options.onClick) {
        marker.on('click', options.onClick);
      }
      
      this.layers.markers.push(marker);
      return marker;
    },

    /**
     * 添加弹窗
     */
    bindPopup(layer, content, options = {}) {
      mapService.bindPopup(layer, content, options);
    },

    /**
     * 缩放到指定区域
     */
    fitBounds(bounds, options = {}) {
      mapService.fitBounds(this.map, bounds, options);
    },

    /**
     * 设置地图视图
     */
    setMapView(center, zoom) {
      mapService.setView(this.map, center, zoom);
    },

    /**
     * 获取区域坐标
     */
    getRegionCoordinates(regionName) {
      return mapService.getRegionCoordinates(regionName);
    },

    /**
     * 区域点击事件处理 - 子组件可重写
     */
    onRegionClick(feature, layer, event) {
      this.selectedFeature = feature;
      this.$emit('region-click', feature, layer, event);
    },

    /**
     * 标记点击事件处理 - 子组件可重写
     */
    onMarkerClick(marker, event) {
      this.$emit('marker-click', marker, event);
    },

    /**
     * 清除指定类型的图层
     */
    clearLayers(type = 'all') {
      if (type === 'all') {
        // 清除所有图层
        Object.keys(this.layers).forEach(layerType => {
          this.clearLayerType(layerType);
        });
      } else {
        // 清除指定类型图层
        this.clearLayerType(type);
      }
    },

    /**
     * 清除指定类型图层
     */
    clearLayerType(type) {
      if (this.layers[type]) {
        this.layers[type].forEach(layer => {
          mapService.removeLayer(this.map, layer);
        });
        this.layers[type] = [];
      }
    },

    /**
     * 高亮显示要素
     */
    highlightFeature(feature) {
      // 子组件可重写此方法实现自定义高亮逻辑
      console.log('高亮显示要素:', feature);
    },

    /**
     * 取消高亮显示
     */
    unhighlightFeature() {
      // 子组件可重写此方法
      console.log('取消高亮显示');
    },

    /**
     * 获取地图边界
     */
    getMapBounds() {
      return this.map ? this.map.getBounds() : null;
    },

    /**
     * 获取当前地图中心
     */
    getMapCenter() {
      return this.map ? this.map.getCenter() : null;
    },

    /**
     * 获取当前缩放级别
     */
    getZoomLevel() {
      return this.map ? this.map.getZoom() : 0;
    },

    /**
     * 刷新地图
     */
    refreshMap() {
      if (this.map) {
        this.map.invalidateSize();
      }
    },

    /**
     * 清理资源
     */
    cleanup() {
      // 清除所有图层
      this.clearLayers();
      
      // 销毁地图实例
      if (this.mapContainerId) {
        mapService.destroyMap(this.mapContainerId);
      }
      
      // 清理全局函数
      this.cleanupGlobalFunctions();
    },

    /**
     * 清理全局函数 - 子组件可重写
     */
    cleanupGlobalFunctions() {
      // 子组件实现具体的全局函数清理逻辑
    },

    /**
     * 处理地图视图变化
     */
    onMapViewChanged() {
      this.$emit('view-changed', {
        center: this.getMapCenter(),
        zoom: this.getZoomLevel(),
        bounds: this.getMapBounds()
      });
    },

    /**
     * 添加地图事件监听
     */
    addMapEventListeners() {
      if (this.map) {
        this.map.on('moveend', this.onMapViewChanged);
        this.map.on('zoomend', this.onMapViewChanged);
      }
    },

    /**
     * 移除地图事件监听
     */
    removeMapEventListeners() {
      if (this.map) {
        this.map.off('moveend', this.onMapViewChanged);
        this.map.off('zoomend', this.onMapViewChanged);
      }
    }
  }
};