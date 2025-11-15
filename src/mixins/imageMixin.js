/**
 * 图片管理混入
 * 为Vue组件提供统一的图片路径管理
 */

import { IMAGES, getImagePath, getCategoryImages, preloadImages } from '@/utils/imageManager';

export default {
    data() {
        return {
            // 将图片配置注入到组件数据中
            $images: IMAGES
        };
    },

    methods: {

        /**
     * 获取图片路径
     * @param {string} category 图片类别
     * @param {string} name 图片名称
     * @returns {string} 图片路径
     */
        getImagePath,

        /**
     * 获取某类别的所有图片
     * @param {string} category 图片类别
     * @returns {Object} 图片对象
     */
        getCategoryImages,

        /**
     * 预加载图片
     * @param {string|Array} imagePaths 图片路径
     * @returns {Promise} 预加载Promise
     */
        preloadImages,

        /**
     * 获取内联样式对象 - 常用于背景图片
     * @param {string} imagePath 图片路径
     * @param {Object} extraStyles 额外样式
     * @returns {Object} 样式对象
     */
        getBackgroundImageStyle(imagePath, extraStyles = {}) {
            return {
                backgroundImage: `url(${ imagePath })`,
                backgroundPosition: '100%',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '100% 100%',
                ...extraStyles
            };
        },

        /**
     * 获取头部图片样式 - 针对头部组件优化
     * @param {string} imageName 图片名称
     * @param {Object} extraStyles 额外样式
     * @returns {Object} 样式对象
     */
        getHeaderImageStyle(imageName, extraStyles = {}) {
            const imagePath = getImagePath('HEADER', imageName);
            return this.getBackgroundImageStyle(imagePath, extraStyles);
        },

        /**
     * 获取左侧面板图片样式
     * @param {string} imageName 图片名称
     * @param {Object} extraStyles 额外样式
     * @returns {Object} 样式对象
     */
        getLeftPanelImageStyle(imageName, extraStyles = {}) {
            const imagePath = getImagePath('LEFT_PANEL', imageName);
            return this.getBackgroundImageStyle(imagePath, extraStyles);
        },

        /**
     * 获取右侧面板图片样式
     * @param {string} imageName 图片名称
     * @param {Object} extraStyles 额外样式
     * @returns {Object} 样式对象
     */
        getRightPanelImageStyle(imageName, extraStyles = {}) {
            const imagePath = getImagePath('RIGHT_PANEL', imageName);
            return this.getBackgroundImageStyle(imagePath, extraStyles);
        },

        /**
     * 获取弹窗图片样式
     * @param {string} imageName 图片名称
     * @param {Object} extraStyles 额外样式
     * @returns {Object} 样式对象
     */
        getPopupImageStyle(imageName, extraStyles = {}) {
            const imagePath = getImagePath('POPUP', imageName);
            return this.getBackgroundImageStyle(imagePath, extraStyles);
        }
    },

    created() {
    // 组件创建时可以预加载关键图片
        if (this.$options.preloadImages) {
            const imagesToPreload = this.$options.preloadImages;
            this.preloadImages(imagesToPreload).then(results => {
                const failed = results.filter(r => r.status === 'rejected');
                if (failed.length > 0) {
                    console.warn('部分图片预加载失败:', failed);
                }
            });
        }
    }
};
