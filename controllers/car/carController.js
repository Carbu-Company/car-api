const carSelectModel = require("../../models/select/carSelectModel");
const carInsertModel = require("../../models/insert/carInsertModel");
const carUpdateModel = require("../../models/update/carUpdateModel");



///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 사용 요청 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 사용 요청 등록
exports.insertUserRequest = async (req, res, next) => {
  try {
    const { agent, unionName, companyName, businessRegistrationNumber, representativeName, representativePhone, id, password, registrationCode, alive_dt, cnt } = req.body;

    await carInsertModel.insertUserRequest({ agent, unionName, companyName, businessRegistrationNumber, representativeName, representativePhone, id, password, registrationCode, alive_dt, cnt });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};  

// 시스템 사용 요청 조회
exports.getSystemUseRequest = async (req, res, next) => {
  try {
    const { carAgent } = req.body;

    const systemUseRequest = await carSelectModel.getSystemUseRequest({ carAgent });  
    res.status(200).json(systemUseRequest);
  } catch (err) {
    next(err);
  }
};  

// 인증번호 조회
exports.getPhoneAuthNumber = async (req, res, next) => {
  try {
    const { representativePhone } = req.body;  

    console.log(req.body);  

    const authNumber = await carSelectModel.getPhoneAuthNumber({ representativePhone });

    // 인증번호 등록
    await carInsertModel.insertPhoneAuthNumber({ representativePhone, authNumber });
    res.status(200).json({ success: true, authNumber: authNumber });
  } catch (err) {
    next(err);
  }
};  

// 인증번호 확인 조회
exports.checkPhoneAuthNumber = async (req, res, next) => {
  try {
    const { representativePhone, authNumber } = req.body; 

    const checkPhoneAuthNumber = await carSelectModel.checkPhoneAuthNumber({ representativePhone, authNumber });

    if (checkPhoneAuthNumber === authNumber) {
      res.status(200).json({ success: true });
    } else {
      res.status(200).json({ success: false });
    }
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 제시
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 제시 차량 조회
exports.getSuggestList = async (req, res, next) => {
  try {
    const { carAgent, carNo, carName, buyOwner, empName, customerName } =
      req.body;

    console.log(req.body);

    const cars = await carSelectModel.getSuggestList({
      carAgent,
      carNo,
      carName,
      buyOwner,
      empName,
      customerName,
    });
    res.status(200).json(cars);
  } catch (err) {
    next(err);
  }
};

// 제시 등록
exports.insertSuggest = async (req, res, next) => {
  try {
    const suggestData = req.body;
    
    // 추후 구현 필요
    await carInsertModel.insertSuggest(suggestData);
    
    res.status(200).json({ success: true, message: "제시 등록 기능이 곧 구현될 예정입니다." });
  } catch (err) {
    next(err);
  }
};

// 제시 차량 합계 조회
exports.getSuggestSummary = async (req, res, next) => {
  try {
    const { carAgent } = req.body;

    const cars = await carSelectModel.getSuggestSummary({ carAgent });
    res.status(200).json(cars);
  } catch (err) {
    next(err);
  }
};

// 제시 차량 상세 조회
exports.getSuggestDetail = async (req, res, next) => {
  try {
    const { car_regid } = req.query; 

    const suggestDetail = await carSelectModel.getSuggestDetail({ car_regid });
    res.status(200).json(suggestDetail);
  } catch (err) {
    next(err);
  }
};


// 제시 직접 등록
exports.insertCashBill = async (req, res, next) => {
  try {
    const { mgtKey, franchiseCorpName, cashBillRegDate, totalAmount } =
      req.body;
    await carInsertModel.insertCashBill({
      mgtKey,
      franchiseCorpName,
      cashBillRegDate,
      totalAmount,
    });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 매입 매도비
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 매입 매도비 목록 조회
exports.getBuySellFeeList = async (req, res, next) => {
  try {
    const { carAgent } = req.body;

    console.log(req.body);

    const buySellFeeList = await carSelectModel.getBuySellFeeList({ carAgent });
    res.status(200).json(buySellFeeList);
  } catch (err) {
    next(err);
  }
};  

// 매입 매도비 합계 조회
exports.getBuySellFeeSum = async (req, res, next) => {
  try {
    const { carAgent } = req.body;

    const buySellFeeSum = await carSelectModel.getBuySellFeeSum({ carAgent });
    res.status(200).json(buySellFeeSum);
  } catch (err) {
    next(err);
  }
};

// 매입 매도비 상세
exports.getBuySellFeeDetail = async (req, res, next) => {
  try {
    const { car_regid } = req.query; 

    const buySellFeeDetail = await carSelectModel.getBuySellFeeDetail({ car_regid });
    res.status(200).json(buySellFeeDetail);
  } catch (err) {
    next(err);
  }
};

// 매입비 항목 관리 (제시-매입정보)
exports.getBuyInfoList = async (req, res, next) => {
  try {
    const { fee_car_regid } = req.query;

    const buyInfoList = await carSelectModel.getBuyInfoList({ fee_car_regid });
    res.status(200).json(buyInfoList);
  } catch (err) {
    next(err);
  }
};

// 매입비 항목 관리 (제시-매입정보)
exports.getBuyFeeList = async (req, res, next) => {
  try {
    const { fee_car_regid } = req.query;

    const buyFeeList = await carSelectModel.getBuyFeeList({ fee_car_regid });
    res.status(200).json(buyFeeList);
  } catch (err) {
    next(err);
  }
};

// 매입비 항목 등록
exports.insertBuyFee = async (req, res, next) => {
  try {
    const { fee_car_regid, fee_kind, fee_agent, fee_no, fee_title, fee_cond, fee_rate, fee_amt, fee_inamt, fee_indate, fee_indesc } = req.body;  

    console.log(req.body);

    await carInsertModel.insertBuyFee({ fee_car_regid, fee_kind, fee_agent, fee_no, fee_title, fee_cond, fee_rate, fee_amt, fee_inamt, fee_indate, fee_indesc });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// 매입비 항목 수정
exports.updateBuyFee = async (req, res, next) => {
  try {
    const { fee_seqno, fee_no, fee_title, fee_cond, fee_rate, fee_amt, fee_inamt, fee_indate, fee_indesc } = req.body;  

    await carUpdateModel.updateBuyFee({ fee_seqno, fee_no, fee_title, fee_cond, fee_rate, fee_amt, fee_inamt, fee_indate, fee_indesc });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// 매도비 항목 관리 (제시-매도정보)
exports.getSellInfoList = async (req, res, next) => {
  try {
    const { fee_car_regid } = req.query;

    const sellInfoList = await carSelectModel.getSellInfoList({ fee_car_regid });
    res.status(200).json(sellInfoList);
  } catch (err) {
    next(err);
  }
};

// 매도비 항목 관리 (제시-매도정보)
exports.getSellFeeList = async (req, res, next) => {
  try {
    const { fee_car_regid } = req.query;

    const sellFeeList = await carSelectModel.getSellFeeList({ fee_car_regid });
    res.status(200).json(sellFeeList);
  } catch (err) {
    next(err);
  }
};

// 매도비 항목 등록
exports.insertSellFee = async (req, res, next) => {
  try {
    const { fee_car_regid, fee_kind, fee_agent, fee_no, fee_title, fee_cond, fee_rate, fee_amt, fee_inamt, fee_indate, fee_indesc } = req.body; 

    await carInsertModel.insertSellFee({ fee_car_regid, fee_kind, fee_agent, fee_no, fee_title, fee_cond, fee_rate, fee_amt, fee_inamt, fee_indate, fee_indesc });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// 매도비 항목 수정
exports.updateSellFee = async (req, res, next) => {
  try {
    const { fee_seqno, fee_no, fee_title, fee_cond, fee_rate, fee_amt, fee_inamt, fee_indate, fee_indesc } = req.body;

    await carUpdateModel.updateSellFee({ fee_seqno, fee_no, fee_title, fee_cond, fee_rate, fee_amt, fee_inamt, fee_indate, fee_indesc });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};




///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 상품화비
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 상품화비 목록 조회
exports.getGoodsFeeList = async (req, res, next) => {
  try {
    const { carAgent } = req.body;

    const goodsFeeList = await carSelectModel.getGoodsFeeList({ carAgent });
    res.status(200).json(goodsFeeList);
  } catch (err) {
    next(err);
  }
};

// 상품화비 합계 조회
exports.getGoodsFeeSum = async (req, res, next) => {
  try {
    const { carAgent } = req.body;

    const goodsFeeSum = await carSelectModel.getGoodsFeeSum({ carAgent });
    res.status(200).json(goodsFeeSum);
  } catch (err) {
    next(err);
  }
};

// 상품화비 상세 조회
exports.getGoodsFeeDetail = async (req, res, next) => {
  try {
    const { goods_regid } = req.query;

    const goodsFeeDetail = await carSelectModel.getGoodsFeeDetail({ goods_regid });
    res.status(200).json(goodsFeeDetail);
  } catch (err) {
    next(err);
  }
};

//  상품화비 상세 리스트 조회
exports.getGoodsFeeDetailList = async (req, res, next) => {
  try {
    const { goods_regid, goods_agent } = req.query;

    const goodsFeeDetailList = await carSelectModel.getGoodsFeeDetailList({ goods_regid, goods_agent });
    res.status(200).json(goodsFeeDetailList);
  } catch (err) {
    next(err);
  }
};


  
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 시제(계좌)
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 계좌정보 등록
exports.insertAccountInfo = async (req, res, next) => {
  try {
    const { carAgent, bankCode, accountNumber, memo, accountName } = req.body;

    await carInsertModel.insertAccountInfo({ carAgent, bankCode, accountNumber, memo, accountName });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};


// 계좌정보 수정
exports.updateAccountInfo = async (req, res, next) => {
  try {
    const { carAgent, bankCode, accountNumber, memo, accountName } = req.body;

    await carUpdateModel.updateAccountInfo({ carAgent, bankCode, accountNumber, memo, accountName });
    res.status(200).json({ success: true });
  } catch (err) { 
    next(err);
  }
};

// 계좌정보 조회
exports.getAccountInfo = async (req, res, next) => {
  try {
    const { carAgent } = req.query;

    const accountInfo = await carSelectModel.getAccountInfo({ carAgent });
    res.status(200).json(accountInfo);
  } catch (err) {
    next(err);
  }
};

// 시재(계좌입출금내역) 관리
exports.getAssetList = async (req, res, next) => {
  try {
    const { carAgent, accountNumber, startDate, endDate } = req.body;

    const assetList = await carSelectModel.getAssetList({ carAgent, accountNumber, startDate, endDate });
    res.status(200).json(assetList);
  } catch (err) {
    next(err);
  }
};

// 시재 합계 조회
exports.getAssetSum = async (req, res, next) => {
  try {
    const { carAgent, accountNumber, startDate, endDate } = req.body;

    const assetSum = await carSelectModel.getAssetSum({ carAgent, accountNumber, startDate, endDate });
    res.status(200).json(assetSum);
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 환경 설정
///////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
// 재고금융
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 재고금융 목록 조회
exports.getFinanceList = async (req, res, next) => {
  try {
    const { carAgent } = req.body;

    const financeList = await carSelectModel.getFinanceList({ carAgent });
    res.status(200).json(financeList);
  } catch (err) {
    next(err);
  }
};

// 재고금융 합계 조회
exports.getFinanceSum = async (req, res, next) => {
  try {
    const { carAgent } = req.body;      

    const financeSum = await carSelectModel.getFinanceSum({ carAgent });
    res.status(200).json(financeSum);
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 알선
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 알선 목록 조회
exports.getAlsonList = async (req, res, next) => {
  try {
    const { carAgent } = req.body;

    const alsonList = await carSelectModel.getAlsonList({ carAgent });
    res.status(200).json(alsonList);
  } catch (err) {
    next(err);
  }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
// 운영현황 - 매출관리
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 매출관리 목록 조회
exports.getSystemSalesList = async (req, res, next) => {
  try  {
    const { carAgent } = req.body;

    const systemSalesList = await carSelectModel.getSystemSalesList({ carAgent });
    res.status(200).json(systemSalesList);
  } catch (err) {
    next(err);
  }
};

// 매출관리 합계 조회
exports.getSystemSalesSum = async (req, res, next) => {
  try {
    const { carAgent } = req.body;  

    const systemSalesSum = await carSelectModel.getSystemSalesSum({ carAgent });
    res.status(200).json(systemSalesSum);
  } catch (err) {
    next(err);
  }
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
// 운영현황 - 매입관리
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 매입관리 목록 조회
exports.getSystemPurchaseList = async (req, res, next) => {
  try {
    const { carAgent } = req.body;

    const systemPurchaseList = await carSelectModel.getSystemPurchaseList({ carAgent });
    res.status(200).json(systemPurchaseList);
  } catch (err) {
    next(err);
  }
};

// 매입관리 합계 조회
exports.getSystemPurchaseSum = async (req, res, next) => {
  try {
    const { carAgent } = req.body;

    const systemPurchaseSum = await carSelectModel.getSystemPurchaseSum({ carAgent });
    res.status(200).json(systemPurchaseSum);
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 운영현황 - 원천징수
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 원천징수 목록 조회
exports.getSystemWithholdingList = async (req, res, next) => {
  try {
    const { carAgent } = req.body;

    const systemWithholdingList = await carSelectModel.getSystemWithholdingList({ carAgent });
    res.status(200).json(systemWithholdingList);
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 운영현황 - 정산내역
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 정산내역 목록 조회
exports.getSystemSettleList = async (req, res, next) => {
  try {
    const { carAgent } = req.body;

    const systemSettleList = await carSelectModel.getSystemSettleList({ carAgent });
    res.status(200).json(systemSettleList);
  } catch (err) {
    next(err);
  }
};

// 정산내역 합계 조회
exports.getSystemSettleSum = async (req, res, next) => {    
  try {
    const { carAgent } = req.body;

    const systemSettleSum = await carSelectModel.getSystemSettleSum({ carAgent });
    res.status(200).json(systemSettleSum);
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 운영현황 - 종합내역
/////////////////////////////////////////////////////////////////////////////////////////////////////////////// 

// 종합내역 딜러 조회
exports.getSystemOverallDealerList = async (req, res, next) => {
  try {
    const { carAgent } = req.body;  

    const systemOverallDealerList = await carSelectModel.getSystemOverallDealerList({ carAgent });
    res.status(200).json(systemOverallDealerList);
  } catch (err) {
    next(err);
  }
};

// 종합내역 딜러 실적 목록 조회
exports.getSystemOverallDealerSumList = async (req, res, next) => {
  try {
    const { carAgent } = req.body;  

    const systemOverallDealerSumList = await carSelectModel.getSystemOverallDealerSumList({ carAgent });
    res.status(200).json(systemOverallDealerSumList);
  } catch (err) {
    next(err);
  }
};

// 종합내역 현 제시 목록 조회
exports.getSystemOverallSuggestionList = async (req, res, next) => {
  try {
    const { carAgent } = req.body;  

    const systemOverallSuggestionList = await carSelectModel.getSystemOverallSuggestionList({ carAgent });
    res.status(200).json(systemOverallSuggestionList);
  } catch (err) {
    next(err);
  }
};

// 종합내역 매입매도비 목록 조회
exports.getSystemOverallBuySellList = async (req, res, next) => {
  try {
    const { carAgent } = req.body;    

    const systemOverallBuySellList = await carSelectModel.getSystemOverallBuySellList({ carAgent });
    res.status(200).json(systemOverallBuySellList);
  } catch (err) {
    next(err);
  }
};

// 종합내역 상품화비 목록 조회
exports.getSystemOverallGoodsFeeList = async (req, res, next) => {
  try {
    const { carAgent } = req.body;  

    const systemOverallGoodsFeeList = await carSelectModel.getSystemOverallGoodsFeeList({ carAgent });
    res.status(200).json(systemOverallGoodsFeeList);
  } catch (err) {
    next(err);
  }
};

// 종합내역 재고금융 목록 조회
exports.getSystemOverallFinanceList = async (req, res, next) => {
  try {
    const { carAgent } = req.body;  

    const systemOverallFinanceList = await carSelectModel.getSystemOverallFinanceList({ carAgent });
    res.status(200).json(systemOverallFinanceList);
  } catch (err) {
    next(err);
  }
};

// 종합내역 매도현황 목록 조회
exports.getSystemOverallSellList = async (req, res, next) => {
  try {
    const { carAgent } = req.body;  

    const systemOverallSellList = await carSelectModel.getSystemOverallSellList({ carAgent });
    res.status(200).json(systemOverallSellList);
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 운영현황 - 월별 현황  
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 월별 현황 목록 조회
exports.getSystemMonthlyList = async (req, res, next) => {
  try {
    const { carAgent } = req.body;

    const systemMonthlyList = await carSelectModel.getSystemMonthlyList({ carAgent });
    res.status(200).json(systemMonthlyList);
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 운영현황 - 예상부가세  
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 예상부가세 매출 현황 목록 조회
exports.getSystemVatSalesList = async (req, res, next) => {
  try {
    const { carAgent } = req.body;

    const systemVatSalesList = await carSelectModel.getSystemVatSalesList({ carAgent });
    res.status(200).json(systemVatSalesList);
  } catch (err) {
    next(err);
  }
};

// 예상부가세 매입 현황 목록 조회
exports.getSystemVatPurchaseList = async (req, res, next) => {
  try {
    const { carAgent } = req.body;  

    const systemVatPurchaseList = await carSelectModel.getSystemVatPurchaseList({ carAgent });
    res.status(200).json(systemVatPurchaseList);
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 현금영수증 발행
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 현금영수증 발행 목록 조회
exports.getCashBillList = async (req, res, next) => {
  try {
    const { carAgent } = req.body;
    const cashBillList = await carSelectModel.getCashBillList({ carAgent });

    res.status(200).json(cashBillList);
  } catch (err) {
    next(err);
  }
};


// 현금영수증 발행 사전 데이터 조회 - 총거래금액, 공급가액, 부가세
exports.getCashBillAmount = async (req, res, next) => {
  try {
    const { costSeq } = req.query;
    const cashBillAmount = await carSelectModel.getCashBillAmount({
      costSeq,
    });
    res.status(200).json(cashBillAmount);
  } catch (err) {
    next(err);
  }
};



///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 현금영수증 발행 리스트 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 현금영수증 발행 리스트 조회
exports.getReceiptIssueList = async (req, res, next) => {
  try {
    const { carAgent } = req.body;
    const receiptIssueList = await carSelectModel.getReceiptIssueList({ carAgent });

    res.status(200).json(receiptIssueList);
  } catch (err) {
    next(err);
  }
};


// 현금영수증 발행 리스트 합계 조회
exports.getReceiptIssueSummary = async (req, res, next) => {
  try {
    const { carAgent } = req.body;
    const receiptIssueSummary = await carSelectModel.getReceiptIssueSummary({ carAgent });

    res.status(200).json(receiptIssueSummary);
  } catch (err) {
    next(err);
  }
};



///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 전자세금계산서 발행 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 전자세금계산서 발행 목록 조회
exports.getTaxInvoiceList = async (req, res, next) => {
  try {
    const { carAgent } = req.body;
    const taxInvoiceList = await carSelectModel.getTaxInvoiceList({ carAgent });

    res.status(200).json(taxInvoiceList);
  } catch (err) {
    next(err);
  }
};


// 전자세금계산서 발행 사전 데이터 조회 - 총거래금액, 공급가액, 부가세
exports.getTaxInvoiceAmount = async (req, res, next) => {
  try {
    const { eInvoiceSeq } = req.query;
    const taxInvoiceAmount = await carSelectModel.getTaxInvoiceAmount({
      eInvoiceSeq,
    });
    res.status(200).json(taxInvoiceAmount);
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 전자세금계산서 발행 리스트 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 전자세금계산서 발행 리스트 조회
exports.getTaxIssueList = async (req, res, next) => {
  try {
    const { carAgent } = req.body;
    const taxIssueList = await carSelectModel.getTaxIssueList({ carAgent });

    res.status(200).json(taxIssueList);
  } catch (err) {
    next(err);
  }
};


// 전자세금계산서 발행 리스트 합계 조회
exports.getTaxIssueSummary = async (req, res, next) => {
  try {
    const { carAgent } = req.body;
    const taxIssueSummary = await carSelectModel.getTaxIssueSummary({ carAgent });

    res.status(200).json(taxIssueSummary);
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 매도 리스트
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 매도 리스트 조회
exports.getSellList = async (req, res, next) => {
  try {
    const { carAgent } = req.body;

    const sellList = await carSelectModel.getSellList({ carAgent });

    res.status(200).json(sellList);
  } catch (err) {
    next(err);
  }
};

// 매도 종합 합계 조회
exports.getSellSum = async (req, res, next) => {
  try {
    const { carAgent } = req.body;      

    const sellSum = await carSelectModel.getSellSum({ carAgent });
    res.status(200).json(sellSum);
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 환경설정
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 상사 정보 관리
exports.getCompanyInfo = async (req, res, next) => {
  try {
    const { carAgent } = req.body;
    const companyInfo = await carSelectModel.getCompanyInfo({ carAgent });
    res.status(200).json(companyInfo);
  } catch (err) { 
    next(err);
  }
};  



// 상사 조합 딜러 관리
exports.getCompanySangsaDealer = async (req, res, next) => {
  try {
    const { sangsaCode } = req.body;
    const companySangsaDealer = await carSelectModel.getCompanySangsaDealer({ sangsaCode });
    res.status(200).json(companySangsaDealer);
  } catch (err) {
    next(err);
  }
};  


// 상사 딜러 관리
exports.getCompanyDealer = async (req, res, next) => {
  try {
    const { carAgent } = req.body;
    const companyDealer = await carSelectModel.getCompanyDealer({ carAgent });
    res.status(200).json(companyDealer);
  } catch (err) {
    next(err);
  }
};  


// 매입비 설정 조회
exports.getPurchaseCost = async (req, res, next) => {
  try {
    const { carAgent } = req.body;
    const purchaseCost = await carSelectModel.getPurchaseCost({ carAgent });
    res.status(200).json(purchaseCost);
  } catch (err) {
    next(err);
  }
};  


// 매도비 설정 합계 조회
exports.getSellCostSummary = async (req, res, next) => {
  try {
    const { carAgent } = req.body;
    const sellCostSummary = await carSelectModel.getSellCostSummary({ carAgent });  
    res.status(200).json(sellCostSummary);
  } catch (err) {
    next(err);
  }
};


// 상사지출항목설정 조회  
exports.getCompanyExpense = async (req, res, next) => {
  try {
    const { carAgent } = req.body;
    const companyExpense = await carSelectModel.getCompanyExpense({ carAgent });
    res.status(200).json(companyExpense);
  } catch (err) {
    next(err);
  }
};  


// 상사수입항목설정 조회
exports.getCompanyIncome = async (req, res, next) => {
  try {
    const { carAgent } = req.body;
    const companyIncome = await carSelectModel.getCompanyIncome({ carAgent });  
    res.status(200).json(companyIncome);
  } catch (err) {
    next(err);
  }
};  


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 공통
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Mgt 키 조회
exports.getMgtKey = async (req, res, next) => {
  try {
    const { carAgent } = req.query;
    const mgtKey = await carSelectModel.getMgtKey({ carAgent });
    res.status(200).json(mgtKey); 
  } catch (err) {
    next(err);
  }
};

// 딜러 조회
exports.getDealerList = async (req, res, next) => {
  try {
    const { carAgent } = req.query;
    const dealerList = await carSelectModel.getDealerList({ carAgent });
    res.status(200).json(dealerList);
  } catch (err) {
    next(err);
  }
};

// 공통코드 조회
exports.getCDList = async (req, res, next) => {
  try {
    const { grpCD } = req.query;
    const cdList = await carSelectModel.getCDList({ grpCD });
    res.status(200).json(cdList);
  } catch (err) {
    next(err);
  }
};


