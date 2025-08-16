import Vue from 'vue'
import VueRouter from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import DataDashboard from '@/views/DataDashboard.vue'
import DetailMap from '@/views/DetailMap.vue'
import PlotDetail from '@/views/PlotDetail.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: '八角总览图'
    }
  },
  {
    path: '/data-dashboard',
    name: 'DataDashboard',
    component: DataDashboard,
    meta: {
      title: '数据驾驶舱'
    }
  },
  {
    path: '/detail/:region',
    name: 'DetailMap',
    component: DetailMap,
    meta: {
      title: '八角地块详情'
    }
  },
  {
    path: '/plot/:plotId',
    name: 'PlotDetail',
    component: PlotDetail,
    props: true,
    meta: {
      title: '地块详情'
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

export default router 