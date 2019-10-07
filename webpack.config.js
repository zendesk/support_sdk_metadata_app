/* eslint-env node */
const path = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TranslationsPlugin = require('./webpack/translations-plugin')
const externalAssets = require('./src/lib/javascripts/external_assets')

module.exports = {
  entry: {
    app: [
      'babel-polyfill',
      './src/javascripts/index.js',
      './src/stylesheets/app.scss'
    ]
  },

  output: {
    path: path.resolve(__dirname, './dist/assets'),
    filename: 'main.js',
    sourceMapFilename: '[file].map'
  },

  // list of which loaders to use for which files
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      enforce: 'pre',
      loader: 'eslint-loader'
    },
    {
      test: /\.(gif|jpe?g|png|svg|woff2?|ttf|eot)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 10000
        }
      }
    },
    {
      test: /\.scss$/,
      use: ExtractTextPlugin.extract({
        use: ['css-loader', 'sass-loader']
      })
    },
    {
      test: /\.json$/,
      include: path.resolve(__dirname, './src/translations'),
      loader: './webpack/translations-loader'
    },
    {
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    },
    {
      test: /\.(handlebars|hd?bs)$/,
      loader: 'handlebars-loader',
      options: {
        extensions: ['.handlebars', '.hdbs', '.hbs'],
        runtime: 'handlebars',
        inlineRequires: '/images/'
      }
    },
    {
      test: /\.json$/,
      exclude: path.resolve(__dirname, './src/translations'),
      use: 'json-loader'
    }
    ]
  },

  resolve: {
    modules: ['node_modules', path.resolve(__dirname, './src/lib/javascripts')],
    alias: {
      app_manifest: path.resolve(__dirname, './src/manifest.json')
    }
  },

  externals: {
    handlebars: 'Handlebars',
    jquery: 'jQuery',
    lodash: '_',
    moment: 'moment',
    zendesk_app_framework_sdk: 'ZAFClient'
  },

  plugins: [

    // Empties the dist folder
    new CleanWebpackPlugin(['dist/*']),

    // Copy over some files
    new CopyWebpackPlugin([{
      from: 'src/manifest.json',
      to: '../',
      flatten: true
    },
    {
      from: 'src/images/spinner.gif',
      to: '.',
      flatten: true
    },
    {
      from: 'src/images/logo.png',
      to: '.',
      flatten: true
    },
    {
      from: 'src/images/logo-small.png',
      to: '.',
      flatten: true
    },
    {
      from: 'src/images/screenshot*',
      to: '.',
      flatten: true
    }
    ]),

    // Take the css and put it in main.css
    new ExtractTextPlugin('main.css'),

    new TranslationsPlugin({
      path: path.resolve(__dirname, './src/translations')
    }),

    // Does the HTML magic
    new HtmlWebpackPlugin({
      warning: 'AUTOMATICALLY GENERATED FROM ./src/lib/templates/ticket_sidebar.hdbs - DO NOT MODIFY THIS FILE DIRECTLY',
      vendorCss: externalAssets.css,
      vendorJs: externalAssets.js,
      template: '!!handlebars-loader!./src/templates/ticket_sidebar.hdbs'
    })
  ]

}
