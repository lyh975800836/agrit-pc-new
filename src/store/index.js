import Vue from 'vue';
import Vuex from 'vuex';
import createLogger from 'vuex/dist/logger';

Vue.use(Vuex);

// 全局状态
const state = {
    // 应用配置
    app: {
        name: '百色农林大数据中心',
        version: '1.0.0',
        theme: 'default'
    },

    // 用户信息
    user: {
        id: 1,
        name: '管理员',
        role: 'admin',
        avatar: '/images/user-avatar.png',
        permissions: ['dashboard:read', 'data:read', 'export:all']
    },

    // 系统设置
    settings: {
        autoRefresh: true,
        refreshInterval: 300000,
        language: 'zh-CN',
        timezone: 'Asia/Shanghai'
    },

    // 全局通知
    notifications: [],

    // 加载状态
    globalLoading: false
};

// 全局获取器
const getters = {
    // 用户信息
    currentUser: state => state.user,
    userPermissions: state => state.user.permissions || [],
    hasPermission: state => permission => state.user.permissions?.includes(permission) || false,

    // 系统设置
    appSettings: state => state.settings,
    appName: state => state.app.name,
    appVersion: state => state.app.version,
    currentTheme: state => state.app.theme,

    // 通知
    unreadNotifications: state => state.notifications.filter(n => !n.read),
    notificationCount: (state, getters) => getters.unreadNotifications.length,

    // 加载状态
    isGlobalLoading: state => state.globalLoading
};

// 全局变更
const mutations = {
    // 用户信息更新
    SET_USER(state, user) {
        state.user = { ...state.user, ...user };
    },

    // 系统设置更新
    SET_SETTING(state, { key, value }) {
        state.settings[key] = value;
    },

    SET_SETTINGS(state, settings) {
        state.settings = { ...state.settings, ...settings };
    },

    // 主题更新
    SET_THEME(state, theme) {
        state.app.theme = theme;
    },

    // 通知管理
    ADD_NOTIFICATION(state, notification) {
        state.notifications.unshift({
            id: Date.now(),
            read: false,
            createdAt: new Date().toISOString(),
            ...notification
        });
    },

    MARK_NOTIFICATION_READ(state, id) {
        const notification = state.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
        }
    },

    REMOVE_NOTIFICATION(state, id) {
        const index = state.notifications.findIndex(n => n.id === id);
        if (index > -1) {
            state.notifications.splice(index, 1);
        }
    },

    CLEAR_NOTIFICATIONS(state) {
        state.notifications = [];
    },

    // 全局加载状态
    SET_GLOBAL_LOADING(state, loading) {
        state.globalLoading = loading;
    }
};

// 全局动作
const actions = {
    // 初始化应用
    async initializeApp({ commit }) {
        commit('SET_GLOBAL_LOADING', true);

        try {
            // 初始化用户信息
            const user = JSON.parse(localStorage.getItem('user_info') || '{}');
            if (user.id) {
                commit('SET_USER', user);
            }

            // 初始化系统设置
            const settings = JSON.parse(localStorage.getItem('app_settings') || '{}');
            if (Object.keys(settings).length > 0) {
                commit('SET_SETTINGS', settings);
            }

            return true;
        }
        catch (error) {
            console.error('[Store] 初始化失败:', error);
            throw error;
        }
        finally {
            commit('SET_GLOBAL_LOADING', false);
        }
    },

    // 更新用户信息
    updateUser({ commit }, user) {
        commit('SET_USER', user);
        localStorage.setItem('user_info', JSON.stringify(user));
    },

    // 更新设置
    updateSetting({ commit, state }, { key, value }) {
        commit('SET_SETTING', { key, value });
        localStorage.setItem('app_settings', JSON.stringify(state.settings));
    },

    updateSettings({ commit }, settings) {
        commit('SET_SETTINGS', settings);
        localStorage.setItem('app_settings', JSON.stringify(settings));
    },

    // 主题切换
    switchTheme({ commit }, theme) {
        commit('SET_THEME', theme);
        localStorage.setItem('app_theme', theme);
    },

    // 通知管理
    showNotification({ commit }, notification) {
        commit('ADD_NOTIFICATION', notification);
    },

    markNotificationRead({ commit }, id) {
        commit('MARK_NOTIFICATION_READ', id);
    },

    removeNotification({ commit }, id) {
        commit('REMOVE_NOTIFICATION', id);
    },

    clearNotifications({ commit }) {
        commit('CLEAR_NOTIFICATIONS');
    },

    // 全局加载
    setGlobalLoading({ commit }, loading) {
        commit('SET_GLOBAL_LOADING', loading);
    }
};

// 创建 store 实例
const store = new Vuex.Store({
    state,
    getters,
    mutations,
    actions,

    modules: {},

    // 仅在开发环境下启用日志
    plugins: process.env.NODE_ENV === 'development' ? [createLogger()] : [],

    // 严格模式
    strict: process.env.NODE_ENV !== 'production'
});

// 热重载支持
if (module.hot) {
    // 热重载其他模块时在此添加
}

export default store;
