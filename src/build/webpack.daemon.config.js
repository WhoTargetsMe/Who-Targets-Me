require("dotenv").config();
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const package = require("../../package.json");

const browser = process.env.BROWSER || "chrome";
const node_env = process.env.NODE_ENV || "production";

const build_dir = __dirname + "/../../build/" + browser;

let entry;
switch (process.env.BROWSER) {
  case "chrome":
    entry = {
      worker: __dirname + "/../daemon/background/worker.js",
      initOverload: __dirname + "/../daemon/collector/overload/initOverload.js",
      overload: __dirname + "/../daemon/collector/overload/overload.js",
    };
    break;

  case "firefox":
    entry = {
      index: __dirname + "/../daemon/index.js",
      overload: __dirname + "/../daemon/collector/overload/overload.js",
    };
    break;

  default:
    throw "process.env.BROWSER must be defined";
}

module.exports = {
  mode: node_env,
  entry: entry,
  output: {
    path: build_dir + "/daemon",
    filename: "[name].js",
  },
  devtool: "source-map",
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: __dirname + "/" + browser + ".manifest.json", to: build_dir + "/manifest.json" },
        { from: __dirname + "/_locales", to: build_dir + "/_locales" },
        { from: __dirname + "/wtm_logo_128.png", to: build_dir + "/wtm_logo_128.png" },
      ],
    }),
    new webpack.DefinePlugin({
      "process.env.RESULTS_URL": process.env.OFFLINE
        ? JSON.stringify(package.resultsUrlLocal)
        : JSON.stringify(package.resultsUrl),
      "process.env.DATA_API_URL": process.env.OFFLINE
        ? JSON.stringify(package.dataApiLocal)
        : JSON.stringify(package.dataApi),
      "process.env.BROWSER": JSON.stringify(process.env.BROWSER) || "",
    }),
  ],
  optimization: {
    minimize: false,
  },
};
