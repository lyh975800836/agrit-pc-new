<template>
  <!-- 二级地图分类右侧栏 -->
  <div v-if="!isPlotDetailPage" class="category-sidebar" :class="{ 'collapsed': isCollapsed }">
    <!-- 折叠状态：显示展开箭头按钮 -->
    <div v-if="isCollapsed" class="collapsed-content">
      <button class="expand-btn" @click="toggleCollapse" title="展开分类">
        <span class="arrow-icon">❮</span>
      </button>
    </div>

    <!-- 展开状态：显示关闭按钮和分类列表 -->
    <div v-else class="expanded-content">
      <!-- 关闭按钮 -->
      <img class="category-sidebar-close-btn" src="/images/close-btn.png" @click="toggleCollapse" alt="关闭" />

      <!-- 分类列表 -->
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
    data() {
        return {
            isCollapsed: false
        };
    },
    methods: {
        handleCategoryClick(category) {
            this.$emit('category-filter', category);
        },
        toggleCollapse() {
            this.isCollapsed = !this.isCollapsed;
        }
    }
};
</script>

<style lang="less" scoped>
@import "@/styles/abstracts/index.less";

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

.category-sidebar {
    position: absolute;
    z-index: 100;
    top: 0;
    right: 375px;
    box-sizing: border-box;
    border: 1px solid #4cfcea66;

    border-radius: 4px;
    background: #0f2334e6;
    box-shadow: 0 4px 12px #0000004d;
    transition: all .3s ease;

    &.collapsed {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 56px;
        padding: 0;
    }

    &:not(.collapsed) {
        width: 206px;
        padding: 15px 45px;
    }
}

.collapsed-content {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 200px;
}

.expanded-content {
    width: 100%;
}

.expand-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 8px;
    border: none;
    font-size: 24px;

    color: #4cfae8;
    border-radius: 4px;
    background: none;
    transition: all .3s ease;
    cursor: pointer;

    &:hover {
        color: #fff;
        background: #4cfcea1a;
        transform: scale(1.15);
    }
}

.arrow-icon {
    display: block;
    font-weight: bold;
    line-height: 1;
}

.category-sidebar-close-btn {
    position: absolute;
    z-index: 10;
    top: 8px;
    right: 8px;
    width: 20px;
    height: 20px;

    transition: all .2s ease;
    cursor: pointer;

    &:hover {
        opacity: .8;
        transform: scale(1.1);
    }
}

.category-sidebar-list {
    display: flex;
    flex-direction: column;
    gap: 11px;
}

.category-sidebar-btn {
    display: flex;
    overflow: hidden;
    align-items: center;
    height: 33px;
    padding: 10px 12px;
    border: 1px solid #4cfcea33;
    font-family: SourceHanSansCN-Regular;
    font-size: 18px;
    white-space: nowrap;
    text-overflow: ellipsis;

    color: #4cfae8;
    border-radius: 3px;
    background: #4cfcea14;
    transition: all .3s ease;
    cursor: pointer;

    &:hover {
        border-color: #4cfcea99;
        background: #4cfcea26;
    }

    &.active {
        border-color: #4cfceacc;
        color: #4cfae8;
        background: #4cfcea40;
        box-shadow: 0 0 12px #4cfcea66;
    }
}

.category-name {
    overflow: hidden;
    flex: 1;
    text-overflow: ellipsis;
}
</style>
