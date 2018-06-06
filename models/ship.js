const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shipSchema = new Schema({
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
const shipModel = mongoose.model('shipsGeoData', shipSchema, 'shipsGeoData');

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
    coordintates.push(doc.LAT, doc.LON);
    jsonResponse.geometry = {
        'type': 'Point',
        'coordinates': coordintates
    };
    return jsonResponse;
};

module.exports = {
    shipSchema: shipSchema,
    shipModel: shipModel,
    transformer
};