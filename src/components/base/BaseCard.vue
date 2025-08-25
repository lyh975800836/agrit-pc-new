<template>
  <div
    :class="cardClasses"
    :style="cardStyles"
    @click="handleClick"
  >
    <div v-if="$slots.header" class="base-card__header">
      <slot name="header"></slot>
    </div>

    <div class="base-card__body">
      <slot></slot>
    </div>

    <div v-if="$slots.footer" class="base-card__footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
    name: 'BaseCard',
    props: {
    // 背景图片
        backgroundImage: {
            type: String,
            default: ''
        },
        // 卡片大小
        size: {
            type: String,
            default: 'medium',
            validator: value => ['small', 'medium', 'large'].includes(value)
        },
        // 是否可点击
        clickable: {
            type: Boolean,
            default: false
        },
        // 自定义类名
        customClass: {
            type: String,
            default: ''
        },
        // 是否显示边框
        bordered: {
            type: Boolean,
            default: true
        },
        // 内边距大小
        padding: {
            type: String,
            default: 'medium',
            validator: value => ['none', 'small', 'medium', 'large'].includes(value)
        }
    },

    computed: {
        cardClasses() {
            return [
                'base-card',
                `base-card--${ this.size }`,
                `base-card--padding-${ this.padding }`,
                {
                    'base-card--clickable': this.clickable,
                    'base-card--bordered': this.bordered
                },
                this.customClass
            ];
        },

        cardStyles() {
            const styles = {};
            if (this.backgroundImage) {
                styles.backgroundImage = `url(${ this.backgroundImage })`;
            }
            return styles;
        }
    },

    methods: {
        handleClick(event) {
            if (this.clickable) {
                this.$emit('click', event);
            }
        }
    }
};
</script>

<style lang="less" scoped>
@import "@/styles/abstracts/index.less";

.base-card {
    .card();
    .bg-image-full();
    .transition();

    &--small {
        min-height: var(--card-height-sm);
    }

    &--medium {
        min-height: var(--card-height-md);
    }

    &--large {
        min-height: var(--card-height-lg);
    }

    &--padding-none {
        padding: 0;
    }

    &--padding-small {
        padding: var(--space-3);
    }

    &--padding-medium {
        padding: var(--space-4);
    }

    &--padding-large {
        padding: var(--space-6);
    }

    &--clickable {
        cursor: pointer;

        &:hover {
            opacity: .9;
            transform: translateY(-2px);
        }

        &:active {
            transform: translateY(0);
        }
    }

    &--bordered {
        border: 1px solid var(--color-primary);
    }

    &__header {
        margin-bottom: var(--space-4);
    }

    &__body {
        flex: 1;
    }

    &__footer {
        margin-top: var(--space-4);
    }
}
</style>
