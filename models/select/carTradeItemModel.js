const sql = require("mssql");
const pool = require("../../config/db");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 차량 거래 항목 2.0
////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// 상사 매입비 기본값 조회
exports.getAgentTradeItemList = async ({ agentId }) => {
    try {
        const request = pool.request();
        request.input("AGENT_ID", sql.VarChar, agentId);

        const query = `SELECT TRADE_ITEM_SEQ
                            , TRADE_SCT_CD
                            , TRADE_ITEM_CD
                            , TRADE_ITEM_NM
                            , TRADE_ITEM_RT
                            , TRADE_ITEM_AMT
                            , TRADE_ITEM_SUP_PRC
                            , TRADE_ITEM_VAT
                            , CR_ISSU_YN
                            , ELEC_TXBL_ISSU_YN
                            , ADJ_RFLN_YN
                            , TAX_INCLUS_YN
                        FROM dbo.CJB_CAR_TRADE_ITEM A
                        WHERE A.AGENT_ID = @AGENT_ID
                        ; `;
        const result = await request.query(query);
        return result.recordset[0];
    } catch (err) {
        console.error("Error fetching agent pur cst:", err);
        throw err;
    }
};


// 상사 거래 항목 상세 조회
exports.getAgentTradeItemInfo = async ({ agentId, tradeSctCd, tradeItemCd }) => {
    try {
        const request = pool.request();
        request.input("AGENT_ID", sql.VarChar, agentId);
        request.input("TRADE_SCT_CD", sql.VarChar, tradeSctCd);
        request.input("TRADE_ITEM_CD", sql.VarChar, tradeItemCd);

        const query = `SELECT TRADE_ITEM_SEQ
                            , TRADE_SCT_CD
                            , TRADE_ITEM_CD
                            , TRADE_ITEM_NM
                            , TRADE_ITEM_RT
                            , TRADE_ITEM_AMT
                            , TRADE_ITEM_SUP_PRC
                            , TRADE_ITEM_VAT
                            , CR_ISSU_YN
                            , ELEC_TXBL_ISSU_YN
                            , ADJ_RFLN_YN
                            , TAX_INCLUS_YN
                        FROM dbo.CJB_CAR_TRADE_ITEM A
                        WHERE A.AGENT_ID = @AGENT_ID
                        AND A.TRADE_SCT_CD = @TRADE_SCT_CD
                        AND A.TRADE_ITEM_CD = @TRADE_ITEM_CD
                        ; `;
        const result = await request.query(query);
        return result.recordset[0];
    } catch (err) {
        console.error("Error fetching agent pur cst:", err);
        throw err;
    }
};


// 상사 거래 항목 등록
exports.insertAgentTradeItem = async ({
    agentId,                     // 상사 ID             
    tradeSctCd,                  // 거래 구분 코드            
    tradeItemCd,                 // 거래 항목 코드            
    tradeItemNm,                 // 거래 항목 명            
    tradeItemRt,                 // 거래 항목 비율            
    tradeItemAmt,                // 거래 항목 금액            
    tradeItemSupPrc,             // 거래 항목 공급가            
    tradeItemVat,                // 거래 항목 부가세            
    crIssuYn,                    // 차량 거래 항목 발행 여부            
    elecTxblIssuYn,              // 차량 거래 항목 발행 여부            
    adjRflnYn,                   // 차량 거래 항목 발행 여부            
    taxInclusYn,                 // 차량 거래 항목 발행 여부     
    usrId                       // 사용자 ID               
}) => {
  try {
    const request = pool.request();

    request.input("AGENT_ID", sql.VarChar, agentId);
    request.input("TRADE_SCT_CD", sql.VarChar, tradeSctCd);
    request.input("TRADE_ITEM_CD", sql.VarChar, tradeItemCd);
    request.input("TRADE_ITEM_NM", sql.VarChar, tradeItemNm);
    request.input("TRADE_ITEM_RT", sql.Decimal, tradeItemRt);
    request.input("TRADE_ITEM_AMT", sql.Decimal, tradeItemAmt);
    request.input("TRADE_ITEM_SUP_PRC", sql.Decimal, tradeItemSupPrc);
    request.input("TRADE_ITEM_VAT", sql.Decimal, tradeItemVat);
    request.input("CR_ISSU_YN", sql.VarChar, crIssuYn);
    request.input("ELEC_TXBL_ISSU_YN", sql.VarChar, elecTxblIssuYn);
    request.input("ADJ_RFLN_YN", sql.VarChar, adjRflnYn);
    request.input("TAX_INCLUS_YN", sql.VarChar, taxInclusYn);
    request.input("REGR_ID", sql.VarChar, usrId);
    request.input("MODR_ID", sql.VarChar, usrId);

    const query1 = `INSERT INTO dbo.CJB_CAR_TRADE_ITEM (
                    AGENT_ID,
                    TRADE_SCT_CD,
                    TRADE_ITEM_CD,
                    TRADE_ITEM_NM,
                    TRADE_ITEM_RT,
                    TRADE_ITEM_AMT,
                    TRADE_ITEM_SUP_PRC,
                    TRADE_ITEM_VAT,
                    CR_ISSU_YN,
                    ELEC_TXBL_ISSU_YN,
                    ADJ_RFLN_YN,
                    TAX_INCLUS_YN,
                    REGR_ID,
                    MODR_ID
                  ) VALUES (
                    @AGENT_ID,
                    @TRADE_SCT_CD,
                    @TRADE_ITEM_CD,
                    @TRADE_ITEM_NM,
                    @TRADE_ITEM_RT,
                    @TRADE_ITEM_AMT,
                    @TRADE_ITEM_SUP_PRC,
                    @TRADE_ITEM_VAT,
                    @CR_ISSU_YN,
                    @ELEC_TXBL_ISSU_YN,
                    @ADJ_RFLN_YN,
                    @TAX_INCLUS_YN,
                    @REGR_ID,
                    @MODR_ID
                  )`;

    await Promise.all([request.query(query1)]);

  } catch (err) {
    console.error("Error inserting car trade item:", err);
    throw err;
  }
};


// 상사 거래 항목 수정
exports.updateAgentTradeItem = async ({
    agentId,                     // 상사 ID             
    tradeSctCd,                  // 거래 구분 코드            
    tradeItemCd,                 // 거래 항목 코드            
    tradeItemNm,                 // 거래 항목 명            
    tradeItemRt,                 // 거래 항목 비율            
    tradeItemAmt,                // 거래 항목 금액            
    tradeItemSupPrc,             // 거량 항목 명            
    tradeItemVat,                // 거래 항목 부가세            
    crIssuYn,                    // 차량 거래 항목 발행 여부            
    elecTxblIssuYn,              // 차량 거래 항목 발행 여부            
    adjRflnYn,                   // 차량 거래 항목 발행 여부            
    taxInclusYn,                 // 차량 거래 항목 발행 여부     
    usrId                       // 사용자 ID               
}) => {
  try {
    const request = pool.request();

    request.input("AGENT_ID", sql.VarChar, agentId);        
    request.input("TRADE_SCT_CD", sql.VarChar, tradeSctCd);
    request.input("TRADE_ITEM_CD", sql.VarChar, tradeItemCd);
    request.input("TRADE_ITEM_NM", sql.VarChar, tradeItemNm);
    request.input("TRADE_ITEM_RT", sql.Decimal, tradeItemRt);
    request.input("TRADE_ITEM_AMT", sql.Decimal, tradeItemAmt);
    request.input("TRADE_ITEM_SUP_PRC", sql.Decimal, tradeItemSupPrc);
    request.input("TRADE_ITEM_VAT", sql.Decimal, tradeItemVat);
    request.input("CR_ISSU_YN", sql.VarChar, crIssuYn);
    request.input("ELEC_TXBL_ISSU_YN", sql.VarChar, elecTxblIssuYn);
    request.input("ADJ_RFLN_YN", sql.VarChar, adjRflnYn);
    request.input("TAX_INCLUS_YN", sql.VarChar, taxInclusYn);
    request.input("MODR_ID", sql.VarChar, usrId);


    const query1 = `UPDATE dbo.CJB_CAR_TRADE_ITEM
                    SET TRADE_ITEM_NM = @TRADE_ITEM_NM,
                        TRADE_ITEM_RT = @TRADE_ITEM_RT,
                        TRADE_ITEM_AMT = @TRADE_ITEM_AMT,
                        TRADE_ITEM_SUP_PRC = @TRADE_ITEM_SUP_PRC,
                        TRADE_ITEM_VAT = @TRADE_ITEM_VAT,
                        CR_ISSU_YN = @CR_ISSU_YN,
                        ELEC_TXBL_ISSU_YN = @ELEC_TXBL_ISSU_YN,
                        ADJ_RFLN_YN = @ADJ_RFLN_YN,
                        TAX_INCLUS_YN = @TAX_INCLUS_YN,
                        MOD_DTIME = GETDATE(),
                        MODR_ID = @MODR_ID
                    WHERE AGENT_ID = @AGENT_ID
                        AND TRADE_SCT_CD = @TRADE_SCT_CD
                        AND TRADE_ITEM_CD = @TRADE_ITEM_CD
                    ; `;

    await Promise.all([request.query(query1)]);

  } catch (err) {
    console.error("Error updating car trade item:", err);
    throw err;
  }
};


// 상사 거래 항목 삭제
exports.deleteAgentTradeItem = async ({
    agentId,                     // 상사 ID             
    tradeSctCd,                  // 거래 구분 코드            
    tradeItemCd,                 // 거래 항목 코드            
    usrId                       // 사용자 ID               
}) => {
  try {
    const request = pool.request();

    request.input("AGENT_ID", sql.VarChar, agentId);    
    request.input("TRADE_SCT_CD", sql.VarChar, tradeSctCd);
    request.input("TRADE_ITEM_CD", sql.VarChar, tradeItemCd);
    request.input("MODR_ID", sql.VarChar, usrId);

    const query1 = `UPDATE dbo.CJB_CAR_TRADE_ITEM
                    SET TRADE_DEL_YN = 'Y'
                        , MOD_DTIME = GETDATE()
                        , MODR_ID = @MODR_ID
                    WHERE AGENT_ID = @AGENT_ID
                        AND TRADE_SCT_CD = @TRADE_SCT_CD
                        AND TRADE_ITEM_CD = @TRADE_ITEM_CD
                    ; `;

    await Promise.all([request.query(query1)]);

  } catch (err) {
    console.error("Error deleting car trade item:", err);
    throw err;
  }
};

