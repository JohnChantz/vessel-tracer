var mongoose = require('mongoose');

var shipsDataSchema = new mongoose.Schema({
    MMSI: Number,
    IMO: Number,
    LAT: Number,
    LON: Number,
    COURSE: Number,
    HEADING: Number,
    SPEED: Number,
    TIMESTAMP: String,
    SHIPNAME: String,
    TYPE_NAME: String,
    DESTINATION: String
});
var ShipsDataModel = mongoose.model('shipsGeoData', shipsDataSchema, 'shipsGeoData');

var transformer = function (doc) {
    var jsonResponse = {};
    jsonResponse['type'] = 'Feature';
    jsonResponse['properties'] = {
        'shipname': doc.SHIPNAME,
        'MMSI': doc.MMSI,
        'IMO': doc.IMO,
        'ship_type': doc.TYPE_NAME,
        'destination': doc.DESTINATION,
        'timestamp': doc.TIMESTAMP
    };
    var coordintates = [];
    coordintates.push(doc.LAT, doc.LON)       //d3 must have lon,lat and not lat,lon
    jsonResponse['geometry'] = { 'type': 'LineString', 'coordinates': coordintates };
    return jsonResponse;
}

module.exports = {
    shipsDataSchema: shipsDataSchema,
    ShipsDataModel: ShipsDataModel,
    transformer
}
