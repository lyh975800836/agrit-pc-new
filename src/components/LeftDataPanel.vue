<template>
  <div class="left-data-panel" :style="getLeftPanelImageStyle('BACKGROUND')">
    <div class="left-slide" :style="getLeftPanelImageStyle('LEFT_SLIDE')"></div>

    <!-- 标题区域 -->
    <div class="panel-header">
      <div class="panel-title">管护项目</div>
      <div class="title-underline" :style="getLeftPanelImageStyle('TITLE_UNDERLINE')"></div>
    </div>

    <!-- 数据卡片区域 -->
    <div class="data-cards flex-row">
      <!-- 地块数卡片 -->
      <div class="data-card block-count-card" :style="getLeftPanelImageStyle('BLOCK_COUNT_CARD')">
          <div class="card-label" :style="getLeftPanelImageStyle('CARD_LABEL_BLOCK')"></div>
          <div class="card-data">{{ projectData.blockCount }}</div>
          <div class="label-text">-地块数-</div>
          <div class="data-details">{{ projectData.blockDetails }}</div>
      </div>

      <!-- 总面积卡片 -->
      <div class="data-card total-area-card" :style="getLeftPanelImageStyle('TOTAL_AREA_CARD')">
        <div class="card-label" :style="getLeftPanelImageStyle('CARD_LABEL_AREA')"></div>
          <div class="card-data">{{ projectData.totalArea }}</div>
          <div class="label-text">-总面积（亩）-</div>
          <div class="data-details">{{ projectData.areaDetails }}</div>
      </div>
    </div>

    <div class="panel-header">
      <div class="panel-title">价格走势</div>
      <div class="title-underline" :style="getLeftPanelImageStyle('TITLE_UNDERLINE')"></div>
    </div>

    <!-- 价格走势图表区域 -->
    <div class="price-chart-container" :style="getLeftPanelImageStyle('PRICE_CHART_CONTAINER')">
      <!-- 价格走势图表背景 -->
      <div class="price-background" :style="getLeftPanelImageStyle('PRICE_CHART_BG')"></div>

      <!-- 价格显示区域 -->
      <div class="price-indicator" :style="getLeftPanelImageStyle('PRICE_INDICATOR')">
        <div class="price-icon" :style="getLeftPanelImageStyle('PRICE_ICON')"></div>
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
      <div class="title-underline" :style="getLeftPanelImageStyle('TITLE_UNDERLINE')"></div>
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

      <div class="table-divider" :style="getLeftPanelImageStyle('TABLE_DIVIDER')"></div>

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
import imageMixin from '@/mixins/imageMixin';

export default {
    name: 'LeftDataPanel',
    mixins: [imageMixin],

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
};
</script>

<style lang="less" scoped>
.left-data-panel {
    position: relative;
    box-sizing: border-box;
    width: 375px;
    height: 734px;
    padding: 0 28px 35px;

    /* background moved to inline style */
    background-size: 100% 100%;
}

.title-decoration {
    width: 342px;
    height: 12px;
    margin-bottom: 10px;

    /* background moved to inline style */
    background-size: 100% 100%;
}

// 标题区域
.panel-header {
    margin-bottom: 10px;
}

.panel-title {
    margin: 16px 0 5px 7px;
    padding: 0;
    font-family: SourceHanSansCN-Medium;
    font-size: 17px;
    font-weight: 500;

    color: #4cfdeb;
}

.title-underline {
    width: 68px;
    height: 3px;
    margin: 0 0 0 7px;

    /* background moved to inline style */
    background-size: 100% 100%;
}

// 数据卡片区域
.data-cards {
    justify-content: space-between;
    margin-bottom: 24px;
}

.data-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 155px; // 原设计约372px * 0.417
    height: 196px; // 原设计约470px * 0.417
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
    z-index: 1;
    top: 40px; // 原设计约68px * 0.417
    left: 50%;
    width: 132px; // 原设计约316px * 0.417
    height: 88px; // 原设计约212px * 0.417

    /* background moved to inline style */
    background-size: 100% 100%;
    transform: translateX(-50%);
}

.total-area-card .card-label {
    /* background moved to inline style */
    background-size: 100% 100%;
}

.card-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding-top: 20px;
}

.card-data {
    margin-top: 18px;
    font-family: BebasNeueRegular;
    font-size: 53px; // 原设计约128px * 0.417
    line-height: 1;
    text-align: center;

    color: #4cfdeb;
}

.label-text {
    margin-bottom: 15px;
    font-family: SourceHanSansCN-Regular;
    font-size: 14px; // 原设计约34px * 0.417
    text-align: center;
    white-space: nowrap;

    color: #4cfdeb;
}

.data-details {
    position: absolute;
    bottom: 14px;
    left: 50%;
    width: 110px; // 原设计约264px * 0.417
    font-family: SourceHanSansCN-Light;
    font-size: 6px; // 原设计约14px * 0.417
    font-weight: 300;
    line-height: 11px; // 原设计约26px * 0.417
    text-align: center;

    color: #4cfdeb;
    transform: translateX(-50%);
}

// 价格走势图表容器 (基于1600x900分辨率)
.price-chart-container {
    position: relative;
    width: 318px; // 适配当前左侧面板宽度
    height: 143px; // 原设计约345px，按比例调整
    margin-bottom: 40px;

    /* background moved to inline style */
    background-size: 100% 100%;
}

// 价格走势图表背景
.price-background {
    position: absolute;
    bottom: -10px; // 为月份标签留出空间
    left: 0;
    width: 100%;
    height: 100px; // 原设计约200px，按比例调整

    background-position: center;

    /* background moved to inline style */
    background-size: contain;
}

// 价格指示器区域(3.08元的背景和文字)
.price-indicator {
    position: absolute;
    z-index: 2;
    right: 80px; // 调整到右侧边缘
    bottom: 0; // 调整垂直位置
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 28px; // 调整宽度
    height: calc(100% - 20px); // 调整高度，不要太高

    /* background moved to inline style */
    background-size: 100% 100%;
}

.price-icon {
    width: 8px; // 调整图标大小
    height: 10px; // 调整图标大小
    margin: 20px 0 2px;

    /* background moved to inline style */
    background-size: 100% 100%;
}

.price-value {
    font-family: SourceHanSansCN-Medium;
    font-size: 7px; // 调整字体大小
    font-weight: 500;
    line-height: 1.2;
    text-align: center;
    white-space: nowrap;

    color: #4cfdeb;
}

// 月份标签
.month-labels {
    position: absolute;
    bottom: -16px;
    display: flex;
    justify-content: space-between;
    width: 100%;
    font-family: SourceHanSansCN-Light;
    font-size: 9px; // 调整字体大小
    font-weight: 300;

    color: #4cfdeb;

    span {
        // 确保月份标签与图表网格线对齐
        position: relative;
        flex: 1;
        text-align: center;
        white-space: nowrap;

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
    padding: 0 0 5px;
}

.table-header {
    position: relative;
    display: flex;
    align-items: center;
    width: 310px;
    height: 25px;
    margin: 5px 0 8px 10px;
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    font-weight: 300;

    color: #4cfdeb;
}

.col-region {
    flex: none;
    width: 38px;
    text-align: left;
}

.col-area {
    flex: none;
    width: 80px;
    margin-left: 8px;
    text-align: left;
}

.col-ratio {
    flex: none;
    width: 38px;
    margin-left: 10px;
    text-align: left;
}

.total-info {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: flex-end;

    gap: 4px;
}

.total-label {
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    font-weight: 300;
    color: #4cfdeb;
}

.total-number {
    font-family: BebasNeueRegular;
    font-size: 34px;
    line-height: 42px;
    text-align: center;
    white-space: nowrap;

    color: #4cfdeb;
}

.total-unit {
    font-family: SourceHanSansCN-Medium;
    font-size: 16px;
    font-weight: 500;
    color: #4cfdeb;
}

.table-divider {
    width: 310px;
    height: 2px;
    margin: 8px 0 0 10px;

    /* background moved to inline style */
    background-size: 100% 100%;
}

.table-data {
    position: relative;
    width: 310px;
    margin: 5px 0 0 10px;
}

.left-slide {
    position: absolute;
    z-index: 1;
    top: 230px;
    right: 0;
    width: 14px;
    height: 279px;

    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
}

.data-row {
    display: flex;
    align-items: center;
    height: 18px;
    margin-bottom: 2px;
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    font-weight: 300;

    color: #4cfdeb;
}

.region-cell {
    flex-shrink: 0;
    width: 38px;
    text-align: left;
}

.area-cell {
    flex-shrink: 0;
    width: 80px;
    margin-left: 8px;
    text-align: left;
}

.ratio-cell {
    flex-shrink: 0;
    width: 38px;
    margin-left: 10px;
    text-align: left;
}

.bar-cell {
    max-width: 110px; // 父容器宽度310px - 左侧列宽度(38+80+38) - 间距(8+10+15) = 约121px，留余量110px
    height: 12px;
    margin-left: 15px;

    border-radius: 1px;
    background: linear-gradient(90deg, #00c9ff 0%, #92fe9d 100%);

    // 根据占比数值设置柱状图长度比例
    &.bar-1 {
        width: 110px !important;
    }   // 27.34% -> 100% (最大值)
    &.bar-2 {
        width: 87px !important;
    }    // 21.58% -> 78.9% = 87px
    &.bar-3 {
        width: 68px !important;
    }    // 16.98% -> 62.1% = 68px
    &.bar-4 {
        width: 61px !important;
    }    // 15.11% -> 55.2% = 61px
    &.bar-5 {
        width: 49px !important;
    }    // 12.23% -> 44.7% = 49px
    &.bar-6 {
        width: 29px !important;
    }    // 7.19% -> 26.3% = 29px
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
