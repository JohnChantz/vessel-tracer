var io = require('socket.io');
var server = require('./server')

// setup socket.io
function createSocket() {
    var socketio = io(server);
    socketio.of('/requestData').on('connection', function (socket) {
        console.log('Socket.IO says: New user connected!');

        socket.on('disconnect', function (reason) {
            console.log('Socket.IO says: User disconected | Reason: ' + reason);
        });
        socket.on('error', function (error) {
            console.log('Socket.IO says: User disconected | Error: ' + error);
        });
        socket.on('clientEvent', function () {
            console.log('Socket.IO says: Received event from client');
            console.log('Data stream to client initiated');
            var cursor = ShipsDataModel.find().lean().limit(1000000).cursor();
            cursor.map(function (doc) {
                return transformer(doc);
            });
            cursor.on('data', function (doc) {
                socket.emit('serverResponse', doc);
            })
            cursor.on('error', function () {
                console.log('Error!');
            });
            cursor.on('end', function () {
                console.log('Stream from MongoDB ended!');
                socket.emit('done');
            });
        });
    });
}
module.exports = createSocket();
