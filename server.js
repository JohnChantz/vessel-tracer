const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const io = require('socket.io');
const events = require('events');
var morgan = require('morgan');
const mongoose = require('mongoose');

const model = require('./models/ship');
const db = require('./models/dbConnection');
const index = require('./routes/index');

const app = express();

events.EventEmitter.defaultMaxListeners = 0;
app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), () => {
  console.log('Server listening on port: ' + app.get('port'));
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(favicon(path.join(__dirname, 'public/images', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));

app.use('/', index);

//catch 404 error and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// setup socket.io
var socketio = io(server);
socketio.of('/streamData').on('connection', (socket) => {
  let cursor;
  // console.log('Socket.IO says: New user connected!');

  socket.on('disconnect', (reason) => {
    // console.log('Socket.IO says: User disconected | Reason: ' + reason);
  });
  socket.on('error', (error) => {
    // console.log('Socket.IO says: User disconected | Error: ' + error);
  });
  socket.on('clientReady', () => {
    let skip = 0;
    // console.log('Socket.IO says: Received event from client');
    // console.log('Data stream to client initiated');
    cursor = model.shipModel.find({}, {}, {
      limit: 100
    }); //.cursor();
    cursor.exec((err, data) => {
      socket.emit('data', data);
    });
    // cursor.map((doc) => {
    //   return model.transformer(doc);
    // });
    // cursor.on('data', (doc) => {
    // socket.emit('data', doc);
    // cursor.pause();
    socket.on('moreData', () => {
      skip = skip + 100;
      // cursor.resume();
      cursor = model.shipModel.find({}, {}, {
        limit: 100,
        skip: skip
      }); //.cursor();
      cursor.exec((err, data) => {
        socket.emit('data', data);
      });
    });
    // });
    // cursor.on('error', () => {
    //   console.log('Error!');
    // });
    // cursor.on('end', () => {
    //   console.log('Stream from MongoDB ended!');
    //   socket.emit('done');
    // });
  });
});

module.exports = server;