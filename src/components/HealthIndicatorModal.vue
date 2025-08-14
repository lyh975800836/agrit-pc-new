<template>
  <div class="health-indicator-panel flex-col">
    <!-- 标题和详情按钮 -->
    <div class="flex-row justify-between">
      <span class="panel-title">健康指标</span>
      <img class="detail-button" src="/images/popup-detail-btn.png" alt="查看详情" />
    </div>
    
    <!-- 健康指标背景图 -->
    <img class="chart-background" src="/images/health-indicator-bg.jpg" alt="健康指标图表" />
    <img class="chart-demo" src="/images/zhibiao-demo.png" alt="健康指标图表" />
    
    <!-- 图表区域 -->
    <!-- <div class="chart-area flex-row justify-between">
      <div class="scale-labels flex-col">
        <span class="scale-text">100</span>
        <span class="scale-text">80</span>
        <span class="scale-text">60</span>
        <span class="scale-text">40</span>
        <span class="scale-text">20</span>
      </div>
      
      <div class="chart-content-area flex-col justify-between">
        <div class="thumbnail-box flex-col">
          <div class="thumbnail-group flex-col">
            <div class="thumbnail-row flex-row">
              <img class="chart-thumbnail" src="/images/health-chart-thumb-1.jpg" alt="缩略图1" />
            </div>
            <div class="thumbnail-row flex-row justify-between">
              <img class="chart-thumbnail" src="/images/health-chart-thumb-2.jpg" alt="缩略图2" />
              <img class="chart-thumbnail" src="/images/health-chart-thumb-2.jpg" alt="缩略图3" />
            </div>
            <div class="thumbnail-row flex-row">
              <img class="chart-thumbnail" src="/images/health-chart-thumb-2.jpg" alt="缩略图4" />
              <img class="chart-thumbnail" src="/images/health-chart-thumb-2.jpg" alt="缩略图5" />
              <img class="chart-thumbnail" src="/images/health-chart-thumb-2.jpg" alt="缩略图6" />
            </div>
            <img class="chart-thumbnail" src="/images/health-chart-thumb-2.jpg" alt="缩略图7" />
            <img class="chart-thumbnail" src="/images/health-chart-thumb-2.jpg" alt="缩略图8" />
          </div>
        </div>
        
        <div class="week-labels-group flex-row">
          <span class="week-text">第08周</span>
          <span class="week-text">第09周</span>
          <span class="week-text">第10周</span>
          <span class="week-text">第11周</span>
          <span class="week-text">第12周</span>
          <span class="week-text">第13周</span>
          <span class="week-text">第14周</span>
          <span class="week-text">第15周</span>
        </div>
      </div>
    </div> -->
    
    <!-- 指标趋势表格示例 -->
    <span class="section-title">指标趋势表格示例</span>
    <img class="trend-table-bg" src="/images/trend-table-bg.jpg" alt="趋势表格背景" />
    
    <!-- 表格内容 -->
    <div class="trend-table-container flex-col" :style="{ backgroundImage: `url(${images.tableBg})` }">
      <!-- 表头 -->
      <div class="table-header-row flex-row">
        <span class="table-cell">指标</span>
        <span class="table-cell">T-2</span>
        <span class="table-cell">T-1</span>
        <span class="table-cell">T</span>
        <span class="table-cell">趋势</span>
      </div>
      
      <!-- 健康指数行 -->
      <div class="table-data-row flex-row">
        <span class="data-cell">健康指数</span>
        <span class="data-cell">86</span>
        <span class="data-cell">83</span>
        <span class="data-cell">80</span>
        <div class="trend-indicator flex-row justify-between">
          <span class="trend-status">下降</span>
          <img class="trend-icon" src="/images/trend-down-arrow.png" alt="下降" />
        </div>
      </div>
      
      <!-- 通风率评分行 -->
      <div class="table-data-row flex-row">
        <span class="data-cell">通风率评分</span>
        <span class="data-cell">良好</span>
        <span class="data-cell">一般</span>
        <span class="data-cell">一般</span>
        <span class="data-cell">稳定</span>
      </div>
      
      <!-- 杂草覆盖率行 -->
      <div class="table-data-row flex-row">
        <span class="data-cell">杂草覆盖率</span>
        <span class="data-cell">12%</span>
        <span class="data-cell">18%</span>
        <span class="data-cell">24%</span>
        <div class="trend-indicator flex-row justify-between">
          <span class="trend-status">上升</span>
          <img class="trend-icon" src="/images/trend-up-arrow.png" alt="上升" />
        </div>
      </div>
      
      <!-- 病虫害评分行 -->
      <div class="table-data-row flex-row">
        <span class="data-cell">病虫害评分</span>
        <span class="data-cell">优</span>
        <span class="data-cell">良</span>
        <span class="data-cell">良</span>
        <span class="data-cell">微降</span>
      </div>
    </div>
    
    <!-- 巡飞图像对比 -->
    <span class="section-title">巡飞图像对比</span>
    <img class="comparison-image" src="/images/comparison-image-1.jpg" alt="对比图1" />
    <img class="comparison-image2" src="/images/comparison-image-2.jpg" alt="对比图2" />
    
    <div class="date-labels flex-row justify-between">
      <span class="date-text">2025年01月15日</span>
      <span class="date-text">2025年06月15日</span>
    </div>
    
    <!-- 智能诊断与建议 -->
    <div class="diagnosis-wrapper flex-col" :style="{ backgroundImage: `url(${images.adviceBg})` }">
      <span class="diagnosis-title">智能诊断与建议：</span>
      <span class="diagnosis-text">当前阶段基本正常,但评分略有下滑,建议关注以下问题：<br />1、杂草覆盖率升高,建议执行标准农事 G10(夏初除草)<br />2、病斑数量上升,应密切监测是否扩散至林间中部区域<br />3、当前周期剩余 28 天，请确保喷肥操作在8月12日前完成</span>
    </div>
    
    <!-- 关闭按钮 -->
    <img class="close-button" src="/images/close-btn.png" @click="handleClose" alt="关闭" />
  </div>
</template>

<script>
// 图片资源定义
const images = {
  tableBg: '/images/table-bg.png',
  adviceBg: '/images/advice-bg.png'
}

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
      images
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    
    handleOverlayClick() {
      this.handleClose()
    }
  }
}
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
  width: 279px;
  height: 733px;
  background: linear-gradient(135deg, rgba(16, 40, 56, 0.95) 0%, rgba(8, 28, 36, 0.95) 100%);
  border: 2px solid rgba(76, 252, 234, 0.3);
  border-radius: 8px;
  padding: 16px;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  box-sizing: border-box;
  position: relative;
}

/* 标题区域 */
.header-section {
  margin-bottom: 12px;
}

.panel-title {
  color: rgba(76, 252, 234, 1);
  font-size: 15px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: left;
}

.detail-button {
  width: 24px;
  height: 24px;
}

/* 图表背景 */
.chart-background {
  width: 51px;
  height: auto;
  margin-bottom: 12px;
  display: block;
}

.chart-demo {

}

/* 图表区域 */
.chart-area {
  margin-bottom: 18px;
}

.scale-labels {
  width: 29px;
  justify-content: space-between;
  align-items: center;
  margin-right: 10px;
}

.scale-text {
  color: rgba(93, 215, 206, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: center;
  line-height: 10px;
}

.chart-content-area {
  flex: 1;
}

.thumbnail-box {
  margin-bottom: 12px;
}

.thumbnail-group {
  gap: 8px;
}

.thumbnail-row {
  gap: 8px;
  justify-content: flex-start;
}

.chart-thumbnail {
  width: 53px;
  height: 44px;
  object-fit: fill;
  border-radius: 2px;
  display: block;
}

.chart-thumbnail:nth-of-type(3) {
  height: 40px;
  margin-top: 3px;
}

.week-labels-group {
  justify-content: space-between;
  padding: 0 10px;
}

.week-text {
  color: rgba(93, 215, 206, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: center;
  line-height: 10px;
}

/* 部分标题 */
.section-title {
  color: rgba(76, 252, 234, 1);
  font-size: 15px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: left;
  line-height: 15px;
  margin: 17px 0 5px 0;
}

/* 趋势表格背景 */
.trend-table-bg {
  width: 103px;
  height: auto;
  margin-bottom: 10px;
}

/* 表格容器 */
.trend-table-container {
  height: 111px;
  margin-bottom: 7px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.table-header-row,
.table-data-row {
  align-items: center;
  padding: 5px 0;
}

.table-cell,
.data-cell {
  text-align: center;
  color: rgba(93, 215, 206, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  line-height: 10px;
}

.table-cell:nth-child(1),
.data-cell:nth-child(1) {
  width: 60px;
}

.table-cell:nth-child(2),
.data-cell:nth-child(2) {
  width: 30px;
}

.table-cell:nth-child(3),
.data-cell:nth-child(3) {
  width: 30px;
}

.table-cell:nth-child(4),
.data-cell:nth-child(4) {
  width: 30px;
}

.table-cell:nth-child(5),
.data-cell:nth-child(5) {
  width: 50px;
}

.data-cell {
  color: rgba(76, 252, 234, 1);
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
}

.trend-indicator {
  width: 50px;
  align-items: center;
  padding: 0 5px;
}

.trend-status {
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
}

.trend-icon {
  width: 5px;
  height: 9px;
}

/* 对比图片 */
.comparison-image {
  width: 78px;
  margin: 4px 0 8px;
}

comparison-image2 {
  width: 100%;
  height: auto;
  border-radius: 4px;
  max-height: 120px;
}

.date-labels {
  padding: 0 2%;
  margin-top: 5px;
  margin-bottom: 12px;
}

.date-text {
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
}

/* 诊断建议 */
.diagnosis-wrapper {
  width: 247px;
  height: 128px;
  margin-bottom: 15px;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.diagnosis-title {
  color: rgba(56, 254, 131, 1);
  font-size: 12px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  line-height: 12px;
  margin: 17px 0 0 15px;
}

.diagnosis-text {
  color: rgba(188, 247, 206, 1);
  font-size: 9px;
  font-family: SourceHanSansCN-Normal;
  font-weight: normal;
  text-align: left;
  line-height: 15px;
  width: 227px;
  margin: 18px 0 22px 15px;
}

/* 关闭按钮 */
.close-button {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 16px;
  height: 16px;
  cursor: pointer;
  z-index: 10;
  
  &:hover {
    opacity: 0.8;
  }
}
</style>