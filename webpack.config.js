const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env) => {
    var config = {
        entry: {
            "CreateView": "./src/CreateView.tsx",
            "UpdateView": "./src/UpdateView.tsx"
        },
        output: {
            path: path.resolve(__dirname, `./output`),
            filename: "[name].[contenthash].js"
        },
        optimization: {
            moduleIds: 'hashed',
            splitChunks: {
                cacheGroups: {
                    Vendor: {
                        test: /node_modules[\\/]/,
                        enforce: true,
                        name: 'Vendor',
                        chunks: 'all',
                        priority: 1,
                    },
                    OfficeFabric: {
                        test: /node_modules[\\/]((office|@uifabric).*)[\\/]/,
                        enforce: true,
                        name: 'OfficeFabric',
                        chunks: 'all',
                        priority: 2,
                    },
                    FluentUI: {
                        test: /node_modules[\\/]((@fluentui))[\\/]/,
                        enforce: true,
                        name: 'FluentUI',
                        chunks: 'all',
                        priority: 2
                    },
                    FluentUITheme: {
                        test: /node_modules[\\/]((@fluentui).*(themes).*)[\\/]/,
                        enforce: true,
                        name: 'FluentUITheme',
                        chunks: 'all',
                        priority: 3
                    },
                    ActionSDK: {
                        test: /node_modules[\\/]((@microsoft\/m365-action-sdk))[\\/]/,
                        enforce: true,
                        name: 'ActionSDK',
                        chunks: 'all',
                        priority: 2
                    },
                }
            }
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".jsx", ".scss"]
        },
        module: {
            rules: [{
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /\.scss$/,
                loader: [
                    require.resolve('style-loader'), require.resolve('css-loader'), require.resolve('sass-loader')
                ]
            }
            ]
        }
    }

    // Webpack plugins
    config.plugins = [];

    // For each entry there will be one html file
    var entries = Object.keys(config.entry);
    for (var entry of entries) {
        // Exclude other entries from this html
        var excludeChunks = entries.filter(x => x != entry);
        config.plugins.push(new HtmlWebpackPlugin({
            templateContent: '<div id="root"></div>',
            filename: `${entry}.html`,
            excludeChunks: excludeChunks
        }));
    }
    // Process other assets
    var copyAssets = {
        patterns: [
            {
                from: 'actionManifest.json',
                to: path.resolve(__dirname, 'output')
            },
            {
                from: 'actionModel.json',
                to: path.resolve(__dirname, 'output')
            },
            {
                from: 'views',
                to: path.resolve(__dirname, 'output')
            },
            {
                from: 'assets',
                to: path.resolve(__dirname, 'output')
            }
        ]
    };

    config.plugins.push(new CopyWebpackPlugin(copyAssets));
    config.plugins.push(new CleanWebpackPlugin());

    if (env.mode === 'dev') {
        config.mode = 'development';
        config.devtool = 'cheap-module-source-map';
    } else {
        config.mode = 'production'
    }

    if (env.watch === 'true') {
        config.watch = true;
    } else {
        config.watch = false;
    }

    return config;
};