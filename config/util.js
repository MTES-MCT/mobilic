/* eslint-disable import/no-extraneous-dependencies */

const path = require("path");

module.exports = {
  setup(config) {
    const defaults = { mode: "development", plugins: [], devServer: {} };

    if (config.entry) {
      if (typeof config.entry === "string") {
        config.entry = path.resolve(config.entry);
      } else if (Array.isArray(config.entry)) {
        config.entry = config.entry.map(entry => path.resolve(entry));
      } else if (typeof config.entry === "object") {
        Object.entries(config.entry).forEach(([key, value]) => {
          config.entry[key] = path.resolve(value);
        });
      }
    }

    const result = { ...defaults, ...config };
    const onBeforeSetupMiddleware = ({ app }) => {
      app.get("/.assets/*", (req, res) => {
        const filename = path.join(__dirname, "/", req.path);
        res.sendFile(filename);
      });
    };

    if (result.devServer.setupMiddlewares) {
      const proxy = result.devServer.setupMiddlewares;
      result.devServer.setupMiddlewares = (middlewares, devServer) => {
        onBeforeSetupMiddleware(devServer);
        return proxy(middlewares, devServer);
      };
    } else {
      result.devServer.setupMiddlewares = (middlewares, devServer) => {
        onBeforeSetupMiddleware(devServer);
        return middlewares;
      };
    }

    const output = {
      path: path.dirname(module.parent.filename)
    };

    if (result.output) {
      result.output = { ...result.output, ...output };
    } else {
      result.output = output;
    }

    return result;
  }
};
