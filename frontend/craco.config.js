const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Usamos ProvidePlugin para inyectar "process" globalmente
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: "process/browser"
        })
      );
      return webpackConfig;
    }
  },
  babel: {
    plugins: [
      ["@babel/plugin-proposal-class-properties", { loose: true }],
      ["@babel/plugin-proposal-private-methods", { loose: true }],
      ["@babel/plugin-proposal-private-property-in-object", { loose: true }]
    ]
  }
};
