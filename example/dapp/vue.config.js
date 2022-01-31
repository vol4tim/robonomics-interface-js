module.exports = {
  transpileDependencies: ["@polkadot"],
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: require.resolve("@open-wc/webpack-import-meta-loader")
        }
      ]
    }
  }
};
