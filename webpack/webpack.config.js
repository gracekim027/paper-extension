const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
//const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: "production",
    entry: {
        background: path.resolve(__dirname, "..", "src", "background.ts"),
        author_content: path.resolve(__dirname, '..', 'src', 'author-content.ts'),
        search_content: path.resolve(__dirname, '..', 'src', 'search-content.ts'),
        detail_content: path.resolve(__dirname, '..', 'src', 'detail-content.ts'),
    },
    output: {
        path: path.join(__dirname, "../dist"),
        filename: "[name].js",
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [{from: ".", to: ".", context: "public"}]
        }),
    ],
};
