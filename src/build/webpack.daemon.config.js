var webpack = require("webpack");
var CopyWebpackPlugin = require("copy-webpack-plugin");
var CleanWebpackPlugin = require("clean-webpack-plugin");
var package = require("../../package.json");

var browser = process.env.BROWSER || "chrome";

var build_dir = __dirname + "/../../build/" + browser;

module.exports = {
  entry: {
    index: __dirname + "/../daemon/index.js",
    overload: __dirname + "/../daemon/collector/overload/overload.js",
    collect: __dirname + "/../daemon/collector/content/collect.js",
  },
  output: {
    path: build_dir + "/daemon",
    filename: "[name].js",
  },
  devtool: "source-map",
  plugins: [
    new CleanWebpackPlugin([build_dir + "/*"], { root: build_dir }),
    new CopyWebpackPlugin([
      { from: __dirname + "/" + browser + ".manifest.json", to: build_dir + "/manifest.json" },
      { from: __dirname + "/_locales", to: build_dir + "/_locales" },
      { from: __dirname + "/wtm_logo_128.png", to: build_dir + "/wtm_logo_128.png" },
    ]),
    new webpack.DefinePlugin({
      "process.env.API_URL": process.env.OFFLINE
        ? JSON.stringify(package.apiUrlLocal)
        : JSON.stringify(package.apiUrl),
      "process.env.RESULTS_URL": process.env.OFFLINE
        ? JSON.stringify(package.resultsUrlLocal)
        : JSON.stringify(package.resultsUrl),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["env"],
            plugins: ["babel-plugin-transform-object-rest-spread"],
          },
        },
      },
    ],
  },
};
