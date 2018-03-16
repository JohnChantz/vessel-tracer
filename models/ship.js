let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let shipSchema = new Schema({
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
let shipModel = mongoose.model('shipsGeoData', shipSchema, 'shipsGeoData');

var transformer = (doc) => {
    let jsonResponse = {};
    jsonResponse.type = 'Feature';
    jsonResponse.properties = {
        'shipname': doc.SHIPNAME,
        'MMSI': doc.MMSI,
        'IMO': doc.IMO,
        'ship_type': doc.TYPE_NAME,
        'destination': doc.DESTINATION,
        'timestamp': doc.TIMESTAMP
    };
    let coordintates = [];
    coordintates.push(doc.LAT, doc.LON); //d3 must have lon,lat and not lat,lon
    jsonResponse.geometry = {
        'type': 'LineString',
        'coordinates': coordintates
    };
    return jsonResponse;
};

module.exports = {
    shipSchema: shipSchema,
    shipModel: shipModel,
    transformer
};