const carSelectModel = require("../../models/select/carSelectModel");
const carInsertModel = require("../../models/insert/carInsertModel");
// 제시 차량 조회
exports.SuggestSelectData = async (req, res, next) => {
  try {
    const { carAgent, carNo, carName, buyOwner, empName, customerName } =
      req.body;
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

// 제시 직접 등록 키 조회
exports.getMgtKey = async (req, res, next) => {
  try {
    const { carAgent } = req.query;
    const mgtKey = await carSelectModel.getMgtKey({ carAgent });
    res.status(200).json(mgtKey);
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

// 현금영수증 사전 데이터 조회
exports.getCashBillPreData = async (req, res, next) => {
  try {
    const cashBillPreData = await carSelectModel.getCashBillPreData();

    res.status(200).json(cashBillPreData);
  } catch (err) {
    next(err);
  }
  e;
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
