"use strict"
const path = require("path")
const defaultSettings = require("./src/settings.js")

function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = defaultSettings.title || "后台管理"

module.exports = {
  publicPath: "/",
  outputDir: "dist",
  assetsDir: "static",
  lintOnSave: process.env.NODE_ENV === "development",
  productionSourceMap: false,
  devServer: {
    host: "127.0.0.1",
    port: 8888,
    // proxy: {
    //   "dev-api": {
    //     target: "",
    //     changeOrigin: true,
    //     pathRewrite: { "^/dev-api": "" }
    //   }
    // },
    before: require("./mock/mock-server.js")
  },
  configureWebpack: {
    name: name,
    resolve: {
      alias: {
        "@": resolve("src")
      }
    }
  },
  chainWebpack(config) {
    config.plugin("preload").tap(() => [
      {
        rel: "preload",
        fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
        include: "initial"
      }
    ])
    
    config.plugins.delete("prefetch")
    
    config.module
      .rule("svg")
      .exclude.add(resolve("src/icons"))
      .end()
    config.module
      .rule("icons")
      .test(/\.svg$/)
      .include.add(resolve("src/icons"))
      .end()
      .use("svg-sprite-loader")
      .loader("svg-sprite-loader")
      .options({
        symbolId: "icon-[name]"
      })
      .end()
    
    config
      .when(process.env.NODE_ENV !== "development",
        config => {
          config
            .plugin("ScriptExtHtmlWebpackPlugin")
            .after("html")
            .use("script-ext-html-webpack-plugin", [{ inline: /runtime\..*\.js$/ }])
            .end()
          config
            .optimization.splitChunks({
            chunks: "all",
            cacheGroups: {
              libs: {
                name: "chunk-libs",
                test: /[\\/]node_modules[\\/]/,
                priority: 10,
                chunks: "initial"
              },
              elementUI: {
                name: "chunk-elementUI",
                priority: 20,
                test: /[\\/]node_modules[\\/]_?element-ui(.*)/
              },
              commons: {
                name: "chunk-commons",
                test: resolve("src/components"),
                minChunks: 3,
                priority: 5,
                reuseExistingChunk: true
              }
            }
          })
          config.optimization.runtimeChunk("single")
        }
      )
  }
}
