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
            :indicator-index="selectedIndex"
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
                            note: '缺钾易致果实发育不良'
                        },
                        {
                            symbol: 'P',
                            name: '有效磷',
                            range: '20–40 mg/kg',
                            color: 'linear-gradient(135deg, #00d9a3 0%, #00a67e 100%)'
                        },
                        {
                            symbol: 'N',
                            name: '碱解氮',
                            range: '80–120 mg/kg',
                            color: 'linear-gradient(135deg, #00d9a3 0%, #00a67e 100%)'
                        },
                        {
                            symbol: 'Ca',
                            name: '交换性钙',
                            range: '≥400 mg/kg',
                            color: 'linear-gradient(135deg, #00d9a3 0%, #00a67e 100%)'
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
                            backgroundImage: '/images/Al.png'
                        },
                        {
                            symbol: 'Zn',
                            name: '锌',
                            range: '1.0–3.0 mg/kg',
                            backgroundImage: '/images/Zn.png'
                        },
                        {
                            symbol: 'Mn',
                            name: '锰',
                            range: '5–20 mg/kg',
                            backgroundImage: '/images/Mn.png'
                        },
                        {
                            symbol: 'S',
                            name: '硫',
                            range: '20–50 mg/kg',
                            backgroundImage: '/images/S.png'
                        },
                        {
                            symbol: 'B',
                            name: '硼',
                            range: '25–60 mg/kg',
                            backgroundImage: '/images/B.png'
                        }
                    ]
                },
                4: {
                    title: '土壤有益微生物指标含量',
                    elements: [
                        {
                            symbol: '',
                            name: '枯草芽孢杆菌',
                            range: '≥1.0×10⁸',
                            color: 'linear-gradient(135deg, #00d9a3 0%, #00a67e 100%)'
                        },
                        {
                            symbol: '',
                            name: '哈茨木霉菌',
                            range: '≥5.0×10⁵',
                            color: 'linear-gradient(135deg, #00d9a3 0%, #00a67e 100%)'
                        },
                        {
                            symbol: '',
                            name: '放线菌',
                            range: '≥1.0×10⁶',
                            color: 'linear-gradient(135deg, #00d9a3 0%, #00a67e 100%)'
                        },
                        {
                            symbol: '',
                            name: '其它芽孢杆菌属菌株',
                            range: '≥1.0×10⁷',
                            color: 'linear-gradient(135deg, #00d9a3 0%, #00a67e 100%)'
                        },
                        {
                            symbol: '',
                            name: '总有益菌群',
                            range: '≥2.0×10⁸',
                            color: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)'
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

