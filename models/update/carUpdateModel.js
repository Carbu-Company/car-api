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

// 매입비 합계 변경
exports.updateBuyFeeSum = async ({ fee_car_regid, buy_total_fee,  buy_real_fee}) => {
  try {
    const request = pool.request();
    request.input("FEE_CAR_REGID", sql.VarChar, fee_car_regid);
    request.input("BUY_TOTAL_FEE", sql.Decimal, buy_total_fee);
    request.input("BUY_REAL_FEE", sql.Decimal, buy_real_fee);

    const query = `UPDATE SMJ_MAINLIST
                    SET BUY_TOTAL_FEE = @BUY_TOTAL_FEE,
                        BUY_REAL_FEE = @BUY_REAL_FEE
                    WHERE CAR_REGID = @FEE_CAR_REGID;`;

    await request.query(query);
  } catch (err) {
    console.error("Error updating buy fee sum:", err);
    throw err;
  }
};




// 매도 취소 변경
exports.updateSellCancel = async ({ sell_car_regid }) => {
  try {
    const request = pool.request();
    request.input("SELL_CAR_REGID", sql.VarChar, sell_car_regid);

    const query1 = `UPDATE SMJ_SOLDLIST
                    SET    SELL_TAXENDCHECK = 'N',
                           SELL_ADJ_DATE = ''
                    WHERE  SELL_CAR_REGID = @SELL_CAR_REGID`;

    const query2 = `DELETE FROM SMJ_ADJUSTMENT 
                    WHERE ADJ_CAR_REGID = @SELL_CAR_REGID`;

    // 순차적으로 쿼리 실행
    await request.query(query1);
    await request.query(query2);

    return { success: true, message: "매도 취소가 성공적으로 처리되었습니다." };

  } catch (err) { 
    console.error("Error updating sell cancel:", err);
    throw new Error(`매도 취소 처리 중 오류가 발생했습니다: ${err.message}`);
  }
};




