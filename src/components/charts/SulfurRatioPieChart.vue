<template>
  <div class="sulfur-ratio-pie-chart">
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
    name: 'SulfurRatioPieChart',
    data() {
        return {
            chart: null
        };
    },
    mounted() {
        this.initChart();
        window.addEventListener('resize', this.handleResize);
    },
    beforeDestroy() {
        if (this.chart) {
            this.chart.dispose();
        }
        window.removeEventListener('resize', this.handleResize);
    },
    methods: {
        initChart() {
            this.chart = echarts.init(this.$refs.chartContainer);

            const option = {
                backgroundColor: 'transparent',
                title: {
                    text: '八角产品占比',
                    left: 'center',
                    top: '5%',
                    textStyle: {
                        color: '#c69c6d',
                        fontSize: 16,
                        fontFamily: 'SourceHanSansCN-Medium'
                    }
                },
                tooltip: {
                    trigger: 'item',
                    backgroundColor: 'rgba(15, 55, 52, 0.9)',
                    borderColor: 'rgba(76, 252, 234, 0.5)',
                    borderWidth: 1,
                    textStyle: {
                        color: '#C69C6D',
                        fontSize: 12
                    },
                    formatter: '{b}: {c}亩 ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    top: 'center',
                    data: ['无硫八角', '有硫八角'],
                    textStyle: {
                        color: '#c69c6d',
                        fontSize: 12,
                        fontFamily: 'SourceHanSansCN-Light'
                    }
                },
                series: [
                    {
                        name: '八角产品占比',
                        type: 'pie',
                        radius: ['40%', '70%'],
                        center: ['60%', '55%'],
                        data: [
                            {
                                value: 1200,
                                name: '无硫八角',
                                itemStyle: {
                                    color: '#22c55e'
                                }
                            },
                            {
                                value: 100,
                                name: '有硫八角',
                                itemStyle: {
                                    color: '#ff6b4a'
                                }
                            }
                        ],
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(76, 252, 234, 0.5)'
                            }
                        },
                        label: {
                            color: '#c69c6d',
                            fontSize: 12,
                            fontFamily: 'SourceHanSansCN-Light',
                            formatter: '{b}\n{d}%'
                        }
                    }
                ]
            };

            this.chart.setOption(option);
        },

        handleResize() {
            if (this.chart) {
                this.chart.resize();
            }
        }
    }
};
</script>

<style lang="less" scoped>
.sulfur-ratio-pie-chart {
    width: 100%;
    height: 100%;
}

.chart-container {
    width: 100%;
    height: 240px;
}
</style>
