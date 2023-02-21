const path = require("path");

const chromeBuildPath = () => {
  return path.join(__dirname, "/extensions/chrome/chrome.zip");
};

const firefoxBuildPath = () => {
  return path.join(__dirname, "/extensions/firefox/firefox.zip");
};

const edgeBuildPath = () => {
  return path.join(__dirname, "/extensions/edge/edge.zip");
};

exports.chromeBuildPath = chromeBuildPath;
exports.firefoxBuildPath = firefoxBuildPath;
exports.edgeBuildPath = edgeBuildPath;
