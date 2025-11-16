<template>
  <div class="plot-statistics">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="stat-item"
      :style="{ backgroundImage: `url(${backgroundImage})` }"
    >
      <span class="stat-label">{{ item.label }}</span>
      <span class="stat-value stat-value-large">{{ item.value }}</span>
    </div>
  </div>
</template>

<script>
export default {
    name: 'PlotStatisticsGrid',
    props: {
        items: {
            type: Array,
            required: true
            // [{label: '总面积(亩)：', value: '101'}, ...]
        },
        backgroundImage: {
            type: String,
            required: true
        }
    }
};
</script>

<style lang="less" scoped>
.plot-statistics {
    display: flex;
    justify-content: space-between;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 99px;
    height: 107px;
    padding-top: 26px;
    text-align: center;

    background-size: cover;
}

.stat-label {
    margin-bottom: 10px;
    font-family: SourceHanSansCN-Medium;
    font-size: 11px;
    font-weight: 500;

    color: #c69c6d;
}

.stat-value-large {
    font-family: BebasNeueRegular;
    font-size: 44px;
    line-height: 1;
    color: #c69c6d;
}
</style>
