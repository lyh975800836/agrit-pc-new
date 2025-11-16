<template>
  <div class="page flex-col" :class="layoutClasses">
    <!-- 主内容层 dashboard-layout__main -->
    <div class="dashboard-layout__main flex-col">
      <!-- 头部区域 -->
      <DashboardHeader
        :weather="weather"
        :user="user"
        :show-back-button="showBackButton"
        :page-title="pageTitle"
        @back="$emit('back')"
        @page-title-click="handlePageTitleClick"
        @nav-button-click="handleNavButtonClick"
      />

      <!-- 主体内容区域 dashboard-layout__content -->
      <div class="dashboard-layout__content flex-row">
        <!-- 左侧区域 - 根据插槽内容决定显示什么 -->
        <aside
          v-if="shouldRenderLeftPanel"
          :class="leftSidebarClasses"
        >
          <!-- 左侧展开/收缩触发器 - 单节点控制旋转 -->
          <div
            class="sidebar-toggle-trigger sidebar-toggle-trigger--left"
            :class="{ 'sidebar-toggle-trigger--collapsed': isLeftCollapsed }"
            :style="{ backgroundImage: `url(${leftSlideImage})` }"
            role="button"
            tabindex="0"
            :aria-label="isLeftCollapsed ? '展开左侧面板' : '收起左侧面板'"
            @click="toggleLeftPanel"
            @keydown.enter="toggleLeftPanel"
            @keydown.space="toggleLeftPanel"
          ></div>

          <div
            v-show="!isLeftCollapsed"
            class="sidebar-panel__content left-panel-container"
          >
            <template v-if="hasCustomLeftPanel">
              <!-- 如果有left-panel插槽，使用插槽内容 -->
              <slot
                name="left-panel"
                :toggle-left-panel="toggleLeftPanel"
                :is-left-collapsed="isLeftCollapsed"
              ></slot>
            </template>
            <template v-else>
              <!-- 默认显示数据展示区域 -->
              <LeftDataPanel
                :project-data="projectData"
                :statistics-data="statisticsData"
                :is-collapsed="isLeftCollapsed"
              />
            </template>
          </div>
        </aside>

        <!-- 中间地图区域 dashboard-layout__map-area - 通过插槽自定义 -->
        <div class="dashboard-layout__map-area flex-grow">
          <div class="map-container">
            <slot name="center-map"></slot>
          </div>

          <!-- 底部导航条 - 面包屑导航 -->
          <BreadcrumbNavigation
            :region-name="regionName"
            :show-bottom-nav="showBottomNav"
            @back="handleBackClick"
            @breadcrumb-click="handleBreadcrumbClick"
          />
        </div>

        <!-- 右侧区域 - 根据插槽内容决定显示什么 -->
        <aside
          v-if="shouldRenderRightPanel"
          :class="rightSidebarClasses"
        >
          <!-- 右侧展开/收缩触发器 - 单节点控制旋转 -->
          <div
            class="sidebar-toggle-trigger sidebar-toggle-trigger--right"
            :class="{ 'sidebar-toggle-trigger--collapsed': isRightCollapsed }"
            :style="{ backgroundImage: `url(${rankingDecorationImage})` }"
            role="button"
            tabindex="0"
            :aria-label="isRightCollapsed ? '展开右侧面板' : '收起右侧面板'"
            @click="toggleRightPanel"
            @keydown.enter="toggleRightPanel"
            @keydown.space="toggleRightPanel"
          ></div>

          <div
            v-show="!isRightCollapsed"
            class="sidebar-panel__content right-panel-container"
          >
            <template v-if="hasCustomRightPanel">
              <!-- 如果有right-panel插槽，使用插槽内容 -->
              <slot
                name="right-panel"
                :toggle-right-panel="toggleRightPanel"
                :is-right-collapsed="isRightCollapsed"
              ></slot>
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
        </aside>
      </div>
    </div>
  </div>
</template>

<script>
import { getCategoryImages } from '@/utils/imageManager';
import DashboardHeader from './DashboardHeader.vue';
import LeftDataPanel from './LeftDataPanel.vue';
import RightRankingPanel from './RightRankingPanel.vue';
import BreadcrumbNavigation from './BreadcrumbNavigation.vue';

export default {
    name: 'DashboardLayout',
    components: {
        DashboardHeader,
        LeftDataPanel,
        RightRankingPanel,
        BreadcrumbNavigation
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
                'dashboard-layout--with-bottom-nav': this.showBottomNav
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
        hasCustomLeftPanel() {
            return Boolean(this.$slots['left-panel'] || this.$scopedSlots['left-panel']);
        },
        hasCustomRightPanel() {
            return Boolean(this.$slots['right-panel'] || this.$scopedSlots['right-panel']);
        },
        shouldRenderLeftPanel() {
            return !this.hideLeftPanel;
        },
        shouldRenderRightPanel() {
            return !this.hideRightPanel;
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
        handlePageTitleClick() {
            this.$emit('page-title-click');
            // 默认导航到数据驾驶舱
            if (this.$router) {
                this.$router.push('/data-dashboard').catch(() => {});
            }
        },
        handleNavButtonClick() {
            this.$emit('nav-button-click');
            // 默认导航到首页
            if (this.$router) {
                this.$router.push('/').catch(() => {});
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
@bottom-nav-height: 50px;
@import "@/styles/abstracts/index.less";

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
    align-items: stretch;
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
    height: 100%;

    opacity: .9;
    background: #00282a;
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
    bottom: @bottom-nav-height;
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
    overflow-x: hidden;
    overflow-y: auto;
    flex: none;
    width: 375px;
    max-width: 100%;
    height: 100%;
}

.left-panel-container,
.right-panel-container {
    width: 100%;
    border: 1px solid #c69c6d;
}

.left-panel-container {
    padding-right: 18px;
}

.sidebar-panel--overlay .sidebar-panel__content {
    height: 100%;
}

.sidebar-panel--collapsed .sidebar-panel__content {
    overflow: hidden;
}

/* 隐藏默认滚动条，仅保留滚动功能 */
.sidebar-panel__content::-webkit-scrollbar {
    width: 0;
    height: 0;
}

.sidebar-panel__content {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

// 侧边栏展开/收缩触发器
.sidebar-toggle-trigger {
    position: absolute;
    z-index: 15;
    top: 50%;
    width: 14px;
    height: 279px;

    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    transition: opacity .3s ease;
    transform: translateY(-50%);
    cursor: pointer;

    &:hover {
        opacity: .85;
    }

    &:active {
        opacity: .7;
    }
}

.sidebar-toggle-trigger--collapsed {
    transform: translateY(-50%) rotate(180deg);
}

.sidebar-toggle-trigger--left {
    right: 0;
    left: auto;
}

.sidebar-toggle-trigger--right {
    right: auto;
    left: 0;
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
    max-height: calc(100% - 10px);
    pointer-events: auto;
}

// 面包屑导航样式已移至 BreadcrumbNavigation.vue 组件中
.dashboard-layout--full-map .breadcrumb-navigation {
    ::v-deep .breadcrumb-navigation__container {
        max-width: none;
    }
}
</style>
