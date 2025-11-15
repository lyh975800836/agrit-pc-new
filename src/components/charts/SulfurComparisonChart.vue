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
                { year: '2021', sulfurPercent: 74.9 },
                { year: '2022', sulfurPercent: 73.5 },
                { year: '2023', sulfurPercent: 70.1 },
                { year: '2024', sulfurPercent: 67.5 },
                { year: '2025', sulfurPercent: 64.1 }
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
            const sulfuredData = this.sulfurData.map(item => item.sulfurPercent);
            const sulfurFreeData = this.sulfurData.map(item => (100 - item.sulfurPercent).toFixed(1));

            const option = {
                backgroundColor: 'transparent',
                grid: {
                    left: '8%',
                    right: '8%',
                    top: '35px',
                    bottom: '40px',
                    containLabel: false
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
                        fontSize: 12,
                        fontFamily: 'SourceHanSansCN-Light'
                    },
                    axisTick: {
                        show: false
                    }
                },
                yAxis: {
                    type: 'value',
                    min: 0,
                    max: 100,
                    splitNumber: 5,
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        color: 'rgba(76, 252, 234, 0.8)',
                        fontSize: 11,
                        fontFamily: 'SourceHanSansCN-Light',
                        formatter: '{value}%'
                    },
                    splitLine: {
                        lineStyle: {
                            color: 'rgba(76, 252, 234, 0.1)',
                            type: 'dashed'
                        }
                    }
                },
                legend: {
                    data: ['有硫八角', '无硫八角'],
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
                        name: '有硫八角',
                        type: 'bar',
                        data: sulfuredData,
                        barWidth: '50%',
                        stack: 'total',
                        itemStyle: {
                            color: '#FF6B4A',
                            borderRadius: [4, 0, 0, 4]
                        },
                        label: {
                            show: true,
                            position: 'inside',
                            color: '#ffffff',
                            fontSize: 13,
                            fontFamily: 'SourceHanSansCN-Medium',
                            fontWeight: 'bold',
                            formatter: function(params) {
                                return params.value + '%';
                            }
                        }
                    },
                    {
                        name: '无硫八角',
                        type: 'bar',
                        data: sulfurFreeData,
                        barWidth: '50%',
                        stack: 'total',
                        itemStyle: {
                            color: '#22C55E',
                            borderRadius: [0, 4, 4, 0]
                        },
                        label: {
                            show: true,
                            position: 'inside',
                            color: '#ffffff',
                            fontSize: 13,
                            fontFamily: 'SourceHanSansCN-Medium',
                            fontWeight: 'bold',
                            formatter: function(params) {
                                return params.value + '%';
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
                            result += `${ item.seriesName }: ${ item.value }%<br/>`;
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
