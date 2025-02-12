// metro.config.js
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {};

module.exports = (() => {
  const defaultConfig = getDefaultConfig(__dirname);

  // Add '.tflite' to assetExts
  defaultConfig.resolver.assetExts.push('tflite');

  // Merge your custom config (currently empty) with the modified default
  return mergeConfig(defaultConfig, config);
})();
