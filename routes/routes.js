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
// DB SQL 조회 (공통 2.0)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 관리키 조회
router.get("/getMgtKey", carController.getMgtKey);

// 로그인
router.post("/login", loginController.loginController);

// 공통코드 조회
router.get("/getCDList", carController.getCDList);

// 공통코드 전체 조회
router.get("/getCDAllList", carController.getCDAllList);

// 공통코드 등록
router.get("/InsertCommCd", carController.insertCommCd);

// 공통코드 수정
router.get("/updateCommCd", carController.updateCommCd);

// 딜러 조회
router.get("/getDealerList", carController.getDealerList);

// 고객 목록 조회
router.get("/getCustomerList", carController.getCustomerList);

// 상사 대출 업체 대출 한도
router.get("/getCompanyLoanLimit", carController.getCompanyLoanLimit);

// 상사정보관리 조회
router.get("/getAgentInfo", carController.getAgentInfo);

// 상사 매입비 기본값 조회
router.get("/getAgentPurCst", carController.getAgentPurCst);


//***************************************************************************************** */
// 차량 검색 설정
//***************************************************************************************** */
router.get("/getCarSearchList", carController.getCarSearchList);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 사용 요청 2.0
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
router.get("/getCarPurInfo", carController.getCarPurInfo);    



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

// 차량 판매 정보 조회
router.get("/getCarSelInfo", carController.getCarSelInfo);

// 차량 판매 첨부파일 목록 조회
router.get("/getCarSelFilesList", carController.getCarSelFilesList);

// 차량 판매 첨부파일 상세 조회
router.get("/getCarSelCustList", carController.getCarSelCustList);

// 판매매도 수정 등록
router.post("/updateCarSel", carController.updateCarSel);

// 판매매도 삭제 
router.get("/deleteCarSel", carController.deleteCarSel);

// 판매매도 고객 등록
router.post("/insertCarBuyCust", carController.insertCarBuyCust);


//***************************************************************************************** */
// 상품화비 2.0
//***************************************************************************************** */

// 상품화비용 리스트 조회
router.post("/getGoodsFeeList", carController.getGoodsFeeList);

// 차량별 리스트 조회
router.post("/getGoodsFeeCarSumList", carController.getGoodsFeeCarSumList);

// 상품화비 상세 리스트 조회
router.get("/getCarGoodsInfo", carController.getCarGoodsInfo);

// 상품화비 상세 조회
router.get("/getGoodsFeeDetail", carController.getGoodsFeeDetail);

// 상품화비 차량 합계 조회
router.post("/getGoodsFeeCarSummary", carController.getGoodsFeeCarSummary);

// 상품화비용 지출 저장
router.post("/insertGoodsFee", carController.insertGoodsFee);

// 상품화비용 지출 수정 등록
router.post("/updateGoodsFee", carController.updateGoodsFee);

// 상품화비 전체 삭제 
router.get("/deleteAllGoodsFee", carController.deleteAllGoodsFee);

// 상품화비 한건 삭제 
router.get("/deleteGoodsFee", carController.deleteGoodsFee);

//***************************************************************************************** */
// 재고금융 2.0
//***************************************************************************************** */

// 재고금융 등록/리스트 조회
router.post("/getCarLoanSumList", carController.getCarLoanSumList);

// 이자납입리스트 조회
router.post("/getCarLoanList", carController.getCarLoanList);

// 재고 금융 합계
router.post("/getCarLoanSummary", carController.getCarLoanSummary);

// 차량 대출 정보 조회
router.get("/getCarLoanInfo", carController.getCarLoanInfo);

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

// 캐피탈사별 대출 한도 조회
router.get("/getCarLoanCorpList", carController.getCarLoanCorpList);

// 캐피탈사 대출 잔여 금액 조회
router.get("/getCarLoanCorpLmtAmt", carController.getCarLoanCorpLmtAmt);

// 대출 한건에 대한 정보
router.get("/getCarLoanIdOneInfo", carController.getCarLoanIdOneInfo);


// 이자납입 등록
router.post("/insertLoanIntrPay", carController.insertLoanIntrPay);

// 이자납입 수정 등록
router.post("/updateLoanIntrPay", carController.updateLoanIntrPay);

// 이자납입 삭제 
router.post("/deleteLoanIntrPay", carController.deleteLoanIntrPay);


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
router.get("/getCarConcilInfo", carController.getCarConcilInfo);

// 알선 판매 수정
router.post("/updateCarConcil", carController.updateCarConcil);


//***************************************************************************************** */
// 현금영수증 2.0
//***************************************************************************************** */

// 거래 발행 리스트들 (현금영수증, 전자세금계산서) 목록 데이터 조회
router.post("/getTradeIssueList", carController.getTradeIssueList);

// 현금영수증 발행 목록 데이터 조회
router.post("/getTradeIssueSummary", carController.getTradeIssueSummary);

// 현금영수증 발행 목록 데이터 조회
router.post("/getCarCashList", carController.getCarCashList);

// 현금영수증 합계 조회
router.post("/getCarCashSummary", carController.getCarCashSummary);

// 현금영수증 상세 조회
router.get("/getCarCashInfo", carController.getCarCashInfo);

// 거래 발행 상세 정보 조회
router.get("/getCashIssueInfo", carController.getCashIssueInfo);

// 현금영수증 발행 정보 등록 
router.post("/insertCarCash", carController.insertCarCash);

// 현금영수증 발행 정보 수정 
router.post("/updateCarCash", carController.updateCarCash);

//***************************************************************************************** */
// 전자세금계산서 2.0
//***************************************************************************************** */

// 전자세금계산서 발행 대상 목록 데이터 조회
router.post("/getCarTaxList", carController.getCarTaxList);

// 전자세금계산서 발행 사전 데이터 조회 - 총거래금액, 공급가액, 부가세
router.post("/getCarTaxSummary", carController.getCarTaxSummary);

// 전자세금계산서 발행 상세 조회
router.get("/getCarTaxInfo", carController.getCarTaxInfo);

// 전자세금계산서 항목 상세 조회
router.get("/getCarTaxItemInfo", carController.getCarTaxItemInfo);

// 전자세금계산서 발행 상세 정보 조회
router.get("/getCarTaxIssueInfo", carController.getCarTaxIssueInfo);

// 전자세금계산서 발행 상세 정보 조회
router.get("/getTaxIssueInfo", carController.getTaxIssueInfo);

// 전자세금계산서 등록
router.post("/insertCarTax", carController.insertCarTax);

// 전자세금계산서 수정 등록
router.post("/updateCarTax", carController.updateCarTax);

// 전자세금계산서 삭제 
router.get("/deleteCarTax", carController.deleteCarTax);

//***************************************************************************************** */
// 타상사알선거래 2.0
//***************************************************************************************** */

// 타상사알선거래 목록 조회
router.post("/getCarBrkTradeList", carController.getCarBrkTradeList);

// 타상사알선거래 합계 조회
router.post("/getCarBrkTradeSummary", carController.getCarBrkTradeSummary);

// 타상사알선거래 상세 조회
router.get("/getCarBrkTradeInfo", carController.getCarBrkTradeInfo);

// 타상사알선거래 등록
router.post("/insertCarBrkTrade", carController.insertCarBrkTrade);

// 타상사알선거래 수정
router.post("/updateCarBrkTrade", carController.updateCarBrkTrade);

// 타상사알선거래 삭제
router.get("/deleteCarBrkTrade", carController.deleteCarBrkTrade);

//***************************************************************************************** */
// 계좌 2.0
//***************************************************************************************** */

// 계좌 목록 조회
router.post("/getCarAcctList", carController.getCarAcctList);

// 계좌정보 합계 조회
router.post("/getCarAcctSummary", carController.getCarAcctSummary);

// 계좌정보 상세 조회
router.get("/getCarAcctDetail", carController.getCarAcctDetail);

// 계좌정보 목록 조회
router.get("/getAgentAcctList", carController.getAgentAcctList);

// 계좌 상세 저장
router.post("/insertCarAcctDetail", carController.insertCarAcctDetail);

// 계좌 상세 수정
router.post("/updateCarAcctDetail", carController.updateCarAcctDetail);

//***************************************************************************************** */
// 고객 2.0
//***************************************************************************************** */

// 고객 목록 조회
router.post("/getCarCustList", carController.getCarCustList);

// 고객 상세 조회
router.get("/getCarCustDetail", carController.getCarCustDetail);

// 고객 등록
router.post("/insertCarCust", carController.insertCarCust);

// 고객 상세 조회
router.post("/getCarCustExist", carController.getCarCustExist);

//***************************************************************************************** */
// 사용자 2.0
//***************************************************************************************** */

// 사용자 목록 조회
router.post("/getUsrList", carController.getUsrList); 

// 사용자 상세 조회
router.get("/getUsrDetail", carController.getUsrDetail);

// 사용자 등록
router.post("/insertUsr", carController.insertUsr);

// 사용자 수정
router.post("/updateUsr", carController.updateUsr);

// 사용자 삭제
router.get("/deleteUsr", carController.deleteUsr);


//***************************************************************************************** */
// 정산 2.0
//***************************************************************************************** */

// 정산 목록 조회
router.post("/getCarAdjList", carController.getCarAdjList);

// 정산 합계 조회
router.post("/getCarAdjSummary", carController.getCarAdjSummary);

// 정산 조회
router.get("/getCarAdjInfo", carController.getCarAdjInfo);

// 정산 상세 목록 조회
router.get("/getCarAdjDtlList", carController.getCarAdjDtlList);

// 정산 저장
router.post("/insertCarAdj", carController.insertCarAdj);

// 정산 수정
router.post("/updateCarAdj", carController.updateCarAdj);

// 정산 삭제
router.get("/deleteCarAdj", carController.deleteCarAdj);

// 정산 상세 삭제
router.get("/deleteCarAdjDtl", carController.deleteCarAdjDtl);

//***************************************************************************************** */
// 상사 2.0
//***************************************************************************************** */

// 상사 목록
router.post("/getCarAgentList", carController.getCarAgentList);

// 상사 목록
router.post("/getCarAgentSummary", carController.getCarAgentSummary);

// 상사 목록
router.get("/getCarAgentInfo", carController.getCarAgentInfo);

// 상사 목록
router.post("/insertCarAgent", carController.insertCarAgent);

// 상사 목록
router.post("/updateCarAgent", carController.updateCarAgent);

// 상사 목록
router.get("/deleteCarAgent", carController.deleteCarAgent);



//***************************************************************************************** */
// 상사 거래 항목 / 차량 거래 금액 2.0
//***************************************************************************************** */

// 상사 거래 항목 목록
router.get("/getAgentTradeItemList", carController.getAgentTradeItemList);

// 상사 거래 항목 상세 조회
router.get("/getAgentTradeItemInfo", carController.getAgentTradeItemInfo);

// 상사 거래 항목 등록
router.post("/insertAgentTradeItem", carController.insertAgentTradeItem);

// 상사 거래 항목 수정
router.post("/updateAgentTradeItem", carController.updateAgentTradeItem);

// 상사 거래 항목 삭제
router.get("/deleteAgentTradeItem", carController.deleteAgentTradeItem);

// 차량 거래 금액 목록
router.post("/getCarTradeAmtList", carController.getCarTradeAmtList);

// 차량 거래 금액 상세 조회
router.get("/getCarTradeAmtInfo", carController.getCarTradeAmtInfo);

// 차량 거래 금액 등록
router.post("/insertCarTradeAmt", carController.insertCarTradeAmt);

// 차량 거래 금액 수정
router.post("/updateCarTradeAmt", carController.updateCarTradeAmt);

// 차량 거래 금액 삭제
router.get("/deleteCarTradeAmt", carController.deleteCarTradeAmt);


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
// 공지 게시판 2.0
//***************************************************************************************** */

// 공지 목록 조회
router.post("/getNoticeList", carController.getNoticeList);

// 공지 상세 조회
router.get("/getNoticeInfo", carController.getNoticeInfo);

// 공지 등록
router.post("/insertNotice", carController.insertNotice);

// 공지 수정
router.post("/updateNotice", carController.updateNotice);

// 공지 삭제
router.get("/deleteNotice", carController.deleteNotice);

//***************************************************************************************** */
// FAQ 게시판
//***************************************************************************************** */

// faq 조회 (답변 포함)
router.get("/getFaqList", carController.getFaqList);

// faq 상세 조회 (답변 포함)
router.get("/getFaqDetail", carController.getFaqDetail);

// faq 등록 
router.get("/insertFaqBoard", carController.insertFaqBoard);

// faq 수정
router.get("/updateFaqBoard", carController.updateFaqBoard);

// 댓글 등록 
router.get("/insertRplBoard", carController.insertRplBoard);

// 댓글 수정 
router.get("/updateRplBoard", carController.updateRplBoard);


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
