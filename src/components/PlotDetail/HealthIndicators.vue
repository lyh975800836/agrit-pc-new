<template>
  <div class="health-section">
    <!-- 健康指标头部 -->
    <div class="health-header">
      <span class="health-title">林地健康指标</span>
      <div class="health-link" @click="$emit('show-health-modal')">
        <span class="link-text">查看详情</span>
        <span class="link-arrow">>></span>
      </div>
    </div>

    <!-- 分隔线 -->
    <img class="third-divider" src="/images/decoration-2.png" />

    <!-- 健康指标容器 -->
    <div class="health-indicators">
      <!-- 郁闭度 -->
      <div class="health-indicator">
        <div class="circular-progress" :style="{ '--percentage': indicators[0].percentage }">
          <div class="circle-bg"></div>
          <div class="circle" :style="{ '--percentage': indicators[0].percentage }"></div>
          <div class="percentage">{{ indicators[0].percentage }}%</div>
        </div>
        <div class="indicator-label">{{ indicators[0].label }}</div>
      </div>

      <!-- 生长匹配度 -->
      <div class="health-indicator">
        <div class="circular-progress" :style="{ '--percentage': indicators[1].percentage }">
          <div class="circle-bg"></div>
          <div class="circle" :style="{ '--percentage': indicators[1].percentage }"></div>
          <div class="percentage">{{ indicators[1].percentage }}%</div>
        </div>
        <div class="indicator-label">{{ indicators[1].label }}</div>
      </div>

      <!-- 健康度 -->
      <div class="health-indicator special">
        <div class="health-score-container">
          <div class="health-score-bg"></div>
          <div class="health-score">{{ indicators[2].percentage }}</div>
        </div>
        <div class="indicator-label">{{ indicators[2].label }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
    name: 'HealthIndicators',
    props: {
        indicators: {
            type: Array,
            default: () => [
                { label: '郁闭度', percentage: 20 },
                { label: '生长匹配度', percentage: 30 },
                { label: '健康度', percentage: 90 }
            ]
        }
    },
    emits: ['show-health-modal']
};
</script>

<style lang="less" scoped>
.health-section {
    margin-top: auto;
    padding-top: 20px;
}

.health-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.health-title {
    font-family: SourceHanSansCN-Medium;
    font-size: 16px;
    font-weight: 500;
    color: #c69c6d;
}

.health-link {
    display: flex;
    align-items: center;
    padding: 5px 8px;

    border-radius: 4px;
    transition: all .2s ease;
    cursor: pointer;

    gap: 5px;

    &:hover {
        background: #4cfcea1a;
        transform: translateX(2px);
    }
}

.link-text {
    font-family: SourceHanSansCN-Light;
    font-size: 11px;
    font-weight: 500;
    color: #c69c6d;
}

.link-arrow {
    font-family: FZCKJW--GB1-0;
    font-size: 11px;
    color: #c69c6d;
}

.third-divider {
    display: block;
    width: 103px;
    height: 3px;
    margin-top: 5px;

    object-fit: contain;
}

.health-indicators {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-top: 26px;

    gap: 10px;
}

.health-indicator {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
}

.circular-progress {
    position: relative;
    width: 80px;
    height: 80px;
    margin-bottom: 10px;
}

.circle-bg {
    position: absolute;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    border: 6px solid #4cfcea33;

    border-radius: 50%;
}

.circle {
    position: absolute;
    box-sizing: border-box;
    width: 100%;
    height: 100%;

    border-radius: 50%;
}

.circle[style*="--percentage: 20"] {
    border: none;
    border-radius: 50%;
    background: conic-gradient(from -90deg, #c69c6d 0deg, #c69c6d 72deg, transparent 72deg);
    transform: none;

    &::before {
        content: "";
        position: absolute;
        top: 6px;
        right: 6px;
        bottom: 6px;
        left: 6px;

        border-radius: 50%;
        background: #102838;
    }
}

.circle[style*="--percentage: 30"] {
    border: none;
    border-radius: 50%;
    background: conic-gradient(from -90deg, #c69c6d 0deg, #c69c6d 72deg, transparent 72deg);
    transform: none;

    &::before {
        content: "";
        position: absolute;
        top: 6px;
        right: 6px;
        bottom: 6px;
        left: 6px;

        border-radius: 50%;
        background: #102838;
    }
}

.percentage {
    position: absolute;
    top: 55%;
    left: 50%;
    font-family: BebasNeueRegular;
    font-size: 36px;
    text-align: center;

    color: #c69c6d;
    transform: translate(-50%, -50%);
}

.health-indicator.special {
    .health-score-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 80px;
        height: 80px;
        margin-bottom: 10px;
    }

    .health-score-bg {
        position: absolute;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        border: 2px solid #c69c6d;

        border-radius: 50%;
    }

    .health-score {
        z-index: 1;
        font-family: BebasNeueRegular;
        font-size: 36px;
        color: #c69c6d;
    }
}

.indicator-label {
    margin-top: 5px;
    font-family: SourceHanSansCN-Medium;
    font-size: 14px;
    font-weight: 500;
    text-align: center;

    color: #c69c6d;
}
</style>
