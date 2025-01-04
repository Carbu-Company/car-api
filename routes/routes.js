const express = require('express');
const carController = require('../controllers/carController');
const CashbillController = require('../controllers/popbill/cashbillController')
const TaxinvoiceController = require('../controllers/popbill/taxinvoiceController')
const EasyFinBankController = require('../controllers/popbill/easyFinBankController')
const router = express.Router();

router.get('/cars', carController.getCars); // GET /cars

router.post('/popbill/v1/cashbill/registIssue', CashbillController.registIssue)
router.post('/popbill/v1/cashbill/revokeRegistIssue', CashbillController.revokeRegistIssue)
router.post('/popbill/v1/cashbill/getInfo', CashbillController.getInfo)

router.post('/popbill/v1/taxinvoice/registIssue', TaxinvoiceController.registIssue)
router.post('/popbill/v1/taxinvoice/cancelIssue', TaxinvoiceController.registIssue)

router.post('/popbill/v1/easyfinbank/registBankAccount', EasyFinBankController.registBankAccount)
router.post('/popbill/v1/easyfinbank/updateBankAccount', EasyFinBankController.updateBankAccount)



module.exports = router;
