/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const path = require('path');

const projectPath = path.resolve(__dirname);
// include node_modules from our workspace in the parent directory
const rootPath = path.resolve(__dirname, '../');

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  watchFolders: [projectPath, rootPath],
};
