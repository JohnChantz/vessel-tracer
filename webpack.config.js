let path = require('path');

module.exports = {
    entry: './public/javascripts/scripts.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/dist'
    },
    module: {
        loaders: [{
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            }, {
                test: /\.css$/,
                user: [
                    'style-loader',
                    'css-loader'
                ]
            }

        ]
    }
};