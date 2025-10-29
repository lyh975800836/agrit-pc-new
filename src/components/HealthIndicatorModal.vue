<template>
  <div class="health-indicator-panel">
    <!-- 关闭按钮 -->
    <img class="close-button" src="/images/close-btn.png" @click="handleClose" alt="关闭" />
      
      <!-- 上半部分：健康指标图表 + 指标趋势表格 -->
      <div class="top-section flex-row">
        <!-- 左侧：健康指标图表区域 -->
        <div class="chart-section">
          <div class="section-title">健康指标</div>
          
          <!-- 图表区域 -->
          <div class="chart-area">
            <div class="chart-container">
              <!-- Y轴标签 -->
              <div class="y-axis">
                <span class="axis-label">100</span>
                <span class="axis-label">80</span>
                <span class="axis-label">60</span>
                <span class="axis-label">40</span>
                <span class="axis-label">20</span>
              </div>
              
              <!-- 图表内容 -->
              <div class="chart-content">
                <svg class="line-chart" viewBox="0 0 300 150">
                  <!-- 网格线 -->
                  <defs>
                    <pattern id="grid" width="37.5" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 37.5 0 L 0 0 0 30" fill="none" stroke="#4cfcea33" stroke-width="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  <!-- 折线图 -->
                  <polyline
                    fill="none"
                    stroke="#C69C6D"
                    stroke-width="2"
                    points="18,90 56,75 94,82 132,70 170,65 208,68 246,62 284,58"
                  />
                  
                  <!-- 数据点 -->
                  <circle cx="18" cy="90" r="3" fill="#C69C6D" />
                  <circle cx="56" cy="75" r="3" fill="#C69C6D" />
                  <circle cx="94" cy="82" r="3" fill="#C69C6D" />
                  <circle cx="132" cy="70" r="3" fill="#C69C6D" />
                  <circle cx="170" cy="65" r="3" fill="#C69C6D" />
                  <circle cx="208" cy="68" r="3" fill="#C69C6D" />
                  <circle cx="246" cy="62" r="3" fill="#C69C6D" />
                  <circle cx="284" cy="58" r="3" fill="#C69C6D" />
                </svg>
                
                <!-- X轴标签 -->
                <div class="x-axis">
                  <span class="axis-label">第08周</span>
                  <span class="axis-label">第09周</span>
                  <span class="axis-label">第10周</span>
                  <span class="axis-label">第11周</span>
                  <span class="axis-label">第12周</span>
                  <span class="axis-label">第13周</span>
                  <span class="axis-label">第14周</span>
                  <span class="axis-label">第15周</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：指标趋势表格 -->
        <div class="table-section">
          <div class="section-title">指标趋势表格示例</div>
          
          <!-- 表格容器 -->
          <div class="trend-table-container">
            <!-- 表头 -->
            <div class="table-header-row">
              <span class="table-cell">指标</span>
              <span class="table-cell">T-2</span>
              <span class="table-cell">T-1</span>
              <span class="table-cell">T</span>
              <span class="table-cell">趋势</span>
            </div>

            <!-- 健康指数行 -->
            <div class="table-data-row">
              <span class="data-cell">健康指数</span>
              <span class="data-cell">86</span>
              <span class="data-cell">83</span>
              <span class="data-cell">80</span>
              <div class="trend-indicator">
                <span class="trend-status trend-down">下降</span>
                <span class="trend-arrow">↓</span>
              </div>
            </div>

            <!-- 通风率评分行 -->
            <div class="table-data-row">
              <span class="data-cell">通风率评分</span>
              <span class="data-cell">良好</span>
              <span class="data-cell">一般</span>
              <span class="data-cell">一般</span>
              <span class="data-cell">稳定</span>
            </div>

            <!-- 杂草覆盖率行 -->
            <div class="table-data-row">
              <span class="data-cell">杂草覆盖率</span>
              <span class="data-cell">12%</span>
              <span class="data-cell">18%</span>
              <span class="data-cell">24%</span>
              <div class="trend-indicator">
                <span class="trend-status trend-up">上升</span>
                <span class="trend-arrow">↑</span>
              </div>
            </div>

            <!-- 病虫害评分行 -->
            <div class="table-data-row">
              <span class="data-cell">病虫害评分</span>
              <span class="data-cell">优</span>
              <span class="data-cell">良</span>
              <span class="data-cell">良</span>
              <span class="data-cell">微降</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 下半部分：巡飞图像对比 + 智能诊断 -->
      <div class="bottom-section flex-row">
        <!-- 左侧：巡飞图像对比 -->
        <div class="image-section">
          <div class="section-title">巡飞图像对比</div>
          
          <!-- 可拖动图像对比容器 -->
          <div class="image-comparison-container" ref="comparisonContainer">
            <!-- 旧图像 (底层) -->
            <img class="comparison-image-old" src="/images/old.jpg" alt="旧图像" />
            
            <!-- 新图像 (顶层，带遮罩) -->
            <div class="comparison-image-new-wrapper" :style="{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }">
              <img class="comparison-image-new" src="/images/new.jpg" alt="新图像" />
            </div>
            
            <!-- 拖动分割线 -->
            <div 
              class="comparison-slider" 
              :style="{ left: `${sliderPosition}%` }"
              @mousedown="startDrag"
            >
              <div class="slider-handle"></div>
            </div>
          </div>

          <div class="date-labels">
            <span class="date-text">2025年01月15日</span>
            <span class="date-text">2025年06月15日</span>
          </div>
        </div>

        <!-- 右侧：智能诊断与建议 -->
        <div class="diagnosis-section">
          <div class="section-title">智能诊断与建议：</div>
          
          <div class="diagnosis-content">
            <div class="diagnosis-text">
              当前阶段基本正常，但评分略有下滑，建议关注以下问题：
            </div>
            <div class="diagnosis-list">
              <div class="diagnosis-item">1. 杂草覆盖率升高，建议执行标准农事 G10(夏初除草)；</div>
              <div class="diagnosis-item">2. 病斑数量上升，应密切监测是否扩散至林间中部区域；</div>
              <div class="diagnosis-item">3. 当前周期剩余 28 天，请确保喷肥操作在8月12日前完成；</div>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
// 图片资源定义
const images = {
    tableBg: '/images/table-bg.png',
    adviceBg: '/images/advice-bg.png'
};

export default {
    name: 'HealthIndicatorModal',
    props: {
        visible: {
            type: Boolean,
            default: false
        }
    },
    emits: ['update:visible', 'close'],
    data() {
        return {
            images,
            sliderPosition: 50, // 分割线初始位置 (百分比)
            isDragging: false
        };
    },
    methods: {
        handleClose() {
            this.$emit('update:visible', false);
            this.$emit('close');
        },

        // 开始拖动
        startDrag(event) {
            this.isDragging = true;
            document.addEventListener('mousemove', this.onDrag);
            document.addEventListener('mouseup', this.stopDrag);
            event.preventDefault();
        },

        // 拖动过程
        onDrag(event) {
            if (!this.isDragging) return;

            const container = this.$refs.comparisonContainer;
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
            
            this.sliderPosition = percentage;
        },

        // 停止拖动
        stopDrag() {
            this.isDragging = false;
            document.removeEventListener('mousemove', this.onDrag);
            document.removeEventListener('mouseup', this.stopDrag);
        }
    },

    mounted() {
        // 确保在组件销毁时移除事件监听器
        this.$once('hook:beforeDestroy', () => {
            document.removeEventListener('mousemove', this.onDrag);
            document.removeEventListener('mouseup', this.stopDrag);
        });
    }
};
</script>

<style lang="less" scoped>
/* Flex 通用样式 */
.flex-col {
    display: flex;
    flex-direction: column;
}

.flex-row {
    display: flex;
    flex-direction: row;
}

.justify-between {
    justify-content: space-between;
}

/* 主面板样式 */
.health-indicator-panel {
    position: relative;
    box-sizing: border-box;
    width: 760px;
    height: 520px;
    padding: 20px;
    border: 2px solid #4cfcea4d;
    border-radius: 8px;
    background: linear-gradient(135deg, #102838f2 0%, #081c24f2 100%);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* 关闭按钮 */
.close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 20px;
    height: 20px;
    cursor: pointer;
    z-index: 10;
    
    &:hover {
        opacity: 0.8;
    }
}

/* 上半部分布局 */
.top-section {
    flex: 1;
    gap: 20px;
}

/* 下半部分布局 */
.bottom-section {
    flex: 1;
    gap: 20px;
}

/* 左侧图表区域 */
.chart-section {
    flex: 1;
    display: flex;
    flex-direction: column;
}

/* 右侧表格区域 */
.table-section {
    flex: 1;
    display: flex;
    flex-direction: column;
}

/* 底部左侧图像区域 */
.image-section {
    flex: 1;
    display: flex;
    flex-direction: column;
}

/* 底部右侧诊断区域 */
.diagnosis-section {
    flex: 1;
    display: flex;
    flex-direction: column;
}

/* 通用标题样式 */
.section-title {
    font-family: SourceHanSansCN-Medium;
    font-size: 16px;
    font-weight: 500;
    color: #C69C6D;
    margin-bottom: 15px;
}

/* 图表容器 */
.chart-container {
    display: flex;
    gap: 10px;
    height: 180px;
}

/* Y轴标签 */
.y-axis {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 150px;
    padding-top: 10px;
}

/* 图表内容区域 */
.chart-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

/* 折线图 */
.line-chart {
    width: 100%;
    height: 150px;
    margin-bottom: 10px;
}

/* X轴标签 */
.x-axis {
    display: flex;
    justify-content: space-between;
    padding: 0 20px;
}

/* 轴标签 */
.axis-label {
    font-family: SourceHanSansCN-Light;
    font-size: 11px;
    font-weight: 300;
    color: #5dd7ce;
}

/* 表格容器 */
.trend-table-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 1px solid #4cfcea33;
    border-radius: 4px;
    background: rgba(76, 252, 234, 0.05);
}

.table-header-row,
.table-data-row {
    display: flex;
    align-items: center;
    padding: 8px 5px;
    border-bottom: 1px solid #4cfcea22;
}

.table-header-row {
    background: rgba(76, 252, 234, 0.1);
    font-weight: 500;
}

.table-cell,
.data-cell {
    font-family: SourceHanSansCN-Light;
    font-size: 12px;
    font-weight: 300;
    text-align: center;
    color: #5dd7ce;
    flex: 1;
}

.data-cell {
    font-family: SourceHanSansCN-Medium;
    font-weight: 500;
    color: #C69C6D;
}

.trend-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    flex: 1;
}

.trend-status {
    font-family: SourceHanSansCN-Light;
    font-size: 12px;
    font-weight: 300;
    color: #C69C6D;
}

.trend-down {
    color: #ff6b6b;
}

.trend-up {
    color: #ffa500;
}

.trend-arrow {
    font-size: 14px;
    font-weight: bold;
}

/* 图像对比容器 */
.image-comparison-container {
    position: relative;
    width: 100%;
    height: 140px;
    margin-bottom: 10px;
    overflow: hidden;
    border-radius: 4px;
    cursor: ew-resize;
    border: 1px solid #4cfcea33;
}

/* 旧图像 (底层) */
.comparison-image-old {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* 新图像容器 (顶层，带裁剪) */
.comparison-image-new-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

/* 新图像 */
.comparison-image-new {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* 拖动分割线 */
.comparison-slider {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #C69C6D;
    cursor: ew-resize;
    z-index: 10;
    transform: translateX(-50%);
}

/* 分割线手柄 */
.slider-handle {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 16px;
    height: 16px;
    background: #C69C6D;
    border: 2px solid #ffffff;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    cursor: ew-resize;
}

.date-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
}

.date-text {
    font-family: SourceHanSansCN-Light;
    font-size: 11px;
    font-weight: 300;
    color: #C69C6D;
}

/* 诊断建议区域 */
.diagnosis-content {
    flex: 1;
    padding: 15px;
    border: 1px solid #38fe8333;
    border-radius: 4px;
    background: rgba(56, 254, 131, 0.05);
}

.diagnosis-text {
    font-family: SourceHanSansCN-Normal;
    font-size: 12px;
    line-height: 18px;
    color: #bcf7ce;
    margin-bottom: 10px;
}

.diagnosis-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.diagnosis-item {
    font-family: SourceHanSansCN-Light;
    font-size: 11px;
    line-height: 16px;
    color: #bcf7ce;
    padding-left: 10px;
    position: relative;
}
</style>
