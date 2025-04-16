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
router.post("/getSuggestList", carController.getSuggestList);

// 제시 차량 합계 조회
router.post("/getSuggestSummary", carController.getSuggestSummary);

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
// 상품화비 
//***************************************************************************************** */

// 상품화비 목록 조회
router.post("/getGoodsFeeList", carController.getGoodsFeeList);

// 상품화비 합계 조회
router.post("/getGoodsFeeSum", carController.getGoodsFeeSum);


//***************************************************************************************** */
// 재고금융 
//***************************************************************************************** */

// 재고금융 목록 조회
router.post("/getFinanceList", carController.getFinanceList);

// 재고금융 합계 조회
router.post("/getFinanceSum", carController.getFinanceSum);

//***************************************************************************************** */
// 매도 리스트 
//***************************************************************************************** */

// 매도 리스트 조회
router.post("/getSellList", carController.getSellList);

// 매도 리스트 합계 조회
router.post("/getSellSum", carController.getSellSum);


//***************************************************************************************** */
// 알선 
//***************************************************************************************** */

// 알선 목록 조회
router.post("/getAlsonList", carController.getAlsonList);

//***************************************************************************************** */
// 운영현황 - 매출관리 
//***************************************************************************************** */

// 매출관리 목록 조회
router.post("/getSystemSalesList", carController.getSystemSalesList);

// 매출관리 합계 조회
router.post("/getSystemSalesSum", carController.getSystemSalesSum);

//***************************************************************************************** */
// 운영현황 - 매입 관리 
//***************************************************************************************** */

// 매입관리 목록 조회
router.post("/getSystemPurchaseList", carController.getSystemPurchaseList);

// 매입관리 합계 조회
router.post("/getSystemPurchaseSum", carController.getSystemPurchaseSum);

//***************************************************************************************** */
// 운영현황 - 원천징수 
//***************************************************************************************** */

// 원천징수 목록 조회
router.post("/getSystemWithholdingList", carController.getSystemWithholdingList);


//***************************************************************************************** */
// 운영현황 - 정산내역 
//***************************************************************************************** */

// 정산내역 목록 조회
router.post("/getSystemSettleList", carController.getSystemSettleList);

// 정산내역 합계 조회
router.post("/getSystemSettleSum", carController.getSystemSettleSum);

//***************************************************************************************** */
// 운영현황 - 종합내역 
//***************************************************************************************** */

// 종합내역 딜러 실적 목록 조회
router.post("/getSystemOverallDealerSumList", carController.getSystemOverallDealerSumList);

// 종합내역 현 제시 목록 조회
router.post("/getSystemOverallSuggestionList", carController.getSystemOverallSuggestionList); 

// 종합내역 매입매도비 목록 조회
router.post("/getSystemOverallBuySellList", carController.getSystemOverallBuySellList);

// 종합내역 상품화비 목록 조회
router.post("/getSystemOverallGoodsFeeList", carController.getSystemOverallGoodsFeeList);

// 종합내역 재고금융 목록 조회
router.post("/getSystemOverallFinanceList", carController.getSystemOverallFinanceList);

// 종합내역 매도현황 목록 조회
router.post("/getSystemOverallSellList", carController.getSystemOverallSellList);



//***************************************************************************************** */
// 운영현황 - 월별 현황  
//***************************************************************************************** */

// 월별 현황 목록 조회
router.post("/getSystemMonthlyList", carController.getSystemMonthlyList);


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
