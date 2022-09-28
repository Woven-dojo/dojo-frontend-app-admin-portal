const { getBaseConfig } = require("@edx/frontend-build");
const withDojoPreset = require("@woven-dojo/dojo-frontend-common/configs/eslint");

module.exports = withDojoPreset(getBaseConfig("eslint"));
