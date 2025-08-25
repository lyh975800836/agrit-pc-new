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
            images
        };
    },
    methods: {
        handleClose() {
            this.$emit('update:visible', false);
            this.$emit('close');
        },

        handleOverlayClick() {
            this.handleClose();
        }
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
    overflow-y: auto;
    box-sizing: border-box;
    width: 279px;
    height: 733px;
    padding: 16px;
    border: 2px solid #4cfcea4d;

    border-radius: 8px;
    background: linear-gradient(135deg, #102838f2 0%, #081c24f2 100%);
    box-shadow: 0 10px 30px #00000080;
}

/* 标题区域 */
.header-section {
    margin-bottom: 12px;
}

.panel-title {
    font-family: SourceHanSansCN-Medium;
    font-size: 15px;
    font-weight: 500;
    text-align: left;

    color: #4cfcea;
}

.detail-button {
    width: 24px;
    height: 24px;
}

/* 图表背景 */
.chart-background {
    display: block;
    width: 51px;
    height: auto;
    margin-bottom: 12px;
}

.chart-demo {

}

/* 图表区域 */
.chart-area {
    margin-bottom: 18px;
}

.scale-labels {
    align-items: center;
    justify-content: space-between;
    width: 29px;
    margin-right: 10px;
}

.scale-text {
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    font-weight: 300;
    line-height: 10px;
    text-align: center;

    color: #5dd7ce;
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
    justify-content: flex-start;
    gap: 8px;
}

.chart-thumbnail {
    display: block;
    width: 53px;
    height: 44px;

    border-radius: 2px;

    object-fit: fill;
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
    font-family: SourceHanSansCN-Medium;
    font-size: 10px;
    font-weight: 500;
    line-height: 10px;
    text-align: center;

    color: #5dd7ce;
}

/* 部分标题 */
.section-title {
    margin: 17px 0 5px;
    font-family: SourceHanSansCN-Medium;
    font-size: 15px;
    font-weight: 500;
    line-height: 15px;
    text-align: left;

    color: #4cfcea;
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

    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}

.table-header-row,
.table-data-row {
    align-items: center;
    padding: 5px 0;
}

.table-cell,
.data-cell {
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    font-weight: 300;
    line-height: 10px;
    text-align: center;

    color: #5dd7ce;
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
    font-family: SourceHanSansCN-Medium;
    font-weight: 500;
    color: #4cfcea;
}

.trend-indicator {
    align-items: center;
    width: 50px;
    padding: 0 5px;
}

.trend-status {
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    font-weight: 300;
    color: #4cfcea;
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
    max-height: 120px;
    border-radius: 4px;
}

.date-labels {
    margin-top: 5px;
    margin-bottom: 12px;
    padding: 0 2%;
}

.date-text {
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    font-weight: 300;
    color: #4cfcea;
}

/* 诊断建议 */
.diagnosis-wrapper {
    position: relative;
    width: 247px;
    height: 128px;
    margin-bottom: 15px;

    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% 100%;
}

.diagnosis-title {
    margin: 17px 0 0 15px;
    font-family: SourceHanSansCN-Medium;
    font-size: 12px;
    font-weight: 500;
    line-height: 12px;
    text-align: left;
    white-space: nowrap;

    color: #38fe83;
}

.diagnosis-text {
    width: 227px;
    margin: 18px 0 22px 15px;
    font-family: SourceHanSansCN-Normal;
    font-size: 9px;
    line-height: 15px;
    text-align: left;

    color: #bcf7ce;
}

/* 关闭按钮 */
.close-button {
    position: absolute;
    z-index: 10;
    top: 8px;
    right: 8px;
    width: 16px;
    height: 16px;

    cursor: pointer;

    &:hover {
        opacity: .8;
    }
}
</style>
