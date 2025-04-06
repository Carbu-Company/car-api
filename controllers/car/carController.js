const carSelectModel = require("../../models/select/carSelectModel");
const carInsertModel = require("../../models/insert/carInsertModel");
const carUpdateModel = require("../../models/update/carUpdateModel");

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 매입 매도비
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 매입 매도비 목록 조회
exports.getBuySellFeeList = async (req, res, next) => {
  try {
    const { carAgent, carNo = null } = req.body;

    console.log(req.body);

    const buySellFeeList = await carSelectModel.getBuySellFeeList({ carAgent, carNo });
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
exports.SuggestSelectData = async (req, res, next) => {
  try {
    const { carAgent, carNo, carName, buyOwner, empName, customerName } =
      req.body;

    console.log(req.body);

    const cars = await carSelectModel.SuggestSelectData({
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
// 차량 판매
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.getSellPreData = async (req, res, next) => {
  try {
    const sellPreData = await carSelectModel.getSellPreData();

    res.status(200).json(sellPreData);
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


