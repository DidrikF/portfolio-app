const path = require("path");


module.exports = {
  mode: "development",
  devtool: 'inline-source-map',
  entry: {
    app: ["./src/index.tsx"],
    // server: ["./server/index.ts"],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
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
