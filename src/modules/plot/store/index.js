import Vue from 'vue'
import { plotApi } from '@/infrastructure'

/**
 * Plot Store模块
 *
 * 功能:
 * - 地块数据管理
 * - 缓存机制 (TTL: 5分钟)
 * - 加载状态管理
 * - 错误处理
 */
const state = {
    currentPlot: null,
    plotList: [],
    selectedPlotId: null,

    // 缓存管理
    plotCache: {},           // { plotId: { data, timestamp } }
    cacheTTL: 5 * 60 * 1000, // 5分钟

    loading: {
        detail: false,
        list: false
    },
    error: null
}

const getters = {
    currentPlot: state => state.currentPlot,
    plotList: state => state.plotList,
    selectedPlotId: state => state.selectedPlotId,

    // 根据ID获取缓存的地块
    plotById: state => plotId => {
        const cached = state.plotCache[plotId]
        if (!cached) return null

        // 检查是否过期
        const isExpired = (Date.now() - cached.timestamp) > state.cacheTTL
        return isExpired ? null : cached.data
    },

    // 加载状态
    isLoadingDetail: state => state.loading.detail,
    isLoadingList: state => state.loading.list,
    hasError: state => !!state.error
}

const mutations = {
    SET_CURRENT_PLOT(state, plot) {
        state.currentPlot = plot
    },

    SET_PLOT_LIST(state, plotList) {
        state.plotList = plotList
    },

    SET_SELECTED_PLOT_ID(state, plotId) {
        state.selectedPlotId = plotId
    },

    // 缓存管理
    SET_PLOT_CACHE(state, { plotId, data, timestamp }) {
        Vue.set(state.plotCache, plotId, { data, timestamp })
    },

    CLEAR_PLOT_CACHE(state, plotId) {
        if (plotId) {
            Vue.delete(state.plotCache, plotId)
        } else {
            state.plotCache = {}
        }
    },

    SET_LOADING(state, { key, value }) {
        state.loading[key] = value
    },

    SET_ERROR(state, error) {
        state.error = error
    }
}

const actions = {
    /**
     * 获取地块详情 (支持缓存)
     */
    async fetchPlotDetail({ state, commit }, { plotId, forceRefresh = false }) {
        try {
            commit('SET_LOADING', { key: 'detail', value: true })
            commit('SET_ERROR', null)

            // 1. 检查缓存
            const cached = state.plotCache[plotId]
            const now = Date.now()

            if (!forceRefresh && cached && (now - cached.timestamp < state.cacheTTL)) {
                console.log(`[Plot Store] 使用缓存: ${plotId}`)
                commit('SET_CURRENT_PLOT', cached.data)
                return cached.data
            }

            // 2. 从API获取
            console.log(`[Plot Store] API请求: ${plotId}`)
            const plot = await plotApi.getPlotDetail(plotId)

            // 3. 更新状态和缓存
            commit('SET_CURRENT_PLOT', plot)
            commit('SET_PLOT_CACHE', { plotId, data: plot, timestamp: now })

            return plot
        } catch (error) {
            console.error('[Plot Store] 获取地块详情失败:', error)
            commit('SET_ERROR', error)
            throw error
        } finally {
            commit('SET_LOADING', { key: 'detail', value: false })
        }
    },

    /**
     * 获取地块列表
     */
    async fetchPlotList({ commit }) {
        try {
            commit('SET_LOADING', { key: 'list', value: true })
            commit('SET_ERROR', null)

            const plotList = await plotApi.getPlotsList()

            commit('SET_PLOT_LIST', plotList)

            return plotList
        } catch (error) {
            console.error('[Plot Store] 获取地块列表失败:', error)
            commit('SET_ERROR', error)
            throw error
        } finally {
            commit('SET_LOADING', { key: 'list', value: false })
        }
    },

    /**
     * 通过名称查找地块
     */
    async findPlotByName({ state, dispatch }, plotName) {
        // 先尝试从已加载的列表中查找
        let plot = state.plotList.find(p => p.name === plotName)

        if (!plot) {
            // 如果列表未加载，则加载列表
            await dispatch('fetchPlotList')
            plot = state.plotList.find(p => p.name === plotName)
        }

        return plot || null
    },

    /**
     * 清除当前地块
     */
    clearCurrentPlot({ commit }) {
        commit('SET_CURRENT_PLOT', null)
    },

    /**
     * 清除缓存
     */
    clearCache({ commit }, plotId) {
        commit('CLEAR_PLOT_CACHE', plotId)
    },

    /**
     * 强制刷新地块数据
     */
    async refreshPlotDetail({ dispatch }, plotId) {
        return dispatch('fetchPlotDetail', { plotId, forceRefresh: true })
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}
