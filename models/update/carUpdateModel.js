const sql = require("mssql");
const pool = require("../../config/db");

// 계좌정보 수정
exports.updateAccountInfo = async ({ carAgent, bankCode, accountNumber, memo, accountName }) => {
  try {
    const request = pool.request();

    request.input("CAR_AGENT", sql.VarChar, carAgent);  
    request.input("BANKCODE", sql.VarChar, bankCode);
    request.input("ACCOUNTNUMBER", sql.VarChar, accountNumber);
    request.input("MEMO", sql.VarChar, memo);
    request.input("ACCOUNTNAME", sql.VarChar, accountName);

    const query = `UPDATE SMJ_AGENT_BANK
                      SET MEMO =@MEMO,
                          ACCOUNTNAME = @ACCOUNTNAME
                    WHERE AGENT = @CAR_AGENT
                      AND BANKCODE = @BANKCODE
                      AND ACCOUNTNUMBER = @ACCOUNTNUMBER;`;

    await request.query(query);     
  } catch (err) {
    console.error("Error updating account info:", err);
    throw err;
  }
};


