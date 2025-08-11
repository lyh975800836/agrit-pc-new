<template>
  <div class="page flex-col">
    <!-- 主内容层 group_2 -->
    <div class="group_2 flex-col">
      <!-- 头部区域 -->
      <DashboardHeader 
        :weather="weather"
        :user="user"
        :show-back-button="showBackButton"
        :page-title="pageTitle"
        @back="$emit('back')"
      />

      <!-- 主体内容区域 group_4 -->
      <div class="group_4 flex-row">
        <!-- 左侧数据展示区域 -->
        <LeftDataPanel 
          :project-data="projectData"
          :statistics-data="statisticsData"
        />
        
        <!-- 中间地图区域 group_5 - 通过插槽自定义 -->
        <div class="group_5 flex-grow">
          <div class="section_1 center-content">
            <slot name="center-map"></slot>
          </div>
        </div>

        <!-- 右侧排名区域 -->
        <RightRankingPanel 
          :region-name="regionName"
          :ranking-data="rankingData"
          :quality-data="qualityData"
        />
      </div>
    </div>
  </div>
</template>

<script>
import DashboardHeader from './DashboardHeader.vue'
import LeftDataPanel from './LeftDataPanel.vue'
import RightRankingPanel from './RightRankingPanel.vue'

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
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/dashboard.less';

// 自定义布局样式，覆盖dashboard.less中的定位样式
.group_4 {
  display: flex !important;
  flex-direction: row !important;
  align-items: flex-start !important;
  gap: 10px;
  padding: 0 10px;
  width: 100% !important;
  position: relative !important;
}

.group_5 {
  position: relative !important;
  left: auto !important;
  top: auto !important;
  flex: 1 !important;
  width: auto !important;
  min-width: 600px !important;
  max-width: 1000px !important;
  height: calc(100vh - 180px) !important;
  min-height: 700px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 5px !important;
}

.section_1 {
  position: relative !important;
  width: 100% !important;
  height: 100% !important;
  /* 移除max-width和max-height限制，确保地图完整显示 */
  /* max-width: 1200px !important; */
  /* max-height: 800px !important; */
  margin: 0 auto !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  /* 调整尺寸匹配容器 */
  min-width: 700px !important;
  max-width: 1000px !important;
  min-height: 700px !important;
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
</style>