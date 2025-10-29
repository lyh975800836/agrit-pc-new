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
        { name: '右江区', value: 320, color: '#22C55E' },
        { name: '田阳区', value: 280, color: '#3B82F6' },
        { name: '田东县', value: 260, color: '#FFD700' },
        { name: '德保县', value: 200, color: '#A855F7' },
        { name: '靖西市', value: 198, color: '#FF6B4A' }
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
            radius: ['25%', '90%'],
            center: ['55%', '50%'],
            data: pieData,
            itemStyle: {
              borderColor: 'rgba(0,0,0,0.1)',
              borderWidth: 1
            },
            label: {
              show: true,
              position: 'inside',
              formatter: function(params) {
                return `${params.name}\n${params.value}亩\n${params.data.percentage}%`
              },
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: 11,
              fontFamily: 'SourceHanSansCN-Medium',
              fontWeight: 'bold',
              lineHeight: 14,
              textStyle: {
                align: 'center'
              }
            },
            labelLine: {
              show: false
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              },
              label: {
                fontSize: 12,
                fontWeight: 'bold'
              }
            }
          }
        ],
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
            return `${params.name}<br/>面积: ${params.value}亩<br/>占比: ${params.data.percentage}%`
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
  height: 300px;
}
</style>