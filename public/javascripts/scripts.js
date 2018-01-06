var map;
var allTheShips = [];
var socket;

var changeTimestamp = function(t) {
  var timestamp = document.getElementById('timestamp');
  timestamp.innerHTML = t;
}

var handleSocket = function() {
  $(document).ready(function() {
    socket = io('http://localhost:4000/requestData');
    socket.emit('clientReady');
    socket.on('data', function(data) {
      saveShip(data);
      changeTimestamp(data.properties.timestamp);
      socket.emit('moreData');
    });
    socket.on('done', function() {
      console.log('Done!');
    })
  });
}

var addMarker = function(properties, coordinates) {
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

var refreshPolyline = function(polyline, coordinates) {
  polyline.setLatLngs(coordinates);
}

var addToPolyline = function(polyline, coordinates) {
  var latlng = L.latLng(coordinates);
  polyline.addLatLng(latlng);
}

var createMap = function() {
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

var saveShip = function(ship) {
  var i;
  var flag = allTheShips.some((element) => {
    if (element != null)
      if (element.properties.MMSI == ship.properties.MMSI) {
        var latlng = L.latLng(ship.geometry.coordinates);
        element.coordinates.push(latlng);
        refreshPolyline(element.shipPolyline, element.coordinates);
        // addToPolyline(element.shipPolyline, ship.geometry.coordinates);
        // addToLineString_OL(element.lineString, ship.geometry.coordinates);
        return true;
      }
  });
  if (!flag) {
    var newShip = {};
    newShip['properties'] = ship.properties;
    var latlng = L.latLng(ship.geometry.coordinates);
    newShip['coordinates'] = [];
    newShip.coordinates.push(latlng);
    newShip['shipPolyline'] = new L.polyline([latlng], {
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

var totalShipsDisplayed = function() {
  window.setInterval(function() {
    shipsNum = allTheShips.length;
    var shipNumber = document.getElementById('shipNumber');
    shipNumber.innerHTML = shipsNum;
  }, 3000);
}

var resumeStream = function() {
  console.log('Resume')
  socket.emit('resumeStream');
}
var pauseStream = function() {
  console.log('Pause')
  socket.emit('pauseStream')
}

var randomColor = function() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
