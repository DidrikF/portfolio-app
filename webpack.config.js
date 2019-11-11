const path = require("path");


const frontendWebpackConfig = {
  mode: "development",
  target: "web",
  devtool: 'inline-source-map',
  entry: {
    app: ["./src/index.tsx"],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: '[name].js'
  },
  plugins: [require('webpack-fail-plugin')],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
          configFile: "./tsconfig.client.json",
        },
        exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/,


      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
        exclude: /node_modules/,

      },
      
      {
        test: /\.css/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',

        ],
        exclude: /node_modules/,

      },
      
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: 'file-loader',
        exclude: /node_modules/,

      },
      {
        test: /\.svg$/,
        // include: [path.resolve(__dirname, './src/components/rich-text/react-quill/quill/assets/icons')], // /assets/icons
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: true,
            },
          },
        ],
        exclude: /node_modules/,

      }
    ]
  },
}


const backendWebpackConfig = {
  mode: "development",
  target: "node",
  devtool: 'source-map',
  entry: {
    server: ["./server/index.ts"],
  },
  resolve: {
    extensions: ['.ts', '.js' ],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: '[name].js'
  },
  plugins: [require('webpack-fail-plugin')],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
          configFile: "tsconfig.server.json",
        },
        // exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        // exclude: /node_modules/,
      },
    ]
  },
}

module.exports = backendWebpackConfig
