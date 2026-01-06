/**
 * ECharts 图表自动 resize Mixin
 * 用于统一处理图表组件的窗口 resize 事件
 *
 * 使用方式:
 * 1. 在组件中引入: import chartResizeMixin from '@/mixins/chartResizeMixin'
 * 2. 添加到 mixins: mixins: [chartResizeMixin]
 * 3. 确保组件中有 chart 实例 (this.chart)
 *
 * 功能:
 * - 自动监听 window resize 事件
 * - 自动在 beforeDestroy 时清理事件监听
 * - 提供防抖处理避免频繁触发
 * - 支持 ResizeObserver API (如果浏览器支持)
 */

export default {
    data() {
        return {
            // 防抖定时器
            resizeTimer: null,
            // ResizeObserver 实例
            resizeObserver: null
        };
    },

    mounted() {
        this.$nextTick(() => {
            this.setupChartResize();
        });
    },

    beforeDestroy() {
        this.cleanupChartResize();
    },

    methods: {
        /**
         * 设置图表 resize 监听
         */
        setupChartResize() {
            // 监听 window resize 事件
            window.addEventListener('resize', this.handleChartResize);

            // 使用 ResizeObserver 监听容器大小变化（如果浏览器支持）
            if (typeof ResizeObserver !== 'undefined' && this.$el) {
                try {
                    this.resizeObserver = new ResizeObserver(() => {
                        this.debouncedChartResize();
                    });
                    this.resizeObserver.observe(this.$el);
                }
                catch (error) {
                    console.warn('ResizeObserver setup failed:', error);
                }
            }
        },

        /**
         * 清理图表 resize 监听
         */
        cleanupChartResize() {
            // 移除 window resize 监听
            window.removeEventListener('resize', this.handleChartResize);

            // 清理防抖定时器
            if (this.resizeTimer) {
                clearTimeout(this.resizeTimer);
                this.resizeTimer = null;
            }

            // 断开 ResizeObserver
            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
                this.resizeObserver = null;
            }
        },

        /**
         * 处理图表 resize
         * 带防抖处理，避免频繁触发
         */
        handleChartResize() {
            this.debouncedChartResize();
        },

        /**
         * 防抖处理的 resize 方法
         * 延迟 100ms 执行，避免 resize 事件频繁触发
         */
        debouncedChartResize() {
            if (this.resizeTimer) {
                clearTimeout(this.resizeTimer);
            }

            this.resizeTimer = setTimeout(() => {
                this.resizeChart();
            }, 100);
        },

        /**
         * 执行图表 resize
         * 组件可以覆盖此方法以自定义 resize 逻辑
         */
        resizeChart() {
            if (this.chart && typeof this.chart.resize === 'function') {
                try {
                    this.chart.resize();
                }
                catch (error) {
                    console.error('Chart resize failed:', error);
                }
            }
        }
    }
};
