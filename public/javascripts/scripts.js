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

var createPopup = (trackSymbol, ship) => {
  let heading = checkHeading(ship.HEADING);
  let speed = ship.SPEED / 10;
  trackSymbol.bindPopup('<strong>Shipname: </strong>' + ship.SHIPNAME + '<br/>' +
    '<strong>MMSI number: </strong>' + ship.MMSI + '<br/>' +
    '<strong>IMO number: </strong>' + ship.IMO + '<br/>' +
    '<strong>Ship type: </strong>' + ship.TYPE_NAME + '<br/>' +
    '<strong>Course: </strong>' + ship.COURSE + '&deg<br/>' +
    '<strong>Speed: </strong>' + speed + ' knots<br/>' +
    '<strong>Heading: </strong>' + heading + '&deg<br/>' +
    '<strong>Destination: </strong>' + ship.DESTINATION + '<br/>' +
    '<strong>Last update: </strong>' + ship.TIMESTAMP + '<br/>' +
    "More Details on <a href='http://www.marinetraffic.com/en/ais/details/ships/mmsi:" + ship.MMSI + "' target='_blank'>MarineTraffic.com</a>");
};

var refreshPolyline = (polyline, coordinates) => {
  polyline.setLatLngs(coordinates);
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
    zoomControl: false,
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
  let heading = calculateHeading(ship.HEADING, ship.COURSE);
  let speedKnots = ship.SPEED / 10;
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
    element.trackSymbol.setHeading(heading);
    updatePopupContent(element.trackSymbol, {
      shipname: ship.SHIPNAME,
      mmsi: ship.MMSI,
      imo: ship.IMO,
      type_name: ship.TYPE_NAME,
      course: ship.COURSE,
      speed: speedKnots,
      heading: ship.HEADING,
      destination: ship.DESTINATION,
      timestamp: ship.TIMESTAMP
    });
  } else {
    // if (ships.size >= 1000){
    //   return;
    // }
    let newShip = {};
    let color = randomColor();
    newShip.coordinates = [];
    let latlng = [ship.LAT, ship.LON];
    newShip.coordinates.push(latlng);
    newShip.shipPolyline = new L.polyline([latlng], {
      smoothFactor: 1,
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
      heading: heading
    }).addTo(map);
    createPopup(newShip.trackSymbol, ship);
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

var checkHeading = (heading) => {
  if (heading == '511') {
    return 'Not available';
  }
  return heading;
};

var updatePopupContent = (trackSymbol, aisData) => {
  let heading = checkHeading(aisData.heading);
  trackSymbol._popup.setContent('<strong>Shipname: </strong>' + aisData.shipname + '<br/>' +
    '<strong>MMSI number: </strong>' + aisData.mmsi + '<br/>' +
    '<strong>IMO number: </strong>' + aisData.imo + '<br/>' +
    '<strong>Ship type: </strong>' + aisData.type_name + '<br/>' +
    '<strong>Course: </strong>' + aisData.course + '&deg<br/>' +
    '<strong>Speed: </strong>' + aisData.speed + ' knots<br/>' +
    '<strong>Heading: </strong>' + heading + '&deg<br/>' +
    '<strong>Destination: </strong>' + aisData.destination + '<br/>' +
    '<strong>Last update: </strong>' + aisData.timestamp + '<br/>' +
    "More Details on <a href='http://www.marinetraffic.com/en/ais/details/ships/mmsi:" + aisData.mmsi + "' target='_blank'>MarineTraffic.com</a>");
};

var calculateHeading = (heading, course) => {
  let headingChecked = checkHeading(heading);
  if (headingChecked == heading)
    return (heading * Math.PI) / 180;
  else if (headingChecked == 'Not available')
    return (course * Math.PI) / 180;
};

function binarySearch(map, value) {
  // initial values for start, middle and end
  let start = 0;
  let stop = map.size - 1;
  let middle = Math.floor((start + stop) / 2);

  // While the middle is not what we're looking for and the list does not have a single item
  while (map[middle] !== value && start < stop) {
    if (value < map[middle]) {
      stop = middle - 1;
    } else {
      start = middle + 1;
    }

    // recalculate middle on every iteration
    middle = Math.floor((start + stop) / 2);
  }

  // if the current middle item is what we're looking for return it's index, else return -1
  return (map[middle] !== value) ? -1 : middle;
}
