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
      :cert-icons="certIcons"
    />

    <!-- 地块统计数据 -->
    <PlotStatisticsGrid
      :items="statistics"
      :background-image="'/images/stat-item.png'"
    />

    <!-- 操作入口 -->
    <div class="action-bar">
      <!-- 点击后弹出气泡，相对 action-bar 定位撑满宽度 -->
      <div v-if="activeAction" class="action-popup">

        <!-- 八角保险 -->
        <div v-if="activeAction === 'insurance'" class="popup-insurance">
          <span class="insurance-text">投保单位：中国平安财产保险股份有限公司</span>
        </div>

        <!-- 统一农资 -->
        <div v-if="activeAction === 'agri-supply'" class="popup-agri-supply">
          <p class="agri-title">土壤有益微生物指标含量</p>
          <ul class="agri-list">
            <li v-for="item in agriSupplyItems" :key="item.name" class="agri-item">
              <span class="agri-name">{{ item.name }}</span>
              <span class="agri-threshold">≥{{ item.base }}×10<sup>{{ item.exp }}</sup></span>
            </li>
          </ul>
        </div>

        <!-- 技术服务 -->
        <div v-if="activeAction === 'tech-service'" class="popup-tech-service">
          <ul class="tech-list">
            <li v-for="item in techServiceItems" :key="item.name" class="tech-item">{{ item.name }}</li>
          </ul>
        </div>

        <!-- 产能预售 -->
        <div v-if="activeAction === 'presale'" class="popup-presale">
          <ul class="presale-list">
            <li v-for="item in presaleItems" :key="item.name" class="presale-item">
              <span class="presale-dot" :style="{ background: item.color }"></span>
              <span class="presale-name">{{ item.name }}</span>
              <span class="presale-value">{{ item.capacity }}</span>
            </li>
          </ul>
          <img class="presale-chart" src="/images/presale-pie-chart.png" alt="产能占比" />
        </div>

        <span class="action-popup-arrow" :style="{ left: popupArrowLeft }"></span>
      </div>
      <div
        v-for="action in actionItems"
        :key="action.key"
        class="action-item"
        @click="handleActionClick(action.key)"
      >
        <img class="action-icon" :src="action.src" :alt="action.label" />
      </div>
    </div>

    <!-- 价格信息 -->
    <PriceInfoBox
      :value="String(priceData?.price || '0')"
      :unit="priceData?.unit || '元/斤'"
      :change="priceData?.change ?? null"
      :background-image="'/images/price-info.png'"
      @category-change="$emit('price-category-change', $event)"
    />

    <!-- 监测批次统计 -->
    <div v-if="analysisSummary" class="analysis-stats">
      <div class="analysis-stats-title">监测概况</div>
      <div class="analysis-stats-grid">
        <div class="analysis-stat-item">
          <span class="analysis-stat-value">{{ analysisSummary.total_trees }}</span>
          <span class="analysis-stat-label">总树数</span>
        </div>
        <div class="analysis-stat-item analysis-stat-item--healthy">
          <span class="analysis-stat-value">{{ analysisSummary.healthy_trees }}</span>
          <span class="analysis-stat-label">健康</span>
        </div>
        <div class="analysis-stat-item analysis-stat-item--pest">
          <span class="analysis-stat-value">{{ analysisSummary.pest_trees }}</span>
          <span class="analysis-stat-label">病虫害</span>
        </div>
        <div class="analysis-stat-item">
          <span class="analysis-stat-value">{{ analysisSummary.yield_avg ? Number(analysisSummary.yield_avg).toFixed(1) : '-' }}</span>
          <span class="analysis-stat-label">均产(kg/棵)</span>
        </div>
      </div>
    </div>

    <!-- 林地健康指标 -->
    <ForestHealthIndicators />

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
import ForestHealthIndicators from '@/components/PlotDetail/ForestHealthIndicators.vue';

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
        HealthIndicators,
        ForestHealthIndicators
    },
    props: {
        strategy: { type: Object, required: true },
        plotName: { type: String, required: true },
        regionName: { type: String, required: true },
        priceData: { type: Object, default: null },
        /** wuda-summary 响应，用于展示监测批次统计 */
        analysisSummary: { type: Object, default: null }
    },
    emits: ['show-health-modal', 'action-click', 'price-category-change'],
    data() {
        return {
            activeAction: null
        };
    },
    computed: {
        ownerInfo() { return this.strategy.getOwnerInfo(); },
        statusTags() { return this.strategy.getStatusTags(); },
        statistics() { return this.strategy.getStatistics(); },
        priceInfo() {
            const arr = this.strategy.getPriceInfo(this.priceData);
            return arr.length > 0 ? arr[0] : null;
        },
        healthIndicators() {
            if (!this.strategy.showHealthIndicators()) return [];
            return this.strategy.getHealthIndicators();
        },
        certIcons() { return this.strategy.getCertIcons(); },
        actionItems() {
            return [
                { key: 'insurance', src: '/images/action-insurance.png', label: '八角保险' },
                { key: 'presale', src: '/images/action-presale.png', label: '产能预售' },
                { key: 'tech-service', src: '/images/action-tech-service.png', label: '技术服务' },
                { key: 'agri-supply', src: '/images/action-agri-supply.png', label: '统一农资' }
            ];
        },

        agriSupplyItems() {
            return [
                { name: '枯草芽孢杆菌',     base: '1.0', exp: '8' },
                { name: '哈茨木霉菌',       base: '5.0', exp: '5' },
                { name: '放线菌',           base: '1.0', exp: '6' },
                { name: '其它芽孢杆菌属菌株', base: '1.0', exp: '7' },
                { name: '总有益菌群',       base: '2.0', exp: '8' }
            ];
        },

        techServiceItems() {
            return [
                { name: '南方香料生物科技有限公司', jin: 48,  yield: 1200 },
                { name: '广西冠宁生物有限公司',     jin: 36,  yield: 980  },
                { name: '玉林广京生物科技有限公司', jin: 62,  yield: 1560 }
            ];
        },

        presaleItems() {
            return [
                { name: '广东明诚生物科技有限公司', capacity: '25万吨', color: '#1a5c35' },
                { name: '玉林广京生物科技有限公司', capacity: '31万吨', color: '#2e8b57' },
                { name: '广西冠宁生物有限公司',     capacity: '23万吨', color: '#52b788' },
                { name: '南方香料生物科技有限公司', capacity: '16万吨', color: '#95d5b2' },
                { name: '河北广庆环保有限公司',     capacity: '10万吨', color: '#74c69d' }
            ];
        },

        // 三角指示位置：space-around 4 等分，中心在 1/8、3/8、5/8、7/8
        popupArrowLeft() {
            const index = this.actionItems.findIndex(a => a.key === this.activeAction);
            if (index === -1) return '50%';
            const percent = (2 * index + 1) / 8 * 100;
            return `${percent}%`;
        }
    },
    mounted() {
        document.addEventListener('click', this.handleOutsideClick);
    },
    beforeDestroy() {
        document.removeEventListener('click', this.handleOutsideClick);
    },
    methods: {
        handleActionClick(key) {
            this.activeAction = this.activeAction === key ? null : key;
            this.$emit('action-click', key);
        },
        handleOutsideClick(e) {
            if (this.activeAction && !this.$el.querySelector('.action-bar').contains(e.target)) {
                this.activeAction = null;
            }
        }
    }
};
</script>

<style lang="less" scoped>
/* 操作入口栏 */
.action-bar {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 315px;
    padding: 12px 0;
}

.action-item {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: opacity 0.2s;

    &:active {
        opacity: 0.7;
    }
}

.action-icon {
    width: 70px;
    height: 77px;
    object-fit: contain;
}

.action-popup {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 0;
    z-index: 10;
    width: 100%;
    min-height: 80px;
    border: 1px solid rgba(198, 156, 109, 0.4);
    border-radius: 6px;
    background: #0d2a28;
}

/* 八角保险弹窗 */
.popup-insurance {
    padding: 14px 16px;
}

.insurance-text {
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 12px;
    color: #c69c6d;
}

/* 统一农资弹窗 */
.popup-agri-supply {
    padding: 12px 16px;
}

.agri-title {
    margin: 0 0 8px;
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 11px;
    font-weight: 500;
    color: rgba(198, 156, 109, 0.7);
}

.agri-list {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
    gap: 6px;
}

.agri-item {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
}

.agri-name {
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 11px;
    color: #c69c6d;
}

.agri-threshold {
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 11px;
    color: #c69c6d;

    sup {
        font-size: 8px;
    }
}

/* 技术服务弹窗 */
.popup-tech-service {
    padding: 12px 16px;
}

.tech-list {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
    gap: 8px;
}

.tech-item {
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 12px;
    color: #c69c6d;
}

/* 产能预售弹窗 */
.popup-presale {
    display: flex;
    align-items: center;
    padding: 12px 14px;
    gap: 10px;
}

.presale-list {
    display: flex;
    flex: 1;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
    gap: 8px;
}

.presale-item {
    display: flex;
    align-items: center;
    gap: 6px;
}

.presale-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.presale-name {
    flex: 1;
    overflow: hidden;
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 10px;
    color: #c69c6d;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.presale-value {
    flex-shrink: 0;
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 10px;
    color: #c69c6d;
}

.presale-chart {
    flex-shrink: 0;
    width: 100px;
    height: 100px;
    object-fit: contain;
}

/* 外层三角（边框色） */
.action-popup-arrow {
    position: absolute;
    bottom: -9px;
    width: 0;
    height: 0;
    border-top: 9px solid rgba(198, 156, 109, 0.4);
    border-right: 9px solid transparent;
    border-left: 9px solid transparent;
    transform: translateX(-50%);

    /* 内层三角（填充色，覆盖外层） */
    &::after {
        position: absolute;
        top: -10px;
        left: -8px;
        width: 0;
        height: 0;
        border-top: 8px solid #0d2a28;
        border-right: 8px solid transparent;
        border-left: 8px solid transparent;
        content: '';
    }
}

/* 监测批次统计 */
.analysis-stats {
    padding: 10px 12px;
    border: 1px solid rgba(198, 156, 109, 0.25);
    border-radius: 6px;
    background: rgba(4, 31, 29, 0.5);
}

.analysis-stats-title {
    margin-bottom: 10px;
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: rgba(198, 156, 109, 0.7);
    letter-spacing: 0.5px;
}

.analysis-stats-grid {
    display: flex;
    justify-content: space-between;
    gap: 6px;
}

.analysis-stat-item {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-align: center;
}

.analysis-stat-value {
    font-family: BebasNeueRegular, sans-serif;
    font-size: 26px;
    line-height: 1;
    color: #c69c6d;
}

.analysis-stat-item--healthy .analysis-stat-value { color: #00c853; }
.analysis-stat-item--pest .analysis-stat-value    { color: #ff1744; }

.analysis-stat-label {
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 10px;
    color: rgba(198, 156, 109, 0.65);
}

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
