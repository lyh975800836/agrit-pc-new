import Vue from 'vue';
import VueRouter from 'vue-router';
import Login from '@/views/Login.vue';
import Dashboard from '@/views/Dashboard.vue';
import DataDashboard from '@/views/DataDashboard.vue';
import DetailMap from '@/views/DetailMap.vue';
// import PlotDetail from '@/views/PlotDetail.vue'; // 原版本保留备份
import PlotDetailV2 from '@/modules/plot/PlotDetailV2.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录 - 八角数据管理平台',
      requiresAuth: false
    }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: '八角总览图',
      requiresAuth: true
    }
  },
  {
    path: '/data-dashboard',
    name: 'DataDashboard',
    component: DataDashboard,
    meta: {
      title: '数据驾驶舱',
      requiresAuth: true
    }
  },
  {
    path: '/detail/:region',
    name: 'DetailMap',
    component: DetailMap,
    meta: {
      title: '八角地块详情',
      requiresAuth: true
    }
  },
  {
    path: '/plot/:plotId',
    name: 'PlotDetail',
    component: PlotDetailV2, // 直接使用新架构版本
    props: true,
    meta: {
      title: '地块详情',
      requiresAuth: true
    }
  }
];

const router = new VueRouter({
  mode: 'hash', // 临时改为hash模式解决部署问题
  base: process.env.BASE_URL,
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // 检查是否需要登录
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'

  if (to.meta.requiresAuth && !isAuthenticated) {
    // 需要登录但未登录，跳转到登录页
    next({ name: 'Login' })
  } else if (to.name === 'Login' && isAuthenticated) {
    // 已登录，访问登录页时跳转到首页
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router 