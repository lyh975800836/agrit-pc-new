<template>
  <div class="page flex-col" :class="layoutClasses">
    <!-- 主内容层 dashboard-layout__main -->
    <div class="dashboard-layout__main flex-col">
      <!-- 头部区域 -->
      <DashboardHeader
        :weather="weather"
        :user="user"
        :show-back-button="showBackButton"
        :page-title="'数据驾驶舱'"
        @back="$emit('back')"
      />

      <!-- 主体内容区域 dashboard-layout__content -->
      <div class="dashboard-layout__content flex-row">
        <!-- 左侧区域 - 根据插槽内容决定显示什么 -->
        <aside
          v-if="shouldRenderLeftPanel"
          :class="leftSidebarClasses"
        >
          <!-- 左侧展开/收缩触发器 - 使用装饰图片旋转180度 -->
          <div
            v-if="isLeftCollapsed"
            class="sidebar-expand-trigger sidebar-expand-trigger--left"
            :style="{ backgroundImage: `url(${leftSlideImage})` }"
            role="button"
            tabindex="0"
            :aria-label="'展开左侧面板'"
            @click="toggleLeftPanel"
            @keydown.enter="toggleLeftPanel"
            @keydown.space="toggleLeftPanel"
          ></div>

          <div
            v-show="!isLeftCollapsed"
            class="sidebar-panel__content left-panel-container"
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
                :is-collapsed="isLeftCollapsed"
                @toggle-panel="toggleLeftPanel"
              />
            </template>
          </div>
        </aside>

        <!-- 中间地图区域 dashboard-layout__map-area - 通过插槽自定义 -->
        <div class="dashboard-layout__map-area flex-grow">
          <div class="map-container">
            <slot name="center-map"></slot>
          </div>

          <!-- 底部导航条 - 只在非首页且有多级导航时显示 -->
          <nav v-if="shouldShowBottomNav" class="breadcrumb-navigation" aria-label="位置导航">
            <div class="breadcrumb-navigation__container">
              <div class="breadcrumb-navigation__left">
                <button class="breadcrumb-navigation__back-btn" @click="handleBackClick" type="button">
                  <span class="breadcrumb-navigation__back-arrow">‹</span>
                  <span class="breadcrumb-navigation__back-text">返回上级</span>
                </button>
              </div>

              <ol class="breadcrumb-list">
                <template v-for="(item, index) in breadcrumbs">
                  <li :key="'item-' + index" class="breadcrumb-list__item">
                    <a
                      class="breadcrumb-list__link"
                      :class="{ 'breadcrumb-list__link--current': item.current }"
                      :aria-current="item.current ? 'page' : undefined"
                      @click="handleBreadcrumbClick(item)"
                    >
                      {{ item.name }}
                    </a>
                    <span
                      v-if="index < breadcrumbs.length - 1"
                      :key="'sep-' + index"
                      class="breadcrumb-list__separator"
                      aria-hidden="true"
                    >
                      >
                    </span>
                  </li>
                </template>
              </ol>
            </div>
          </nav>
        </div>

        <!-- 右侧区域 - 根据插槽内容决定显示什么 -->
        <aside
          v-if="shouldRenderRightPanel"
          :class="rightSidebarClasses"
        >
          <!-- 右侧展开/收缩触发器 - 使用装饰图片旋转180度 -->
          <div
            v-if="isRightCollapsed"
            class="sidebar-expand-trigger sidebar-expand-trigger--right"
            :style="{ backgroundImage: `url(${rankingDecorationImage})` }"
            role="button"
            tabindex="0"
            :aria-label="'展开右侧面板'"
            @click="toggleRightPanel"
            @keydown.enter="toggleRightPanel"
            @keydown.space="toggleRightPanel"
          ></div>

          <div
            v-show="!isRightCollapsed"
            class="sidebar-panel__content right-panel-container"
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
                :is-collapsed="isRightCollapsed"
                @farming-item-click="$emit('farming-item-click', $event)"
                @toggle-panel="toggleRightPanel"
              />
            </template>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardHeader from './DashboardHeader.vue';
import LeftDataPanel from './LeftDataPanel.vue';
import RightRankingPanel from './RightRankingPanel.vue';
import { getCategoryImages } from '@/utils/imageManager';

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
        // 获取展开触发器的装饰图片
        leftSlideImage() {
            const images = getCategoryImages('LEFT_PANEL');
            return images.leftSlide;
        },
        rankingDecorationImage() {
            const images = getCategoryImages('RIGHT_PANEL');
            return images.rankingDecoration;
        },
        layoutClasses() {
            return {
                'dashboard-layout--full-map': this.fullScreenMap,
                'dashboard-layout--with-bottom-nav': this.shouldShowBottomNav
            };
        },
        leftSidebarClasses() {
            return [
                'sidebar-panel',
                'sidebar-panel--left',
                {
                    'sidebar-panel--overlay': this.fullScreenMap,
                    'sidebar-panel--overlay-left': this.fullScreenMap,
                    'sidebar-panel--collapsed': this.isLeftCollapsed
                }
            ];
        },
        rightSidebarClasses() {
            return [
                'sidebar-panel',
                'sidebar-panel--right',
                {
                    'sidebar-panel--overlay': this.fullScreenMap,
                    'sidebar-panel--overlay-right': this.fullScreenMap,
                    'sidebar-panel--collapsed': this.isRightCollapsed
                }
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

@bottom-nav-height: 50px;

.page {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
}

.dashboard-layout__main {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
}

// 主体内容区域
.dashboard-layout__content {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: row;
    align-items: flex-start;
    width: 100%;
    min-height: 0;
    padding: 0 10px;
    gap: 10px;
}

// 地图区域
.dashboard-layout__map-area {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: stretch;
    justify-content: stretch;
    width: auto;
    max-width: none;
    height: 100%;
    min-height: 0;
    padding: 5px;
}

// 地图容器
.map-container {
    position: relative;
    display: flex;
    flex: 1;
    align-items: stretch;
    justify-content: stretch;
    width: 100%;
    min-height: 0;
}

.flex-row {
    display: flex;
    flex-direction: row;
}

.flex-grow {
    flex-grow: 1;
}

// 侧边栏面板
.sidebar-panel {
    position: relative;
    z-index: 10;
    display: flex;
    overflow: visible;
    flex: 0 0 375px;
    align-items: stretch;
    min-width: 0;
    transition: flex-basis .3s ease, width .3s ease;
}

.sidebar-panel--left {
    flex-direction: row;
}

.sidebar-panel--right {
    flex-direction: row;
    justify-content: flex-end;
}

.sidebar-panel--collapsed {
    flex: 0 0 42px;
    width: auto;
}

.sidebar-panel--overlay {
    position: absolute;
    z-index: 20;
    top: 0;
    bottom: (@bottom-nav-height + 20px);
    flex: 0 0 auto;
    width: min(375px, calc(50% - 40px), calc(100% - 80px));
    pointer-events: auto;
}

.sidebar-panel--overlay-left {
    left: 20px;
}

.sidebar-panel--overlay-right {
    right: 20px;
}

.sidebar-panel--overlay.sidebar-panel--collapsed {
    flex: 0 0 42px;
    width: auto;
}

.sidebar-panel__content {
    position: relative;
    flex: none;
    width: 375px;
    max-width: 100%;
}

.left-panel-container,
.right-panel-container {
    width: 100%;
}

.sidebar-panel--overlay .sidebar-panel__content {
    overflow-y: auto;
    height: 100%;
}

.sidebar-panel--collapsed .sidebar-panel__content {
    overflow: hidden;
}

// 侧边栏展开触发器 - 使用装饰图片旋转180度
.sidebar-expand-trigger {
    position: absolute;
    z-index: 15;
    top: 50%;
    width: 14px;
    height: 279px;
    cursor: pointer;
    transition: opacity 0.3s ease, transform 0.2s ease;
    transform: translateY(-50%);
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;

    &:hover {
        opacity: 0.8;
        transform: translateY(-50%) scaleX(1.2);
    }

    &:active {
        transform: translateY(-50%) scaleX(0.95);
    }
}

.sidebar-expand-trigger--left {
    left: 0;
    // 左侧展开用图片旋转180度
    transform: translateY(-50%) rotateY(180deg);

    &:hover {
        transform: translateY(-50%) rotateY(180deg) scaleX(1.2);
    }

    &:active {
        transform: translateY(-50%) rotateY(180deg) scaleX(0.95);
    }
}

.sidebar-expand-trigger--right {
    right: 0;
    // 右侧展开用图片旋转180度
    transform: translateY(-50%) rotateY(180deg);

    &:hover {
        transform: translateY(-50%) rotateY(180deg) scaleX(1.2);
    }

    &:active {
        transform: translateY(-50%) rotateY(180deg) scaleX(0.95);
    }
}

.dashboard-layout--full-map .dashboard-layout__content {
    align-items: stretch;
    justify-content: center;
    padding: 0 20px 20px;
    gap: 0;
}

.dashboard-layout--full-map .dashboard-layout__map-area {
    width: 100%;
    max-width: none;
    padding: 0;
}

.dashboard-layout--full-map .map-container {
    border-radius: 0;
}

.dashboard-layout--full-map .sidebar-panel--overlay {
    max-height: calc(100% - 90px);
    pointer-events: auto;
}

.dashboard-layout--full-map .breadcrumb-navigation {
    right: 20px;
    left: 20px;
}

.dashboard-layout--full-map .breadcrumb-navigation__container {
    max-width: none;
}

.dashboard-layout--with-bottom-nav .dashboard-layout__map-area {
    padding-bottom: (@bottom-nav-height + 5px);
}

// 底部导航条（面包屑导航）
.breadcrumb-navigation {
    position: absolute;
    z-index: 10;
    right: 0;
    bottom: 0;
    left: 0;
    height: @bottom-nav-height;
    border-top: 1px solid #4ccfea4d;
    opacity: 0.8;
    backdrop-filter: blur(10px);
}

.breadcrumb-navigation__container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1000px;
    height: 100%;
    margin: 0 auto;
    padding: 0 30px;
}

.breadcrumb-navigation__left {
    display: flex;
    align-items: center;
}

.breadcrumb-navigation__back-btn {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    border: 1px solid #4ccfea4d;
    font-family: SourceHanSansCN-Medium;
    font-size: 14px;
    color: #4cfcea;
    border-radius: 6px;
    background: #4ccfea1a;
    transition: all 0.3s ease;
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

.breadcrumb-navigation__back-arrow {
    font-size: 18px;
    font-weight: bold;
    line-height: 1;
}

.breadcrumb-navigation__back-text {
    font-size: 14px;
    font-weight: 500;
}

// 面包屑列表
.breadcrumb-list {
    display: flex;
    align-items: center;
    gap: 8px;
    list-style: none;
    margin: 0;
    padding: 0;
}

.breadcrumb-list__item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.breadcrumb-list__link {
    font-family: SourceHanSansCN-Regular;
    font-size: 14px;
    color: #5dd7ce;
    transition: color 0.3s ease;
    cursor: pointer;

    &:not(.breadcrumb-list__link--current):hover {
        color: #4cfcea;
    }

    &.breadcrumb-list__link--current {
        font-weight: 500;
        color: #4cfcea;
        cursor: default;
    }
}

.breadcrumb-list__separator {
    font-size: 14px;
    color: #5dd7ce99;
    user-select: none;
}
</style>
