// var cursor = shipsDataModel.find().cursor();
        // cursor.on('data', function (data) {
        //     console.log(data);
        // });
        // cursor.on('error', function () {
        //     console.log('Error!')
        // })

        // cursor.forEach(function (doc, err) {
        //     assert.equal(null, err);
        //     resultArray.push(doc);
        // }, function () {
        //     var coordintates = [];
        //     //create json object for responsing to client
        //     var jsonResponse = {};
        //     jsonResponse['type'] = 'Feature';
        //     jsonResponse['properties'] = {
        //         'shipname': resultArray[resultArray.length - 1].SHIPNAME,
        //         'MMSI': resultArray[resultArray.length - 1].MMSI,
        //         'IMO': resultArray[resultArray.length - 1].IMO,
        //         'ship_type': resultArray[resultArray.length - 1].TYPE_NAME,
        //         'destination': resultArray[resultArray.length - 1].DESTINATION,
        //     };
        //     resultArray.forEach(function (i) {
        //         coordintates.push([i.LON, i.LAT])       //d3 must have lon,lat and not lat,lon
        //     });
        //     jsonResponse['geometry'] = { 'type': 'LineString', 'coordinates': coordintates };
        // db.close();
        //     res.writeHead(200, { 'Content-Type': 'application/json' });
        //     res.end(JSON.stringify(jsonResponse));
        // });


        // var vectorSource = new ol.source.Vector();
        // var vectorLayer = new ol.layer.Vector({
        //     source: vectorSource,
        //     style: [
        //         new ol.style.Style({
        //             stroke: new ol.style.Stroke({
        //                 color: '#EAE911',
        //                 width: 2
        //             })
        //         })
        //     ]
        // });
        // map.addLayer(vectorLayer);
        // newShip['lineString'] = new ol.geom.LineString([ol.proj.fromLonLat(ship.geometry.coordinates)]);
        // var trackFeature = new ol.Feature({
        //     geometry: newShip['lineString']
        // });
        // vectorSource.addFeature(trackFeature);



        /*svg {
    position: relative;
}
path {
    fill: none;
    stroke-width: 2px;
    stroke: blue;
    stroke-opacity: 1;
} */
/* .travelMarker {
    fill: yellow;
    opacity: 0.75;
} */
/* .lineConnect {
fill: none;
stroke: blue;
opacity: 1;
stroke-width: 2px;
} */