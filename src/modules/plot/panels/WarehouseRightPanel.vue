<template>
  <div class="warehouse-inventory-panel">
    <div class="panel-header">
      <h3 class="panel-title">库存与物流</h3>
      <img class="title-divider" src="/images/divider.png" />
    </div>

    <!-- 库存分类 -->
    <div class="batch-module">
      <h4 class="batch-module-title">库存分类</h4>
      <div class="batch-content">
        <div class="batch-row">
          <span class="batch-label">一级品：</span>
          <span class="batch-value">180.5吨</span>
        </div>
        <div class="batch-row">
          <span class="batch-label">二级品：</span>
          <span class="batch-value">50.3吨</span>
        </div>
        <div class="batch-row">
          <span class="batch-label">三级品：</span>
          <span class="batch-value">20.0吨</span>
        </div>
      </div>
    </div>
    <img class="module-divider" src="/images/divider.png" />

    <!-- 保管条件 -->
    <div class="batch-module">
      <h4 class="batch-module-title">保管条件</h4>
      <div class="progress-content">
        <div class="progress-stage">
          <span class="stage-label">温度：</span>
          <span class="stage-value">18-22℃</span>
        </div>
        <div class="progress-stage">
          <span class="stage-label">湿度：</span>
          <span class="stage-value">55-65%</span>
        </div>
        <div class="progress-stage">
          <span class="stage-label">环境状态：</span>
          <span class="stage-value">正常</span>
        </div>
      </div>
    </div>
    <img class="module-divider" src="/images/divider.png" />

    <!-- 库存历史趋势 -->
    <div class="batch-module">
      <h4 class="batch-module-title">库存历史趋势</h4>
      <div class="trend-content">
        <p class="trend-description">最近7天库存量变化趋势</p>
        <div class="trend-chart">
          <div class="trend-bar-group">
            <div class="trend-bar" style="height: 35%;"></div>
            <span class="trend-label">周一</span>
          </div>
          <div class="trend-bar-group">
            <div class="trend-bar" style="height: 40%;"></div>
            <span class="trend-label">周二</span>
          </div>
          <div class="trend-bar-group">
            <div class="trend-bar" style="height: 38%;"></div>
            <span class="trend-label">周三</span>
          </div>
          <div class="trend-bar-group">
            <div class="trend-bar" style="height: 45%;"></div>
            <span class="trend-label">周四</span>
          </div>
          <div class="trend-bar-group">
            <div class="trend-bar" style="height: 50%;"></div>
            <span class="trend-label">周五</span>
          </div>
          <div class="trend-bar-group">
            <div class="trend-bar" style="height: 42%;"></div>
            <span class="trend-label">周六</span>
          </div>
          <div class="trend-bar-group">
            <div class="trend-bar" style="height: 55%;"></div>
            <span class="trend-label">周日</span>
          </div>
        </div>
      </div>
    </div>
    <img class="module-divider" src="/images/divider.png" />

    <!-- 待出库单据 -->
    <div class="batch-module">
      <h4 class="batch-module-title">待出库单据</h4>
      <div class="alert-content">
        <div class="alert-item">
          <span class="alert-label">待发货单：</span>
          <span class="alert-value">3笔</span>
        </div>
        <div class="alert-item">
          <span class="alert-label">预计出库(吨)：</span>
          <span class="alert-value">25.6</span>
        </div>
        <div class="alert-item">
          <span class="alert-label">最近发货时间：</span>
          <span class="alert-value">2025年11月2日 16:30</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 仓库右侧面板
 *
 * 显示仓库库存与物流信息
 * @component WarehouseRightPanel
 */
export default {
    name: 'WarehouseRightPanel'
};
</script>

<style lang="less" scoped>
/* 右侧仓库库存与物流面板 */
.warehouse-inventory-panel {
    position: relative;
    display: flex;
    overflow-y: auto;
    flex-direction: column;
    width: 375px;
    height: 734px;
    padding: 0;
    background: #041f1d;
}

.panel-header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 20px 0 0 30px;
}

.panel-title {
    margin: 0;
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 18px;
    font-weight: 500;
    color: #c7b299;
}

.title-divider {
    width: 67px;
    height: 3px;
    margin: 5px 0 0;
}

.batch-module {
    margin: 15px 30px 0;
    padding: 12px;
    border-radius: 4px;
    background: rgba(79, 253, 235, 0.08);
}

.batch-module-title {
    margin: 0 0 10px;
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 18px;
    font-weight: 500;
    color: #c7b299;
}

.batch-content,
.progress-content,
.trend-content,
.alert-content {
    font-size: 15px;
    color: #c7b299;
}

.batch-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
}

.batch-label {
    font-family: SourceHanSansCN-Medium, sans-serif;
}

.batch-value {
    font-family: SourceHanSansCN-Light, sans-serif;
    color: #4cfcea;
}

.progress-stage {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
}

.stage-label {
    font-family: SourceHanSansCN-Medium, sans-serif;
}

.stage-value {
    color: #4cfcea;
}

.trend-description {
    margin: 0 0 10px;
    font-size: 15px;
    color: #c7b299;
}

.trend-chart {
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    height: 60px;
    gap: 4px;
}

.trend-bar-group {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    height: 100%;
}

.trend-bar {
    width: 100%;
    margin-bottom: 4px;
    border-radius: 2px 2px 0 0;
    background: linear-gradient(to top, #4cfcea, #39b44a);
}

.trend-label {
    font-size: 13px;
    color: #c7b299;
}

.alert-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
}

.alert-label {
    font-family: SourceHanSansCN-Medium, sans-serif;
}

.alert-value {
    font-family: SourceHanSansCN-Light, sans-serif;
    color: #4cfcea;
}

.module-divider {
    width: 100%;
    height: 1px;
    margin: 10px 0;
    object-fit: none;
}
</style>
