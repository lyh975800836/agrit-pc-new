<template>
  <div class="earth-intro" :class="{ 'fade-out': isCompleted }" :data-step="currentStep">
    <!-- 使用Three.js库的3D地球 -->
    <div class="earth-scene" :class="{ 'zoom-in': currentStep >= 2, 'focus-china': currentStep >= 3 }">
      <div id="earth-container" ref="earthContainer"></div>

      <!-- 科技感扫描效果 -->
      <div class="scan-lines" :class="{ 'active': currentStep >= 5 }">
        <div class="scan-line" v-for="i in 5" :key="i" :style="{ animationDelay: i * 0.2 + 's' }"></div>
      </div>

      <!-- 下钻提示文字 -->
      <div class="drill-hint" :class="{ 'visible': currentStep >= 5 }">
        <div class="drill-text">正在进入百色林业示范区...</div>
        <div class="loading-bar">
          <div class="loading-progress"></div>
        </div>
      </div>
    </div>

    <!-- 标题和描述 -->
    <div class="intro-content" :class="{ 'visible': showContent }">
      <div class="intro-title">八角数字林业示范区</div>
      <div class="intro-subtitle">智慧林业管理平台</div>
      <div class="intro-location">广西壮族自治区 · 百色市</div>
    </div>

    <!-- 背景星空 -->
    <div class="stars"></div>

    <!-- 流星效果 -->
    <div class="meteors">
      <div class="meteor" v-for="n in 3" :key="n" :style="{ animationDelay: n * 2 + 's' }"></div>
    </div>

    <!-- 跳过提示 -->
    <div class="skip-hint" :class="{ 'visible': currentStep >= 1 && currentStep < 5 }">
      按 ESC 或空格键跳过动画
    </div>
  </div>
</template>

<script>
import * as THREE from 'three';

const EARTH_TEXTURE_URL = `${ process.env.BASE_URL }images/earth_atmos_2048.jpg`;
const CLOUD_TEXTURE_URL = `${ process.env.BASE_URL }images/earth_clouds.png`;

export default {
    name: 'EarthIntro',
    data() {
        return {
            showContent: false,
            isCompleted: false,
            currentStep: 0,
            animationTimer: null,
            earth: null,
            clouds: null,
            particleSystem: null,
            scene: null,
            camera: null,
            renderer: null,
            autoRotate: true,
            sequenceCancelled: false
        };
    },
    mounted() {
        this.$nextTick(() => {
            this.createStars();
            this.initThreeJSEarth();
            this.startIntroSequence();
        });

        document.addEventListener('keydown', this.handleKeyPress);
    },
    beforeDestroy() {
        if (this.animationTimer) {
            clearTimeout(this.animationTimer);
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
        document.removeEventListener('keydown', this.handleKeyPress);
    },
    methods: {
        createStars() {
            const starsContainer = this.$el.querySelector('.stars');
            if (!starsContainer) {
                // eslint-disable-next-line no-console
                console.warn('Stars container not found');
                return;
            }

            for (let i = 0; i < 200; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                star.style.left = `${ Math.random() * 100 }%`;
                star.style.top = `${ Math.random() * 100 }%`;
                star.style.animationDelay = `${ Math.random() * 3 }s`;
                star.style.animationDuration = `${ 2 + Math.random() * 2 }s`;
                starsContainer.appendChild(star);
            }
        },

        async initThreeJSEarth() {
            const container = this.$refs.earthContainer;
            if (!container) {
                return;
            }

            this.scene = new THREE.Scene();

            this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
            this.camera.position.z = 2;
            this.camera.lookAt(0, 0, 0);

            this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            this.renderer.setSize(400, 400);
            this.renderer.setClearColor(0x000000, 0);
            container.appendChild(this.renderer.domElement);

            const geometry = new THREE.SphereGeometry(1, 64, 64);
            const material = new THREE.MeshPhongMaterial({
                shininess: 100,
                transparent: false,
                color: 0xffffff,
                side: THREE.FrontSide
            });

            this.earth = new THREE.Mesh(geometry, material);
            this.scene.add(this.earth);

            const cloudGeometry = new THREE.SphereGeometry(1.01, 64, 64);
            const cloudMaterial = new THREE.MeshPhongMaterial({
                transparent: true,
                opacity: 0.25,
                color: 0xffffff,
                side: THREE.FrontSide,
                blending: THREE.AdditiveBlending
            });
            this.clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
            this.scene.add(this.clouds);

            const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
            this.scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
            directionalLight.position.set(1, 1, 1);
            directionalLight.castShadow = true;
            this.scene.add(directionalLight);

            const backLight = new THREE.DirectionalLight(0x87ceeb, 0.3);
            backLight.position.set(-1, 0, -1);
            this.scene.add(backLight);

            await this.preloadTextures(material, cloudMaterial);
            this.animate();
        },

        preloadTextures(earthMaterial, cloudMaterial) {
            const loader = new THREE.TextureLoader();

            const earthPromise = this.loadTexture(loader, EARTH_TEXTURE_URL)
                .catch(error => {
                    // eslint-disable-next-line no-console
                    console.warn(`地球贴图加载失败，使用兜底纹理: ${ error.message }`);
                    return this.createEarthTexture();
                })
                .then(texture => {
                    if (texture) {
                        texture.anisotropy = this.renderer ? this.renderer.capabilities.getMaxAnisotropy() : 1;
                        earthMaterial.map = texture;
                        earthMaterial.needsUpdate = true;
                    }
                });

            const cloudPromise = this.loadTexture(loader, CLOUD_TEXTURE_URL)
                .catch(error => {
                    // eslint-disable-next-line no-console
                    console.warn(`云层贴图加载失败，使用兜底纹理: ${ error.message }`);
                    return this.createCloudTexture();
                })
                .then(texture => {
                    if (texture) {
                        texture.anisotropy = this.renderer ? this.renderer.capabilities.getMaxAnisotropy() : 1;
                        cloudMaterial.map = texture;
                        cloudMaterial.needsUpdate = true;
                    }
                });

            return Promise.all([earthPromise, cloudPromise]);
        },

        loadTexture(loader, source) {
            return new Promise((resolve, reject) => {
                loader.load(source, resolve, undefined, reject);
            });
        },

        createEarthTexture() {
            const width = 1024;
            const height = 512;
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return null;
            }

            const oceanGradient = ctx.createLinearGradient(0, 0, 0, height);
            oceanGradient.addColorStop(0, '#0b3d91');
            oceanGradient.addColorStop(0.5, '#0f5cab');
            oceanGradient.addColorStop(1, '#0a2a6b');
            ctx.fillStyle = oceanGradient;
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = '#2f9e44';
            ctx.globalAlpha = 0.95;
            ctx.beginPath();
            ctx.moveTo(width * 0.18, height * 0.55);
            ctx.bezierCurveTo(width * 0.25, height * 0.35, width * 0.42, height * 0.32, width * 0.48, height * 0.48);
            ctx.bezierCurveTo(width * 0.52, height * 0.65, width * 0.46, height * 0.78, width * 0.30, height * 0.72);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(width * 0.62, height * 0.42);
            ctx.bezierCurveTo(width * 0.72, height * 0.28, width * 0.88, height * 0.34, width * 0.86, height * 0.52);
            ctx.bezierCurveTo(width * 0.84, height * 0.68, width * 0.68, height * 0.72, width * 0.64, height * 0.58);
            ctx.closePath();
            ctx.fill();

            ctx.globalAlpha = 0.2;
            ctx.fillStyle = '#144d27';
            for (let i = 0; i < 1200; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const radius = Math.random() * 3 + 1;
                ctx.beginPath();
                ctx.ellipse(x, y, radius * 1.2, radius, Math.random() * Math.PI, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalAlpha = 1;
            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;
            texture.anisotropy = this.renderer ? this.renderer.capabilities.getMaxAnisotropy() : 1;
            return texture;
        },

        createCloudTexture() {
            const size = 512;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return null;
            }

            ctx.clearRect(0, 0, size, size);
            for (let i = 0; i < 400; i++) {
                const x = Math.random() * size;
                const y = Math.random() * size;
                const radius = Math.random() * 40 + 10;
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            }

            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;
            texture.anisotropy = this.renderer ? this.renderer.capabilities.getMaxAnisotropy() : 1;
            return texture;
        },

        animate() {
            if (!this.renderer || !this.scene || !this.camera) {
                return;
            }

            requestAnimationFrame(() => this.animate());

            if (this.earth && this.currentStep >= 1 && this.currentStep < 5 && this.autoRotate) {
                this.earth.rotation.y += 0.005;
            }

            if (this.clouds && this.currentStep >= 1 && this.currentStep < 5) {
                this.clouds.rotation.y += 0.003;
                this.clouds.rotation.x += 0.001;
            }

            if (this.particleSystem && this.currentStep >= 5) {
                this.animateParticles();
            }

            this.renderer.render(this.scene, this.camera);
        },

        async startIntroSequence() {
            await this.delay(500);
            if (this.sequenceCancelled) {
                return;
            }

            this.currentStep = 1;
            await this.delay(2000);
            if (this.sequenceCancelled) {
                return;
            }

            this.showContent = true;
            await this.delay(1500);
            if (this.sequenceCancelled) {
                return;
            }

            this.currentStep = 2;
            await this.delay(1500);
            if (this.sequenceCancelled) {
                return;
            }

            this.currentStep = 3;
            this.autoRotate = false;
            await this.delay(800);
            if (this.sequenceCancelled) {
                return;
            }

            await this.drillDownToMap();
        },

        async drillDownToMap() {
            if (this.sequenceCancelled) {
                return;
            }
            this.currentStep = 5;
            this.autoRotate = false;

            this.$emit('intro-transition', {
                lat: 23.9,
                lon: 106.6,
                zoom: 7.5
            });

            await this.zoomToBaise();
            this.addParticleEffect();
            await this.transitionToMap();

            this.isCompleted = true;
            await this.delay(1000);
            this.$emit('intro-completed');
        },

        async zoomToBaise() {
            return new Promise(resolve => {
                const startScale = this.earth ? this.earth.scale.x : 1;
                const targetScale = 5;
                const duration = 2000;
                const startTime = Date.now();
                const startCameraZ = this.camera ? this.camera.position.z : 2;
                const targetCameraZ = 0.5;

                const animateZoom = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeProgress = 1 - Math.pow(1 - progress, 3);

                    const currentScale = startScale + (targetScale - startScale) * easeProgress;
                    if (this.earth) {
                        this.earth.scale.set(currentScale, currentScale, currentScale);
                    }

                    this.camera.position.z = startCameraZ + (targetCameraZ - startCameraZ) * easeProgress;

                    if (this.sequenceCancelled) {
                        resolve();
                        return;
                    }

                    if (progress < 1) {
                        requestAnimationFrame(animateZoom);
                    }
                    else {
                        resolve();
                    }
                };

                animateZoom();
            });
        },

        addParticleEffect() {
            const particleCount = 1000;
            const particles = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);

            for (let i = 0; i < particleCount * 3; i += 3) {
                positions[i] = (Math.random() - 0.5) * 10;
                positions[i + 1] = (Math.random() - 0.5) * 10;
                positions[i + 2] = (Math.random() - 0.5) * 10;
            }

            particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            const particleMaterial = new THREE.PointsMaterial({
                color: 0x4cfcea,
                size: 0.05,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });

            this.particleSystem = new THREE.Points(particles, particleMaterial);
            this.scene.add(this.particleSystem);
            this.animateParticles();
        },

        animateParticles() {
            if (!this.particleSystem) {
                return;
            }

            const positions = this.particleSystem.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] -= 0.02;
                if (positions[i + 1] < -5) {
                    positions[i + 1] = 5;
                }
            }
            this.particleSystem.geometry.attributes.position.needsUpdate = true;
            this.particleSystem.rotation.y += 0.01;
        },

        async transitionToMap() {
            return new Promise(resolve => {
                const duration = 1500;
                const startTime = Date.now();

                const animateFade = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    if (this.earth && this.earth.material) {
                        this.earth.material.opacity = 1 - progress;
                        this.earth.material.transparent = true;
                    }

                    if (this.clouds && this.clouds.material) {
                        this.clouds.material.opacity = 0.3 * (1 - progress);
                    }

                    if (this.particleSystem && this.particleSystem.material) {
                        this.particleSystem.material.opacity = progress;
                    }

                    if (this.sequenceCancelled) {
                        resolve();
                        return;
                    }

                    if (progress < 1) {
                        requestAnimationFrame(animateFade);
                    }
                    else {
                        resolve();
                    }
                };

                animateFade();
            });
        },

        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        handleKeyPress(event) {
            if (event.key === 'Escape' || event.key === ' ') {
                event.preventDefault();
                this.skipAnimation();
            }
        },

        skipAnimation() {
            this.sequenceCancelled = true;
            this.currentStep = 5;
            this.showContent = true;
            this.autoRotate = false;

            setTimeout(() => {
                this.isCompleted = true;
                setTimeout(() => {
                    this.$emit('intro-completed');
                }, 500);
            }, 500);
        }
    }
};
</script>

<style lang="less" scoped>
// 地球自转动画 - 添加微妙的上下晃动
@keyframes earthRotation {
    0% {
        transform: rotateY(0deg) rotateX(0deg);
    }

    25% {
        transform: rotateY(90deg) rotateX(1deg);
    }

    50% {
        transform: rotateY(180deg) rotateX(0deg);
    }

    75% {
        transform: rotateY(270deg) rotateX(-1deg);
    }

    100% {
        transform: rotateY(360deg) rotateX(0deg);
    }
}

// 添加光照变化效果
@keyframes lightChange {
    0% {
        background:
            radial-gradient(ellipse 80% 60% at 25% 25%, #87ceebcc 0%, transparent 50%),
            radial-gradient(ellipse 60% 80% at 20% 30%, #ffffff4d 0%, transparent 30%),
            radial-gradient(circle at 30% 30%, #87ceeb 0%, #4682b4 25%, #1e3a8a 50%, #0f1419 75%, #000 100%);
    }

    50% {
        background:
            radial-gradient(ellipse 80% 60% at 75% 25%, #87ceeb99 0%, transparent 50%),
            radial-gradient(ellipse 60% 80% at 80% 30%, #fff3 0%, transparent 30%),
            radial-gradient(circle at 70% 30%, #87ceeb 0%, #4682b4 25%, #1e3a8a 50%, #0f1419 75%, #000 100%);
    }

    100% {
        background:
            radial-gradient(ellipse 80% 60% at 25% 25%, #87ceebcc 0%, transparent 50%),
            radial-gradient(ellipse 60% 80% at 20% 30%, #ffffff4d 0%, transparent 30%),
            radial-gradient(circle at 30% 30%, #87ceeb 0%, #4682b4 25%, #1e3a8a 50%, #0f1419 75%, #000 100%);
    }
}

// 海洋波光粼粼动画
@keyframes oceanShimmer {
    0% {
        opacity: .8;
        transform: rotate(0deg);
    }

    33% {
        opacity: .9;
        transform: rotate(120deg);
    }

    66% {
        opacity: .7;
        transform: rotate(240deg);
    }

    100% {
        opacity: .8;
        transform: rotate(360deg);
    }
}

// 云层漂移动画
@keyframes cloudDrift {
    0% {
        opacity: .6;
        transform: rotate(0deg);
    }

    50% {
        opacity: .8;
    }

    100% {
        opacity: .6;
        transform: rotate(360deg);
    }
}
@keyframes atmosphereGlow {
    0% {
        opacity: .3;
        transform: scale(1);
    }

    100% {
        opacity: .7;
        transform: scale(1.02);
    }
}
@keyframes titleGlow {
    0% {
        text-shadow: 0 0 30px #4cfcea4d;
    }

    100% {
        text-shadow: 0 0 50px #4cfcea80, 0 0 70px #39b44a4d;
    }
}
@keyframes twinkle {
    0%,
    100% {
        opacity: .3;
        transform: scale(1);
    }

    50% {
        opacity: 1;
        transform: scale(1.2);
    }
}
@keyframes meteorFall {
    0% {
        opacity: 1;
        box-shadow: 0 0 10px #4cfcea;
        transform: translateX(0) translateY(0);
    }

    100% {
        opacity: 0;
        box-shadow: 0 0 50px #4cfcea;
        transform: translateX(-300px) translateY(300px);
    }
}
@keyframes finalFlyIn {
    0% {
        opacity: 1;
        transform: scale(1.8);
    }

    100% {
        opacity: 0;
        transform: scale(5);
    }
}
@keyframes scanMove {
    0% {
        opacity: 0;
        transform: translateX(-100%);
    }

    20% {
        opacity: 1;
    }

    80% {
        opacity: 1;
    }

    100% {
        opacity: 0;
        transform: translateX(100%);
    }
}
@keyframes scanRotate {
    0% {
        opacity: 0;
        transform: rotate(0deg) translateX(-50%);
    }

    20% {
        opacity: 1;
    }

    80% {
        opacity: 1;
    }

    100% {
        opacity: 0;
        transform: rotate(360deg) translateX(-50%);
    }
}
@keyframes loadingProgress {
    0% {
        width: 0%;
    }

    50% {
        width: 100%;
    }

    100% {
        width: 0%;
    }
}
@keyframes drillPulse {
    0% {
        transform: translateX(-50%) scale(1);
    }

    50% {
        transform: translateX(-50%) scale(1.05);
    }

    100% {
        transform: translateX(-50%) scale(1);
    }
}
@keyframes borderGlow {
    0% {
        opacity: 0;
    }

    50% {
        opacity: .8;
    }

    100% {
        opacity: 0;
    }
}

// 响应式设计
@media (max-width: 768px) {
    .earth-scene {
        width: 280px;
        height: 280px;
    }

    .skip-hint {
        right: 20px;
        bottom: 20px;
        padding: 6px 12px;
        font-size: 12px;
    }

    .intro-title {
        font-size: 32px;
    }

    .intro-subtitle {
        font-size: 18px;
    }

    .intro-location {
        font-size: 14px;
    }

    .start-button {
        padding: 12px 30px;
    }

    .button-content {
        font-size: 14px;
    }
}

.earth-intro {
    position: fixed;
    z-index: 9999;
    top: 0;
    left: 0;
    overflow: hidden;
    width: 100%;
    height: 100%;

    background: radial-gradient(ellipse at center, #1a1a2e 0%, #0c0c0c 70%, #000 100%);
    transition: opacity 1s ease-out;

    &.fade-out {
        opacity: 0;
        pointer-events: none;
    }
}

// 地球场景容器
.earth-scene {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 400px;
    height: 400px;

    transition: transform 3s cubic-bezier(.25, .46, .45, .94);
    transform: translate(-50%, -50%);

    perspective: 1000px;

    &.zoom-in {
        transform: translate(-50%, -50%) scale(1.5);
    }

    &.focus-china {
        transform: translate(-50%, -50%) scale(2.2);
    }
}

// Three.js 地球容器
#earth-container {
    position: relative;
    width: 100%;
    height: 100%;

    canvas {
        border-radius: 50%;
        box-shadow:
            0 0 50px #87ceeb4d,
            0 0 100px #87ceeb1a,
            0 20px 40px #0006;
    }
}

// 地球表面 - 简化设计，不干扰主体3D效果
.earth-surface {
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    width: 100%;
    height: 100%;

    opacity: .5;
    border-radius: 50%;

    // 简单的地表纹理，低透明度避免干扰主体阴影
    background:
        radial-gradient(ellipse at 70% 30%, #228b2226 0%, transparent 50%),
        radial-gradient(ellipse at 30% 70%, #8b45131a 0%, transparent 40%);
}

// 大陆样式 - 简化设计，避免与主体阴影冲突
.continent {
    position: absolute;

    opacity: .6;
    border-radius: 50px;
    background: #228b2266;
    transition: all 2s ease;

    &.asia {
        top: 100px;
        right: 60px;
        width: 120px;
        height: 80px;

        border-radius: 60px 40px 70px 30px;
        transform: rotate(-15deg);
    }

    &.africa {
        top: 140px;
        left: 160px;
        width: 60px;
        height: 100px;

        border-radius: 30px 50px 40px 20px;
        transform: rotate(10deg);
    }

    &.europe {
        top: 80px;
        left: 140px;
        width: 50px;
        height: 40px;

        border-radius: 25px 35px 15px 20px;
        transform: rotate(-5deg);
    }

    &.north-america {
        top: 70px;
        left: 40px;
        width: 70px;
        height: 90px;

        border-radius: 35px 25px 40px 30px;
        transform: rotate(5deg);
    }

    &.south-america {
        top: 180px;
        left: 70px;
        width: 40px;
        height: 80px;

        border-radius: 20px 30px 15px 35px;
        transform: rotate(-10deg);
    }

    &.australia {
        right: 80px;
        bottom: 80px;
        width: 45px;
        height: 30px;

        border-radius: 25px 15px 20px 10px;
        transform: rotate(15deg);
    }
}

// 简化大气层效果 - 不干扰主体3D效果
.atmosphere {
    position: absolute;
    top: -25px;
    right: -25px;
    bottom: -25px;
    left: -25px;

    border-radius: 50%;

    // 简单有效的大气光环
    background: radial-gradient(circle, transparent 70%, #87ceeb33 80%, #87ceeb66 90%, transparent 100%);
    animation: atmosphereGlow 4s ease-in-out infinite alternate;
}

// 标题内容
.intro-content {
    position: absolute;
    z-index: 5;
    top: 50%;
    left: 50%;
    text-align: center;

    opacity: 0;
    color: #fff;
    transition: opacity 1.5s ease-in-out;
    transform: translate(-50%, -50%);

    &.visible {
        opacity: 1;
    }
}

.intro-title {
    margin-bottom: 20px;
    font-family: "SourceHanSansCN-Bold", sans-serif;
    font-size: 48px;
    font-weight: bold;

    background: linear-gradient(135deg, #4cfcea, #39b44a);
    background-clip: text;
    background-clip: text;
    text-shadow: 0 0 30px #4cfcea4d;
    animation: titleGlow 3s ease-in-out infinite alternate;

    -webkit-text-fill-color: transparent;
}

.intro-subtitle {
    margin-bottom: 15px;
    font-family: "SourceHanSansCN-Medium", sans-serif;
    font-size: 24px;
    font-weight: 500;

    color: #e5e5e5;
}

.intro-location {
    margin-bottom: 40px;
    font-family: "SourceHanSansCN-Light", sans-serif;
    font-size: 18px;
    font-weight: 300;
    letter-spacing: 2px;

    color: #b0b0b0;
}

// 星空背景
.stars {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    pointer-events: none;
}

.star {
    position: absolute;
    width: 2px;
    height: 2px;

    border-radius: 50%;
    background: #fff;
    animation: twinkle 3s infinite;

    &:nth-child(3n) {
        background: #4cfcea;
        animation-duration: 4s;
    }

    &:nth-child(5n) {
        background: #fbbf24;
        animation-duration: 2s;
    }
}

// 流星效果
.meteors {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    pointer-events: none;
}

.meteor {
    position: absolute;
    width: 2px;
    height: 2px;

    border-radius: 50%;
    background: #4cfcea;
    animation: meteorFall 6s linear infinite;

    &:nth-child(1) {
        top: 10%;
        left: 80%;
        animation-delay: 0s;
    }

    &:nth-child(2) {
        top: 20%;
        left: 60%;
        animation-delay: 2s;
    }

    &:nth-child(3) {
        top: 30%;
        left: 90%;
        animation-delay: 4s;
    }
}

// 最终飞入效果
.earth-intro[data-step="5"] .earth-sphere {
    animation: earthRotation 20s linear infinite, finalFlyIn 2s ease-in forwards;
}

// 跳过提示
.skip-hint {
    position: fixed;
    z-index: 10;
    right: 30px;
    bottom: 30px;
    padding: 8px 16px;
    border: 1px solid #4cfcea4d;
    font-family: "SourceHanSansCN-Light", sans-serif;
    font-size: 14px;

    opacity: 0;
    color: #fff9;
    border-radius: 20px;
    background: #0000004d;
    transition: all .3s ease;
    transform: translateY(20px);

    backdrop-filter: blur(10px);

    &.visible {
        opacity: 1;
        transform: translateY(0);
    }

    &:hover {
        border-color: #4cfcea80;
        color: #ffffffe6;
        background: #00000080;
    }
}

// 科技感扫描线效果
.scan-lines {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    opacity: 0;
    transition: opacity .5s ease;
    pointer-events: none;

    &.active {
        opacity: 1;
    }
}

.scan-line {
    position: absolute;
    left: 0;
    width: 100%;
    height: 2px;

    opacity: 0;
    background: linear-gradient(90deg, transparent 0%, #4cfcea 20%, #fff 50%, #4cfcea 80%, transparent 100%);
    box-shadow: 0 0 10px #4cfcea;
    animation: scanMove 2s linear infinite;

    &:nth-child(1) {
        top: 20%;
    }

    &:nth-child(2) {
        top: 40%;
    }

    &:nth-child(3) {
        top: 60%;
    }

    &:nth-child(4) {
        top: 80%;
    }

    &:nth-child(5) {
        top: 50%;
        height: 1px;
        animation: scanRotate 3s linear infinite;
    }
}

// 下钻提示效果
.drill-hint {
    position: absolute;
    z-index: 10;
    bottom: 20%;
    left: 50%;
    text-align: center;

    opacity: 0;
    transition: all .5s ease;
    transform: translateX(-50%);

    &.visible {
        opacity: 1;
        animation: drillPulse 2s ease-in-out infinite;
    }
}

.drill-text {
    margin-bottom: 15px;
    font-family: "SourceHanSansCN-Medium", sans-serif;
    font-size: 18px;
    letter-spacing: 2px;

    color: #4cfcea;
    text-shadow: 0 0 10px #4cfcea;
}

.loading-bar {
    position: relative;
    overflow: hidden;
    width: 200px;
    height: 4px;
    border: 1px solid #4cfcea;

    border-radius: 2px;
    background: #4cfcea33;
}

.loading-progress {
    width: 0%;
    height: 100%;

    background: linear-gradient(90deg, #4cfcea, #fff, #4cfcea);
    box-shadow: 0 0 10px #4cfcea;
    animation: loadingProgress 3s ease-in-out infinite;
}

// 增强地球容器的科技感
#earth-container {
    position: relative;
    width: 100%;
    height: 100%;

    &::before {
        content: "";
        position: absolute;
        top: -10px;
        right: -10px;
        bottom: -10px;
        left: -10px;
        border: 2px solid transparent;

        opacity: 0;
        border-radius: 50%;
        background: linear-gradient(45deg, #4cfcea, transparent, #4cfcea) border-box;
        animation: borderGlow 3s ease-in-out infinite;

        mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
        mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
        mask-composite: xor;
        mask-composite: exclude;
    }

    canvas {
        border-radius: 50%;
        box-shadow:
            0 0 50px #87ceeb4d,
            0 0 100px #87ceeb1a,
            0 20px 40px #0006,
            inset 0 0 50px #4cfcea1a;
        transition: all .5s ease;
    }
}
</style>
