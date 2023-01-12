const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const autoprefixer = require('autoprefixer');

const PAGES_PATH = path.resolve(__dirname, 'source/src/pages');
const BUILD_PATH = path.resolve(__dirname, 'source/build');
const APP_PATH = fs.realpathSync(process.cwd());
const IMAGE_INLINE_SIZE_LIMIT = parseInt(process.env.IMAGE_INLINE_SIZE_LIMIT, 10) || 8192; // 8 Kb

function pagesList(pagesPath = path.resolve(APP_PATH, PAGES_PATH), filePaths = []) {
  const pages = fs.readdirSync(pagesPath);

  pages.forEach(function (page) {
    const filePath = `${pagesPath}/${page}`;
    const fsStat = fs.statSync(filePath);

    if (fsStat.isDirectory()) {
      pagesList(filePath, filePaths);
    } else if (fsStat.isFile() && /\.ejs$/.test(filePath)) {
      filePaths.push(`${path.parse(filePath).dir}/${path.parse(filePath).name}`);
    }
  });

  return filePaths;
}

function addHtmlPlugin(pages) {
  const result = pages.map((page) => {
    const generateHtmlPages = new HtmlWebpackPlugin({
      filename: `${page.replace(PAGES_PATH, BUILD_PATH)}.html`,
      template: `${page}.ejs`,
    });

    return generateHtmlPages;
  });

  return result;
}

module.exports = (env, args) => {
  return {
    entry: path.resolve(__dirname, './source/src/main.js'),
    output: {
      path: path.resolve(__dirname, 'source/build'),
      filename: 'script/main.js',
    },
    devtool: args.mode === 'development' &&'source-map',
    module: {
      rules: [
        {
          test: /\.ejs$/i,
          use: ['html-loader', 'template-ejs-loader'],
        },
        {
          test: /\.s?(c|a)ss$/,
          use: [
          {
            loader: MiniCssExtractPlugin.loader,
          }, 
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  autoprefixer({
                    overrideBrowserslist: ['ie >= 8', 'last 4 version']
                  })
                ]
              }
            }
          }, 
          {
            loader: 'sass-loader'
          }],
        },
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
        {
          test: /\.(png|jpe?g|gif|bmp|svg|ico)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: IMAGE_INLINE_SIZE_LIMIT,
            },
          },
          generator: {
            filename: 'image/[name].[contenthash:8][ext]',
          },
        },
        {
          test: /\.(eot|ttf|woff2?)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[contenthash:8][ext]',
          },
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: 'css/style.css',
      }),
    ].concat(addHtmlPlugin(pagesList())),
  }
};
