var map;
var allTheShips = [];
var i = 0;
var socket;

var drawPathD31 = function (data) {
    var svg = d3.select(map.getPanes().overlayPane).append("svg");
    var g = svg.append("g").attr("class", "leaflet-zoom-hide");
    console.log(data)
    var transform = d3.geo.transform({
        point: projectPoint
    });
    var d3path = d3.geo.path().projection(transform);
    var toLine = d3.svg.line()
        .interpolate("basis")
        .x(function (d) { return applyLatLngToLayer(d).x })
        .y(function (d) { return applyLatLngToLayer(d).y });
    var linePath = g.selectAll("lineConnect")
        .data([data])
        .enter()
        .append("path")
        .attr("class", "lineConnect");
    // var marker = g.append("circle")
    //     .attr("r", 10)
    //     .attr("id", "marker")
    //     .attr("class", "travelMarker");
    linePath.attr("d", toLine)
    map.on('zoom', reset);
    reset();
    transition();
    function reset() {
        var bounds = d3path.bounds(data),
            topLeft = bounds[0],
            bottomRight = bounds[1];
        svg.attr("width", bottomRight[0] - topLeft[0] + 120)
            .attr("height", bottomRight[1] - topLeft[1] + 120)
            .style("left", topLeft[0] - 50 + "px")
            .style("top", topLeft[1] - 50 + "px");
        linePath.attr("d", toLine)
        g.attr("transform", "translate(" + (-topLeft[0] + 50) + "," + (-topLeft[1] + 50) + ")");
    } // end reset
    function transition() {
        linePath.transition()
            .duration(50000)
            .attrTween("stroke-dasharray", tweenDash)
            .each("end", function () {
                //add a market at the destination
                var coordinates = data;
                var latLng = coordinates[coordinates.length - 1]
                L.marker([latLng[1], latLng[0]])
                    .addTo(map)
                    .bindPopup('<strong>Shipname: </strong>' + data.properties.shipname + '<br/>' +
                    '<strong>MMSI number: </strong>' + data.properties.MMSI + '<br/>' +
                    '<strong>IMO number: </strong>' + data.properties.IMO + '<br/>' +
                    '<strong>Ship type: </strong>' + data.properties.ship_type + '<br/>' +
                    '<strong>Destination: </strong>' + data.properties.destination + '<br/>');
                // d3.select(this).call(transition);// infinite loop
            });
    }
    function tweenDash() {
        return function (t) {
            var l = linePath.node().getTotalLength();
            interpolate = d3.interpolateString("0," + l, l + "," + l);
            var marker = d3.select("#marker");
            var p = linePath.node().getPointAtLength(t * l);
            marker.attr("transform", "translate(" + p.x + "," + p.y + ")");
            return interpolate(t);
        }
    }
    function applyLatLngToLayer(d) {
        var y = d[1]
        var x = d[0]
        return map.latLngToLayerPoint(new L.LatLng(y, x))
    }
    function projectPoint(x, y) {
        var point = map.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
    }
}

var changeTimestamp = function (t) {
    var timestamp = document.getElementById('timestamp');
    timestamp.innerHTML = t;
}

var handleSocket = function () {
    $(document).ready(function () {
        socket = io('http://localhost:4000/requestData');
        socket.emit('clientReady');
        socket.on('data', function (data) {
            saveShip(data);
            changeTimestamp(data.properties.timestamp);
            socket.emit('moreData');
        });
        socket.on('done', function () {
            console.log('Done!');
        })
    });
}

var addMarker = function (properties, coordinates) {
    x = coordinates[0];
    y = coordinates[1];
    var latlng = new L.LatLng(x, y);
    L.marker(latlng, {
        className: 'bounce'
    }).addTo(map).bindPopup('<strong>Shipname: </strong>' + properties.shipname + '<br/>' +
    '<strong>MMSI number: </strong>' + properties.MMSI + '<br/>' +
    '<strong>IMO number: </strong>' + properties.IMO + '<br/>' +
    '<strong>Ship type: </strong>' + properties.ship_type + '<br/>' +
    '<strong>Destination: </strong>' + properties.destination + '<br/>');
}

var drawPolyline = function () {
    allTheShips.forEach(function (ship) {
        var latlng = [];
        ship.coordinates.forEach(function (coord) {
            latlng.push(coord);
        });
        // for (i = 1; i < ship.length; i++) {
        //     latlng.push(ship[i][0]);
        // }
        var polyline = L.polyline(latlng, {
            color: 'blue'
        }).addTo(map);
    });
}

var refreshPolyline = function(polyline,coordinates){
  polyline.setLatLngs(coordinates);
}

var initPolyline = function (ship) {
    latlng = [];
    latlng.push(ship);
}

var addToPolyline = function (polyline, coordinates) {
    var latlng = L.latLng(coordinates);
    polyline.addLatLng(latlng);
}

var addToLineString = function (lineString, coordinates) {
    lineString.appendCoordinate(ol.proj.fromLonLat(coordinates));
}

var createMap_OL = function () {
    map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([24.232, 37.393]),
            zoom: 5
        })
    });
}

var createMap = function () {
    map = L.map('map', {
        center: [37.393, 24.232],
        zoom: 5,
        minZoom: 4,
        maxZoom: 18
    });
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.dark',
        accessToken: 'pk.eyJ1Ijoiam9obmNoIiwiYSI6ImNqOGs0bGthazA5aXEyd3BjdzI1bWxoa2YifQ.QA5sfeo1MO_qJ5-b6NBdJQ'
    }).addTo(map);
}

var saveShip = function (ship) {
    var i;
    var flag = allTheShips.some((element) => {
        if (element != null)
            if (element.properties.MMSI == ship.properties.MMSI) {
                element.coordinates.push(ship.geometry.coordinates);
                refreshPolyline(ship.shipPolyline,ship.coordinates);
                // addToPolyline(element.shipPolyline, ship.geometry.coordinates);
                // addToLineString(element.lineString, ship.geometry.coordinates);
                return true;
            }
    });
    if (!flag) {
        var newShip = {};
        newShip['properties'] = ship.properties;
        newShip['coordinates'] = [ship.geometry.coordinates];
        newShip['shipPolyline'] = new L.polyline([ship.geometry.coordinates], {
            color: randomColor(),
            className: 'polyline'
        }).addTo(map).bindPopup('<strong>Shipname: </strong>' + ship.properties.shipname + '<br/>' +
        '<strong>MMSI number: </strong>' + ship.properties.MMSI + '<br/>' +
        '<strong>IMO number: </strong>' + ship.properties.IMO + '<br/>' +
        '<strong>Ship type: </strong>' + ship.properties.ship_type + '<br/>' +
        '<strong>Destination: </strong>' + ship.properties.destination + '<br/>');;
        allTheShips.push(newShip);
    }
}

var draw = function () {
    ship = allTheShips[0];
    length = ship.coordinates.length;
    var latlng = L.latLng(ship.coordinates[i]);
    ship.shipPolyline.addLatLng(latlng);
    if (++i < length)
        window.setTimeout(draw, 25);
    else
        addMarker(ship.properties, ship.coordinates[length - 1]);
}

var totalShipsDisplayed = function () {
    window.setInterval(function () {
        shipsNum = allTheShips.length;
        var shipNumber = document.getElementById('shipNumber');
        shipNumber.innerHTML = shipsNum;
    }, 3000);
}

var resumeStream = function () {
    console.log('Resume')
    socket.emit('resumeStream');
}
var pauseStream = function () {
    console.log('Pause')
    socket.emit('pauseStream')
}

var randomColor = function () {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
