const express = require("express");
const carController = require("../controllers/car/carController");
const loginController = require("../controllers/car/loginController");
const CashbillController = require("../controllers/popbill/cashbillController");
const TaxinvoiceController = require("../controllers/popbill/taxinvoiceController");
const EasyFinBankController = require("../controllers/popbill/easyFinBankController");
const KakaoController = require("../controllers/popbill/kakaoController");
const BizInfoCheckController = require("../controllers/popbill/bizInfoCheckController");
const FaxServiceController = require("../controllers/popbill/faxServiceController");
const HtTaxinvoiceController = require("../controllers/popbill/htTaxinvoiceController");
const router = express.Router();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DB SQL 조회 (공통)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 관리키 조회
router.get("/getMgtKey", carController.getMgtKey);

// 로그인
router.post("/login", loginController.loginController);

// 공통코드 조회
router.get("/getCDList", carController.getCDList);

// 딜러 조회
router.get("/getDealerList", carController.getDealerList);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DB SQL 조회 (업무)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//***************************************************************************************** */
// 제시 
//***************************************************************************************** */

// 제시 차량 조회
router.post("/cars", carController.SuggestSelectData);

// 제시 등록
router.post("/insertCashBill", carController.insertCashBill);

//***************************************************************************************** */
// 매입 매도비 
//***************************************************************************************** */

// 매입 매도비 목록 조회
router.post("/getBuySellFeeList", carController.getBuySellFeeList);

// 매입 매도비 합계 조회
router.post("/getBuySellFeeSum", carController.getBuySellFeeSum);

//***************************************************************************************** */
// 현금영수증 
//***************************************************************************************** */

// 현금영수증 목록 데이터 조회
router.get("/getCashBillList", carController.getCashBillList);

// 현금영수증 사전 데이터 조회 - 총거래금액, 공급가액, 부가세
router.get("/getCashBillAmount", carController.getCashBillAmount);

//***************************************************************************************** */
// 시제(계좌) 
//***************************************************************************************** */

// 시재 관리
router.get("/getAssetList", carController.getAssetList);

// 계좌정보 조회
router.get("/getAccountInfo", carController.getAccountInfo);

//***************************************************************************************** */
// 차량 판매 
//***************************************************************************************** */

// 판매
router.get("/getSellPreData", carController.getSellPreData);



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// POP 팝빌 연동 API
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
  "/popbill/v1/easyfinbank/search",
  EasyFinBankController.search
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


/* 홈텍스 수집 */
router.post(
  "/popbill/v1/htTaxinvoice/requestJob",
  HtTaxinvoiceController.requestJob
);
router.post(
  "/popbill/v1/htTaxinvoice/GetJobState",
  HtTaxinvoiceController.GetJobState
);
router.post(
  "/popbill/v1/htTaxinvoice/Search",
  HtTaxinvoiceController.Search
);
router.post(
  "/popbill/v1/htTaxinvoice/GetPopUpURL",
  HtTaxinvoiceController.GetPopUpURL
);
router.post(
  "/popbill/v1/htTaxinvoice/GetTaxinvoice",
  HtTaxinvoiceController.GetTaxinvoice
);


module.exports = router;
