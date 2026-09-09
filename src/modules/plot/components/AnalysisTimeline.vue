<template>
  <div v-if="!collapsed" class="analysis-timeline">
    <!-- 年份切换：years 由后端返回且不受年份过滤影响 -->
    <div v-if="showYearSwitch" class="analysis-timeline__years">
      <button
        class="analysis-timeline__year"
        :class="{ 'analysis-timeline__year--active': !activeYear }"
        @click="$emit('year-change', 0)"
      >全部</button>
      <button
        v-for="year in years"
        :key="year"
        class="analysis-timeline__year"
        :class="{ 'analysis-timeline__year--active': activeYear === year }"
        @click="$emit('year-change', year)"
      >{{ year }}</button>
      <span class="analysis-timeline__divider"></span>
    </div>

    <div ref="track" class="analysis-timeline__track">
      <div class="analysis-timeline__inner">
        <span class="analysis-timeline__line"></span>
        <button
          v-for="node in nodes"
          :key="node.analysis_id"
          class="analysis-timeline__node"
          :class="{
            'analysis-timeline__node--active': isActive(node),
            'analysis-timeline__node--loading': isSwitching(node)
          }"
          :title="buildNodeTitle(node)"
          @click="$emit('select', node)"
        >
          <span
            class="analysis-timeline__dot"
            :class="{ 'analysis-timeline__dot--no-tile': !node.has_tile }"
          ></span>
          <span class="analysis-timeline__date">{{ formatPatrolDate(node.detected_at) }}</span>
        </button>
      </div>
    </div>

    <div v-if="!nodes.length" class="analysis-timeline__empty">该年份暂无巡飞记录</div>
  </div>
</template>

<script>
/**
 * 采集日期取字符串前缀解析，避免时区偏移导致跨天
 * 导出给父级复用：收起时开关按钮上要显示当前批次日期
 */
export function formatPatrolDate(detectedAt) {
    const matched = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(detectedAt || ''));
    if (!matched) return '-';
    return `${ Number(matched[2]) }月${ Number(matched[3]) }日`;
}

/**
 * 历史巡飞时间线
 *
 * 节点数据来自 /api/v2/plot-analysis/timeline，已按采集日期 detected_at 升序。
 * 点击节点由父组件用该节点的 analysis_id 重新拉取 summary / tiles-trees，
 * 每个批次有各自独立的底图图层，不能写死图层名。
 *
 * 收起状态由父组件持有：开关按钮挂在 WMTSTileMap 的 controls-extra 插槽里，
 * 和地图筛选栏同处一行整体居中，本组件只负责展开后的轨道。
 *
 * @component AnalysisTimeline
 */
export default {
    name: 'AnalysisTimeline',
    props: {
        /** 批次节点列表（升序） */
        nodes: {
            type: Array,
            default: () => []
        },
        /** 可选年份列表 */
        years: {
            type: Array,
            default: () => []
        },
        /** 当前年份筛选，0 表示全部 */
        activeYear: {
            type: Number,
            default: 0
        },
        /** 当前选中的批次 ID */
        activeAnalysisId: {
            type: [String, Number],
            default: null
        },
        /** 正在切换中的批次 ID */
        switchingId: {
            type: [String, Number],
            default: null
        },
        /** 收起态由父组件持有，收起时整条轨道不渲染 */
        collapsed: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        showYearSwitch() {
            return this.years.length > 1;
        }
    },
    watch: {
        activeAnalysisId() {
            this.scrollActiveIntoView();
        },
        nodes() {
            this.scrollActiveIntoView();
        },
        /** 展开那一刻轨道才进 DOM，得补滚一次把当前批次带到视野里 */
        collapsed() {
            this.scrollActiveIntoView();
        }
    },
    mounted() {
        this.scrollActiveIntoView();
    },
    methods: {
        formatPatrolDate,

        isActive(node) {
            return String(node.analysis_id) === String(this.activeAnalysisId || '');
        },

        isSwitching(node) {
            return String(node.analysis_id) === String(this.switchingId || '');
        },

        buildNodeTitle(node) {
            const parts = [`采集 ${ String(node.detected_at || '').slice(0, 10) || '-' }`];
            if (node.batch_no) parts.push(`批次 ${ node.batch_no }`);
            if (node.total_trees != null) parts.push(`总株数 ${ node.total_trees }`);
            if (node.pest_trees != null) parts.push(`病树 ${ node.pest_trees }`);
            if (node.remark) parts.push(node.remark);
            if (!node.has_tile) parts.push('该批次无专属底图，沿用地块底图');
            return parts.join(' · ');
        },

        scrollActiveIntoView() {
            this.$nextTick(() => {
                const activeNode = this.$refs.track?.querySelector('.analysis-timeline__node--active');
                activeNode?.scrollIntoView({ block: 'nearest', inline: 'center' });
            });
        }
    }
};
</script>

<style lang="less" scoped>
/* 左右浮层面板各占 375px + 20px 边距，再留 15px 呼吸位，得出中间可视区的边界 */
@side-gutter: 410px;

/* 悬浮在地图顶部、居中，正好落在 .map-controls 那一行的下方 */
.analysis-timeline {
    position: absolute;
    top: 42px;
    left: 50%;
    z-index: 15;
    display: flex;
    align-items: flex-start;
    width: min(900px, calc(100% - @side-gutter * 2));
    min-width: 360px;
    padding: 6px 10px 4px;
    border: 1px solid rgba(198, 156, 109, 0.3);
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.65);
    gap: 8px;
    transform: translateX(-50%);
    pointer-events: auto;
    backdrop-filter: blur(4px);
}

.analysis-timeline__years {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    padding-top: 1px;
    gap: 4px;
}

.analysis-timeline__year {
    padding: 2px 8px;
    border: 1px solid rgba(198, 156, 109, 0.4);
    border-radius: 3px;
    font-size: 11px;
    color: rgba(198, 156, 109, 0.7);
    background: transparent;
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
        border-color: #c69c6d;
        color: #c69c6d;
    }
}

.analysis-timeline__year--active {
    border-color: #c69c6d;
    color: #0d2a28;
    background: #c69c6d;
}

.analysis-timeline__divider {
    width: 1px;
    height: 16px;
    margin-left: 4px;
    background: rgba(198, 156, 109, 0.3);
}

.analysis-timeline__track {
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin;

    &::-webkit-scrollbar {
        height: 3px;
    }

    &::-webkit-scrollbar-thumb {
        border-radius: 2px;
        background: rgba(198, 156, 109, 0.35);
    }
}

/* 内层撑开滚动内容宽度，连接线才能贯穿全部节点 */
.analysis-timeline__inner {
    position: relative;
    display: inline-flex;
    align-items: flex-start;
    justify-content: space-between;
    min-width: 100%;
    padding-bottom: 4px;
}

/* 只有一个批次时 space-between 会把它甩到最左边，居中更好看 */
.analysis-timeline__node:first-of-type:last-of-type {
    margin: 0 auto;
}

.analysis-timeline__line {
    position: absolute;
    top: 4px;
    right: 14px;
    left: 14px;
    height: 1px;
    background: rgba(198, 156, 109, 0.3);
}

.analysis-timeline__node {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 0 0 auto;
    padding: 0 10px;
    border: none;
    background: transparent;
    gap: 5px;
    cursor: pointer;

    &:hover .analysis-timeline__date {
        color: #c69c6d;
    }

    &:hover .analysis-timeline__dot {
        border-color: #c69c6d;
    }
}

.analysis-timeline__dot {
    width: 9px;
    height: 9px;
    border: 1px solid rgba(198, 156, 109, 0.6);
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.8);
    transition: all 0.15s;
}

/* 无专属底图的批次：空心虚线，提示会沿用地块底图 */
.analysis-timeline__dot--no-tile {
    border-style: dashed;
    opacity: 0.6;
}

.analysis-timeline__date {
    font-size: 11px;
    line-height: 1;
    color: rgba(198, 156, 109, 0.7);
    white-space: nowrap;
    transition: color 0.15s;
}

.analysis-timeline__node--active {
    .analysis-timeline__dot {
        border-color: #c69c6d;
        background: #c69c6d;
        box-shadow: 0 0 6px rgba(198, 156, 109, 0.8);
    }

    .analysis-timeline__date {
        font-weight: 600;
        color: #c69c6d;
    }
}

.analysis-timeline__node--loading .analysis-timeline__dot {
    animation: timeline-dot-pulse 0.9s ease-in-out infinite;
}

.analysis-timeline__empty {
    flex: 1;
    padding: 4px 0;
    font-size: 11px;
    color: rgba(198, 156, 109, 0.5);
    text-align: center;
}

@keyframes timeline-dot-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
}
</style>
