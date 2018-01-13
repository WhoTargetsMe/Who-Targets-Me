var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin')
var package = require('../../package.json');

var browser = process.env.BROWSER || 'chrome';

var build_dir = __dirname + '/../../build/' + browser;

module.exports = {
    entry: __dirname + "/../daemon/index.js",
    output: {
        path: build_dir + '/daemon',
        filename: "index.js"
    },
    devtool: 'source-map',
    plugins: [
      new CleanWebpackPlugin([ build_dir + '/*' ], {root: build_dir}),
      new CopyWebpackPlugin([
        { from: __dirname + '/' + browser + '.manifest.json', to: build_dir + '/manifest.json' },
        { from: __dirname + '/_locales', to: build_dir + '/_locales' },
        { from: __dirname + '/logo-128.png', to: build_dir + '/logo-128.png' },
      ]),
      new webpack.DefinePlugin({
        'process.env.API_URL': process.env.OFFLINE ? JSON.stringify(package.apiUrlLocal) : JSON.stringify(package.apiUrl)
      }),
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['env'],
              plugins: ['transform-object-rest-spread']
            }
          }
        }
      ]
    }
};
