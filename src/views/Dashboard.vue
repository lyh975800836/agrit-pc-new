<template>
  <DashboardLayout
    :weather="weather"
    :user="user"
    :project-data="projectData"
    :statistics-data="statisticsData"
    :ranking-data="rankingData"
    :quality-data="qualityData"
    :region-name="'百色市'"
    :show-back-button="false"
    :page-title="'数据驾驶舱'"
  >
    <template #center-map>
      <!-- 使用Leaflet地图 - 解决SVG边界显示问题 -->
      <MapViewBaise
        :map-data="mapData"
        :markers="mapMarkers"
        :labels="mapLabels"
        :selected-region="selectedRegion"
        :project-regions="projectRegions"
        @region-click="handleRegionClick"
        @region-hover="handleRegionHover"
        @marker-click="handleMarkerClick"
      />
    </template>
  </DashboardLayout>
</template>

<script>
import MapViewBaise from '@/components/MapViewBaise.vue';
import DashboardLayout from '@/components/DashboardLayout.vue';

export default {
    name: 'Dashboard',
    components: {
        MapViewBaise,
        DashboardLayout
    },
    data() {
        return {
            // 天气数据
            weather: {
                temperature: '26.8°C',
                description: '晴多云转阵雨'
            },
            // 用户数据
            user: {
                name: '管理员',
                avatar: '/images/user-avatar.png'
            },
            // 项目数据
            projectData: {
                blockCount: 5,
                blockDetails: '右江区泮水乡那眉村集体八角基地\n右江区大楞乡那花科华昌八角基地\n千户十亩-右江区大楞乡巴平村八角基地\n千户十亩-右江区汪甸乡伟阳村八角基地\n千户十亩-田林县那色村巴塘八角基地',
                totalArea: 810,
                areaDetails: '右江区泮水乡那眉村：400亩\n右江区大楞乡那花科华昌：300亩\n千户十亩-右江区大楞乡巴平村：30亩\n千户十亩-右江区汪甸乡伟阳村：50亩\n千户十亩-田林县那色村巴塘：30亩',
                price: '3.08元'
            },
            // 统计数据
            statisticsData: {
                totalArea: 139
            },
            // 排名数据
            rankingData: [
                {
                    manager: '隆起雷',
                    location: '千户十亩-大楞乡巴平村',
                    area: 30,
                    district: '右江区',
                    yield: 1970
                },
                {
                    manager: '李子顺',
                    location: '千户十亩-大楞乡巴平村',
                    area: 30,
                    district: '右江区',
                    yield: 1970
                },
                {
                    manager: '李子顺',
                    location: '千户十亩-大楞乡巴平村',
                    area: 30,
                    district: '右江区',
                    yield: 1970
                }
            ],
            // 质量数据
            qualityData: {
                good: '20%',
                average: '30%',
                poor: '50%'
            },

            // 地图相关数据
            mapData: null,
            selectedRegion: null,
            mapMarkers: [],
            mapLabels: [],

            // 有项目的区县列表（基于百色市实际区县）
            projectRegions: ['右江区', '田阳区', '田东县', '德保县', '那坡县', '凌云县', '乐业县', '田林县']
        };
    },
    async mounted() {
    // 加载地图数据
        await this.loadMapData();
    },
    methods: {
    // 加载地图数据 - 使用最新的高精度区县GeoJSON文件
        async loadMapData() {
            try {
                // 加载最新的百色市区县GeoJSON文件
                const baiseDataImport = await import('@/assets/mapdata/baise-districts-final.json');
                const baiseData = baiseDataImport.default || baiseDataImport;

                if (!baiseData || !baiseData.features) {
                    throw new Error('无法读取百色市地图数据文件');
                }

                console.log(`加载百色市地图数据成功，包含 ${ baiseData.features.length } 个区县`);
                console.log('数据来源:', baiseData.properties?.source);

                // 直接使用高精度区县数据
                this.mapData = baiseData;

            }
            catch (error) {
                console.error('加载地图数据失败:', error);

                // 创建一个空的地图数据作为fallback
                this.mapData = {
                    type: 'FeatureCollection',
                    features: []
                };
            }
        },

        // 计算几何图形的中心点
        calculateCenter(coordinates) {
            let totalX = 0; let totalY = 0; let pointCount = 0;

            const processCoordinates = coords => {
                if (Array.isArray(coords[0][0])) {
                    // MultiPolygon 或 Polygon with holes
                    coords.forEach(ring => {
                        if (Array.isArray(ring[0][0])) {
                            ring.forEach(processCoordinates);
                        }
                        else {
                            ring.forEach(point => {
                                totalX += point[0];
                                totalY += point[1];
                                pointCount++;
                            });
                        }
                    });
                }
                else {
                    // Simple coordinate array
                    coords.forEach(point => {
                        totalX += point[0];
                        totalY += point[1];
                        pointCount++;
                    });
                }
            };

            processCoordinates(coordinates);

            return pointCount > 0 ? [totalX / pointCount, totalY / pointCount] : [106.6, 23.9];
        },

        // 处理区域点击事件
        handleRegionClick(region) {
            const regionName = region.properties.name;
            console.log('点击区县:', regionName);

            // 跳转到详情页面，显示该区县的乡镇级地图
            this.$router.push({
                name: 'DetailMap',
                params: {
                    region: regionName
                }
            });
        },

        // 处理区域悬停事件
        handleRegionHover() {
            // 这里可以添加悬停效果
        },

        // 处理标注点点击事件
        handleMarkerClick() {
            // 这里可以添加标注点点击后的逻辑
            this.selectedRegion = null;
        },

    }
};
</script>

<style lang="less" scoped>
@import "@/styles/abstracts/index.less";
</style>
