const carSelectModel = require("../../models/select/carSelectModel");
const carInsertModel = require("../../models/insert/carInsertModel");
// 제시 차량 조회
exports.getCars = async (req, res, next) => {
  try {
    const { carAgent } = req.query;
    const cars = await carSelectModel.getCars({ carAgent });
    res.status(200).json(cars);
  } catch (err) {
    next(err);
  }
};

// 제시 직접 등록 키 조회
exports.getMgKey = async (req, res, next) => {
  try {
    const { carAgent } = req.query;
    const mgtKey = await carSelectModel.getMgKey({ carAgent });
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

    res
      .status(200)
      .json({ success: true, message: "Cash bill inserted successfully" });
  } catch (err) {
    next(err);
  }
};
