// const webpack = require('webpack');

// module.exports = {
//     webpack: {
//         configure: {
//             resolve: {
//                 fallback: {
//                     crypto: require.resolve('crypto-browserify'),
//                     stream: require.resolve('stream-browserify'),
//                     util: require.resolve('util/'),
//                     vm: require.resolve('vm-browserify') // Add vm fallback
//                 }
//             }
//         }
//     }
// };


const webpack = require('webpack');
const CracoAlias = require('craco-alias');


module.exports = {
    webpack: {
        configure: (webpackConfig, { env, paths }) => {
            // Add DefinePlugin to define process environment variables globally
            webpackConfig.plugins = [
                // new webpack.ProvidePlugin({
                //     process: 'process/browser' // This ensures `process` is available globally
                // }),

                // new webpack.DefinePlugin({
                //     'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV), // Define NODE_ENV explicitly
                //     'process.browser': JSON.stringify(true)
                // }),
            ];

            // Add fallback configurations for Node.js core modules not supported in the browser
            webpackConfig.resolve = {
                ...webpackConfig.resolve, // Spread existing resolve configurations
                fallback: {
                    ...webpackConfig.resolve.fallback, // Spread existing fallbacks if any
                    crypto: require.resolve('crypto-browserify'),
                    stream: require.resolve('stream-browserify'),
                    util: require.resolve('util/'),
                    vm: require.resolve('vm-browserify') // Add vm fallback
                }
            };

            return webpackConfig;
        }
    },
    plugins: [
        {
            plugin: CracoAlias,
            options: {
                source: 'tsconfig',
                baseUrl: './',
                tsConfigPath: 'tsconfig.json'
            }
        }
    ],
};
