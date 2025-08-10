<template>
  <div class="left-data-panel" :style="{ backgroundImage: `url(${images.leftPanelBg})` }">
    <div class="left-slide" :style="{ backgroundImage: `url(${images.leftSlide})` }"></div>
    <!-- <div class="title-decoration" :style="{ backgroundImage: `url(${images.titleDecoration})` }"></div> -->

    <!-- 标题区域 -->
    <div class="panel-header">
      <div class="panel-title">管护项目</div>
      <div class="title-underline" :style="{ backgroundImage: `url(${images.titleUnderline})` }"></div>
    </div>
    
    <!-- 数据卡片区域 -->
    <div class="data-cards flex-row">
      <!-- 地块数卡片 -->
      <div class="data-card block-count-card" :style="{ backgroundImage: `url(${images.blockCountCard})` }">
          <div class="card-label" :style="{ backgroundImage: `url(${images.cardLabelBlock})` }"></div>
          <div class="card-data">{{ projectData.blockCount }}</div>
          <div class="label-text">-地块数-</div>
          <div class="data-details">{{ projectData.blockDetails }}</div>
      </div>
      
      <!-- 总面积卡片 -->
      <div class="data-card total-area-card" :style="{ backgroundImage: `url(${images.totalAreaCard})` }">
        <div class="card-label" :style="{ backgroundImage: `url(${images.cardLabelArea})` }"></div>
          <div class="card-data">{{ projectData.totalArea }}</div>
          <div class="label-text">-总面积（亩）-</div>
          <div class="data-details">{{ projectData.areaDetails }}</div>
      </div>
    </div>

    <div class="panel-header">
      <div class="panel-title">价格走势</div>
      <div class="title-underline" :style="{ backgroundImage: `url(${images.titleUnderline})` }"></div>
    </div>

    <!-- 价格走势图表区域 -->
    <div class="price-chart-container" :style="{ backgroundImage: `url(${images.priceChartContainer})` }">
      <!-- 价格走势图表背景 -->
      <div class="price-background" :style="{ backgroundImage: `url(${images.priceChartBg})` }"></div>
      
      <!-- 价格显示区域 -->
      <div class="price-indicator" :style="{ backgroundImage: `url(${images.priceIndicator})` }">
        <div class="price-icon" :style="{ backgroundImage: `url(${images.priceIcon})` }"></div>
        <span class="price-value">{{ projectData.price }}</span>
      </div>
      
      <!-- 月份标签 -->
      <div class="month-labels">
        <span>1月</span>
        <span>2月</span>
        <span>3月</span>
        <span>4月</span>
        <span>5月</span>
        <span>6月</span>
        <span>7月</span>
        <span>8月</span>
        <span>9月</span>
        <span>10月</span>
        <span>11月</span>
        <span>12月</span>
      </div>
    </div>

    <div class="panel-header">
      <div class="panel-title">百色八角主产区</div>
      <div class="title-underline" :style="{ backgroundImage: `url(${images.titleUnderline})` }"></div>
    </div>

    <!-- 统计表格区域 -->
    <div class="stats-section">
      <div class="table-header flex-row">
        <span class="col-region">区县</span>
        <span class="col-area">面积（万亩）</span>
        <span class="col-ratio">占比</span>
        <div class="total-info">
          <span class="total-label">总面积：</span>
          <span class="total-number">{{ statisticsData.totalArea }}</span>
          <span class="total-unit">万亩</span>
        </div>
      </div>

      <div class="table-divider" :style="{ backgroundImage: `url(${images.tableDivider})` }"></div>
      
      <div class="table-data">
        <!-- 每一行数据 -->
        <div class="data-row">
          <span class="region-cell">德保县</span>
          <span class="area-cell">38</span>
          <span class="ratio-cell">27.34%</span>
          <div class="bar-cell bar-1"></div>
        </div>
        <div class="data-row">
          <span class="region-cell">那坡县</span>
          <span class="area-cell">30</span>
          <span class="ratio-cell">21.58%</span>
          <div class="bar-cell bar-2"></div>
        </div>
        <div class="data-row">
          <span class="region-cell">右江区</span>
          <span class="area-cell">23.6</span>
          <span class="ratio-cell">16.98%</span>
          <div class="bar-cell bar-3"></div>
        </div>
        <div class="data-row">
          <span class="region-cell">田林县</span>
          <span class="area-cell">21</span>
          <span class="ratio-cell">15.11%</span>
          <div class="bar-cell bar-4"></div>
        </div>
        <div class="data-row">
          <span class="region-cell">凌云县</span>
          <span class="area-cell">17</span>
          <span class="ratio-cell">12.23%</span>
          <div class="bar-cell bar-5"></div>
        </div>
        <div class="data-row">
          <span class="region-cell">乐业县</span>
          <span class="area-cell">10</span>
          <span class="ratio-cell">7.19%</span>
          <div class="bar-cell bar-6"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LeftDataPanel',
  data() {
    return {
      images: {
        leftPanelBg: '/images/left-panel-bg.png',
        titleDecoration: '/images/title-decoration.png',
        titleUnderline: '/images/title-underline.png',
        blockCountCard: '/images/block-count-card.png',
        totalAreaCard: '/images/total-area-card.png',
        cardLabelBlock: '/images/card-label-block.png',
        cardLabelArea: '/images/card-label-area.png',
        priceChartContainer: '/images/price-chart-container.png',
        priceChartBg: '/images/price-chart-bg.png',
        priceIndicator: '/images/price-indicator.png',
        priceIcon: '/images/price-icon.png',
        tableDivider: '/images/table-divider.png',
        leftSlide: '/images/left-slide.png'
      }
    }
  },
  props: {
    projectData: {
      type: Object,
      required: true
    },
    statisticsData: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="less" scoped>
.left-data-panel {
  padding: 0 28px 35px;
  height: 734px;
  width: 375px;
  /* background moved to inline style */
  background-size: 100% 100%;
  box-sizing: border-box;
  position: relative;
}

.title-decoration {
  width: 342px;
  height: 12px;
  /* background moved to inline style */
  background-size: 100% 100%;
  margin-bottom: 10px;
}

// 标题区域
.panel-header {
  margin-bottom: 10px;
}

.panel-title {
  color: rgba(76, 253, 235, 1);
  font-size: 17px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  margin: 16px 0 5px 7px;
  padding: 0;
}

.title-underline {
  width: 68px;
  height: 3px;
  /* background moved to inline style */
  background-size: 100% 100%;
  margin: 0 0 0 7px;
}

// 数据卡片区域
.data-cards {
  margin-bottom: 24px;
  justify-content: space-between;
}

.data-card {
  width: 155px; // 原设计约372px * 0.417
  height: 196px; // 原设计约470px * 0.417
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.block-count-card {
  /* background moved to inline style */
  background-size: 100% 100%;
}

.total-area-card {
  /* background moved to inline style */
  background-size: 100% 100%;
}

.card-label {
  position: absolute;
  left: 50%;
  top: 40px; // 原设计约68px * 0.417
  transform: translateX(-50%);
  width: 132px; // 原设计约316px * 0.417
  height: 88px; // 原设计约212px * 0.417
  /* background moved to inline style */
  background-size: 100% 100%;
  z-index: 1;
}

.total-area-card .card-label {
  /* background moved to inline style */
  background-size: 100% 100%;
}

.card-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
  padding-top: 20px;
}

.card-data {
  margin-top: 18px;
  color: rgba(76, 253, 235, 1);
  font-size: 53px; // 原设计约128px * 0.417
  font-family: BebasNeueRegular;
  font-weight: normal;
  text-align: center;
  line-height: 1;
}

.label-text {
  color: rgba(76, 253, 235, 1);
  font-size: 14px; // 原设计约34px * 0.417
  font-family: SourceHanSansCN-Regular;
  font-weight: normal;
  text-align: center;
  white-space: nowrap;
  margin-bottom: 15px;
}

.data-details {
  width: 110px; // 原设计约264px * 0.417
  color: rgba(76, 253, 235, 1);
  font-size: 6px; // 原设计约14px * 0.417
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: center;
  line-height: 11px; // 原设计约26px * 0.417
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
}

// 价格走势图表容器 (基于1600x900分辨率)
.price-chart-container {
  margin-bottom: 40px;
  width: 318px; // 适配当前左侧面板宽度
  height: 143px; // 原设计约345px，按比例调整
  position: relative;
  /* background moved to inline style */
  background-size: 100% 100%;
}

// 价格走势图表背景
.price-background {
  position: absolute;
  left: 0;
  bottom: -10px; // 为月份标签留出空间
  width: 100%;
  height: 100px; // 原设计约200px，按比例调整
  /* background moved to inline style */
  background-size: contain;
  background-position: center;
}

// 价格指示器区域(3.08元的背景和文字)
.price-indicator {
  position: absolute;
  right: 80px; // 调整到右侧边缘
  bottom: 0; // 调整垂直位置
  width: 28px; // 调整宽度
  height: calc(100% - 20px); // 调整高度，不要太高
  /* background moved to inline style */
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
}

.price-icon {
  width: 8px; // 调整图标大小
  height: 10px; // 调整图标大小
  /* background moved to inline style */
  background-size: 100% 100%;
  margin: 20px 0 2px 0;
}

.price-value {
  color: rgba(76, 253, 235, 1);
  font-size: 7px; // 调整字体大小
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  white-space: nowrap;
  text-align: center;
  line-height: 1.2;
}

// 月份标签
.month-labels {
  position: absolute;
  bottom: -16px;
  width: 100%;
  color: rgba(76, 253, 235, 1);
  font-size: 9px; // 调整字体大小
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  display: flex;
  justify-content: space-between;
  
  span {
    white-space: nowrap;
    text-align: center;
    flex: 1;
    // 确保月份标签与图表网格线对齐
    position: relative;
    
    &:first-child {
      text-align: left; // 第一个月份左对齐
    }
    
    &:last-child {
      text-align: right; // 最后一个月份右对齐
    }
  }
}

// 统计表格区域 - 百色八角主产区
.stats-section {
  position: relative;
  padding: 0 0 5px 0;
}

.table-header {
  margin: 5px 0 8px 10px;
  color: rgba(76, 253, 235, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  width: 310px;
  height: 25px;
  align-items: center;
  position: relative;
  display: flex;
}

.col-region {
  flex: none;
  width: 38px;
  text-align: left;
}

.col-area {
  flex: none;
  width: 80px;
  text-align: left;
  margin-left: 8px;
}

.col-ratio {
  flex: none;
  width: 38px;
  text-align: left;
  margin-left: 10px;
}

.total-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

.total-label {
  color: rgba(76, 253, 235, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
}

.total-number {
  color: rgba(76, 253, 235, 1);
  font-size: 37px;
  font-family: BebasNeueRegular;
  font-weight: normal;
  text-align: center;
  white-space: nowrap;
  line-height: 42px;
}

.total-unit {
  color: rgba(76, 253, 235, 1);
  font-size: 16px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
}

.table-divider {
  width: 310px;
  height: 2px;
  /* background moved to inline style */
  background-size: 100% 100%;
  margin: 8px 0 0 10px;
}

.table-data {
  width: 310px;
  margin: 5px 0 0 10px;
  position: relative;
}

.left-slide {
  position: absolute;
  right: 0;
  top: 230px;
  width: 14px;
  height: 279px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

.data-row {
  display: flex;
  align-items: center;
  height: 18px;
  margin-bottom: 2px;
  color: rgba(76, 253, 235, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
}

.region-cell {
  width: 38px;
  text-align: left;
  flex-shrink: 0;
}

.area-cell {
  width: 80px;
  text-align: left;
  margin-left: 8px;
  flex-shrink: 0;
}

.ratio-cell {
  width: 38px;
  text-align: left;
  margin-left: 10px;
  flex-shrink: 0;
}

.bar-cell {
  height: 12px;
  margin-left: 15px;
  background: linear-gradient(90deg, #00C9FF 0%, #92FE9D 100%);
  border-radius: 1px;
  max-width: 110px; // 父容器宽度310px - 左侧列宽度(38+80+38) - 间距(8+10+15) = 约121px，留余量110px
  
  // 根据占比数值设置柱状图长度比例
  &.bar-1 { width: 110px !important; }   // 27.34% -> 100% (最大值)
  &.bar-2 { width: 87px !important; }    // 21.58% -> 78.9% = 87px
  &.bar-3 { width: 68px !important; }    // 16.98% -> 62.1% = 68px
  &.bar-4 { width: 61px !important; }    // 15.11% -> 55.2% = 61px
  &.bar-5 { width: 49px !important; }    // 12.23% -> 44.7% = 49px
  &.bar-6 { width: 29px !important; }    // 7.19% -> 26.3% = 29px
}


// 通用样式
.flex-row {
  display: flex;
  flex-direction: row;
}

.flex-col {
  display: flex;
  flex-direction: column;
}

.justify-center {
  justify-content: center;
}

.align-center {
  align-items: center;
}
</style>