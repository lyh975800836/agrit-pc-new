<template>
  <div class="page flex-col" :class="layoutClasses">
    <!-- 主内容层 group_2 -->
    <div class="group_2 flex-col">
      <!-- 头部区域 -->
      <DashboardHeader
        :weather="weather"
        :user="user"
        :show-back-button="showBackButton"
        :page-title="'数据驾驶舱'"
        @back="$emit('back')"
      />

      <!-- 主体内容区域 group_4 -->
      <div class="group_4 flex-row">
        <!-- 左侧区域 - 根据插槽内容决定显示什么 -->
        <div
          v-if="shouldRenderLeftPanel"
          :class="leftPanelShellClasses"
        >
          <div
            v-show="!isLeftCollapsed"
            :class="leftPanelContainerClasses"
          >
            <template v-if="$slots['left-panel']">
              <!-- 如果有left-panel插槽，使用插槽内容 -->
              <slot name="left-panel"></slot>
            </template>
            <template v-else>
              <!-- 默认显示数据展示区域 -->
              <LeftDataPanel
                :project-data="projectData"
                :statistics-data="statisticsData"
              />
            </template>
          </div>
          <button
            class="panel-toggle panel-toggle--left"
            type="button"
            :aria-expanded="(!isLeftCollapsed).toString()"
            :aria-label="isLeftCollapsed ? '展开左侧面板' : '收起左侧面板'"
            @click="toggleLeftPanel"
          >
            <span class="panel-toggle__icon">{{ isLeftCollapsed ? '›' : '‹' }}</span>
          </button>
        </div>

        <!-- 中间地图区域 group_5 - 通过插槽自定义 -->
        <div class="group_5 flex-grow">
          <div class="section_1 center-content">
            <slot name="center-map"></slot>
          </div>

          <!-- 底部导航条 - 只在非首页且有多级导航时显示 -->
          <div v-if="shouldShowBottomNav" class="bottom-navigation">
            <div class="nav-container">
              <div class="nav-left">
                <button class="back-btn" @click="handleBackClick">
                  <span class="back-arrow">‹</span>
                  <span class="back-text">返回上级</span>
                </button>
              </div>

              <div class="nav-breadcrumb">
                <template v-for="(item, index) in breadcrumbs">
                  <span
                    :key="'item-' + index"
                    class="breadcrumb-item"
                    :class="{ current: item.current }"
                    @click="handleBreadcrumbClick(item)"
                  >
                    {{ item.name }}
                  </span>
                  <span
                    v-if="index < breadcrumbs.length - 1"
                    :key="'sep-' + index"
                    class="breadcrumb-separator"
                  >
                    >
                  </span>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧区域 - 根据插槽内容决定显示什么 -->
        <div
          v-if="shouldRenderRightPanel"
          :class="rightPanelShellClasses"
        >
          <button
            class="panel-toggle panel-toggle--right"
            type="button"
            :aria-expanded="(!isRightCollapsed).toString()"
            :aria-label="isRightCollapsed ? '展开右侧面板' : '收起右侧面板'"
            @click="toggleRightPanel"
          >
            <span class="panel-toggle__icon">{{ isRightCollapsed ? '‹' : '›' }}</span>
          </button>
          <div
            v-show="!isRightCollapsed"
            :class="rightPanelContainerClasses"
          >
            <template v-if="$slots['right-panel']">
              <!-- 如果有right-panel插槽，使用插槽内容 -->
              <slot name="right-panel"></slot>
            </template>
            <template v-else>
              <!-- 默认显示排名区域 -->
              <RightRankingPanel
                :region-name="regionName"
                :ranking-data="rankingData"
                :quality-data="qualityData"
                :selected-farming-item="selectedFarmingItem"
                @farming-item-click="$emit('farming-item-click', $event)"
              />
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardHeader from './DashboardHeader.vue';
import LeftDataPanel from './LeftDataPanel.vue';
import RightRankingPanel from './RightRankingPanel.vue';

export default {
    name: 'DashboardLayout',
    components: {
        DashboardHeader,
        LeftDataPanel,
        RightRankingPanel
    },
    props: {
        weather: {
            type: Object,
            required: true
        },
        user: {
            type: Object,
            required: true
        },
        projectData: {
            type: Object,
            required: true
        },
        statisticsData: {
            type: Object,
            required: true
        },
        rankingData: {
            type: Array,
            required: true
        },
        qualityData: {
            type: Object,
            required: true
        },
        regionName: {
            type: String,
            default: '百色市'
        },
        showBackButton: {
            type: Boolean,
            default: false
        },
        pageTitle: {
            type: String,
            default: '数据驾驶舱'
        },
        showBottomNav: {
            type: Boolean,
            default: false
        },
        selectedFarmingItem: {
            type: Object,
            default: null
        },
        fullScreenMap: {
            type: Boolean,
            default: false
        },
        hideLeftPanel: {
            type: Boolean,
            default: false
        },
        hideRightPanel: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            isLeftCollapsed: false,
            isRightCollapsed: false
        };
    },
    computed: {
        layoutClasses() {
            return {
                'dashboard-layout--full-map': this.fullScreenMap
            };
        },
        leftPanelShellClasses() {
            return [
                'panel-shell',
                'panel-shell--left',
                {
                    'panel-shell--overlay': this.fullScreenMap,
                    'panel-shell--overlay-left': this.fullScreenMap,
                    'panel-shell--collapsed': this.isLeftCollapsed
                }
            ];
        },
        rightPanelShellClasses() {
            return [
                'panel-shell',
                'panel-shell--right',
                {
                    'panel-shell--overlay': this.fullScreenMap,
                    'panel-shell--overlay-right': this.fullScreenMap,
                    'panel-shell--collapsed': this.isRightCollapsed
                }
            ];
        },
        leftPanelContainerClasses() {
            return [
                'panel-content',
                'left-panel-container'
            ];
        },
        rightPanelContainerClasses() {
            return [
                'panel-content',
                'right-panel-container'
            ];
        },
        shouldRenderLeftPanel() {
            return !this.hideLeftPanel;
        },
        shouldRenderRightPanel() {
            return !this.hideRightPanel;
        },
        breadcrumbs() {
            const route = this.$route;
            const breadcrumbs = [];

            // 根据当前路由生成面包屑 - 只显示地理层级，不显示数据驾驶舱
            switch (route.name) {
                case 'Dashboard':
                case 'DataDashboard':
                    // 首页不显示面包屑
                    break;

                case 'DetailMap': {
                    // 区县详情页面：百色 > 右江区
                    breadcrumbs.push({ name: '百色', path: '/' });
                    const regionName = route.params.region || this.regionName || '右江区';
                    breadcrumbs.push({ name: regionName, path: route.path, current: true });
                    break;
                }

                case 'PlotDetail': {
                    // 地块详情页面：百色 > XX县 > 具体地块名
                    breadcrumbs.push({ name: '百色', path: '/' });

                    // 从query参数获取区域信息
                    const plotRegion = route.query.region || this.regionName || '右江区';
                    breadcrumbs.push({
                        name: plotRegion,
                        path: `/detail/${ plotRegion }`
                    });

                    // 当前地块名称
                    const plotName = route.query.plotName || '地块详情';
                    breadcrumbs.push({
                        name: plotName,
                        path: route.path,
                        current: true
                    });
                    break;
                }
            }

            return breadcrumbs;
        },

        // 控制底部导航是否显示
        shouldShowBottomNav() {
            const route = this.$route;
            // 只在地块详情页面或区县详情页面显示底部导航
            // 数据驾驶舱页面和总览图页面不显示
            return route.name === 'PlotDetail' || route.name === 'DetailMap';
        }
    },
    watch: {
        hideLeftPanel(value) {
            if (value) {
                this.isLeftCollapsed = false;
            }
        },
        hideRightPanel(value) {
            if (value) {
                this.isRightCollapsed = false;
            }
        }
    },
    methods: {
        handleBackClick() {
            this.$emit('back');
        },
        handleBreadcrumbClick(item) {
            if (!item.current && item.path) {
                this.$emit('breadcrumb-click', item);
                // 如果没有外部处理，则使用路由跳转
                if (this.$router) {
                    this.$router.push(item.path);
                }
            }
        },
        toggleLeftPanel() {
            this.isLeftCollapsed = !this.isLeftCollapsed;
        },
        toggleRightPanel() {
            this.isRightCollapsed = !this.isRightCollapsed;
        }
    }
};
</script>

<style lang="less" scoped>
@import "@/styles/abstracts/index.less";

.page {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
}

.group_2 {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
}

// 自定义布局样式
.group_4 {
    position: relative !important;
    display: flex !important;
    flex: 1 !important;
    flex-direction: row !important;
    align-items: flex-start !important;
    width: 100% !important;
    min-height: 0;
    padding: 0 10px;

    gap: 10px;
}

.group_5 {
    position: relative !important;
    top: auto !important;
    left: auto !important;
    display: flex !important;
    flex: 1 !important;
    flex-direction: column !important;
    align-items: stretch !important;
    justify-content: stretch !important;
    width: auto !important;
    max-width: none !important;
    height: 100% !important;
    min-height: 0 !important;
    padding: 5px !important;
}

.section_1 {
    position: relative !important;
    display: flex !important;
    flex: 1 !important;
    align-items: stretch !important;
    justify-content: stretch !important;
    width: 100% !important;
    min-height: 0 !important;
}

.center-content {
    text-align: center !important;
}

.flex-row {
    display: flex;
    flex-direction: row;
}

.flex-grow {
    flex-grow: 1;
}

.panel-shell {
    position: relative;
    z-index: 10;
    display: flex;
    overflow: visible;
    flex: 0 0 375px;
    align-items: stretch;
    min-width: 0;

    transition: flex-basis .3s ease, width .3s ease;
}

.panel-shell--left {
    flex-direction: row;
}

.panel-shell--right {
    flex-direction: row;
    justify-content: flex-end;
}

.panel-shell--collapsed {
    flex: 0 0 42px;
    width: auto;
}

.panel-shell--overlay {
    position: absolute;
    z-index: 20;
    top: 0;
    bottom: 70px;
    flex: 0 0 auto;
    width: min(375px, calc(50% - 40px), calc(100% - 80px));

    pointer-events: auto;
}

.panel-shell--overlay-left {
    left: 20px;
}

.panel-shell--overlay-right {
    right: 20px;
}

.panel-shell--overlay.panel-shell--collapsed {
    flex: 0 0 42px;
    width: auto;
}

.panel-content {
    position: relative;
    flex: none;
    width: 375px;
    max-width: 100%;
}

.left-panel-container,
.right-panel-container {
    width: 100%;
}

.panel-shell--overlay .panel-content {
    overflow-y: auto;
    height: 100%;
}

.panel-shell--collapsed .panel-content {
    overflow: hidden;
}

.panel-toggle {
    position: absolute;
    z-index: 25;
    top: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 72px;
    margin: 0;
    border: 1px solid #4ccfea73;

    color: #4cfcea;
    border-radius: 999px;
    background: #102838e6;
    box-shadow: 0 6px 18px #00000059;
    transition: transform .2s ease, border-color .2s ease, background .2s ease;
    transform: translateY(-50%);
    cursor: pointer;
}

.panel-toggle:hover {
    border-color: #4ccfeaa6;
    background: #1c485af2;
}

.panel-toggle:active {
    transform: translateY(-50%) scale(.96);
}

.panel-toggle--left {
    right: -16px;
}

.panel-toggle--right {
    left: -16px;
}

.panel-toggle--left:active {
    transform: translateY(-50%) translateX(1px) scale(.96);
}

.panel-toggle--right:active {
    transform: translateY(-50%) translateX(-1px) scale(.96);
}

.panel-shell--collapsed .panel-toggle--left {
    right: -20px;
}

.panel-shell--collapsed .panel-toggle--right {
    left: -20px;
}

.panel-shell--overlay .panel-toggle--left {
    right: -14px;
}

.panel-shell--overlay .panel-toggle--right {
    left: -14px;
}

.panel-toggle--left:hover {
    transform: translateY(-50%) translateX(1px);
}

.panel-toggle--right:hover {
    transform: translateY(-50%) translateX(-1px);
}

.panel-toggle__icon {
    font-size: 18px;
    font-weight: 600;
    line-height: 1;
}

.dashboard-layout--full-map .group_4 {
    align-items: stretch !important;
    justify-content: center !important;
    padding: 0 20px 20px;
    gap: 0;
}

.dashboard-layout--full-map .group_5 {
    width: 100% !important;
    max-width: none !important;
    padding: 0 !important;
}

.dashboard-layout--full-map .section_1 {
    border-radius: 0;
}

.dashboard-layout--full-map .panel-shell--overlay {
    max-height: calc(100% - 90px);
    pointer-events: auto;
}

.dashboard-layout--full-map .bottom-navigation {
    right: 20px;
    left: 20px;
}

.dashboard-layout--full-map .nav-container {
    max-width: none;
}

/* 底部导航条样式 */
.bottom-navigation {
    position: absolute;
    z-index: 10;
    right: 0;
    bottom: 0;
    left: 0;
    height: 50px;
    border-top: 1px solid #4ccfea4d;

    opacity: .8;

    backdrop-filter: blur(10px);
}

.nav-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1000px;
    height: 100%;
    margin: 0 auto;
    padding: 0 30px;
}

.nav-left {
    display: flex;
    align-items: center;
}

.back-btn {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    border: 1px solid #4ccfea4d;
    font-family: SourceHanSansCN-Medium;
    font-size: 14px;

    color: #4cfcea;
    border-radius: 6px;
    background: #4ccfea1a;
    transition: all .3s ease;
    cursor: pointer;

    gap: 8px;

    &:hover {
        border-color: #4ccfea80;
        background: #4ccfea33;
        transform: translateX(-2px);
    }

    &:active {
        transform: translateX(-1px);
    }
}

.back-arrow {
    font-size: 18px;
    font-weight: bold;
    line-height: 1;
}

.back-text {
    font-size: 14px;
    font-weight: 500;
}

.nav-breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
}

.breadcrumb-item {
    font-family: SourceHanSansCN-Regular;
    font-size: 14px;

    color: #5dd7ce;
    transition: color .3s ease;
    cursor: pointer;

    &:not(.current):hover {
        color: #4cfcea;
    }

    &.current {
        font-weight: 500;
        color: #4cfcea;
        cursor: default;
    }
}

.breadcrumb-separator {
    font-size: 14px;
    color: #5dd7ce99;
    user-select: none;
}
</style>
