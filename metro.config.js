const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Fix socket.io-client Metro resolution
config.resolver.sourceExts.push('cjs', 'mjs');

module.exports = withNativeWind(config, { input: "./global.css" });
