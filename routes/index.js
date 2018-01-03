var express = require('express');
var router = express.Router();
var assert = require('assert');
var mongodb = require('mongodb');
var mongoose = require('mongoose');

/* GET home page. */
router.get('/leaflet', function (req, res) {
    console.log('-->Home page served');
    res.render('home_L');
});
router.get('/openlayers', function (req, res) {
    console.log('-->Home page served');
    res.render('home_ol');
});

router.get('/test', function (req, res) {
    console.log('-->Test page served');
    res.render('test');
});

module.exports = router;
