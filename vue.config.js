const path = require('path');

module.exports = {
    // 基础配置
    publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',

    // 构建输出配置
    outputDir: 'dist',
    assetsDir: 'static',

    // 开发服务器配置
    devServer: {
        port: 8080,
        open: true,
        client: {
            overlay: {
                warnings: false,
                errors: true
            }
        },
        proxy: {
            '/api/v1': {
                target: 'http://43.136.169.150:8000',
                changeOrigin: true,
                secure: false,
                logLevel: 'debug',
                cookieDomainRewrite: '',
                onProxyReq: function(proxyReq, req, res) {
                    console.log('Proxying request:', req.method, req.url, '-> ', proxyReq.path);
                    // 保留所有原始请求头
                    if (req.headers.cookie) {
                        proxyReq.setHeader('cookie', req.headers.cookie);
                    }
                },
                onProxyRes: function(proxyRes, req, res) {
                    console.log('Proxy response:', proxyRes.statusCode, req.url);
                    // 允许跨域携带 cookie
                    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
                },
                onError: function(err, req, res) {
                    console.log('Proxy error:', err, req.url);
                }
            }
        }
    },

    // 路径别名配置
    configureWebpack: {
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src')
            }
        }
    },

    // Webpack链式配置
    chainWebpack(config) {
    // 生产环境优化
        if (process.env.NODE_ENV === 'production') {
            // 移除console和debugger
            config.optimization.minimizer('terser').tap(args => {
                args[0].terserOptions.compress.drop_console = true;
                args[0].terserOptions.compress.drop_debugger = true;
                return args;
            });

            // 代码分割优化
            config.optimization.splitChunks({
                chunks: 'all',
                minSize: 20000,
                maxSize: 244000,
                cacheGroups: {
                    // 第三方库分包
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                        priority: 10,
                        reuseExistingChunk: true
                    },
                    // ECharts单独分包
                    echarts: {
                        test: /[\\/]node_modules[\\/]echarts/,
                        name: 'echarts',
                        chunks: 'all',
                        priority: 20,
                        reuseExistingChunk: true
                    },
                    // Vue相关库分包
                    vue: {
                        test: /[\\/]node_modules[\\/](vue|vuex|vue-router)/,
                        name: 'vue',
                        chunks: 'all',
                        priority: 20,
                        reuseExistingChunk: true
                    },
                    // 公共代码分包
                    common: {
                        name: 'common',
                        minChunks: 2,
                        priority: 5,
                        chunks: 'all',
                        reuseExistingChunk: true
                    }
                }
            });
        }

        // 图片压缩处理
        const imagesRule = config.module.rule('images');
        imagesRule.uses.clear();
        imagesRule
            .type('asset')
            .set('parser', { dataUrlCondition: { maxSize: 8192 } })
            .set('generator', { filename: 'images/[name].[hash:8][ext]' });

        // 字体文件处理
        const fontsRule = config.module.rule('fonts');
        fontsRule.uses.clear();
        fontsRule
            .type('asset/resource')
            .set('generator', { filename: 'fonts/[name].[hash:8][ext]' });
    },

    // CSS相关配置
    css: {
        extract: process.env.NODE_ENV === 'production',
        sourceMap: process.env.NODE_ENV !== 'production',
        loaderOptions: {
            less: {
                lessOptions: {
                    javascriptEnabled: true
                }
            }
        }
    },

    // 生产环境source map配置
    productionSourceMap: false
};
