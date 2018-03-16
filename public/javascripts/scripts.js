let map;
let allTheShips = [];
let socket;
let coordinatesArraySize = 100;

var changeTimestamp = (t) => {
  let timestamp = document.getElementById('timestamp');
  timestamp.innerHTML = t;
};

var handleSocket = () => {
  $(document).ready(() => {
    socket = io('http://localhost:4000/streamData');
    socket.emit('clientReady');
    socket.on('data', (data) => {
      saveShip(data);
      changeTimestamp(data.properties.timestamp);
      socket.emit('moreData');
    });
    socket.on('done', () => {
      console.log('Done!');
    });
  });
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
  polyline.setLatLngs(coordinates);
};

var addToPolyline = (polyline, coordinates) => {
  let latlng = L.latLng(coordinates);
  polyline.addLatLng(latlng);
};

var createMap = () => {
  map = L.map('map', {
    center: [37.393, 24.232],
    zoom: 5,
    minZoom: 4,
    maxZoom: 16
  });
  //https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?
  L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.dark',
    accessToken: 'pk.eyJ1Ijoiam9obmNoIiwiYSI6ImNqOGs0bGthazA5aXEyd3BjdzI1bWxoa2YifQ.QA5sfeo1MO_qJ5-b6NBdJQ'
  }).addTo(map);
  map.scrollWheelZoom.disable();
};

var saveShip = (ship) => {
  let i;
  let flag = allTheShips.some((element) => {
    if (element != null)
      if (element.properties.MMSI == ship.properties.MMSI) {
        let latlng = L.latLng(ship.geometry.coordinates);
        if (element.coordinates.length < coordinatesArraySize) {
          element.coordinates.push(latlng);
        } else if (element.coordinates.length == coordinatesArraySize) {
          element.coordinates.shift();
          element.coordinates.push(latlng);
        }
        refreshPolyline(element.shipPolyline, element.coordinates);
        // addToPolyline(element.shipPolyline, ship.geometry.coordinates);
        return true;
      }
  });
  if (!flag) {
    let newShip = {};
    newShip.properties = ship.properties;
    newShip.coordinates = [];
    let latlng = L.latLng(ship.geometry.coordinates);
    newShip.coordinates.push(latlng);
    newShip.shipPolyline = new L.polyline([latlng], {
      color: randomColor(),
      className: 'polylineStyle',
    }).addTo(map).bindPopup('<strong>Shipname: </strong>' + ship.properties.shipname + '<br/>' +
      '<strong>MMSI number: </strong>' + ship.properties.MMSI + '<br/>' +
      '<strong>IMO number: </strong>' + ship.properties.IMO + '<br/>' +
      '<strong>Ship type: </strong>' + ship.properties.ship_type + '<br/>' +
      '<strong>Destination: </strong>' + ship.properties.destination + '<br/>');
    allTheShips.push(newShip);
  }
};

var totalShipsDisplayed = () => {
  window.setInterval(() => {
    shipsNum = allTheShips.length;
    let shipNumber = document.getElementById('shipNumber');
    shipNumber.innerHTML = shipsNum;
  }, 3000);
};

var resumeStream = () => {
  console.log('Resume');
  socket.emit('resumeStream');
};
var pauseStream = () => {
  console.log('Pause');
  socket.emit('pauseStream');
};

var randomColor = () => {
  let letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

var sliderValueRefresh = (slider) => {
  let value = document.getElementById("sliderValue");
  value.innerHTML = slider.value;
  coordinatesArraySize = slider.value;
};

var findShip = (MMSI) => {
  mmsi = document.getElementById("mmsiInput").value;
  tableBody = document.getElementById("tableBody");
  $.get("http://127.0.0.1:4000/ships/" + mmsi, (data) => {
    ship = JSON.parse(data);
    $(tableBody).append(`
      <tr>
        <td>` + ship.MMSI + `</td>
        <td>` + ship.IMO + `</td>
        <td>` + ship.SHIPNAME + `</td>
        <td>` + ship.TYPE_NAME + `</td>
        <td>` + ship.DESTINATION + `</td>
      </tr>
    `);
  });

};