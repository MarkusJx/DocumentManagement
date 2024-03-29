const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

// noinspection WebpackConfigHighlighting
module.exports = {
    target: "electron-renderer",
    entry: [
        path.resolve(__dirname, 'renderer.ts')
    ],
    output: {
        path: path.resolve(__dirname, '..', '..', "out"),
        filename: "renderer.bundled.js"
    },
    module: {
        rules: [
            {
                // loads .html files
                test: /\.(html)$/,
                include: path.resolve(__dirname, "..", "ui"),
                use: {
                    loader: "html-loader",
                    options: {
                        sources: {
                            "list": [{
                                "tag": "img",
                                "attribute": "data-src",
                                "type": "src"
                            }]
                        }
                    }
                }
            },
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
            // loads .css files
            {
                test: /\.(css|scss|sass)$/,
                include: [
                    path.resolve(__dirname, '..', "styles"),
                    path.resolve(__dirname, '..', '..', "node_modules/"),
                ],
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "sass-loader"
                ],
                resolve: {
                    extensions: [".css", ".scss", ".sass"]
                }
            },
            // loads common image formats
            {
                test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
                use: "url-loader"
            },
        ]
    },
    plugins: [
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
            title: "Document management",
            template: path.resolve(__dirname, '..', 'ui', 'index.hbs')
        })
    ]
}