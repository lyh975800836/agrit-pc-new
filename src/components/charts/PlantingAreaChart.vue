<template>
  <div class="planting-area-chart">
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'PlantingAreaChart',
  data() {
    return {
      chart: null,
      areaData: [
        { year: '2019', area: 980 },
        { year: '2020', area: 1050 },
        { year: '2021', area: 1120 },
        { year: '2022', area: 1180 },
        { year: '2023', area: 1200 },
        { year: '2024', area: 1258 }
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
      
      const years = this.areaData.map(item => item.year)
      const areas = this.areaData.map(item => item.area)
      
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
          min: 800,
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
        series: [
          {
            name: '种植面积',
            type: 'bar',
            data: areas,
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
                    color: '#4CFCEA'
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
            color: '#4CFCEA',
            fontSize: 12
          },
          formatter: function(params) {
            const data = params[0]
            return `${data.name}年<br/>种植面积: ${data.value}亩`
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
.planting-area-chart {
  width: 100%;
  height: 100%;
}

.chart-container {
  width: 100%;
  height: 200px;
}
</style>