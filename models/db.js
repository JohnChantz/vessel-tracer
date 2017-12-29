var mongoose = require('mongoose');

var dbUrl = 'mongodb://localhost:27017/myDatabase';

mongoose.connect(dbUrl, { useMongoClient: true });

mongoose.connection.on('connected', function () {
    console.log('Successfull mongoose connection to ' + dbUrl);
});

mongoose.connection.on('error', function (err) {
    console.log('Mongoose default connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', function () {
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
}); 