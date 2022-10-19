const paths = require("./paths");

// ("use strict");

// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
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
