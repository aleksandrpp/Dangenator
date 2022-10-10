import CopyWebpackPlugin from 'copy-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCSSExtractPlugin from 'mini-css-extract-plugin'

import { fileURLToPath } from 'url'
import { dirname, resolve as resolvePath } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const resolve = path => resolvePath(__dirname, path)

export const commonConfiguration = {
    entry: resolve('../src/index.js'),
    output: {
        filename: 'bundle.[contenthash].js',
        path: resolve('../public'),
    },
    devtool: 'source-map',
    plugins: [
        new CopyWebpackPlugin({
            patterns: [{ from: resolve('../static') }],
        }),
        new HtmlWebpackPlugin({
            template: resolve('../src/index.html'),
            minify: true,
        }),
        new MiniCSSExtractPlugin(),
    ],
    module: {
        rules: [
            { test: /\.(html)$/, use: ['html-loader'] },
            { test: /\.?js$/, exclude: /node_modules/, use: ['babel-loader'] },
            { test: /\.css$/, use: [MiniCSSExtractPlugin.loader, 'css-loader'] },
        ],
    },
}
