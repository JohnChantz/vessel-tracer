let express = require('express');
let router = express.Router();
let model = require('../models/ship');

/* GET home page. */
router.get('/', (req, res) => {
    console.log('-->Home page served');
    res.render('home');
});
router.get('/ships/:ship_mmsi', (req, res) => {
    console.log("-->API: find ship");
    model.shipModel.findOne({
        "MMSI": req.params.ship_mmsi
    }, (err, ship) => {
        res.json(JSON.stringify(ship));
    });
});
module.exports = router;