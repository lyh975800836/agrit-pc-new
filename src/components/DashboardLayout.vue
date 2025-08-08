<template>
  <div class="page flex-col">
    <!-- 背景层 group_1 -->
    <div class="group_1 flex-col">
      <div class="image-wrapper_1 flex-col">
        <img
          class="image_1"
          referrerpolicy="no-referrer"
          src="https://lanhu-oss-proxy.lanhuapp.com/fe5d54fb32c5e50aa6df33fb206250aa"
        />
      </div>
    </div>

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
      <div class="group_4">
        <!-- 中间地图区域 group_5 - 通过插槽自定义 -->
        <div class="group_5">
          <div class="section_1">
            <slot name="center-map"></slot>
          </div>
        </div>

        <!-- 左侧数据展示区域 -->
        <LeftDataPanel 
          :project-data="projectData"
          :statistics-data="statisticsData"
        />

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
</style>