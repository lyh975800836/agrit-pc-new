<template>
  <div id="app">
    <div class="screen-container">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    handleResize() {
      const container = document.querySelector('.screen-container')
      if (!container) return
      
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const designWidth = 3840
      const designHeight = 2160
      
      // 计算缩放比例 - 使用最小比例确保内容完全可见
      const scaleX = windowWidth / designWidth
      const scaleY = windowHeight / designHeight
      const scale = Math.min(scaleX, scaleY)
      
      // 计算缩放后的实际尺寸
      const scaledWidth = designWidth * scale
      const scaledHeight = designHeight * scale
      
      // 计算居中偏移
      const offsetX = (windowWidth - scaledWidth) / 2
      const offsetY = (windowHeight - scaledHeight) / 2
      
      // 应用变换
      container.style.transform = `scale(${scale})`
      container.style.transformOrigin = '0 0'
      container.style.left = `${offsetX}px`
      container.style.top = `${offsetY}px`
      
      // 确保容器尺寸正确
      container.style.width = `${designWidth}px`
      container.style.height = `${designHeight}px`
      
    }
  }
}
</script>

<style lang="less">
@import '@/styles/global.less';

#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
  position: relative;
  margin: 0;
  padding: 0;
}

.screen-container {
  position: absolute;
  width: 3840px;
  height: 2160px;
  left: 0;
  top: 0;
  background: transparent;
  /* 确保内容不会超出容器 */
  overflow: hidden;
  /* 添加平滑过渡效果 */
  transition: transform 0.3s ease-in-out;
}

/* 添加最小缩放限制，防止内容过小 */
@media (max-width: 1920px) {
  .screen-container {
    min-width: 1920px;
    min-height: 1080px;
  }
}

/* 针对超宽屏的优化 */
@media (min-aspect-ratio: 21/9) {
  .screen-container {
    /* 超宽屏时可能需要特殊处理 */
  }
}
</style>
