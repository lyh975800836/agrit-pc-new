<template>
  <DashboardLayout
    :weather="weather"
    :user="user"
    :project-data="projectData"
    :statistics-data="statisticsData"
    :ranking-data="rankingData"
    :quality-data="qualityData"
    :region-name="regionName"
    :show-back-button="true"
    :page-title="regionName + '详情'"
    :full-screen-map="true"
    @back="goBack"
  >
    <template #center-map>
      <RegionDetailMap
        :key="`detail-map-${regionName}`"
        :region-name="regionName"
        :show-plot-details="false"
        :show-plot-markers="true"
      />
    </template>

  </DashboardLayout>
</template>

<script>
import DashboardLayout from '@/components/DashboardLayout.vue';
import RegionDetailMap from '@/components/RegionDetailMap.vue';
import { sharedDashboardData } from '@/config/dashboardData';

export default {
    name: 'DetailMap',
    components: {
        DashboardLayout,
        RegionDetailMap
    },
    data() {
        return {
            regionName: this.$route.params.region || '右江区',
            // 使用共享数据源
            ...sharedDashboardData
        };
    },
    computed: {
        currentTime() {
            const now = new Date();
            return now.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        },
        currentDate() {
            const now = new Date();
            return `${ now.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).replace(/\//g, '年')
                .replace(/年(\d+)年/, '年$1月') }日`;
        },
        weekday() {
            const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            return days[new Date().getDay()];
        }
    },
    mounted() {
        // 启动定时器更新时间
        this.timeInterval = setInterval(() => {
            this.$forceUpdate();
        }, 1000);
    },
    watch: {
    // 监听路由变化
        $route(to) {
            if (to.params.region) {
                this.regionName = to.params.region;
            }
        }
    },
    beforeDestroy() {
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
    },
    methods: {
        goBack() {
            this.$router.push('/');
        }
    }
};
</script>

<style lang="less" scoped>
@import "@/styles/abstracts/index.less";
</style>
