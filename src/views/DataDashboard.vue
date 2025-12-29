<template>
  <DashboardContainer />
</template>

<script>
import DashboardContainer from '@/modules/dashboard/DashboardContainer.vue';

/**
 * 数据驾驶舱视图
 *
 * 使用Dashboard Module的容器组件
 * @component DataDashboard
 */
export default {
  name: 'DataDashboard',
  components: {
    DashboardContainer
  }
};
</script>
