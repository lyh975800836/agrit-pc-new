<template>
  <div class="nutrient-trend-chart">
    <!-- 标题和说明 -->
    <div class="chart-header">
      <div class="chart-title">{{ chartConfig.title }}</div>
      <div v-if="chartConfig.description" class="chart-description">{{ chartConfig.description }}</div>
    </div>

    <!-- 图表容器 -->
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
    name: 'NutrientTrendChart',
    props: {
        indicator: {
            type: Object,
            default: null
        },
        indicatorIndex: {
            type: Number,
            default: -1
        }
    },
    data() {
        return {
            chart: null,
            // 配置映射：根据 indicatorIndex 显示不同的内容
            configs: {
                0: {
                    title: '酸碱度 (pH)',
                    description: '范围：5.0–5.5（酸性至微酸性）。pH过高（>6.0）易导致铁、锌等元素缺素，pH过低（<4.5）可能引发铝、锰毒害。',
                    yAxisName: 'pH值',
                    yMin: 4.0,
                    yMax: 7.0,
                    yInterval: 0.5,
                    data: [5.2, 5.3, 5.1, 5.4, 5.3, 5.2],
                    lineColor: '#00d9a3',
                    // 标准范围
                    markArea: {
                        data: [[
                            { yAxis: 5.0 },
                            { yAxis: 5.5 }
                        ]],
                        itemStyle: {
                            color: 'rgba(0, 217, 163, 0.1)'
                        },
                        label: {
                            show: true,
                            position: 'insideTop',
                            formatter: '标准范围',
                            color: '#c7b299',
                            fontSize: 12
                        }
                    }
                },
                1: {
                    title: '有机质',
                    description: '适宜含量：≥2%（以腐殖质为主）。丰富的有机质能显著提升土壤的保水、保肥和缓冲能力，促进形成稳定的团粒结构，为八角根系创造疏松、肥沃的生长环境。',
                    yAxisName: '含量 (%)',
                    yMin: 0,
                    yMax: 5,
                    yInterval: 1,
                    data: [2.5, 2.8, 2.3, 2.9, 3.1, 2.7],
                    lineColor: '#00d9a3',
                    markLine: {
                        data: [{
                            yAxis: 2,
                            label: {
                                formatter: '标准线 ≥2%',
                                color: '#c7b299'
                            },
                            lineStyle: {
                                color: '#f39c12',
                                type: 'dashed',
                                width: 2
                            }
                        }]
                    }
                },
                // 大量营养元素
                2: {
                    title: '有效钾 (K)',
                    description: '适宜含量：≥100 mg/kg。钾是"品质元素"。含量不足易导致八角果实发育不良、色泽差、油脂含量低，树体抗逆性减弱。',
                    yAxisName: '含量 (mg/kg)',
                    yMin: 0,
                    yMax: 200,
                    yInterval: 50,
                    data: [120, 135, 110, 145, 130, 125],
                    lineColor: '#00d9a3',
                    markLine: {
                        data: [{
                            yAxis: 100,
                            label: {
                                formatter: '标准线 ≥100',
                                color: '#c7b299'
                            },
                            lineStyle: {
                                color: '#f39c12',
                                type: 'dashed',
                                width: 2
                            }
                        }]
                    }
                },
                3: {
                    title: '有效磷 (P)',
                    description: '适宜范围：20–40 mg/kg。适量磷能促进根系发育与花芽分化。含量过高易被固定，过低则影响能量代谢与早期生长。',
                    yAxisName: '含量 (mg/kg)',
                    yMin: 0,
                    yMax: 60,
                    yInterval: 10,
                    data: [28, 32, 25, 35, 30, 27],
                    lineColor: '#00d9a3',
                    markArea: {
                        data: [[
                            { yAxis: 20 },
                            { yAxis: 40 }
                        ]],
                        itemStyle: {
                            color: 'rgba(0, 217, 163, 0.1)'
                        },
                        label: {
                            show: true,
                            position: 'insideTop',
                            formatter: '标准范围',
                            color: '#c7b299',
                            fontSize: 12
                        }
                    }
                },
                4: {
                    title: '碱解氮 (N)',
                    description: '适宜范围：80–120 mg/kg。反映土壤近期供氮水平。含量需平衡，过量易引起徒长，降低抗性；不足则限制枝叶生长与产量。',
                    yAxisName: '含量 (mg/kg)',
                    yMin: 0,
                    yMax: 180,
                    yInterval: 30,
                    data: [95, 105, 88, 115, 100, 92],
                    lineColor: '#00d9a3',
                    markArea: {
                        data: [[
                            { yAxis: 80 },
                            { yAxis: 120 }
                        ]],
                        itemStyle: {
                            color: 'rgba(0, 217, 163, 0.1)'
                        },
                        label: {
                            show: true,
                            position: 'insideTop',
                            formatter: '标准范围',
                            color: '#c7b299',
                            fontSize: 12
                        }
                    }
                },
                5: {
                    title: '交换性钙 (Ca)',
                    description: '适宜含量：≥400 mg/kg。充足的钙能稳定细胞壁，增强果实硬度与耐储性，并有助于调节土壤酸碱平衡。',
                    yAxisName: '含量 (mg/kg)',
                    yMin: 0,
                    yMax: 800,
                    yInterval: 200,
                    data: [450, 520, 410, 580, 490, 460],
                    lineColor: '#00d9a3',
                    markLine: {
                        data: [{
                            yAxis: 400,
                            label: {
                                formatter: '标准线 ≥400',
                                color: '#c7b299'
                            },
                            lineStyle: {
                                color: '#f39c12',
                                type: 'dashed',
                                width: 2
                            }
                        }]
                    }
                },
                // 微量元素
                6: {
                    title: '铝 (Al)',
                    description: '适宜范围：0.5–2.0 mg/kg。在酸性土壤中需关注其有效态含量，避免过量引发毒害。',
                    yAxisName: '含量 (mg/kg)',
                    yMin: 0,
                    yMax: 4,
                    yInterval: 0.5,
                    data: [1.2, 1.5, 0.8, 1.8, 1.3, 1.1],
                    lineColor: '#3498db',
                    markArea: {
                        data: [[
                            { yAxis: 0.5 },
                            { yAxis: 2.0 }
                        ]],
                        itemStyle: {
                            color: 'rgba(52, 152, 219, 0.1)'
                        },
                        label: {
                            show: true,
                            position: 'insideTop',
                            formatter: '标准范围',
                            color: '#c7b299',
                            fontSize: 12
                        }
                    }
                },
                7: {
                    title: '锌 (Zn)',
                    description: '适宜范围：1.0–3.0 mg/kg。参与生长素合成。缺锌易导致"小叶病"，影响新梢生长与成花。',
                    yAxisName: '含量 (mg/kg)',
                    yMin: 0,
                    yMax: 5,
                    yInterval: 1,
                    data: [1.8, 2.2, 1.5, 2.5, 2.0, 1.9],
                    lineColor: '#9b59b6',
                    markArea: {
                        data: [[
                            { yAxis: 1.0 },
                            { yAxis: 3.0 }
                        ]],
                        itemStyle: {
                            color: 'rgba(155, 89, 182, 0.1)'
                        },
                        label: {
                            show: true,
                            position: 'insideTop',
                            formatter: '标准范围',
                            color: '#c7b299',
                            fontSize: 12
                        }
                    }
                },
                8: {
                    title: '锰 (Mn)',
                    description: '适宜范围：5–20 mg/kg。参与光合作用与酶活化。在强酸性土壤中需防过量毒害。',
                    yAxisName: '含量 (mg/kg)',
                    yMin: 0,
                    yMax: 30,
                    yInterval: 5,
                    data: [12, 15, 8, 18, 14, 11],
                    lineColor: '#e67e22',
                    markArea: {
                        data: [[
                            { yAxis: 5 },
                            { yAxis: 20 }
                        ]],
                        itemStyle: {
                            color: 'rgba(230, 126, 34, 0.1)'
                        },
                        label: {
                            show: true,
                            position: 'insideTop',
                            formatter: '标准范围',
                            color: '#c7b299',
                            fontSize: 12
                        }
                    }
                },
                9: {
                    title: '硫 (S)',
                    description: '适宜范围：20–50 mg/kg。是合成香味物质的关键元素之一，对八角独特风味的形成有重要贡献。',
                    yAxisName: '含量 (mg/kg)',
                    yMin: 0,
                    yMax: 80,
                    yInterval: 20,
                    data: [32, 38, 28, 45, 35, 30],
                    lineColor: '#f39c12',
                    markArea: {
                        data: [[
                            { yAxis: 20 },
                            { yAxis: 50 }
                        ]],
                        itemStyle: {
                            color: 'rgba(243, 156, 18, 0.1)'
                        },
                        label: {
                            show: true,
                            position: 'insideTop',
                            formatter: '标准范围',
                            color: '#c7b299',
                            fontSize: 12
                        }
                    }
                },
                10: {
                    title: '硼 (B)',
                    description: '适宜范围：25–60 mg/kg。对花粉萌发、花粉管伸长及坐果至关重要。缺硼会导致花而不实、落果及果实畸形。',
                    yAxisName: '含量 (mg/kg)',
                    yMin: 0,
                    yMax: 100,
                    yInterval: 20,
                    data: [38, 45, 32, 55, 42, 40],
                    lineColor: '#16a085',
                    markArea: {
                        data: [[
                            { yAxis: 25 },
                            { yAxis: 60 }
                        ]],
                        itemStyle: {
                            color: 'rgba(22, 160, 133, 0.1)'
                        },
                        label: {
                            show: true,
                            position: 'insideTop',
                            formatter: '标准范围',
                            color: '#c7b299',
                            fontSize: 12
                        }
                    }
                }
            }
        };
    },
    computed: {
        chartConfig() {
            return this.configs[this.indicatorIndex] || this.configs[0];
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.initChart();
            window.addEventListener('resize', this.handleResize);
        });
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.handleResize);
        if (this.chart) {
            this.chart.dispose();
        }
    },
    methods: {
        initChart() {
            if (!this.$refs.chartContainer) {
                return;
            }

            this.chart = echarts.init(this.$refs.chartContainer);

            const config = this.chartConfig;

            const option = {
                grid: {
                    left: '12%',
                    right: '8%',
                    top: '12%',
                    bottom: '22%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: ['第01月', '第02月', '第03月', '第04月', '第05月', '第06月'],
                    axisLine: {
                        lineStyle: {
                            color: '#2a5a54'
                        }
                    },
                    axisLabel: {
                        color: '#c7b299',
                        fontSize: 11,
                        rotate: -30,
                        margin: 12
                    },
                    axisTick: {
                        show: false
                    }
                },
                yAxis: {
                    type: 'value',
                    name: config.yAxisName,
                    nameTextStyle: {
                        color: '#c7b299',
                        fontSize: 11,
                        padding: [0, 0, 0, 15]
                    },
                    min: config.yMin,
                    max: config.yMax,
                    interval: config.yInterval,
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        color: '#c7b299',
                        fontSize: 11
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#2a5a54',
                            type: 'solid'
                        }
                    }
                },
                series: [
                    {
                        type: 'line',
                        data: config.data,
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 8,
                        itemStyle: {
                            color: config.lineColor,
                            borderWidth: 2,
                            borderColor: config.lineColor
                        },
                        lineStyle: {
                            color: config.lineColor,
                            width: 2
                        },
                        markArea: config.markArea,
                        markLine: config.markLine
                    }
                ]
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
.nutrient-trend-chart {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
}

.chart-header {
    margin-bottom: 12px;
    padding-left: 24px;
}

.chart-title {
    margin-bottom: 8px;
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #c69c6d;
}

.chart-description {
    font-family: SourceHanSansCN-Regular, sans-serif;
    font-size: 12px;
    line-height: 1.5;
    color: #c7b299;
    opacity: .85;
}

.chart-container {
    flex: 1;
    width: 100%;
    min-height: 250px;
}
</style>
