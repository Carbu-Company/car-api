const sql = require("mssql");
const pool = require("../../config/db");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 상사 2.0
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 상사 내역 목록 조회 
exports.getCarAgentList = async ({ 
    carAgent, 
    page,
    pageSize,
    agentNm, 
    brno,
    presNm,
    agentStatCd,
    cmbtAgentCd,
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
    
      if (agentNm) request.input("AGENT_NM", sql.VarChar, `%${agentNm}%`);
      if (brno) request.input("BRNO", sql.VarChar, `%${brno}%`);
      if (presNm) request.input("PRES_NM", sql.VarChar, `%${presNm}%`);
      if (agentStatCd) request.input("AGENT_STAT_CD", sql.VarChar, agentStatCd);
      if (cmbtAgentCd) request.input("CMBT_AGENT_CD", sql.VarChar, `%${cmbtAgentCd}%`);
  
      // 전체 카운트 조회
      const countQuery = `
      SELECT COUNT(*) as totalCount
                FROM dbo.CBJ_AGENT A
                 WHERE  1= 1
                ${agentNm ? "AND A.AGENT_NM LIKE @AGENT_NM" : ""}
                ${brno ? "AND A.BRNO LIKE @BRNO" : ""}
                ${presNm ? "AND A.PRES_NM LIKE @PRES_NM" : ""}
                ${agentStatCd ? "AND A.AGENT_STAT_CD = @AGENT_STAT_CD" : ""}
                ${cmbtAgentCd ? "AND A.CMBT_AGENT_CD LIKE @CMBT_AGENT_CD" : ""}
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
                  FROM dbo.CBJ_AGENT A
                 WHERE 1 = 1
                ${agentNm ? "AND A.AGENT_NM LIKE @AGENT_NM" : ""}
                ${brno ? "AND A.BRNO LIKE @BRNO" : ""}
                ${presNm ? "AND A.PRES_NM LIKE @PRES_NM" : ""}
                ${agentStatCd ? "AND A.AGENT_STAT_CD = @AGENT_STAT_CD" : ""}
                ${cmbtAgentCd ? "AND A.CMBT_AGENT_CD LIKE @CMBT_AGENT_CD" : ""}
      ORDER BY ${orderItem === '01' ? 'A.REG_DTIME' : 'B.AGENT_NM'} ${ordAscDesc}
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
        dataList: dataResult.recordset,
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
  
  // 상사 합계 조회
  exports.getCarAdjSummary = async ({  
    carAgent, 
    page,
    pageSize,
    agentNm, 
    brno,
    presNm,
    agentStatCd,
    cmbtAgentCd,
    orderItem = '01',
    ordAscDesc = 'desc'
  }) => {
    try {
      const request = pool.request();
  
      console.log('carAgent:', carAgent);
      console.log('pageSize:', pageSize);
      console.log('page:', page);
  
      console.log('agentNm:', agentNm);
      console.log('brno:', brno);
      console.log('presNm:', presNm);
      console.log('agentStatCd:', agentStatCd);
      console.log('cmbtAgentCd:', cmbtAgentCd);
      console.log('orderItem:', orderItem);
      console.log('ordAscDesc:', ordAscDesc);
  
      request.input("CAR_AGENT", sql.VarChar, carAgent);
      request.input("PAGE_SIZE", sql.Int, pageSize);
      request.input("PAGE", sql.Int, page);
    
      if (agentNm) request.input("AGENT_NM", sql.VarChar, `%${agentNm}%`);
      if (brno) request.input("BRNO", sql.VarChar, `%${brno}%`);
      if (presNm) request.input("PRES_NM", sql.VarChar, `%${presNm}%`);
      if (agentStatCd) request.input("AGENT_STAT_CD", sql.VarChar, agentStatCd);
      if (cmbtAgentCd) request.input("CMBT_AGENT_CD", sql.VarChar, `%${cmbtAgentCd}%`);
  
      const query = `SELECT SUM(I_CNT) AS I_CNT
                          , SUM(IAMT) AS IAMT
                          , SUM(O_CNT) AS O_CNT
                          , SUM(OAMT) AS OAMT 
                       FROM (SELECT COUNT(B.ACCT_DTL_SEQ) AS I_CNT
                            , ISNULL(SUM(CONVERT(int, ISNULL(B.IAMT, '0'))), 0) AS IAMT
                            , 0 O_CNT
                            , 0 OAMT
                        FROM dbo.CJB_AGENT A
                       WHERE 1 = 1
                         AND A.REG_DTIME >  DATEADD(day, 0, CONVERT(date, GETDATE()))
                        $${agentNm ? "AND A.AGENT_NM LIKE @AGENT_NM" : ""}
                        ${brno ? "AND A.BRNO LIKE @BRNO" : ""}
                        ${presNm ? "AND A.PRES_NM LIKE @PRES_NM" : ""}
                        ${agentStatCd ? "AND A.AGENT_STAT_CD = @AGENT_STAT_CD" : ""}
                        ${cmbtAgentCd ? "AND A.CMBT_AGENT_CD LIKE @CMBT_AGENT_CD" : ""}
                      UNION ALL
                      SELECT  0 I_CNT
                            , 0 IAMT
                            , COUNT(B.ACCT_DTL_SEQ) O_CNT
                            , ISNULL(SUM(CONVERT(int, ISNULL(B.OAMT, '0'))), 0) AS OAMT
                        FROM dbo.CJB_AGENT A
                       WHERE 1 = 1
                         AND A.REG_DTIME >= DATEADD(day, -1, CONVERT(date, GETDATE())) 
                         AND A.REG_DTIME <  DATEADD(day, 0, CONVERT(date, GETDATE()))
                        ${agentNm ? "AND A.AGENT_NM LIKE @AGENT_NM" : ""}
                        ${brno ? "AND A.BRNO LIKE @BRNO" : ""}
                        ${presNm ? "AND A.PRES_NM LIKE @PRES_NM" : ""}
                        ${agentStatCd ? "AND A.AGENT_STAT_CD = @AGENT_STAT_CD" : ""}
                        ${cmbtAgentCd ? "AND A.CMBT_AGENT_CD LIKE @CMBT_AGENT_CD" : ""}
                      UNION ALL
                      SELECT  0 I_CNT
                            , 0 IAMT
                            , COUNT(B.ACCT_DTL_SEQ) O_CNT
                            , ISNULL(SUM(CONVERT(int, ISNULL(B.OAMT, '0'))), 0) AS OAMT
                        FROM dbo.CJB_AGENT A
                       WHERE 1 = 1
                        ${agentNm ? "AND A.AGENT_NM LIKE @AGENT_NM" : ""}
                        ${brno ? "AND A.BRNO LIKE @BRNO" : ""}
                        ${presNm ? "AND A.PRES_NM LIKE @PRES_NM" : ""}
                        ${agentStatCd ? "AND A.AGENT_STAT_CD = @AGENT_STAT_CD" : ""}
                        ${cmbtAgentCd ? "AND A.CMBT_AGENT_CD LIKE @CMBT_AGENT_CD" : ""}
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
  exports.getCarAdjDetail = async ({ carRegId }) => {
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

  // 계좌정보 목록 조회
  exports.getAgentAcctList = async ({ carAgent }) => {
    try {
      const request = pool.request();
      request.input("CAR_AGENT", sql.VarChar, carAgent);

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

  // 정산 저장 (상세 포함)
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

  // 계좌정보 상세 수정
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
exports.deleteAdj = async ({carRegId}) => {
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
    console.error("Error deleting car pur:", err);
    throw err;
  }
};
