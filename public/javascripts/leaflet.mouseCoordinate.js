/* 
    Author     : Johannes Rudolph
*/
/* globals L: true */
L.Control.mouseCoordinate = L.Control.extend({
    options: {
        gps: true,
        gpsLong: true,
        position: 'bottomleft',
    },
    onAdd: function (map) {
        this._map = map;

        if (L.Browser.mobile || L.Browser.mobileWebkit || L.Browser.mobileWebkit3d || L.Browser.mobileOpera || L.Browser.mobileGecko)
            return L.DomUtil.create('div');

        var className = 'leaflet-mouse-position-control';
        var container = this._container = L.DomUtil.create('div', className);

        this._gpsPositionContainer = L.DomUtil.create("div", "", container);

        map.on("mousemove", this._update, this);

        return container;
    },
    _update: function (e) {
        //lat: [-90,90]
        //lng: [-180,180]
        var lat = (e.latlng.lat + 90) % 180;
        var lng = (e.latlng.lng + 180) % 360;
        if (lat < 0) {
            lat += 180;
        }
        lat -= 90;
        if (lng < 0) {
            lng += 360;
        }
        lng -= 180;

        var gps = {
            lat: lat,
            lng: lng
        };
        var content = "";
        if (this.options.gps) {
            //Round for display only
            var dLat = Math.round(lat * 100000) / 100000;
            var dLng = Math.round(lng * 100000) / 100000;
            if (this.options.gpsLong) {
                var gpsMinuten = this._geo2geodeziminuten(gps);
                content += gpsMinuten.NS + " " + gpsMinuten.latgrad + "&deg; " + gpsMinuten.latminuten + "</br>" + gpsMinuten.WE + " " + gpsMinuten.lnggrad + "&deg; " + gpsMinuten.lngminuten + "</br>";
                var gpsMinutenSekunden = this._geo2gradminutensekunden(gps);
            }
             content += "(" + dLat + " : " + dLng + ")";
        }
        this._gpsPositionContainer.innerHTML = content;
    },



    _geo2geodeziminuten: function (gps) {
        var latgrad = parseInt(gps.lat, 10);
        var latminuten = Math.round(((gps.lat - latgrad) * 60) * 10000) / 10000;

        var lnggrad = parseInt(gps.lng, 10);
        var lngminuten = Math.round(((gps.lng - lnggrad) * 60) * 10000) / 10000;

        return this._AddNSEW({
            latgrad: latgrad,
            latminuten: latminuten,
            lnggrad: lnggrad,
            lngminuten: lngminuten
        });
    },
    _geo2gradminutensekunden: function (gps) {
        var latgrad = parseInt(gps.lat, 10);
        var latminuten = (gps.lat - latgrad) * 60;
        var latsekunden = Math.round(((latminuten - parseInt(latminuten, 10)) * 60) * 100) / 100;
        latminuten = parseInt(latminuten, 10);

        var lnggrad = parseInt(gps.lng, 10);
        var lngminuten = (gps.lng - lnggrad) * 60;
        var lngsekunden = Math.round(((lngminuten - parseInt(lngminuten, 10)) * 60) * 100) / 100;
        lngminuten = parseInt(lngminuten, 10);

        return this._AddNSEW({
            latgrad: latgrad,
            latminuten: latminuten,
            latsekunden: latsekunden,
            lnggrad: lnggrad,
            lngminuten: lngminuten,
            lngsekunden: lngsekunden
        });
    },
    _AddNSEW: function (coord) {
        coord.NS = "N";
        coord.WE = "E";
        if (coord.latgrad < 0) {
            coord.latgrad = coord.latgrad * (-1);
            coord.NS = "S";
        }
        if (coord.lnggrad < 0) {
            coord.lnggrad = coord.lnggrad * (-1);
            coord.WE = "W";
        }
        return coord;
    }

});

L.control.mouseCoordinate = function (options) {
    return new L.Control.mouseCoordinate(options);
};