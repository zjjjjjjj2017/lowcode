// vue.config.js
module.exports = {
    configureWebpack: {
        module: {
            rules: [
                {
                    test: /\.mjs$/,
                    include: /node_modules/,
                    type: "javascript/auto"
                },
            ]
        }
    },
    build: {
        // Template for index.html
        index: path.resolve(__dirname, '/docs/index.html'),  //之前是'../dist/index.html'

        // Paths
        assetsRoot: path.resolve(__dirname, '/docs'),  // 之前是 '../dist'
        assetsSubDirectory: 'static',
        assetsPublicPath: './',    // 之前是 '/'
    }
}
