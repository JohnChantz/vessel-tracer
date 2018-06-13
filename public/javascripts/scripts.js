let map;
let socket;
let coordinatesArraySize;
let ships = new Map();
let resume = true;

var changeTimestamp = (time) => {
  $('#timestamp').text(time);
  $('.timestamp-on-map').text(time);

};

var startStream = () => {
  let i = 0;
  console.log('Stream started!');
  let size = $('#sizeInput').val();
  console.log(size);
  if (size != null) {
    coordinatesArraySize = size;
    $('#startButton').prop('disabled', true);
    $("#sizeInput").prop("disabled", true);
    socket = io('http://localhost:3000/streamData');
    totalShipsDisplayed();
    socket.emit('clientReady');
    socket.on('data', (data) => {
      mapShips(data);
      changeTimestamp(data.TIMESTAMP);
      if (resume)
        socket.emit('moreData');
    });
    socket.on('done', () => {
      console.log('Done!');
    });
  }
};

var addMarker = (properties, coordinates) => {
  x = coordinates[0];
  y = coordinates[1];
  let latlng = new L.LatLng(x, y);
  L.marker(latlng, {
    className: 'bounce'
  }).addTo(map).bindPopup('<strong>Shipname: </strong>' + properties.shipname + '<br/>' +
    '<strong>MMSI number: </strong>' + properties.MMSI + '<br/>' +
    '<strong>IMO number: </strong>' + properties.IMO + '<br/>' +
    '<strong>Ship type: </strong>' + properties.ship_type + '<br/>' +
    '<strong>Destination: </strong>' + properties.destination + '<br/>');
};

var refreshPolyline = (polyline, coordinates) => {
  // simplifiedCoords = simplify(coordinates,1);
  polyline.setLatLngs(simplifiedCoords);
};
var moveMarker = (marker, coordinates) => {
  marker.setLatLng(coordinates);
};

var addToPolyline = (polyline, coordinates) => {
  polyline.addLatLng(coordinates);
};

var createMap = () => {
  map = L.map('map', {
    center: [37.393, 24.232],
    zoom: 5,
    minZoom: 4,
    maxZoom: 17,
    zoomControl: false
  });
  L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    id: "mapbox.dark",
    accessToken: "pk.eyJ1Ijoiam9obmNoIiwiYSI6ImNqOGs0bGthazA5aXEyd3BjdzI1bWxoa2YifQ.QA5sfeo1MO_qJ5-b6NBdJQ"
  }).addTo(map);
  map.scrollWheelZoom.disable();
  L.control.mouseCoordinate({
    gps: true,
    gpsLong: true
  }).addTo(map);
  L.control.zoom({
    position: 'topleft'
  }).addTo(map);
  L.control.timestamp({
    position: 'topright'
  }).addTo(map);
};

var mapShips = (ship) => {
  let element = ships.get(ship.MMSI);
  let course = ship.COURSE * Math.PI / 180;
  if (typeof element != 'undefined') {
    let latlng = [ship.LAT, ship.LON];
    if (element.coordinates.length < coordinatesArraySize) {
      element.coordinates.push(latlng);
    } else if (element.coordinates.length == coordinatesArraySize) {
      element.coordinates.shift();
      element.coordinates.push(latlng);
    }
    refreshPolyline(element.shipPolyline, element.coordinates);
    element.trackSymbol.setLatLng(latlng);
    element.trackSymbol.setHeading(course);
    updatePopupContent(element.trackSymbol, {
      shipname: ship.SHIPNAME,
      mmsi: ship.MMSI,
      imo: ship.IMO,
      type_name: ship.TYPE_NAME,
      course: ship.COURSE,
      speed: ship.SPEED,
      heading: ship.HEADING,
      destination: ship.DESTINATION,
      timestamp: ship.TIMESTAMP
    });
  } else {
    let newShip = {};
    let color = randomColor();
    newShip.coordinates = [];
    let latlng = [ship.LAT, ship.LON];
    newShip.coordinates.push(latlng);
    newShip.shipPolyline = new L.polyline([latlng], {
      // smoothFactor: 1,
      color: color,
      className: 'polylineStyle'
    }).addTo(map);
    newShip.trackSymbol = L.trackSymbol(latlng, {
        trackId: ship.MMSI,
        fill: true,
        fillColor: color,
        fillOpacity: 1,
        stroke: true,
        color: color,
        opacity: 1.0,
        weight: 1.0,
        size: 13,
        heading: course
      }).addTo(map)
      .bindPopup('<strong>Shipname: </strong>' + ship.SHIPNAME + '<br/>' +
        '<strong>MMSI number: </strong>' + ship.MMSI + '<br/>' +
        '<strong>IMO number: </strong>' + ship.IMO + '<br/>' +
        '<strong>Ship type: </strong>' + ship.TYPE_NAME + '<br/>' +
        '<strong>Course: </strong>' + ship.COURSE + '&deg<br/>' +
        '<strong>Speed: </strong>' + ship.SPEED + ' knots<br/>' +
        '<strong>Heading: </strong>' + ship.HEADING + '&deg<br/>' +
        '<strong>Destination: </strong>' + ship.DESTINATION + '<br/>' +
        '<strong>Last update: </strong>' + ship.TIMESTAMP + '<br/>' +
        "More Details on <a href='http://www.marinetraffic.com/en/ais/details/ships/mmsi:" + ship.MMSI + "' target='_blank'>MarineTraffic.com</a>");
    ships.set(ship.MMSI, newShip);
  }
};

var totalShipsDisplayed = () => {
  window.setInterval(() => {
    shipsNum = ships.size;
    let shipNumber = document.getElementById('shipNumber');
    shipNumber.innerHTML = shipsNum;
  }, 3000);
};

var resumeStream = () => {
  console.log('Resume');
  if (resume === false) {
    socket.emit('moreData');
    resume = true;
  }
};
var pauseStream = () => {
  console.log('Pause');
  resume = false;
};

var randomColor = () => {
  let letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

var updatePopupContent = (trackSymbol, aisData) => {
  trackSymbol._popup.setContent('<strong>Shipname: </strong>' + aisData.shipname + '<br/>' +
    '<strong>MMSI number: </strong>' + aisData.mmsi + '<br/>' +
    '<strong>IMO number: </strong>' + aisData.imo + '<br/>' +
    '<strong>Ship type: </strong>' + aisData.type_name + '<br/>' +
    '<strong>Course: </strong>' + aisData.course + '&deg<br/>' +
    '<strong>Speed: </strong>' + aisData.speed + ' knots<br/>' +
    '<strong>Heading: </strong>' + aisData.heading + '&deg<br/>' +
    '<strong>Destination: </strong>' + aisData.destination + '<br/>' +
    '<strong>Last update: </strong>' + aisData.timestamp + '<br/>' +
    "More Details on <a href='http://www.marinetraffic.com/en/ais/details/ships/mmsi:" + aisData.mmsi + "' target='_blank'>MarineTraffic.com</a>");
};