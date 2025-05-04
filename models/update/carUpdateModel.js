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


// 매입비 항목 수정
exports.updateBuyFee = async ({ fee_seqno, fee_no, fee_title, fee_cond, fee_rate, fee_amt, fee_inamt, fee_indate, fee_indesc }) => {
  try {
    const request = pool.request();

    request.input("FEE_SEQNO", sql.Int, fee_seqno);  
    request.input("FEE_NO", sql.Int, fee_no);
    request.input("FEE_TITLE", sql.VarChar, fee_title);
    request.input("FEE_COND", sql.VarChar, fee_cond);
    request.input("FEE_RATE", sql.Decimal, fee_rate);
    request.input("FEE_AMT", sql.Decimal, fee_amt);
    request.input("FEE_INAMT", sql.Decimal, fee_inamt);
    request.input("FEE_INDATE", sql.VarChar, fee_indate);
    request.input("FEE_INDESC", sql.VarChar, fee_indesc);

    const query = `UPDATE SMJ_FEEAMT
                      SET FEE_TITLE = @FEE_TITLE,
                          FEE_COND = @FEE_COND,
                          FEE_RATE = @FEE_RATE,
                          FEE_AMT = @FEE_AMT,
                          FEE_INAMT = @FEE_INAMT,
                          FEE_INDATE = @FEE_INDATE,
                          FEE_INDESC = @FEE_INDESC
                    WHERE FEE_SEQNO = @FEE_SEQNO;`;

    await request.query(query);     
  } catch (err) {
    console.error("Error updating buy fee:", err);
    throw err;
  }
};

// 매도비 항목 수정
exports.updateSellFee = async ({ fee_seqno, fee_no, fee_title, fee_cond, fee_rate, fee_amt, fee_inamt, fee_indate, fee_indesc }) => {
  try {
    const request = pool.request();

    request.input("FEE_SEQNO", sql.Int, fee_seqno);  
    request.input("FEE_NO", sql.Int, fee_no);
    request.input("FEE_TITLE", sql.VarChar, fee_title);
    request.input("FEE_COND", sql.VarChar, fee_cond);
    request.input("FEE_RATE", sql.Decimal, fee_rate);
    request.input("FEE_AMT", sql.Decimal, fee_amt);
    request.input("FEE_INAMT", sql.Decimal, fee_inamt);
    request.input("FEE_INDATE", sql.VarChar, fee_indate);
    request.input("FEE_INDESC", sql.VarChar, fee_indesc);

    const query = `UPDATE SMJ_FEEAMT
                      SET FEE_TITLE = @FEE_TITLE,
                          FEE_COND = @FEE_COND,
                          FEE_RATE = @FEE_RATE,
                          FEE_AMT = @FEE_AMT,
                          FEE_INAMT = @FEE_INAMT,
                          FEE_INDATE = @FEE_INDATE, 
                          FEE_INDESC = @FEE_INDESC
                    WHERE FEE_SEQNO = @FEE_SEQNO;`;

    await request.query(query);     
  } catch (err) {
    console.error("Error updating sell fee:", err);
    throw err;
  }
};
