const path = require("path");


module.exports = {
    mode: "development",
    devtool: 'inline-source-map',
    entry: {
        app: ["./src/index.ts"],
        server: ["./server/index.ts"],
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                include: [
                    path.resolve(__dirname, "src"),
                    path.resolve(__dirname, "server"),
                ],
                exclude: /node_modules/,
                use: ['babel-loader', 'ts-loader'],
            },
            {
                test: /\.jsx?$/,
                include: [
                    path.resolve(__dirname, "src"),
                    path.resolve(__dirname, "server"),
                ],
                use: 'babel-loader',

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
              },
              {
                test: /\.(png|jpe?g|gif)$/i,
                use: ['file-loader'],
              },
        ]
    },


}