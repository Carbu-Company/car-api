const express = require("express");
const carController = require("../controllers/car/carController");
const loginController = require("../controllers/car/loginController");
const CashbillController = require("../controllers/popbill/cashbillController");
const TaxinvoiceController = require("../controllers/popbill/taxinvoiceController");
const EasyFinBankController = require("../controllers/popbill/easyFinBankController");
const KakaoController = require("../controllers/popbill/kakaoController");
const BizInfoCheckController = require("../controllers/popbill/bizInfoCheckController");
const FaxServiceController = require("../controllers/popbill/faxServiceController");

const router = express.Router();

/* DB SQL 조회 */
// 제시 차량 조회
router.post("/cars", carController.SuggestSelectData);
// 로그인
router.post("/login", loginController.loginController);
// 관리키 조회
router.get("/getMgtKey", carController.getMgtKey);
// 제시 등록
router.post("/insertCashBill", carController.insertCashBill);
// 현금영수증 사전 데이터 조회
router.get("/getCashBillPreData", carController.getCashBillPreData);

// 현금영수증 사전 데이터 조회 - 총거래금액, 공급가액, 부가세
router.get("/getCashBillAmount", carController.getCashBillAmount);

/* 현금영수증 */
router.post("/popbill/v1/cashbill/registIssue", CashbillController.registIssue);
router.post(
  "/popbill/v1/cashbill/revokeRegistIssue",
  CashbillController.revokeRegistIssue
);
router.post("/popbill/v1/cashbill/getInfo", CashbillController.getInfo);
router.post("/popbill/v1/cashbill/getPrintURL", CashbillController.getPrintURL);

/* 전자세금계산서 */
router.post(
  "/popbill/v1/taxinvoice/registIssue",
  TaxinvoiceController.registIssue
);
router.post(
  "/popbill/v1/taxinvoice/cancelIssue",
  TaxinvoiceController.cancelIssue
);
router.post(
  "/popbill/v1/taxinvoice/getTaxCertURL",
  TaxinvoiceController.getTaxCertURL
);
router.post(
  "/popbill/v1/taxinvoice/getPrintURL",
  TaxinvoiceController.getPrintURL
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
router.post(
  "/popbill/v1/easyfinbank/listBankAccount",
  EasyFinBankController.listBankAccount
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

/* 연동회원 */
router.post(
  "/popbill/v1/bizinfo/joinMember",
  BizInfoCheckController.JoinMember
);
router.post(
  "/popbill/v1/bizinfo/quitMember",
  BizInfoCheckController.QuitMember
);
router.post(
  "/popbill/v1/bizinfo/getCorpInfo",
  BizInfoCheckController.GetCorpInfo
);

/* FAX */
router.post(
  "/popbill/v1/faxService/checkSenderNumber",
  FaxServiceController.checkSenderNumber
);
router.post(
  "/popbill/v1/faxService/getSenderNumberMgtURL",
  FaxServiceController.getSenderNumberMgtURL
);
router.post(
  "/popbill/v1/faxService/getSenderNumberList",
  FaxServiceController.getSenderNumberList
);
router.post("/popbill/v1/faxService/sendFAX", FaxServiceController.sendFAX);

module.exports = router;
