<template>
  <div class="price-trend-chart">
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import chartResizeMixin from '@/mixins/chartResizeMixin'

export default {
  name: 'PriceTrendChart',
  mixins: [chartResizeMixin],
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
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
    }
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.chartContainer)
      
      const months = this.priceData.map(item => item.month)
      const prices = this.priceData.map(item => item.price)
      const freshPrices = this.priceData.map(item => (item.price / 4).toFixed(2))

      const option = {
        backgroundColor: 'transparent',
        grid: {
          left: '8%',
          right: '8%',
          top: '35px',
          bottom: '40px',
          containLabel: true
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
          min: 4,
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
        legend: {
          data: ['干果价格', '鲜果价格'],
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
            name: '干果价格',
            type: 'line',
            data: prices,
            smooth: true,
            lineStyle: {
              color: '#C69C6D',
              width: 2
            },
            itemStyle: {
              color: '#C69C6D',
              borderColor: '#C69C6D',
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
                    color: 'rgba(198, 156, 109, 0.2)'
                  },
                  {
                    offset: 1,
                    color: 'rgba(198, 156, 109, 0.05)'
                  }
                ]
              }
            },
            symbol: 'circle',
            symbolSize: 6,
            emphasis: {
              itemStyle: {
                color: '#C69C6D',
                borderColor: '#fff',
                borderWidth: 2,
                shadowColor: 'rgba(76, 252, 234, 0.5)',
                shadowBlur: 10
              }
            }
          },
          {
            name: '鲜果价格',
            type: 'line',
            data: freshPrices,
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
                shadowColor: 'rgba(34, 197, 94, 0.5)',
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
            let result = params[0].name + '<br/>'
            params.forEach(item => {
              result += `${item.seriesName}: ¥${item.value}/斤<br/>`
            })
            return result
          }
        }
      }

      this.chart.setOption(option)
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
  height: 100%;
}
</style>