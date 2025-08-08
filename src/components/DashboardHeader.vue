<template>
  <div class="group_3 flex-col">
    <!-- 头部信息栏 box_1 -->
    <div class="box_1 flex-row">
      <!-- 天气图标 -->
      <img
        class="image_2"
        referrerpolicy="no-referrer"
        src="https://lanhu-oss-proxy.lanhuapp.com/0e038d919f708019d8a2851a3416e179"
      />
      <!-- 天气信息 -->
      <div class="text-wrapper_1 flex-col justify-between">
        <span class="text_1">{{ weather.temperature }}</span>
        <span class="text_2">{{ weather.description }}</span>
      </div>
      <!-- 时间信息 -->
      <div class="text-wrapper_2 flex-col justify-between">
        <span class="text_3">{{ currentTime }}</span>
        <span class="text_4">{{ currentDate }}</span>
      </div>
      <span class="text_5">{{ weekday }}</span>
      
      <!-- 返回按钮（条件显示） -->
      <div v-if="showBackButton" class="text-wrapper_3 flex-col" @click="$emit('back')">
        <span class="text_6">返回总览图</span>
      </div>
      <!-- 主标题（条件显示） -->
      <div v-else class="text-wrapper_3 flex-col">
        <span class="text_6">八角总揽图</span>
      </div>
      
      <!-- 页面标题 -->
      <div class="text-wrapper_4 flex-col">
        <span class="text_7">{{ pageTitle }}</span>
      </div>
      
      <!-- 用户头像 -->
      <img
        class="image_3"
        referrerpolicy="no-referrer"
        :src="user.avatar"
      />
      <span class="text_8">{{ user.name }}</span>
    </div>

    <!-- 头部装饰图片 -->
    <div class="image-wrapper_2 flex-row">
      <img
        class="image_4"
        referrerpolicy="no-referrer"
        src="https://lanhu-oss-proxy.lanhuapp.com/41b5263466a0534d8c35d9bdc09e8da8"
      />
    </div>

    <!-- 头部其他装饰元素 -->
    <div class="image-wrapper_3 flex-col">
      <img
        class="image_5"
        referrerpolicy="no-referrer"
        src="https://lanhu-oss-proxy.lanhuapp.com/24ed9c2d7c1f8739cbe3ea4b596f2dc7"
      />
      <img
        class="image_6"
        referrerpolicy="no-referrer"
        src="https://lanhu-oss-proxy.lanhuapp.com/35869bfc7f0dbed47c4afb26b44e2f64"
      />
    </div>

    <img
      class="image_7"
      referrerpolicy="no-referrer"
      src="https://lanhu-oss-proxy.lanhuapp.com/0fa7f77bec1dc1b90ba39069c270f365"
    />
  </div>
</template>

<script>
export default {
  name: 'DashboardHeader',
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
  computed: {
    currentTime() {
      const now = new Date()
      return now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    },
    currentDate() {
      const now = new Date()
      return now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '年').replace(/年(\d+)年/, '年$1月') + '日'
    },
    weekday() {
      const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      return days[new Date().getDay()]
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/dashboard.less';
</style>