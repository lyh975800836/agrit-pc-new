<template>
  <g class="map-region" :class="{ selected, hovered, 'has-projects': hasProjects }" @click="handleClick($event)" @mouseover="handleMouseOver" @mouseleave="handleMouseLeave">
    <!-- 将所有路径合并为一个path元素，防止内部分割线 -->
    <path
      :d="combinedPath"
      class="region-path"
      :fill="getFillColor"
      :stroke="getStrokeColor"
      :stroke-width="getStrokeWidth"
      fill-rule="evenodd"
    />
    
    <!-- 区域标签 -->
    <text
      v-if="showLabel"
      :x="centroid.x"
      :y="centroid.y"
      class="region-label"
      text-anchor="middle"
      dominant-baseline="middle"
    >
      {{ region.properties.name }}
    </text>
  </g>
</template>

<script>
export default {
  name: 'MapRegion',
  props: {
    region: {
      type: Object,
      required: true
    },
    selected: {
      type: Boolean,
      default: false
    },
    showLabel: {
      type: Boolean,
      default: true
    },
    hasProjects: {
      type: Boolean,
      default: false
    },
    fillColor: {
      type: String,
      default: 'rgba(0, 184, 169, 0.8)'
    },
    strokeColor: {
      type: String,
      default: 'rgba(76, 253, 235, 0.8)'
    },
    selectedFillColor: {
      type: String,
      default: 'rgba(76, 253, 235, 0.9)'
    },
    selectedStrokeColor: {
      type: String,
      default: 'rgba(76, 253, 235, 1)'
    },
    strokeWidth: {
      type: Number,
      default: 3
    }
  },
  data() {
    return {
      hovered: false
    }
  },
  computed: {
    // 生成合并的SVG路径数据 - 防止内部分割线
    combinedPath() {
      let combinedPath = ''
      const geometry = this.region.geometry
      
      if (geometry.type === 'Polygon') {
        combinedPath = this.polygonToPath(geometry.coordinates)
      } else if (geometry.type === 'MultiPolygon') {
        // 将所有多边形合并到一个路径字符串中，使用空格分隔
        const paths = []
        geometry.coordinates.forEach((polygon) => {
          const path = this.polygonToPath(polygon)
          paths.push(path)
        })
        combinedPath = paths.join(' ')
      }
      return combinedPath
    },
    
    // 计算区域中心点
    centroid() {
      const center = this.region.properties.centroid || this.region.properties.center
      if (center) {
        return {
          x: this.longitudeToX(center[0]),
          y: this.latitudeToY(center[1])
        }
      }
      
      // 如果没有中心点数据，计算几何中心
      return this.calculateCentroid()
    },
    
    // 填充颜色 - 统一深青色系，匹配参考图层次感
    getFillColor() {
      if (this.selected) {
        return '#FF6B35' // 选中状态：橙红色突出
      }
      if (this.hovered) {
        return '#4ECDC4' // 悬停状态：浅青色
      }
      
      // 统一使用深青色调，形成层次感地图效果
      // 参考图中的深青色调：#2C5F5A, #1B4944, #0F3A35
      const regionName = this.region.properties.name || ''
      
      // 根据区域重要性和项目情况分配不同深度的青色
      if (regionName.includes('右江')) {
        return '#1B4944' // 中心区域，稍深青色
      } else if (regionName.includes('田阳') || regionName.includes('田东')) {
        return '#2C5F5A' // 重要区域，标准深青色
      } else if (regionName.includes('德保') || regionName.includes('那坡')) {
        return '#1B4944' // 项目区域，稍深青色
      } else if (regionName.includes('靖西')) {
        return '#2C5F5A' // 标准深青色
      } else if (regionName.includes('凌云') || regionName.includes('乐业')) {
        return '#1B4944' // 项目区域，稍深青色
      } else if (regionName.includes('田林')) {
        return '#1B4944' // 项目区域，稍深青色
      } else if (regionName.includes('隆林') || regionName.includes('西林')) {
        return '#2C5F5A' // 标准深青色
      } else if (regionName.includes('平果')) {
        return '#2C5F5A' // 标准深青色
      } else {
        return '#2C5F5A' // 默认深青色
      }
    },
    
    // 边框颜色 - 浅青色边界线，匹配参考图
    getStrokeColor() {
      if (this.selected) {
        return '#FFD700' // 选中：金黄色边框
      }
      if (this.hovered) {
        return '#7FDBDA' // 悬停：亮青色边框
      }
      
      // 统一的浅青色边界线，形成清晰的区域分割
      return '#7FDBDA' // 浅青色，与参考图的边界色调一致
    },
    
    // 边框宽度 - 细边框线，突出层次感
    getStrokeWidth() {
      if (this.selected) {
        return 3
      }
      if (this.hovered) {
        return 2.5
      }
      return 1.5 // 细边框线，形成清晰但不突兀的区域分割
    }
  },
  methods: {
    // 多边形坐标转SVG路径
    polygonToPath(coordinates) {
      const outerRing = coordinates[0]
      let path = ''
      
      outerRing.forEach((coord, index) => {
        const x = this.longitudeToX(coord[0])
        const y = this.latitudeToY(coord[1])
        
        if (index === 0) {
          path += `M ${x} ${y}`
        } else {
          path += ` L ${x} ${y}`
        }
      })
      
      path += ' Z'
      
      // 处理内部孔洞
      if (coordinates.length > 1) {
        for (let i = 1; i < coordinates.length; i++) {
          const innerRing = coordinates[i]
          innerRing.forEach((coord, index) => {
            const x = this.longitudeToX(coord[0])
            const y = this.latitudeToY(coord[1])
            
            if (index === 0) {
              path += ` M ${x} ${y}`
            } else {
              path += ` L ${x} ${y}`
            }
          })
          path += ' Z'
        }
      }
      
      return path
    },
    
    // 经度转X坐标 - 适配原UI地图尺寸，添加边界检查
    longitudeToX(lng) {
      if (typeof lng !== 'number' || isNaN(lng)) {
        return 0
      }
      
      const minLng = 104.4
      const maxLng = 107.6
      const ratio = Math.max(0, Math.min(1, (lng - minLng) / (maxLng - minLng)))
      const x = ratio * 1828
      
      return isNaN(x) ? 0 : x
    },
    
    // 纬度转Y坐标 - 适配原UI地图尺寸，添加边界检查
    latitudeToY(lat) {
      if (typeof lat !== 'number' || isNaN(lat)) {
        return 0
      }
      
      const minLat = 22.9
      const maxLat = 25.3
      const ratio = Math.max(0, Math.min(1, (lat - minLat) / (maxLat - minLat)))
      const y = 1098 - (ratio * 1098)
      
      return isNaN(y) ? 0 : y
    },
    
    // 计算几何中心点，添加错误处理
    calculateCentroid() {
      const geometry = this.region?.geometry
      if (!geometry || !geometry.coordinates) {
        return { x: 914, y: 549 } // 返回地图中心点作为fallback
      }
      
      let allCoords = []
      
      try {
        if (geometry.type === 'Polygon') {
          allCoords = geometry.coordinates[0] || []
        } else if (geometry.type === 'MultiPolygon') {
          allCoords = geometry.coordinates[0]?.[0] || []
        }
        
        if (allCoords.length === 0) {
          return { x: 914, y: 549 }
        }
        
        let sumX = 0, sumY = 0
        let validCount = 0
        
        allCoords.forEach(coord => {
          if (Array.isArray(coord) && coord.length >= 2) {
            const x = this.longitudeToX(coord[0])
            const y = this.latitudeToY(coord[1])
            if (!isNaN(x) && !isNaN(y)) {
              sumX += x
              sumY += y
              validCount++
            }
          }
        })
        
        if (validCount === 0) {
          return { x: 914, y: 549 }
        }
        
        return {
          x: sumX / validCount,
          y: sumY / validCount
        }
      } catch (error) {
        return { x: 914, y: 549 }
      }
    },
    
    // 处理点击事件
    handleClick(event) {
      // 阻止事件冒泡，确保我们获得准确的点击位置
      event.stopPropagation()
      this.$emit('click', this.region, event)
    },
    
    // 处理鼠标悬停
    handleMouseOver() {
      this.hovered = true
      this.$emit('hover', this.region, true)
    },
    
    // 处理鼠标离开
    handleMouseLeave() {
      this.hovered = false
      this.$emit('hover', this.region, false)
    }
  }
}
</script>

<style lang="less" scoped>
.map-region {
  cursor: pointer;
  transition: all 0.3s ease;
  
  .region-path {
    transition: all 0.3s ease;
    stroke-linejoin: round;
    stroke-linecap: round;
    stroke-opacity: 1;
    fill-opacity: 0.95; // 稍微透明，增加层次感
    shape-rendering: geometricPrecision;
    vector-effect: non-scaling-stroke;
    // 添加细微的阴影效果，增强层次感
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
  }
  
  .region-label {
    font-size: 14px;
    fill: #FFFFFF; // 白色标签，在深色背景上清晰可见
    font-family: '微软雅黑', 'Microsoft YaHei', Arial, sans-serif;
    font-weight: 600;
    pointer-events: none;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8), 
                 0 0 4px rgba(0, 0, 0, 0.6); // 深色阴影增强对比度
  }
  
  // 选中状态 - 提升亮度和阴影
  &.selected .region-path {
    stroke-width: 3 !important;
    fill-opacity: 1;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))
            drop-shadow(0 4px 12px rgba(255, 107, 53, 0.3))
            drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));
    transform: translateY(-1px);
  }
  
  // 悬停状态 - 轻微高亮效果
  &.hovered .region-path {
    stroke-width: 2.5 !important;
    fill-opacity: 1;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))
            drop-shadow(0 4px 8px rgba(78, 205, 196, 0.25))
            drop-shadow(0 0 6px rgba(127, 219, 218, 0.3));
    transform: translateY(-0.5px);
  }
}

// 响应式字体调整
@media (max-width: 1200px) {
  .map-region .region-label {
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .map-region .region-label {
    font-size: 10px;
  }
}
</style>