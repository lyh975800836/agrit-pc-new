<template>
  <div class="nutrient-map-distribution">
    <div class="content-wrapper">
      <!-- 元素列表 -->
      <div class="element-list">
        <div
          v-for="(element, index) in contentConfig.elements"
          :key="index"
          class="element-item clickable"
          @click="handleElementClick(element, index, $event)"
        >
          <!-- 元素图标 -->
          <img
            v-if="element.backgroundImage"
            :src="element.backgroundImage"
            :alt="element.name"
            class="element-image"
          />
          <img
            v-else-if="!element.symbol"
            src="/images/strain.png"
            :alt="element.name"
            class="element-image"
          />
          <div v-else class="element-icon-circle" :style="{ background: element.color }">
            <svg class="element-icon" viewBox="0 0 24 24" fill="none">
              <text x="12" y="16" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">
                {{ element.symbol }}
              </text>
            </svg>
          </div>

          <!-- 元素信息 -->
          <div class="element-details">
            <div class="element-label">{{ element.name }}</div>
            <div class="element-value">{{ element.range }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 悬浮框 - 使用 Teleport 渲染到 body -->
    <Teleport to="body">
      <div
        v-if="showPopover"
        ref="popover"
        class="element-popover-container"
        :style="{
          top: popoverPosition.top + 'px',
          left: popoverPosition.left + 'px',
        }"
      >
        <!-- 关闭按钮 -->
        <div class="element-popover-close" @click="closePopover">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="#C7B299" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>

        <!-- 内容 -->
        <div class="element-popover-content">
          <NutrientTrendChart
            :indicator="selectedElement"
            :indicator-index="selectedElement ? selectedElement.chartIndex : selectedIndex"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import NutrientTrendChart from './NutrientTrendChart.vue';

export default {
    name: 'NutrientMapDistribution',
    components: {
        NutrientTrendChart
    },
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
            showPopover: false,
            selectedElement: null,
            selectedIndex: -1,
            popoverPosition: {
                top: 0,
                left: 0
            },
            // 配置映射：根据 indicatorIndex 显示不同的内容
            configs: {
                2: {
                    title: '大量营养元素',
                    elements: [
                        {
                            symbol: 'K',
                            name: '有效钾',
                            range: '≥100 mg/kg',
                            color: 'linear-gradient(135deg, #00d9a3 0%, #00a67e 100%)',
                            note: '钾是"品质元素"。含量不足易导致八角果实发育不良、色泽差、油脂含量低，树体抗逆性减弱。',
                            chartIndex: 2
                        },
                        {
                            symbol: 'P',
                            name: '有效磷',
                            range: '20–40 mg/kg',
                            color: 'linear-gradient(135deg, #00d9a3 0%, #00a67e 100%)',
                            note: '适量磷能促进根系发育与花芽分化。含量过高易被固定，过低则影响能量代谢与早期生长。',
                            chartIndex: 3
                        },
                        {
                            symbol: 'N',
                            name: '碱解氮',
                            range: '80–120 mg/kg',
                            color: 'linear-gradient(135deg, #00d9a3 0%, #00a67e 100%)',
                            note: '反映土壤近期供氮水平。含量需平衡，过量易引起徒长，降低抗性；不足则限制枝叶生长与产量。',
                            chartIndex: 4
                        },
                        {
                            symbol: 'Ca',
                            name: '交换性钙',
                            range: '≥400 mg/kg',
                            color: 'linear-gradient(135deg, #00d9a3 0%, #00a67e 100%)',
                            note: '充足的钙能稳定细胞壁，增强果实硬度与耐储性，并有助于调节土壤酸碱平衡。',
                            chartIndex: 5
                        }
                    ]
                },
                3: {
                    title: '微量元素',
                    elements: [
                        {
                            symbol: 'Al',
                            name: '铝',
                            range: '0.5–2.0 mg/kg',
                            backgroundImage: '/images/Al.png',
                            note: '在酸性土壤中需关注其有效态含量，避免过量引发毒害。',
                            chartIndex: 6
                        },
                        {
                            symbol: 'Zn',
                            name: '锌',
                            range: '1.0–3.0 mg/kg',
                            backgroundImage: '/images/Zn.png',
                            note: '参与生长素合成。缺锌易导致"小叶病"，影响新梢生长与成花。',
                            chartIndex: 7
                        },
                        {
                            symbol: 'Mn',
                            name: '锰',
                            range: '5–20 mg/kg',
                            backgroundImage: '/images/Mn.png',
                            note: '参与光合作用与酶活化。在强酸性土壤中需防过量毒害。',
                            chartIndex: 8
                        },
                        {
                            symbol: 'S',
                            name: '硫',
                            range: '20–50 mg/kg',
                            backgroundImage: '/images/S.png',
                            note: '是合成香味物质的关键元素之一，对八角独特风味的形成有重要贡献。',
                            chartIndex: 9
                        },
                        {
                            symbol: 'B',
                            name: '硼',
                            range: '25–60 mg/kg',
                            backgroundImage: '/images/B.png',
                            note: '对花粉萌发、花粉管伸长及坐果至关重要。缺硼会导致花而不实、落果及果实畸形。',
                            chartIndex: 10
                        }
                    ]
                },
                4: {
                    title: '土壤有益微生物指标含量',
                    elements: [
                        {
                            symbol: '',
                            name: '枯草芽孢杆菌',
                            range: '≥1.0×10⁸ CFU/g',
                            color: 'linear-gradient(135deg, #00d9a3 0%, #00a67e 100%)',
                            note: '能抑制土传病害、分解有机质、活化养分、促进根系生长。'
                        },
                        {
                            symbol: '',
                            name: '哈茨木霉菌',
                            range: '≥5.0×10⁵ CFU/g',
                            color: 'linear-gradient(135deg, #00d9a3 0%, #00a67e 100%)',
                            note: '具有抑制土传病害、分解有机质、活化养分的作用。'
                        },
                        {
                            symbol: '',
                            name: '放线菌',
                            range: '≥1.0×10⁶ CFU/g',
                            color: 'linear-gradient(135deg, #00d9a3 0%, #00a67e 100%)',
                            note: '能有效抑制病原菌、改善土壤结构。'
                        },
                        {
                            symbol: '',
                            name: '其它芽孢杆菌属菌株',
                            range: '≥1.0×10⁷ CFU/g',
                            color: 'linear-gradient(135deg, #00d9a3 0%, #00a67e 100%)',
                            note: '多种芽孢杆菌协同作用，增强土壤生物活性。'
                        },
                        {
                            symbol: '',
                            name: '总有益菌群',
                            range: '≥2.0×10⁸ CFU/g',
                            color: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                            note: '构建健康的根际微生态系统，是八角可持续种植管理的核心。'
                        }
                    ]
                }
            }
        };
    },
    computed: {
        contentConfig() {
            return this.configs[this.indicatorIndex] || this.configs[2];
        }
    },
    methods: {
        handleElementClick(element, index, event) {
            // 阻止事件冒泡
            event.stopPropagation();

            // 如果点击的是已经选中的元素，关闭弹窗
            if (this.showPopover && this.selectedIndex === index) {
                this.closePopover();
                return;
            }

            // 先关闭当前弹窗（如果有）
            if (this.showPopover) {
                this.showPopover = false;
            }

            // 使用 nextTick 确保 DOM 更新后再打开新弹窗
            this.$nextTick(() => {
                this.selectedElement = element;
                this.selectedIndex = index;

                // 计算弹窗位置
                this.calculatePopoverPosition(event);
                this.showPopover = true;
            });
        },
        calculatePopoverPosition(event) {
            // 获取点击的元素位置
            const target = event.currentTarget;
            const rect = target.getBoundingClientRect();

            // 弹窗显示在元素右侧
            this.popoverPosition = {
                top: rect.top + (rect.height / 2) - 100, // 垂直居中，减去弹窗高度的一半
                left: rect.right + 10 // 在元素右侧，留 10px 间距
            };
        },
        closePopover() {
            this.showPopover = false;
            this.selectedElement = null;
            this.selectedIndex = -1;
        },
        handleClickOutside(event) {
            if (this.showPopover) {
                const popover = this.$refs.popover;
                const clickedElement = event.target.closest('.element-item');

                // 如果点击的不是弹窗内部，也不是元素项，则关闭弹窗
                if (popover && !popover.contains(event.target) && !clickedElement) {
                    this.closePopover();
                }
            }
        }
    },
    mounted() {
        // 监听点击外部事件
        document.addEventListener('click', this.handleClickOutside);
    },
    beforeUnmount() {
        // 清理事件监听
        document.removeEventListener('click', this.handleClickOutside);
    }
};
</script>

<style lang="less" scoped>
.nutrient-map-distribution {
    display: flex;
    width: 100%;
    height: 100%;
}

.content-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 10px 0;
}

.element-list {
    display: flex;
    overflow-y: auto;
    flex-direction: column;
    align-items: center;

    gap: 24px;
}

.element-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    gap: 12px;
    transition: all .3s ease;

    &.clickable {
        cursor: pointer;

        &:hover {
            transform: scale(1.05);
            filter: brightness(1.2);
        }
    }
}

.element-image {
    flex-shrink: 0;
    width: 50px;
    height: 50px;
    object-fit: contain;
}

.element-icon-circle {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;

    border-radius: 50%;
    box-shadow: 0 4px 12px #00d9a34d;
}

.element-icon {
    width: 100%;
    height: 100%;
}

.element-details {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    gap: 4px;
}

.element-label {
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 13px;
    white-space: nowrap;
    color: #c7b299;
}

.element-value {
    font-family: SourceHanSansCN-Regular, sans-serif;
    font-size: 11px;
    white-space: nowrap;
    opacity: .8;
    font-weight: 600;
    color: #c7b299;
}

// 悬浮框样式（通过 Teleport 渲染到 body，不受 scoped 限制）
.element-popover-container {
    position: fixed;
    z-index: 99999;
    width: 620px;
    height: 340px;
    padding: 20px 24px;
    background: url("/public/images/forest-right-bg.png") no-repeat;
    background-size: 100% 100%;
    pointer-events: auto;
}

.element-popover-close {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;

    cursor: pointer;
    border-radius: 50%;
    background: #c7b2991a;
    transition: all .3s ease;

    &:hover {
        background: #c7b29933;
        transform: rotate(90deg);
    }
}

.element-popover-content {
    width: 100%;
    height: 100%;
}
</style>

