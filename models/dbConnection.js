let mongoose = require('mongoose');

let dbUrl = 'mongodb://localhost:27017/myDatabase';

mongoose.connect(dbUrl, {
    useMongoClient: true
});

mongoose.connection.on('connected', () => {
    console.log('Successfull mongoose connection to ' + dbUrl);
});

mongoose.connection.on('error', (err) => {
    console.log('Mongoose default connection error: ' + err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});