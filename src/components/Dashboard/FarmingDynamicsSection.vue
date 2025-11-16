<template>
  <div class="farming-dynamics-section">
    <!-- 标题区域 -->
    <div class="farming-dynamics-header">
      <span class="section-title">农情动态</span>
      <div class="farming-icon" :style="{ backgroundImage: `url(${images.qualityIcon})` }"></div>
    </div>

    <!-- 分隔线 -->
    <div class="farming-divider" :style="{ backgroundImage: `url(${images.qualityDivider})` }"></div>

    <!-- 农情内容容器 -->
    <div class="farming-dynamics-content">
      <div class="farming-dynamics-sections">
        <!-- 左侧: 标准农事列表 -->
        <div class="standard-farming-section">
          <div class="section-header">
            <h4 class="section-title">标准农事</h4>
          </div>

          <!-- 农事项目列表 -->
          <div class="farming-items-list">
            <div
              class="farming-item"
              v-for="(item, index) in farmingItems"
              :key="index"
              :class="{ 'farming-item--active': selectedFarmingItem && item.id === selectedFarmingItem.id }"
              @click="handleFarmingItemClick(item)">
              <div class="farming-icon-wrapper">
                <span class="farming-symbol">🌿</span>
              </div>
              <span class="farming-text" :class="{ 'farming-text--gold': item.isGold }">{{ item.name }}</span>
            </div>
          </div>

          <!-- 状态指示器 -->
          <div class="status-indicators">
            <div class="status-item">
              <span class="status-text">已执行</span>
              <div class="status-bar status-bar--executed"></div>
            </div>
            <div class="status-item">
              <span class="status-text">未执行</span>
              <div class="status-bar status-bar--pending"></div>
            </div>
          </div>
        </div>

        <!-- 右侧: 预警农事动态显示 -->
        <div class="warning-farming-section">
          <div class="section-header">
            <h4 class="section-title">预警农事</h4>
          </div>

          <!-- 动态显示选中农事的详情 -->
          <div v-if="selectedFarmingItem" class="farming-detail-card">
            <div class="farming-name">
              <span class="farming-symbol">🌿</span>
              <span class="name-text">{{ selectedFarmingItem.name }}</span>
              <span v-if="selectedFarmingItem.status === 'current'" class="current-badge">（当前）</span>
            </div>

            <div class="farming-time">
              <div class="time-item">
                <span class="time-label">开始时间：</span>
                <span class="time-value">{{ selectedFarmingItem.startDate }}</span>
              </div>
              <div class="time-item">
                <span class="time-label">结束时间：</span>
                <span class="time-value">{{ selectedFarmingItem.endDate }}</span>
              </div>
            </div>

            <div class="farming-prescription">
              <span class="prescription-label">处方：</span>
              <span class="prescription-value">{{ selectedFarmingItem.description }}</span>
            </div>

            <div class="farming-requirement">
              <span class="requirement-label">施工规范：</span>
              <span class="requirement-value">{{ selectedFarmingItem.requirement }}</span>
            </div>

            <div class="view-details">
              <span class="details-link" @click="handleViewDetails">查看详情 &gt;&gt;</span>
            </div>
          </div>

          <!-- 默认显示（未选中时） -->
          <div v-else class="default-warning-info">
            <div class="default-farming-name">
              <span class="farming-symbol">🌿</span>
              <span class="name-text">{{ defaultFarmingItem.name }}</span>
              <span class="current-badge">（当前）</span>
            </div>

            <div class="default-farming-time">
              <div class="time-item">
                <span class="time-label">开始时间：</span>
                <span class="time-value">{{ defaultFarmingItem.startDate }}</span>
              </div>
              <div class="time-item">
                <span class="time-label">结束时间：</span>
                <span class="time-value">{{ defaultFarmingItem.endDate }}</span>
              </div>
            </div>

            <div class="default-prescription">
              <span class="prescription-label">处方：</span>
              <span class="prescription-value">{{ defaultFarmingItem.description }}</span>
            </div>

            <div class="default-requirement">
              <span class="requirement-label">施工规范：</span>
              <span class="requirement-value">{{ defaultFarmingItem.requirement }}</span>
            </div>

            <div class="view-details">
              <span class="details-link" @click="handleViewDetails">查看详情 &gt;&gt;</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 农情详情弹窗 -->
    <FarmingDetailDialog
      :visible="showDetailDialog"
      :farming-item="currentFarmingItem"
      @close="handleCloseDialog"
    />
  </div>
</template>

<script>
import FarmingDetailDialog from '@/components/Dialogs/FarmingDetailDialog.vue';
import { getCategoryImages } from '@/utils/imageManager';

// 标准农事数据常量
const STANDARD_FARMING_ITEMS = [
    {
        id: 'winter-fertilizing',
        name: '冬季施肥',
        startDate: '12月01日',
        endDate: '12月30日',
        description: '复合肥',
        requirement: '要求在树根往外滴水的三分之二处，均匀绕树周围撒肥。',
        status: 'completed',
        isGold: false
    },
    {
        id: 'spring-pest-control',
        name: '春季生物防治',
        startDate: '3月01日',
        endDate: '3月30日',
        description: '生物防治药剂',
        requirement: '均匀喷洒叶面，注意天气条件。',
        status: 'completed',
        isGold: false
    },
    {
        id: 'spring-strong-fertilizing',
        name: '春季强梢施肥',
        startDate: '4月01日',
        endDate: '4月30日',
        description: '强梢专用肥',
        requirement: '围绕树根部施用，深度15-20cm。',
        status: 'completed',
        isGold: false
    },
    {
        id: 'summer-weeding',
        name: '夏季除草',
        startDate: '6月01日',
        endDate: '6月30日',
        description: '除草剂',
        requirement: '避免接触树体，选择无风天气作业。',
        status: 'completed',
        isGold: false
    },
    {
        id: 'summer-enhanced-treatment',
        name: '夏季加强版生物防治+催花',
        startDate: '7月01日',
        endDate: '7月30日',
        description: '生物防治剂+催花素',
        requirement: '分两次施用，间隔10-15天。',
        status: 'completed',
        isGold: false
    },
    {
        id: 'autumn-flower-protection',
        name: '秋季保花施肥',
        startDate: '8月01日',
        endDate: '8月30日',
        description: '复合肥',
        requirement: '要求在树根往外滴水的三分之二处，均匀绕树周围撒肥。',
        status: 'current',
        isGold: false
    },
    {
        id: 'winter-fruit-strengthening',
        name: '冬季保果壮果',
        startDate: '11月01日',
        endDate: '11月30日',
        description: '壮果专用肥',
        requirement: '果实膨大期施用，配合适当修剪。',
        status: 'expected',
        isGold: true
    },
    {
        id: 'spring-fruit-protection',
        name: '春季保果',
        startDate: '2月01日',
        endDate: '2月28日',
        description: '保果剂',
        requirement: '开花后7-10天施用，连续2-3次。',
        status: 'expected',
        isGold: true
    },
    {
        id: 'summer-fruit-strengthening',
        name: '夏季壮果',
        startDate: '5月01日',
        endDate: '5月30日',
        description: '壮果肥',
        requirement: '果实发育期施用，注意水分管理。',
        status: 'expected',
        isGold: true
    },
    {
        id: 'autumn-harvest',
        name: '秋果采摘',
        startDate: '10月01日',
        endDate: '10月30日',
        description: '成熟度检测',
        requirement: '选择晴天采摘，轻拿轻放。',
        status: 'expected',
        isGold: true
    }
];

const DEFAULT_FARMING_ITEM = {
    name: '秋季保花施肥',
    startDate: '8月01日',
    endDate: '8月30日',
    description: '复合肥',
    requirement: '要求在树根往外滴水的三分之二处，均匀绕树周围撒肥。',
    status: 'current'
};

export default {
    name: 'FarmingDynamicsSection',
    components: {
        FarmingDetailDialog
    },
    props: {
        selectedFarmingItem: {
            type: Object,
            default: null
        },
        farmingItems: {
            type: Array,
            default: () => STANDARD_FARMING_ITEMS
        }
    },
    data() {
        return {
            showDetailDialog: false,
            currentFarmingItem: null,
            defaultFarmingItem: DEFAULT_FARMING_ITEM
        };
    },
    computed: {
        images() {
            return getCategoryImages('RIGHT_PANEL');
        }
    },
    methods: {
        handleFarmingItemClick(item) {
            this.$emit('farming-item-click', item);
        },
        handleViewDetails() {
            this.currentFarmingItem = this.selectedFarmingItem || this.defaultFarmingItem;
            this.showDetailDialog = true;
        },
        handleCloseDialog() {
            this.showDetailDialog = false;
        }
    }
};
</script>

<style lang="less" scoped>
.farming-dynamics-section {
    width: 100%;
    margin-top: 30px;
    padding: 0 2px;
}

.farming-dynamics-header {
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

.farming-icon {
    flex-shrink: 0;
    width: 30px;
    height: 20px;

    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
}

.farming-divider {
    width: 122px;
    height: 4px;
    margin: 8px 0 0;

    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
}

.farming-dynamics-content {
    margin-top: 15px;
}

.farming-dynamics-sections {
    display: flex;
    justify-content: space-between;
    gap: 10px;
}

// 左侧标准农事区域
.standard-farming-section {
    flex: 1;
    width: 140px;
}

.section-header {
    margin-bottom: 10px;
}

.section-header .section-title {
    font-family: SourceHanSansCN-Medium;
    font-size: 12px;
    font-weight: 500;
    color: #c69c6d;
}

.farming-items-list {
    margin-bottom: 15px;
}

.farming-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    padding: 6px 8px;

    border-radius: 4px;
    transition: all .3s ease;
    cursor: pointer;

    gap: 8px;

    &:hover {
        background: #4cfdeb1a;
        transform: translateX(2px);
    }

    &--active {
        border-left: 3px solid #c69c6d;
        background: #4cfdeb33;
        transform: translateX(2px);
    }
}

.farming-icon-wrapper {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
}

.farming-symbol {
    font-size: 14px;
}

.farming-text {
    flex: 1;
    font-family: SourceHanSansCN-Regular;
    font-size: 11px;
    line-height: 1.4;

    color: #c69c6d;

    &--gold {
        color: #faaf3b;
    }
}

.status-indicators {
    display: flex;
    justify-content: center;
    gap: 20px;
}

.status-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.status-text {
    font-family: SourceHanSansCN-Regular;
    font-size: 9px;
    color: #c69c6d;
}

.status-bar {
    width: 24px;
    height: 2px;

    &--executed {
        background: #c69c6d;
    }

    &--pending {
        background: #faaf3b;
    }
}

// 右侧预警农事区域
.warning-farming-section {
    flex: 1.5;
    width: 180px;
}

.farming-detail-card,
.default-warning-info {
    padding: 12px;
    border: 1px solid #4cfcea33;
    border-radius: 6px;
    background: #4cfdeb0d;
}

.farming-name,
.default-farming-name {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    gap: 6px;
}

.name-text {
    font-family: SourceHanSansCN-Medium;
    font-size: 12px;
    font-weight: 500;
    color: #c69c6d;
}

.current-badge {
    font-family: SourceHanSansCN-Regular;
    font-size: 10px;
    color: #00ff7f;
}

.farming-time,
.default-farming-time {
    margin-bottom: 8px;
}

.time-item {
    display: flex;
    margin-bottom: 4px;
    gap: 4px;
}

.time-label {
    min-width: 60px;
    font-family: SourceHanSansCN-Regular;
    font-size: 10px;
    color: #c69c6d;
}

.time-value {
    font-family: SourceHanSansCN-Regular;
    font-size: 10px;
    color: #fff;
}

.farming-prescription,
.default-prescription {
    display: flex;
    margin-bottom: 8px;
    gap: 4px;
}

.prescription-label {
    min-width: 40px;
    font-family: SourceHanSansCN-Regular;
    font-size: 10px;
    color: #c69c6d;
}

.prescription-value {
    font-family: SourceHanSansCN-Regular;
    font-size: 10px;
    color: #fff;
}

.farming-requirement,
.default-requirement {
    margin-bottom: 8px;
}

.requirement-label {
    display: block;
    margin-bottom: 4px;
    font-family: SourceHanSansCN-Regular;
    font-size: 10px;

    color: #c69c6d;
}

.requirement-value {
    font-family: SourceHanSansCN-Regular;
    font-size: 10px;
    line-height: 1.4;
    word-wrap: break-word;

    color: #fff;
}

.view-details {
    margin-top: 10px;
    text-align: right;
}

.details-link {
    font-family: SourceHanSansCN-Regular;
    font-size: 9px;
    text-decoration: none;

    color: #c69c6d;
    cursor: pointer;

    &:hover {
        color: #faaf3b;
    }
}
</style>
