const express = require("express");
const carController = require("../controllers/car/carController");
const loginController = require("../controllers/car/loginController");
const CashbillController = require("../controllers/popbill/cashbillController");
const TaxinvoiceController = require("../controllers/popbill/taxinvoiceController");
const EasyFinBankController = require("../controllers/popbill/easyFinBankController");
const KakaoController = require("../controllers/popbill/kakaoController");
const router = express.Router();

/* DB SQL 조회 */
// 제시 차량 조회
router.get("/cars", carController.getCars);
// 로그인
router.post("/login", loginController.loginController);
// 관리키 조회
router.get("/getMgtKey", carController.getMgtKey);
// 제시 등록
router.post("/insertCashBill", carController.insertCashBill);
// 현금영수증 사전 데이터 조회
router.get("/getCashBillPreData", carController.getCashBillPreData);

/* 현금영수증 */
router.post("/popbill/v1/cashbill/registIssue", CashbillController.registIssue);
router.post(
  "/popbill/v1/cashbill/revokeRegistIssue",
  CashbillController.revokeRegistIssue
);
router.post("/popbill/v1/cashbill/getInfo", CashbillController.getInfo);

/* 전자세금계산서 */
router.post(
  "/popbill/v1/taxinvoice/registIssue",
  TaxinvoiceController.registIssue
);
router.post(
  "/popbill/v1/taxinvoice/cancelIssue",
  TaxinvoiceController.registIssue
);

/* 계좌 조회 */
router.post(
  "/popbill/v1/easyfinbank/registBankAccount",
  EasyFinBankController.registBankAccount
);
router.post(
  "/popbill/v1/easyfinbank/updateBankAccount",
  EasyFinBankController.updateBankAccount
);
router.post(
  "/popbill/v1/easyfinbank/getTransactionHistory",
  EasyFinBankController.getTransactionHistory
);
router.post(
  "/popbill/v1/easyfinbank/requestJob",
  EasyFinBankController.requestJob
);

/* 카톡 */
router.post(
  "/popbill/v1/kakao/listPlusFriendID",
  KakaoController.listPlusFriendID
);
router.post(
  "/popbill/v1/kakao/getPlusFriendMgtURL",
  KakaoController.getPlusFriendMgtURL
);
router.post(
  "/popbill/v1/kakao/getATSTemplateMgtURL",
  KakaoController.getATSTemplateMgtURL
);
router.post("/popbill/v1/kakao/sendATS_one", KakaoController.sendATS_one);
router.post("/popbill/v1/kakao/sendATS_multi", KakaoController.sendATS_multi);

module.exports = router;
