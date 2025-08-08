import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 用户信息
    user: {
      name: '管理员',
      avatar: 'https://lanhu-oss-proxy.lanhuapp.com/d49070cc001560a5a4eb371bc487d8ba'
    },
    
    // 天气信息
    weather: {
      temperature: '26.8°C',
      description: '晴多云转阵雨',
      icon: 'https://lanhu-oss-proxy.lanhuapp.com/0e038d919f708019d8a2851a3416e179'
    },

    // 统计数据
    statistics: {
      totalArea: 810,
      totalProjects: 5,
      totalRegions: 12,
      averagePrice: 3.08
    },

    // 区域数据
    regions: [
      { name: '德保县', area: 38, percentage: 27.34 },
      { name: '那坡县', area: 30, percentage: 21.58 },
      { name: '右江区', area: 23.6, percentage: 16.98 },
      { name: '田林县', area: 21, percentage: 15.11 },
      { name: '凌云县', area: 17, percentage: 12.23 },
      { name: '乐业县', area: 10, percentage: 7.19 }
    ],

    // 项目排名
    projectRankings: [
      {
        id: 1,
        name: '千户十亩-大楞乡巴平村',
        area: 30,
        region: '右江区',
        manager: '隆起雷',
        yield: 1970,
        avatar: 'https://lanhu-oss-proxy.lanhuapp.com/52bf36ad5e30ea17b9112caef8c27c87'
      },
      {
        id: 2,
        name: '千户十亩-大楞乡巴平村',
        area: 30,
        region: '右江区',
        manager: '李子顺',
        yield: 1970,
        avatar: 'https://lanhu-oss-proxy.lanhuapp.com/b7e8db7f31322989f319ca7f44a1234c'
      },
      {
        id: 3,
        name: '千户十亩-大楞乡巴平村',
        area: 30,
        region: '右江区',
        manager: '李子顺',
        yield: 1970,
        avatar: 'https://lanhu-oss-proxy.lanhuapp.com/a45c100031ad5c87dd145f1905d318a3'
      }
    ],

    // 林地质量分布
    forestQuality: {
      good: 20,
      average: 30,
      poor: 50
    }
  },

  getters: {
    // 获取总面积
    getTotalArea: state => state.statistics.totalArea,
    
    // 获取项目总数
    getTotalProjects: state => state.statistics.totalProjects,
    
    // 获取区域排名前5
    getTopRegions: state => state.regions.slice(0, 5),
    
    // 获取项目排名前3
    getTopProjects: state => state.projectRankings.slice(0, 3)
  },

  mutations: {
    // 更新用户信息
    UPDATE_USER(state, user) {
      state.user = { ...state.user, ...user }
    },

    // 更新天气信息
    UPDATE_WEATHER(state, weather) {
      state.weather = { ...state.weather, ...weather }
    },

    // 更新统计数据
    UPDATE_STATISTICS(state, statistics) {
      state.statistics = { ...state.statistics, ...statistics }
    },

    // 更新区域数据
    UPDATE_REGIONS(state, regions) {
      state.regions = regions
    },

    // 更新项目排名
    UPDATE_PROJECT_RANKINGS(state, rankings) {
      state.projectRankings = rankings
    },

    // 更新林地质量
    UPDATE_FOREST_QUALITY(state, quality) {
      state.forestQuality = { ...state.forestQuality, ...quality }
    }
  },

  actions: {
    // 获取仪表板数据
    async fetchDashboardData({ commit }) {
      try {
        // 这里可以调用API获取数据
        // const response = await api.getDashboardData()
        
        // 模拟数据更新
        commit('UPDATE_STATISTICS', {
          totalArea: 810,
          totalProjects: 5,
          totalRegions: 12,
          averagePrice: 3.08
        })
        
        return Promise.resolve()
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 更新天气数据
    async updateWeatherData({ commit }) {
      try {
        // 这里可以调用天气API
        // const weather = await weatherApi.getCurrentWeather()
        
        // 模拟天气数据更新
        const weather = {
          temperature: `${Math.floor(Math.random() * 10 + 20)}°C`,
          description: '晴多云转阵雨'
        }
        
        commit('UPDATE_WEATHER', weather)
        return Promise.resolve(weather)
      } catch (error) {
        return Promise.reject(error)
      }
    }
  },

  modules: {
    // 可以在这里添加模块化的store
  }
}) 