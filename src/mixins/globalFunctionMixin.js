/**
 * Global Function Management Mixin
 * 用于管理组件注册到 window 的全局函数,确保正确的注册和清理
 *
 * 使用方式:
 * import globalFunctionMixin from '@/mixins/globalFunctionMixin'
 *
 * export default {
 *   mixins: [globalFunctionMixin],
 *   methods: {
 *     setupGlobalFunctions() {
 *       // 注册全局函数
 *       this.registerGlobalFunction('zoomToField', this.zoomToField);
 *       this.registerGlobalFunction('showFieldDetails', this.showFieldDetails);
 *     }
 *   }
 * }
 *
 * 注意:
 * - 推荐使用 EventBus 替代全局函数
 * - 此 mixin 仅用于兼容旧代码,逐步迁移到 EventBus
 */

export default {
    data() {
        return {
            // 存储已注册的全局函数名称
            _registeredGlobalFunctions: []
        };
    },

    beforeDestroy() {
        // 自动清理所有注册的全局函数
        this.cleanupGlobalFunctions();
    },

    methods: {
        /**
         * 注册全局函数
         * @param {string} name - 函数名称
         * @param {Function} fn - 函数引用
         * @param {boolean} force - 是否强制覆盖已存在的函数
         */
        registerGlobalFunction(name, fn, force = false) {
            // 检查是否已存在
            if (window[name] && !force) {
                console.warn(`[GlobalFunctionMixin] Function "${name}" already exists on window. Use force=true to override.`);
                return false;
            }

            // 注册函数
            window[name] = fn;

            // 记录已注册的函数
            if (!this._registeredGlobalFunctions.includes(name)) {
                this._registeredGlobalFunctions.push(name);
            }

            return true;
        },

        /**
         * 注销全局函数
         * @param {string} name - 函数名称
         */
        unregisterGlobalFunction(name) {
            // 只删除自己注册的函数
            if (window[name] && this._registeredGlobalFunctions.includes(name)) {
                // 验证是否是当前实例的函数
                if (typeof this[name] === 'function' && window[name] === this[name]) {
                    delete window[name];

                    // 从记录中移除
                    const index = this._registeredGlobalFunctions.indexOf(name);
                    if (index > -1) {
                        this._registeredGlobalFunctions.splice(index, 1);
                    }

                    return true;
                }
            }

            return false;
        },

        /**
         * 清理所有已注册的全局函数
         */
        cleanupGlobalFunctions() {
            // 复制数组,避免在遍历时修改
            const functions = [...this._registeredGlobalFunctions];

            functions.forEach(name => {
                this.unregisterGlobalFunction(name);
            });

            if (this._registeredGlobalFunctions.length > 0) {
                console.warn(`[GlobalFunctionMixin] Failed to cleanup functions: ${this._registeredGlobalFunctions.join(', ')}`);
            }
        },

        /**
         * 检查函数是否已注册
         * @param {string} name - 函数名称
         * @returns {boolean}
         */
        isGlobalFunctionRegistered(name) {
            return this._registeredGlobalFunctions.includes(name);
        },

        /**
         * 获取所有已注册的函数名
         * @returns {Array<string>}
         */
        getRegisteredGlobalFunctions() {
            return [...this._registeredGlobalFunctions];
        }
    }
};
