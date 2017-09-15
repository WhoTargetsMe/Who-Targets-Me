var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CopyWebpackPlugin = require('copy-webpack-plugin');
var package = require('../../package.json');

var browser = process.env.BROWSER || 'chrome';
var BUILD_DIR = path.resolve(__dirname, '../../build/' + browser + '/frontend');
var APP_DIR = path.resolve(__dirname, '../frontend');

var config = {
  entry: APP_DIR + '/index.js',
  output: {
    path: BUILD_DIR,
    filename: 'index.js',
    publicPath: '/frontend'
  },
  module : {
    loaders : [
      {
        exclude: [
          /\.html$/,
          /\.(js|jsx)$/,
          /\.css$/,
          /\.json$/,
          /\.less$/,
        ],
        loader: 'file-loader',
        options: {
          name: '/assets/[name].[hash].[ext]',
        },
      },
      {
        test: /\.(css|less)$/,
        loader: ExtractTextPlugin.extract({use: [{loader: "css-loader"}, {loader: "less-loader"}]})
      },
      {
        exclude: /\.(jpg|png|svg)$/,
        test : /\.js?/,
        include : APP_DIR,
        loader : 'babel-loader'
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("assets/styles.css"),
    new CopyWebpackPlugin([
      { from: APP_DIR + '/index.html', to: BUILD_DIR + '/index.html' },
    ]),
    new webpack.DefinePlugin({
      API_URL: (process.env.OFFLINE === "true") ? JSON.stringify(package.apiUrlLocal) : JSON.stringify(package.apiUrl)
    }),
  ],
  devServer: {
    compress: true,
  }
};

module.exports = config;
