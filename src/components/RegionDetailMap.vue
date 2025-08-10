<template>
  <div class="region-detail-map">
    <!-- 加载指示器 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="loading-text">{{ loadingText }}</div>
      </div>
    </div>
    
    <!-- Leaflet地图容器 -->
    <div id="leaflet-map" class="leaflet-container" :class="{ 'map-hidden': isLoading }"></div>
    
    <!-- 地块信息面板 -->
    <div class="plot-info-panel" v-if="selectedPlot">
      <div class="panel-header">
        <h4>{{ selectedPlot.name }}</h4>
        <button @click="closeInfoPanel" class="close-btn">&times;</button>
      </div>
      <div class="panel-content">
        <div class="info-item">
          <span class="label">面积:</span>
          <span class="value">{{ selectedPlot.area }}亩</span>
        </div>
        <div class="info-item">
          <span class="label">产量:</span>
          <span class="value">{{ selectedPlot.output }}吨</span>
        </div>
        <div class="info-item">
          <span class="label">类型:</span>
          <span class="value">八角种植地</span>
        </div>
      </div>
    </div>
    
    <!-- 图例 -->
    <div class="map-legend">
      <h5>图例</h5>
      <div class="legend-item">
        <div class="legend-color" style="background: rgba(76, 253, 235, 0.3); border: 2px solid #4CFDEB;"></div>
        <span>优质地块</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background: rgba(255, 215, 0, 0.3); border: 2px solid #FFD700;"></div>
        <span>普通地块</span>
      </div>
    </div>
  </div>
</template>

<script>
// 使用CDN引入的Leaflet (在index.html中已引入)
const L = window.L

export default {
  name: 'RegionDetailMap',
  props: {
    regionName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      map: null,
      regionPlots: [],
      plotLayers: [],
      selectedPlot: null,
      isLoading: true,
      loadingText: '正在初始化地图...',
      // 区域中心坐标
      regionCoordinates: {
        '百色市': [23.9, 106.6],
        '右江区': [23.9, 106.6],
        '田林县': [24.3, 106.2],
        '德保县': [23.3, 106.6],
        '靖西市': [23.1, 106.4],
        '田阳区': [23.7, 106.9],
        '田东县': [23.6, 107.1]
      }
    }
  },
  mounted() {
    // 确保Leaflet已加载
    this.$nextTick(() => {
      if (window.L) {
        this.initMap()
        this.loadRegionData()
      } else {
        // 如果Leaflet还没加载，稍等片刻再试
        setTimeout(() => {
          if (window.L) {
            this.initMap()
            this.loadRegionData()
          } else {
            console.error('Leaflet未能正确加载')
          }
        }, 1000)
      }
    })
  },
  beforeDestroy() {
    if (this.map) {
      this.map.remove()
    }
  },
  watch: {
    regionName() {
      this.loadRegionData()
    }
  },
  methods: {
    // 初始化Leaflet地图
    initMap() {
      const center = this.regionCoordinates[this.regionName] || [23.9, 106.6]
      
      this.map = L.map('leaflet-map', {
        center: center,
        zoom: 12,
        zoomControl: true,
        attributionControl: false,
        preferCanvas: true, // 使用Canvas渲染提高性能
        zoomAnimationThreshold: 4,
        fadeAnimation: false, // 禁用淡入动画提高加载速度
        zoomAnimation: false // 禁用缩放动画提高响应速度
      })

      // 添加多个地图图层 - 使用更快的瓦片服务
      const layers = {
        '高德卫星': L.tileLayer('https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', {
          attribution: '© 高德地图',
          subdomains: ['1', '2', '3', '4'],
          maxZoom: 18,
          tileSize: 256
        }),
        '天地图影像': L.tileLayer('https://t{s}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=174705aebfe31b79b3587279e211cb9a', {
          attribution: '© 天地图',
          subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
          maxZoom: 18
        }),
        '谷歌卫星': L.tileLayer('https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
          attribution: '© Google',
          subdomains: ['0', '1', '2', '3'],
          maxZoom: 18,
          tileSize: 256
        }),
        '高德地图': L.tileLayer('https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
          attribution: '© 高德地图',
          maxZoom: 18,
          tileSize: 256,
          crossOrigin: true
        })
      }

      // 默认使用高德卫星地图
      const defaultLayer = layers['高德卫星']
      
      // 监听瓦片加载事件
      let loadedTiles = 0
      let totalTiles = 0
      
      defaultLayer.on('loading', () => {
        this.loadingText = '正在加载地图瓦片...'
        loadedTiles = 0
        totalTiles = 0
      })
      
      defaultLayer.on('tileloadstart', () => {
        totalTiles++
      })
      
      defaultLayer.on('tileload', () => {
        loadedTiles++
        if (totalTiles > 0) {
          const progress = Math.round((loadedTiles / totalTiles) * 100)
          this.loadingText = `加载地图瓦片 ${progress}%`
        }
      })
      
      defaultLayer.on('load', () => {
        this.loadingText = '地图加载完成'
        setTimeout(() => {
          this.isLoading = false
        }, 500)
      })
      
      defaultLayer.addTo(this.map)

      // 添加图层控制器
      L.control.layers(layers).addTo(this.map)

      // 添加自定义指北针
      this.addCompass()
      
    },

    // 添加指北针
    addCompass() {
      const compassControl = L.control({position: 'topleft'})
      compassControl.onAdd = function() {
        const div = L.DomUtil.create('div', 'leaflet-compass')
        div.innerHTML = `
          <svg width="50" height="50" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" fill="rgba(0,0,0,0.7)" stroke="#4CFDEB" stroke-width="2"/>
            <polygon points="25,8 30,22 25,18 20,22" fill="#FF4444"/>
            <polygon points="25,35 30,22 25,27 20,22" fill="#FFFFFF"/>
            <text x="25" y="5" text-anchor="middle" fill="#FF4444" font-size="8" font-weight="bold">N</text>
          </svg>
        `
        return div
      }
      compassControl.addTo(this.map)
    },

    async loadRegionData() {
      try {
        this.loadingText = '正在加载地块数据...'
        
        // 清除现有图层
        this.clearPlotLayers()

        // 从通用文件中提取区域轮廓
        const geoJsonModule = await import('@/assets/mapdata/GeoJSON-Polygon-ok_geo4_ETD221128-250623-141758.json')
        const fullData = geoJsonModule.default || geoJsonModule
        
        // 过滤出当前区域的地块
        const regionFeatures = fullData.features.filter(feature => {
          const extPath = feature.properties?.ext_path || ''
          const name = feature.properties?.name || ''
          
          // 更灵活的匹配规则
          return extPath.includes(this.regionName) || 
                 name.includes(this.regionName) ||
                 (this.regionName === '右江区' && (extPath.includes('百色') || name.includes('百色'))) ||
                 (this.regionName === '德保县' && extPath.includes('德保')) ||
                 (this.regionName === '靖西市' && (extPath.includes('靖西') || name.includes('靖西'))) ||
                 (this.regionName === '田林县' && extPath.includes('田林')) ||
                 (this.regionName === '田阳区' && (extPath.includes('田阳') || name.includes('田阳'))) ||
                 (this.regionName === '田东县' && (extPath.includes('田东') || name.includes('田东')))
        })
        
        
        if (regionFeatures.length > 0) {
          
          // 过滤掉无效的地块
          const validFeatures = regionFeatures.filter(f => {
            const coords = f.geometry?.coordinates
            return coords && Array.isArray(coords) && coords.length > 0
          })
          
          
          // 显示全部地块
          let selectedFeatures = validFeatures.map(f => ({
            ...f,
            area: this.calculatePolygonArea(f.geometry.coordinates)
          }))
            
          // 分批添加地块到地图，避免一次性加载过多导致卡顿
          this.addPlotsProgressively(selectedFeatures)
          
          // 分批加载会自动调整视野，无需在这里重复调用
        } else {
          this.createDefaultPlots()
        }
        
      } catch (error) {
        console.error('加载地块数据失败:', error)
        this.createDefaultPlots()
      }
    },

    // 清除现有地块图层
    clearPlotLayers() {
      this.plotLayers.forEach(layer => {
        this.map.removeLayer(layer)
      })
      this.plotLayers = []
    },

    // 分批添加地块到地图
    async addPlotsProgressively(features) {
      const batchSize = 20 // 每批处理20个地块
      const totalBatches = Math.ceil(features.length / batchSize)
      
      for (let i = 0; i < totalBatches; i++) {
        const startIndex = i * batchSize
        const endIndex = Math.min(startIndex + batchSize, features.length)
        const batch = features.slice(startIndex, endIndex)
        
        this.loadingText = `正在加载地块 ${endIndex}/${features.length}`
        
        // 添加当前批次的地块
        this.addPlotsToMap(batch)
        
        // 让浏览器有时间渲染，避免阻塞UI
        await new Promise(resolve => setTimeout(resolve, 10))
      }
      
      // 所有地块加载完成后调整视野
      setTimeout(() => {
        this.fitMapToPlots(features)
      }, 100)
    },

    // 添加地块到地图
    addPlotsToMap(features) {
      
      features.forEach((feature, index) => {
        
        const plotName = feature.properties?.name || `${this.regionName}地块${index + 1}`
        const area = (feature.area || this.calculatePolygonArea(feature.geometry.coordinates)).toFixed(1)
        const output = (Math.random() * 1000 + 500).toFixed(1)
        
        // 转换坐标格式（GeoJSON格式为[lng, lat]，Leaflet需要[lat, lng]）
        const coordinates = this.convertGeoJsonCoordinates(feature.geometry.coordinates)
        
        if (coordinates.length === 0) {
          console.warn(`地块 ${plotName} 坐标转换失败，跳过`)
          return
        }
        
        const plotData = {
          name: plotName,
          area: area,
          output: output,
          feature: feature
        }

        // 创建多边形样式
        const plotStyle = {
          color: index % 2 === 0 ? '#4CFDEB' : '#FFD700',
          weight: 3,
          opacity: 0.8,
          fillColor: index % 2 === 0 ? '#4CFDEB' : '#FFD700', 
          fillOpacity: 0.2,
          dashArray: '8,4'
        }

        try {
          // 创建多边形
          const polygon = L.polygon(coordinates, plotStyle)
        
          // 添加点击事件
          polygon.on('click', () => {
            this.selectPlot(plotData)
          })
          
          // 添加悬停事件
          polygon.on('mouseover', (e) => {
            e.target.setStyle({
              weight: 4,
              fillOpacity: 0.4
            })
          })
          
          polygon.on('mouseout', (e) => {
            e.target.setStyle(plotStyle)
          })
          
          // 添加Popup
          polygon.bindPopup(`
            <div class="plot-popup">
              <h4>${plotData.name}</h4>
              <p><strong>面积:</strong> ${plotData.area}亩</p>
              <p><strong>产量:</strong> ${plotData.output}吨</p>
              <button onclick="this.parentElement.parentElement.dispatchEvent(new CustomEvent('selectPlot'))">查看详情</button>
            </div>
          `)

          // 添加到地图和图层数组
          polygon.addTo(this.map)
          this.plotLayers.push(polygon)
          
          // 保存地块数据
          this.regionPlots.push(plotData)
          
        } catch (error) {
          console.error(`添加地块 ${plotName} 失败:`, error)
        }
      })
    },

    // 转换GeoJSON坐标为Leaflet格式
    convertGeoJsonCoordinates(coords) {
      
      // GeoJSON Polygon: [[[lng,lat], [lng,lat], ...]]
      // Leaflet需要: [[lat,lng], [lat,lng], ...]
      let leafletCoords = []
      
      try {
        if (!coords || !Array.isArray(coords)) {
          console.warn('坐标数据无效或非数组')
          return []
        }
        
        // 深度检查坐标结构 - 验证嵌套数组结构
        
        // 处理标准Polygon格式: [[[lng,lat], [lng,lat], ...]]
        if (coords[0] && Array.isArray(coords[0]) && Array.isArray(coords[0][0]) && !Array.isArray(coords[0][0][0])) {
          leafletCoords = coords[0]
            .filter(coord => Array.isArray(coord) && coord.length >= 2)
            .map((coord) => {
              const converted = [parseFloat(coord[1]), parseFloat(coord[0])] // 交换lng,lat为lat,lng
              return converted
            })
            .filter(coord => !isNaN(coord[0]) && !isNaN(coord[1])) // 过滤NaN值
        }
        // 处理MultiPolygon或更深层嵌套: [[[[lng,lat], ...]]]
        else if (coords[0] && Array.isArray(coords[0]) && Array.isArray(coords[0][0]) && Array.isArray(coords[0][0][0])) {
          leafletCoords = coords[0][0]
            .filter(coord => Array.isArray(coord) && coord.length >= 2)
            .map((coord) => {
              const converted = [parseFloat(coord[1]), parseFloat(coord[0])]
              return converted
            })
            .filter(coord => !isNaN(coord[0]) && !isNaN(coord[1]))
        }
        // 处理直接的坐标数组格式: [[lng,lat], [lng,lat], ...]
        else if (coords[0] && Array.isArray(coords[0]) && typeof coords[0][0] === 'number') {
          leafletCoords = coords
            .filter(coord => Array.isArray(coord) && coord.length >= 2)
            .map((coord) => {
              const converted = [parseFloat(coord[1]), parseFloat(coord[0])]
              return converted
            })
            .filter(coord => !isNaN(coord[0]) && !isNaN(coord[1]))
        }
        
        
        // 验证坐标范围是否合理（中国境内）
        const validCoords = leafletCoords.filter(coord => {
          const lat = coord[0]
          const lng = coord[1]
          return lat >= 18 && lat <= 54 && lng >= 73 && lng <= 135
        })
        
        if (validCoords.length !== leafletCoords.length) {
          console.warn(`过滤了${leafletCoords.length - validCoords.length}个超出中国范围的坐标点`)
        }
        
        return validCoords
        
      } catch (error) {
        console.error('坐标转换失败:', error)
        return []
      }
    },

    // 调整地图视野
    fitMapToPlots(features) {
      if (features.length === 0) {
        return
      }
      
      try {
        
        if (this.plotLayers.length === 0) {
          const center = this.regionCoordinates[this.regionName] || [23.9, 106.6]
          this.map.setView(center, 12)
          return
        }
        
        // 创建图层组并获取边界
        const group = new L.featureGroup(this.plotLayers)
        const bounds = group.getBounds()
        
        
        // 检查边界是否有效
        if (bounds.isValid()) {
          this.map.fitBounds(bounds, {
            padding: [30, 30], // 减小边距
            maxZoom: 16 // 稍微提高最大缩放级别
          })
        } else {
          
          // 手动计算所有地块的边界
          let minLat = Infinity, maxLat = -Infinity
          let minLng = Infinity, maxLng = -Infinity
          
          this.plotLayers.forEach((layer) => {
            try {
              const layerBounds = layer.getBounds()
              if (layerBounds.isValid()) {
                const sw = layerBounds.getSouthWest()
                const ne = layerBounds.getNorthEast()
                
                minLat = Math.min(minLat, sw.lat)
                maxLat = Math.max(maxLat, ne.lat)
                minLng = Math.min(minLng, sw.lng)
                maxLng = Math.max(maxLng, ne.lng)
                
              }
            } catch (e) {
              console.warn('获取图层边界失败:', e)
            }
          })
          
          if (minLat !== Infinity && maxLat !== -Infinity) {
            const manualBounds = L.latLngBounds([minLat, minLng], [maxLat, maxLng])
            this.map.fitBounds(manualBounds, { padding: [30, 30], maxZoom: 16 })
          } else {
            const center = this.regionCoordinates[this.regionName] || [23.9, 106.6]
            this.map.setView(center, 12)
          }
        }
      } catch (error) {
        console.error('调整地图视野失败:', error)
        // 使用备用方案
        const center = this.regionCoordinates[this.regionName] || [23.9, 106.6]
        this.map.setView(center, 12)
      }
    },

    // 创建默认地块（当没有找到真实数据时）
    createDefaultPlots() {
      const center = this.regionCoordinates[this.regionName] || [23.9, 106.6]
      const defaultPlots = [
        {
          name: `${this.regionName}示例地块1`,
          coordinates: [
            [center[0] + 0.01, center[1] - 0.01],
            [center[0] + 0.01, center[1] + 0.01],
            [center[0] - 0.01, center[1] + 0.01],
            [center[0] - 0.01, center[1] - 0.01]
          ],
          area: '150.0',
          output: '450.5'
        }
      ]
      
      defaultPlots.forEach((plot) => {
        const polygon = L.polygon(plot.coordinates, {
          color: '#4CFDEB',
          weight: 3,
          fillColor: '#4CFDEB',
          fillOpacity: 0.2
        })
        
        polygon.bindPopup(`
          <div class="plot-popup">
            <h4>${plot.name}</h4>
            <p><strong>面积:</strong> ${plot.area}亩</p>
            <p><strong>产量:</strong> ${plot.output}吨</p>
          </div>
        `)
        
        polygon.addTo(this.map)
        this.plotLayers.push(polygon)
      })
    },

    // 计算多边形面积（简化计算）
    calculatePolygonArea(coordinates) {
      // 简化面积计算，基于坐标点数量
      if (coordinates && coordinates[0] && coordinates[0].length) {
        return coordinates[0].length * 10 // 简单的面积估算
      }
      return 100
    },

    // 选择地块
    selectPlot(plotData) {
      this.selectedPlot = plotData
    },

    // 关闭信息面板
    closeInfoPanel() {
      this.selectedPlot = null
    }
  }
}
</script>

<style scoped>
.region-detail-map {
  width: 100%;
  height: 100%;
  position: relative;
  background: #0a1420;
  border-radius: 10px;
  overflow: hidden;
}

.leaflet-container {
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* 地块信息面板 */
.plot-info-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 300px;
  background: rgba(0, 30, 60, 0.9);
  border: 1px solid #4CFDEB;
  border-radius: 8px;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #4CFDEB;
}

.panel-header h4 {
  margin: 0;
  color: #4CFDEB;
  font-size: 16px;
}

.close-btn {
  background: none;
  border: none;
  color: #4CFDEB;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #FFD700;
}

.panel-content {
  padding: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.info-item .label {
  color: #FFFFFF;
  font-weight: bold;
}

.info-item .value {
  color: #FFD700;
}

/* 图例 */
.map-legend {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 30, 60, 0.9);
  border: 1px solid #4CFDEB;
  border-radius: 8px;
  padding: 15px;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.map-legend h5 {
  margin: 0 0 10px 0;
  color: #4CFDEB;
  font-size: 14px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.legend-color {
  width: 20px;
  height: 15px;
  margin-right: 10px;
  border-radius: 3px;
}

.legend-item span {
  color: #FFFFFF;
  font-size: 12px;
}

/* Leaflet弹窗样式 */
.leaflet-popup-content {
  margin: 0;
}

.plot-popup h4 {
  margin: 0 0 10px 0;
  color: #4CFDEB;
}

.plot-popup p {
  margin: 5px 0;
  color: #333;
}

.plot-popup button {
  background: #4CFDEB;
  color: #000;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
  margin-top: 10px;
}

.plot-popup button:hover {
  background: #FFD700;
}

/* Leaflet指北针样式 */
.leaflet-compass {
  background: transparent;
  border: none;
  box-shadow: none;
}

/* 加载指示器样式 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 20, 32, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}

.loading-spinner {
  text-align: center;
  color: #4CFDEB;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(76, 253, 235, 0.3);
  border-left: 4px solid #4CFDEB;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  font-weight: bold;
  margin-top: 10px;
}

.map-hidden {
  opacity: 0.3;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .plot-info-panel {
    width: 250px;
    right: 10px;
    top: 10px;
  }
  
  .map-legend {
    left: 10px;
    bottom: 10px;
  }
  
  .loading-text {
    font-size: 14px;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
  }
}
</style>