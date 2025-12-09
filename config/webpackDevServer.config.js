const paths = require("./paths");

const { setup } = require("./util");

module.exports = setup({
  devServer: {
    client: {
      overlay: false
    },
    historyApiFallback: {
      rewrites: [
        { from: /^\/developers\/playground/, to: "/api-playground.html" },
        { from: /./, to: "/index.html" }
      ]
    },
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
