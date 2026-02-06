const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optimize transformer for better performance with large files
config.transformer = {
  ...config.transformer,
  // Enable inline requires for better performance
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Reduce max workers to prevent memory overload
config.maxWorkers = 2;

module.exports = config;
