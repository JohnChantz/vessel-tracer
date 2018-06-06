L.Control.timestamp = L.Control.extend({
    options: {
        position: 'topright',
    },
    onAdd: function (map) {
        this._map = map;

        var className = 'timestamp-on-map';
        var container = this._container = L.DomUtil.create('div', className);
        this._content = L.DomUtil.create("div", "", container);
        this._content.innerHTML = '2015-08-01 00:00:00';
        return container;
    }
});

L.control.timestamp = function () {
    return new L.Control.timestamp();
};