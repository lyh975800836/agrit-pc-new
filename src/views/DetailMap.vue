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
    :show-bottom-nav="true"
    :breadcrumb-items="breadcrumbItems"
    @back="goBack"
    @breadcrumb-click="handleBreadcrumbClick"
  >
    <template #center-map>
      <RegionDetailMap
        :key="`detail-map-${cityAdcode}-${regionAdcode}-${regionName}`"
        :region-name="regionName"
        :city-name="cityName"
        :city-adcode="cityAdcode"
        :region-adcode="regionAdcode"
      />
    </template>

  </DashboardLayout>
</template>

<script>
import DashboardLayout from '@/components/Dashboard/DashboardLayout.vue';
import RegionDetailMap from '@/components/Map/RegionDetailMap.vue';
import { sharedDashboardData } from '@/config/dashboardData';

export default {
    name: 'DetailMap',
    components: {
        DashboardLayout,
        RegionDetailMap
    },
    data() {
        // eslint-disable-next-line no-unused-vars
        const { user: _user, ...rest } = sharedDashboardData;
        return {
            regionName: this.$route.params.region || '右江区',
            cityName: this.$route.query.cityName || '百色市',
            cityAdcode: this.$route.query.cityAdcode || '451000',
            regionAdcode: this.$route.query.regionAdcode || '',
            ...rest
        };
    },
    computed: {
        cityDashboardRoute() {
            return {
                name: 'Dashboard',
                query: {
                    level: 'city',
                    cityName: this.cityName,
                    cityAdcode: String(this.cityAdcode)
                }
            };
        },
        breadcrumbItems() {
            return [
                { name: '广西', route: { name: 'Dashboard' } },
                { name: this.cityName.replace(/市$/, ''), route: this.cityDashboardRoute },
                { name: this.regionName, path: this.$route.path, current: true }
            ];
        },
        user() {
            try {
                const raw = localStorage.getItem('user_info');
                if (raw) {
                    const u = JSON.parse(raw);
                    return { name: u.real_name || u.username || '管理员', avatar: u.avatar || '/images/user-avatar.png' };
                }
            } catch (e) { /* ignore */ }
            return { name: '管理员', avatar: '/images/user-avatar.png' };
        },
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
            this.cityName = to.query.cityName || '百色市';
            this.cityAdcode = to.query.cityAdcode || '451000';
            this.regionAdcode = to.query.regionAdcode || '';
        }
    },
    beforeDestroy() {
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
    },
    methods: {
        goBack() {
            this.$router.push(this.cityDashboardRoute).catch(() => {});
        },
        handleBreadcrumbClick(item) {
            const target = item.route || item.path;
            if (target) {
                this.$router.push(target).catch(() => {});
            }
        }
    }
};
</script>

<style lang="less" scoped>
@import "@/styles/abstracts/index.less";
</style>
