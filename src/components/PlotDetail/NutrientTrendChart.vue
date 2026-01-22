<template>
  <div class="nutrient-trend-chart">
    <!-- 标题和说明 -->
    <div class="chart-header">
      <div class="chart-title">{{ chartConfig.title }}</div>
      <div v-if="chartConfig.description" class="chart-description">{{ chartConfig.description }}</div>
    </div>

    <!-- 图表容器 -->
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
    name: 'NutrientTrendChart',
    props: {
        indicator: {
            type: Object,
            default: null
        },
        indicatorIndex: {
            type: Number,
            default: -1
        }
    },
    data() {
        return {
            chart: null,
            // 配置映射：根据 indicatorIndex 显示不同的内容
            configs: {
                0: {
                    title: '酸碱度 (pH)',
                    description: '范围：5.0–5.5（酸性至微酸性）。pH过高（>6.0）易导致铁、锌等元素缺素，pH过低（<4.5）可能引发铝、锰毒害。',
                    yAxisName: 'pH值',
                    yMin: 4.0,
                    yMax: 7.0,
                    yInterval: 0.5,
                    data: [5.2, 5.3, 5.1, 5.4, 5.3, 5.2],
                    lineColor: '#00d9a3',
                    // 标准范围
                    markArea: {
                        data: [[
                            { yAxis: 5.0 },
                            { yAxis: 5.5 }
                        ]],
                        itemStyle: {
                            color: 'rgba(0, 217, 163, 0.1)'
                        },
                        label: {
                            show: true,
                            position: 'insideTop',
                            formatter: '标准范围',
                            color: '#c7b299',
                            fontSize: 12
                        }
                    }
                },
                1: {
                    title: '有机质',
                    description: '含量：≥2%（以腐殖质为主）。提升土壤保水保肥能力，促进团粒结构形成。',
                    yAxisName: '含量 (%)',
                    yMin: 0,
                    yMax: 5,
                    yInterval: 1,
                    data: [2.5, 2.8, 2.3, 2.9, 3.1, 2.7],
                    lineColor: '#00d9a3',
                    markLine: {
                        data: [{
                            yAxis: 2,
                            label: {
                                formatter: '标准线 ≥2%',
                                color: '#c7b299'
                            },
                            lineStyle: {
                                color: '#f39c12',
                                type: 'dashed',
                                width: 2
                            }
                        }]
                    }
                }
            }
        };
    },
    computed: {
        chartConfig() {
            return this.configs[this.indicatorIndex] || this.configs[0];
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.initChart();
            window.addEventListener('resize', this.handleResize);
        });
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.handleResize);
        if (this.chart) {
            this.chart.dispose();
        }
    },
    methods: {
        initChart() {
            if (!this.$refs.chartContainer) {
                return;
            }

            this.chart = echarts.init(this.$refs.chartContainer);

            const config = this.chartConfig;

            const option = {
                grid: {
                    left: '12%',
                    right: '8%',
                    top: '12%',
                    bottom: '22%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: ['第01月', '第02月', '第03月', '第04月', '第05月', '第06月'],
                    axisLine: {
                        lineStyle: {
                            color: '#2a5a54'
                        }
                    },
                    axisLabel: {
                        color: '#c7b299',
                        fontSize: 11,
                        rotate: -30,
                        margin: 12
                    },
                    axisTick: {
                        show: false
                    }
                },
                yAxis: {
                    type: 'value',
                    name: config.yAxisName,
                    nameTextStyle: {
                        color: '#c7b299',
                        fontSize: 11,
                        padding: [0, 0, 0, 15]
                    },
                    min: config.yMin,
                    max: config.yMax,
                    interval: config.yInterval,
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        color: '#c7b299',
                        fontSize: 11
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#2a5a54',
                            type: 'solid'
                        }
                    }
                },
                series: [
                    {
                        type: 'line',
                        data: config.data,
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 8,
                        itemStyle: {
                            color: config.lineColor,
                            borderWidth: 2,
                            borderColor: config.lineColor
                        },
                        lineStyle: {
                            color: config.lineColor,
                            width: 2
                        },
                        markArea: config.markArea,
                        markLine: config.markLine
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
.nutrient-trend-chart {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
}

.chart-header {
    margin-bottom: 12px;
    padding-left: 24px;
}

.chart-title {
    margin-bottom: 8px;
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #c69c6d;
}

.chart-description {
    font-family: SourceHanSansCN-Regular, sans-serif;
    font-size: 12px;
    line-height: 1.5;
    color: #c7b299;
    opacity: .85;
}

.chart-container {
    flex: 1;
    width: 100%;
    min-height: 250px;
}
</style>
