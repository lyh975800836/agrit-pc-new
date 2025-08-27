<template>
  <div class="map-view">
    <div class="map-container" ref="mapContainer">
      <svg
        class="map-svg"
        :viewBox="viewBox"
        :width="mapWidth"
        :height="mapHeight"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- 添加定义区域用于基础效果 -->
        <defs>
          <!-- 轻微阴影滤镜 -->
          <filter id="shadow-3d" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
            <feOffset in="blur" dx="1" dy="2" result="offsetBlur"/>
            <feFlood flood-color="#000000" flood-opacity="0.3"/>
            <feComposite in2="offsetBlur" operator="in" result="shadow"/>
            <feMerge>
              <feMergeNode in="shadow"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <!-- 渲染地图区域 - 清晰的地图轮廓显示 -->
        <g class="regions-group">
          <MapRegion
            v-for="region in regions"
            :key="region.properties.adcode || region.properties.name"
            :region="region"
            :selected="selectedRegion === region.properties.adcode"
            :has-projects="hasProjects(region)"
            :show-label="false"
            @click="handleRegionClick"
            @hover="handleRegionHover"
          />
        </g>

        <!-- 区县内部分割线已移除，只显示区县之间的边界 -->

        <!-- 渲染标注点 -->
        <MapMarker
          v-for="marker in markers"
          :key="marker.id"
          :marker="marker"
          :show-pulse="marker.highlight"
          @click="handleMarkerClick"
        />

        <!-- 渲染文字标签 -->
        <MapLabel
          v-for="label in labels"
          :key="label.id"
          :label="label"
        />
      </svg>
    </div>

    <!-- 交互弹窗 -->
    <MapPopup
      :visible="showPopup"
      :region="selectedRegionData"
      :position="popupPosition"
      :has-projects="selectedRegionHasProjects"
      @close="closePopup"
    />
  </div>
</template>

<script>
import MapRegion from './MapRegion.vue';
import MapMarker from './MapMarker.vue';
import MapLabel from './MapLabel.vue';
import MapPopup from './MapPopup.vue';

export default {
    name: 'MapView',
    components: {
        MapRegion,
        MapMarker,
        MapLabel,
        MapPopup
    },
    props: {
    // 地图数据
        mapData: {
            type: Object,
            default: () => ({ features: [] })
        },
        // 地图宽度
        mapWidth: {
            type: Number,
            default: 2400
        },
        // 地图高度
        mapHeight: {
            type: Number,
            default: 1440
        },
        // 标注点数据
        markers: {
            type: Array,
            default: () => []
        },
        // 文字标签数据
        labels: {
            type: Array,
            default: () => []
        },
        // 选中的区域
        selectedRegion: {
            type: [String, Number],
            default: null
        },
        // 有项目的区县列表
        projectRegions: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            viewBox: '98 76 2217 1327', // 使用计算出的动态ViewBox确保完整显示
            hoveredRegion: null,
            showPopup: false,
            selectedRegionData: null,
            popupPosition: { x: 0, y: 0 },
            selectedRegionHasProjects: false,
            // 缩放和平移相关状态
            scale: 1,
            minScale: 0.5,
            maxScale: 3,
            translateX: 0,
            translateY: 0,
            isDragging: false,
            lastMousePosition: { x: 0, y: 0 }
        };
    },
    computed: {
    // 地图区域数据
        regions() {
            if (!this.mapData || !this.mapData.features) {
                return [];
            }
            return this.mapData.features;
        },

        // 计算地图边界
        mapBounds() {
            if (!this.regions.length) {
                return { minX: 0, minY: 0, maxX: 1828, maxY: 1098 };
            }

            let minX = Infinity; let minY = Infinity; let maxX = -Infinity; let maxY = -Infinity;

            this.regions.forEach(region => {
                const coords = this.getRegionCoordinates(region);
                coords.forEach(coord => {
                    minX = Math.min(minX, coord[0]);
                    maxX = Math.max(maxX, coord[0]);
                    minY = Math.min(minY, coord[1]);
                    maxY = Math.max(maxY, coord[1]);
                });
            });

            return { minX, minY, maxX, maxY };
        }
    },
    mounted() {
        this.calculateViewBox();
        this.initMapInteractions();
    },
    beforeDestroy() {
        this.removeMapInteractions();
    },
    methods: {
    // 计算ViewBox - 减少padding让地图更大
        calculateViewBox() {
            const bounds = this.mapBounds;
            const padding = 10; // 减少padding让地图占据更多空间

            const viewBoxMinX = bounds.minX - padding;
            const viewBoxMinY = bounds.minY - padding;
            const viewBoxWidth = bounds.maxX - bounds.minX + padding * 2;
            const viewBoxHeight = bounds.maxY - bounds.minY + padding * 2;

            this.viewBox = `${ viewBoxMinX } ${ viewBoxMinY } ${ viewBoxWidth } ${ viewBoxHeight }`;
        },

        // 获取区域坐标点
        getRegionCoordinates(region) {
            const coordinates = [];
            const { geometry } = region;

            if (geometry.type === 'Polygon') {
                geometry.coordinates[0].forEach(coord => {
                    // 转换坐标系：经纬度转换为像素坐标
                    const x = this.longitudeToX(coord[0]);
                    const y = this.latitudeToY(coord[1]);
                    coordinates.push([x, y]);
                });
            }
            else if (geometry.type === 'MultiPolygon') {
                geometry.coordinates.forEach(polygon => {
                    polygon[0].forEach(coord => {
                        const x = this.longitudeToX(coord[0]);
                        const y = this.latitudeToY(coord[1]);
                        coordinates.push([x, y]);
                    });
                });
            }

            return coordinates;
        },

        // 经度转X坐标
        longitudeToX(lng) {
            // 扩展范围确保平果市完整显示 - 平果市最大经度107.88
            const minLng = 104.28; // 比最小值小一点，留边距
            const maxLng = 108.05; // 比最大值大一点，留边距
            const ratio = (lng - minLng) / (maxLng - minLng);
            return ratio * this.mapWidth;
        },

        // 纬度转Y坐标
        latitudeToY(lat) {
            // 扩展纬度范围，Y轴需要反转
            const minLat = 22.74; // 比最小值小一点，留边距
            const maxLat = 25.25; // 比最大值大一点，留边距
            const ratio = (lat - minLat) / (maxLat - minLat);
            return this.mapHeight - (ratio * this.mapHeight); // Y轴反转
        },

        // 处理区域点击 - 修复弹窗定位问题
        handleRegionClick(region, event) {

            this.selectedRegionData = region;
            this.selectedRegionHasProjects = this.hasProjects(region);

            // 使用clientX和clientY获取相对于浏览器视口的位置
            const popupX = event.clientX + 10; // 稍微右偏移避免遮挡鼠标
            const popupY = event.clientY - 50; // 向上偏移避免遮挡点击位置


            this.popupPosition = {
                x: popupX,
                y: popupY
            };


            this.showPopup = true;

            // 延迟检查弹窗实际位置
            this.$nextTick(() => {
                const popupElement = document.querySelector('.group_10');
                if (popupElement) {
                    // 手动将弹窗移动到body下避免变换影响
                    if (popupElement.parentNode !== document.body) {
                        document.body.appendChild(popupElement);
                    }
                }
            });

            this.$emit('region-click', region);
        },

        // 处理区域悬停
        handleRegionHover(region, isHovered) {
            this.hoveredRegion = isHovered ? region.properties.adcode : null;
            this.$emit('region-hover', region, isHovered);
        },

        // 处理标注点点击
        handleMarkerClick(marker) {
            this.$emit('marker-click', marker);
        },

        // 判断区域是否有项目
        hasProjects(region) {
            const regionName = region.properties.name;
            return this.projectRegions.includes(regionName);
        },

        // 关闭弹窗
        closePopup() {
            this.showPopup = false;
            this.selectedRegionData = null;
            this.selectedRegionHasProjects = false;
        },

        // 区县内部分割线相关函数已移除，只保留区县边界

        // 初始化地图交互功能
        initMapInteractions() {
            const container = this.$refs.mapContainer;
            if (!container) {
                return;
            }

            // 绑定滚轮缩放事件
            container.addEventListener('wheel', this.handleWheel, { passive: false });

            // 绑定鼠标拖拽事件
            container.addEventListener('mousedown', this.handleMouseDown);
            container.addEventListener('mousemove', this.handleMouseMove);
            container.addEventListener('mouseup', this.handleMouseUp);
            container.addEventListener('mouseleave', this.handleMouseUp);

            // 防止右键菜单
            container.addEventListener('contextmenu', e => e.preventDefault());
        },

        // 移除地图交互事件监听器
        removeMapInteractions() {
            const container = this.$refs.mapContainer;
            if (!container) {
                return;
            }

            container.removeEventListener('wheel', this.handleWheel);
            container.removeEventListener('mousedown', this.handleMouseDown);
            container.removeEventListener('mousemove', this.handleMouseMove);
            container.removeEventListener('mouseup', this.handleMouseUp);
            container.removeEventListener('mouseleave', this.handleMouseUp);
            container.removeEventListener('contextmenu', e => e.preventDefault());
        },

        // 处理滚轮缩放
        handleWheel(event) {
            event.preventDefault();

            const container = this.$refs.mapContainer;
            const rect = container.getBoundingClientRect();

            // 计算鼠标在容器内的相对位置
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            // 计算缩放中心点（相对于容器中心的偏移）
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const offsetX = mouseX - centerX;
            const offsetY = mouseY - centerY;

            // 计算缩放变化
            const delta = event.deltaY > 0 ? -0.1 : 0.1;
            const newScale = Math.max(this.minScale, Math.min(this.maxScale, this.scale + delta));

            if (newScale !== this.scale) {
                // 计算缩放后需要调整的位移，使缩放中心保持在鼠标位置
                const scaleDelta = newScale - this.scale;
                this.translateX -= offsetX * scaleDelta;
                this.translateY -= offsetY * scaleDelta;

                this.scale = newScale;
                this.updateMapTransform();
            }
        },

        // 处理鼠标按下
        handleMouseDown(event) {
            // 只处理左键
            if (event.button !== 0) {
                return;
            }

            this.isDragging = true;
            this.lastMousePosition = {
                x: event.clientX,
                y: event.clientY
            };

            // 改变光标样式
            this.$refs.mapContainer.style.cursor = 'grabbing';

            event.preventDefault();
        },

        // 处理鼠标移动
        handleMouseMove(event) {
            if (!this.isDragging) {
                return;
            }

            const deltaX = event.clientX - this.lastMousePosition.x;
            const deltaY = event.clientY - this.lastMousePosition.y;

            this.translateX += deltaX;
            this.translateY += deltaY;

            this.lastMousePosition = {
                x: event.clientX,
                y: event.clientY
            };

            this.updateMapTransform();
        },

        // 处理鼠标释放
        handleMouseUp() {
            if (this.isDragging) {
                this.isDragging = false;
                this.$refs.mapContainer.style.cursor = 'grab';
            }
        },

        // 更新地图变换
        updateMapTransform() {
            const svg = this.$el.querySelector('.map-svg');
            if (svg) {
                const transform = `translate(${ this.translateX }px, ${ this.translateY }px) scale(${ this.scale })`;
                svg.style.transform = transform;
                svg.style.transformOrigin = 'center center';
            }
        },

        // 重置地图缩放和位置
        resetMapView() {
            this.scale = 1;
            this.translateX = 0;
            this.translateY = 0;
            this.updateMapTransform();
        }
    }
};
</script>

<style lang="less" scoped>
// 响应式适配
@media (max-width: 768px) {
    .map-view {
        padding: 10px;
    }
}

.map-view {
    position: relative;
    display: flex;
    overflow: visible;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    // 透明背景，不显示白色背景
    background: transparent;
}

.map-container {
    position: relative;
    display: flex;
    overflow: hidden;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 100%;
    height: 100%;
    max-height: 100%;

    cursor: grab;
    user-select: none;

    &:active {
        cursor: grabbing;
    }

    &.dragging {
        cursor: grabbing !important;
    }
}

.map-svg {
    display: block;
    width: 100%;
    min-width: 600px;  // 确保最小尺寸
    height: 100%;
    min-height: 700px;
    margin: 0 auto;  // 居中显示

    background: transparent;
    transition: transform .1s ease-out;

    // 支持变换
    transform-origin: center center;
    // 轻微的阴影效果，保持清晰度
    filter: drop-shadow(0 2px 8px #2c5f5a26);

    // 确保在缩放时保持清晰度
    shape-rendering: geometricPrecision;
    text-rendering: geometricPrecision;
}

// 边界线样式已移除，只使用区域组件的边框

// 区域组样式 - 主要地图显示层
.regions-group {
    z-index: 1;
}
</style>
