<template>
  <div class="guangxi-map-container">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="loading-text">{{ loadingText }}</div>
      </div>
    </div>

    <div id="guangxi-leaflet-map" class="leaflet-map" :class="{ 'map-hidden': isLoading }"></div>
  </div>
</template>

<script>
import { GUANGXI_MAP_CONFIG, LOADING_CONFIG } from '@/config/mapConfig';

export default {
    name: 'MapViewGuangxi',
    props: {
        mapData: {
            type: Object,
            default: () => ({ features: [] })
        },
        selectedCity: {
            type: [String, Number],
            default: null
        },
        projectCities: {
            type: Array,
            default: () => ['百色市']
        },
        cityStats: {
            type: Object,
            default: () => ({})
        },
        plotLoading: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            map: null,
            isLoading: true,
            loadingText: LOADING_CONFIG.text.init,
            cityLayers: [],
            labelLayers: []
        };
    },
    computed: {
        cities() {
            return this.mapData?.features || [];
        }
    },
    mounted() {
        this.$nextTick(() => {
            if (window.L) {
                this.initMap();
            } else {
                console.error('Leaflet未加载，请确认CDN引入是否正确');
                this.loadingText = 'Leaflet地图库加载失败';
                this.isLoading = false;
            }
        });
    },
    beforeDestroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
    },
    watch: {
        mapData: {
            handler() {
                if (this.map && this.cities.length > 0) {
                    this.loadMapData();
                }
            },
            deep: true
        },
        selectedCity() {
            this.updateSelectedCity();
        },
        cityStats: {
            handler() {
                if (this.map && this.cities.length > 0) {
                    this.loadMapData();
                }
            },
            deep: true
        }
    },
    methods: {
        initMap() {
            try {
                const L = window.L;
                this.loadingText = LOADING_CONFIG.text.loading;

                this.map = L.map('guangxi-leaflet-map', {
                    center: GUANGXI_MAP_CONFIG.center,
                    zoom: GUANGXI_MAP_CONFIG.zoom,
                    minZoom: GUANGXI_MAP_CONFIG.minZoom,
                    maxZoom: GUANGXI_MAP_CONFIG.maxZoom,
                    zoomControl: GUANGXI_MAP_CONFIG.zoomControl,
                    scrollWheelZoom: GUANGXI_MAP_CONFIG.scrollWheelZoom,
                    doubleClickZoom: GUANGXI_MAP_CONFIG.doubleClickZoom,
                    dragging: GUANGXI_MAP_CONFIG.dragging,
                    attributionControl: GUANGXI_MAP_CONFIG.attributionControl,
                    preferCanvas: GUANGXI_MAP_CONFIG.preferCanvas,
                    zoomSnap: GUANGXI_MAP_CONFIG.zoomSnap,
                    wheelPxPerZoomLevel: GUANGXI_MAP_CONFIG.wheelPxPerZoomLevel,
                    layers: []
                });

                this.map.zoomControl.setPosition('bottomright');
                this.addBaseLayer();

                this.loadingText = '准备加载广西地图...';
                if (this.cities.length > 0) {
                    this.loadMapData();
                }
            } catch (error) {
                console.error('初始化广西地图失败:', error);
                this.loadingText = '地图初始化失败';
                this.isLoading = false;
            }
        },

        addBaseLayer() {
            const L = window.L;
            const cartoLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 20,
                subdomains: 'abcd',
                attribution: '© CartoDB, © OpenStreetMap'
            });

            cartoLayer.addTo(this.map);
        },

        async loadMapData() {
            try {
                if (!this.cities.length) {
                    console.warn('没有广西地图数据');
                    this.loadingText = '没有地图数据';
                    this.isLoading = false;
                    return;
                }

                this.loadingText = `加载${ this.cities.length }个地市数据...`;
                this.clearLayers();

                await this.addCityLayers();
                await this.addCityLabels();
                this.fitMapToGuangxi();

                this.loadingText = '地图加载完成';
                this.isLoading = false;
            } catch (error) {
                console.error('加载广西地图失败:', error);
                this.loadingText = '数据加载失败';
                this.isLoading = false;
            }
        },

        async addCityLayers() {
            const L = window.L;
            this.loadingText = '绘制地市边界...';

            for (let i = 0; i < this.cities.length; i += 1) {
                const city = this.cities[i];
                const hasProjects = this.hasProjects(city);
                const isSelected = this.selectedCity === city.properties.adcode
                    || this.selectedCity === city.properties.name;

                try {
                    const layer = L.geoJSON(city, {
                        style: this.getCityStyle(hasProjects, isSelected),
                        onEachFeature: (feature, featureLayer) => {
                            featureLayer.bindTooltip(feature.properties.name, {
                                permanent: false,
                                direction: 'center',
                                className: 'guangxi-city-tooltip'
                            });

                            featureLayer.on({
                                click: e => this.handleCityClick(feature, e),
                                mouseover: e => {
                                    e.target.setStyle({
                                        weight: hasProjects ? 4 : 2,
                                        fillOpacity: hasProjects ? 0.78 : 0.32
                                    });
                                    this.setLayerCursor(e.target, true);
                                },
                                mouseout: e => {
                                    e.target.setStyle(this.getCityStyle(hasProjects, isSelected));
                                }
                            });
                        }
                    });

                    layer.feature = city;
                    layer.addTo(this.map);
                    this.cityLayers.push(layer);
                    this.loadingText = `绘制地市边界... ${ i + 1 }/${ this.cities.length }`;
                } catch (error) {
                    console.error('添加地市图层失败:', city.properties?.name, error);
                }
            }
        },

        async addCityLabels() {
            const L = window.L;

            this.cities.forEach(city => {
                try {
                    const hasProjects = this.hasProjects(city);
                    const plotCount = this.getCityPlotCount(city);
                    const labelPoint = city.properties.centroid || city.properties.center;
                    if (!labelPoint || labelPoint.length < 2) {
                        return;
                    }

                    const labelIcon = L.divIcon({
                        className: 'guangxi-city-label',
                        html: `<div class="guangxi-city-label-content ${ hasProjects ? 'has-projects' : 'no-projects' }">
                            <span>${ city.properties.name }</span>
                            ${ plotCount > 0 ? `<strong>${ plotCount }</strong>` : '' }
                        </div>`,
                        iconSize: [112, 28],
                        iconAnchor: [56, 14]
                    });

                    const labelMarker = L.marker([labelPoint[1], labelPoint[0]], {
                        icon: labelIcon,
                        interactive: false,
                        zIndexOffset: 1800
                    });

                    labelMarker.addTo(this.map);
                    this.labelLayers.push(labelMarker);
                } catch (error) {
                    console.error('添加地市标签失败:', city.properties?.name, error);
                }
            });
        },

        getCityStyle(hasProjects, isSelected) {
            if (isSelected) {
                return {
                    fillColor: '#1B4B47',
                    weight: 3,
                    opacity: 1,
                    color: '#FFD700',
                    fillOpacity: 0.75,
                    dashArray: null
                };
            }

            if (hasProjects) {
                return {
                    fillColor: '#1B4B47',
                    weight: 2.5,
                    opacity: 1,
                    color: '#c69c6d',
                    fillOpacity: 0.68,
                    dashArray: null
                };
            }

            return {
                fillColor: '#2C5F5A',
                weight: 1.5,
                opacity: 0.75,
                color: '#c69c6d',
                fillOpacity: 0.18,
                dashArray: '5,5'
            };
        },

        fitMapToGuangxi() {
            const L = window.L;

            try {
                if (this.cityLayers.length > 0) {
                    const group = new L.featureGroup(this.cityLayers);
                    this.map.fitBounds(group.getBounds(), {
                        padding: GUANGXI_MAP_CONFIG.fitPadding,
                        maxZoom: GUANGXI_MAP_CONFIG.fitZoom
                    });
                    return;
                }

                this.map.setView(GUANGXI_MAP_CONFIG.center, GUANGXI_MAP_CONFIG.zoom);
            } catch (error) {
                console.error('调整广西地图视图失败:', error);
                this.map.setView(GUANGXI_MAP_CONFIG.center, GUANGXI_MAP_CONFIG.zoom);
            }
        },

        clearLayers() {
            [...this.cityLayers, ...this.labelLayers].forEach(layer => {
                try {
                    this.map.removeLayer(layer);
                } catch (error) {
                    console.warn('移除广西地图图层失败:', error);
                }
            });

            this.cityLayers = [];
            this.labelLayers = [];
        },

        updateSelectedCity() {
            if (!this.map || !this.cityLayers.length) {
                return;
            }

            this.cityLayers.forEach(layer => {
                const { feature } = layer;
                if (!feature) {
                    return;
                }
                const hasProjects = this.hasProjects(feature);
                const isSelected = this.selectedCity === feature.properties.adcode
                    || this.selectedCity === feature.properties.name;
                layer.setStyle(this.getCityStyle(hasProjects, isSelected));
            });
        },

        handleCityClick(city, event) {
            this.$emit('city-click', city, event?.originalEvent || null);
        },

        getCityPlotCount(city) {
            const properties = city?.properties || {};
            const adcode = String(properties.adcode || '');
            const stats = this.cityStats[adcode] || this.cityStats[properties.name];
            return Number(stats?.count || 0);
        },

        hasProjects(city) {
            return this.getCityPlotCount(city) > 0 || this.projectCities.includes(city.properties.name);
        },

        setLayerCursor(layer, enabled) {
            const element = layer.getElement?.();
            if (element) {
                element.style.cursor = enabled ? 'pointer' : 'default';
            }
        }
    }
};
</script>

<style scoped>
.guangxi-map-container {
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    background: #0a1420;
}

.leaflet-map {
    z-index: 1;
    width: 100%;
    height: 100%;
}

.loading-overlay {
    position: absolute;
    z-index: 2000;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: #0a1420e6;
    backdrop-filter: blur(5px);
}

.loading-spinner {
    text-align: center;
    color: #c69c6d;
}

.spinner {
    width: 50px;
    height: 50px;
    margin: 0 auto 20px;
    border: 4px solid #4cfdeb4d;
    border-left: 4px solid #c69c6d;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.loading-text {
    margin-top: 10px;
    font-size: 16px;
    font-weight: bold;
}

.map-hidden {
    opacity: .3;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>

<style lang="less">
.guangxi-city-label {
    border: none !important;
    background: transparent !important;
}

.guangxi-city-label-content {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 112px;
    height: 24px;
    font-size: 13px;
    font-weight: 600;
    line-height: 24px;
    text-align: center;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.85);
    pointer-events: none;
    gap: 4px;

    &.has-projects {
        color: #f4d197;
    }

    &.no-projects {
        color: rgba(183, 254, 247, 0.62);
    }

    strong {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        border-radius: 8px;
        font-size: 10px;
        line-height: 16px;
        color: #09201d;
        background: #f4d197;
        text-shadow: none;
    }
}

.guangxi-city-tooltip {
    border: 1px solid rgba(198, 156, 109, 0.45);
    color: #f4d197;
    background: rgba(0, 40, 42, 0.92);
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.32);
}
</style>
