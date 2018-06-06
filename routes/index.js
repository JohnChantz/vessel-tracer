let express = require('express');
let router = express.Router();
let model = require('../models/ship').default;

/* GET home page. */
router.get('/', (req, res) => {
    res.render('home');
});
router.get('/api/ship/:ship_mmsi', (req, res) => {
    model.shipModel.findOne({
        "MMSI": req.params.ship_mmsi
    }, (err, ship) => {
        res.json(JSON.stringify(ship));
    });
});
router.get('/api/ships/:ship_mmsi', (req, res) => {
    model.shipModel.find({
        "MMSI": req.params.ship_mmsi
    }, (err, ships) => {
        res.json(JSON.stringify(ships));
    });
});
module.exports = router;