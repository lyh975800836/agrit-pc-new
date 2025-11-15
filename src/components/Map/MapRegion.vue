<template>
  <g class="map-region" :class="{ selected, hovered, 'has-projects': hasProjects }" @click="handleClick($event)" @mouseover="handleMouseOver" @mouseleave="handleMouseLeave">
    <!-- 将所有路径合并为一个path元素，防止内部分割线 -->
    <path
      :d="combinedPath"
      class="region-path"
      :fill="getFillColor"
      :stroke="getStrokeColor"
      :stroke-width="getStrokeWidth"
      fill-rule="evenodd"
      :filter="get3DFilter"
    />

    <!-- 区域标签 -->
    <text
      v-if="showLabel"
      :x="centroid.x"
      :y="centroid.y"
      class="region-label"
      text-anchor="middle"
      dominant-baseline="middle"
    >
      {{ region.properties.name }}
    </text>
  </g>
</template>

<script>
export default {
    name: 'MapRegion',
    props: {
        region: {
            type: Object,
            required: true
        },
        selected: {
            type: Boolean,
            default: false
        },
        showLabel: {
            type: Boolean,
            default: true
        },
        hasProjects: {
            type: Boolean,
            default: false
        },
        fillColor: {
            type: String,
            default: 'rgba(0, 184, 169, 0.8)'
        },
        strokeColor: {
            type: String,
            default: 'rgba(76, 253, 235, 0.8)'
        },
        selectedFillColor: {
            type: String,
            default: 'rgba(76, 253, 235, 0.9)'
        },
        selectedStrokeColor: {
            type: String,
            default: 'rgba(76, 253, 235, 1)'
        },
        strokeWidth: {
            type: Number,
            default: 3
        }
    },
    data() {
        return {
            hovered: false
        };
    },
    computed: {
    // 生成合并的SVG路径数据 - 防止内部分割线
        combinedPath() {
            let combinedPath = '';
            const { geometry } = this.region;

            if (geometry.type === 'Polygon') {
                combinedPath = this.polygonToPath(geometry.coordinates);
            }
            else if (geometry.type === 'MultiPolygon') {
                // 将所有多边形合并到一个路径字符串中，使用空格分隔
                const paths = [];
                geometry.coordinates.forEach(polygon => {
                    const path = this.polygonToPath(polygon);
                    paths.push(path);
                });
                combinedPath = paths.join(' ');
            }
            return combinedPath;
        },

        // 计算区域中心点
        centroid() {
            const center = this.region.properties.centroid || this.region.properties.center;
            if (center) {
                return {
                    x: this.longitudeToX(center[0]),
                    y: this.latitudeToY(center[1])
                };
            }

            // 如果没有中心点数据，计算几何中心
            return this.calculateCentroid();
        },

        // 填充颜色 - 清晰的区域色彩区分
        getFillColor() {
            if (this.selected) {
                return '#FF6B35'; // 选中状态：橙红色突出
            }
            if (this.hovered) {
                return '#4ECDC4'; // 悬停状态：浅青色
            }

            // 根据区域重要性和项目情况使用不同颜色
            const regionName = this.region.properties.name || '';

            if (regionName.includes('右江')) {
                return '#4ECDC4'; // 中心区域，亮青色
            } if (this.hasProjects) {
                return '#7FDBDA'; // 有项目的区域，中亮青色
            }
            return '#2C5F5A'; // 其他区域，深青色

        },

        // 滤镜效果 - 轻微效果保持清晰度
        get3DFilter() {
            if (this.selected) {
                return 'url(#shadow-3d)'; // 选中状态：轻微阴影
            }
            if (this.hovered) {
                return 'url(#shadow-3d)'; // 悬停状态：轻微阴影
            }
            return 'none'; // 默认状态：无滤镜，保持清晰
        },

        // 边框颜色 - 浅青色边界线，匹配参考图
        getStrokeColor() {
            if (this.selected) {
                return '#FFD700'; // 选中：金黄色边框
            }
            if (this.hovered) {
                return '#7FDBDA'; // 悬停：亮青色边框
            }

            // 统一的浅青色边界线，形成清晰的区域分割
            return '#7FDBDA'; // 浅青色，与参考图的边界色调一致
        },

        // 边框宽度 - 细边框线，突出层次感
        getStrokeWidth() {
            if (this.selected) {
                return 3;
            }
            if (this.hovered) {
                return 2.5;
            }
            return 1.5; // 细边框线，形成清晰但不突兀的区域分割
        }
    },
    methods: {
    // 多边形坐标转SVG路径
        polygonToPath(coordinates) {
            const outerRing = coordinates[0];
            let path = '';

            outerRing.forEach((coord, index) => {
                const x = this.longitudeToX(coord[0]);
                const y = this.latitudeToY(coord[1]);

                if (index === 0) {
                    path += `M ${ x } ${ y }`;
                }
                else {
                    path += ` L ${ x } ${ y }`;
                }
            });

            path += ' Z';

            // 处理内部孔洞
            if (coordinates.length > 1) {
                for (let i = 1; i < coordinates.length; i++) {
                    const innerRing = coordinates[i];
                    innerRing.forEach((coord, index) => {
                        const x = this.longitudeToX(coord[0]);
                        const y = this.latitudeToY(coord[1]);

                        if (index === 0) {
                            path += ` M ${ x } ${ y }`;
                        }
                        else {
                            path += ` L ${ x } ${ y }`;
                        }
                    });
                    path += ' Z';
                }
            }

            return path;
        },

        // 经度转X坐标 - 适配原UI地图尺寸，添加边界检查
        longitudeToX(lng) {
            if (typeof lng !== 'number' || isNaN(lng)) {
                return 0;
            }

            const minLng = 104.4;
            const maxLng = 107.6;
            const ratio = Math.max(0, Math.min(1, (lng - minLng) / (maxLng - minLng)));
            const x = ratio * 1828;

            return isNaN(x) ? 0 : x;
        },

        // 纬度转Y坐标 - 适配原UI地图尺寸，添加边界检查
        latitudeToY(lat) {
            if (typeof lat !== 'number' || isNaN(lat)) {
                return 0;
            }

            const minLat = 22.9;
            const maxLat = 25.3;
            const ratio = Math.max(0, Math.min(1, (lat - minLat) / (maxLat - minLat)));
            const y = 1098 - (ratio * 1098);

            return isNaN(y) ? 0 : y;
        },

        // 计算几何中心点，添加错误处理
        calculateCentroid() {
            const geometry = this.region?.geometry;
            if (!geometry || !geometry.coordinates) {
                return { x: 914, y: 549 }; // 返回地图中心点作为fallback
            }

            let allCoords = [];

            try {
                if (geometry.type === 'Polygon') {
                    allCoords = geometry.coordinates[0] || [];
                }
                else if (geometry.type === 'MultiPolygon') {
                    allCoords = geometry.coordinates[0]?.[0] || [];
                }

                if (allCoords.length === 0) {
                    return { x: 914, y: 549 };
                }

                let sumX = 0; let sumY = 0;
                let validCount = 0;

                allCoords.forEach(coord => {
                    if (Array.isArray(coord) && coord.length >= 2) {
                        const x = this.longitudeToX(coord[0]);
                        const y = this.latitudeToY(coord[1]);
                        if (!isNaN(x) && !isNaN(y)) {
                            sumX += x;
                            sumY += y;
                            validCount++;
                        }
                    }
                });

                if (validCount === 0) {
                    return { x: 914, y: 549 };
                }

                return {
                    x: sumX / validCount,
                    y: sumY / validCount
                };
            }
            catch (error) {
                return { x: 914, y: 549 };
            }
        },

        // 处理点击事件
        handleClick(event) {
            // 阻止事件冒泡，确保我们获得准确的点击位置
            event.stopPropagation();
            this.$emit('click', this.region, event);
        },

        // 处理鼠标悬停
        handleMouseOver() {
            this.hovered = true;
            this.$emit('hover', this.region, true);
        },

        // 处理鼠标离开
        handleMouseLeave() {
            this.hovered = false;
            this.$emit('hover', this.region, false);
        }
    }
};
</script>

<style lang="less" scoped>
// 响应式字体调整
@media (max-width: 1200px) {
    .map-region .region-label {
        font-size: 12px;
    }
}
@media (max-width: 768px) {
    .map-region .region-label {
        font-size: 10px;
    }
}

.map-region {
    transition: all .3s ease;
    cursor: pointer;

    .region-path {
        transition: all .3s ease;

        fill-opacity: .9; // 轻微透明，增加层次感
        shape-rendering: geometricPrecision;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-opacity: 1;
        vector-effect: non-scaling-stroke;
    }

    .region-label {
        font-family: "微软雅黑", "Microsoft YaHei", Arial, sans-serif;
        font-size: 14px;
        font-weight: 600;

        text-shadow: 1px 1px 2px #000c,
            0 0 4px #0009; // 深色阴影增强对比度
        pointer-events: none;

        fill: #fff; // 白色标签，在深色背景上清晰可见
    }

    // 选中状态 - 突出显示
    &.selected .region-path {
        fill-opacity: 1;
        stroke-width: 3 !important;
    }

    // 悬停状态 - 高亮效果
    &.hovered .region-path {
        fill-opacity: 1;
        stroke-width: 2.5 !important;
    }
}
</style>
