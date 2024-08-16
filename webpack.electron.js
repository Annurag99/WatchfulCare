"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/***********************************************************
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License
 **********************************************************/
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin; // tslint:disable-line: no-var-requires
const webpack = require("webpack");
const webpack_merge_1 = require("webpack-merge");
const webpack_common_1 = require("./webpack.common");
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // tslint:disable-line: no-var-requires
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin'); // tslint:disable-line: no-var-requires
const config = (0, webpack_merge_1.merge)(webpack_common_1.default, {
    mode: 'production',
    module: {
        rules: [
            {
                test: /.s?css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            }
        ]
    },
    optimization: {
        minimizer: [new CssMinimizerPlugin({})]
    },
    plugins: [
        // new BundleAnalyzerPlugin(),
        new MiniCssExtractPlugin({
        // // Options similar to the same options in webpackOptions.output
        // // all options are optional
        // chunkFilename: '[id].[hash].optimize.css',
        // filename: '[name].[hash].optimize.css',
        // ignoreOrder: false, // Enable to remove warnings about conflicting order
        }),
        new webpack.NormalModuleReplacementPlugin(/(.*)appConfig.ENV(\.*)/, resource => resource.request = resource.request.replace(/ENV/, 'electron'))
    ]
});
exports.default = config;
