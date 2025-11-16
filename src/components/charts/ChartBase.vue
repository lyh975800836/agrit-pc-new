<template>
  <div class="chart-container" :style="containerStyle">
    <div ref="chartElement" class="chart-element" :style="{ width: '100%', height: '100%' }"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
    name: 'ChartBase',
    props: {
    // 图表配置选项
        options: {
            type: Object,
            required: true
        },
        // 图表宽度
        width: {
            type: [String, Number],
            default: '100%'
        },
        // 图表高度
        height: {
            type: [String, Number],
            default: '300px'
        },
        // 是否自动调整大小
        autoResize: {
            type: Boolean,
            default: true
        },
        // 图表主题
        theme: {
            type: String,
            default: 'light'
        }
    },
    data() {
        return {
            chart: null,
            resizeObserver: null
        };
    },
    computed: {
        containerStyle() {
            return {
                width: typeof this.width === 'number' ? `${ this.width }px` : this.width,
                height: typeof this.height === 'number' ? `${ this.height }px` : this.height
            };
        }
    },
    watch: {
        options: {
            handler(newOptions) {
                if (this.chart && newOptions) {
                    this.chart.setOption(newOptions);
                }
            },
            deep: true
        }
    },
    mounted() {
        this.initChart();
        if (this.autoResize) {
            this.setupResize();
        }
    },
    beforeDestroy() {
        this.disposeChart();
    },
    methods: {
        initChart() {
            if (!this.chart && this.$refs.chartElement) {
                this.chart = echarts.init(this.$refs.chartElement, this.theme);
                this.setChartOption();
            }
        },
        setChartOption() {
            if (this.chart && this.options) {
                this.chart.setOption(this.options);
            }
        },
        setupResize() {
            // 窗口resize事件监听
            window.addEventListener('resize', this.handleWindowResize);

            // 使用ResizeObserver监听容器大小变化
            if (typeof ResizeObserver !== 'undefined') {
                this.resizeObserver = new ResizeObserver(() => {
                    this.handleResize();
                });
                this.resizeObserver.observe(this.$el);
            }
        },
        handleWindowResize() {
            this.handleResize();
        },
        handleResize() {
            if (this.chart) {
                this.chart.resize();
            }
        },
        disposeChart() {
            // 移除事件监听
            window.removeEventListener('resize', this.handleWindowResize);

            // 清理ResizeObserver
            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
                this.resizeObserver = null;
            }

            // 销毁图表
            if (this.chart) {
                this.chart.dispose();
                this.chart = null;
            }
        },
        // 公开方法供外部使用
        getChart() {
            return this.chart;
        },
        resize() {
            this.handleResize();
        }
    }
};
</script>

<style lang="less" scoped>
.chart-container {
    position: relative;
    width: 100%;
    height: 100%;
}

.chart-element {
    width: 100%;
    height: 100%;
}
</style>
