<template>
  <div class="map-view">
    <div class="map-container" ref="mapContainer">
      <svg 
        class="map-svg" 
        :viewBox="viewBox"
        :width="mapWidth"
        :height="mapHeight"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- 添加定义区域用于边界线样式 -->
        <defs>
          <filter id="boundary-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/> 
            </feMerge>
          </filter>
        </defs>
        <!-- 渲染地图区域 - 确保每个区县独立渲染以显示边界分割线 -->
        <g class="regions-group">
          <MapRegion
            v-for="region in regions"
            :key="region.properties.adcode || region.properties.name"
            :region="region"
            :selected="selectedRegion === region.properties.adcode"
            :has-projects="hasProjects(region)"
            :show-label="false"
            @click="handleRegionClick"
            @hover="handleRegionHover"
          />
        </g>
        
        <!-- 区县内部分割线已移除，只显示区县之间的边界 -->
        
        <!-- 渲染标注点 -->
        <MapMarker
          v-for="marker in markers"
          :key="marker.id"
          :marker="marker"
          :show-pulse="marker.highlight"
          @click="handleMarkerClick"
        />
        
        <!-- 渲染文字标签 -->
        <MapLabel
          v-for="label in labels"
          :key="label.id"
          :label="label"
        />
      </svg>
    </div>
    
    <!-- 交互弹窗 -->
    <MapPopup
      :visible="showPopup"
      :region="selectedRegionData"
      :position="popupPosition"
      :has-projects="selectedRegionHasProjects"
      @close="closePopup"
    />
  </div>
</template>

<script>
import MapRegion from './MapRegion.vue'
import MapMarker from './MapMarker.vue'
import MapLabel from './MapLabel.vue'
import MapPopup from './MapPopup.vue'

export default {
  name: 'MapView',
  components: {
    MapRegion,
    MapMarker,
    MapLabel,
    MapPopup
  },
  props: {
    // 地图数据
    mapData: {
      type: Object,
      default: () => ({ features: [] })
    },
    // 地图宽度
    mapWidth: {
      type: Number,
      default: 1828
    },
    // 地图高度
    mapHeight: {
      type: Number,
      default: 1098
    },
    // 标注点数据
    markers: {
      type: Array,
      default: () => []
    },
    // 文字标签数据
    labels: {
      type: Array,
      default: () => []
    },
    // 选中的区域
    selectedRegion: {
      type: [String, Number],
      default: null
    },
    // 有项目的区县列表
    projectRegions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      viewBox: '0 0 1828 1098',
      hoveredRegion: null,
      showPopup: false,
      selectedRegionData: null,
      popupPosition: { x: 0, y: 0 },
      selectedRegionHasProjects: false
    }
  },
  computed: {
    // 地图区域数据
    regions() {
      if (!this.mapData || !this.mapData.features) {
        return []
      }
      return this.mapData.features
    },
    
    // 计算地图边界
    mapBounds() {
      if (!this.regions.length) {
        return { minX: 0, minY: 0, maxX: 1828, maxY: 1098 }
      }
      
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      
      this.regions.forEach(region => {
        const coords = this.getRegionCoordinates(region)
        coords.forEach(coord => {
          minX = Math.min(minX, coord[0])
          maxX = Math.max(maxX, coord[0])
          minY = Math.min(minY, coord[1])
          maxY = Math.max(maxY, coord[1])
        })
      })
      
      return { minX, minY, maxX, maxY }
    }
  },
  mounted() {
    this.calculateViewBox()
  },
  methods: {
    // 计算ViewBox
    calculateViewBox() {
      const bounds = this.mapBounds
      const padding = 50
      
      const viewBoxMinX = bounds.minX - padding
      const viewBoxMinY = bounds.minY - padding
      const viewBoxWidth = bounds.maxX - bounds.minX + padding * 2
      const viewBoxHeight = bounds.maxY - bounds.minY + padding * 2
      
      this.viewBox = `${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`
    },
    
    // 获取区域坐标点
    getRegionCoordinates(region) {
      const coordinates = []
      const geometry = region.geometry
      
      if (geometry.type === 'Polygon') {
        geometry.coordinates[0].forEach(coord => {
          // 转换坐标系：经纬度转换为像素坐标
          const x = this.longitudeToX(coord[0])
          const y = this.latitudeToY(coord[1])
          coordinates.push([x, y])
        })
      } else if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach(polygon => {
          polygon[0].forEach(coord => {
            const x = this.longitudeToX(coord[0])
            const y = this.latitudeToY(coord[1])
            coordinates.push([x, y])
          })
        })
      }
      
      return coordinates
    },
    
    // 经度转X坐标
    longitudeToX(lng) {
      // 百色市经度范围大约：104.4 - 107.6
      const minLng = 104.4
      const maxLng = 107.6
      const ratio = (lng - minLng) / (maxLng - minLng)
      return ratio * this.mapWidth
    },
    
    // 纬度转Y坐标  
    latitudeToY(lat) {
      // 百色市纬度范围大约：22.9 - 25.3（Y轴需要反转）
      const minLat = 22.9
      const maxLat = 25.3
      const ratio = (lat - minLat) / (maxLat - minLat)
      return this.mapHeight - (ratio * this.mapHeight) // Y轴反转
    },
    
    // 处理区域点击 - 修复弹窗定位问题
    handleRegionClick(region, event) {
      console.log('=== 鼠标点击调试信息 ===')
      console.log('点击的区域:', region.properties.name)
      console.log('原始事件坐标 (clientX, clientY):', event.clientX, event.clientY)
      console.log('原始事件坐标 (pageX, pageY):', event.pageX, event.pageY)
      console.log('原始事件坐标 (screenX, screenY):', event.screenX, event.screenY)
      console.log('原始事件坐标 (offsetX, offsetY):', event.offsetX, event.offsetY)
      
      // 获取当前视口信息
      console.log('浏览器视口尺寸:', window.innerWidth, 'x', window.innerHeight)
      console.log('页面滚动位置:', window.scrollX, window.scrollY)
      
      this.selectedRegionData = region
      this.selectedRegionHasProjects = this.hasProjects(region)
      
      // 使用clientX和clientY获取相对于浏览器视口的位置
      const popupX = event.clientX + 10 // 稍微右偏移避免遮挡鼠标
      const popupY = event.clientY - 50 // 向上偏移避免遮挡点击位置
      
      console.log('计算的弹窗位置:', { x: popupX, y: popupY })
      
      this.popupPosition = {
        x: popupX,
        y: popupY
      }
      
      console.log('设置到 popupPosition:', this.popupPosition)
      
      this.showPopup = true
      console.log('弹窗显示状态 showPopup:', this.showPopup)
      
      // 延迟检查弹窗实际位置
      this.$nextTick(() => {
        const popupElement = document.querySelector('.group_10')
        if (popupElement) {
          const rect = popupElement.getBoundingClientRect()
          console.log('弹窗实际DOM位置:', {
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom
          })
          console.log('弹窗CSS样式:', window.getComputedStyle(popupElement).left, window.getComputedStyle(popupElement).top)
          
          // 手动将弹窗移动到body下避免变换影响
          if (popupElement.parentNode !== document.body) {
            document.body.appendChild(popupElement)
            console.log('已将弹窗移动到body下')
          }
        }
      })
      
      this.$emit('region-click', region)
    },
    
    // 处理区域悬停
    handleRegionHover(region, isHovered) {
      this.hoveredRegion = isHovered ? region.properties.adcode : null
      this.$emit('region-hover', region, isHovered)
    },
    
    // 处理标注点点击
    handleMarkerClick(marker) {
      this.$emit('marker-click', marker)
    },
    
    // 判断区域是否有项目
    hasProjects(region) {
      const regionName = region.properties.name
      return this.projectRegions.includes(regionName)
    },
    
    // 关闭弹窗
    closePopup() {
      this.showPopup = false
      this.selectedRegionData = null
      this.selectedRegionHasProjects = false
    },
    
    // 区县内部分割线相关函数已移除，只保留区县边界
  }
}
</script>

<style lang="less" scoped>
.map-view {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  // 透明背景，不显示白色背景
  background: transparent;
  
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-container {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
}

.map-svg {
  width: 100%;
  height: 100%;
  display: block;
  background: transparent;
  // 整体地图的轻微阴影效果，增强层次感
  filter: drop-shadow(0 4px 16px rgba(44, 95, 90, 0.15))
          drop-shadow(0 2px 8px rgba(44, 95, 90, 0.08));
}

// 边界线样式已移除，只使用区域组件的边框

// 区域组样式 - 主要地图显示层
.regions-group {
  z-index: 1;
}

// 响应式适配
@media (max-width: 768px) {
  .map-view {
    padding: 10px;
  }
}
</style> 