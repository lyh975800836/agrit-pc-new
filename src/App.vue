<template>
  <div id="app">
    <!-- 开场动画 -->
    <EarthIntro
      v-if="showIntro"
      @intro-transition="handleIntroTransition"
      @intro-completed="handleIntroCompleted"
    />

    <!-- 主应用内容（提前渲染，用透明度过渡） -->
    <div class="main-app" :class="{ 'main-app--visible': mainAppVisible }" :style="appStyles">
      <router-view />
    </div>
  </div>
</template>

<script>
import EarthIntro from '@/components/ThreeD/EarthIntro.vue';

export default {
    name: 'App',
    components: {
        EarthIntro
    },
    data() {
        return {
            showIntro: true, // 默认显示开场动画
            // 使用public目录的图片，这样可以直接引用
            appBackground: '/images/app-background.png',
            mainAppVisible: false
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
    },
    created() {
    // 检查是否需要跳过开场动画（比如通过URL参数）
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('skip-intro') === 'true') {
            this.showIntro = false;
            this.mainAppVisible = true;
        }

        // 在开发环境下可以通过 localStorage 控制是否显示开场动画
        if (process.env.NODE_ENV === 'development') {
            const skipIntro = localStorage.getItem('skip-intro');
            if (skipIntro === 'true') {
                this.showIntro = false;
                this.mainAppVisible = true;
            }
        }
    },
    methods: {
        handleIntroTransition(target) {
            this.mainAppVisible = true;
            if (target) {
                window.__INTRO_TARGET__ = target;
                window.dispatchEvent(new CustomEvent('intro-transition', { detail: target }));
            }
        },
        handleIntroCompleted() {
            // 开场动画完成后，隐藏动画并显示主应用
            this.showIntro = false;
            this.mainAppVisible = true;
            delete window.__INTRO_TARGET__;

            // 可选：记住用户已经看过开场动画
            if (process.env.NODE_ENV === 'development') {
                localStorage.setItem('intro-completed', 'true');
            }
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

    opacity: 0;
    transition: opacity .8s ease;
    pointer-events: none;
}

.main-app--visible {
    opacity: 1;
    pointer-events: auto;
}
</style>
