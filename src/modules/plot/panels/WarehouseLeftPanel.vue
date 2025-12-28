<template>
  <div class="plot-details-panel warehouse-panel">
    <!-- 装饰线 -->
    <img class="panel-decoration-top" src="/images/decoration-1.jpg" />

    <!-- 地块标题信息 -->
    <div class="plot-title-section">
      <h2 class="left-plot-name">仓库</h2>
      <img class="region-label" src="/images/region-label.jpg" />
      <span class="region-name">{{ regionName }}</span>
    </div>

    <img class="section-divider" src="/images/decoration-2.png" />

    <!-- 所有人信息（仓库不显示状态标签） -->
    <FarmerProfileCard
      :farmer-name="strategy.getOwnerInfo().name"
      :farmer-age="strategy.getOwnerInfo().warehouseCount"
      :avatar-url="strategy.getOwnerInfo().avatar"
      :background-image="'/images/farmer-profile.png'"
      :status-tags="[]"
      :rating="strategy.getOwnerInfo().rating"
      label-prefix="所有人："
      age-label="管理仓库数："
      age-suffix="个"
    />

    <!-- 仓库统计数据 -->
    <PlotStatisticsGrid
      :items="strategy.getStatistics()"
      :background-image="'/images/stat-item.png'"
    />

    <!-- 存储价格信息 -->
    <div class="price-info" :style="{ backgroundImage: 'url(/images/price-info.png)' }">
      <div class="price-display">
        <span class="price-label">{{ priceInfo.label }}</span>
        <img class="down-arrow" src="/images/down-arrow.png" />
        <span class="price-value">{{ priceInfo.value }}</span>
        <span class="price-unit">&nbsp;&nbsp;{{ priceInfo.unit }}</span>
      </div>
    </div>

    <!-- 库存占比 -->
    <div class="health-section">
      <div class="health-header">
        <span class="health-title">库存占比</span>
        <div class="health-link" @click="$emit('show-health-modal')">
          <span class="link-text">查看详情</span>
          <span class="link-arrow">>></span>
        </div>
      </div>
      <img class="third-divider" src="/images/decoration-2.png" />

      <!-- 库存占比圆形图表 -->
      <div class="health-indicators">
        <div
          v-for="(indicator, index) in inventoryRatio"
          :key="index"
          class="health-indicator"
        >
          <div class="circular-progress" :data-percentage="indicator.percentage">
            <div class="circle-bg"></div>
            <div
              class="circle"
              :style="{
                '--percentage': indicator.percentage,
                '--color': index === 0 ? '#c69c6d' : '#ffa500'
              }"
            ></div>
            <div class="percentage">{{ indicator.percentage }}%</div>
          </div>
          <div class="indicator-label">{{ indicator.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FarmerProfileCard from '@/components/PlotDetail/FarmerProfileCard.vue';
import PlotStatisticsGrid from '@/components/PlotDetail/PlotStatisticsGrid.vue';

/**
 * 仓库左侧面板
 *
 * 显示仓库详情信息
 * @component WarehouseLeftPanel
 */
export default {
    name: 'WarehouseLeftPanel',
    components: {
        FarmerProfileCard,
        PlotStatisticsGrid
    },
    props: {
        // 策略实例
        strategy: {
            type: Object,
            required: true
        },
        // 区域名称
        regionName: {
            type: String,
            required: true
        },
        // 价格信息
        priceInfo: {
            type: Object,
            required: true
        },
        // 库存占比数据
        inventoryRatio: {
            type: Array,
            required: true
        }
    },
    emits: ['show-health-modal']
};
</script>

<style lang="less" scoped>
/* 基础容器样式 - 必须保留以确保布局正确 */
.plot-details-panel {
    position: relative;
    display: flex;
    overflow-x: hidden;
    overflow-y: auto;
    flex-direction: column;
    box-sizing: border-box;
    width: 375px;
    min-height: 100%;
    margin: 0 0 0 5px;
    padding: 0 23px 35px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% 100%;
    gap: 10px;
}

/* 仓库面板特定背景 */
.warehouse-panel {
    background-color: #0d2a28;
    background-image: linear-gradient(135deg, #0d2a28f2 0%, #041f1df2 100%);
}

.panel-decoration-top {
    width: 100%;
    height: auto;
    margin-bottom: 35px;
    object-fit: fill;
}

.plot-title-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.left-plot-name {
    flex: 1;
    margin: 0;
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 17px;
    font-weight: 500;
    color: #c69c6d;
}

.region-label {
    width: 13px;
    height: 18px;
    margin-right: 9px;
}

.region-name {
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 16px;
    font-weight: 500;
    color: #39b44a;
}

.section-divider {
    width: 160px;
    height: 3px;
    margin: 6px 0 0;
}

/* 价格信息 */
.price-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 315px;
    margin-top: 22px;
    padding: 15px 16px;
    background-size: 100% 100%;
}

.price-display {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 100%;
    text-align: center;
    gap: 8px;
}

.price-label {
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 18px;
    font-weight: 500;
    color: #c69c6d;
}

.down-arrow {
    width: 11px;
    height: 20px;
    margin-right: 13px;
}

.price-value {
    font-family: BebasNeueRegular, sans-serif;
    font-size: 52px;
    line-height: 1;
    color: #c69c6d;
}

.price-unit {
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 18px;
    color: #c69c6d;
}

/* 库存占比区域 */
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
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 16px;
    font-weight: 500;
    color: #c69c6d;
}

.health-link {
    display: flex;
    align-items: center;
    padding: 5px 8px;
    border-radius: 4px;
    transition: all 0.2s ease;
    cursor: pointer;
    gap: 5px;

    &:hover {
        background: rgba(76, 253, 234, 0.1);
        transform: translateX(2px);
    }
}

.link-text {
    font-family: SourceHanSansCN-Light, sans-serif;
    font-size: 11px;
    font-weight: 500;
    color: #c69c6d;
}

.link-arrow {
    font-family: FZCKJW--GB1-0, sans-serif;
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

/* 健康指标容器 */
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

/* 圆形进度条 */
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
    border: 6px solid rgba(76, 253, 234, 0.2);
    border-radius: 50%;
}

.circle {
    position: absolute;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 50%;
    background: conic-gradient(
        from -90deg,
        var(--color) 0deg,
        var(--color) calc(var(--percentage) * 3.6deg),
        transparent calc(var(--percentage) * 3.6deg)
    );

    &::before {
        content: '';
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
    font-family: BebasNeueRegular, sans-serif;
    font-size: 36px;
    text-align: center;
    color: #c69c6d;
    transform: translate(-50%, -50%);
}

.indicator-label {
    margin-top: 5px;
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 14px;
    font-weight: 500;
    text-align: center;
    color: #c69c6d;
}
</style>
