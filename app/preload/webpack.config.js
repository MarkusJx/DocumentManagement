const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const path = require("path");
const nodeExternals = require('webpack-node-externals');

module.exports = {
    target: "electron-preload",
    entry: [
        path.resolve(__dirname, "index.tsx")
    ],
    output: {
        path: path.resolve(__dirname, '..', '..', "out"),
        filename: "preload.bundled.js"
    },
    externalsPresets: {
        node: true
    },
    externals: [nodeExternals()],
    resolve: {
        fallback: {
            "buffer": require.resolve("buffer/"),
            "path": require.resolve("path-browserify"),
        }
    },
    module: {
        rules: [
            // loads .js/jsx files
            {
                test: /\.(tsx|jsx|ts|js)$/,
                include: [
                    __dirname,
                    path.resolve(__dirname, "..", "shared")
                ],
                exclude: [
                    path.resolve(__dirname, "webpack.config.js")
                ],
                loader: "babel-loader",
                resolve: {
                    extensions: [".ts", ".tsx", ".json", ".js", ".jsx"]
                }
            },
            {
                test: /\.node$/,
                loader: "node-loader",
            }
        ]
    },
    plugins: [
        // fix "process is not defined" error;
        // https://stackoverflow.com/a/64553486/1837080
        new webpack.ProvidePlugin({
            //process: "process/browser.js",
        }),
        new MiniCssExtractPlugin()
    ]
};