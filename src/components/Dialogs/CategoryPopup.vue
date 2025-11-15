<template>
  <!-- 分类弹窗 -->
  <div v-if="selectedCategory" class="category-popup" @click.self="handleClose">
    <div class="popup-content">
      <div class="popup-header">
        <h3>{{ selectedCategory.name }}</h3>
        <button class="popup-close-btn" @click="handleClose">✕</button>
      </div>
      <div class="popup-body">
        <p>{{ selectedCategory.description }}</p>
        <div class="popup-stats" v-if="selectedCategory.count">
          <span>共 {{ selectedCategory.count }} 个</span>
        </div>
      </div>
      <div class="popup-footer">
        <button class="navigate-btn" @click="handleNavigate">查看详情</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
    name: 'CategoryPopup',
    props: {
        selectedCategory: {
            type: Object,
            default: null
        }
    },
    methods: {
        handleClose() {
            this.$emit('close');
        },
        handleNavigate() {
            this.$emit('navigate', this.selectedCategory);
        }
    }
};
</script>

<style lang="less" scoped>
.category-popup {
    position: fixed;
    z-index: 500;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    background: #00000080;
}

.popup-content {
    width: 90%;
    max-width: 400px;
    padding: 20px;
    border: 1px solid #c69c6d;

    border-radius: 4px;
    background: #041f1c;
    box-shadow: 0 4px 20px #00000080;
}

.popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #c69c6d4d;

    h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
        color: #c69c6d;
    }
}

.popup-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: none;
    font-size: 20px;

    color: #c69c6d;
    background: none;
    transition: color .3s ease;
    cursor: pointer;

    &:hover {
        color: #fff;
    }
}

.popup-body {
    margin-bottom: 15px;

    p {
        margin: 0 0 10px;
        font-size: 13px;
        line-height: 1.6;
        color: #c69c6dcc;
    }
}

.popup-stats {
    font-size: 12px;
    color: #c69c6d99;
}

.popup-footer {
    display: flex;
    justify-content: flex-end;
}

.navigate-btn {
    padding: 8px 16px;
    border: 1px solid #c69c6d;
    font-family: SourceHanSansCN-Regular;
    font-size: 12px;

    color: #c69c6d;
    border-radius: 3px;
    background: #c69c6d4d;
    transition: all .3s ease;
    cursor: pointer;

    &:hover {
        color: #fff;
        background: #c69c6d80;
    }
}
</style>
