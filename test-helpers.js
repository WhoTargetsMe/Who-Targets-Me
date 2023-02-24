const path = require("path");

const chromeBuildPath = () => {
  return path.join(__dirname, "/extensions/chrome");
};

const firefoxBuildPath = () => {
  return path.join(__dirname, "/extensions/firefox");
};

const edgeBuildPath = () => {
  return path.join(__dirname, "/extensions/edge");
};

exports.chromeBuildPath = chromeBuildPath;
exports.firefoxBuildPath = firefoxBuildPath;
exports.edgeBuildPath = edgeBuildPath;
