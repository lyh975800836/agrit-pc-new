<template>
  <BaseCard
    :background-image="backgroundImage"
    :size="size"
    :custom-class="`stat-card ${customClass}`"
    :clickable="clickable"
    @click="$emit('click', $event)"
  >
    <div class="stat-card__content">
      <div class="stat-card__main">
        <div class="stat-card__number">
          {{ formattedValue }}
        </div>

        <div v-if="showTrend" class="stat-card__trend">
          <div class="stat-card__trend-content">
            <img
              v-if="trendIcon"
              :src="trendIcon"
              :class="['stat-card__trend-icon', trendDirection]"
              alt="trend"
            />
            <span :class="['stat-card__trend-text', trendDirection]">
              {{ trendText }}
            </span>
          </div>
        </div>
      </div>

      <div class="stat-card__info">
        <div class="stat-card__label">
          {{ label }}
        </div>

        <div v-if="description" class="stat-card__description">
          {{ description }}
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script>
import BaseCard from './BaseCard.vue';

export default {
    name: 'StatCard',
    components: {
        BaseCard
    },

    props: {
    // 数值
        value: {
            type: [Number, String],
            required: true
        },

        // 标签
        label: {
            type: String,
            required: true
        },

        // 描述信息
        description: {
            type: String,
            default: ''
        },

        // 背景图片
        backgroundImage: {
            type: String,
            default: ''
        },

        // 卡片大小
        size: {
            type: String,
            default: 'medium'
        },

        // 自定义类名
        customClass: {
            type: String,
            default: ''
        },

        // 是否可点击
        clickable: {
            type: Boolean,
            default: false
        },

        // 数值格式化
        formatter: {
            type: Function,
            default: null
        },

        // 趋势相关
        showTrend: {
            type: Boolean,
            default: false
        },

        trendValue: {
            type: [Number, String],
            default: null
        },

        trendIcon: {
            type: String,
            default: ''
        },

        // 单位
        unit: {
            type: String,
            default: ''
        }
    },

    computed: {
        formattedValue() {
            if (this.formatter && typeof this.formatter === 'function') {
                return this.formatter(this.value);
            }

            // 默认数字格式化
            if (typeof this.value === 'number') {
                return this.value.toLocaleString();
            }

            return this.value;
        },

        trendDirection() {
            if (!this.showTrend || !this.trendValue) {
                return 'neutral';
            }

            const trend = parseFloat(this.trendValue);
            if (trend > 0) {
                return 'up';
            }
            if (trend < 0) {
                return 'down';
            }
            return 'neutral';
        },

        trendText() {
            if (!this.showTrend || !this.trendValue) {
                return '';
            }

            const trend = parseFloat(this.trendValue);
            const prefix = trend > 0 ? '+' : '';
            return `${ prefix }${ trend }%`;
        }
    }
};
</script>

<style lang="less" scoped>
@import "@/styles/abstracts/index.less";

.stat-card {
    &__content {
        .flex-row(center, space-between);
        height: 100%;
    }

    &__main {
        flex: 1;
    }

    &__number {
        .number-display(var(--font-size-4xl));
        margin-bottom: var(--space-2);
    }

    &__trend {
        &-content {
            .flex-row(center, flex-start, var(--space-1));
        }

        &-icon {
            width: 11px;
            height: 20px;

            &.up {
                filter: none;
            }

            &.down {
                transform: rotate(180deg);
            }
        }

        &-text {
            .text-preset(var(--font-size-2xl), var(--font-weight-normal));
            font-family: var(--font-family-number);

            &.up {
                color: var(--color-success);
            }

            &.down {
                color: var(--color-error);
            }

            &.neutral {
                color: var(--color-text-muted);
            }
        }
    }

    &__info {
        .flex-col(flex-end, center);
        text-align: right;
    }

    &__label {
        .text-preset(var(--font-size-base), var(--font-weight-medium));
        font-family: "SourceHanSansCN-Medium", var(--font-family-base);
        white-space: nowrap;
        color: var(--color-primary);
    }

    &__description {
        .text-preset(var(--font-size-sm), var(--font-weight-light));
        margin-top: var(--space-1);
        font-family: "SourceHanSansCN-Light", var(--font-family-base);
        white-space: nowrap;
        color: var(--color-text-muted);
    }
}

// 响应式调整
.stat-card.base-card {
    &--small {
        .stat-card__number {
            .number-display(var(--font-size-3xl));
        }

        .stat-card__trend-text {
            font-size: var(--font-size-lg);
        }

        .stat-card__label {
            font-size: var(--font-size-sm);
        }
    }

    &--large {
        .stat-card__number {
            .number-display(var(--font-size-5xl));
        }

        .stat-card__trend-text {
            font-size: var(--font-size-3xl);
        }

        .stat-card__label {
            font-size: var(--font-size-lg);
        }
    }
}
</style>
