<template>
  <div class="right-ranking-panel" :style="{ backgroundImage: `url(${images.rankingPanelBg})` }">
    <!-- 排名部分 -->
    <RankingSection
      :region-name="regionName"
      :ranking-data="rankingData"
    />

    <!-- 质量指标部分 -->
    <QualitySection
      :quality-data="qualityData"
    />

    <!-- 农情动态部分 -->
    <FarmingDynamicsSection
      :selected-farming-item="selectedFarmingItem"
      @farming-item-click="handleFarmingItemClick"
    />
  </div>
</template>

<script>
import { getCategoryImages } from '@/utils/imageManager';
import RankingSection from './RankingSection.vue';
import QualitySection from './QualitySection.vue';
import FarmingDynamicsSection from './FarmingDynamicsSection.vue';

export default {
    name: 'RightRankingPanel',
    components: {
        RankingSection,
        QualitySection,
        FarmingDynamicsSection
    },
    props: {
        regionName: {
            type: String,
            default: '百色市'
        },
        rankingData: {
            type: Array,
            required: true
        },
        qualityData: {
            type: Object,
            required: true
        },
        selectedFarmingItem: {
            type: Object,
            default: null
        }
    },
    computed: {
        images() {
            return getCategoryImages('RIGHT_PANEL');
        }
    },
    methods: {
        handleFarmingItemClick(item) {
            this.$emit('farming-item-click', item);
        }
    }
};
</script>

<style lang="less" scoped>
.right-ranking-panel {
    overflow: hidden;
    box-sizing: border-box;
    width: 375px;
    height: 734px;
    padding: 0 30px 60px;

    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
}
</style>
