const express = require('express');
const carController = require('../controllers/carController');
const router = express.Router();

router.get('/cars', carController.getCars); // GET /cars

module.exports = router;
