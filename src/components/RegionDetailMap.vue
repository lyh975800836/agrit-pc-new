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
        zoom: 15, // 提高初始缩放级别
        zoomControl: false, // 禁用缩放控件
        scrollWheelZoom: false, // 禁用滚轮缩放
        doubleClickZoom: false, // 禁用双击缩放
        touchZoom: false, // 禁用触摸缩放
        boxZoom: false, // 禁用框选缩放
        keyboard: false, // 禁用键盘缩放
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

      // 不添加图层控制器和指北针
      
    },


    async loadRegionData() {
      try {
        this.loadingText = '正在加载区域轮廓...'
        
        // 清除现有图层
        this.clearPlotLayers()

        // 从区县级地图文件中加载当前区县的轮廓数据
        const baiseDataImport = await import('@/assets/mapdata/baise-districts-final.json')
        const baiseData = baiseDataImport.default || baiseDataImport
        
        // 找到当前区县的轮廓数据
        const regionFeature = baiseData.features.find(feature => 
          feature.properties.name === this.regionName
        )

        console.log(`加载区域轮廓: ${this.regionName}`)
        
        if (regionFeature) {
          console.log('找到区域轮廓数据:', regionFeature.properties.name)
          this.addRegionBoundary(regionFeature)
        } else {
          console.warn('未找到区域轮廓数据，区域名称:', this.regionName)
        }
        
        this.isLoading = false
        
      } catch (error) {
        console.error('加载区域轮廓失败:', error)
        this.isLoading = false
      }
    },

    // 添加区域边界轮廓
    addRegionBoundary(regionFeature) {
      try {
        // 创建区域轮廓图层
        const regionLayer = L.geoJSON(regionFeature, {
          style: {
            color: '#4CFDEB',
            weight: 3,
            opacity: 1,
            fillColor: 'rgba(76, 253, 235, 0.1)',
            fillOpacity: 0.1
          }
        })
        
        // 添加到地图
        regionLayer.addTo(this.map)
        this.plotLayers.push(regionLayer)
        
        // 添加区域外遮罩层效果
        this.addRegionMask(regionFeature)
        
        // 调整地图视野以适应区域边界，设置更高的最小缩放级别
        this.map.fitBounds(regionLayer.getBounds(), {
          padding: [30, 30],
          maxZoom: 17  // 设置更高的最大缩放级别
        })
        
        console.log('区域轮廓已添加到地图')
        
        // 添加地块标注，传入区域要素用于边界检查
        this.addPlotMarkers(regionFeature)
        
      } catch (error) {
        console.error('添加区域边界失败:', error)
      }
    },

    // 添加区域外遮罩层
    addRegionMask(regionFeature) {
      try {
        // 立即执行，不延迟
        // 获取区域边界而不是当前地图边界
        const geoJsonLayer = L.geoJSON(regionFeature)
        const regionBounds = geoJsonLayer.getBounds()
        
        // 扩大边界以确保完全覆盖
        const margin = Math.max(
          Math.abs(regionBounds.getNorth() - regionBounds.getSouth()) * 3,
          Math.abs(regionBounds.getEast() - regionBounds.getWest()) * 3
        )
        
        // 创建一个覆盖整个可视区域的大矩形
        const outerRing = [
          [regionBounds.getSouth() - margin, regionBounds.getWest() - margin],
          [regionBounds.getSouth() - margin, regionBounds.getEast() + margin], 
          [regionBounds.getNorth() + margin, regionBounds.getEast() + margin],
          [regionBounds.getNorth() + margin, regionBounds.getWest() - margin],
          [regionBounds.getSouth() - margin, regionBounds.getWest() - margin]
        ]
        
        // 获取区域的坐标（需要反转，作为内部洞）
        let innerRings = []
        if (regionFeature.geometry.type === 'Polygon') {
          // 对于Polygon，使用第一个坐标环，并反转坐标顺序
          const coords = regionFeature.geometry.coordinates[0]
          innerRings = [coords.map(coord => [coord[1], coord[0]]).reverse()]
        } else if (regionFeature.geometry.type === 'MultiPolygon') {
          // 对于MultiPolygon，处理所有多边形
          regionFeature.geometry.coordinates.forEach(polygon => {
            const coords = polygon[0]
            innerRings.push(coords.map(coord => [coord[1], coord[0]]).reverse())
          })
        }
        
        // 创建带洞的多边形
        const maskPolygon = L.polygon([outerRing, ...innerRings], {
          color: 'transparent',
          fillColor: 'rgba(0, 0, 0, 0.6)',
          fillOpacity: 0.6,
          weight: 0,
          interactive: false
        })
        
        // 添加遮罩到地图
        maskPolygon.addTo(this.map)
        this.plotLayers.push(maskPolygon)
        
        console.log('区域外遮罩层已添加')
        
      } catch (error) {
        console.error('添加区域遮罩失败:', error)
      }
    },

    // 添加地块标注
    addPlotMarkers(regionFeature) {
      // 生成模拟地块数据，传入区域要素而不是边界
      const plots = this.generatePlotData(regionFeature)
      
      plots.forEach((plot) => {
        // 创建自定义HTML标记
        const markerHtml = this.createPlotMarkerHtml(plot)
        
        // 创建Leaflet自定义标记
        const customIcon = L.divIcon({
          className: 'custom-plot-marker',
          html: markerHtml,
          iconSize: [105, 60],
          iconAnchor: [52.5, 30]
        })
        
        // 添加标记到地图
        const marker = L.marker([plot.lat, plot.lng], { icon: customIcon })
        marker.addTo(this.map)
        this.plotLayers.push(marker)
      })
    },

    // 生成地块数据
    generatePlotData(regionFeature) {
      const plots = []
      const usedPositions = new Set() // 用于追踪已使用的位置，避免重复
      
      // 生成更真实的地块名称
      const plotNames = [
        '那坡陵山地块', '马头山地块', '河东农场地块', '河西种植地块', 
        '北山八角地块', '南坡种植地块', '东岗农业地块', '西岭林地块',
        '中央种植地块', '新村合作地块', '老屯集体地块', '高坪示范地块',
        '龙头山地块', '凤凰岭地块', '金竹林地块', '银杏坡地块'
      ]
      
      // 获取区域边界
      const geoJsonLayer = L.geoJSON(regionFeature)
      const bounds = geoJsonLayer.getBounds()
      
      const minLat = bounds.getSouth()
      const maxLat = bounds.getNorth()  
      const minLng = bounds.getWest()
      const maxLng = bounds.getEast()
      
      // 在区域内生成合理分布的地块
      const plotCount = Math.floor(Math.random() * 5) + 10 // 10-15个地块
      
      // 创建网格分布，避免地块过于集中
      const gridSize = Math.ceil(Math.sqrt(plotCount))
      const latStep = (maxLat - minLat) / gridSize
      const lngStep = (maxLng - minLng) / gridSize
      
      // 打乱地块名称，避免重复名称
      const shuffledNames = [...plotNames].sort(() => Math.random() - 0.5)
      
      let validPlotsCount = 0
      let maxAttempts = plotCount * 5 // 增加最大尝试次数
      
      
      for (let i = 0; i < plotCount && maxAttempts > 0; i++) {
        // 基于网格的位置，加上随机偏移
        const gridRow = Math.floor(i / gridSize)
        const gridCol = i % gridSize
        
        const baseLat = minLat + gridRow * latStep + latStep * 0.5
        const baseLng = minLng + gridCol * lngStep + lngStep * 0.5
        
        let attempts = 0
        let lat, lng, positionKey, isInsideRegion = false
        
        // 尝试找到区域内的不重复位置
        while (attempts < 20 && maxAttempts > 0) {
          // 添加随机偏移，但保持在网格内
          lat = baseLat + (Math.random() - 0.5) * latStep * 0.8
          lng = baseLng + (Math.random() - 0.5) * lngStep * 0.8
          
          // 确保在边界范围内
          lat = Math.max(minLat + 0.001, Math.min(maxLat - 0.001, lat))
          lng = Math.max(minLng + 0.001, Math.min(maxLng - 0.001, lng))
          
          // 创建位置标识（精确到小数点后4位避免重复）
          positionKey = `${lat.toFixed(4)},${lng.toFixed(4)}`
          
          // 检查是否在区域内部
          isInsideRegion = this.isPointInRegion([lng, lat], regionFeature)
          
          attempts++
          maxAttempts--
          
          // 如果位置唯一且在区域内，跳出循环
          if (!usedPositions.has(positionKey) && isInsideRegion) {
            break
          }
        }
        
        // 如果找到唯一且在区域内的位置，添加地块
        if (!usedPositions.has(positionKey) && isInsideRegion) {
          usedPositions.add(positionKey)
          
          // 随机分配地块类型，确保三种类型都有
          const randomValue = Math.random()
          let type
          if (randomValue < 0.4) {
            type = 'premium'  // 40% 优质地块 (青色)
          } else if (randomValue < 0.7) {
            type = 'normal'   // 30% 普通地块 (红色)  
          } else {
            type = 'average'  // 30% 一般地块 (黄色)
          }
          
          plots.push({
            id: validPlotsCount + 1,
            name: shuffledNames[validPlotsCount % shuffledNames.length] + (Math.floor(validPlotsCount / shuffledNames.length) > 0 ? `${Math.floor(validPlotsCount / shuffledNames.length) + 1}` : ''),
            lat: lat,
            lng: lng,
            area: Math.floor(Math.random() * 50) + 20, // 20-70亩
            output: Math.floor(Math.random() * 20) + 5, // 5-25吨
            type: type
          })
          
          validPlotsCount++
        }
      }
      
      console.log(`生成了${validPlotsCount}个有效地块，全部在区域内部`)
      return plots
    },

    // 检查点是否在区域内部
    isPointInRegion(point, regionFeature) {
      try {
        // 使用turf.js的点在多边形内检测（如果可用）
        if (window.turf && window.turf.booleanPointInPolygon) {
          const turfPoint = window.turf.point(point)
          return window.turf.booleanPointInPolygon(turfPoint, regionFeature)
        }
        
        // 备选方案：使用射线法检测点在多边形内
        return this.pointInPolygon(point, regionFeature.geometry.coordinates)
        
      } catch (error) {
        console.warn('点在区域检测失败，默认返回true:', error)
        return true
      }
    },

    // 射线法检测点在多边形内（备选方案）
    pointInPolygon(point, coords) {
      try {
        const [x, y] = point
        let inside = false
        
        // 处理多边形坐标（取第一个环）
        const polygon = coords[0] || coords
        
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
          const [xi, yi] = polygon[i]
          const [xj, yj] = polygon[j]
          
          if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
            inside = !inside
          }
        }
        
        return inside
      } catch (error) {
        console.warn('射线法检测失败:', error)
        return true
      }
    },

    // 创建地块标记HTML
    createPlotMarkerHtml(plot) {
      let backgroundImage
      
      switch(plot.type) {
        case 'premium':
          backgroundImage = '/images/normal-plot-bg.png'  // 蓝色背景
          break
        case 'normal': 
          backgroundImage = '/images/alternative-plot-bg.png'  // 红色背景
          break
        case 'average':
          backgroundImage = '/images/premium-plot-bg.png'  // 黄色背景使用premium
          break
        default:
          backgroundImage = '/images/premium-plot-bg.png'
      }
      
      return `
        <div class="plot-marker" style="background-image: url('${backgroundImage}')">
          <div class="plot-content">
            <div class="plot-name">${plot.name}</div>
            <div class="plot-info">
              <span class="area-label">面积：</span><span class="area-value">${plot.area}</span><span class="area-unit">亩 | 产量：</span><span class="output-value">${plot.output}</span><span class="output-unit">吨</span>
            </div>
          </div>
        </div>
      `
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


/* 地块标注样式 - 使用全局样式确保在Leaflet中生效 */

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
  .region-info-panel {
    width: 200px;
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

<!-- 全局样式，用于Leaflet动态生成的标记 -->
<style>
/* 地块标注样式 */
.custom-plot-marker {
  background: none !important;
  border: none !important;
}

.plot-marker {
  width: 120px !important;
  height: 60px !important;
  background-size: 100% 100% !important;
  position: relative;
  cursor: pointer;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

.plot-content {
  padding: 5px 8px !important;
  height: 48px !important;
}

.plot-name {
  font-size: 9px !important;
  font-weight: bold !important;
  color: white !important;
  margin-bottom: 2px !important;
  line-height: 14px !important;
  max-width: 100px !important;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plot-info {
  font-size: 8px !important;
  color: white !important;
  line-height: 11px !important;
  display: block !important;
  width: 100% !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.area-label, .area-unit, .output-label, .output-unit {
  color: rgba(255, 255, 255, 0.9) !important;
  font-size: 9px !important;
}

.area-value, .output-value {
  font-weight: bold !important;
  color: white !important;
  margin: 0 1px !important;
  font-size: 9px !important;
}

/* 悬停效果 */
.plot-marker:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease;
  z-index: 1000;
}
</style>