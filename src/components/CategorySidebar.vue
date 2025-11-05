<template>
  <!-- 二级地图分类右侧栏 -->
  <div v-if="!isPlotDetailPage" class="category-sidebar">
    <div class="category-sidebar-title">分类</div>
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
    top: 20px;
    background: rgba(15, 35, 52, 0.9);
    border: 1px solid rgba(76, 252, 234, 0.4);
    border-radius: 4px;
    max-width: 180px;
    padding: 15px;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.category-sidebar-title {
    color: #c69c6d;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(76, 252, 234, 0.2);
}

.category-sidebar-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.category-sidebar-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border: 1px solid rgba(76, 252, 234, 0.2);
    border-radius: 3px;
    background: rgba(76, 252, 234, 0.08);
    color: #c69c6d;
    font-size: 12px;
    font-family: SourceHanSansCN-Regular;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    img {
        width: 16px;
        height: 16px;
        object-fit: contain;
        flex-shrink: 0;
    }

    &:hover {
        background: rgba(76, 252, 234, 0.15);
        border-color: rgba(76, 252, 234, 0.6);
    }

    &.active {
        background: rgba(76, 252, 234, 0.25);
        border-color: rgba(76, 252, 234, 0.8);
        box-shadow: 0 0 12px rgba(76, 252, 234, 0.4);
        color: #fff;
    }

    &.all-option {
        background: rgba(198, 156, 109, 0.15);
        border-color: rgba(198, 156, 109, 0.4);
        color: rgba(198, 156, 109, 1);

        &.active {
            background: rgba(198, 156, 109, 0.35);
            border-color: rgba(198, 156, 109, 0.8);
            box-shadow: 0 0 12px rgba(198, 156, 109, 0.4);
            color: #fff;
        }

        &:hover {
            background: rgba(198, 156, 109, 0.25);
            border-color: rgba(198, 156, 109, 0.6);
        }
    }
}

.category-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
