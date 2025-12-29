<template>
  <div class="stats-grid">
    <div
      v-for="stat in statistics"
      :key="stat.id"
      class="stat-card"
      :style="{ backgroundImage: `url(${stat.backgroundImage})` }"
    >
      <div class="stat-content">
        <div class="stat-number">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-unit">{{ stat.unit }}</span>
        </div>
        <div class="stat-right">
          <div class="stat-trend">
            <img :src="stat.trendIcon" class="trend-icon" />
            <span class="trend-text" :class="{ 'trend-down': stat.trendDirection === 'down' }">
              {{ stat.trendValue }}
            </span>
          </div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 统计卡片网格组件
 *
 * 显示4个关键统计指标卡片
 * @component StatisticsGrid
 */
export default {
  name: 'StatisticsGrid',
  props: {
    /**
     * 统计数据数组
     * @type {Array<{id: string, value: string, unit: string, label: string, trendValue: string, trendDirection: string, trendIcon: string, backgroundImage: string}>}
     */
    statistics: {
      type: Array,
      required: true,
      default: () => []
    }
  }
};
</script>

<style lang="less" scoped>
/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin-bottom: 30px;
  gap: 20px;
}

.stat-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 141px;
  padding: 0;

  border-radius: 8px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;

  color: #c69c6d;

  gap: 20px;
}

.stat-number {
  display: flex;
  align-items: baseline;
  max-width: 45%;
  font-family: BebasNeueRegular, sans-serif;
  font-weight: 700;
  line-height: 1.1;
  word-break: break-word;
}

.stat-value {
  font-size: 58px;
}

.stat-unit {
  margin-left: 2px;
  font-size: 24px;
}

.stat-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 8px;
}

.stat-trend {
  display: flex;
  align-items: center;
  justify-content: center;
}

.trend-icon {
  width: 11px;
  height: 20px;
  margin-right: 8px;
}

.trend-text {
  font-family: BebasNeueRegular;
  font-size: 31px;
  color: #c69c6d;

  &.trend-down {
    color: #ff6b4a;
  }
}

.stat-label {
  font-family: SourceHanSansCN-Medium;
  font-size: 15px;
  color: #c69c6d;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .stat-value {
    font-size: 36px;
  }

  .stat-unit {
    font-size: 16px;
  }
}
</style>
