<template>
  <!-- 地块详情弹窗 -->
  <div
    v-if="popupData"
    class="pdp-wrapper"
    :style="{ top: popupPosition.top + 'px', left: popupPosition.left + 'px' }"
  >
    <!-- 弹窗关闭按钮 -->
    <img class="pdp-close-button" src="/images/close-btn.png" @click="handleClose" alt="关闭" />

    <!-- 弹窗内容 -->
    <div class="pdp-content">
      <!-- 信息展示区域 -->
      <div class="pdp-info-section">
        <!-- 地块/设施名称 -->
        <h3 class="pdp-title">{{ popupData.name }}</h3>

        <!-- 分隔线 -->
        <div class="pdp-divider"></div>

        <!-- 林地所属 (林户/户主) -->
        <div class="pdp-info-item">
          <span class="pdp-info-label">林地所属：</span>
          <span class="pdp-info-value">{{ popupData.farmerName || '未知' }}</span>
        </div>

        <!-- 林地区域 -->
        <div class="pdp-info-item">
          <span class="pdp-info-label">林地区域：</span>
          <span class="pdp-info-value">{{ popupData.district || regionName }}</span>
        </div>

        <!-- 林地面积 -->
        <div class="pdp-info-item">
          <span class="pdp-info-label">林地面积：</span>
          <span class="pdp-info-value">{{ popupData.area || '100' }}亩</span>
        </div>

        <!-- 林地状态 -->
        <div class="pdp-info-item">
          <span class="pdp-info-label">林地状态：</span>
          <span class="pdp-info-value">{{ popupData.status || '丰产林' }}</span>
        </div>
      </div>

      <!-- 图片容器 -->
      <div class="pdp-image-container">
        <img
          class="pdp-image"
          :src="getImageSource()"
          :alt="popupData.name"
        />
      </div>

      <!-- 按钮区域 -->
      <div class="pdp-button-section">
        <button class="pdp-detail-button" @click="handleNavigate">查看详情</button>
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
        },
        getImageSource() {
            // 如果是雷哥的点，使用原有的photo图片
            if (this.popupData && this.popupData.name && this.popupData.name.includes('雷哥')) {
                return this.popupData.photo || '/images/default-cover.png';
            }
            // 其他点都使用默认八角图片
            return '/images/default-cover.png';
        }
    }
};
</script>

<style lang="less" scoped>
@import "@/styles/components/plot-detail-popup.less";
</style>
