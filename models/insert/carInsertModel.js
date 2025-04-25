const sql = require("mssql");
const pool = require("../../config/db");



// 시스템 사용 요청 등록
exports.insertSystemUseRequest = async ({ systemUseRequest }) => {
  try {
    const request = pool.request(); 

    request.input("SYSTEM_USE_REQUEST", sql.VarChar, systemUseRequest);







    const query = `INSERT INTO SMJ_SYSTEM_USE_REQUEST (SYSTEM_USE_REQUEST) VALUES (@SYSTEM_USE_REQUEST);`;

    await request.query(query);
  } catch (err) {
    console.error("Error inserting system use request:", err);  
    throw err;
  }
};




// 계좌정보 등록
exports.insertAccountInfo = async ({ carAgent, bankCode, accountNumber, memo, accountName }) => {
  try {
    const request = pool.request();

    request.input("CAR_AGENT", sql.VarChar, carAgent);
    request.input("BANKCODE", sql.VarChar, bankCode);
    request.input("ACCOUNTNUMBER", sql.VarChar, accountNumber);
    request.input("MEMO", sql.VarChar, memo);
    request.input("ACCOUNTNAME", sql.VarChar, accountName);

    const query = `INSERT INTO SMJ_AGENT_BANK
                              (AGENT,
                              BANKCODE,
                              ACCOUNTNUMBER,
                              USECHECK,
                              MEMO,
                              REGDATE,
                              ACCOUNTNAME)
                  VALUES      ( @CAR_AGENT, 
                                @BANKCODE,
                                @ACCOUNTNUMBER,
                                'Y',  
                                @MEMO,
                                GETDATE(),
                                @ACCOUNTNAME) ;
                                ;`;

    await request.query(query);
  } catch (err) {
    console.error("Error inserting account info:", err);
    throw err;  
  }
};


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
    request.input("totalAmount", sql.Decimal, totalAmount);

    const query1 = `
      INSERT INTO CJB_CASHBILL2 (MgtKey, FranchiseCorpName, CashBillRegDate, TotalAmount)
      VALUES (@mgtKey, @franchiseCorpName, @cashBillRegDate, @totalAmount);
    `;

    const query2 = `
      INSERT INTO CJB_CASHBILL_LOG2 (MgtKey, CashBillRegDate)
      VALUES (@mgtKey, @cashBillRegDate);
    `;

    await Promise.all([request.query(query1), request.query(query2)]);
  } catch (err) {
    console.error("Error inserting car:", err);
    throw err;
  }
};
