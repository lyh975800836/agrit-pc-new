<template>
    <div>
        <!-- 地块标记点 - 仅在"那色"地块显示 (复刻二级页面样式) -->
        <div
            v-for="(marker, index) in mockMarkers"
            :key="`marker-${index}`"
            :style="{
                position: 'absolute',
                left: marker.left + 'px',
                top: marker.top + 'px',
                zIndex: 5
            }"
        >
            <div class="plot-marker-wrapper">
                <div
                    class="plot-marker-icon"
                    :class="marker.iconClass"
                />
                <div class="plot-marker-label">{{ marker.name }}</div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'MockMarkers',
    props: {
        plotData: {
            type: Object,
            default: () => ({})
        },
        tileSize: {
            type: Number,
            default: 120
        }
    },
    data() {
        return {
            mockMarkers: []
        };
    },
    watch: {
        plotData: {
            handler() {
                this.generateMockMarkers();
            },
            deep: true
        },
        tileSize() {
            this.generateMockMarkers();
        }
    },
    mounted() {
        this.generateMockMarkers();
    },
    methods: {
        // 生成 mock 标记点 - 仅对"那色"地块
        generateMockMarkers() {
            const plotName = this.plotData?.name || '';

            if (plotName !== '那色') {
                this.mockMarkers = [];
                return;
            }

            // 随机生成标记坐标 - 全屏幕不规则分散
            const iconClasses = ['icon-filter1', 'icon-filter3', 'icon-filter5', 'icon-filter7', 'icon-filter9'];
            const names = [
                '八角基地', '烘干工厂', '晒场', '仓库', '加工厂',
                '田间1', '田间2', '田间3', '田间4', '田间5',
                '设施1', '设施2', '设施3', '设施4', '设施5',
                '堆放1', '堆放2', '堆放3', '堆放4', '堆放5',
                '处理1', '处理2', '处理3', '处理4', '处理5',
                '仓库1', '仓库2', '仓库3', '仓库4', '仓库5',
                '八角1', '八角2', '八角3', '八角4', '八角5',
                '晒场1', '晒场2', '晒场3', '晒场4', '晒场5',
                '烘干1', '烘干2', '烘干3', '烘干4', '烘干5',
                '加工1', '加工2', '加工3', '加工4', '加工5'
            ];

            // 生成45个随机位置的标记
            const markerData = [];
            for (let i = 0; i < 45; i++) {
                // 随机选择图标和名称
                const iconClass = iconClasses[Math.floor(Math.random() * iconClasses.length)];
                const name = names[i % names.length];

                // 随机生成位置 - 覆盖整个可见区域
                // col范围: 0-13, row范围: 0-11（根据屏幕可见瓦片数）
                const col = Math.floor(Math.random() * 14);
                const row = Math.floor(Math.random() * 12);
                const offsetX = Math.floor(Math.random() * 100) - 20; // -20 到 80
                const offsetY = Math.floor(Math.random() * 100) - 20; // -20 到 80

                markerData.push({
                    name: name + (i + 1),
                    iconClass,
                    left: col * this.tileSize + offsetX,
                    top: row * this.tileSize + offsetY
                });
            }

            this.mockMarkers = markerData;
        }
    }
};
</script>

<style scoped>
.plot-marker-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: 2px;
    pointer-events: auto;
}

.plot-marker-icon {
    display: block !important;
    flex-shrink: 0;
    box-sizing: border-box !important;
    width: 48px !important;
    height: 48px !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    outline: none !important;
    background-repeat: no-repeat !important;
    background-position: center !important;
    background-size: contain !important;
    transition: all .3s ease;
    cursor: pointer;
    filter: drop-shadow(0 2px 4px #0000004d);
}

.plot-marker-icon:hover {
    transform: scale(1.2);
    filter: drop-shadow(0 4px 8px #4cfcea99);
}

.plot-marker-label {
    overflow: hidden;
    flex-shrink: 0;
    max-width: 160px;
    padding: 1px 4px;
    border: 1px solid #c69c6d66;
    font-size: 11px;
    font-weight: 500;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    text-overflow: ellipsis;
    word-break: break-word;
    color: #c69c6d;
    border-radius: 3px;
    background: #0f2334f2;
}

/* 地块标记图标样式 */
.plot-marker-icon.icon-filter1 {
    background-image: url(/public/images/map-filter1.png) !important;
}

.plot-marker-icon.icon-filter3 {
    background-image: url(/public/images/map-filter3.png) !important;
}

.plot-marker-icon.icon-filter5 {
    background-image: url(/public/images/map-filter5.png) !important;
}

.plot-marker-icon.icon-filter7 {
    background-image: url(/public/images/map-filter7.png) !important;
}

.plot-marker-icon.icon-filter9 {
    background-image: url(/public/images/map-filter9.png) !important;
}

/* 所有标记相关的容器和叠加层样式 */
.plot-marker-overlay {
    position: absolute;
    pointer-events: all;
    z-index: 1000;
}
</style>
