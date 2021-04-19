module.exports = {
    webpackDevMiddlewate: config => {
        config.watchOptions.poll = 300
        return config
    }
}