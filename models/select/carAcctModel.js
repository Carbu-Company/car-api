const sql = require("mssql");
const pool = require("../../config/db");


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 계좌 2.0
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 계좌 상세 내역 목록 조회 
exports.getCarAcctList = async ({ 
    agentId, 
    page,
    pageSize,
    carNo,
    dealer,
    dtGubun,
    startDt,
    endDt, 
    dtlCarNm,
    dtlTradeSctNm,
    dtlTradeItemCd,
    dtlAgentAcctNo,
    dtlTradeMemo,
    dtlDtlMemo,
    orderItem = '01',
    ordAscDesc = 'desc'
  }) => {
    try {
      const request = pool.request();
  /*
      console.log('agentId:', agentId);
      console.log('pageSize:', pageSize);
      console.log('page:', page);
  
      console.log('carNo:', carNo);
      console.log('dealer:', dealer);
      console.log('dtGubun:', dtGubun);
      console.log('startDt:', startDt);
      console.log('endDt:', endDt);
      console.log('dtlCarNm:', dtlCarNm);
      console.log('dtlTradeSctNm:', dtlTradeSctNm);
      console.log('dtlTradeItemCd:', dtlTradeItemCd);
      console.log('dtlAgentAcctNo:', dtlAgentAcctNo);
      console.log('dtlTradeMemo:', dtlTradeMemo);
      console.log('dtlDtlMemo:', dtlDtlMemo);
      console.log('orderItem:', orderItem);
      console.log('ordAscDesc:', ordAscDesc);
  */
      request.input("CAR_AGENT", sql.VarChar, agentId);
      request.input("PAGE_SIZE", sql.Int, pageSize);
      request.input("PAGE", sql.Int, page);
  
  
      if (carNo) request.input("CAR_NO", sql.VarChar, `%${carNo}%`);
      if (dealer) request.input("DEALER", sql.VarChar, `%${dealer}%`);
      if (dtGubun) request.input("DT_GUBUN", sql.VarChar, dtGubun);
      if (startDt) request.input("START_DT", sql.VarChar, startDt);
      if (endDt) request.input("END_DT", sql.VarChar, endDt);
      if (dtlCarNm) request.input("DTL_CAR_NM", sql.VarChar, `%${dtlCarNm}%`);
      if (dtlTradeSctNm) request.input("DTL_TRADE_SCT_NM", sql.VarChar, dtlTradeSctNm);
      if (dtlTradeItemCd) request.input("DTL_TRADE_ITEM_CD", sql.VarChar, dtlTradeItemCd);
      if (dtlAgentAcctNo) request.input("DTL_AGENT_ACCT_NO", sql.VarChar, dtlAgentAcctNo);
      if (dtlTradeMemo) request.input("DTL_TRADE_MEMO", sql.VarChar, `%${dtlTradeMemo}%`);
      if (dtlDtlMemo) request.input("DTL_DTL_MEMO", sql.VarChar, `%${dtlDtlMemo}%`);
  
      // 전체 카운트 조회
      const countQuery = `
      SELECT COUNT(*) as totalCount
                FROM dbo.CJB_ACCT A
                INNER JOIN dbo.CJB_ACCT_DTL B ON (A.ACCT_NO = B.ACCT_NO)
                  LEFT JOIN dbo.CJB_CAR_SEL C ON (B.CAR_REG_ID = C.CAR_REG_ID)
                  LEFT JOIN dbo.CJB_CAR_PUR D ON (C.CAR_REG_ID = D.CAR_REG_ID)
                 WHERE  A.AGENT_ID = @CAR_AGENT
                ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO OR A.PUR_BEF_CAR_NO LIKE @CAR_NO OR B.SALE_CAR_NO LIKE @CAR_NO)" : ""}
                ${dealer ? "AND (A.DLR_ID LIKE @DEALER OR B.DLR_ID LIKE @DEALER)" : ""}
                ${startDt ? `AND ${dtGubun === '1' ? 'C.BRK_SALE_DT' : dtGubun === '2' ? 'B.CAR_SALE_DT' : 'A.CAR_PUR_DT'} >= @START_DT` : ""}
                ${endDt ? `AND ${dtGubun === '1' ? 'C.BRK_SALE_DT' : dtGubun === '2' ? 'B.CAR_SALE_DT' : 'A.CAR_PUR_DT'} <= @END_DT` : ""}
                ${dtlCarNm ? "AND B.CAR_NM LIKE @DTL_CAR_NM" : ""}
                ${dtlTradeSctNm ? "AND B.TRADE_SCT_NM LIKE @DTL_TRADE_SCT_NM" : ""}
                ${dtlTradeItemCd ? "AND B.TRADE_ITEM_CD LIKE @DTL_TRADE_ITEM_CD" : ""}
                ${dtlAgentAcctNo ? "AND B.AGENT_ACCT_NO LIKE @DTL_AGENT_ACCT_NO" : ""}
                ${dtlTradeMemo ? "AND B.TRADE_MEMO LIKE @DTL_TRADE_MEMO" : ""}
                ${dtlDtlMemo ? "AND B.DTL_MEMO LIKE @DTL_DTL_MEMO" : ""}

      `;
    
      const dataQuery = `
                SELECT B.ACCT_DTL_SEQ
                    , CONVERT(VARCHAR(19), B.TRADE_DTIME, 20) TRADE_DTIME
                    , B.TRADE_SCT_NM
                    , B.ACCT_NO 
                    , (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = C.DLR_ID)  + ' / ' + C.SALE_CAR_NO + ' / ' + D.CAR_NM AS CAR_INFO_NM
                    , C.SALE_CAR_NO 
                    , B.TRADE_ITEM_CD
                    , B.TRADE_ITEM_NM
                    , CONVERT(int, ISNULL(B.IAMT, '0')) IAMT 
                    , CONVERT(int, ISNULL(B.OAMT, '0')) OAMT 
                    , CONVERT(int, ISNULL(B.BLNC, '0')) BLNC 
                    , B.TRADE_MEMO 
                    , B.DTL_MEMO
                  FROM dbo.CJB_ACCT A
                INNER JOIN dbo.CJB_ACCT_DTL B ON (A.ACCT_NO = B.ACCT_NO)
                  LEFT JOIN dbo.CJB_CAR_SEL C ON (B.CAR_REG_ID = C.CAR_REG_ID)
                  LEFT JOIN dbo.CJB_CAR_PUR D ON (C.CAR_REG_ID = D.CAR_REG_ID)
                 WHERE  A.AGENT_ID = @CAR_AGENT
            ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO OR A.PUR_BEF_CAR_NO LIKE @CAR_NO OR B.SALE_CAR_NO LIKE @CAR_NO)" : ""}
            ${dealer ? "AND (A.DLR_ID LIKE @DEALER OR B.DLR_ID LIKE @DEALER)" : ""}
            ${startDt ? `AND ${dtGubun === '1' ? 'C.BRK_SALE_DT' : dtGubun === '2' ? 'B.CAR_SALE_DT' : 'A.CAR_PUR_DT'} >= @START_DT` : ""}
            ${endDt ? `AND ${dtGubun === '1' ? 'C.BRK_SALE_DT' : dtGubun === '2' ? 'B.CAR_SALE_DT' : 'A.CAR_PUR_DT'} <= @END_DT` : ""}
            ${dtlCarNm ? "AND B.CAR_NM LIKE @DTL_CAR_NM" : ""}
            ${dtlTradeSctNm ? "AND B.TRADE_SCT_NM LIKE @DTL_TRADE_SCT_NM" : ""}
            ${dtlTradeItemCd ? "AND B.TRADE_ITEM_CD LIKE @DTL_TRADE_ITEM_CD" : ""}
            ${dtlAgentAcctNo ? "AND B.AGENT_ACCT_NO LIKE @DTL_AGENT_ACCT_NO" : ""}
            ${dtlTradeMemo ? "AND B.TRADE_MEMO LIKE @DTL_TRADE_MEMO" : ""}
            ${dtlDtlMemo ? "AND B.DTL_MEMO LIKE @DTL_DTL_MEMO" : ""}
      ORDER BY ${orderItem === '01' ? 'B.TRADE_DT' : 'B.TRADE_DT'} ${ordAscDesc}
      OFFSET (@PAGE - 1) * @PAGE_SIZE ROWS
      FETCH NEXT @PAGE_SIZE ROWS ONLY;`;

      console.log('dataQuery:', dataQuery);
  
      // 두 쿼리를 동시에 실행
      const [countResult, dataResult] = await Promise.all([
        request.query(countQuery),
        request.query(dataQuery)
      ]);
  
      // Handle case where countResult or countResult.recordset is undefined or empty
      const totalCount = countResult && countResult.recordset && countResult.recordset.length > 0 && countResult.recordset[0].totalCount !== undefined
        ? countResult.recordset[0].totalCount
        : 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        carlist: dataResult && dataResult.recordset ? dataResult.recordset : [],
        pagination: {
          currentPage: page,
          pageSize: pageSize,
          totalCount: totalCount,
          totalPages: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
  
    } catch (err) {
      console.error("Error fetching car pur list:", err);
      throw err;
    }
  };
  
  // 현금영수증 합계 조회
  exports.getCarAcctSummary = async ({  
    agentId, 
    page,
    pageSize,
    carNo,
    dealer,
    dtGubun,
    startDt,
    endDt, 
    dtlCarNm,
    dtlTradeSctNm,
    dtlTradeItemCd,
    dtlAgentAcctNo,
    dtlTradeMemo,
    dtlDtlMemo,
    orderItem = '01',
    ordAscDesc = 'desc'
  }) => {
    try {
      const request = pool.request();
  
      console.log('agentId:', agentId);
      console.log('pageSize:', pageSize);
      console.log('page:', page);
  
      console.log('carNo:', carNo);
      console.log('dealer:', dealer);
      console.log('dtGubun:', dtGubun);
      console.log('startDt:', startDt);
      console.log('endDt:', endDt);
      console.log('dtlCarNm:', dtlCarNm);
      console.log('dtlTradeSctNm:', dtlTradeSctNm);
      console.log('dtlTradeItemCd:', dtlTradeItemCd);
      console.log('dtlAgentAcctNo:', dtlAgentAcctNo);
      console.log('dtlTradeMemo:', dtlTradeMemo);
      console.log('dtlDtlMemo:', dtlDtlMemo);
      console.log('orderItem:', orderItem);
      console.log('ordAscDesc:', ordAscDesc);
  
      request.input("CAR_AGENT", sql.VarChar, agentId);
      request.input("PAGE_SIZE", sql.Int, pageSize);
      request.input("PAGE", sql.Int, page);
  
      if (carNo) request.input("CAR_NO", sql.VarChar, `%${carNo}%`);
      if (dealer) request.input("DEALER", sql.VarChar, `%${dealer}%`);
      if (dtGubun) request.input("DT_GUBUN", sql.VarChar, dtGubun);
      if (startDt) request.input("START_DT", sql.VarChar, startDt);
      if (endDt) request.input("END_DT", sql.VarChar, endDt);
      if (dtlCarNm) request.input("DTL_CAR_NM", sql.VarChar, `%${dtlCarNm}%`);
      if (dtlTradeSctNm) request.input("DTL_TRADE_SCT_NM", sql.VarChar, dtlTradeSctNm);
      if (dtlTradeItemCd) request.input("DTL_TRADE_ITEM_CD", sql.VarChar, dtlTradeItemCd);
      if (dtlAgentAcctNo) request.input("DTL_AGENT_ACCT_NO", sql.VarChar, dtlAgentAcctNo);
      if (dtlTradeMemo) request.input("DTL_TRADE_MEMO", sql.VarChar, `%${dtlTradeMemo}%`);
      if (dtlDtlMemo) request.input("DTL_DTL_MEMO", sql.VarChar, `%${dtlDtlMemo}%`);

      const query = `SELECT SUM(I_CNT) AS I_CNT
                          , SUM(IAMT) AS IAMT
                          , SUM(O_CNT) AS O_CNT
                          , SUM(OAMT) AS OAMT 
                       FROM (SELECT COUNT(B.ACCT_DTL_SEQ) AS I_CNT
                            , ISNULL(SUM(CONVERT(int, ISNULL(B.IAMT, '0'))), 0) AS IAMT
                            , 0 O_CNT
                            , 0 OAMT
                        FROM dbo.CJB_ACCT A
                        INNER JOIN dbo.CJB_ACCT_DTL B ON (A.ACCT_NO = B.ACCT_NO)
                          LEFT JOIN dbo.CJB_CAR_SEL C ON (B.CAR_REG_ID = C.CAR_REG_ID)
                          LEFT JOIN dbo.CJB_CAR_PUR D ON (C.CAR_REG_ID = D.CAR_REG_ID)
                        WHERE  A.AGENT_ID = @CAR_AGENT
                          AND B.TRADE_SCT_NM = '입금'
                        ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO OR A.PUR_BEF_CAR_NO LIKE @CAR_NO OR B.SALE_CAR_NO LIKE @CAR_NO)" : ""}
                        ${dealer ? "AND (A.DLR_ID LIKE @DEALER OR B.DLR_ID LIKE @DEALER)" : ""}
                        ${startDt ? `AND ${dtGubun === '1' ? 'C.BRK_SALE_DT' : dtGubun === '2' ? 'B.CAR_SALE_DT' : 'A.CAR_PUR_DT'} >= @START_DT` : ""}
                        ${endDt ? `AND ${dtGubun === '1' ? 'C.BRK_SALE_DT' : dtGubun === '2' ? 'B.CAR_SALE_DT' : 'A.CAR_PUR_DT'} <= @END_DT` : ""}
                        ${dtlCarNm ? "AND B.CAR_NM LIKE @DTL_CAR_NM" : ""}
                        ${dtlTradeSctNm ? "AND B.TRADE_SCT_NM LIKE @DTL_TRADE_SCT_NM" : ""}
                        ${dtlTradeItemCd ? "AND B.TRADE_ITEM_CD LIKE @DTL_TRADE_ITEM_CD" : ""}
                        ${dtlAgentAcctNo ? "AND B.AGENT_ACCT_NO LIKE @DTL_AGENT_ACCT_NO" : ""}
                        ${dtlTradeMemo ? "AND B.TRADE_MEMO LIKE @DTL_TRADE_MEMO" : ""}
                        ${dtlDtlMemo ? "AND B.DTL_MEMO LIKE @DTL_DTL_MEMO" : ""}
                      UNION ALL
                      SELECT  0 I_CNT
                            , 0 IAMT
                            , COUNT(B.ACCT_DTL_SEQ) O_CNT
                            , ISNULL(SUM(CONVERT(int, ISNULL(B.OAMT, '0'))), 0) AS OAMT
                        FROM dbo.CJB_ACCT A
                        INNER JOIN dbo.CJB_ACCT_DTL B ON (A.ACCT_NO = B.ACCT_NO)
                          LEFT JOIN dbo.CJB_CAR_SEL C ON (B.CAR_REG_ID = C.CAR_REG_ID)
                          LEFT JOIN dbo.CJB_CAR_PUR D ON (C.CAR_REG_ID = D.CAR_REG_ID)
                        WHERE  A.AGENT_ID = @CAR_AGENT
                          AND B.TRADE_SCT_NM = '출금'
                        ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO OR A.PUR_BEF_CAR_NO LIKE @CAR_NO OR B.SALE_CAR_NO LIKE @CAR_NO)" : ""}
                        ${dealer ? "AND (A.DLR_ID LIKE @DEALER OR B.DLR_ID LIKE @DEALER)" : ""}
                        ${startDt ? `AND ${dtGubun === '1' ? 'C.BRK_SALE_DT' : dtGubun === '2' ? 'B.CAR_SALE_DT' : 'A.CAR_PUR_DT'} >= @START_DT` : ""}
                        ${endDt ? `AND ${dtGubun === '1' ? 'C.BRK_SALE_DT' : dtGubun === '2' ? 'B.CAR_SALE_DT' : 'A.CAR_PUR_DT'} <= @END_DT` : ""}
                        ${dtlCarNm ? "AND B.CAR_NM LIKE @DTL_CAR_NM" : ""}
                        ${dtlTradeSctNm ? "AND B.TRADE_SCT_NM LIKE @DTL_TRADE_SCT_NM" : ""}
                        ${dtlTradeItemCd ? "AND B.TRADE_ITEM_CD LIKE @DTL_TRADE_ITEM_CD" : ""}
                        ${dtlAgentAcctNo ? "AND B.AGENT_ACCT_NO LIKE @DTL_AGENT_ACCT_NO" : ""}
                        ${dtlTradeMemo ? "AND B.TRADE_MEMO LIKE @DTL_TRADE_MEMO" : ""}
                        ${dtlDtlMemo ? "AND B.DTL_MEMO LIKE @DTL_DTL_MEMO" : ""}
                      ) A`;
        
      
      console.log('query:', query);

      const result = await request.query(query);
      return result.recordset;
    } catch (err) {
      console.error("Error fetching car pur sum:", err);
      throw err;
    }
  };
  
  // 현금영수증 상세 조회
  exports.getCarAcctDetail = async ({ acctDtlSeq }) => {
    try {
      const request = pool.request();


      console.log('*********acctDtlSeq:***************', acctDtlSeq);
      request.input("ACCT_DTL_SEQ", sql.Int, acctDtlSeq);   

      console.log('acctDtlSeq:', acctDtlSeq);
  
      const query = `SELECT ACCT_DTL_SEQ     -- 계좌 내역 순번
                          , A.BNK_CD       -- 은행코드
                          , (SELECT TOP 1 CD_NM FROM dbo.CJB_COMM_CD WHERE GRP_CD = '09' AND CD = A.BNK_CD) BNK_NM  -- 은행명
                          , A.ACCT_NO      -- 계좌번호
                          , A.ACCT_NM      -- 계좌명
                          , A.ACCT_HLDR    -- 예금주
                          , A.MAST_YN
                          , B.TID
                          , B.TRADE_DT
                          , B.TRADE_SN
                          , B.TRADE_SCT_NM
                          , B.TRADE_RMRK_NM
                          , B.TRADE_ITEM_CD
                          , B.TRADE_ITEM_NM
                          , CONVERT(VARCHAR(19), B.TRADE_DTIME, 20) TRADE_DTIME 
                          , B.IAMT
                          , B.OAMT
                          , B.BLNC
                          , B.NOTE1
                        FROM dbo.CJB_ACCT A
                           , dbo.CJB_ACCT_DTL B
                        WHERE A.ACCT_NO = B.ACCT_NO
                          AND B.ACCT_DTL_SEQ = @ACCT_DTL_SEQ `;
  
      console.log('query:', query);
  
      const result = await request.query(query);
      return result.recordset[0];
    } catch (err) {
      console.error("Error fetching car pur detail:", err);
      throw err;
    }
  };

  // 계좌정보 목록 조회
  exports.getAgentAcctList = async ({ agentId }) => {
    try {
      const request = pool.request();
      request.input("CAR_AGENT", sql.VarChar, agentId);

      const query = `SELECT A.BNK_CD
                          , (SELECT TOP 1 CD_NM FROM dbo.CJB_COMM_CD WHERE GRP_CD = '09' AND CD = A.BNK_CD) BNK_NM  -- 은행명
                          , A.ACCT_NO
                          , A.ACCT_NM
                          , A.MAST_YN
                        FROM dbo.CJB_ACCT A
                        WHERE A.USE_YN = 'Y'   
                          AND A.AGENT_ID = @CAR_AGENT `;

      const result = await request.query(query);
      return result.recordset;
    } catch (err) {
      console.error("Error fetching agent acct list:", err);
      throw err;
    }
  }

  // 계좌정보 상세 저장
  exports.insertCarAcctDetail = async ({ 
    agentId, 
    acctNo, 
    tid, 
    tradeDt, 
    tradeSn, 
    tradeDtime, 
    tradeSctNm,
    iamt, 
    oamt, 
    blnc, 
    note1, 
    note2, 
    note3, 
    note4, 
    regrId, 
    modrId 
  }) => {
    try {
      const request = pool.request();
      request.input("CAR_AGENT", sql.VarChar, agentId);
      request.input("ACCT_NO", sql.VarChar, acctNo);     
      request.input("TID", sql.VarChar, tid);
      request.input("TRADE_DT", sql.VarChar, tradeDt);
      request.input("TRADE_SN", sql.VarChar, tradeSn);
      request.input("TRADE_DTIME", sql.VarChar, tradeDtime);
      request.input("TRADE_SCT_NM", sql.VarChar, tradeSctNm);
      request.input("IAMT", sql.VarChar, iamt);
      request.input("OAMT", sql.VarChar, oamt);
      request.input("BLNC", sql.VarChar, blnc);
      request.input("NOTE1", sql.VarChar, note1);
      request.input("NOTE2", sql.VarChar, note2);
      request.input("NOTE3", sql.VarChar, note3);
      request.input("NOTE4", sql.VarChar, note4);
      request.input("REGR_ID", sql.VarChar, regrId);
      request.input("MODR_ID", sql.VarChar, modrId);

      const query = `
        INSERT INTO dbo.CJB_ACCT_DTL
          ( ACCT_NO,
            TID,
            TRADE_DT,
            TRADE_SN,
            TRADE_DTIME,
            TRADE_SCT_NM,
            TRADE_DTIME,
            IAMT,
            OAMT,
            BLNC,
            NOTE1,
            NOTE2,
            NOTE3,
            NOTE4,
            REGR_ID,
            MODR_ID ) 
        VALUES 
          ( @ACCT_NO,
            @TID,
            @TRADE_DT,
            @TRADE_SN,
            @TRADE_DTIME,
            @TRADE_SCT_NM,
            @TRADE_DTIME,
            @IAMT,
            @OAMT,
            @BLNC,
            @NOTE1,
            @NOTE2,
            @NOTE3,
            @NOTE4,
            @REGR_ID,
            @MODR_ID
          );
      `;
      await request.query(query);

      return { success: true };
    } catch (err) {
      console.error("Error inserting car acct detail:", err);
      throw err;
    }
  }

  // 계좌정보 상세 수정
  exports.updateCarAcctDetail = async ({ 
    acctDtlSeq, 
    tradeItemCd, 
    tradeItemNm, 
    tradeMemo, 
    carRegId, 
    usrId 
  }) => {
    try {
      const request = pool.request();
      request.input("ACCT_DTL_SEQ", sql.VarChar, acctDtlSeq);
      request.input("TRADE_ITEM_CD", sql.VarChar, tradeItemCd);
      request.input("TRADE_ITEM_NM", sql.VarChar, tradeItemNm);
      request.input("TRADE_MEMO", sql.VarChar, tradeMemo);
      request.input("CAR_REG_ID", sql.VarChar, carRegId);
      request.input("MODR_ID", sql.VarChar, usrId);

      const query = `
        UPDATE dbo.CJB_ACCT_DTL
           SET TRADE_ITEM_CD = @TRADE_ITEM_CD,
               TRADE_ITEM_NM = @TRADE_ITEM_NM,
               TRADE_MEMO = @TRADE_MEMO,
               DTL_MEMO = @DTL_MEMO,
               CAR_REG_ID = @CAR_REG_ID,
               MOD_DTIME = GETDATE(),
               MODR_ID = @MODR_ID
         WHERE 
          ACCT_DTL_SEQ = @ACCT_DTL_SEQ 
      `;

      await request.query(query);

      return { success: true };
    } catch (err) {
      console.error("Error updating car acct detail:", err);
      throw err;
    }
  }