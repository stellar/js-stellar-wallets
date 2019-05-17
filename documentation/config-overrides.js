const rewireStyledComponents = require("react-app-rewire-styled-components");

/* config-overrides.js */
module.exports = function override(config, env) {
  config = rewireStyledComponents(config, env, { ssr: false });

  // 0 is parse
  // 1 is eslint pre-loader
  // 2 is where we want to add loaders
  let didAddLoaders = false;
  for (let rule of config.module.rules) {
    if (rule.oneOf && !didAddLoaders) {
      rule.oneOf.unshift({
        test: /\.md$/,
        use: "raw-loader",
      });
      didAddLoaders = true;
    }
  }

  return config;
};
