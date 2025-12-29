<template>
  <div class="chart-panel" :class="panelClass" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <div class="chart-header" :class="headerClass">
      <div>
        <h3>{{ title }}</h3>
        <p v-if="subtitle" class="chart-subtitle">{{ subtitle }}</p>
        <p v-if="description" class="chart-desc">{{ description }}</p>
      </div>
      <slot name="header-extra"></slot>
    </div>

    <!-- 图表标签 -->
    <div v-if="tabs && tabs.length > 0" class="chart-tabs">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        class="tab-btn"
        :class="{ active: selectedTab === index }"
        @click="$emit('tab-change', index)"
      >
        {{ tab }}
      </button>
    </div>

    <!-- 图表内容 -->
    <div class="chart-content">
      <slot name="controls"></slot>
      <div class="chart-display" :style="chartDisplayStyle">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 图表面板容器组件
 *
 * 提供统一的图表面板布局和样式
 * @component ChartPanel
 */
export default {
  name: 'ChartPanel',
  props: {
    /**
     * 面板标题
     */
    title: {
      type: String,
      required: true
    },
    /**
     * 副标题
     */
    subtitle: {
      type: String,
      default: ''
    },
    /**
     * 描述文字
     */
    description: {
      type: String,
      default: ''
    },
    /**
     * 背景图片URL
     */
    backgroundImage: {
      type: String,
      default: ''
    },
    /**
     * 图表显示区域背景图片
     */
    chartBackgroundImage: {
      type: String,
      default: ''
    },
    /**
     * 面板自定义类名
     */
    panelClass: {
      type: String,
      default: ''
    },
    /**
     * 头部自定义类名
     */
    headerClass: {
      type: String,
      default: ''
    },
    /**
     * 标签页数组
     */
    tabs: {
      type: Array,
      default: () => []
    },
    /**
     * 当前选中的标签页索引
     */
    selectedTab: {
      type: Number,
      default: 0
    }
  },
  computed: {
    chartDisplayStyle() {
      return this.chartBackgroundImage
        ? { backgroundImage: `url(${this.chartBackgroundImage})` }
        : {};
    }
  }
};
</script>

<style lang="less" scoped>
.chart-panel {
  box-sizing: border-box;
  padding: 20px;

  color: #c69c6d;
  border-radius: 8px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

.chart-header {
  flex-shrink: 0;
  margin-bottom: 12px;
}

.chart-header h3 {
  margin: 0 0 6px;
  font-family: SourceHanSansCN-Medium;
  font-size: 22px;
  line-height: 1.2;

  color: #c69c6d;
}

.chart-subtitle {
  margin: 0;
  font-family: SourceHanSansCN-Medium;
  font-size: 14px;
  line-height: 1.2;

  color: #c69c6d;
}

.chart-desc {
  margin: 0;
  font-family: SourceHanSansCN-Light;
  font-size: 12px;
  line-height: 1.2;

  color: #4cfceacc;
}

/* 图表标签页 */
.chart-tabs {
  display: flex;
  flex-shrink: 0;
  margin-bottom: 12px;
  gap: 8px;
}

.tab-btn {
  min-width: 60px;
  padding: 5px 12px;
  border: 1px solid #4cfcea4d;
  font-family: SourceHanSansCN-Light;
  font-size: 11px;
  line-height: 1.2;
  text-align: center;

  color: #4cfceacc;
  border-radius: 4px;
  background: #4cfcea1a;
  cursor: pointer;

  &.active {
    border-color: #4cfcea99;
    color: #c69c6d;
    background: #4cfcea40;
  }

  &:hover {
    color: #4cfceae6;
    background: #4cfcea26;
  }
}

/* 图表内容容器 */
.chart-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

/* 图表显示区域 */
.chart-display {
  display: flex;
  flex: 1;
  align-items: stretch;
  justify-content: center;
  min-height: 200px;

  border-radius: 6px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;

  > div {
    width: 100%;
    height: 100%;
  }
}
</style>
