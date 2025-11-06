<template>
  <div class="productive-forest-chart">
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
    name: 'ProductiveForestChart',
    data() {
        return {
            chart: null,
            chartData: [
                { district: '田林', productiveForest: 9, generalForest: 12 },
                { district: '右江区', productiveForest: 5, generalForest: 18.6 },
                { district: '德保', productiveForest: 2, generalForest: 38 },
                { district: '那坡', productiveForest: 3, generalForest: 27 },
                { district: '凌云', productiveForest: 5, generalForest: 12 },
                { district: '乐业', productiveForest: 4, generalForest: 6 }
            ]
        };
    },
    mounted() {
        this.initChart();
        window.addEventListener('resize', this.handleResize);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
        if (this.chart) {
            this.chart.dispose();
        }
    },
    methods: {
        initChart() {
            if (!this.$refs.chartContainer) return;

            this.chart = echarts.init(this.$refs.chartContainer, null, { renderer: 'canvas' });

            const districts = this.chartData.map(item => item.district);
            const productiveForest = this.chartData.map(item => item.productiveForest);
            const generalForest = this.chartData.map(item => item.generalForest);

            const option = {
                color: ['#22c55e', '#94a3b8'],
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' },
                    backgroundColor: '#0f3734cc',
                    borderColor: '#4cfcea',
                    textStyle: { color: '#c69c6d', fontSize: 12 },
                    formatter: (params) => {
                        if (!params.length) return '';
                        let result = `${params[0].axisValue}<br/>`;
                        params.forEach(param => {
                            result += `<span style="color:${param.color}">●</span> ${param.seriesName}: ${param.value}<br/>`;
                        });
                        return result;
                    }
                },
                legend: {
                    data: ['丰产林', '一般林'],
                    top: '5%',
                    left: 'center',
                    textStyle: {
                        color: '#c69c6d',
                        fontSize: 12
                    },
                    itemGap: 20
                },
                grid: {
                    left: '8%',
                    right: '5%',
                    top: '15%',
                    bottom: '12%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: districts,
                    axisLabel: {
                        color: '#c69c6d',
                        fontSize: 11,
                        margin: 8
                    },
                    axisLine: { lineStyle: { color: '#4cfcea4d' } },
                    splitLine: { show: false }
                },
                yAxis: {
                    type: 'value',
                    axisLabel: {
                        color: '#4cfceacc',
                        fontSize: 11,
                        margin: 8
                    },
                    axisLine: { lineStyle: { color: '#4cfcea4d' } },
                    splitLine: {
                        lineStyle: { color: '#4cfcea1a' }
                    }
                },
                series: [
                    {
                        name: '丰产林',
                        type: 'bar',
                        data: productiveForest,
                        itemStyle: {
                            color: '#22c55e',
                            borderRadius: [4, 4, 0, 0]
                        },
                        barWidth: '35%',
                        barGap: '30%'
                    },
                    {
                        name: '一般林',
                        type: 'bar',
                        data: generalForest,
                        itemStyle: {
                            color: '#94a3b8',
                            borderRadius: [4, 4, 0, 0]
                        },
                        barWidth: '35%'
                    }
                ],
                animation: true,
                animationDuration: 800
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
.productive-forest-chart {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .chart-container {
        flex: 1;
        min-height: 0;
    }
}
</style>
