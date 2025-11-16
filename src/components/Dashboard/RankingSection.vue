<template>
  <div class="ranking-section">
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
  </div>
</template>

<script>
import { getCategoryImages } from '@/utils/imageManager';

export default {
    name: 'RankingSection',
    props: {
        regionName: {
            type: String,
            default: '百色市'
        },
        rankingData: {
            type: Array,
            required: true
        }
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
        }
    }
};
</script>

<style lang="less" scoped>
.ranking-section {
    width: 100%;
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
}

.header-title {
    margin: 21px 0 5px;
    font-family: SourceHanSansCN-Light;
    font-size: 12px;
    font-weight: 600;
    line-height: 15px;
    text-align: center;
    white-space: nowrap;

    color: #1d3534;

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
    color: #c69c6d;
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
        font-weight: 600;
        color: #c69c6d;
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
    margin: 13px 0 0;
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

    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
}

.rank-icon {
    flex-shrink: 0;
    width: 54px;
    height: 69px;
    margin: 30px 0 0 12px;

    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
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

    background-repeat: no-repeat;
    background-size: 100% 100%;
}

.manager-name {
    font-family: SourceHanSansCN-Medium;
    font-size: 12px;
    font-weight: 500;
    text-align: center;
    white-space: nowrap;

    color: #c69c6d;
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
    font-weight: 600;
    text-align: center;
    white-space: nowrap;

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
    font-weight: 600;
    color: #c69c6d;
}

.area-unit {
    font-family: SourceHanSansCN-Light;
    font-size: 13px;
    font-weight: 600;
    color: #c69c6d;
}

.district-name {
    font-family: SourceHanSansCN-Bold;
    font-size: 13px;
    font-weight: 700;
    text-align: center;
    white-space: nowrap;

    color: #4cfdeb;
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

// 通用样式
.flex-row {
    display: flex;
    flex-direction: row;
}

.flex-col {
    display: flex;
    flex-direction: column;
}
</style>
