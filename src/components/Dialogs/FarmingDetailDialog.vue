<template>
  <div v-if="visible" class="farming-detail-dialog-overlay" @click="handleOverlayClick">
    <div class="farming-detail-dialog" :style="dialogStyles" @click.stop>
      <!-- 关闭按钮 -->
      <button class="popup-close-button" @click="handleClose">
        <span class="close-icon">×</span>
      </button>

      <!-- 标题区域 -->
      <div class="dialog-header">
        <div class="header-title">{{ title }}</div>
        <div class="header-content">{{ content }}</div>
      </div>

      <!-- 图片网格区域 -->
      <div v-if="images && images.length > 0" class="images-section">
        <div class="images-title">{{ imagesTitle }}</div>
        <div class="images-grid">
          <div class="image-item" v-for="(image, index) in images" :key="index">
            <img :src="image" :alt="`施工图片${index + 1}`" @error="handleImageError" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
    name: 'FarmingDetailDialog',
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        farmingItem: {
            type: Object,
            default: null
        },
        // 对话框标题
        title: {
            type: String,
            default: '农事详情'
        },
        // 对话框内容
        content: {
            type: String,
            default: '请提供具体的农事操作描述'
        },
        // 图片列表
        images: {
            type: Array,
            default: () => []
        },
        // 图片标题
        imagesTitle: {
            type: String,
            default: '相关图片'
        },
        // 背景图片（可选）
        backgroundImage: {
            type: String,
            default: null
        }
    },
    computed: {
        dialogStyles() {
            const styles = {
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
            };

            if (this.backgroundImage) {
                styles.backgroundImage = `url(${ this.backgroundImage })`;
            }

            return styles;
        },
        // 从farmingItem中动态生成标题和内容
        computedTitle() {
            if (this.farmingItem && this.farmingItem.name) {
                return this.farmingItem.name;
            }
            return this.title;
        },
        computedContent() {
            if (this.farmingItem && this.farmingItem.description) {
                return this.farmingItem.description;
            }
            return this.content;
        }
    },
    methods: {
        handleClose() {
            this.$emit('close');
        },
        handleOverlayClick() {
            this.handleClose();
        },
        handleImageError(event) {
            // 如果图片加载失败，使用占位图或隐藏图片
            event.target.style.display = 'none';
        }
    }
};
</script>

<style lang="less" scoped>
.farming-detail-dialog-overlay {
    position: fixed;
    z-index: 9999;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    background: #000000b3;

    backdrop-filter: blur(4px);
}

.farming-detail-dialog {
    position: relative;
    overflow: hidden;
    width: 713px;
    height: 655px;
    padding: 23px 50px 33px 44px;

    -ms-overflow-style: none;
    scrollbar-width: none;
}

// 关闭按钮
.popup-close-button {
    position: absolute;
    z-index: 10;
    top: 15px;
    right: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;

    border-radius: 50%;
    background: #c69c6d;
    transition: all .3s ease;
    cursor: pointer;

    &:hover {
        background: linear-gradient(135deg, #ffd700 0%, #ffa000 100%);
        box-shadow: 0 0 15px #ffd70099;
        transform: scale(1.1);
    }
}

.close-icon {
    font-size: 18px;
    font-weight: bold;
    line-height: 1;
    color: #0a1420;
}

// 标题区域
.dialog-header {
    margin-bottom: 30px;
}

.header-title {
    margin-bottom: 12px;
    font-family: SourceHanSansCN-Medium;
    font-size: 20px;
    font-weight: 500;

    color: #c69c6d;
}

.header-content {
    font-family: SourceHanSansCN-Regular;
    font-size: 14px;
    line-height: 21px;
    color: #c69c6d;
}

// 图片部分
.images-section {
    margin-top: 30px;
}

.images-title {
    margin-bottom: 17px;
    font-family: SourceHanSansCN-Medium;
    font-size: 20px;
    font-weight: 500;

    color: #c69c6d;
}

// 图片网格
.images-grid {
    display: grid;
    justify-content: space-between;
    grid-template-columns: repeat(2, 297px);
    gap: 20px;
}

.image-item {
    overflow: hidden;
    width: 297px;
    height: 220px;
    border: 1px solid #4ccfea4d;

    border-radius: 6px;
    background: #0000004d;

    img {
        width: 100%;
        height: 100%;
        transition: transform .3s ease;
        object-fit: cover;
    }

    &:hover img {
        transform: scale(1.05);
    }
}

// 滚动条样式
.farming-detail-dialog::-webkit-scrollbar {
    display: none;
}
</style>
