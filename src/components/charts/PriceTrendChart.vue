<template>
  <div class="price-trend-chart">
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'PriceTrendChart',
  data() {
    return {
      chart: null,
      priceData: [
        { month: '01月', price: 18.2 },
        { month: '02月', price: 19.5 },
        { month: '03月', price: 20.1 },
        { month: '04月', price: 22.3 },
        { month: '05月', price: 21.8 },
        { month: '06月', price: 23.5 },
        { month: '07月', price: 25.4 },
        { month: '08月', price: 24.7 },
        { month: '09月', price: 26.1 },
        { month: '10月', price: 23.8 },
        { month: '11月', price: 22.4 },
        { month: '12月', price: 25.0 }
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
      
      const months = this.priceData.map(item => item.month)
      const prices = this.priceData.map(item => item.price)
      
      const option = {
        backgroundColor: 'transparent',
        grid: {
          left: '8%',
          right: '8%',
          top: '15%',
          bottom: '15%'
        },
        xAxis: {
          type: 'category',
          data: months,
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
          min: 15,
          max: 30,
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
            fontFamily: 'SourceHanSansCN-Light',
            formatter: '¥{value}'
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
            name: '价格',
            type: 'line',
            data: prices,
            smooth: true,
            lineStyle: {
              color: '#4CFCEA',
              width: 2
            },
            itemStyle: {
              color: '#4CFCEA',
              borderColor: '#4CFCEA',
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
                    color: 'rgba(76, 252, 234, 0.3)'
                  },
                  {
                    offset: 1,
                    color: 'rgba(76, 252, 234, 0.05)'
                  }
                ]
              }
            },
            symbol: 'circle',
            symbolSize: 6,
            markPoint: {
              data: [
                {
                  coord: ['07月', 25.4],
                  label: {
                    show: true,
                    position: 'top',
                    formatter: '25.4元',
                    color: '#4CFCEA',
                    fontSize: 12,
                    fontFamily: 'SourceHanSansCN-Medium'
                  },
                  itemStyle: {
                    color: '#4CFCEA'
                  }
                },
                {
                  coord: ['10月', 23.8],
                  label: {
                    show: true,
                    position: 'bottom',
                    formatter: '23.8元',
                    color: '#4CFCEA',
                    fontSize: 12,
                    fontFamily: 'SourceHanSansCN-Medium'
                  },
                  itemStyle: {
                    color: '#4CFCEA'
                  }
                },
                {
                  coord: ['12月', 25.0],
                  label: {
                    show: true,
                    position: 'right',
                    formatter: '17.5元',
                    color: '#4CFCEA',
                    fontSize: 12,
                    fontFamily: 'SourceHanSansCN-Medium'
                  },
                  itemStyle: {
                    color: '#4CFCEA'
                  }
                }
              ]
            },
            emphasis: {
              itemStyle: {
                color: '#4CFCEA',
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
            color: '#4CFCEA',
            fontSize: 12
          },
          formatter: function(params) {
            const data = params[0]
            return `${data.name}<br/>价格: ¥${data.value}/斤`
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
.price-trend-chart {
  width: 100%;
  height: 100%;
}

.chart-container {
  width: 100%;
  height: 180px;
}
</style>