<template>
  <div class="dashboard-header" :style="getHeaderImageStyle('BACKGROUND')">
    <!-- 头部主要内容区域 -->
    <div class="header-main">
      <!-- 左侧：天气、日期、时间 -->
      <div class="header-left flex-row">
        <!-- 天气图标 -->
        <img
          class="weather-icon"
          referrerpolicy="no-referrer"
          :src="getImagePath('HEADER', 'WEATHER_ICON')"
          alt="天气图标"
        />

        <!-- 天气信息 -->
        <div class="weather-info flex-col justify-center">
          <span class="temperature">{{ weather.temperature }}</span>
          <span class="weather-desc">{{ weather.description }}</span>
        </div>

        <!-- 时间信息 -->
        <div class="time-info flex-col justify-center">
          <span class="current-time">{{ currentTime }}</span>
          <span class="current-date">{{ currentDate }}</span>
        </div>

        <!-- 星期 -->
        <div class="flex-col justify-center">
          <span class="weekday">{{ weekday }}</span>
        </div>
      </div>

      <!-- 中间：头部装饰图片 - 绝对居中 -->
      <div class="header-center">
        <!-- 主要装饰背景 -->
        <div class="center-decoration-bg" :style="getHeaderImageStyle('CENTER_DECORATION_BG')">
          <img
            class="center-decoration-main"
            referrerpolicy="no-referrer"
            :src="getImagePath('HEADER', 'CENTER_DECORATION_MAIN')"
            alt="中心装饰"
          />
        </div>
      </div>

      <!-- 右侧：八角总揽图、数据驾驶舱、管理员 -->
      <div class="header-right flex-row align-center">
        <!-- 返回按钮或主标题 -->
        <div
          v-if="showBackButton"
          class="nav-button flex-col align-center justify-center"
          :style="getHeaderImageStyle('NAV_BUTTON_BG')"
          @click="$emit('back')"
        >
          <span class="nav-text">返回总览图</span>
        </div>
        <div v-else class="nav-button flex-col align-center justify-center" :style="getHeaderImageStyle('NAV_BUTTON_BG')" @click="$emit('nav-button-click')">
          <span class="nav-text">八角总览图</span>
        </div>

        <!-- 页面标题 -->
        <div
          class="page-title flex-col align-center justify-center"
          :style="getHeaderImageStyle('PAGE_TITLE_BG')"
          @click="$emit('page-title-click')"
        >
          <span class="title-text">{{ pageTitle }}</span>
        </div>

        <!-- 用户信息区域 -->
        <div class="user-section" v-click-outside="closeDropdown">
          <div class="user-info" @click="toggleDropdown">
            <img
              class="user-avatar"
              referrerpolicy="no-referrer"
              :src="getImagePath('HEADER', 'USER_AVATAR')"
              alt="用户头像"
            />
            <span class="user-name">{{ user.name }}</span>
            <svg class="dropdown-icon" :class="{ 'is-open': showDropdown }" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4L6 8L10 4" stroke="#F6F4EE" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <!-- 下拉菜单 -->
          <transition name="dropdown">
            <div v-if="showDropdown" class="dropdown-menu">
              <div class="dropdown-item" @click="handleLogout">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 13H2.33333C1.97971 13 1.64057 12.8595 1.39052 12.6095C1.14048 12.3594 1 12.0203 1 11.6667V2.33333C1 1.97971 1.14048 1.64057 1.39052 1.39052C1.64057 1.14048 1.97971 1 2.33333 1H5M9.66667 10.3333L13 7M13 7L9.66667 3.66667M13 7H5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>退出登录</span>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- 最底部装饰线 -->
    <img
      class="bottom-decoration"
      referrerpolicy="no-referrer"
      :src="getImagePath('HEADER', 'BOTTOM_DECORATION')"
      alt="底部装饰"
    />
  </div>
</template>

<script>
import imageMixin from '@/mixins/imageMixin';

export default {
    name: 'DashboardHeader',
    mixins: [imageMixin],
    data() {
        return {
            currentTime: '',
            currentDate: '',
            weekday: '',
            timeTimer: null,
            showDropdown: false
        };
    },
    directives: {
        clickOutside: {
            bind(el, binding) {
                el.clickOutsideEvent = function(event) {
                    if (!(el === event.target || el.contains(event.target))) {
                        binding.value();
                    }
                };
                document.addEventListener('click', el.clickOutsideEvent);
            },
            unbind(el) {
                document.removeEventListener('click', el.clickOutsideEvent);
            }
        }
    },
    props: {
        weather: {
            type: Object,
            required: true
        },
        user: {
            type: Object,
            required: true
        },
        showBackButton: {
            type: Boolean,
            default: false
        },
        pageTitle: {
            type: String,
            default: '数据驾驶舱'
        }
    },
    mounted() {
    // 组件挂载时初始化时间显示
        this.updateTime();
        // 启动定时器，每秒1秒更新时间
        this.timeTimer = setInterval(() => {
            this.updateTime();
        }, 1000);
    },

    beforeDestroy() {
    // 组件销毁时清除定时器
        if (this.timeTimer) {
            clearInterval(this.timeTimer);
            this.timeTimer = null;
        }
    },

    methods: {
        updateTime() {
            const now = new Date();

            // 更新时间
            this.currentTime = now.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

            // 更新日期
            this.currentDate = `${ now.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).replace(/\//g, '年')
                .replace(/年(\d+)年/, '年$1月') }日`;

            // 更新星期
            const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            this.weekday = days[now.getDay()];
        },
        toggleDropdown() {
            this.showDropdown = !this.showDropdown;
        },
        closeDropdown() {
            this.showDropdown = false;
        },
        handleLogout() {
            // 关闭下拉菜单
            this.closeDropdown();

            // 清除登录状态
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('username');

            // 跳转到登录页
            this.$router.push({ name: 'Login' });
        }
    }
};
</script>

<style lang="less" scoped>
@import "@/styles/global.less";

.dashboard-header {
    position: relative;
    z-index: 100; // 确保 header 在侧边栏之上
    box-sizing: border-box;
    width: 100%;
    height: 100px;
    padding: 0 3%;

    /* background moved to inline style */
    background-size: 100% 100%;
}

.header-main {
    position: relative;
    display: flex;
    align-items: center;
    padding: 15px 0;
}

// 左侧区域：天气、日期、时间
.header-left {
    flex: 0 0 auto;
    align-items: start;
    margin-top: 10px;
}

.weather-icon {
    width: 38px;
    height: 34px;
}

.weather-info {
    margin-left: 23px;
}

.temperature {
    width: 65px;
    font-size: 22px;
    text-align: right;
    color: #F6F4EE;
    font-weight: 600;
}

.weather-desc {
    font-family: SourceHanSansCN-Light;
    font-size: 11px;
    text-align: center;
    white-space: nowrap;
    font-weight: 600;
    color: #F6F4EE;
}

.time-info {
    margin-left: 20px;
}

.current-time {
    font-size: 22px;
    text-align: center;
    color: #F6F4EE;
    font-weight: 600;
}

.current-date {
    font-family: SourceHanSansCN-Light;
    font-size: 11px;
    text-align: center;
    color: #F6F4EE;
    font-weight: 600;
}

.weekday {
    margin-left: 32px;
    font-size: 22px;
    text-align: center;
    color: #F6F4EE;
    font-weight: 600;
}

// 中间区域：头部装饰图片 - 绝对居中
.header-center {
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 765px;
    height: 105px;

    transform: translate(-50%, -50%);
}

.center-decoration-bg {
    position: relative;
    width: 765px;
    height: 105px;

    /* background moved to inline style */
    background-size: contain;
}

.center-decoration-main {
    position: absolute;
    bottom: 22px;
    left: 170px;
    width: 420px;
    height: 36px;
}

.nav-button {
    width: 113px;
    height: 45px;
    text-align: center;

    /* background moved to inline style */
    background-size: contain;
    transition: opacity .2s;
    cursor: pointer;

    &:hover {
        opacity: .8;
    }
}

.nav-text {
    font-family: SourceHanSansCN-Regular;
    font-size: 12px;
    white-space: nowrap;
    color: #F6F4EE;
}

.page-title {
    position: relative;
    z-index: 10;
    width: 113px;
    height: 45px;
    text-align: center;

    /* background moved to inline style */
    background-size: contain;
    transition: all .2s;
    cursor: pointer;

    &:hover {
        opacity: .8;
        transform: scale(1.05);
    }

    &:active {
        transform: scale(.95);
    }
}

.title-text {
    font-family: SourceHanSansCN-Regular;
    font-size: 12px;
    white-space: nowrap;
    color: #F6F4EE;
}

// 右侧区域：八角总揽图、数据驾驶舱、管理员
.header-right {
    position: absolute;
    top: 50%;
    right: 0;
    display: flex;
    align-items: center;

    transform: translateY(-50%);
}

// 用户信息区域
.user-section {
    position: relative;
    margin-left: 32px;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: linear-gradient(135deg, rgba(198, 156, 109, 0.15) 0%, rgba(198, 156, 109, 0.08) 100%);
    border: 1px solid rgba(198, 156, 109, 0.3);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: linear-gradient(135deg, rgba(198, 156, 109, 0.25) 0%, rgba(198, 156, 109, 0.15) 100%);
        border-color: rgba(198, 156, 109, 0.5);
        box-shadow: 0 2px 8px rgba(198, 156, 109, 0.2);
    }
}

.user-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid rgba(198, 156, 109, 0.4);
}

.user-name {
    font-family: SourceHanSansCN-Regular;
    font-size: 12px;
    white-space: nowrap;
    color: #F6F4EE;
}

.dropdown-icon {
    transition: transform 0.3s ease;

    &.is-open {
        transform: rotate(180deg);
    }
}

// 下拉菜单
.dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 140px;
    background: linear-gradient(135deg, rgba(25, 35, 45, 0.98) 0%, rgba(20, 28, 36, 0.98) 100%);
    border: 1px solid rgba(198, 156, 109, 0.4);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 20px rgba(198, 156, 109, 0.1);
    overflow: hidden;
    z-index: 10000; // 确保在所有元素之上
    backdrop-filter: blur(10px);
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    color: #c69c6d;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
    }

    &:hover {
        background: linear-gradient(135deg, rgba(198, 156, 109, 0.2) 0%, rgba(198, 156, 109, 0.15) 100%);
        color: #e0b885;
    }

    &:active {
        background: linear-gradient(135deg, rgba(198, 156, 109, 0.3) 0%, rgba(198, 156, 109, 0.2) 100%);
    }
}

// 下拉动画
.dropdown-enter-active,
.dropdown-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
}

// 装饰元素
.decoration-line {
    width: 728px;
    height: 12px;
    margin: 10px auto;
}

.decoration-image {
    width: 100%;
    height: 12px;
}


// 底部装饰线
.bottom-decoration {
    position: absolute;
    top: 80px;
    right: 8%;
    left: 8%;
    width: 84%;
    height: 12px;
}

</style>
