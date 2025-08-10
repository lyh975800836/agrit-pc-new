<template>
  <g class="map-label" :class="labelClass">
    <!-- 标签背景 -->
    <rect
      v-if="showBackground"
      :x="position.x - backgroundWidth / 2"
      :y="position.y - backgroundHeight / 2"
      :width="backgroundWidth"
      :height="backgroundHeight"
      :rx="backgroundRadius"
      :ry="backgroundRadius"
      class="label-background"
      :fill="backgroundColor"
      :stroke="borderColor"
      :stroke-width="borderWidth"
      :opacity="backgroundOpacity"
    />
    
    <!-- 标签文字 -->
    <text
      :x="position.x"
      :y="position.y"
      class="label-text"
      :text-anchor="textAnchor"
      :dominant-baseline="dominantBaseline"
      :fill="textColor"
      :font-size="fontSize"
      :font-family="fontFamily"
      :font-weight="fontWeight"
    >
      {{ label.text }}
    </text>
    
    <!-- 连接线 -->
    <line
      v-if="showConnector && label.connector"
      :x1="position.x"
      :y1="position.y + backgroundHeight / 2"
      :x2="connector.x"
      :y2="connector.y"
      class="label-connector"
      :stroke="connectorColor"
      :stroke-width="connectorWidth"
      :stroke-dasharray="connectorDashed ? '3,3' : ''"
    />
    
    <!-- 连接点 -->
    <circle
      v-if="showConnector && label.connector"
      :cx="connector.x"
      :cy="connector.y"
      :r="connectorPointRadius"
      class="connector-point"
      :fill="connectorColor"
    />
  </g>
</template>

<script>
export default {
  name: 'MapLabel',
  props: {
    label: {
      type: Object,
      required: true
    },
    // 文字样式
    fontSize: {
      type: Number,
      default: 28
    },
    fontFamily: {
      type: String,
      default: 'SourceHanSansCN-Light'
    },
    fontWeight: {
      type: [String, Number],
      default: 300
    },
    textColor: {
      type: String,
      default: 'rgba(76, 253, 235, 1)'
    },
    textAnchor: {
      type: String,
      default: 'middle'
    },
    dominantBaseline: {
      type: String,
      default: 'middle'
    },
    // 背景样式
    showBackground: {
      type: Boolean,
      default: false
    },
    backgroundColor: {
      type: String,
      default: 'rgba(0, 0, 0, 0.7)'
    },
    backgroundOpacity: {
      type: Number,
      default: 1
    },
    borderColor: {
      type: String,
      default: 'rgba(76, 253, 235, 0.8)'
    },
    borderWidth: {
      type: Number,
      default: 1
    },
    backgroundRadius: {
      type: Number,
      default: 4
    },
    // 连接线样式
    showConnector: {
      type: Boolean,
      default: false
    },
    connectorColor: {
      type: String,
      default: 'rgba(76, 253, 235, 0.6)'
    },
    connectorWidth: {
      type: Number,
      default: 1
    },
    connectorDashed: {
      type: Boolean,
      default: true
    },
    connectorPointRadius: {
      type: Number,
      default: 2
    }
  },
  computed: {
    // 标签位置
    position() {
      return {
        x: this.longitudeToX(this.label.lng),
        y: this.latitudeToY(this.label.lat)
      }
    },
    
    // 连接点位置
    connector() {
      if (!this.label.connector) return null
      
      return {
        x: this.longitudeToX(this.label.connector.lng),
        y: this.latitudeToY(this.label.connector.lat)
      }
    },
    
    // 标签样式类
    labelClass() {
      const classes = []
      
      if (this.label.type) {
        classes.push(`label-${this.label.type}`)
      }
      
      if (this.label.priority) {
        classes.push(`priority-${this.label.priority}`)
      }
      
      return classes.join(' ')
    },
    
    // 背景尺寸
    backgroundWidth() {
      // 根据文字长度计算背景宽度
      const textLength = this.label.text ? this.label.text.length : 0
      return Math.max(textLength * this.fontSize * 0.6 + 16, 60)
    },
    
    backgroundHeight() {
      return this.fontSize + 8
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
    }
  }
}
</script>

<style lang="less" scoped>
.map-label {
  pointer-events: none;
  
  .label-background {
    transition: all 0.3s ease;
    backdrop-filter: blur(3px);
  }
  
  .label-text {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.6);
    transition: all 0.3s ease;
    font-weight: 500;
  }
  
  .label-connector {
    transition: all 0.3s ease;
  }
  
  .connector-point {
    transition: all 0.3s ease;
  }
  
  // 不同类型的标签样式
  &.label-region {
    .label-text {
      font-weight: 500;
    }
  }
  
  &.label-project {
    .label-background {
      fill: rgba(255, 193, 7, 0.7);
      stroke: rgba(255, 193, 7, 1);
    }
    
    .label-text {
      fill: rgba(255, 255, 255, 1);
    }
  }
  
  &.label-landmark {
    .label-background {
      fill: rgba(220, 53, 69, 0.7);
      stroke: rgba(220, 53, 69, 1);
    }
    
    .label-text {
      fill: rgba(255, 255, 255, 1);
    }
  }
  
  // 优先级样式
  &.priority-high {
    .label-text {
      font-size: 36px;
      font-weight: bold;
    }
    
    .label-background {
      filter: drop-shadow(0 0 8px rgba(76, 253, 235, 0.8));
    }
  }
  
  &.priority-medium {
    .label-text {
      font-size: 28px;
      font-weight: 500;
    }
  }
  
  &.priority-low {
    .label-text {
      font-size: 24px;
      opacity: 0.9;
    }
    
    .label-background {
      opacity: 0.8;
    }
  }
}

// 响应式适配
@media (max-width: 1600px) {
  .map-label {
    .label-text {
      font-size: 10px;
    }
  }
}

@media (max-width: 1200px) {
  .map-label {
    .label-text {
      font-size: 8px;
    }
    
    .label-background {
      opacity: 0.8;
    }
  }
}
</style>