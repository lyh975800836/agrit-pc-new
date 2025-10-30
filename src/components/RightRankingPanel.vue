<template>
  <div class="right-ranking-panel" :style="{ backgroundImage: `url(${images.rankingPanelBg})` }">
    <!-- 排名标题 -->
    <div class="ranking-headers flex-row">
      <div class="header-section production-ranking flex-col" :style="{ backgroundImage: `url(${images.productionRankingHeader})` }">
        <span class="header-title">{{ titlePrefix }}产量排名</span>
        <div class="header-underline" :style="{ backgroundImage: `url(${images.productionUnderline})` }"></div>
      </div>
      <div class="header-section team-ranking flex-col" :style="{ backgroundImage: `url(${images.teamRankingHeader})` }">
        <span class="header-title header-title-second">专业队排名</span>
        <div class="header-underline" :style="{ backgroundImage: `url(${images.teamUnderline})` }"></div>
      </div>
    </div>

    <!-- Top5标题 -->
    <div class="top5-title">
      <span class="main-title">Top5&nbsp;{{ itemType }}&nbsp;</span>
      <span class="sub-title">｜&nbsp;&nbsp;{{ subTitle }}</span>
    </div>

    <!-- 分隔线 -->
    <div class="section-divider" :style="{ backgroundImage: `url(${images.sectionDivider})` }"></div>

    <!-- 排名列表 -->
    <div class="ranking-list">
      <div class="ranking-items">
        <!-- 排名项目 -->
        <div
          v-for="(item, index) in rankingData.slice(0, 3)"
          :key="index"
          :class="['ranking-item', getRankClass(index)]"
          :style="{ backgroundImage: `url(${getPlaceBgImage(index)})` }">
          <div :class="['rank-icon', getRankClass(index)]" :style="{ backgroundImage: `url(${getPlaceIconImage(index)})` }"></div>
          <div class="item-content">
            <div class="manager-info" :style="{ backgroundImage: `url(${getManagerBgImage(index)})` }">
              <span class="manager-name">负责人：{{ item.manager }}</span>
            </div>
            <div class="location-info">
              <div class="location-text">
                <span class="location-name">{{ item.location }}</span>
                <div class="area-info">
                  <span class="area-number">{{ item.area }}</span>
                  <span class="area-unit">亩</span>
                </div>
              </div>
              <span class="district-name">{{ item.district }}</span>
            </div>
          </div>
          <div class="yield-info">
            <span class="yield-number">{{ item.yield }}</span>
            <span class="yield-unit">斤/亩</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 林地质量类别 -->
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

    <!-- 农情动态区域 -->
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
              <div class="farming-item" 
                   v-for="(item, index) in standardFarmingItems" 
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
                <span class="name-text">秋季保花施肥</span>
                <span class="current-badge">（当前）</span>
              </div>

              <div class="default-farming-time">
                <div class="time-item">
                  <span class="time-label">开始时间：</span>
                  <span class="time-value">8月01日</span>
                </div>
                <div class="time-item">
                  <span class="time-label">结束时间：</span>
                  <span class="time-value">8月30日</span>
                </div>
              </div>

              <div class="default-prescription">
                <span class="prescription-label">处方：</span>
                <span class="prescription-value">复合肥</span>
              </div>

              <div class="default-requirement">
                <span class="requirement-label">施工规范：</span>
                <span class="requirement-value">要求在树根往外滴水的三分之二处，均匀绕树周围撒肥。</span>
              </div>

              <div class="view-details">
                <span class="details-link" @click="handleViewDetails">查看详情 &gt;&gt;</span>
              </div>
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
import FarmingDetailDialog from './FarmingDetailDialog.vue';
import { getCategoryImages } from '@/utils/imageManager';

export default {
    name: 'RightRankingPanel',
    components: {
        FarmingDetailDialog
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
            showDetailDialog: false,
            currentFarmingItem: null
        };
    },
    computed: {
        images() {
            return getCategoryImages('RIGHT_PANEL');
        },
        titlePrefix() {
            return this.regionName === '百色市' ? '八角基地' : this.regionName;
        },
        itemType() {
            return this.regionName === '百色市' ? '八角地' : '地块';
        },
        subTitle() {
            return this.regionName === '百色市' ? '优质产区排行榜' : `${ this.regionName }优质地块排行榜`;
        },
        qualityItems() {
            return [
                { type: 'good', value: this.qualityData.good, label: '良好' },
                { type: 'average', value: this.qualityData.average, label: '一般' },
                { type: 'poor', value: this.qualityData.poor, label: '较差' }
            ];
        },
        
        // 标准农事项目数据
        standardFarmingItems() {
            return [
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
        }
    },
    methods: {
        getRankClass(index) {
            const ranks = ['first', 'second', 'third'];
            return ranks[index] || 'other';
        },
        getPlaceBgImage(index) {
            const bgs = [this.images.firstPlaceBg, this.images.secondPlaceBg, this.images.thirdPlaceBg];
            return bgs[index] || '';
        },
        getPlaceIconImage(index) {
            const icons = [this.images.firstPlaceIcon, this.images.secondPlaceIcon, this.images.thirdPlaceIcon];
            return icons[index] || '';
        },
        getManagerBgImage(index) {
            const bgs = [this.images.firstManagerBg, this.images.secondManagerBg, this.images.thirdManagerBg];
            return bgs[index] || '';
        },
        getQualityBgImage(type) {
            const mapping = {
                good: this.images.qualityGood,
                average: this.images.qualityAverage,
                poor: this.images.qualityPoor
            };
            return mapping[type] || '';
        },
        
        getStatusText(status) {
            const statusMap = {
                current: '当前',
                completed: '已完成',
                expected: '预期',
                pending: '待执行'
            };
            return statusMap[status] || status;
        },
        
        getStatusClass(status) {
            const classMap = {
                current: 'status-current',
                completed: 'status-completed',
                expected: 'status-expected',
                pending: 'status-pending'
            };
            return classMap[status] || '';
        },
        
        // 处理农事项目点击
        handleFarmingItemClick(item) {
            // 向父组件发出事件，更新选中的农事项目
            this.$emit('farming-item-click', item);
        },

        // 处理查看详情点击
        handleViewDetails() {
            this.currentFarmingItem = this.selectedFarmingItem || this.getDefaultFarmingItem();
            this.showDetailDialog = true;
        },

        // 关闭详情弹窗
        handleCloseDialog() {
            this.showDetailDialog = false;
        },

        // 获取默认农事项目（未选中时的默认项）
        getDefaultFarmingItem() {
            return {
                name: '秋季保花施肥',
                startDate: '8月01日',
                endDate: '8月30日',
                description: '复合肥',
                requirement: '要求在树根往外滴水的三分之二处，均匀绕树周围撒肥。',
                status: 'current'
            };
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

// 排名标题区域
.ranking-headers {
    justify-content: space-between;
    width: 315px;
    height: 58px;
    margin: -6px 0 0;
}

.header-section {
    width: 155px;
    height: 58px;

    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;

    &.production-ranking {
    }

    &.team-ranking {
    }
}

.header-title {
    margin: 21px 0 5px;
    font-family: SourceHanSansCN-Light;
    font-size: 12px;
    line-height: 15px;
    text-align: center;
    white-space: nowrap;
    font-weight: 600;
    color: #1D3534;

    .production-ranking & {
        width: 117px;
        margin-left: 20px;
    }

    .team-ranking & {
        width: 71px;
        margin-left: 42px;
    }
}

.header-title-second {
    color: #C69C6D;
}

.header-underline {
    width: 110px;
    height: 5px;
    margin: 0 auto;

    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
}

// Top5标题
.top5-title {
    margin: 20px 0 0 2px;

    .main-title {
        font-family: SourceHanSansCN-Medium;
        font-size: 17px;
        font-weight: 600;
        color: #c69c6d;
    }

    .sub-title {
        font-family: SourceHanSansCN-Light;
        font-size: 14px;
        color: #c69c6d;
        font-weight: 600;
    }
}

// 分隔线
.section-divider {
    width: 334px;
    height: 4px;
    margin: 9px 0 0 -20px;

    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
}

// 排名列表
.ranking-list {
    position: relative;
    width: 340px;
    margin: 13px 0 0 0;
}

.ranking-items {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

// 排名项目样式
.ranking-item {
    position: relative;
    display: flex;
    align-items: flex-start;
    width: 320px;
    height: 121px;

    &.first {
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
    }

    &.second {
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
    }

    &.third {
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
    }
}

.rank-icon {
    flex-shrink: 0;
    width: 54px;
    height: 69px;
    margin: 30px 0 0 12px;

    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;

    &.first {
    }

    &.second {
    }

    &.third {
    }
}

.item-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 173px;
    margin: 0 0 0 10px;
}

.manager-info {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 173px;
    height: 47px;
    margin-top: -4px;

    .first & {
        background-repeat: no-repeat;
        background-size: 100% 100%;
    }

    .second & {
        background-repeat: no-repeat;
        background-size: 100% 100%;
    }

    .third & {
        background-repeat: no-repeat;
        background-size: 100% 100%;
    }
}

.manager-name {
    font-family: SourceHanSansCN-Medium;
    font-size: 12px;
    font-weight: 500;
    text-align: center;
    white-space: nowrap;

    color: #C69C6D;
}

.location-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.location-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.location-name {
    font-family: SourceHanSansCN-Light;
    font-size: 13px;
    text-align: center;
    white-space: nowrap;
    font-weight: 600;
    color: #c69c6d;
}

.area-info {
    display: flex;
    align-items: baseline;
    justify-content: center;
    font-weight: 600;
    gap: 2px;
}

.area-number {
    font-family: SourceHanSansCN-Medium;
    font-size: 13px;
    color: #c69c6d;
    font-weight: 600;
}

.area-unit {
    font-family: SourceHanSansCN-Light;
    font-size: 13px;
    color: #c69c6d;
    font-weight: 600;
}

.district-name {
    font-family: SourceHanSansCN-Bold;
    font-size: 13px;
    font-weight: 700;
    text-align: center;
    white-space: nowrap;
    color: #4CFDEB;
}

.yield-info {
    position: relative;
    right: 10px;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    align-items: center;
    align-self: center;
    justify-content: center;

    gap: 4px;
}

.yield-number {
    font-family: BebasNeueRegular;
    font-size: 32px;
    line-height: 1;
    text-align: center;
    white-space: nowrap;

    color: #c69c6d;
}

.yield-unit {
    margin-top: 2px;
    font-family: SourceHanSansCN-Normal;
    font-size: 14px;
    text-align: center;
    white-space: nowrap;

    color: #c69c6d;
}

// 林地质量类别区域
.quality-section {
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

// 通用样式
.flex-row {
    display: flex;
    flex-direction: row;
}

.flex-col {
    display: flex;
    flex-direction: column;
}

.justify-between {
    justify-content: space-between;
}

.number-display {
    font-family: BebasNeueRegular;
    text-align: center;
    white-space: nowrap;
}

.number-medium {
    font-size: 46px;
    line-height: 46px;
}

// 农情动态区域样式
.farming-dynamics-section {
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
    gap: 10px;
    justify-content: space-between;
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
    color: #C69C6D;
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
    cursor: pointer;
    transition: all 0.3s ease;
    gap: 8px;
}

.farming-item:hover {
    background: rgba(76, 253, 235, 0.1);
    transform: translateX(2px);
}

.farming-item--active {
    background: rgba(76, 253, 235, 0.2);
    border-left: 3px solid #C69C6D;
    transform: translateX(2px);
}

.farming-icon-wrapper {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.farming-symbol {
    font-size: 14px;
}

.farming-text {
    flex: 1;
    font-family: SourceHanSansCN-Regular;
    font-size: 11px;
    line-height: 1.4;
    color: #C69C6D;
}

.farming-text--gold {
    color: #faaf3b;
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
    color: #C69C6D;
}

.status-bar {
    width: 24px;
    height: 2px;
}

.status-bar--executed {
    background: #C69C6D;
}

.status-bar--pending {
    background: #faaf3b;
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
    background: rgba(76, 253, 235, 0.05);
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
    color: #C69C6D;
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
    font-family: SourceHanSansCN-Regular;
    font-size: 10px;
    color: #C69C6D;
    min-width: 60px;
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
    font-family: SourceHanSansCN-Regular;
    font-size: 10px;
    color: #C69C6D;
    min-width: 40px;
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
    font-family: SourceHanSansCN-Regular;
    font-size: 10px;
    color: #C69C6D;
    display: block;
    margin-bottom: 4px;
}

.requirement-value {
    font-family: SourceHanSansCN-Regular;
    font-size: 10px;
    line-height: 1.4;
    color: #fff;
    word-wrap: break-word;
}

.view-details {
    text-align: right;
    margin-top: 10px;
}

.details-link {
    font-family: SourceHanSansCN-Regular;
    font-size: 9px;
    color: #C69C6D;
    cursor: pointer;
    text-decoration: none;
}

.details-link:hover {
    color: #faaf3b;
}
</style>
