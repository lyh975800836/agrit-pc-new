<template>
  <!-- 地块详情弹窗 -->
  <div
    v-if="popupData"
    class="plot-detail-popup"
    :style="{ top: popupPosition.top + 'px', left: popupPosition.left + 'px' }"
  >
    <!-- 弹窗关闭按钮 -->
    <button class="popup-close-button" @click="handleClose">
      <span class="close-icon">×</span>
    </button>

    <!-- 弹窗内容 -->
    <div class="popup-content">
      <!-- 信息展示区域 -->
      <div class="popup-info-section">
        <!-- 地块/设施名称 -->
        <h3 class="popup-title">{{ popupData.name }}</h3>

        <!-- 分隔线 -->
        <div class="popup-divider"></div>

        <!-- 地块信息 -->
        <div class="popup-info-item">
          <span class="info-label">区域：</span>
          <span class="info-value">{{ popupData.district || regionName }}</span>
        </div>

        <!-- 面积信息 -->
        <div class="popup-info-item">
          <span class="info-label">面积：</span>
          <span class="info-value">{{ popupData.area || '100' }}亩</span>
        </div>

        <!-- 农户/所有人信息 -->
        <div class="popup-info-item" v-if="popupData.farmerName">
          <span class="info-label">{{ popupData.type === 'warehouse' ? '所有人' : '农户' }}：</span>
          <span class="info-value">{{ popupData.farmerName }}</span>
        </div>
      </div>

      <!-- 图片容器 -->
      <div class="popup-image-container">
        <img
          class="popup-image"
          :src="popupData.photo || '/images/pop-banner.png'"
          :alt="popupData.name"
        />
      </div>

      <!-- 按钮区域 -->
      <div class="popup-button-section">
        <button class="detail-button" @click="handleNavigate">查看详情</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
    name: 'PlotDetailPopup',
    props: {
        popupData: {
            type: Object,
            default: null
        },
        popupPosition: {
            type: Object,
            default: () => ({ top: 0, left: 0 })
        },
        regionName: {
            type: String,
            default: '右江区'
        }
    },
    methods: {
        handleClose() {
            this.$emit('close');
        },
        handleNavigate() {
            this.$emit('navigate', this.popupData);
        }
    }
};
</script>

<style lang="less" scoped>
.plot-detail-popup {
    position: absolute;
    background: rgba(15, 35, 52, 0.95);
    border: 2px solid #c69c6d;
    border-radius: 8px;
    padding: 20px;
    min-width: 280px;
    max-width: 380px;
    z-index: 300;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.popup-close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    color: #c69c6d;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 10;

    &:hover {
        color: #fff;
        transform: scale(1.1);
    }
}

.close-icon {
    display: block;
    line-height: 1;
}

.popup-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.popup-info-section {
    padding-right: 20px;
}

.popup-title {
    color: #c69c6d;
    font-size: 16px;
    font-weight: 500;
    margin: 0 0 8px 0;
    word-break: break-word;
}

.popup-divider {
    height: 1px;
    background: rgba(198, 156, 109, 0.3);
    margin: 8px 0;
}

.popup-info-item {
    display: flex;
    font-size: 12px;
    margin-bottom: 6px;

    .info-label {
        color: rgba(198, 156, 109, 0.7);
        min-width: 60px;
        flex-shrink: 0;
    }

    .info-value {
        color: rgba(198, 156, 109, 1);
        word-break: break-word;
    }
}

.popup-image-container {
    width: 100%;
    height: 140px;
    border-radius: 4px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.3);
}

.popup-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.popup-button-section {
    display: flex;
    justify-content: center;
    gap: 10px;
}

.detail-button {
    background: rgba(198, 156, 109, 0.3);
    border: 1px solid #c69c6d;
    color: #c69c6d;
    padding: 8px 20px;
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
