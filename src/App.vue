<template>
  <div id="app">
    <div class="main-app" :style="appStyles">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
    name: 'App',
    data() {
        return {
            appBackground: '/images/app-background.png'
        };
    },
    computed: {
        appStyles() {
            return {
                backgroundImage: `url(${ this.appBackground })`,
                backgroundPosition: '100%',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover'
            };
        }
    }
};
</script>

<style lang="less">
@import "@/styles/global.less";

#app {
    position: relative;
    overflow: hidden;
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;

    background: #000;
}

.main-app {
    width: 100%;
    height: 100%;
}
</style>
