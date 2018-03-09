var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    console.log('-->Home page served');
    res.render('home');
});
router.get('/test', function (req, res) {
    console.log('-->Test page served');
    res.render('test');
});

module.exports = router;
