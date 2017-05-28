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
    publicPath: '/react/build/'
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
          name: '[path][name].[hash].[ext]',
        },
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({use: "css-loader"})
        // Note: this won't work without `new ExtractTextPlugin()` in `plugins`.
      },
      {
        exclude: /\.(jpg|png|svg)$/,
        test : /\.js?/,
        include : APP_DIR,
        loader : 'babel-loader'
      },
      {
        exclude: /\.(jpg|png|svg)$/,
        test: /\.less$/,
        use: [{
            loader: "style-loader" // creates style nodes from JS strings
        }, {
            loader: "css-loader" // translates CSS into CommonJS
        }, {
            loader: "less-loader" // compiles Less to CSS
        }]
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("styles.css"),
  ]
};

module.exports = config;
