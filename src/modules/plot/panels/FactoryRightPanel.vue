<template>
  <div class="factory-production-panel">
    <div class="panel-header">
      <h3 class="panel-title">生产流程与批次</h3>
      <img class="title-divider" src="/images/divider.png" />
    </div>

    <!-- 当前批次 -->
    <div class="batch-module">
      <h4 class="batch-module-title">当前批次</h4>
      <div class="batch-content">
        <div class="batch-row">
          <span class="batch-label">批次编号：</span>
          <span class="batch-value">{{ currentBatch.batchNumber }}</span>
        </div>
        <div class="batch-row">
          <span class="batch-label">原料来源地：</span>
          <span class="batch-value">{{ currentBatch.sourceLocation }}</span>
        </div>
        <div class="batch-row">
          <span class="batch-label">烘干开始时间：</span>
          <span class="batch-value">{{ currentBatch.startTime }}</span>
        </div>
      </div>
    </div>
    <img class="module-divider" src="/images/divider.png" />

    <!-- 批次进度 -->
    <div class="batch-module">
      <h4 class="batch-module-title">批次进度</h4>
      <div class="progress-content">
        <div class="progress-stage">
          <span class="stage-label">当前阶段：</span>
          <span class="stage-value">{{ batchProgress.currentStage }}</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar" :style="{ width: batchProgress.percentage + '%' }"></div>
        </div>
        <div class="progress-percentage">{{ batchProgress.percentage }}%</div>
      </div>
    </div>
    <img class="module-divider" src="/images/divider.png" />

    <!-- 历史产量趋势 -->
    <div class="batch-module">
      <h4 class="batch-module-title">历史产量趋势</h4>
      <div class="trend-content">
        <p class="trend-description">最近7天烘干量变化趋势</p>
        <div class="trend-chart">
          <div
            v-for="item in productionTrend"
            :key="item.day"
            class="trend-bar-group"
          >
            <div class="trend-bar" :style="{ height: item.percentage + '%' }"></div>
            <span class="trend-label">{{ item.day }}</span>
          </div>
        </div>
      </div>
    </div>
    <img class="module-divider" src="/images/divider.png" />

    <!-- 预警与任务 -->
    <div class="batch-module">
      <h4 class="batch-module-title">预警与任务</h4>
      <div class="alert-content">
        <div class="alert-item">
          <span class="alert-label">温度异常：</span>
          <span class="alert-value">{{ alerts.temperature }}</span>
        </div>
        <div class="alert-item">
          <span class="alert-label">电流异常：</span>
          <span class="alert-value">{{ alerts.current }}</span>
        </div>
        <div class="alert-item">
          <span class="alert-label">下一批次排程时间：</span>
          <span class="alert-value">{{ alerts.nextSchedule }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 工厂右侧面板 - 生产流程与批次
 *
 * 显示当前批次、生产进度、历史趋势和预警信息
 * @component FactoryRightPanel
 */
export default {
    name: 'FactoryRightPanel',
    props: {
        productionData: {
            type: Object,
            required: true
        }
    },
    computed: {
        currentBatch() {
            return this.productionData?.currentBatch || {
                batchNumber: 'DH-2025-001',
                sourceLocation: '右江区',
                startTime: '2025年11月2日 08:30'
            };
        },
        batchProgress() {
            return this.productionData?.batchProgress || {
                currentStage: '加热中',
                percentage: 45
            };
        },
        productionTrend() {
            return this.productionData?.productionTrend || [];
        },
        alerts() {
            return this.productionData?.alerts || {
                temperature: '正常',
                current: '正常',
                nextSchedule: '2025年11月2日 14:00'
            };
        }
    }
};
</script>

<style lang="less" scoped>
/* 右侧生产流程面板 */
.factory-production-panel {
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

.progress-bar-container {
    overflow: hidden;
    width: 100%;
    height: 6px;
    margin-bottom: 4px;

    border-radius: 3px;
    background: rgba(76, 253, 234, 0.2);
}

.progress-bar {
    height: 100%;
    border-radius: 3px;
    background: linear-gradient(to right, #4cfcea, #39b44a);
    transition: width 0.3s ease;
}

.progress-percentage {
    text-align: right;
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
