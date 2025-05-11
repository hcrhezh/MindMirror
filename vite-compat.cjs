// This file provides CommonJS compatibility for deployments
// It can be used by Railway to build the application properly

const path = require('path');

module.exports = {
  clientSrcPath: path.resolve(__dirname, 'client/src'),
  rootPath: path.resolve(__dirname, '.'),
  assetsPath: path.resolve(__dirname, 'attached_assets'),
  resolvePath: function(relativePath) {
    return path.resolve(this.rootPath, relativePath);
  }
};