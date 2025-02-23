const sql = require("mssql");
const pool = require("../../config/db");

// 제시 직접 등록
exports.insertCashBill = async ({
  mgtKey,
  franchiseCorpName,
  cashBillRegDate,
  totalAmount,
}) => {
  try {
    const request = pool.request();
    request.input("mgtKey", sql.VarChar, mgtKey);
    request.input("franchiseCorpName", sql.VarChar, franchiseCorpName);
    request.input("cashBillRegDate", sql.VarChar, cashBillRegDate);
    request.input("totalAmount", sql.VarChar, totalAmount);

    const query1 = `
      INSERT INTO CJB_CASHBILL (MgtKey, FranchiseCorpName, CashBillRegDate, TotalAmount)
      VALUES (@mgtKey, @franchiseCorpName, @cashBillRegDate, @totalAmount);
    `;

    const query2 = `
      INSERT INTO CJB_CASHBILL_LOG (MgtKey, CashBillRegDate)
      VALUES (@mgtKey, @cashBillRegDate);
    `;

    await Promise.all([request.query(query1), request.query(query2)]);
  } catch (err) {
    console.error("Error inserting car:", err);
    throw err;
  }
};
