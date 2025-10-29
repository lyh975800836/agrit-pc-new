<template>
  <div class="disease-distribution-chart">
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'DiseaseDistributionChart',
  data() {
    return {
      chart: null,
      diseaseData: [
        { name: '健康地块', value: 88.8, color: '#C69C6D' },
        { name: '轻度病虫害', value: 6.5, color: '#FFD700' },
        { name: '中度病虫害', value: 3.83, color: '#FF9500' },
        { name: '重度病虫害', value: 0.87, color: '#FF6B4A' }
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
      
      const pieData = this.diseaseData.map(item => ({
        name: item.name,
        value: item.value,
        itemStyle: {
          color: item.color
        }
      }))
      
      const option = {
        backgroundColor: 'transparent',
        series: [
          {
            name: '病虫害分布',
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
                return `${params.name}${params.value}%`
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
            return `${params.name}<br/>占比: ${params.value}%`
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
.disease-distribution-chart {
  width: 100%;
  height: 100%;
}

.chart-container {
  width: 100%;
  height: 100%;
}
</style>