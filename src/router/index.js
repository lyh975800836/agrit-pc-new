import Vue from 'vue';
import VueRouter from 'vue-router';
import Login from '@/views/Login.vue';
import Dashboard from '@/views/Dashboard.vue';
import DataDashboard from '@/views/DataDashboard.vue';
import DetailMap from '@/views/DetailMap.vue';
// import PlotDetail from '@/views/PlotDetail.vue'; // 原版本保留备份
import PlotDetailV2 from '@/modules/plot/PlotDetailV2.vue';
import { isSessionValid, clearSession, normalizeRedirect } from '@/services/authSession';

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

  // 登录态一律以 token 为准。别改回读 isAuthenticated：那个标记永不过期，
  // token 过期后守卫照样放行，人进了页面才被首屏接口的 401 踢回来
  const authenticated = isSessionValid()

  if (to.meta.requiresAuth && !authenticated) {
    // 顺手清掉过期残留，否则请求拦截器还会拿着它去打接口
    clearSession()
    // 带上原路径，登录完跳回他本来要去的地方
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.name === 'Login' && authenticated) {
    // 已登录，访问登录页时跳转到首页
    const redirect = normalizeRedirect(to.query.redirect)
    next(redirect ? { path: redirect } : { name: 'Dashboard' })
  } else {
    next()
  }
})

export default router 