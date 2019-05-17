const rewireStyledComponents = require("react-app-rewire-styled-components");

/* config-overrides.js */
module.exports = function override(config, env) {
  config = rewireStyledComponents(config, env, { ssr: false });

  // 0 is parse
  // 1 is eslint pre-loader
  // 2 is what we want to modify oneOf
  config.module.rules[2].oneOf.unshift({
    test: /\.md$/,
    use: "raw-loader",
  });

  console.log(JSON.stringify(config.module.rules, null, 2));

  return config;
};
