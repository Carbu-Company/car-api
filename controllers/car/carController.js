const carSelectModel = require("../../models/select/carSelectModel");
const carInsertModel = require("../../models/insert/carInsertModel");
const carUpdateModel = require("../../models/update/carUpdateModel");

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
    const { carAgent } = req.query;

    const assetList = await carSelectModel.getAssetList({ carAgent });
    res.status(200).json(assetList);
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
// 현금영수증
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 현금영수증 목록 조회
exports.getCashBillList = async (req, res, next) => {
  try {
    const cashBillList = await carSelectModel.getCashBillList();

    res.status(200).json(cashBillList);
  } catch (err) {
    next(err);
  }
};


// 현금영수증 사전 데이터 조회 - 총거래금액, 공급가액, 부가세
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


