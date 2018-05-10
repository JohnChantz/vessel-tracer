let map;
// let allTheShips = [];
let socket;
let coordinatesArraySize;
let ships = new Map();
let resume = true;

var changeTimestamp = (time) => {
  $('#timestamp').text(time);
};

var startStream = () => {
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
      // console.log(data);
      mapShips(data);
      changeTimestamp(data.properties.timestamp);
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
    maxZoom: 16
  });
  L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: 'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: "mapbox.dark",
    accessToken: "pk.eyJ1Ijoiam9obmNoIiwiYSI6ImNqOGs0bGthazA5aXEyd3BjdzI1bWxoa2YifQ.QA5sfeo1MO_qJ5-b6NBdJQ"
  }).addTo(map);
  map.scrollWheelZoom.disable();
  L.control.mouseCoordinate({
    gps: true,
    gpsLong: true
  }).addTo(map);
};

var mapShips = (ship) => {
  let element = ships.get(ship.properties.MMSI);
  if (typeof element != 'undefined') {
    let latlng = L.latLng(ship.geometry.coordinates);
    // if (element.coordinates.length < coordinatesArraySize) {
    // element.coordinates.push(latlng);
    // } else if (element.coordinates.length == coordinatesArraySize) {
    //   element.coordinates.shift();
    //   element.coordinates.push(latlng);
    // }
    addToPolyline(element.shipPolyline, latlng);
    // moveMarker(element.shipMarker,latlng);
  } else {
    let newShip = {};
    newShip.properties = ship.properties;
    // newShip.coordinates = [];
    let latlng = L.latLng(ship.geometry.coordinates);
    // newShip.coordinates.push(latlng);
    newShip.shipPolyline = new L.polyline([latlng], {
        smoothFactor: 2,
        color: randomColor(),
        className: 'polylineStyle'
      }).addTo(map).addTo(map)
      .bindPopup(
        '<div class="popupClass"><h5>Ship Info</h5>' + '<hr>' +
        '<strong>Shipname: </strong>' + ship.properties.shipname + '<br/>' +
        '<strong>MMSI number: </strong>' + ship.properties.MMSI + '<br/>' +
        '<strong>IMO number: </strong>' + ship.properties.IMO + '<br/>' +
        '<strong>Ship type: </strong>' + ship.properties.ship_type + '<br/>' +
        '<strong>Destination: </strong>' + ship.properties.destination + '<br/></div>');
    // newShip.shipMarker = new L.marker(latlng, {
    //     title: ship.properties.shipname
    //   })

    ships.set(ship.properties.MMSI, newShip);
  }
};

/*var saveShip = (ship) => {
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
*/
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

var findShip = (MMSI) => {
  mmsi = document.getElementById("mmsiInput").value;
  tableBody = document.getElementById("tableBody");
  td = $("td:contains(" + mmsi + ")");
  if (td.length == 0)
    $.get("http://127.0.0.1:3000/api/ship/" + mmsi, (data) => {
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

var plotRoute = (t) => {
  console.log(t);
  // coordinates = [];
  // $.get("http://127.0.0.1:3000/api/ships/" + mmsi, (data) => {
  //   ships = JSON.parse(data);
  //   ships.forEach((element) => {
  //     let latlng = L.latLng(element.coordinates);
  //     coordinates.push(latlng);
  //   });
  //   L.polyline(coordinates, {
  //     color: randomColor(),
  //     className: 'polylineStyle',
  //   }).addTo(map);
  // });
};