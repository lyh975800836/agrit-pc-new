<template>
  <BaseCard
    :background-image="backgroundImage"
    :size="size"
    :custom-class="`chart-panel ${customClass}`"
    padding="large"
  >
    <template #header>
      <div class="chart-panel__header">
        <div class="chart-panel__title-section">
          <h3 class="chart-panel__title">{{ title }}</h3>
          <p v-if="subtitle" class="chart-panel__subtitle">{{ subtitle }}</p>
          <p v-if="description" class="chart-panel__description">{{ description }}</p>
        </div>

        <div v-if="$slots['header-extra']" class="chart-panel__extra">
          <slot name="header-extra"></slot>
        </div>
      </div>
    </template>

    <!-- 控制区域 -->
    <div v-if="$slots.controls" class="chart-panel__controls">
      <slot name="controls"></slot>
    </div>

    <!-- 图表内容区域 -->
    <div class="chart-panel__content" :style="contentStyles">
      <slot></slot>
    </div>

    <template #footer>
      <div v-if="$slots.footer" class="chart-panel__footer">
        <slot name="footer"></slot>
      </div>
    </template>
  </BaseCard>
</template>

<script>
import BaseCard from './BaseCard.vue';

export default {
    name: 'ChartPanel',
    components: {
        BaseCard
    },

    props: {
    // 标题
        title: {
            type: String,
            required: true
        },

        // 副标题
        subtitle: {
            type: String,
            default: ''
        },

        // 描述
        description: {
            type: String,
            default: ''
        },

        // 背景图片
        backgroundImage: {
            type: String,
            default: ''
        },

        // 图表内容背景图片
        contentBackground: {
            type: String,
            default: ''
        },

        // 面板大小
        size: {
            type: String,
            default: 'large'
        },

        // 自定义类名
        customClass: {
            type: String,
            default: ''
        },

        // 内容区域高度
        contentHeight: {
            type: String,
            default: '250px'
        }
    },

    computed: {
        contentStyles() {
            const styles = {
                height: this.contentHeight
            };

            if (this.contentBackground) {
                styles.backgroundImage = `url(${ this.contentBackground })`;
            }

            return styles;
        }
    }
};
</script>

<style lang="less" scoped>
@import "@/styles/abstracts/index.less";

.chart-panel {
    &__header {
        .flex-row(flex-start, space-between);
        margin-bottom: var(--space-4);
    }

    &__title-section {
        flex: 1;
    }

    &__title {
        .text-preset(var(--font-size-2xl), var(--font-weight-medium));
        margin: 0 0 var(--space-2) 0;
        font-family: "SourceHanSansCN-Medium", var(--font-family-base);
        color: var(--color-primary);
    }

    &__subtitle {
        .text-preset(var(--font-size-base), var(--font-weight-normal));
        margin: 0 0 var(--space-2) 0;
        color: var(--color-primary);
    }

    &__description {
        .text-preset(var(--font-size-sm), var(--font-weight-light));
        margin: 0;
        font-family: "SourceHanSansCN-Light", var(--font-family-base);
        color: var(--color-text-muted);
    }

    &__extra {
        flex-shrink: 0;
        margin-left: var(--space-4);
    }

    &__controls {
        margin-bottom: var(--space-4);
        .flex-row(center, space-between);
    }

    &__content {
        .bg-image-full();
        .flex-center();
        position: relative;
        overflow: hidden;
        border-radius: var(--radius-md);

        // 为图表组件提供定位上下文
        & > * {
            width: 100%;
            height: 100%;
        }
    }

    &__footer {
        margin-top: var(--space-4);
    }
}

// 不同尺寸的适配
.chart-panel.base-card {
    &--small {
        .chart-panel__title {
            font-size: var(--font-size-lg);
        }

        .chart-panel__content {
            height: 200px;
        }
    }

    &--medium {
        .chart-panel__content {
            height: 300px;
        }
    }

    &--large {
        .chart-panel__content {
            height: 350px;
        }
    }
}

// 特殊样式变体
.chart-panel {
    &--price {
        .chart-panel__header {
            .flex-col(stretch, flex-start);

            @media (min-width: 768px) {
                .flex-row(flex-start, space-between);
            }
        }

        .chart-panel__extra {

            @media (min-width: 768px) {
                margin: 0 0 0 var(--space-4);
            }
            margin: var(--space-4) 0 0 0;
        }
    }
}
</style>
