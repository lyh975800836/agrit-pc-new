<template>
  <div class="forest-health-wrapper">

    <!-- 指标容器 -->
    <div class="indicators-box">
      <div
        v-for="(indicator, index) in indicators"
        :key="index"
        class="indicator-item clickable"
        @click="handleIndicatorClick(indicator, index, $event)"
      >
        <!-- 图标 -->
        <div class="indicator-icon">
          <img :src="indicator.icon" :alt="indicator.label" />
        </div>

        <!-- 标签和值 -->
        <div class="indicator-info">
          <div class="indicator-label">{{ indicator.label }}</div>
          <div v-if="indicator.value" class="indicator-value">
            {{ indicator.value }}
          </div>
        </div>
      </div>
    </div>

    <!-- 悬浮框（所有指标）- 使用 Teleport 渲染到 body -->
    <Teleport to="body">
      <!-- 趋势图表弹窗 (索引 0, 1) -->
      <div
        v-if="showPopover && (selectedIndex === 0 || selectedIndex === 1)"
        ref="popover"
        class="popover-container popover-trend"
        :style="{
          top: popoverPosition.top + 'px',
          left: popoverPosition.left + 'px',
        }"
      >
        <!-- 关闭按钮 -->
        <div class="popover-close" @click="closePopover">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="#C7B299" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>

        <!-- 内容 -->
        <div class="popover-content">
          <NutrientTrendChart
            :indicator="selectedIndicator"
            :indicator-index="selectedIndex"
          />
        </div>
      </div>

      <!-- 地图分布弹窗 (索引 2, 3, 4) -->
      <div
        v-if="showPopover && selectedIndex >= 2"
        ref="popover"
        class="popover-container popover-distribution"
        :style="{
          top: popoverPosition.top + 'px',
          left: popoverPosition.left + 'px',
        }"
      >
        <!-- 关闭按钮 -->
        <div class="popover-close" @click="closePopover">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="#C7B299" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>

        <!-- 内容 -->
        <div class="popover-content">
          <NutrientMapDistribution
            :indicator="selectedIndicator"
            :indicator-index="selectedIndex"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import NutrientTrendChart from './NutrientTrendChart.vue';
import NutrientMapDistribution from './NutrientMapDistribution.vue';

export default {
    name: 'ForestHealthIndicators',
    components: {
        NutrientTrendChart,
        NutrientMapDistribution
    },
    props: {
        indicators: {
            type: Array,
            default: () => [
                {
                    icon: '/images/nutrient1.png',
                    label: '酸碱度 (pH)',
                    value: '5.5'
                },
                {
                    icon: '/images/nutrient2.png',
                    label: '有机质',
                    value: '≥2%'
                },
                {
                    icon: '/images/nutrient3.png',
                    label: '营养元素',
                    value: ''
                },
                {
                    icon: '/images/nutrient4.png',
                    label: '微量元素',
                    value: ''
                },
                {
                    icon: '/images/nutrient5.png',
                    label: '有益微生物',
                    value: ''
                }
            ]
        }
    },
    data() {
        return {
            showPopover: false,
            selectedIndicator: null,
            selectedIndex: -1,
            popoverPosition: {
                top: 0,
                left: 0
            }
        };
    },
    methods: {
        handleIndicatorClick(indicator, index, event) {
            // 阻止事件冒泡，避免触发 handleClickOutside
            event.stopPropagation();

            this.selectedIndicator = indicator;
            this.selectedIndex = index;

            // 所有指标都使用悬浮框
            this.calculatePopoverPosition(event);
            this.showPopover = true;
        },
        calculatePopoverPosition(event) {
            // 查找左侧栏（sidebar）
            const sidebar = document.querySelector('.sidebar-panel--left') ||
                          document.querySelector('.sidebar-panel');

            if (sidebar) {
                const sidebarRect = sidebar.getBoundingClientRect();

                // 悬浮框紧贴左侧栏右边缘
                this.popoverPosition = {
                    top: sidebarRect.top, // 距离顶部一定距离
                    left: sidebarRect.right
                };
            } else {
                // 如果找不到 sidebar，使用默认位置
                const target = event.currentTarget;
                const rect = target.getBoundingClientRect();
                this.popoverPosition = {
                    top: rect.top,
                    left: rect.right
                };
            }
        },
        closePopover() {
            this.showPopover = false;
            this.selectedIndicator = null;
            this.selectedIndex = -1;
        },
        handleClickOutside(event) {
            // 点击悬浮框外部关闭
            if (this.showPopover) {
                const popover = this.$refs.popover;
                if (popover && !popover.contains(event.target)) {
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
.forest-health-wrapper {
    margin-top: 20px;
}

.forest-health-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.forest-health-title {
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 16px;
    font-weight: 500;
    color: #c69c6d;
}

.divider {
    display: block;
    width: 103px;
    height: 3px;
    margin-top: 5px;
    margin-bottom: 15px;
    object-fit: contain;
}

.indicators-box {
    display: flex;
    justify-content: space-between;
    border-radius: 4px;
    background: rgba(4, 31, 29, .3);
    gap: 8px;
}

.indicator-item {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    text-align: center;
    transition: all .3s ease;

    &.clickable {
        cursor: pointer;

        &:hover {
            background: rgba(199, 178, 153, .1);
            border-radius: 4px;
            transform: translateY(-2px);
        }
    }
}

.indicator-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    margin-bottom: 6px;

    img {
        width: 56px;
        height: 56px;
        object-fit: contain;
    }
}

.indicator-info {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.indicator-label {
    margin-bottom: 2px;
    font-family: SourceHanSansCN-Regular, sans-serif;
    font-size: 11px;
    font-weight: 500;
    line-height: 1.2;
    color: #c7b299;
}

.indicator-value {
    font-family: BebasNeueRegular, sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: #c7b299;
}

// 悬浮框样式（通过 Teleport 渲染到 body，不受 scoped 限制）
.popover-container {
    position: fixed;
    z-index: 99999; // 确保在最上层
    background-size: 100% 100%;
    pointer-events: auto;
}

// 趋势图表弹窗 - 可以设置不同的宽高和背景
.popover-trend {
    width: 620px;
    height: 340px;
    padding: 20px 24px;
    background: url("/public/images/forest-right-bg.png") no-repeat;
    background-size: 100% 100%;
}

// 地图分布弹窗 - 可以设置不同的宽高和背景
.popover-distribution {
    width: 137px;
    height: 678px;
    padding-top: 24px;

    background: url("/public/images/forest-right-bg.png") no-repeat;
    background-size: 100% 100%;
}

.popover-close {
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
}

.popover-content {
    width: 100%;
    overflow-y: auto;

    max-height: 700px;
}

// 悬浮框过渡动画
.popover-fade-enter-active,
.popover-fade-leave-active {
    transition: opacity .3s ease, transform .3s ease;
}

.popover-fade-enter-from {
    opacity: 0;
    transform: translate(-50%, -10px);
}

.popover-fade-leave-to {
    opacity: 0;
    transform: translate(-50%, -10px);
}
</style>
