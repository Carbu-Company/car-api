const sql = require("mssql");
const pool = require("../../config/db");

// 제시 수정 등록 
exports.updatePurchase = async ({ 
      carRegId,                                                  // 차량 등록 ID
      carAgent,                                                  // 상사사 ID
      purAmt,                                                    // 매입금액
      purSupPrc,                                                 // 공급가액
      purVat,                                                    // 부가세
      carPurDt,                                                  // 매입일   
      agentPurCst,                                               // 상사매입비
      brokerageDate,                                             // 상사매입비 입금일
      gainTax,                                                   // 취득세
      carNm,                                                     // 차량명
      carNo,                                                     // 차량번호(매입후)
      purBefCarNo,                                               // 차량번호(매입전)
      ownrTpCd,                                                  // 소유자 유형
      ownrSsn,                                                   // 주민등록번호
      ownrBrno,                                                  // 사업자등록번호
      ownrNm,                                                    // 고객명
      ownrZip,                                                   // 주소 우편번호
      evdcCd,                                                    // 증빙종류
      carKndCd,                                                  // 차량 유형 
      prsnSctCd,                                                 // 제시 구분
      ownrPhon,                                                  // 연락처
      ownrEmail,                                                 // 이메일 아이디
      emailDomain,                                               // 이메일 도메인
      txblIssuDt,                                                // 세금 납부일
      purDesc,                                                   // 매입설명
      ownrAddr1,                                                 // 주소
      ownrAddr2,                                                 // 상세주소
      attachedFiles,                                             // 관련 서류 첨부
      usrId,                                                     // 사용자 ID
      dealerId,                                                  // 딜러 코드
      parkingCd,                                                 // 주차위치 코드
      parkingLocationDesc,                                       // 주차위치 설명
      parkKeyNo,                                                 // Key번호
      fctCndcYn,                                                 // 사실 확인서 여부
      txblRcvYn,                                                 // 매입수취여부
      ctshNo,                                                     // 계약서번호
      carRegDt,                                                  // 이전일
 }) => {
  try {
    const request = pool.request();
    request.input("CAR_REG_ID", sql.VarChar, carRegId);
    request.input("AGENT_ID", sql.VarChar, carAgent);
    request.input("DLR_ID", sql.VarChar, dealerId);
    request.input("CAR_KND_CD", sql.VarChar, carKndCd?.split('|')[0]);
    request.input("PRSN_SCT_CD", sql.VarChar, prsnSctCd);
    request.input("CAR_PUR_DT", sql.VarChar, carPurDt);
    request.input("CAR_REG_DT", sql.VarChar, carRegDt);
    request.input("CAR_NO", sql.VarChar, carNo);
    request.input("PUR_BEF_CAR_NO", sql.VarChar, purBefCarNo);
    request.input("CAR_NM", sql.VarChar, carNm);
    request.input("PUR_EVDC_CD", sql.VarChar, evdcCd);
    request.input("OWNR_NM", sql.VarChar, ownrNm);
    request.input("OWNR_TP_CD", sql.VarChar, ownrTpCd);
    request.input("OWNR_SSN", sql.VarChar, ownrSsn);
    request.input("OWNR_BRNO", sql.VarChar, ownrBrno);
    request.input("OWNR_PHON", sql.VarChar, ownrPhon);
    request.input("OWNR_ZIP", sql.VarChar, ownrZip);
    request.input("OWNR_ADDR1", sql.VarChar, ownrAddr1);
    request.input("OWNR_ADDR2", sql.VarChar, ownrAddr2);
    request.input("OWNR_EMAIL", sql.VarChar, ownrEmail + '@' + emailDomain);
    request.input("PUR_AMT", sql.Decimal, purAmt);
    request.input("PUR_SUP_PRC", sql.Decimal, purSupPrc);
    request.input("PUR_VAT", sql.Decimal, purVat);
    request.input("GAIN_TAX", sql.Decimal, gainTax);
    request.input("AGENT_PUR_CST", sql.Decimal, agentPurCst);
    request.input("AGENT_PUR_CST_PAY_DT", sql.VarChar, brokerageDate);
    request.input("TXBL_RCV_YN", sql.VarChar, txblRcvYn);
    request.input("TXBL_ISSU_DT", sql.VarChar, txblIssuDt);
    request.input("FCT_CNDC_YN", sql.VarChar, fctCndcYn);
    request.input("PUR_DESC", sql.VarChar, purDesc);
    request.input("PARK_ZON_CD", sql.VarChar, parkingCd);
    request.input("PARK_ZON_DESC", sql.VarChar, parkingLocationDesc);
    request.input("PARK_KEY_NO", sql.VarChar, parkKeyNo);
    request.input("CTSH_NO", sql.VarChar, ctshNo);
    request.input("REGR_ID", sql.VarChar, usrId);
    request.input("MODR_ID", sql.VarChar, usrId);

    const query1 = `
      UPDATE CJB_CAR_PUR
      SET CAR_REG_ID = @CAR_REG_ID,
          AGENT_ID = @AGENT_ID,
          DLR_ID = @DLR_ID,
          CAR_KND_CD = @CAR_KND_CD,
          PRSN_SCT_CD = @PRSN_SCT_CD,
          CAR_PUR_DT = @CAR_PUR_DT,
          CAR_REG_DT = @CAR_REG_DT,
          CAR_NO = @CAR_NO,
          PUR_BEF_CAR_NO = @PUR_BEF_CAR_NO,
          CAR_NM = @CAR_NM,
          PUR_EVDC_CD = @PUR_EVDC_CD,
          OWNR_NM = @OWNR_NM,
          OWNR_TP_CD = @OWNR_TP_CD,
          OWNR_SSN = @OWNR_SSN,
          OWNR_BRNO = @OWNR_BRNO,
          OWNR_PHON = @OWNR_PHON,
          OWNR_ZIP = @OWNR_ZIP,
          OWNR_ADDR1 = @OWNR_ADDR1,
          OWNR_ADDR2 = @OWNR_ADDR2,
          OWNR_EMAIL = @OWNR_EMAIL,
          PUR_AMT = @PUR_AMT,
          PUR_SUP_PRC = @PUR_SUP_PRC,
          PUR_VAT = @PUR_VAT,
          GAIN_TAX = @GAIN_TAX,
          AGENT_PUR_CST = @AGENT_PUR_CST,
          AGENT_PUR_CST_PAY_DT = @AGENT_PUR_CST_PAY_DT,
          TXBL_RCV_YN = @TXBL_RCV_YN,
          TXBL_ISSU_DT = @TXBL_ISSU_DT,
          FCT_CNDC_YN = @FCT_CNDC_YN,
          PUR_DESC = @PUR_DESC,
          PARK_ZON_CD = @PARK_ZON_CD,
          PARK_ZON_DESC = @PARK_ZON_DESC,
          PARK_KEY_NO = @PARK_KEY_NO,
          CTSH_NO = @CTSH_NO,
          MODR_ID = @MODR_ID,
          MOD_DTIME = GETDATE()
      WHERE CAR_REG_ID = @CAR_REG_ID;
    `;  

    const query2 = `
      UPDATE CJB_CAR_PUR
      SET MODR_ID = @MODR_ID
        , MOD_DTIME = GETDATE()
      WHERE CAR_REG_ID = @CAR_REG_ID;
    `;

    await Promise.all([request.query(query1), request.query(query2)]);

  } catch (err) {
    console.error("Error updating suggest:", err);
    throw err;
  }
};



// 제시 수정 등록 
exports.updateSuggest = async ({ mgtKey, franchiseCorpName, cashBillRegDate, totalAmount, empName }) => {
  try {
    const request = pool.request();
    request.input("MGTKEY", sql.VarChar, mgtKey);
    request.input("FRANCHISECORPNAME", sql.VarChar, franchiseCorpName);
    request.input("CASHBILLREGDATE", sql.VarChar, cashBillRegDate);
    request.input("TOTALAMOUNT", sql.Decimal, totalAmount);
    request.input("EMPNAME", sql.VarChar, empName);

    const query1 = `
      UPDATE CJB_CASHBILL2
      SET FranchiseCorpName = @FRANCHISECORPNAME,
          CashBillRegDate = @CASHBILLREGDATE,
          TotalAmount = @TOTALAMOUNT  
      WHERE MgtKey = @MGTKEY;
    `;  

    const query2 = `
      UPDATE CJB_CASHBILL_LOG2
      SET CashBillRegDate = @CASHBILLREGDATE
      WHERE MgtKey = @MGTKEY;
    `;

    await Promise.all([request.query(query1), request.query(query2)]);

  } catch (err) {
    console.error("Error updating suggest:", err);
    throw err;
  }
};




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




