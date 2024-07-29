require("dotenv").config();
const fs = require("fs");
const path = require("path");

const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const package = require("../../package.json");

const browser = process.env.BROWSER || "chrome";
const node_env = process.env.NODE_ENV || "production";

const build_dir = __dirname + "/../../build/" + browser;

function generateManifest() {
  const matches = JSON.parse(fs.readFileSync(path.resolve(__dirname, "site-matches.json"))).matches;

  const isV2 = browser === "firefox";

  const templatePath = path.resolve(__dirname, `${isV2 ? "v2" : "v3"}.manifest.template.json`);

  const manifestTemplate = JSON.parse(fs.readFileSync(templatePath));

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Manifest template not found for browser: ${browser}, at: ${templatePath}`);
  }

  if (isV2) {
    manifestTemplate.permissions = [...manifestTemplate.permissions, ...matches];
  } else {
    manifestTemplate.web_accessible_resources[0].matches = matches;
  }

  manifestTemplate.content_scripts[0].matches = matches;

  if (!fs.existsSync(build_dir)) {
    fs.mkdirSync(build_dir, { recursive: true });
  }

  fs.writeFileSync(
    path.resolve(build_dir, "manifest.json"),
    JSON.stringify(manifestTemplate, null, 2)
  );
}

let entry;
switch (process.env.BROWSER) {
  case "edge":
  case "chrome":
    entry = {
      worker: __dirname + "/../daemon/background/worker.js",
      index: __dirname + "/../daemon/index.js",
      overload: __dirname + "/../daemon/collector/overload/overload.js",
      ["fetch-overload"]: __dirname + "/../daemon/collector/overload/fetch-overload.js",
      ["inline-collector"]: __dirname + "/../daemon/collector/content/inline-collector.js",
      ["notification-modal"]: __dirname + "/../daemon/notification-modal.js",
    };
    break;

  case "firefox":
    entry = {
      index: __dirname + "/../daemon/index.js",
      background: __dirname + "/../daemon/background/background.js",
      overload: __dirname + "/../daemon/collector/overload/overload.js",
      ["fetch-overload"]: __dirname + "/../daemon/collector/overload/fetch-overload.js",
      ["inline-collector"]: __dirname + "/../daemon/collector/content/inline-collector.js",
      ["notification-modal"]: __dirname + "/../daemon/notification-modal.js",
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
        { from: __dirname + "/_locales", to: build_dir + "/_locales" },
        { from: __dirname + "/wtm_logo_128.png", to: build_dir + "/wtm_logo_128.png" },
        {
          from: __dirname + "/wtm_logo_notification_128.png",
          to: build_dir + "/wtm_logo_notification_128.png",
        },
        {
          from: __dirname + "/fonts",
          to: build_dir + "/fonts",
        },
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
    {
      apply: (compiler) => {
        compiler.hooks.emit.tapAsync("GenerateManifestPlugin", (_compilation, callback) => {
          try {
            generateManifest();
            callback();
          } catch (err) {
            callback(err);
          }
        });
      },
    },
  ],
  optimization: {
    minimize: false,
  },
};
