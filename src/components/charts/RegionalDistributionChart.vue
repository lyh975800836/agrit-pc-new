<template>
  <div class="regional-distribution-chart">
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'RegionalDistributionChart',
  data() {
    return {
      chart: null,
      distributionData: [
        { name: '德保县', value: 38, color: '#22C55E' },
        { name: '那坡县', value: 30, color: '#3B82F6' },
        { name: '右江区', value: 23.6, color: '#FFD700' },
        { name: '田林县', value: 21, color: '#A855F7' },
        { name: '凌云县', value: 17, color: '#FF6B4A' },
        { name: '乐业县', value: 10, color: '#FF9500' }
      ]
    }
  },
  mounted() {
    this.initChart()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
    }
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.chartContainer)
      
      const total = this.distributionData.reduce((sum, item) => sum + item.value, 0)
      const pieData = this.distributionData.map(item => ({
        name: item.name,
        value: item.value,
        percentage: ((item.value / total) * 100).toFixed(2),
        itemStyle: {
          color: item.color
        }
      }))
      
      const option = {
        backgroundColor: 'transparent',
        series: [
          {
            name: '种植面积分布',
            type: 'pie',
            radius: ['25%', '75%'],
            center: ['50%', '50%'],
            data: pieData,
            itemStyle: {
              borderColor: 'rgba(0,0,0,0.1)',
              borderWidth: 1
            },
            label: {
              show: true,
              position: 'outside',
              formatter: function(params) {
                return `${params.name}${params.data.value}万亩`
              },
              color: 'rgba(76, 252, 234, 1)',
              fontSize: 12,
              fontFamily: 'SourceHanSansCN-Medium'
            },
            labelLine: {
              show: true,
              lineStyle: {
                color: 'rgba(76, 252, 234, 0.6)'
              }
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ],
        legend: {
          show: false
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
          formatter: function(params) {
            return `${params.name}<br/>面积: ${params.data.value}万亩<br/>占比: ${params.data.percentage}%`
          }
        }
      }
      
      this.chart.setOption(option)
    },
    
    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.regional-distribution-chart {
  width: 100%;
  height: 100%;
}

.chart-container {
  width: 100%;
  height: 100%;
}
</style>