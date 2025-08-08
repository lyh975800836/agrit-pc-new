const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  
  // 开发服务器配置
  devServer: {
    port: 8080,
    open: true,
    client: {
      overlay: {
        warnings: false,
        errors: true
      }
    }
  },

  // CSS相关配置
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          // 全局导入Less变量和混合
          additionalData: `@import "@/styles/variables.less"; @import "@/styles/mixins.less";`
        }
      }
    }
  },

  // 生产环境配置
  productionSourceMap: false,
  
  // 路径别名
  configureWebpack: {
    resolve: {
      alias: {
        '@': require('path').resolve(__dirname, 'src')
      }
    }
  },

  // 链式配置
  chainWebpack: config => {
    // 优化图片加载
    config.module
      .rule('images')
      .test(/\.(png|jpe?g|gif|svg)(\?.*)?$/)
      .use('url-loader')
      .loader('url-loader')
      .options({
        limit: 10000,
        name: 'img/[name].[hash:8].[ext]'
      })

    // 生产环境优化
    if (process.env.NODE_ENV === 'production') {
      // 移除console
      config.optimization.minimizer('terser').tap(args => {
        args[0].terserOptions.compress.drop_console = true
        return args
      })
    }
  }
})
