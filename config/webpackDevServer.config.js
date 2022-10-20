const paths = require("./paths");

const { setup } = require("./util");

module.exports = setup({
  devServer: {
    historyApiFallback: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        pathRewrite: { "^/api": "" }
      }
    }
  },
  context: __dirname,
  entry: paths.appPublic,
  output: {
    filename: "bundle.js"
  },
  stats: {
    colors: true
  }
});
