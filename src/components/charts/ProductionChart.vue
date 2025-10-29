<template>
  <div class="production-chart">
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'ProductionChart',
  data() {
    return {
      chart: null,
      productionData: [
        { year: '2019', production: 2800 },
        { year: '2020', production: 3200 },
        { year: '2021', production: 2950 },
        { year: '2022', production: 3400 },
        { year: '2023', production: 3650 },
        { year: '2024', production: 3850 }
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
      
      const years = this.productionData.map(item => item.year)
      const productions = this.productionData.map(item => item.production)
      
      const option = {
        backgroundColor: 'transparent',
        grid: {
          left: '15%',
          right: '10%',
          top: '10%',
          bottom: '15%'
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
          max: 4000,
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
        series: [
          {
            name: '产量',
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
              fontSize: 14,
              fontFamily: 'SourceHanSansCN-Medium',
              fontWeight: 'bold',
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
          formatter: function(params) {
            const data = params[0]
            return `${data.name}年<br/>产量: ${data.value}斤`
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
.production-chart {
  width: 100%;
  height: 100%;
}

.chart-container {
  width: 100%;
  height: 200px;
}
</style>