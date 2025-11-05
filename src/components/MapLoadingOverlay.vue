<template>
  <div v-if="isLoading" class="loading-overlay">
    <div class="loading-spinner">
      <div class="spinner"></div>
      <div class="loading-text">{{ loadingText }}</div>
    </div>
  </div>
</template>

<script>
export default {
    name: 'MapLoadingOverlay',
    props: {
        isLoading: {
            type: Boolean,
            default: false
        },
        loadingText: {
            type: String,
            default: '加载中...'
        }
    }
};
</script>

<style lang="less" scoped>
.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.loading-text {
    margin-top: 15px;
    color: #fff;
    font-size: 14px;
}
</style>
