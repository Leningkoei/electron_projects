const path = require('path')
const { node } = require('webpack')

module.exports = {
    entry: {
        main: './dist/main.js',
        renderer: './dist/renderer.js'
    },
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },
    mode: 'development'
}
