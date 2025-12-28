<template>
  <div class="plot-details-panel">
    <!-- 地块标题信息 -->
    <PlotTitleSection
      :plot-name="plotName"
      :region-name="regionName"
    />

    <!-- 农户信息 -->
    <FarmerProfileCard
      :farmer-name="ownerInfo.name"
      :farmer-age="ownerInfo.age"
      :avatar-url="ownerInfo.avatar"
      :background-image="'/images/farmer-profile.png'"
      :status-tags="statusTags"
      :rating="ownerInfo.rating"
    />

    <!-- 地块统计数据 -->
    <PlotStatisticsGrid
      :items="statistics"
      :background-image="'/images/stat-item.png'"
    />

    <!-- 价格信息 -->
    <PriceInfoBox
      label="今日价格："
      :value="String(priceData?.price || '0')"
      :unit="priceData?.unit || '元/斤'"
      :background-image="'/images/price-info.png'"
    />

    <!-- 健康指标 -->
    <HealthIndicators
      v-if="healthIndicators.length > 0"
      :indicators="healthIndicators"
      @show-health-modal="$emit('show-health-modal')"
    />
  </div>
</template>

<script>
import PlotTitleSection from '@/components/PlotDetail/PlotTitleSection.vue';
import FarmerProfileCard from '@/components/PlotDetail/FarmerProfileCard.vue';
import PlotStatisticsGrid from '@/components/PlotDetail/PlotStatisticsGrid.vue';
import PriceInfoBox from '@/components/PlotDetail/PriceInfoBox.vue';
import HealthIndicators from '@/components/PlotDetail/HealthIndicators.vue';

/**
 * 八角地块左侧面板
 *
 * 使用策略模式获取数据并渲染
 * 组合共享组件实现UI
 *
 * @component StarAniseLeftPanel
 */
export default {
    name: 'StarAniseLeftPanel',
    components: {
        PlotTitleSection,
        FarmerProfileCard,
        PlotStatisticsGrid,
        PriceInfoBox,
        HealthIndicators
    },
    props: {
        // 策略实例
        strategy: {
            type: Object,
            required: true
        },
        // 地块名称
        plotName: {
            type: String,
            required: true
        },
        // 区域名称
        regionName: {
            type: String,
            required: true
        },
        // 价格数据 (从外部传入,因为需要API调用)
        priceData: {
            type: Object,
            default: null
        }
    },
    emits: ['show-health-modal'],
    computed: {
        // 所有人信息
        ownerInfo() {
            return this.strategy.getOwnerInfo();
        },

        // 状态标签
        statusTags() {
            return this.strategy.getStatusTags();
        },

        // 统计数据
        statistics() {
            return this.strategy.getStatistics();
        },

        // 价格信息
        priceInfo() {
            const priceInfoArray = this.strategy.getPriceInfo(this.priceData);
            return priceInfoArray.length > 0 ? priceInfoArray[0] : null;
        },

        // 健康指标
        healthIndicators() {
            if (!this.strategy.showHealthIndicators()) {
                return [];
            }
            return this.strategy.getHealthIndicators();
        }
    }
};
</script>

<style lang="less" scoped>
/* 左侧地块详情面板 */
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
</style>
