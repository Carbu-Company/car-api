const express = require('express');
const carController = require('../controllers/carController');
const popbillController = require('../controllers/popbill/cashbillController')
const router = express.Router();

router.get('/cars', carController.getCars); // GET /cars

router.post('/popbill/v1/registIssue', popbillController.registIssue)

module.exports = router;
