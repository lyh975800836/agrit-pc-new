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
      :farming-items="farmingItems"
      @farming-item-click="handleFarmingItemClick"
    />
  </div>
</template>

<script>
import farmingApi from '@/infrastructure/api/farmingApi';
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
    data() {
        return {
            farmingItems: []
        };
    },
    computed: {
        images() {
            return getCategoryImages('RIGHT_PANEL');
        }
    },
    mounted() {
        this.loadFarmingList();
    },
    methods: {
        handleFarmingItemClick(item) {
            this.$emit('farming-item-click', item);
        },

        /**
         * 加载农情动态列表
         */
        async loadFarmingList() {
            try {
                const response = await farmingApi.getFarmingList('standard');

                if (response && response.code === 0 && response.data) {
                    // 将后端返回的数据转换为组件需要的格式
                    this.farmingItems = this.transformFarmingData(response.data.list || []);
                }
            }
            catch (error) {
                // 保持 farmingItems 为空数组，组件会使用默认值
            }
        },

        /**
         * 将后端数据转换为组件需要的格式
         */
        transformFarmingData(list) {
            return list.map(item => ({
                id: item.id,
                name: item.name,
                startDate: item.start_date,
                endDate: item.end_date,
                description: item.prescription || '',
                requirement: item.specification || '',
                status: this.getFarmingStatus(item.start_date, item.end_date),
                isGold: false
            }));
        },

        /**
         * 根据开始和结束时间判断农事状态
         */
        getFarmingStatus(startDate, endDate) {
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentDay = now.getDate();

            // 解析月日格式 "8月01日"
            const parseDate = dateStr => {
                const match = dateStr.match(/(\d+)月(\d+)日/);
                if (match) {
                    return { month: parseInt(match[1]), day: parseInt(match[2]) };
                }
                return null;
            };

            const start = parseDate(startDate);
            const end = parseDate(endDate);

            if (!start || !end) {
                return 'expected';
            }

            // 判断是否在当前时间范围内
            const isInRange = (currentMonth > start.month
                || (currentMonth === start.month && currentDay >= start.day))
                && (currentMonth < end.month
                || (currentMonth === end.month && currentDay <= end.day));

            if (isInRange) {
                return 'current';
            }
            if (currentMonth < start.month
                || (currentMonth === start.month && currentDay < start.day)) {
                return 'expected';
            }
            return 'completed';
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
