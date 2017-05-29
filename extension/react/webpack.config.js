var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var BUILD_DIR = path.resolve(__dirname, 'build');
var APP_DIR = path.resolve(__dirname, 'src');

var config = {
  entry: APP_DIR + '/index.js',
  output: {
    path: BUILD_DIR,
    filename: 'build.js',
    publicPath: 'react/build/'
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
          name: 'assets/[name].[hash].[ext]',
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
  ],
  devServer: {
    compress: true,
  }
};

module.exports = config;
