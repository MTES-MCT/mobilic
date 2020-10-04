const { createProxyMiddleware } = require("http-proxy-middleware");
module.exports = function(app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: process.env.REACT_APP_API_HOST,
      changeOrigin: true,
      pathRewrite: function(path, req) {
        return path.replace("/api", "");
      }
    })
  );
};
