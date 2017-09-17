var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CopyWebpackPlugin = require('copy-webpack-plugin');
var package = require('../../package.json');

var browser = process.env.BROWSER || 'chrome';

var BUILD_DIR = path.resolve(__dirname, '../../build/' + browser + '/frontend');
var APP_DIR = path.resolve(__dirname, '../frontend');

var CopyWebpackConfig = [
  { from: APP_DIR + '/index.html', to: BUILD_DIR + '/index.html' },
];

if(process.env.OFFLINE) {
  CopyWebpackConfig.push({ from: __dirname + '/dev.html', to: BUILD_DIR + '/dev.html' }, { from: __dirname + '/grid.png', to: BUILD_DIR + '/grid.png' })
}

var config = {
  entry: APP_DIR + '/index.js',
  output: {
    path: BUILD_DIR,
    filename: 'index.js',
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
          name: '[name].[hash].[ext]',
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
    new ExtractTextPlugin("styles.css"),
    new CopyWebpackPlugin(CopyWebpackConfig),
    new webpack.DefinePlugin({
      'process.env.API_URL': process.env.OFFLINE ? JSON.stringify(package.apiUrlLocal) : JSON.stringify(package.apiUrl)
    }),
  ],
  devServer: {
    compress: true,
    port: 3000,
    openPage: 'dev.html',
    open: true,
    https: true
  }
};

module.exports = config;
