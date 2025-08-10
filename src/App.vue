<template>
  <div id="app" :style="appStyles">
      <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      // 使用public目录的图片，这样可以直接引用
      appBackground: '/images/app-background.png'
    }
  },
  computed: {
    appStyles() {
      return {
        backgroundImage: `url(${this.appBackground})`,
        backgroundPosition: '100%',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
      }
    }
  }
}
</script>

<style lang="less">
@import '@/styles/global.less';

#app {
  width: 100vw;
  height: 100vh;
  overflow-x: hidden;
  background: #000;
  /* background-image handled by Vue computed styles */
  position: relative;
  margin: 0;
  padding: 0;
}
</style>
