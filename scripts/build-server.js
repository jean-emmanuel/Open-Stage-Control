var build = require('./build'),
    babelify = require('babelify')

build({
    input: '../src/server/index.js',
    output: '../app/server/open-stage-control-server.js',
    options: {
        commonDir: false,
        ignoreMissing: true,
        debug: true,
        builtins: false,
        commondir: false,
        insertGlobalVars: {
            __filename: true,
            __dirname: true,
            process: true,
            electron: true,
            global: true
        },
        browserField: false,
    },
    ignore: 'serialport',
    exclude: [
        'electron',
        './fsevents.node'  // osx binary module, to be copied as is
    ]
})()
