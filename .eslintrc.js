const { getBaseConfig } = require("@edx/frontend-build");
const withDojoPreset = require("@reustleco/dojo-frontend-common/configs/eslint");

module.exports = withDojoPreset(getBaseConfig("eslint"));

