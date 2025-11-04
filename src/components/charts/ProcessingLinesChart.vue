<template>
  <div class="processing-lines-chart">
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
    name: 'ProcessingLinesChart',
    data() {
        return {
            chart: null,
            linesData: [
                { year: '2021', lines: 3, dryLines: 0 },
                { year: '2022', lines: 5, dryLines: 0 },
                { year: '2023', lines: 4, dryLines: 1 },
                { year: '2024', lines: 3, dryLines: 5 },
                { year: '2025', lines: 5, dryLines: 2 }
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

            const years = this.linesData.map(item => item.year);
            const lines = this.linesData.map(item => item.lines);
            const dryLines = this.linesData.map(item => item.dryLines);

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
                    max: 6,
                    splitNumber: 3,
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
                    data: ['烘场数量', '烘干线数量'],
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
                        name: '烘场数量',
                        type: 'bar',
                        data: lines,
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
                        }
                    },
                    {
                        name: '烘干线数量',
                        type: 'line',
                        data: dryLines,
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
                            show: true,
                            position: 'top',
                            color: 'rgba(76, 252, 234, 1)',
                            fontSize: 12,
                            fontFamily: 'SourceHanSansCN-Medium',
                            formatter: '{c}'
                        },
                        emphasis: {
                            itemStyle: {
                                color: '#22c55e',
                                borderColor: '#fff',
                                borderWidth: 2,
                                shadowColor: 'rgba(76, 252, 234, 0.5)',
                                shadowBlur: 10
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
                            result += `${ item.seriesName }: ${ item.value }条<br/>`;
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
.processing-lines-chart {
    width: 100%;
    height: 100%;
}

.chart-container {
    width: 100%;
    height: 100%;
}
</style>
