var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var pug = require('pug');
var io = require('socket.io');
var mongoose = require('mongoose');
var model = require('./models/ship');
var db = require('./models/db')
require('events').EventEmitter.defaultMaxListeners = 0;

var index = require('./routes/index');
var app = express();

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//setup static files
app.use(favicon(path.join(__dirname, 'public/images', 'favicon.ico')));
app.use(express.static('public'));

//setup middleware
app.use('/', index);

//catch 404 error and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

//setup the server with express
var server = app.listen(4000, function () {
    console.log('Server listening on port 4000');
});
// setup socket.io
var socketio = io(server);
socketio.of('/requestData').on('connection', function (socket) {
    var cursor;
    console.log('Socket.IO says: New user connected!');

    socket.on('disconnect', function (reason) {
        console.log('Socket.IO says: User disconected | Reason: ' + reason);
    });
    socket.on('error', function (error) {
        console.log('Socket.IO says: User disconected | Error: ' + error);
    });
    socket.on('clientReady', function () {
        console.log('Socket.IO says: Received event from client');
        console.log('Data stream to client initiated');
        cursor = model.ShipsDataModel.find({}).lean().cursor();
        cursor.map(function (doc) {
            return model.transformer(doc);
        });
        cursor.on('data', function (doc) {
            socket.emit('data', doc);
            cursor.pause();
            socket.on('moreData', function () {
                cursor.resume();
            });
        });
        cursor.on('error', function () {
            console.log('Error!');
        });
        cursor.on('end', function () {
            console.log('Stream from MongoDB ended!');
            socket.emit('done');
        });
    });
});

module.exports = server;
