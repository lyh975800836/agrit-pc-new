<template>
  <div class="quality-section">
    <!-- 标题区域 -->
    <div class="quality-header">
      <span class="section-title">林地质量类别</span>
      <div class="quality-icon" :style="{ backgroundImage: `url(${images.qualityIcon})` }"></div>
    </div>

    <!-- 分隔线 -->
    <div class="quality-divider" :style="{ backgroundImage: `url(${images.qualityDivider})` }"></div>

    <!-- 质量数据展示 -->
    <div class="quality-data">
      <div class="quality-item" v-for="(item, index) in qualityItems" :key="index" :class="item.type">
        <div class="percentage-display" :style="{ backgroundImage: `url(${getQualityBgImage(item.type)})` }">
          <span class="percentage-number">{{ item.value }}</span>
        </div>
        <span class="quality-label">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { getCategoryImages } from '@/utils/imageManager';

export default {
    name: 'QualitySection',
    props: {
        qualityData: {
            type: Object,
            required: true
        }
    },
    computed: {
        images() {
            return getCategoryImages('RIGHT_PANEL');
        },
        qualityItems() {
            return [
                { type: 'good', value: this.qualityData.good, label: '良好' },
                { type: 'average', value: this.qualityData.average, label: '一般' },
                { type: 'poor', value: this.qualityData.poor, label: '较差' }
            ];
        }
    },
    methods: {
        getQualityBgImage(type) {
            const mapping = {
                good: this.images.qualityGood,
                average: this.images.qualityAverage,
                poor: this.images.qualityPoor
            };
            return mapping[type] || '';
        }
    }
};
</script>

<style lang="less" scoped>
.quality-section {
    width: 100%;
    margin-top: 35px;
    padding: 0 2px;
}

.quality-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 320px;
    height: 21px;
}

.section-title {
    font-family: SourceHanSansCN-Medium;
    font-size: 20px;
    font-weight: 500;
    line-height: 20px;
    text-align: left;
    white-space: nowrap;

    color: #c69c6d;
}

.quality-icon {
    flex-shrink: 0;
    width: 30px;
    height: 20px;

    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
}

.quality-divider {
    width: 122px;
    height: 4px;
    margin: 8px 0 0;

    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
}

.quality-data {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    width: 300px;
    margin: 15px 0 0 5px;

    gap: 10px;
}

.quality-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;

    .percentage-display {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 80px;

        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
    }

    &.good .percentage-display {
        width: 80px;
    }

    &.average .percentage-display {
        width: 80px;
    }

    &.poor .percentage-display {
        width: 80px;
    }
}

.percentage-number {
    font-family: BebasNeueRegular;
    font-size: 26px;
    line-height: 1;
    text-align: center;
    white-space: nowrap;

    color: #79dbcf;
}

.quality-label {
    font-family: SourceHanSansCN-Medium;
    font-size: 12px;
    font-weight: 500;
    line-height: 14px;
    text-align: center;
    white-space: nowrap;

    color: #00fff2;
}
</style>
