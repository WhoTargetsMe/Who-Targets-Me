const { execSync } = require("child_process");

const buildExtensionForChrome = () => {
  execSync("npm run build:chrome");
};

const buildExtensionForFirefox = () => {
  execSync("npm run build:firefox");
};

const buildExtensionForEdge = () => {
  execSync("npm run build:edge");
};

exports.buildExtensionForChrome = buildExtensionForChrome;
exports.buildExtensionForFirefox = buildExtensionForFirefox;
exports.buildExtensionForEdge = buildExtensionForEdge;
