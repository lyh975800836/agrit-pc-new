<template>
  <DashboardLayout
    :weather="weather"
    :user="user"
    :project-data="projectData"
    :statistics-data="statisticsData"
    :ranking-data="rankingData"
    :quality-data="qualityData"
    :region-name="currentRegionName"
    :show-back-button="showMapBackButton"
    :page-title="currentPageTitle"
    :show-bottom-nav="true"
    :breadcrumb-items="mapBreadcrumbItems"
    :selected-farming-item="selectedFarmingItem"
    :full-screen-map="true"
    @back="handleMapBack"
    @breadcrumb-click="handleMapBreadcrumbClick"
    @farming-item-click="handleFarmingItemClick"
  >
    <template #center-map>
      <MapViewGuangxi
        v-if="currentMapLevel === 'guangxi'"
        :map-data="guangxiMapData"
        :selected-city="selectedCity"
        :project-cities="currentProjectCities"
        :city-stats="cityPlotStats"
        :plot-loading="plotListLoading"
        @city-click="handleCityClick"
      />

      <MapViewBaise
        v-else
        :map-data="cityMapData"
        :markers="mapMarkers"
        :labels="mapLabels"
        :selected-region="selectedRegion"
        :project-regions="currentCityProjectRegions"
        :region-stats="currentDistrictPlotStats"
        :clickable-regions="canCurrentCityOpenDetail"
        @region-click="handleRegionClick"
      />
    </template>
  </DashboardLayout>
</template>

<script>
import MapViewGuangxi from '@/components/Map/MapViewGuangxi.vue';
import DashboardLayout from '@/components/Dashboard/DashboardLayout.vue';
import { sharedDashboardData } from '@/config/dashboardData';
import apiClient from '@/services/apiClient';
import {
    aggregatePlotsByFeatures,
    getPlotListPageInfo
} from '@/utils/adminRegionAggregator';

export default {
    name: 'Dashboard',
    components: {
        MapViewBaise: () => import('@/components/Map/MapViewBaise.vue'),
        MapViewGuangxi,
        DashboardLayout
    },
    computed: {
        currentRegionName() {
            return this.currentMapLevel === 'guangxi' ? '广西壮族自治区' : this.currentCityName;
        },
        currentPageTitle() {
            return this.currentMapLevel === 'guangxi' ? '广西总览图' : `${ this.currentCityName }总览图`;
        },
        showMapBackButton() {
            return this.currentMapLevel === 'city';
        },
        mapBreadcrumbItems() {
            if (this.currentMapLevel === 'guangxi') {
                return [
                    { name: '广西', path: 'map:guangxi', current: true }
                ];
            }

            return [
                { name: '广西', path: 'map:guangxi' },
                { name: this.currentCityShortName, path: 'map:city', current: true }
            ];
        },
        currentCityShortName() {
            return this.currentCityName.replace(/市$/, '');
        },
        currentCityProjectRegions() {
            const regionNames = Object.values(this.currentDistrictPlotStats)
                .filter(item => item.count > 0)
                .map(item => item.name);

            return regionNames;
        },
        currentProjectCities() {
            const cityNames = Object.values(this.cityPlotStats)
                .filter(item => item.count > 0)
                .map(item => item.name);

            return cityNames;
        },
        canCurrentCityOpenDetail() {
            return Object.values(this.currentDistrictPlotStats).some(item => item.count > 0);
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
        }
    },
    data() {
        // eslint-disable-next-line no-unused-vars
        const { user: _user, ...rest } = sharedDashboardData;
        return {
            // 使用共享数据源
            ...rest,

            // 地图相关数据
            currentMapLevel: 'guangxi',
            guangxiMapData: null,
            cityMapData: null,
            selectedCity: null,
            currentCityName: '',
            currentCityAdcode: null,
            allPlots: [],
            cityPlotStats: {},
            currentDistrictPlotStats: {},
            plotListLoading: false,
            plotListLoaded: false,
            plotListLoadError: null,
            selectedRegion: null,
            mapMarkers: [],
            mapLabels: [],

            // 农事项目数据
            farmingItems: [
                {
                    id: 'autumn-flower-protection',
                    name: '秋季保花施肥',
                    startDate: '8月01日',
                    endDate: '8月30日',
                    description: '处方：复合肥',
                    requirement: '要求在树根往外滴水的三分之二处，均匀绕树周围撒肥。',
                    status: 'current',
                    isActive: true
                },
                {
                    id: 'winter-fruit-strengthening',
                    name: '冬季保果壮果',
                    startDate: '11月01日',
                    endDate: '11月30日',
                    description: '处方：壮果专用肥',
                    requirement: '果实膨大期施用，配合适当修剪。',
                    status: 'expected',
                    isActive: false
                },
                {
                    id: 'spring-pest-control',
                    name: '春季生物防治',
                    startDate: '3月01日',
                    endDate: '3月30日',
                    description: '处方：生物防治药剂',
                    requirement: '均匀喷洒叶面，注意天气条件。',
                    status: 'completed',
                    isActive: false
                }
            ],

            // 选中的农事项目
            selectedFarmingItem: null
        };
    },
    async mounted() {
        // 加载地图数据
        await this.loadGuangxiMapData();
        await this.applyRouteMapState(this.$route);
        this.loadPlotListForMap();
    },
    watch: {
        '$route.query'() {
            if (this.$route.name === 'Dashboard') {
                this.applyRouteMapState(this.$route);
            }
        }
    },
    methods: {
        findCityFeatureByAdcode(adcode) {
            const normalizedAdcode = String(adcode || '');
            return (this.guangxiMapData?.features || []).find(feature =>
                String(feature.properties?.adcode || '') === normalizedAdcode
            );
        },

        async applyRouteMapState(route) {
            const query = route?.query || {};
            const level = query.level || query.mapLevel;
            const cityAdcode = query.cityAdcode;
            const cityFeature = this.findCityFeatureByAdcode(cityAdcode);
            const cityName = query.cityName || cityFeature?.properties?.name;

            if ((level === 'city' || cityAdcode) && cityName && cityAdcode) {
                await this.openCityMap(cityName, cityAdcode);
                return;
            }

            this.currentMapLevel = 'guangxi';
            this.selectedCity = null;
            this.selectedRegion = null;
            this.currentCityName = '';
            this.currentCityAdcode = null;
            this.currentDistrictPlotStats = {};
        },

        getCityMapRoute(cityName, cityAdcode) {
            return {
                name: 'Dashboard',
                query: {
                    level: 'city',
                    cityName,
                    cityAdcode: String(cityAdcode)
                }
            };
        },

        pushMapRoute(route) {
            return this.$router.push(route).catch(error => {
                if (error?.name !== 'NavigationDuplicated') {
                    throw error;
                }
            });
        },

        async openCityMap(cityName, cityAdcode) {
            const normalizedAdcode = String(cityAdcode);

            if (!cityName || !normalizedAdcode) {
                return;
            }

            const shouldResetMap = this.currentCityAdcode !== normalizedAdcode
                || this.currentMapLevel !== 'city';

            this.selectedCity = cityName;
            this.currentCityName = cityName;
            this.currentMapLevel = 'city';

            if (shouldResetMap) {
                this.cityMapData = {
                    type: 'FeatureCollection',
                    features: []
                };
                this.currentDistrictPlotStats = {};
            }

            await this.loadCityMapData(normalizedAdcode);
        },

        // 加载广西一级地图数据
        async loadGuangxiMapData() {
            try {
                const guangxiDataImport = await import('@/assets/mapdata/guangxi-cities.json');
                const guangxiData = guangxiDataImport.default || guangxiDataImport;

                if (!guangxiData || !guangxiData.features) {
                    throw new Error('无法读取广西地图数据文件');
                }

                this.guangxiMapData = guangxiData;
                this.refreshCityPlotStats();

            }
            catch (error) {
                console.error('加载广西地图数据失败:', error);

                this.guangxiMapData = {
                    type: 'FeatureCollection',
                    features: []
                };
            }
        },

        async loadPlotListForMap() {
            if (this.plotListLoading) {
                return;
            }

            this.plotListLoading = true;
            this.plotListLoadError = null;

            try {
                const plots = await this.fetchAllPlotsForMap();
                this.allPlots = plots;
                this.plotListLoaded = true;
                this.refreshCityPlotStats();
                this.refreshCurrentDistrictPlotStats();
            }
            catch (error) {
                console.error('加载地图地块列表失败:', error);
                this.plotListLoadError = error;
            }
            finally {
                this.plotListLoading = false;
            }
        },

        async fetchAllPlotsForMap() {
            const pageSize = 100;
            const maxPages = 50;
            const plots = [];

            for (let page = 1; page <= maxPages; page += 1) {
                const response = await apiClient.getPlotsList({
                    page,
                    // eslint-disable-next-line camelcase
                    page_size: pageSize
                });
                const { list, total } = getPlotListPageInfo(response);

                plots.push(...list);

                if (!list.length) {
                    break;
                }

                if (total !== null && plots.length >= total) {
                    break;
                }

                if (total === null && list.length < pageSize) {
                    break;
                }
            }

            return plots;
        },

        refreshCityPlotStats() {
            const features = this.guangxiMapData?.features || [];

            if (!features.length || !this.allPlots.length) {
                this.cityPlotStats = {};
                return;
            }

            const { regionStats } = aggregatePlotsByFeatures(this.allPlots, features);
            this.cityPlotStats = regionStats;
        },

        refreshCurrentDistrictPlotStats() {
            const features = this.cityMapData?.features || [];

            if (!features.length || !this.allPlots.length) {
                this.currentDistrictPlotStats = {};
                return;
            }

            const { regionStats } = aggregatePlotsByFeatures(this.allPlots, features);
            this.currentDistrictPlotStats = regionStats;
        },

        // 懒加载地市区县地图数据
        async loadCityMapData(adcode) {
            const normalizedAdcode = String(adcode);
            if (String(this.currentCityAdcode || '') === normalizedAdcode && this.cityMapData?.features?.length) {
                this.refreshCurrentDistrictPlotStats();
                return;
            }

            try {
                const cityDataImport = await import(`@/assets/mapdata/guangxi-cities/${ normalizedAdcode }.json`);
                const cityData = cityDataImport.default || cityDataImport;

                if (!cityData || !cityData.features) {
                    throw new Error(`无法读取地市地图数据文件: ${ normalizedAdcode }`);
                }

                this.cityMapData = cityData;
                this.currentCityAdcode = normalizedAdcode;
                this.refreshCurrentDistrictPlotStats();
            }
            catch (error) {
                console.error('加载地市地图数据失败:', error);

                this.cityMapData = {
                    type: 'FeatureCollection',
                    features: []
                };
                this.currentDistrictPlotStats = {};
            }
        },

        // 处理区域点击事件
        handleRegionClick(region) {
            const regionName = region?.properties?.name;
            const regionAdcode = String(region?.properties?.adcode || '');
            const regionStats = this.currentDistrictPlotStats[regionAdcode]
                || this.currentDistrictPlotStats[regionName];

            if (!regionStats || regionStats.count <= 0) {
                return;
            }

            // 跳转到详情页面，显示该区县内真实地块
            this.$router.push({
                name: 'DetailMap',
                params: {
                    region: regionName
                },
                query: {
                    cityName: this.currentCityName,
                    cityAdcode: this.currentCityAdcode,
                    regionAdcode
                }
            });
        },

        // 处理广西地市点击事件
        handleCityClick(city) {
            const cityName = city?.properties?.name;
            const cityAdcode = city?.properties?.adcode;

            if (!cityName || !cityAdcode) {
                return;
            }

            this.openCityMap(cityName, cityAdcode);
            this.pushMapRoute(this.getCityMapRoute(cityName, cityAdcode));
        },

        // 从地市地图返回广西地图
        handleMapBack() {
            if (this.currentMapLevel === 'city') {
                this.pushMapRoute({ name: 'Dashboard' });
            }
        },

        // 处理首页地图底部面包屑
        handleMapBreadcrumbClick(item) {
            if (item.path === 'map:guangxi') {
                this.pushMapRoute({ name: 'Dashboard' });
            }
        },

        // 处理农事项目点击事件
        handleFarmingItemClick(farmingItem) {

            // 设置选中的农事项目
            this.selectedFarmingItem = farmingItem;

            // 更新农事项目的活跃状态
            this.farmingItems = this.farmingItems.map(item => ({
                ...item,
                isActive: item.id === farmingItem.id
            }));

            // 这里可以更新右侧面板显示选中农事项目的详细信息
        },

    }
};
</script>

<style lang="less" scoped>
@import "@/styles/abstracts/index.less";
</style>
