const config = require('./project-config');
const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');

class CreateDirectoryPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.beforeRun.tapAsync('CreateDirectoryPlugin', (compilation, callback) => {
      this.options.directories.forEach((dir) => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      });
      callback();
    });
  }
}

class RemoveFilePlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.done.tap('CustomTaskPlugin', () => {
      const files = this.options.files;
      Object.keys(files).forEach(key => {
        try {
          const file = files[key].match(/\/([^\/]+)\.scss$/)[1];
          const assetPath = path.resolve(__dirname, `${config.paths.dirs.dist.css}/${file}.js`);
          if (fs.existsSync(assetPath)) {
            fs.unlinkSync(assetPath);
          }
        } catch (e) {
          console.log(e);
        }
      })
    });
  }
}

module.exports = [
  {
    mode: 'production',
    entry: config.paths.files.src.js,
    output: {
      filename: '[name].min.js',
      path: path.resolve(__dirname, config.paths.dirs.dist.js),
      clean: false,
      sourceMapFilename: '[name].min.js.map',
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          resolve: {
            extensions: ['.js', '.jsx'],
          },
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
              ],
            },
          },
        },
      ],
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          parallel: true,
          extractComments: false,
        }),
      ],
    },
    plugins: [
      new ESLintPlugin({ extensions: ['js', 'jsx'] }),
      new CreateDirectoryPlugin({
        directories: [
          path.resolve(__dirname, config.paths.dirs.dist.css),
          path.resolve(__dirname, config.paths.dirs.dist.js)
        ]
      })
    ],
    devtool: 'source-map',
  },
  {
    mode: 'production',
    entry: config.paths.files.src.scss,
    ignoreWarnings: [
      (warning) => {
        return warning.message.includes('Deprecation Warning') || warning.message.includes('Module Warning');
      },
    ],
    output: {
      path: path.resolve(__dirname, config.paths.dirs.dist.css),
    },
    module: {
      rules: [
        {
          test: /\.s[ac]ss$/i,
          use: [
            MiniCssExtractPlugin.loader,
            { loader: "css-loader", options: { sourceMap: true, url: false } },
            'postcss-loader',
            { loader: "sass-loader", options: { sourceMap: true } },
          ],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({ filename: '[name].min.css' }),
      new StylelintPlugin({ files: `${config.paths.dirs.src.scss}/**/*.{scss,sass,css}` }),
      new RemoveFilePlugin({ files: config.paths.files.src.scss }), 
    ],
    devtool: 'source-map',
  }
];
