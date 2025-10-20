<template>
  <div v-if="visible" class="farming-detail-dialog-overlay" @click="handleOverlayClick">
    <div class="farming-detail-dialog" :style="dialogStyles" @click.stop>
      <!-- 关闭按钮 -->
      <button class="popup-close-button" @click="handleClose">
        <span class="close-icon">×</span>
      </button>

      <!-- 标题区域 -->
      <div class="dialog-header">
        <div class="header-title">基础开挖:</div>
        <div class="header-content">
          以设计图为准对绿化带,人行道开挖基础,按道路安全作业标准,文明施工挂牌显示标志 防止行人跌入,及时清运渣土。
        </div>
      </div>

      <!-- 施工安全事项标题 -->
      <div class="construction-title">开挖施工安全事项:</div>

      <!-- 图片网格区域 -->
      <div class="images-grid">
        <div class="image-item" v-for="(image, index) in images" :key="index">
          <img :src="image" :alt="`施工图片${index + 1}`" @error="handleImageError" />
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
        }
    },
    data() {
        return {
            // 示例图片 - 使用已存在的占位图片或空图片处理
            images: [
                '/images/comparison-image-1.jpg',
                '/images/comparison-image-2.jpg',
                '/images/comparison-image-1.jpg',
                '/images/comparison-image-2.jpg'
            ]
        };
    },
    computed: {
        dialogStyles() {
            const baseUrl = process.env.BASE_URL || '/';
            return {
                backgroundImage: `url(${ baseUrl }images/farming-detail-dialog.png)`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
            };
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

    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
}

.farming-detail-dialog {
    position: relative;
    width: 713px;
    height: 655px;
    overflow: hidden;
    padding: 23px 50px 33px 44px;
    border-radius: 20px;
    scrollbar-width: none;
    -ms-overflow-style: none;
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
    background: linear-gradient(135deg, #4cfcea 0%, #2dd4bf 100%);
    box-shadow: 0 0 10px rgba(76, 207, 234, 0.5);
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
        background: linear-gradient(135deg, #ffd700 0%, #ffa000 100%);
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
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

    color: #4CFAE8;
}

.header-content {
    font-family: SourceHanSansCN-Regular;
    font-size: 14px;
    line-height: 21px;
    color: #4CFAE8;
}

// 施工安全事项标题
.construction-title {
    margin-bottom: 17px;
    font-family: SourceHanSansCN-Medium;
    font-size: 20px;
    font-weight: 500;

    color: #4CFAE8;
}

// 图片网格
.images-grid {
    display: grid;
    grid-template-columns: repeat(2, 297px);
    gap: 20px;
    justify-content: space-between;
}

.image-item {
    overflow: hidden;
    width: 297px;
    height: 220px;
    border: 1px solid #4ccfea4d;

    border-radius: 6px;
    background: rgba(0, 0, 0, 0.3);

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
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
