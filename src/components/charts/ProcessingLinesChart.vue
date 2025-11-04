<template>
  <div class="processing-lines-chart">
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'ProcessingLinesChart',
  data() {
    return {
      chart: null,
      linesData: [
        { year: '2019', lines: 12 },
        { year: '2020', lines: 15 },
        { year: '2021', lines: 18 },
        { year: '2022', lines: 22 },
        { year: '2023', lines: 26 },
        { year: '2024', lines: 31 }
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

      const years = this.linesData.map(item => item.year)
      const lines = this.linesData.map(item => item.lines)

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
          max: 35,
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
          data: ['生产线数量'],
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
            name: '生产线数量',
            type: 'line',
            data: lines,
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
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgba(34, 197, 94, 0.2)'
                  },
                  {
                    offset: 1,
                    color: 'rgba(34, 197, 94, 0.05)'
                  }
                ]
              }
            },
            symbol: 'circle',
            symbolSize: 6,
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
          formatter: function(params) {
            let result = params[0].name + '年<br/>'
            params.forEach(item => {
              result += `${item.seriesName}: ${item.value}条<br/>`
            })
            return result
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
.processing-lines-chart {
  width: 100%;
  height: 100%;
}

.chart-container {
  width: 100%;
  height: 100%;
}
</style>
