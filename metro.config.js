const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Reduce max workers to prevent memory overload
config.maxWorkers = 2;

module.exports = config;
