<template>
  <div class="title-wrapper">
    <!-- 装饰线 -->
    <img class="panel-decoration-top" src="/images/decoration-1.jpg" />

    <!-- 地块标题区 -->
    <div class="plot-title-section">
      <h2 class="left-plot-name">{{ plotName }}</h2>
      <img class="region-label" src="/images/region-label.jpg" />
      <span class="region-name">{{ regionName }}</span>
    </div>

    <!-- 分隔线 -->
    <img class="section-divider" src="/images/decoration-2.png" />
  </div>
</template>

<script>
export default {
    name: 'PlotTitleSection',
    props: {
        plotName: {
            type: String,
            required: true
        },
        regionName: {
            type: String,
            required: true
        }
    }
};
</script>

<style lang="less" scoped>
.title-wrapper {
    // 标题区的外层包装
}

.panel-decoration-top {
    width: 100%;
    height: auto;
    margin-bottom: 35px;
    object-fit: fill;
}

.plot-title-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.left-plot-name {
    flex: 1;
    margin: 0;
    font-family: SourceHanSansCN-Medium;
    font-size: 17px;
    font-weight: 500;

    color: #c69c6d;
}

.region-label {
    width: 13px;
    height: 18px;
    margin-right: 9px;
}

.region-name {
    font-family: SourceHanSansCN-Medium;
    font-size: 16px;
    font-weight: 500;
    color: #39b44a;
}

.section-divider {
    width: 160px;
    height: 3px;
    margin: 6px 0 0;
}
</style>
