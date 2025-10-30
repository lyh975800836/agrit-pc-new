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
          <img
            class="center-decoration-sub"
            referrerpolicy="no-referrer"
            :src="getImagePath('HEADER', 'CENTER_DECORATION_SUB')"
            alt="装饰线条"
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
        <div v-else class="nav-button flex-col align-center justify-center" :style="getHeaderImageStyle('NAV_BUTTON_BG')" @click="handleNavButtonClick">
          <span class="nav-text">八角总览图</span>
        </div>

        <!-- 页面标题 -->
        <div
          class="page-title flex-col align-center justify-center"
          :style="getHeaderImageStyle('PAGE_TITLE_BG')"
          @click="handlePageTitleClick"
        >
          <span class="title-text">{{ pageTitle }}</span>
        </div>

        <!-- 用户头像和姓名 -->
        <img
          class="user-avatar"
          referrerpolicy="no-referrer"
          :src="getImagePath('HEADER', 'USER_AVATAR')"
          alt="用户头像"
        />
        <span class="user-name">{{ user.name }}</span>
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
            timeTimer: null
        };
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

        // 处理页面标题点击事件
        handlePageTitleClick() {
            this.$router.push('/data-dashboard').catch(() => {
                // 静默处理重复导航错误
            });
        },

        // 处理导航按钮点击事件
        handleNavButtonClick() {
            this.$router.push('/').catch(() => {
                // 静默处理重复导航错误
            });
        }
    }
};
</script>

<style lang="less" scoped>
@import "@/styles/global.less";

.dashboard-header {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 157px;
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
    bottom: 18px;
    left: 170px;
    width: 420px;
    height: 36px;
}

.center-decoration-sub {
    position: absolute;
    bottom: 20px;
    left: 122px;
    width: 520px;
    height: 28px;
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

.user-avatar {
    width: 28px;
    height: 28px;
    margin: 0 5px 0 32px;
    border-radius: 50%;
}

.user-name {
    font-family: SourceHanSansCN-Regular;
    font-size: 12px;
    white-space: nowrap;
    color: #F6F4EE;
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
