const express = require("express");
const carController = require("../controllers/car/carController");
const loginController = require("../controllers/car/loginController");
const CashbillController = require("../controllers/popbill/cashbillController");
const TaxinvoiceController = require("../controllers/popbill/taxinvoiceController");
const EasyFinBankController = require("../controllers/popbill/easyFinBankController");
const KakaoController = require("../controllers/popbill/kakaoController");
const SmsController = require("../controllers/popbill/smsController");
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

// 고객 목록 조회
router.get("/getCustomerList", carController.getCustomerList);

// 상사 대출 업체 대출 한도
router.get("/getCompanyLoanLimit", carController.getCompanyLoanLimit);



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 사용 요청 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 사용 요청 등록
router.post("/insertUserRequest", carController.insertUserRequest); 

// 사용 요청 수정
router.post("/registerUser", carController.registerUser); 

// 사용 요청 수정
router.get("/checkSangsaCode", carController.checkSangsaCode); 

// 시스템 사용 요청 조회
router.get("/getSystemUseRequest", carController.getSystemUseRequest); 

// 인증번호 조회
router.post("/getPhoneAuthNumber", carController.getPhoneAuthNumber);

// 인증번호 확인 조회
router.post("/checkPhoneAuthNumber", carController.checkPhoneAuthNumber);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DB SQL 조회 (업무)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//***************************************************************************************** */
// 제시 2.0
//***************************************************************************************** */

// 제시 차량 조회
router.post("/getCarPurList", carController.getCarPurList);

// 제시 차량 합계 조회
router.post("/getCarPurSummary", carController.getCarPurSummary);

// 제시 차량 상세 조회
router.get("/getCarPurDetail", carController.getCarPurDetail);    

// 제시 등록
router.post("/insertCarPur", carController.insertCarPur);

// 제시 수정 등록
router.post("/updateCarPur", carController.updateCarPur);

// 제시 삭제 
router.get("/deleteCarPur", carController.deleteCarPur);


//***************************************************************************************** */
// 매도 2.0
//***************************************************************************************** */

// 제시 차량 조회
router.post("/getCarSelList", carController.getCarSelList);

// 판매매도 차량 합계 조회
router.post("/getCarSelSummary", carController.getCarSelSummary);

// 판매매도 수정 등록
router.post("/updateCarSel", carController.updateCarSel);

// 판매매도 삭제 
router.get("/deleteCarSel", carController.deleteCarSel);

//***************************************************************************************** */
// 매입 매도비 
//***************************************************************************************** */

// 매입 매도비 목록 조회
router.post("/getBuySellFeeList", carController.getBuySellFeeList);

// 매입 매도비 합계 조회
router.post("/getBuySellFeeSum", carController.getBuySellFeeSum);

// 매입 매도비 상세
router.get("/getBuySellFeeDetail", carController.getBuySellFeeDetail);    

// 매입비 항목 관리 (제시-매입정보)
router.get("/getBuyInfoList", carController.getBuyInfoList);

// 매입비 항목 관리 (제시-매입정보)
router.get("/getBuyFeeList", carController.getBuyFeeList);

// 매입비 항목 등록
router.post("/insertBuyFee", carController.insertBuyFee);

// 매입비 항목 수정
router.post("/updateBuyFee", carController.updateBuyFee);

// 매도비 항목 관리 (제시-매도정보)
router.get("/getSellInfoList", carController.getSellInfoList);

// 매도비 항목 관리 (제시-매도정보)
router.get("/getSellFeeList", carController.getSellFeeList);

// 매도비 항목 등록
router.post("/insertSellFee", carController.insertSellFee);

// 매입비 합계 변경
router.post("/updateBuyFeeSum", carController.updateBuyFeeSum);

//***************************************************************************************** */
// 상품화비 
//***************************************************************************************** */

// 상품화비용 리스트 조회
router.post("/getGoodsFeeList", carController.getGoodsFeeList);

// 차량별 리스트 조회
router.post("/getGoodsFeeCarSumList", carController.getGoodsFeeCarSumList);

// 상품화비 상세 리스트 조회
router.get("/getGoodsFeeDetailList", carController.getGoodsFeeDetailList);

// 상품화비 상세 조회
router.get("/getGoodsFeeDetail", carController.getGoodsFeeDetail);

// 상품화비 차량 합계 조회
router.post("/getGoodsFeeCarSummary", carController.getGoodsFeeCarSummary);

// 상품화비용 지출 저장
router.post("/insertGoodsFee", carController.insertGoodsFee);



//***************************************************************************************** */
// 재고금융 2.0
//***************************************************************************************** */

// 재고금융 등록/리스트 조회
router.post("/getCarLoanSumList", carController.getCarLoanSumList);

// 이자납입리스트 조회
router.post("/getCarLoanList", carController.getCarLoanList);

// 재고 금융 합계
router.post("/getCarLoanSummary", carController.getCarLoanSummary);

// 재고금융 등록
router.post("/insertCarLoan", carController.insertCarLoan);

// 재고금융 수정 등록
router.post("/updateCarLoan", carController.updateCarLoan);

// 재고금융 삭제 
router.get("/deleteCarLoan", carController.deleteCarLoan);

// 재고금융 상사 등록
router.post("/insertAgentLoanCorp", carController.insertAgentLoanCorp);

// 재고금융 상사 수정 등록
router.post("/updateAgentLoanCorp", carController.updateAgentLoanCorp);

// 재고금융 상사 삭제 
router.get("/deleteAgentLoanCorp", carController.deleteAgentLoanCorp);



//***************************************************************************************** */
// 알선 2.0
//***************************************************************************************** */

// 알선 판매 리스트 조회
router.post("/getCarConcilList", carController.getCarConcilList);

// 알선 판매 합계 조회
router.post("/getCarConcilSummary", carController.getCarConcilSummary);

// 알선 판매 등록
router.post("/insertCarConcil", carController.insertCarConcil);

// 알선 판매 상세 조회
router.get("/getCarConcilDetail", carController.getCarConcilDetail);


//***************************************************************************************** */
// 재고금융 
//***************************************************************************************** */

// 재고금융 목록 조회
router.post("/getFinanceList", carController.getFinanceList);

// 재고금융 합계 조회
router.post("/getFinanceSum", carController.getFinanceSum);

// 재고금융 상세 조회
router.get("/getFinanceDetail", carController.getFinanceDetail);

// 재고금융 차량 상세 조회
router.get("/getFinanceDetailCarInfo", carController.getFinanceDetailCarInfo);  

// 재고금융 차량 상세 목록 조회
router.get("/getFinanceDetailList", carController.getFinanceDetailList);  


//***************************************************************************************** */
// 매도 리스트 
//***************************************************************************************** */

// 매도 리스트 조회
router.post("/getSellList", carController.getSellList);

// 매도 리스트 합계 조회
router.post("/getSellSum", carController.getSellSum);


//***************************************************************************************** */
// 매도 상세 
//***************************************************************************************** */

// 매도 리스트 상세 목록 조회
router.get("/getSellDetail", carController.getSellDetail);

// 매도비 조회
router.get("/getSellFee", carController.getSellFee);

// 재고금융이자 조회
router.get("/getFinanceInterest", carController.getFinanceInterest);

// 매출증빙 목록 조회
router.get("/getSellProofList", carController.getSellProofList);

// 매도 취소 변경
router.post("/updateSellCancel", carController.updateSellCancel);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 정산 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 매입매도비 상세 조회
router.get("/getBuyDetail", carController.getBuyDetail);

// 정산 목록 조회
router.get("/getSettlementPurchaseInfo", carController.getSettlementPurchaseInfo);

// 정산 매입매도비 합계 조회
router.get("/getSettlementPurchaseFee", carController.getSettlementPurchaseFee);

// 정산 매입매도비 차이 조회
router.get("/getSettlementPurchaseFeeDiff", carController.getSettlementPurchaseFeeDiff);

// 정산 매입매도비 1% 조회
router.get("/getSettlementPurchaseFeeOnePercent", carController.getSettlementPurchaseFeeOnePercent);

// 정산 상품화비(부가세 공제건만 가져옴)
// 부가세 공제건만 딜러 공제 인정해주는 상사
//router.post("/getSettlementGoodsSangFee", carController.getSettlementGoodsSangFee);

// 부가세 공제건만 딜러 공제 인정해주는 상사
router.get("/getSettlementGoodsFee", carController.getSettlementGoodsFee);

// 정산 상품화비 합계 조회
router.get("/getSettlementGoodsFeeSum", carController.getSettlementGoodsFeeSum);

// 정산 매도비 조회
router.get("/getSettlementSellFee", carController.getSettlementSellFee);

// 정산 수수료 표준 금액 조회
router.get("/getSettlementSellFeeStandard", carController.getSettlementSellFeeStandard);

// 매도 상세 조회
router.get("/getSoldDetail", carController.getSoldDetail);

// 정산 재고금융 존재 여부
router.get("/getSettlementStockFinanceExist", carController.getSettlementStockFinanceExist);

// 정산 이자 수익 계산
router.get("/getSettlementInterestRevenue", carController.getSettlementInterestRevenue);

// 재고금융 합계 조회
router.get("/getSettlementInterestRevenueSum", carController.getSettlementInterestRevenueSum);

// 매도 미납 총 합계
router.get("/getSettlementSellMinapSum", carController.getSettlementSellMinapSum);

// 정산 매입,매도,재고금융 명칭 가져오기
router.get("/getSettlementStockFinanceName", carController.getSettlementStockFinanceName);






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
// 운영현황 - 예상부가세  
//***************************************************************************************** */

// 예상부가세 매출 현황 목록 조회
router.post("/getSystemVatSalesList", carController.getSystemVatSalesList);

// 예상부가세 매입 현황 목록 조회
router.post("/getSystemVatPurchaseList", carController.getSystemVatPurchaseList);


//***************************************************************************************** */
// 현금영수증 2.0
//***************************************************************************************** */

// 현금영수증 발행 목록 데이터 조회
router.post("/getCarCashList", carController.getCarCashList);

// 현금영수증 합계 조회
router.post("/getCarCashSummary", carController.getCarCashSummary);

// 현금영수증 상세 조회
router.get("/getCarCashDetail", carController.getCarCashDetail);

//***************************************************************************************** */
// 전자세금계산서 2.0
//***************************************************************************************** */

// 전자세금계산서 발행 대상 목록 데이터 조회
router.post("/getCarTaxList", carController.getCarTaxList);

// 전자세금계산서 발행 사전 데이터 조회 - 총거래금액, 공급가액, 부가세
router.post("/getCarTaxSummary", carController.getCarTaxSummary);

// 전자세금계산서 발행 상세 조회
router.get("/getCarTaxDetail", carController.getCarTaxDetail);


//***************************************************************************************** */
// 계좌 2.0
//***************************************************************************************** */

// 계좌 목록 조회
router.post("/getCarAcctList", carController.getCarAcctList);

// 계좌정보 합계 조회
router.post("/getCarAcctSummary", carController.getCarAcctSummary);

// 계좌정보 상세 조회
router.get("/getCarAcctDetail", carController.getCarAcctDetail);

//***************************************************************************************** */
// DASH BOARD
//***************************************************************************************** */


// 현금영수증 , 세금계산서서 조회
router.get("/getTaxCashNoList", carController.getTaxCashNoList);

// 금융융 조회
router.get("/getInventoryFinanceStatus", carController.getInventoryFinanceStatus);

// 차량 대출 정보 조회
router.get("/getCarLoanInfo", carController.getCarLoanInfo);

// 매출, 매입 합계 조회
router.get("/getSalesPurchaseSummary", carController.getSalesPurchaseSummary);

// 문의 조회
router.get("/getInquiryStatus", carController.getInquiryStatus);

// 문의 조회
router.get("/getNoticeStatus", carController.getNoticeStatus);

//***************************************************************************************** */
// 환경 설정
//***************************************************************************************** */

// 상사정보관리 조회
router.post("/getCompanyInfo", carController.getCompanyInfo);

// 상사딜러관리 조회
router.post("/getCompanyDealer", carController.getCompanyDealer);

// 상사 조합 딜러 관리
router.post("/getCompanySangsaDealer", carController.getCompanySangsaDealer);  

// 매입비 설정 조회
router.post("/getPurchaseCost", carController.getPurchaseCost);

// 매도비 설정 합계 조회
router.post("/getSellCostSummary", carController.getSellCostSummary);

// 상사지출항목설정 조회
router.post("/getCompanyExpense", carController.getCompanyExpense);

// 상사수입항목설정 조회
router.post("/getCompanyIncome", carController.getCompanyIncome);

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

/* 문자 */
router.post(
  "/popbill/v1/sms/sendSMS",
  SmsController.sendSMS
);

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
router.post("/popbill/v1/faxService/sendOneFAX", FaxServiceController.sendOneFAX);


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
