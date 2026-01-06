<template>
  <div class="production-chart">
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import chartResizeMixin from '@/mixins/chartResizeMixin';

export default {
    name: 'ProductionChart',
    mixins: [chartResizeMixin],
    data() {
        return {
            chart: null,
            productionData: [
                { year: '2022', production: 30 },
                { year: '2023', production: 20 },
                { year: '2024', production: 24 },
                { year: '2025', production: 12 }
            ]
        };
    },
    mounted() {
        this.initChart();
    },
    beforeDestroy() {
        if (this.chart) {
            this.chart.dispose();
        }
    },
    methods: {
        initChart() {
            this.chart = echarts.init(this.$refs.chartContainer);

            const years = this.productionData.map(item => item.year);
            const productions = this.productionData.map(item => item.production);
            const dryFruitProductions = this.productionData.map(item => (item.production / 4).toFixed(0));

            const option = {
                backgroundColor: 'transparent',
                grid: {
                    left: '15%',
                    right: '10%',
                    top: '35px',
                    bottom: '40px',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: years,
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(76, 252, 234, 0.3)'
                        }
                    },
                    axisLabel: {
                        color: 'rgba(76, 252, 234, 0.8)',
                        fontSize: 11,
                        fontFamily: 'SourceHanSansCN-Light'
                    },
                    axisTick: {
                        show: false
                    }
                },
                yAxis: {
                    type: 'value',
                    min: 0,
                    max: 35,
                    splitNumber: 4,
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        color: 'rgba(76, 252, 234, 0.8)',
                        fontSize: 11,
                        fontFamily: 'SourceHanSansCN-Light'
                    },
                    splitLine: {
                        lineStyle: {
                            color: 'rgba(76, 252, 234, 0.1)',
                            type: 'dashed'
                        }
                    }
                },
                legend: {
                    data: ['干果产量', '鲜果产量'],
                    textStyle: {
                        color: '#C69C6D',
                        fontSize: 12,
                        fontFamily: 'SourceHanSansCN-Light'
                    },
                    orient: 'horizontal',
                    top: '0px',
                    left: 'center'
                },
                series: [
                    {
                        name: '干果产量',
                        type: 'line',
                        data: dryFruitProductions,
                        smooth: true,
                        lineStyle: {
                            color: '#22c55e',
                            width: 2
                        },
                        itemStyle: {
                            color: '#22c55e',
                            borderColor: '#22c55e',
                            borderWidth: 2
                        },
                        symbol: 'circle',
                        symbolSize: 6,
                        label: {
                            show: false
                        }
                    },
                    {
                        name: '鲜果产量',
                        type: 'bar',
                        data: productions,
                        barWidth: '40%',
                        itemStyle: {
                            color: {
                                type: 'linear',
                                x: 0,
                                y: 0,
                                x2: 0,
                                y2: 1,
                                colorStops: [
                                    {
                                        offset: 0,
                                        color: '#C69C6D'
                                    },
                                    {
                                        offset: 1,
                                        color: 'rgba(76, 252, 234, 0.3)'
                                    }
                                ]
                            },
                            borderRadius: [4, 4, 0, 0]
                        },
                        label: {
                            show: true,
                            position: 'top',
                            color: 'rgba(76, 252, 234, 1)',
                            fontSize: 12,
                            fontFamily: 'SourceHanSansCN-Medium',
                            formatter: '{c}'
                        },
                        emphasis: {
                            itemStyle: {
                                color: {
                                    type: 'linear',
                                    x: 0,
                                    y: 0,
                                    x2: 0,
                                    y2: 1,
                                    colorStops: [
                                        {
                                            offset: 0,
                                            color: '#5DFDEB'
                                        },
                                        {
                                            offset: 1,
                                            color: 'rgba(93, 253, 235, 0.4)'
                                        }
                                    ]
                                }
                            }
                        }
                    }
                ],
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: 'rgba(15, 55, 52, 0.9)',
                    borderColor: 'rgba(76, 252, 234, 0.5)',
                    borderWidth: 1,
                    textStyle: {
                        color: '#C69C6D',
                        fontSize: 12
                    },
                    formatter(params) {
                        let result = `${ params[0].name }年<br/>`;
                        params.forEach(item => {
                            result += `${ item.seriesName }: ${ item.value }斤<br/>`;
                        });
                        return result;
                    }
                }
            };

            this.chart.setOption(option);
        }
    }
};
</script>

<style lang="less" scoped>
.production-chart {
    width: 100%;
    height: 100%;
}

.chart-container {
    width: 100%;
    height: 100%;
}
</style>
