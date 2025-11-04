<template>
  <div class="planting-area-chart">
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
    name: 'PlantingAreaChart',
    data() {
        return {
            chart: null,
            areaData: [
                { year: '2021', forestArea: 162, productiveArea: 20 },
                { year: '2022', forestArea: 152, productiveArea: 22 },
                { year: '2023', forestArea: 139, productiveArea: 24 },
                { year: '2024', forestArea: 137, productiveArea: 26 },
                { year: '2025', forestArea: 135, productiveArea: 28 }
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

            const years = this.areaData.map(item => item.year);
            const forestAreas = this.areaData.map(item => item.forestArea);
            const productiveAreas = this.areaData.map(item => item.productiveArea);

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
                    max: 180,
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
                    data: ['林地面积', '丰产林面积'],
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
                        name: '林地面积',
                        type: 'bar',
                        data: forestAreas,
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
                            fontSize: 11,
                            fontFamily: 'SourceHanSansCN-Light',
                            formatter: '{c}'
                        }
                    },
                    {
                        name: '丰产林面积',
                        type: 'bar',
                        data: productiveAreas,
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
                            result += `${ item.seriesName }: ${ item.value }万亩<br/>`;
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
.planting-area-chart {
    width: 100%;
    height: 100%;
}

.chart-container {
    width: 100%;
    height: 100%;
}
</style>
