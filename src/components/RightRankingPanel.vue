<template>
  <div class="right-ranking-panel" :style="{ backgroundImage: `url(${images.rankingPanelBg})` }">
    <!-- 排名标题 -->
    <div class="ranking-headers flex-row">
      <div class="header-section production-ranking flex-col" :style="{ backgroundImage: `url(${images.productionRankingHeader})` }">
        <span class="header-title">{{ titlePrefix }}产量排名</span>
        <div class="header-underline" :style="{ backgroundImage: `url(${images.productionUnderline})` }"></div>
      </div>
      <div class="header-section team-ranking flex-col" :style="{ backgroundImage: `url(${images.teamRankingHeader})` }">
        <span class="header-title">专业队排名</span>
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
      <div class="ranking-decoration" :style="{ backgroundImage: `url(${images.rankingDecoration})` }"></div>
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
  </div>
</template>

<script>
// 直接使用公共路径的图片
const images = {
  rankingPanelBg: '/images/ranking-panel-bg.png',
  productionRankingHeader: '/images/production-ranking-header.png',
  teamRankingHeader: '/images/team-ranking-header.png',
  productionUnderline: '/images/production-underline.png',
  teamUnderline: '/images/team-underline.png',
  sectionDivider: '/images/section-divider.png',
  rankingDecoration: '/images/ranking-decoration.png',
  firstPlaceBg: '/images/first-place-bg.png',
  secondPlaceBg: '/images/second-place-bg.png',
  thirdPlaceBg: '/images/third-place-bg.png',
  firstPlaceIcon: '/images/first-place-icon.png',
  secondPlaceIcon: '/images/second-place-icon.png',
  thirdPlaceIcon: '/images/third-place-icon.png',
  firstManagerBg: '/images/first-manager-bg.png',
  secondManagerBg: '/images/second-manager-bg.png',
  thirdManagerBg: '/images/third-manager-bg.png',
  qualityIcon: '/images/quality-icon.png',
  qualityDivider: '/images/quality-divider.png',
  qualityGood: '/images/quality-good.png',
  qualityAverage: '/images/quality-average.png',
  qualityPoor: '/images/quality-poor.png'
}

export default {
  name: 'RightRankingPanel',
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
    }
  },
  data() {
    return {
      images
    }
  },
  computed: {
    titlePrefix() {
      return this.regionName === '百色市' ? '八角基地' : this.regionName
    },
    itemType() {
      return this.regionName === '百色市' ? '八角地' : '地块'
    },
    subTitle() {
      return this.regionName === '百色市' ? '优质产区排行榜' : `${this.regionName}优质地块排行榜`
    },
    qualityItems() {
      return [
        { type: 'good', value: this.qualityData.good, label: '良好' },
        { type: 'average', value: this.qualityData.average, label: '一般' },
        { type: 'poor', value: this.qualityData.poor, label: '较差' }
      ]
    }
  },
  methods: {
    getRankClass(index) {
      const ranks = ['first', 'second', 'third']
      return ranks[index] || 'other'
    },
    getPlaceBgImage(index) {
      const bgs = [this.images.firstPlaceBg, this.images.secondPlaceBg, this.images.thirdPlaceBg]
      return bgs[index] || ''
    },
    getPlaceIconImage(index) {
      const icons = [this.images.firstPlaceIcon, this.images.secondPlaceIcon, this.images.thirdPlaceIcon]
      return icons[index] || ''
    },
    getManagerBgImage(index) {
      const bgs = [this.images.firstManagerBg, this.images.secondManagerBg, this.images.thirdManagerBg]
      return bgs[index] || ''
    },
    getQualityBgImage(type) {
      const mapping = {
        good: this.images.qualityGood,
        average: this.images.qualityAverage,
        poor: this.images.qualityPoor
      }
      return mapping[type] || ''
    }
  }
}
</script>

<style lang="less" scoped>
.right-ranking-panel {
  padding: 0 30px 60px;
  width: 375px;
  height: 734px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  box-sizing: border-box;
  overflow: hidden;
}

// 排名标题区域
.ranking-headers {
  width: 315px;
  height: 58px;
  margin: -6px 0 0 0;
  justify-content: space-between;
}

.header-section {
  width: 155px;
  height: 58px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  
  &.production-ranking {
  }
  
  &.team-ranking {
  }
}

.header-title {
  color: rgba(76, 253, 235, 1);
  font-size: 12px;
  font-family: SourceHanSansCN-Light;
  text-align: center;
  white-space: nowrap;
  line-height: 15px;
  margin: 21px 0 5px 0;
  
  .production-ranking & {
    width: 117px;
    margin-left: 20px;
  }
  
  .team-ranking & {
    width: 71px;
    margin-left: 42px;
  }
}

.header-underline {
  width: 110px;
  height: 5px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  margin: 0 auto;
  
  .production-ranking & {
  }
  
  .team-ranking & {
  }
}

// Top5标题
.top5-title {
  margin: 20px 0 0 2px;
  
  .main-title {
    color: rgba(76, 253, 235, 1);
    font-size: 17px;
    font-family: SourceHanSansCN-Medium;
    font-weight: 500;
  }
  
  .sub-title {
    color: rgba(76, 253, 235, 1);
    font-size: 14px;
    font-family: SourceHanSansCN-Light;
  }
}

// 分隔线
.section-divider {
  width: 334px;
  height: 4px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  margin: 9px 0 0 -20px;
}

// 排名列表
.ranking-list {
  position: relative;
  width: 340px;
  margin: 13px 0 0 -29px;
}

.ranking-decoration {
  position: absolute;
  left: 0;
  top: 114px;
  width: 14px;
  height: 279px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

.ranking-items {
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

// 排名项目样式
.ranking-item {
  position: relative;
  width: 320px;
  height: 121px;
  display: flex;
  align-items: flex-start;
  
  &.first {
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
  }
  
  &.second {
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
  }
  
  &.third {
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
  }
}

.rank-icon {
  width: 54px;
  height: 69px;
  margin: 30px 0 0 12px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  flex-shrink: 0;
  
  &.first {
  }
  
  &.second {
  }
  
  &.third {
  }
}

.item-content {
  flex: 1;
  margin: 0 0 0 10px;
  display: flex;
  flex-direction: column;
  width: 173px;
}

.manager-info {
  width: 173px;
  height: 47px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  margin-top: -4px;
  
  .first & {
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }
  
  .second & {
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }
  
  .third & {
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }
}

.manager-name {
  color: rgba(87, 144, 66, 1);
  font-size: 12px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
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
  color: rgba(76, 253, 235, 1);
  font-size: 13px;
  font-family: SourceHanSansCN-Light;
  white-space: nowrap;
  text-align: center;
}

.area-info {
  display: flex;
  align-items: baseline;
  gap: 2px;
  justify-content: center;
}

.area-number {
  color: rgba(76, 253, 235, 1);
  font-size: 13px;
  font-family: SourceHanSansCN-Medium;
}

.area-unit {
  color: rgba(76, 253, 235, 1);
  font-size: 13px;
  font-family: SourceHanSansCN-Light;
}

.district-name {
  color: rgba(76, 253, 235, 1);
  font-size: 13px;
  font-family: SourceHanSansCN-Bold;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
}

.yield-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: center;
  justify-content: center;
  gap: 4px;
  flex-shrink: 0;
  position: relative;
  right: 10px;
}

.yield-number {
  color: rgba(76, 253, 235, 1);
  font-size: 32px;
  font-family: BebasNeueRegular;
  text-align: center;
  white-space: nowrap;
  line-height: 1;
}

.yield-unit {
  color: rgba(76, 253, 235, 1);
  font-size: 14px;
  font-family: SourceHanSansCN-Normal;
  font-weight: normal;
  text-align: center;
  white-space: nowrap;
  margin-top: 2px;
}

// 林地质量类别区域
.quality-section {
  margin-top: 35px;
  padding: 0 2px;
}

.quality-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 320px;
  height: 21px;
}

.section-title {
  color: rgba(76, 253, 235, 1);
  font-size: 20px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  line-height: 20px;
}

.quality-icon {
  width: 30px;
  height: 20px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  flex-shrink: 0;
}

.quality-divider {
  width: 122px;
  height: 4px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  margin: 8px 0 0 0;
}

.quality-data {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
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
    height: 80px;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    justify-content: center;
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
  color: rgba(121, 219, 207, 1);
  font-size: 26px;
  font-family: BebasNeueRegular;
  font-weight: normal;
  text-align: center;
  white-space: nowrap;
  line-height: 1;
}

.quality-label {
  color: rgba(0, 255, 242, 1);
  font-size: 12px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  line-height: 14px;
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
  font-weight: normal;
  text-align: center;
  white-space: nowrap;
}

.number-medium {
  font-size: 46px;
  line-height: 46px;
}
</style>