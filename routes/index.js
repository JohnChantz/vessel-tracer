var express = require('express');
var router = express.Router();
var assert = require('assert');
var mongodb = require('mongodb');
var mongoose = require('mongoose');

//setup mongoose
// var dbUrl = 'mongodb://localhost:27017/myDatabase';
// mongoose.connect(dbUrl, { useMongoClient: true });
// var db = mongoose.connection;
// var SchemaTypes = mongoose.Schema.Types;
// var shipsDataSchema = new mongoose.Schema({
//     MMSI: Number,
//     IMO: Number,
//     LAT: Number,
//     LON: Number,
//     COURSE: Number,
//     HEADING: Number,
//     SPEED: Number,
//     TIMESTAMP: String,
//     SHIPNAME: String,
//     TYPE_NAME: String,
//     DESTINATION: String
// });
// var ShipsDataModel = mongoose.model('ship', shipsDataSchema, 'ship');

/* GET home page. */
router.get('/leaflet', function (req, res) {
    console.log('-->Home page served');
    res.render('home_L');
});
router.get('/openlayers', function (req, res) {
    console.log('-->Home page served');
    res.render('home_ol');
});

router.get('/test', function (req, res) {
    console.log('-->Test page served');
    res.render('test');
});

//API
// router.get('/coords', function (req, res) {
//     console.log('-->Coords API called');
//     console.log('Data stream to client initiated');
//     var cursor = ShipsDataModel.find().limit(1000).cursor();
//     cursor.map(function (doc) {
//         return transformer(doc);
//     });
//     res.writeHead(200, { 'Content-Type': 'application/json' });
//     res.write('[');
//     // cursor.pipe(res, { end: false });
//     cursor.on('data', function (doc) {
//         res.write(doc);
//         res.write(',');
//     })
//     cursor.on('error', function () {
//         console.log('Error!');
//     });
//     cursor.on('end', function () {
//         res.write('{}');
//         res.end(']')        //end streaming
//         console.log('Stream from MongoDB ended!');
//     });
// });

// function transformer(doc) {
//     var jsonResponse = {};
//     jsonResponse['type'] = 'Feature';
//     jsonResponse['properties'] = {
//         'shipname': doc.SHIPNAME,
//         'MMSI': doc.MMSI,
//         'IMO': doc.IMO,
//         'ship_type': doc.TYPE_NAME,
//         'destination': doc.DESTINATION,
//         'timestamp': doc.TIMESTAMP
//     };
//     var coordintates = [];
//     coordintates.push([doc.LON, doc.LAT])       //d3 must have lon,lat and not lat,lon
//     jsonResponse['geometry'] = { 'type': 'LineString', 'coordinates': coordintates };
//     return JSON.stringify(jsonResponse);
// }

module.exports = router;
