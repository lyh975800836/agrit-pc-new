<template>
  <!-- 二级地图分类右侧栏 -->
  <div v-if="!isPlotDetailPage" class="category-sidebar">
    <div class="category-sidebar-list">
      <button
        v-for="(category, index) in categories"
        :key="index"
        class="category-sidebar-btn"
        :class="{ 'all-option': category.isAllOption, 'active': selectedCategoryType === category.type }"
        :title="category.name"
        @click="handleCategoryClick(category)"
      >
        <span class="category-name">{{ category.name }}</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
    name: 'CategorySidebar',
    props: {
        categories: {
            type: Array,
            required: true
        },
        selectedCategoryType: {
            type: String,
            default: 'all'
        },
        isPlotDetailPage: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        handleCategoryClick(category) {
            this.$emit('category-filter', category);
        }
    }
};
</script>

<style lang="less" scoped>
@import "@/styles/abstracts/index.less";

.category-sidebar {
    position: absolute;
    right: 375px;
    top: 0;
    background: rgba(15, 35, 52, 0.9);
    border: 1px solid rgba(76, 252, 234, 0.4);
    border-radius: 4px;
    width: 206px;
    padding: 15px 45px;
    z-index: 100;
    box-sizing: border-box;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.category-sidebar-list {
    display: flex;
    flex-direction: column;
    gap: 11px;
}

.category-sidebar-btn {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    border: 1px solid rgba(76, 252, 234, 0.2);
    border-radius: 3px;
    background: rgba(76, 252, 234, 0.08);
    color: #4CFAE8;
    font-size: 18px;
    font-family: SourceHanSansCN-Regular;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 33px;

    &:hover {
        background: rgba(76, 252, 234, 0.15);
        border-color: rgba(76, 252, 234, 0.6);
    }

    &.active {
        background: rgba(76, 252, 234, 0.25);
        border-color: rgba(76, 252, 234, 0.8);
        box-shadow: 0 0 12px rgba(76, 252, 234, 0.4);
        color: #4CFAE8;
    }
}

.category-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 响应式调整 - 分类右侧栏 */
@media (max-width: 768px) {
    .category-sidebar {
        top: 10px;
        right: 10px;
        max-width: 160px;
        padding: 12px 10px;
    }

    .category-sidebar-btn {
        padding: 6px 8px;
        font-size: 11px;
    }

    .category-sidebar-btn img {
        width: 24px;
        height: 24px;
    }
}
</style>
