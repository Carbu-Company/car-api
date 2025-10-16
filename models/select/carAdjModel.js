const sql = require("mssql");
const pool = require("../../config/db");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 정산 2.0
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 정산 내역 목록 조회 
exports.getCarAdjList = async ({ 
    carAgent, 
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
      console.log('carAgent:', carAgent);
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
      request.input("CAR_AGENT", sql.VarChar, carAgent);
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
                ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO OR A.PUR_BEF_CAR_NO LIKE @CAR_NO OR B.SEL_CAR_NO LIKE @CAR_NO)" : ""}
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
            ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO OR A.PUR_BEF_CAR_NO LIKE @CAR_NO OR B.SEL_CAR_NO LIKE @CAR_NO)" : ""}
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
  
      const totalCount = countResult.recordset[0].totalCount;
      const totalPages = Math.ceil(totalCount / pageSize);
  
      return {
        carlist: dataResult.recordset,
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
  
  // 정산 합계 조회
  exports.getCarAdjSummary = async ({  
    carAgent, 
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
  
      console.log('carAgent:', carAgent);
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
  
      request.input("CAR_AGENT", sql.VarChar, carAgent);
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
                        ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO OR A.PUR_BEF_CAR_NO LIKE @CAR_NO OR B.SEL_CAR_NO LIKE @CAR_NO)" : ""}
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
                        ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO OR A.PUR_BEF_CAR_NO LIKE @CAR_NO OR B.SEL_CAR_NO LIKE @CAR_NO)" : ""}
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
  
  // 정산 상세 조회
  exports.getCarAdjInfo = async ({ carRegId }) => {
    try {
      const request = pool.request();


      console.log('*********acctDtlSeq:***************', acctDtlSeq);
      request.input("carRegId", sql.VarChar, carRegId);   

      console.log('carRegId:', carRegId);
  
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
                        FROM dbo.CJB_ADJ A
                        WHERE CAR_REG_ID = @CAR_REG_ID `;
  
      console.log('query:', query);
  
      const result = await request.query(query);
      return result.recordset[0];
    } catch (err) {
      console.error("Error fetching car pur detail:", err);
      throw err;
    }
  };

  // 정산 상세 목록 조회
  exports.getCarAdjDtlList = async ({ carRegId }) => {
    try {
      const request = pool.request();
      request.input("CAR_REG_ID", sql.VarChar, carRegId);

      const query = `SELECT SCT_CD
                          , SEQ
                          , ITEM_NM
                          , AMT
                          , SUP_PRC
                          , VAT
                          , TAX_YN
                          , REG_DTIME
                          , REGR_ID
                          , MOD_DTIME
                          , MODR_ID
                        FROM dbo.CJB_ADJ_DTL A
                        WHERE A.CAR_REG_ID = @CAR_REG_ID `;

      const result = await request.query(query);
      return result.recordset;
    } catch (err) {
      console.error("Error fetching agent acct list:", err);
      throw err;
    }
  }

  // 정산 저장 (정산 상세 포함)
  exports.insertCarAdj = async ({ 
    carRegId, 
    adjDtime, 
    carSaleSumAmt,
    carSaleSumSupPrc,
    carSaleSumVat,
    carPurAmt,
    carPurSupPrc,
    carPurVat,
    cmrcCostSumAmt,
    cmrcCostSumSupPrc,
    cmrcCostSumVat,
    adjStdAmt,
    adjStdSupPrc,
    adjStdVat,
    debtSumAmt,
    stoffSumAmt,
    incmAmt,
    intx,
    lctx,
    hghforIssuCst,
    mtreInsuCst,
    realPayAmt,
    realMorcAmt,
    mnusAplyYn,
    wttxAplyYn,
    adjFinYn,
    usrId,
    adjDetails
  }) => {
    try {
        
      const request = pool.request();

      // 상세 내역 저장

      adjDetails.forEach(async (adjDtl) => {

        console.log("file:", file.name);
        console.log("file:", file.url);

        const dtlRequest = pool.request();

        dtlRequest.input("CAR_REG_ID", sql.VarChar, carRegId);
        dtlRequest.input("SCT_CD", sql.VarChar, adjDtl.sctCd);
        dtlRequest.input("SEQ", sql.VarChar, adjDtl.seq);
        dtlRequest.input("ITEM_NM", sql.VarChar, adjDtl.itemNm);
        dtlRequest.input("AMT", sql.VarChar, adjDtl.amt);
        dtlRequest.input("SUP_PRC", sql.VarChar, adjDtl.supPrc);
        dtlRequest.input("VAT", sql.VarChar, adjDtl.vat);
        dtlRequest.input("TAX_YN", sql.VarChar, adjDtl.taxyN);
        dtlRequest.input("REGR_ID", sql.VarChar, usrId);
        dtlRequest.input("MODR_ID", sql.VarChar, usrId);

        await dtlRequest.query(`INSERT INTO dbo.CJB_ADJ_DTL (
                                            CAR_REG_ID,
                                            SCT_CD,
                                            SEQ,
                                            ITEM_NM,
                                            AMT,
                                            SUP_PRC,
                                            VAT,
                                            TAX_YN,
                                            REGR_ID,
                                            MODR_ID) VALUES (
                                            @CAR_REG_ID, 
                                            @SCT_CD, 
                                            @SEQ, 
                                            @ITEM_NM, 
                                            @AMT, 
                                            @VAT
                                            @TAX_YN, 
                                            @REGR_ID, 
                                            @MODR_ID)`);

      });

      request.input("CAR_REG_ID", sql.VarChar, carRegId);
      request.input("ADJ_DTIME", sql.VarChar, adjDtime);
      request.input("CAR_SALE_SUM_AMT", sql.Int, carSaleSumAmt);
      request.input("CAR_SALE_SUM_SUP_PRC", sql.Int, carSaleSumSupPrc);
      request.input("CAR_SALE_SUM_VAT", sql.Int, carSaleSumVat);
      request.input("CAR_PUR_AMT", sql.Int, carPurAmt);
      request.input("CAR_PUR_SUP_PRC", sql.Int, carPurSupPrc);
      request.input("CAR_PUR_VAT", sql.Int, carPurVat);
      request.input("CMRC_COST_SUM_AMT", sql.Int, cmrcCostSumAmt);
      request.input("CMRC_COST_SUM_SUP_PRC", sql.Int, cmrcCostSumSupPrc);
      request.input("CMRC_COST_SUM_VAT", sql.Int, cmrcCostSumVat);
      request.input("ADJ_STD_AMT", sql.Int, adjStdAmt);
      request.input("ADJ_STD_SUP_PRC", sql.Int, adjStdSupPrc);
      request.input("ADJ_STD_VAT", sql.Int, adjStdVat);
      request.input("DEBT_SUM_AMT", sql.Int, debtSumAmt);
      request.input("STOFF_SUM_AMT", sql.Int, stoffSumAmt);
      request.input("INCM_AMT", sql.Int,incmAmt,);
      request.input("INTX", sql.Int, intx);
      request.input("LCTX", sql.Int, lctx);
      request.input("HGHFOR_INSU_CST", sql.Int, hghforIssuCst);
      request.input("MTRE_INSU_CST", sql.Int, mtreInsuCst);
      request.input("REAL_PAY_AMT", sql.Int, realPayAmt);
      request.input("REAL_MORC_AMT", sql.Int, realMorcAmt);
      request.input("MNUS_APLY_YN", sql.VarChar, mnusAplyYn);
      request.input("WTTX_APLY_YN", sql.VarChar, wttxAplyYn);
      request.input("ADJ_FIN_YN", sql.VarChar, adjFinYn);
      request.input("REGR_ID", sql.VarChar, usrId);
      request.input("MODR_ID", sql.VarChar, usrId);

      const query = `
        INSERT INTO dbo.CJB_ADJ
          ( CAR_REG_ID,
            ADJ_DTIME,
            CAR_SALE_SUM_AMT,
            CAR_SALE_SUM_SUP_PRC,
            CAR_SALE_SUM_VAT,
            CAR_PUR_AMT,
            CAR_PUR_SUP_PRC,
            CAR_PUR_VAT,
            CMRC_COST_SUM_AMT,
            CMRC_COST_SUM_SUP_PRC,
            CMRC_COST_SUM_VAT,
            ADJ_STD_AMT,
            ADJ_STD_SUP_PRC,
            ADJ_STD_VAT,
            DEBT_SUM_AMT,
            STOFF_SUM_AMT,
            INCM_AMT,
            INTX,
            LCTX,
            HGHFOR_INSU_CST,
            MTRE_INSU_CST,
            REAL_PAY_AMT,
            REAL_MORC_AMT,
            MNUS_APLY_YN,
            WTTX_APLY_YN,
            ADJ_FIN_YN,
            REGR_ID,
            MODR_ID ) 
        VALUES 
          ( @CAR_REG_ID,
            @ADJ_DTIME,
            @CAR_SALE_SUM_AMT,
            @CAR_SALE_SUM_SUP_PRC,
            @CAR_SALE_SUM_VAT,
            @CAR_PUR_AMT,
            @CAR_PUR_SUP_PRC,
            @CAR_PUR_VAT,
            @CMRC_COST_SUM_AMT,
            @CMRC_COST_SUM_SUP_PRC,
            @CMRC_COST_SUM_VAT,
            @ADJ_STD_AMT,
            @ADJ_STD_SUP_PRC,
            @ADJ_STD_VAT,
            @DEBT_SUM_AMT,
            @STOFF_SUM_AMT,
            @INCM_AMT,
            @INTX,
            @LCTX,
            @HGHFOR_INSU_CST,
            @MTRE_INSU_CST,
            @REAL_PAY_AMT,
            @REAL_MORC_AMT,
            @MNUS_APLY_YN,
            @WTTX_APLY_YN,
            @ADJ_FIN_YN,
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

  // 정산 수정 (정산 상세 포함)
  exports.updateCarAdj = async ({ 
    carRegId, 
    adjDtime, 
    carSaleSumAmt,
    carSaleSumSupPrc,
    carSaleSumVat,
    carPurAmt,
    carPurSupPrc,
    carPurVat,
    cmrcCostSumAmt,
    cmrcCostSumSupPrc,
    cmrcCostSumVat,
    adjStdAmt,
    adjStdSupPrc,
    adjStdVat,
    debtSumAmt,
    stoffSumAmt,
    incmAmt,
    intx,
    lctx,
    hghforIssuCst,
    mtreInsuCst,
    realPayAmt,
    realMorcAmt,
    mnusAplyYn,
    wttxAplyYn,
    adjFinYn,
    usrId,
    adjDetails
  }) => {
    try {
      const request = pool.request();

      request.input("CAR_REG_ID", sql.VarChar, carRegId);
      request.input("ADJ_DTIME", sql.VarChar, adjDtime);
      request.input("CAR_SALE_SUM_AMT", sql.Int, carSaleSumAmt);
      request.input("CAR_SALE_SUM_SUP_PRC", sql.Int, carSaleSumSupPrc);
      request.input("CAR_SALE_SUM_VAT", sql.Int, carSaleSumVat);
      request.input("CAR_PUR_AMT", sql.Int, carPurAmt);
      request.input("CAR_PUR_SUP_PRC", sql.Int, carPurSupPrc);
      request.input("CAR_PUR_VAT", sql.Int, carPurVat);
      request.input("CMRC_COST_SUM_AMT", sql.Int, cmrcCostSumAmt);
      request.input("CMRC_COST_SUM_SUP_PRC", sql.Int, cmrcCostSumSupPrc);
      request.input("CMRC_COST_SUM_VAT", sql.Int, cmrcCostSumVat);
      request.input("ADJ_STD_AMT", sql.Int, adjStdAmt);
      request.input("ADJ_STD_SUP_PRC", sql.Int, adjStdSupPrc);
      request.input("ADJ_STD_VAT", sql.Int, adjStdVat);
      request.input("DEBT_SUM_AMT", sql.Int, debtSumAmt);
      request.input("STOFF_SUM_AMT", sql.Int, stoffSumAmt);
      request.input("INCM_AMT", sql.Int,incmAmt,);
      request.input("INTX", sql.Int, intx);
      request.input("LCTX", sql.Int, lctx);
      request.input("HGHFOR_INSU_CST", sql.Int, hghforIssuCst);
      request.input("MTRE_INSU_CST", sql.Int, mtreInsuCst);
      request.input("REAL_PAY_AMT", sql.Int, realPayAmt);
      request.input("REAL_MORC_AMT", sql.Int, realMorcAmt);
      request.input("MNUS_APLY_YN", sql.VarChar, mnusAplyYn);
      request.input("WTTX_APLY_YN", sql.VarChar, wttxAplyYn);
      request.input("ADJ_FIN_YN", sql.VarChar, adjFinYn);
      request.input("MODR_ID", sql.VarChar, usrId);

      // 상세 내역 삭제
      dtlDelete.input("CAR_REG_ID", sql.VarChar, carRegId);
      await dtlDelete.query(`DELETE dbo.CJB_ADJ_DTL  WHERE CAR_REG_ID = @CAR_REG_ID`);

      // 상세 내역 저장
      adjDetails.forEach(async (adjDtl) => {
        const dtlRequest = pool.request();

        dtlRequest.input("CAR_REG_ID", sql.VarChar, carRegId);
        dtlRequest.input("SCT_CD", sql.VarChar, adjDtl.sctCd);
        dtlRequest.input("SEQ", sql.VarChar, adjDtl.seq);
        dtlRequest.input("ITEM_NM", sql.VarChar, adjDtl.itemNm);
        dtlRequest.input("AMT", sql.VarChar, adjDtl.amt);
        dtlRequest.input("SUP_PRC", sql.VarChar, adjDtl.supPrc);
        dtlRequest.input("VAT", sql.VarChar, adjDtl.vat);
        dtlRequest.input("TAX_YN", sql.VarChar, adjDtl.taxyN);
        dtlRequest.input("REGR_ID", sql.VarChar, usrId);
        dtlRequest.input("MODR_ID", sql.VarChar, usrId);

        await dtlRequest.query(`INSERT INTO dbo.CJB_ADJ_DTL (
                                            CAR_REG_ID,
                                            SCT_CD,
                                            SEQ,
                                            ITEM_NM,
                                            AMT,
                                            SUP_PRC,
                                            VAT,
                                            TAX_YN,
                                            REGR_ID,
                                            MODR_ID) VALUES (
                                            @CAR_REG_ID, 
                                            @SCT_CD, 
                                            @SEQ, 
                                            @ITEM_NM, 
                                            @AMT, 
                                            @VAT
                                            @TAX_YN, 
                                            @REGR_ID, 
                                            @MODR_ID)`);

      });

      const query = `
        UPDATE dbo.CJB_ADJ
           SET ADJ_DTIME = @ADJ_DTIME,
               CAR_SALE_SUM_AMT = @CAR_SALE_SUM_AMT,
               CAR_SALE_SUM_SUP_PRC = @CAR_SALE_SUM_SUP_PRC,
               CAR_SALE_SUM_VAT = @CAR_SALE_SUM_VAT,
               CAR_PUR_AMT = @CAR_PUR_AMT,
               CAR_PUR_SUP_PRC = @CAR_PUR_SUP_PRC,
               CAR_PUR_VAT = @CAR_PUR_VAT,
               CMRC_COST_SUM_AMT = @CMRC_COST_SUM_AMT,
               CMRC_COST_SUM_SUP_PRC = @CMRC_COST_SUM_SUP_PRC,
               CMRC_COST_SUM_VAT = @CMRC_COST_SUM_VAT,
               ADJ_STD_AMT = @ADJ_STD_AMT,
               ADJ_STD_SUP_PRC = @ADJ_STD_SUP_PRC,
               ADJ_STD_VAT = @ADJ_STD_VAT,
               DEBT_SUM_AMT = @DEBT_SUM_AMT,
               INCM_AMT = @INCM_AMT,
               INTX = @INTX,
               LCTX = @LCTX,
               HGHFOR_INSU_CST = @HGHFOR_INSU_CST,
               MTRE_INSU_CST = @MTRE_INSU_CST,
               REAL_PAY_AMT = @REAL_PAY_AMT,
               MNUS_APLY_YN = @MNUS_APLY_YN,
               WTTX_APLY_YN = @WTTX_APLY_YN,
               ADJ_FIN_YN = @ADJ_FIN_YN,
               MOD_DTIME = GETDATE(),
               MODR_ID = @MODR_ID
        WHERE 
          CAR_REG_ID = @CAR_REG_ID 
      `;

      await request.query(query);

      return { success: true };
    } catch (err) {
      console.error("Error updating car acct detail:", err);
      throw err;
    }
  }


// 정산 삭제
exports.deleteCarAdj = async ({carRegId}) => {
  try {
    const request = pool.request();
    request.input("CAR_REG_ID", sql.VarChar, carRegId);

    query1 = `DELETE CJB_ADJ
                    WHERE CAR_REG_ID = @CAR_REG_ID
        `;  

    query2 = `DELETE CJB_ADJ_DTL
                    WHERE CAR_REG_ID = @CAR_REG_ID
        `;  

    await Promise.all([request.query(query1), request.query(query2)]);

  } catch (err) {
    console.error("Error deleting car adj:", err);
    throw err;
  }
};

// 정산 삭제
exports.deleteCarAdjDtl = async ({carRegId, sctCd, seq}) => {
  try {
    const request = pool.request();
    request.input("CAR_REG_ID", sql.VarChar, carRegId);
    request.input("SCT_CD", sql.VarChar, sctCd);
    request.input("SEQ", sql.VarChar, seq);

    query1 = `DELETE dbo.CJB_ADJ_DTL
               WHERE CAR_REG_ID = @CAR_REG_ID
                 AND SCT_CD = @SCT_CD
                 AND SEQ = @SEQ
        `;  

    query2 = `UPDATE dbo.CJB_ADJ
                SET CAR_SALE_SUM_AMT = CAR_SALE_SUM_AMT - (SELECT AMT FROM dbo.CJB_ADJ_DTL WHERE CAR_REG_ID = @CAR_REG_ID AND SCT_CD = @SCT_CD AND SEQ = @SEQ)
              WHERE CAR_REG_ID = @CAR_REG_ID
    `;  

    await Promise.all([request.query(query1), request.query(query2)]);

  } catch (err) {
    console.error("Error deleting car adj dtl:", err);
    throw err;
  }
};
