<template>
  <div class="page flex-col">
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
          />
        </template>
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
        }
    },
    computed: {
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
        }
    }
};
</script>

<style lang="less" scoped>
@import "@/styles/abstracts/index.less";

// 自定义布局样式
.group_4 {
    position: relative !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: flex-start !important;
    width: 100% !important;
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
    align-items: center !important;
    justify-content: center !important;
    width: auto !important;
    min-width: 600px !important;
    max-width: 1000px !important;
    height: calc(100vh - 180px) !important;
    min-height: 700px !important;
    padding: 5px !important;
}

.section_1 {
    position: relative !important;
    display: flex !important;
    flex: 1 !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100% !important;

    /* 调整尺寸匹配容器，为底部导航留空间 */
    min-width: 700px !important;
    max-width: 1000px !important;
    height: calc(100% - 60px) !important;
    min-height: 650px !important;

    /* 移除max-width和max-height限制，确保地图完整显示 */
    /* max-width: 1200px !important; */
    /* max-height: 800px !important; */
    margin: 0 auto !important;
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

/* 底部导航条样式 */
.bottom-navigation {
    position: absolute;
    z-index: 10;
    right: 0;
    bottom: 0;
    left: 0;
    height: 50px;
    border-top: 1px solid #4ccfea4d;

    background: linear-gradient(180deg, #102838e6 0%, #081c24f2 100%);

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
