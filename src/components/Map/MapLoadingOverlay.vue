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
    z-index: 1000;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    background: #00000080;
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
    border: 4px solid #ffffff4d;
    border-top-color: #fff;

    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.loading-text {
    margin-top: 15px;
    font-size: 14px;
    color: #fff;
}
</style>
