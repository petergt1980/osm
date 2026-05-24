// importing the necessary modules
const path = require('path');
const cnf = require(path.join(__dirname, '..', '..', 'Config.js'));
const express = require('express');
const router = express.Router();

router.all('/', function (req, res) {
    res.render('HomeView');
})

// exporting the router
module.exports = router;