
var express     = require('express')(),
    path        = require('path'),
    http        = require('http'),
    server      = http.createServer(express),
    io          = require('socket.io')(),
    ioWildcard  = require('socketio-wildcard')(),
    ipc 		= {},
	settings	= require('./settings'),
    appAddresses = settings.read('appAddresses'),
    clients = {}

express.get('/', function(req, res){
    res.sendFile(path.resolve(__dirname + '/../browser/index.html'))
})
express.get('*', function(req, res){
    res.sendFile(path.resolve(__dirname + '/../browser' + req.path))
})


io.use(ioWildcard)


io.listen(server)

server.listen(settings.read('httpPort'))

ipc.send = function(name,data,clientId) {
    if (clientId) {
        io.to(clientId).emit(name,data)
    } else {
        io.emit(name,data)
    }
}

var bindCallbacks = function(callbacks) {
    io.on('connection', function(socket) {

        clients[socket.id] = socket

        socket.on('*', function(e){
            var name = e.data[0],
                data = e.data[1]


            if (callbacks[name]) callbacks[name](data,socket.id)
        })

        socket.on('disconnect', function() {
            callbacks.removeClientWidgets(socket.id)
        })

    })
}



console.log('App available at ' + appAddresses.join(' & '))

module.exports =  {
	ipc:ipc,
	bindCallbacks:bindCallbacks,
    clients:clients
}
