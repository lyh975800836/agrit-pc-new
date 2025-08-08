<template>
  <g class="map-marker" @click="handleClick" @mouseover="handleMouseOver" @mouseleave="handleMouseLeave">
    <!-- 标记点背景 -->
    <circle
      :cx="position.x"
      :cy="position.y"
      :r="markerSize"
      class="marker-background"
      :fill="backgroundColor"
      :stroke="strokeColor"
      :stroke-width="strokeWidth"
    />
    
    <!-- 标记点图标 -->
    <circle
      :cx="position.x"
      :cy="position.y"
      :r="markerSize - 3"
      class="marker-icon"
      :fill="iconColor"
    />
    
    <!-- 脉冲效果 -->
    <circle
      v-if="showPulse"
      :cx="position.x"
      :cy="position.y"
      :r="markerSize"
      class="marker-pulse"
      :fill="backgroundColor"
      opacity="0.6"
    />
    
    <!-- 标记文字 -->
    <text
      v-if="marker.label && showLabel"
      :x="position.x"
      :y="position.y + markerSize + 15"
      class="marker-label"
      text-anchor="middle"
      dominant-baseline="middle"
    >
      {{ marker.label }}
    </text>
    
    <!-- 悬停提示框 -->
    <g v-if="showTooltip && hovered" class="marker-tooltip">
      <rect
        :x="tooltipPosition.x - tooltipWidth / 2"
        :y="tooltipPosition.y - tooltipHeight - 10"
        :width="tooltipWidth"
        :height="tooltipHeight"
        rx="4"
        ry="4"
        class="tooltip-background"
        fill="rgba(0, 0, 0, 0.8)"
        stroke="rgba(76, 253, 235, 0.8)"
        stroke-width="1"
      />
      
      <text
        :x="tooltipPosition.x"
        :y="tooltipPosition.y - tooltipHeight + 20"
        class="tooltip-title"
        text-anchor="middle"
        fill="rgba(76, 253, 235, 1)"
        font-size="12"
        font-weight="bold"
      >
        {{ marker.title }}
      </text>
      
      <text
        v-if="marker.description"
        :x="tooltipPosition.x"
        :y="tooltipPosition.y - tooltipHeight + 35"
        class="tooltip-description"
        text-anchor="middle"
        fill="rgba(255, 255, 255, 0.9)"
        font-size="10"
      >
        {{ marker.description }}
      </text>
      
      <!-- 提示框箭头 -->
      <polygon
        :points="`${tooltipPosition.x - 5},${tooltipPosition.y - 10} ${tooltipPosition.x + 5},${tooltipPosition.y - 10} ${tooltipPosition.x},${tooltipPosition.y - 5}`"
        fill="rgba(0, 0, 0, 0.8)"
        stroke="rgba(76, 253, 235, 0.8)"
        stroke-width="1"
      />
    </g>
  </g>
</template>

<script>
export default {
  name: 'MapMarker',
  props: {
    marker: {
      type: Object,
      required: true
    },
    markerSize: {
      type: Number,
      default: 8
    },
    backgroundColor: {
      type: String,
      default: 'rgba(76, 253, 235, 0.8)'
    },
    iconColor: {
      type: String,
      default: 'rgba(255, 255, 255, 1)'
    },
    strokeColor: {
      type: String,
      default: 'rgba(76, 253, 235, 1)'
    },
    strokeWidth: {
      type: Number,
      default: 2
    },
    showLabel: {
      type: Boolean,
      default: false
    },
    showTooltip: {
      type: Boolean,
      default: true
    },
    showPulse: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      hovered: false,
      tooltipWidth: 120,
      tooltipHeight: 40
    }
  },
  computed: {
    // 标记点位置
    position() {
      return {
        x: this.longitudeToX(this.marker.lng),
        y: this.latitudeToY(this.marker.lat)
      }
    },
    
    // 提示框位置
    tooltipPosition() {
      return {
        x: this.position.x,
        y: this.position.y - this.markerSize
      }
    }
  },
  methods: {
    // 经度转X坐标 - 适配原UI地图尺寸
    longitudeToX(lng) {
      const minLng = 104.4
      const maxLng = 107.6
      const ratio = (lng - minLng) / (maxLng - minLng)
      return ratio * 1828 // 使用原UI地图宽度
    },
    
    // 纬度转Y坐标 - 适配原UI地图尺寸
    latitudeToY(lat) {
      const minLat = 22.9
      const maxLat = 25.3
      const ratio = (lat - minLat) / (maxLat - minLat)
      return 1098 - (ratio * 1098) // Y轴反转，使用原UI地图高度
    },
    
    // 处理点击事件
    handleClick() {
      this.$emit('click', this.marker)
    },
    
    // 处理鼠标悬停
    handleMouseOver() {
      this.hovered = true
    },
    
    // 处理鼠标离开
    handleMouseLeave() {
      this.hovered = false
    }
  }
}
</script>

<style lang="less" scoped>
.map-marker {
  cursor: pointer;
  
  .marker-background,
  .marker-icon {
    transition: all 0.3s ease;
  }
  
  .marker-pulse {
    animation: pulse 2s infinite;
  }
  
  .marker-label {
    font-size: 10px;
    fill: rgba(76, 253, 235, 1);
    font-family: SourceHanSansCN-Light;
    font-weight: 300;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  }
  
  .marker-tooltip {
    opacity: 0;
    animation: fadeIn 0.3s ease forwards;
  }
  
  &:hover {
    .marker-background {
      transform: scale(1.2);
      filter: drop-shadow(0 0 8px rgba(76, 253, 235, 0.8));
    }
    
    .marker-icon {
      transform: scale(1.1);
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.3;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>