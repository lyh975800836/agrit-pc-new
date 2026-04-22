<template>
  <div class="price-info" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <!-- 左侧品类选择 -->
    <div class="price-categories">
      <div
        v-for="cat in categories"
        :key="cat.key"
        class="price-category"
        :class="{ 'is-active': activeCategory === cat.key }"
        @click="selectCategory(cat.key)"
      >
        {{ cat.label }}
      </div>
    </div>

    <!-- 右侧价格展示 -->
    <div class="price-display">
      <span class="price-label">今日价格</span>
      <div class="price-value-row">
        <span class="price-value">{{ value }}</span>
        <div class="price-trend">
          <img class="trend-arrow" :src="arrowImage" />
          <span class="price-unit">{{ unit }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
    name: 'PriceInfoBox',
    props: {
        value: {
            type: String,
            required: true
        },
        unit: {
            type: String,
            default: '元/斤'
        },
        backgroundImage: {
            type: String,
            required: true
        },
        change: {
            type: Number,
            default: null
        },
        categories: {
            type: Array,
            default: () => [
                { key: 'fresh', label: '生果' },
                { key: 'dry', label: '干枝果' },
                { key: 'premium', label: '大红八角' },
                { key: 'mixed', label: '统货' }
            ]
        },
        defaultCategory: {
            type: String,
            default: 'fresh'
        }
    },
    emits: ['category-change'],
    data() {
        return {
            activeCategory: this.defaultCategory
        };
    },
    computed: {
        arrowImage() {
            return this.change > 0
                ? '/images/trend-up-arrow.png'
                : '/images/trend-down-arrow.png';
        }
    },
    methods: {
        selectCategory(key) {
            this.activeCategory = key;
            this.$emit('category-change', key);
        }
    }
};
</script>

<style lang="less" scoped>
.price-info {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 315px;
    min-height: 100px;
    padding: 14px 16px;
    background-size: 100% 100%;
    gap: 12px;
}

/* 左侧品类 */
.price-categories {
    display: grid;
    grid-template-columns: 1fr 1fr;
    flex-shrink: 0;
    gap: 6px;
}

.price-category {
    padding: 5px 8px;
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 12px;
    font-weight: 500;
    text-align: center;
    color: #c69c6d;
    border: 1px solid #c69c6d33;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;

    &.is-active {
        color: #041f1d;
        background: #c69c6d;
        border-color: #c69c6d;
    }
}

/* 右侧价格 */
.price-display {
    display: flex;
    flex: 1;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.price-label {
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: #c69c6d;
    writing-mode: vertical-rl;
    text-orientation: upright;
    letter-spacing: 4px;
}

.price-value-row {
    display: flex;
    align-items: center;
    gap: 4px;
}

.price-value {
    font-family: BebasNeueRegular, sans-serif;
    font-size: 72px;
    line-height: 72px;
    color: #c69c6d;
}

.price-trend {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}

.trend-arrow {
    width: 11px;
    height: 18px;
    object-fit: contain;
}

.price-unit {
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 12px;
    color: #c69c6d;
}
</style>
