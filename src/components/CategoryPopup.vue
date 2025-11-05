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
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 500;
}

.popup-content {
    background: #041f1c;
    border: 1px solid #c69c6d;
    border-radius: 4px;
    padding: 20px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(198, 156, 109, 0.3);

    h3 {
        color: #c69c6d;
        font-size: 16px;
        margin: 0;
        font-weight: 500;
    }
}

.popup-close-btn {
    background: none;
    border: none;
    color: #c69c6d;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.3s ease;

    &:hover {
        color: #fff;
    }
}

.popup-body {
    margin-bottom: 15px;

    p {
        color: rgba(198, 156, 109, 0.8);
        font-size: 13px;
        line-height: 1.6;
        margin: 0 0 10px 0;
    }
}

.popup-stats {
    color: rgba(198, 156, 109, 0.6);
    font-size: 12px;
}

.popup-footer {
    display: flex;
    justify-content: flex-end;
}

.navigate-btn {
    background: rgba(198, 156, 109, 0.3);
    border: 1px solid #c69c6d;
    color: #c69c6d;
    padding: 8px 16px;
    border-radius: 3px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: SourceHanSansCN-Regular;

    &:hover {
        background: rgba(198, 156, 109, 0.5);
        color: #fff;
    }
}
</style>
