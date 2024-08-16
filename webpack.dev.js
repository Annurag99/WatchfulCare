"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/***********************************************************
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License
 **********************************************************/
const webpack_1 = require("webpack");
const webpack_merge_1 = require("webpack-merge");
const webpack_common_1 = require("./webpack.common");
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // tslint:disable-line: no-var-requires
const config = (0, webpack_merge_1.merge)(webpack_common_1.default, {
    mode: 'development',
    // Enable sourcemaps for debugging webpack's output.
    devtool: 'source-map',
    module: {
        rules: [
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader', exclude: /node_modules/ },
            {
                test: /\.(scss|css)$/,
                use: [
                    { loader: 'style-loader' },
                    MiniCssExtractPlugin.loader,
                    { loader: 'css-loader', options: { sourceMap: true } },
                    { loader: 'sass-loader', options: { sourceMap: true, implementation: require('sass') } }
                ]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // all options are optional
            chunkFilename: '[id].css',
            filename: '[name].css',
            ignoreOrder: false, // Enable to remove warnings about conflicting order
        }),
        new webpack_1.NormalModuleReplacementPlugin(/(.*)appConfig.ENV(\.*)/, resource => resource.request = resource.request.replace(/ENV/, 'dev'))
    ],
    devServer: {
        compress: true,
        historyApiFallback: true,
    }
});
exports.default = config;
