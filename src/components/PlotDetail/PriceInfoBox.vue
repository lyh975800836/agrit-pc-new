<template>
  <div class="price-info" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <div class="price-display">
      <span class="price-label">{{ label }}</span>
      <img class="down-arrow" :src="arrowImage" />
      <span class="price-value">{{ value }}</span>
      <span class="price-unit">{{ unit }}</span>
    </div>
  </div>
</template>

<script>
export default {
    name: 'PriceInfoBox',
    props: {
        label: {
            type: String,
            default: '今日价格：'
        },
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
        // 日涨跌幅，正数涨、负数跌、null/0 默认向下
        change: {
            type: Number,
            default: null
        }
    },
    computed: {
        arrowImage() {
            return this.change > 0
                ? '/images/trend-up-arrow.png'
                : '/images/trend-down-arrow.png';
        }
    }
};
</script>

<style lang="less" scoped>
.price-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 315px;
    margin-top: 22px;
    padding: 15px 16px;

    background-size: 100% 100%;
}

.price-display {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 100%;
    text-align: center;

    gap: 8px;
}

.price-label {
    font-family: SourceHanSansCN-Medium;
    font-size: 18px;
    font-weight: 500;
    color: #c69c6d;
}

.down-arrow {
    width: 11px;
    height: 20px;
    margin-right: 13px;
}

.price-value {
    font-family: BebasNeueRegular;
    font-size: 52px;
    line-height: 1;
    color: #c69c6d;
}

.price-unit {
    font-family: SourceHanSansCN-Medium;
    font-size: 18px;
    color: #c69c6d;
}
</style>
