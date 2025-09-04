const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        app: './src/app.js',
        avatar: './src/avatar.js'
    },
    output: {
        filename: '[name]-bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        port: 8080,
        proxy: {
            '/api': 'http://localhost:3000'
        },
        hot: true
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'src/index.html', to: 'index.html' },
                { from: 'src/avatar.html', to: 'avatar.html' },
                { from: 'src/styles.css', to: 'styles.css' },
                { from: 'src/avatar.css', to: 'avatar.css' },
                { from: 'src/videos', to: 'videos', noErrorOnMissing: true }
            ],
        }),
    ]
};
