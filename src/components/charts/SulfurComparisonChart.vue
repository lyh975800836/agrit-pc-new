<template>
  <div class="sulfur-comparison-chart">
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
    name: 'SulfurComparisonChart',
    data() {
        return {
            chart: null,
            sulfurData: [
                { year: '2019', sulfurFree: 580, sulfured: 400 },
                { year: '2020', sulfurFree: 720, sulfured: 360 },
                { year: '2021', sulfurFree: 840, sulfured: 280 },
                { year: '2022', sulfurFree: 950, sulfured: 230 },
                { year: '2023', sulfurFree: 1050, sulfured: 150 },
                { year: '2024', sulfurFree: 1200, sulfured: 100 }
            ]
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

            const years = this.sulfurData.map(item => item.year);
            const sulfurFreeData = this.sulfurData.map(item => item.sulfurFree);
            const sulfuredData = this.sulfurData.map(item => item.sulfured);

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
                    max: 1400,
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
                    data: ['无硫八角', '有硫八角'],
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
                        name: '无硫八角',
                        type: 'bar',
                        data: sulfurFreeData,
                        barWidth: '35%',
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
                                        color: '#22c55e'
                                    },
                                    {
                                        offset: 1,
                                        color: 'rgba(34, 197, 94, 0.3)'
                                    }
                                ]
                            },
                            borderRadius: [4, 4, 0, 0]
                        },
                        label: {
                            show: true,
                            position: 'top',
                            color: 'rgba(76, 252, 234, 1)',
                            fontSize: 11,
                            fontFamily: 'SourceHanSansCN-Light',
                            formatter: '{c}'
                        }
                    },
                    {
                        name: '有硫八角',
                        type: 'bar',
                        data: sulfuredData,
                        barWidth: '35%',
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
                                        color: '#ff6b4a'
                                    },
                                    {
                                        offset: 1,
                                        color: 'rgba(255, 107, 74, 0.3)'
                                    }
                                ]
                            },
                            borderRadius: [4, 4, 0, 0]
                        },
                        label: {
                            show: true,
                            position: 'top',
                            color: 'rgba(76, 252, 234, 1)',
                            fontSize: 11,
                            fontFamily: 'SourceHanSansCN-Light',
                            formatter: '{c}'
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
                            result += `${ item.seriesName }: ${ item.value }亩<br/>`;
                        });
                        return result;
                    }
                }
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
.sulfur-comparison-chart {
    width: 100%;
    height: 100%;
}

.chart-container {
    width: 100%;
    height: 100%;
}
</style>
