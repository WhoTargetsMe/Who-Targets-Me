var CopyWebpackPlugin = require('copy-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin')

var build_dir = __dirname + '/../../build/chrome';


module.exports = {
    entry: __dirname + "/../daemon/index.js",
    output: {
        path: build_dir + '/daemon',
        filename: "index.js"
    },
    plugins: [
      new CleanWebpackPlugin([ build_dir + '/*' ], {root: build_dir}),
      new CopyWebpackPlugin([
        { from: __dirname + '/manifest.json', to: build_dir + '/manifest.json' },
        { from: __dirname + '/logo-128.png', to: build_dir + '/logo-128.png' },
      ])
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['env']
            }
          }
        }
      ]
    }
};
