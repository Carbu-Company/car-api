const sql = require("mssql");
const pool = require("../../config/db");


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 비용 2.0 (상사 매입비 하나만 처리 + 고객 비용 처리)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 비용 목록 조회 
exports.getCostList = async ({ 
    agentId, 
    page,
    pageSize,
    carNo,
    dealer,
    dtGubun,
    startDt,
    endDt, 
    dtlNewCarNo,
    dtlOldCarNo,
    dtlCustomerName,
    dtlSaleItem,
    dtlMemo,
    dtlTradeProcNm,
    dtlTradeSctGubun,
    dtlCrStat,
    dtlRcgnNo,
    dtlNtsConfNo,
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
      console.log('dtlCustomerName:', dtlCustomerName);
      console.log('dtlSaleItem:', dtlSaleItem);
      console.log('dtlMemo:', dtlMemo);
      console.log('dtlTradeProcNm:', dtlTradeProcNm);
      console.log('dtlTradeSctGubun:', dtlTradeSctGubun);
      console.log('dtlCrStat:', dtlCrStat);
      console.log('dtlRcgnNo:', dtlRcgnNo);
      console.log('dtlNtsConfNo:', dtlNtsConfNo);
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

      if (dtlNewCarNo) request.input("DTL_NEW_CAR_NO", sql.VarChar, `%${dtlNewCarNo}%`);
      if (dtlOldCarNo) request.input("DTL_OLD_CAR_NO", sql.VarChar, `%${dtlOldCarNo}%`);
      if (dtlCustomerName) request.input("DTL_CUSTOMER_NAME", sql.VarChar, `%${dtlCustomerName}%`);
      if (dtlMemo) request.input("MEMO", sql.VarChar, `%${dtlMemo}%`);
      if (dtlTradeProcNm) request.input("TRADE_PROC_NM", sql.VarChar, `%${dtlTradeProcNm}%`);
      if (dtlTradeSctGubun) request.input("TRADE_SCT_NM", sql.VarChar, dtlTradeSctGubun);
      if (dtlCrStat && dtlCrStat.length > 0) request.input("CR_MTS_STAT_CD", sql.VarChar, dtlCrStat.join(','));
      if (dtlRcgnNo) request.input("RCGN_NO", sql.VarChar, `%${dtlRcgnNo}%`);
      if (dtlNtsConfNo) request.input("NTS_CONF_NO", sql.VarChar, `%${dtlNtsConfNo}%`);
  
      // 전체 카운트 조회
      const countQuery = `
      SELECT COUNT(*) as totalCount
                FROM dbo.CJB_COST A
                 WHERE  A.AGENT_ID = @AGENT_ID
            ${carNo ? "AND (D.CAR_NO LIKE @CAR_NO OR D.PUR_BEF_CAR_NO LIKE @CAR_NO OR C.SALE_CAR_NO LIKE @CAR_NO)" : ""}
            ${dealer ? "AND (D.DLR_ID LIKE @DEALER OR C.DLR_ID LIKE @DEALER)" : ""}
            ${startDt ? `AND ${dtGubun === '1' ? 'D.TRADE_DT' : dtGubun === '2' ? 'C.CAR_SALE_DT' : 'B.CAR_PUR_DT'} >= @START_DT` : ""}
            ${endDt ? `AND ${dtGubun === '1' ? 'D.TRADE_DT' : dtGubun === '2' ? 'C.CAR_SALE_DT' : 'B.CAR_PUR_DT'} <= @END_DT` : ""}
            ${dtlCustomerName ? "AND (D.OWNR_NM LIKE @DTL_CUSTOMER_NAME OR C.BUYER_NM LIKE @DTL_CUSTOMER_NAME)" : ""}
            ${dtlSaleItem ? `AND ${dtlSaleItem === '1' ? 'C.SALE_AMT' : dtlSaleItem === '2' ? 'C.AGENT_SEL_COST' : 'C.PREF_INFE_AMT'} > 0` : ""}
            ${dtlMemo ? "AND A.MEMO LIKE @MEMO" : ""}
            ${dtlTradeProcNm ? "AND A.TRADE_PROC_NM LIKE @TRADE_PROC_NM" : ""}
            ${dtlTradeSctGubun ? "AND A.TRADE_SCT_NM = @TRADE_SCT_NM" : ""}
            ${dtlCrStat && dtlCrStat.length > 0 ? "AND A.CR_MTS_STAT_CD = @CR_MTS_STAT_CD" : ""}
            ${dtlRcgnNo ? "AND A.RCGN_NO = @RCGN_NO" : ""}
            ${dtlNtsConfNo ? "AND A.NTS_CONF_NO = @NTS_CONF_NO" : ""}
      `;
    
      const dataQuery = `
                SELECT  CAR_REG_ID        
                    , COST_TGTR_ID      
                    , COST_TGTR_SCT_CD  
                    , COST_DT           
                    , COST_CD           
                    , COST_NM           
                    , COST_PAY_METH_CD  
                    , COST_EVDC_CD      
                    , SET_AMT           
                    , COST_AMT          
                    , TAX_ISSU_YN       
                    , TAX_ISSU_DTIME    
                    , TAX_RT            
                    , COST_DESC         
                    , COST_KND_CD       
                    , DEL_YN            
                    , CR_ISSU_YN        
                    , TGTR_NM  
                    , TGTR_PHON
                    , TGTR_SN  
                    , TGTR_BRNO
            FROM (
               SELECT A.COST_SEQ
                    , A.CAR_REG_ID
                    , A.COST_TGTR_ID
                    , A.COST_TGTR_SCT_CD    -- U:USER, C:CUSTOMER
                    , A.COST_DT
                    , A.COST_CD
                    , A.COST_NM
                    , A.COST_PAY_METH_CD
                    , A.COST_EVDC_CD
                    , A.SET_AMT
                    , A.COST_AMT
                    , A.TAX_ISSU_YN
                    , A.TAX_ISSU_DTIME
                    , A.TAX_RT
                    , A.COST_DESC
                    , A.COST_KND_CD
                    , A.DEL_YN
                    , A.CR_ISSU_YN
                    , B.USR_NM       AS TGTR_NM
                    , B.USR_PHON     AS TGTR_PHON
                    , B.EMP_SN       AS TGTR_SN
                    , B.EMP_BRNO     AS TGTR_BRNO
                 FROM dbo.CJB_COST A
                    , dbo.CJB_USR B
                WHERE A.AGENT_ID = @AGENT_ID
                  AND A.COST_TGTR_ID = B.USR_ID
                  AND A.COST_TGTR_SCT_CD = 'U'
                UNION ALL
                SELECT A.COST_SEQ
                , A.CAR_REG_ID
                , A.COST_TGTR_ID
                , A.COST_TGTR_SCT_CD    -- U:USER, C:CUSTOMER
                , A.COST_DT
                , A.COST_CD
                , A.COST_NM
                , A.COST_PAY_METH_CD
                , A.COST_EVDC_CD
                , A.SET_AMT
                , A.COST_AMT
                , A.TAX_ISSU_YN
                , A.TAX_ISSU_DTIME
                , A.TAX_RT
                , A.COST_DESC
                , A.COST_KND_CD
                , A.DEL_YN
                , A.CR_ISSU_YN
                , B.CUST_NM
                , B.CUST_PHON
                , B.SSN
                , B.BRNO
                FROM dbo.CJB_COST A
                , dbo.CJB_CUST B
            WHERE A.AGENT_ID = @AGENT_ID
                AND A.COST_TGTR_ID = B.CUST_NO
                AND A.COST_TGTR_SCT_CD = 'C' ) A
            ${carNo ? "AND (D.CAR_NO LIKE @CAR_NO OR D.PUR_BEF_CAR_NO LIKE @CAR_NO OR C.SALE_CAR_NO LIKE @CAR_NO)" : ""}
            ${dealer ? "AND (D.DLR_ID LIKE @DEALER OR C.DLR_ID LIKE @DEALER)" : ""}
            ${startDt ? `AND ${dtGubun === '1' ? 'D.TRADE_DT' : dtGubun === '2' ? 'C.CAR_SALE_DT' : 'B.CAR_PUR_DT'} >= @START_DT` : ""}
            ${endDt ? `AND ${dtGubun === '1' ? 'D.TRADE_DT' : dtGubun === '2' ? 'C.CAR_SALE_DT' : 'B.CAR_PUR_DT'} <= @END_DT` : ""}
            ${dtlCustomerName ? "AND (D.OWNR_NM LIKE @DTL_CUSTOMER_NAME OR C.BUYER_NM LIKE @DTL_CUSTOMER_NAME)" : ""}
            ${dtlSaleItem ? `AND ${dtlSaleItem === '1' ? 'C.SALE_AMT' : dtlSaleItem === '2' ? 'C.AGENT_SEL_COST' : 'C.PREF_INFE_AMT'} > 0` : ""}
            ${dtlMemo ? "AND A.MEMO LIKE @MEMO" : ""}
            ${dtlTradeProcNm ? "AND A.TRADE_PROC_NM LIKE @TRADE_PROC_NM" : ""}
            ${dtlTradeSctGubun ? "AND A.TRADE_SCT_NM = @TRADE_SCT_NM" : ""}
            ${dtlCrStat && dtlCrStat.length > 0 ? "AND A.CR_MTS_STAT_CD = @CR_MTS_STAT_CD" : ""}
            ${dtlRcgnNo ? "AND A.RCGN_NO = @RCGN_NO" : ""}
            ${dtlNtsConfNo ? "AND A.NTS_CONF_NO = @NTS_CONF_NO" : ""}
            ORDER BY ${orderItem === '01' ? 'A.COST_SEQ' : 'A.CAR_REG_ID'} ${ordAscDesc}
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

  // 현금영수증 상세 조회
  exports.getCostDetail = async ({ costSeq }) => {
    try {
      const request = pool.request();


      console.log('*********costSeq:***************', costSeq);
      request.input("COST_SEQ", sql.Int, costSeq);   

      console.log('costSeq:', costSeq);
  
      const query = `SELECT   A.COST_SEQ
                            , A.CAR_REG_ID
                            , A.COST_TGTR_ID
                            , A.COST_TGTR_SCT_CD    -- U:USER, C:CUSTOMER
                            , A.COST_DT
                            , A.COST_CD
                            , A.COST_NM
                            , A.COST_PAY_METH_CD
                            , A.COST_EVDC_CD
                            , A.SET_AMT
                            , A.COST_AMT
                            , A.TAX_ISSU_YN
                            , A.TAX_ISSU_DTIME
                            , A.TAX_RT
                            , A.COST_DESC
                            , A.COST_KND_CD
                            , A.DEL_YN
                            , A.CR_ISSU_YN
                        FROM dbo.CJB_COST A
                       WHERE A.COST_SEQ = @COST_SEQ `;
  
      console.log('query:', query);
  
      const result = await request.query(query);
      return result.recordset[0];
    } catch (err) {
      console.error("Error fetching car pur detail:", err);
      throw err;
    }
  };

  // 비용 저장
  exports.insertCost = async ({ 
    agentId,
    carRegId,
    costTgtrId,
    costTgtrSctCd,
    costDt,
    costCd,
    costNm,
    costPayMethCd,
    costEvdcCd,
    setAmt,
    costAmt,
    taxIssuYn,
    taxIssuDtime,
    taxRt,
    costDesc,
    costKndCd,
    crIssuYn,
    userId
  }) => {
    try {
      const request = pool.request();
      
      request.input("AGENT_ID", sql.VarChar, agentId);
      request.input("CAR_REG_ID", sql.VarChar, carRegId);
      request.input("COST_TGTR_ID", sql.VarChar, costTgtrId);
      request.input("COST_TGTR_SCT_CD", sql.VarChar, costTgtrSctCd);
      request.input("COST_DT", sql.VarChar, costDt);
      request.input("COST_CD", sql.VarChar, costCd);
      request.input("COST_NM", sql.VarChar, costNm);
      request.input("COST_PAY_METH_CD", sql.VarChar, costPayMethCd);
      request.input("COST_EVDC_CD", sql.VarChar, costEvdcCd);
      request.input("SET_AMT", sql.VarChar, setAmt);
      request.input("COST_AMT", sql.VarChar, costAmt);
      request.input("TAX_ISSU_YN", sql.VarChar, taxIssuYn);
      request.input("TAX_ISSU_DTIME", sql.VarChar, taxIssuDtime);
      request.input("TAX_RT", sql.VarChar, taxRt);
      request.input("COST_DESC", sql.VarChar, costDesc);
      request.input("COST_KND_CD", sql.VarChar, costKndCd);
      request.input("CR_ISSU_YN", sql.VarChar, crIssuYn);
      request.input("REGR_ID", sql.VarChar, userId);
      request.input("MODR_ID", sql.VarChar, userId);

      const query = `
        INSERT INTO dbo.CJB_COST
            ( USR_ID,
              AGENT_ID,
              CAR_REG_ID,
              COST_TGTR_ID,
              COST_TGTR_SCT_CD,
              COST_DT,
              COST_CD,
              COST_NM,
              COST_PAY_METH_CD,
              COST_EVDC_CD,
              SET_AMT,
              COST_AMT,
              TAX_ISSU_YN,
              TAX_ISSU_DTIME,
              TAX_RT,
              COST_DESC,
              COST_KND_CD,
              CR_ISSU_YN,
              REGR_ID,
              MODR_ID ) 
        VALUES 
          ( 
            @AGENT_ID,
            @CAR_REG_ID,
            @COST_TGTR_ID,
            @COST_TGTR_SCT_CD,
            @COST_DT,
            @COST_CD,
            @COST_NM,
            @COST_PAY_METH_CD,
            @COST_EVDC_CD,
            @SET_AMT,
            @COST_AMT,
            @TAX_ISSU_YN,
            @TAX_ISSU_DTIME,
            @TAX_RT,
            @COST_DESC,
            @COST_KND_CD,
            @CR_ISSU_YN,
            @REGR_ID,
            @MODR_ID
          );
      `;
      await request.query(query);

      return { success: true };
    } catch (err) {
      console.error("Error inserting car cost:", err);
      throw err;
    }
  }

  // 비용 수정 등록 (기존 자료 삭제 후 등록)
  exports.updateCost = async ({ 
    costSeq,
    agentId,
    carRegId,
    costTgtrId,
    costTgtrSctCd,
    costDt,
    costCd,
    costNm,
    costPayMethCd,
    costEvdcCd,
    setAmt,
    costAmt,
    taxIssuYn,
    taxIssuDtime,
    taxRt,
    costDesc,
    costKndCd,
    crIssuYn,
    userId
  }) => {
    try {
      const request = pool.request();
      
      request.input("COST_SEQ", sql.Int, costSeq);
      request.input("AGENT_ID", sql.VarChar, agentId);
      request.input("CAR_REG_ID", sql.VarChar, carRegId);
      request.input("COST_TGTR_ID", sql.VarChar, costTgtrId);
      request.input("COST_TGTR_SCT_CD", sql.VarChar, costTgtrSctCd);
      request.input("COST_DT", sql.VarChar, costDt);
      request.input("COST_CD", sql.VarChar, costCd);
      request.input("COST_NM", sql.VarChar, costNm);
      request.input("COST_PAY_METH_CD", sql.VarChar, costPayMethCd);
      request.input("COST_EVDC_CD", sql.VarChar, costEvdcCd);
      request.input("SET_AMT", sql.VarChar, setAmt);
      request.input("COST_AMT", sql.VarChar, costAmt);
      request.input("TAX_ISSU_YN", sql.VarChar, taxIssuYn);
      request.input("TAX_ISSU_DTIME", sql.VarChar, taxIssuDtime);
      request.input("TAX_RT", sql.VarChar, taxRt);
      request.input("COST_DESC", sql.VarChar, costDesc);
      request.input("COST_KND_CD", sql.VarChar, costKndCd);
      request.input("CR_ISSU_YN", sql.VarChar, crIssuYn);
      request.input("REGR_ID", sql.VarChar, userId);
      request.input("MODR_ID", sql.VarChar, userId);


      const delQuery = `
        UPDATE dbo.CJB_COST
           SET DEL_YN = 'Y',
               MOD_DTIME = GETDATE(),
               MODR_ID = @MODR_ID
         WHERE COST_SEQ = @COST_SEQ
              `;


      const insQuery = `
        INSERT INTO dbo.CJB_COST
            ( USR_ID,
              AGENT_ID,
              CAR_REG_ID,
              COST_TGTR_ID,
              COST_TGTR_SCT_CD,
              COST_DT,
              COST_CD,
              COST_NM,
              COST_PAY_METH_CD,
              COST_EVDC_CD,
              SET_AMT,
              COST_AMT,
              TAX_ISSU_YN,
              TAX_ISSU_DTIME,
              TAX_RT,
              COST_DESC,
              COST_KND_CD,
              CR_ISSU_YN,
              REGR_ID,
              MODR_ID ) 
        VALUES 
          ( 
            @AGENT_ID,
            @CAR_REG_ID,
            @COST_TGTR_ID,
            @COST_TGTR_SCT_CD,
            @COST_DT,
            @COST_CD,
            @COST_NM,
            @COST_PAY_METH_CD,
            @COST_EVDC_CD,
            @SET_AMT,
            @COST_AMT,
            @TAX_ISSU_YN,
            @TAX_ISSU_DTIME,
            @TAX_RT,
            @COST_DESC,
            @COST_KND_CD,
            @CR_ISSU_YN,
            @REGR_ID,
            @MODR_ID
          );
      `;

      await Promise.all([request.query(delQuery), request.query(insQuery)]);    

      return { success: true };
    } catch (err) {
      console.error("Error updating car cost:", err);
      throw err;
    }
  }



  // 매입비 설정 조회  (환경설정)
  exports.getPurchaseCost = async ({ agentId }) => {
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
                        , DEL_YN
                        , REGR_ID
                        , CONVERT(VARCHAR, REG_DTIME, 23) AS REG_DTIME
                        , MODR_ID
                        , CONVERT(VARCHAR, MOD_DTIME, 23) AS MOD_DTIME 
                        FROM dbo.CJB_CAR_TRADE_ITEM 
                        WHERE AGENT_ID = @AGENT_ID 
                          AND TRADE_SCT_CD = '0' --매입
                          AND DEL_YN = 'N' -- 삭제 여부
                        ;`;
      const result = await request.query(query);
      return result.recordset;
    } catch (err) {
      console.error("Error fetching purchase cost:", err);
      throw err;
    }
  }



  
  // 매도비 설정 조회  (환경설정)
  exports.getSellCost = async ({ agentId }) => {
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
                        , DEL_YN
                        , REGR_ID
                        , CONVERT(VARCHAR, REG_DTIME, 23) AS REG_DTIME
                        , MODR_ID
                        , CONVERT(VARCHAR, MOD_DTIME, 23) AS MOD_DTIME
                        FROM dbo.CJB_CAR_TRADE_ITEM 
                        WHERE AGENT_ID = @AGENT_ID 
                          AND TRADE_SCT_CD = '1' --매도
                          AND DEL_YN = 'N' -- 삭제 여부
                        ;`;
      const result = await request.query(query);
      return result.recordset;
    } catch (err) {
      console.error("Error fetching purchase cost:", err);
      throw err;
    }
  }


  // 상사 지출항목 설정 조회  (환경설정)
  exports.getExpenseItem = async ({ agentId }) => {
    try {
      const request = pool.request();
      request.input("AGENT_ID", sql.VarChar, agentId);
      const query = `SELECT EXPD_ITEM_CD
                        , EXPD_ITEM_NM
                        , BASE_AMT
                        , SORT_SEQ
                        , USE_YN  
                        , REGR_ID
                        , CONVERT(VARCHAR, REG_DTIME, 23) AS REG_DTIME
                        , MODR_ID
                        , CONVERT(VARCHAR, MOD_DTIME, 23) AS MOD_DTIME
                        FROM dbo.CJB_AGENT_EXPD_ITEM 
                        WHERE AGENT_ID = @AGENT_ID
                   --       AND USE_YN = 'Y' -- 사용 여부
                        ;`;
      const result = await request.query(query);
      return result.recordset;
    } catch (err) {
      console.error("Error fetching expense item:", err);
      throw err;
    }
  }


  // 상사 수입항목 설정 조회  (환경설정)
  exports.getIncomeItem = async ({ agentId }) => {
    try {
      const request = pool.request();
      request.input("AGENT_ID", sql.VarChar, agentId);
      const query = `SELECT IMP_ITEM_CD
                        , IMP_ITEM_NM
                        , BASE_AMT
                        , SORT_SEQ
                        , USE_YN
                        , REGR_ID
                        , CONVERT(VARCHAR, REG_DTIME, 23) AS REG_DTIME
                        , MODR_ID
                        , CONVERT(VARCHAR, MOD_DTIME, 23) AS MOD_DTIME
                        FROM dbo.CJB_AGENT_IMP_ITEM 
                        WHERE AGENT_ID = @AGENT_ID
                         -- AND USE_YN = 'Y' -- 사용 여부
                        ;`;
      const result = await request.query(query);
      return result.recordset;
    } catch (err) {
      console.error("Error fetching income item:", err);
      throw err;
    }
  }


  // 상사 지출항목 등록 (환경설정)
  exports.insertExpenseItem = async ({ agentId, expdItemCd, expdItemNm, baseAmt, sortSeq, useYn, userId }) => {
    try {
      const request = pool.request();
      request.input("AGENT_ID", sql.VarChar, agentId);
      request.input("EXPD_ITEM_CD", sql.VarChar, expdItemCd);
      request.input("EXPD_ITEM_NM", sql.VarChar, expdItemNm);
      request.input("BASE_AMT", sql.Int, baseAmt);
      request.input("SORT_SEQ", sql.Int, sortSeq);
      request.input("USE_YN", sql.VarChar, useYn);
      request.input("REGR_ID", sql.VarChar, userId);
      request.input("MODR_ID", sql.VarChar, userId);

      const query = `
        INSERT INTO dbo.CJB_AGENT_EXPD_ITEM (
          AGENT_ID,
          EXPD_ITEM_CD,
          EXPD_ITEM_NM,
          BASE_AMT,
          SORT_SEQ,
          USE_YN,
          REGR_ID,
          MODR_ID
        ) VALUES (
          @AGENT_ID,
          @EXPD_ITEM_CD,
          @EXPD_ITEM_NM,
          @BASE_AMT,
          @SORT_SEQ,
          @USE_YN,
          @REGR_ID,
          @MODR_ID
        )
      `;
      await request.query(query);
      return { success: true };
    }
    catch (err) {
      console.error("Error inserting expense item:", err);
      throw err;
    }
  }

  // 상사 수입항목 등록 (환경설정)
  exports.insertIncomeItem = async ({ agentId, impItemCd, impItemNm, baseAmt, sortSeq, useYn, userId }) => {
    try {
      const request = pool.request();
      request.input("AGENT_ID", sql.VarChar, agentId);
      request.input("IMP_ITEM_CD", sql.VarChar, impItemCd);
      request.input("IMP_ITEM_NM", sql.VarChar, impItemNm);
      request.input("BASE_AMT", sql.Int, baseAmt);
      request.input("SORT_SEQ", sql.Int, sortSeq);
      request.input("USE_YN", sql.VarChar, useYn);
      request.input("REGR_ID", sql.VarChar, userId);
      request.input("MODR_ID", sql.VarChar, userId);

      const query = `
        INSERT INTO dbo.CJB_AGENT_IMP_ITEM (
          AGENT_ID,
          IMP_ITEM_CD,
          IMP_ITEM_NM,
          BASE_AMT,
          SORT_SEQ,
          USE_YN,
          REGR_ID,
          MODR_ID
        ) VALUES (
          @AGENT_ID,
          @IMP_ITEM_CD,
          @IMP_ITEM_NM,
          @BASE_AMT,
          @SORT_SEQ,
          @USE_YN,
          @REGR_ID,
          @MODR_ID
        )
      `;
      await request.query(query);
      return { success: true };
    }
    catch (err) {
      console.error("Error inserting income item:", err);
      throw err;
    }
  }


  // 상사 지출항목 삭제 (환경설정) 
  exports.deleteExpenseItem = async ({ agentId, expdItemCd }) => {
    try {
      const request = pool.request();
      request.input("AGENT_ID", sql.VarChar, agentId);
      request.input("EXPD_ITEM_CD", sql.VarChar, expdItemCd);
      const query = `DELETE dbo.CJB_AGENT_EXPD_ITEM 
                      WHERE AGENT_ID = @AGENT_ID 
                      AND EXPD_ITEM_CD = @EXPD_ITEM_CD`;
      await request.query(query);
      return { success: true };
    }
    catch (err) {
      console.error("Error deleting expense item:", err);
      throw err;
    }
  }

  // 상사 수입항목 삭제 (환경설정)
  exports.deleteIncomeItem = async ({ agentId, impItemCd }) => {
    try {
      const request = pool.request();
      request.input("AGENT_ID", sql.VarChar, agentId);
      request.input("IMP_ITEM_CD", sql.VarChar, impItemCd);
          const query = `DELETE dbo.CJB_AGENT_IMP_ITEM 
                          WHERE AGENT_ID = @AGENT_ID  
                            AND IMP_ITEM_CD = @IMP_ITEM_CD`;
      await request.query(query);
      return { success: true };
    }
    catch (err) {
      console.error("Error deleting income item:", err);
      throw err;
    }
  }

  // 상사 지출항목 수정 (환경설정)
  exports.updateExpenseItem = async ({ 
    agentId, 
    expdItemCd, 
    expdItemNm, 
    baseAmt, 
    sortSeq, 
    useYn, 
    userId 
  }) => {
    try {
      const request = pool.request();
      request.input("AGENT_ID", sql.VarChar, agentId);
      request.input("EXPD_ITEM_CD", sql.VarChar, expdItemCd);
      request.input("EXPD_ITEM_NM", sql.VarChar, expdItemNm);
      request.input("BASE_AMT", sql.Int, baseAmt);
      request.input("SORT_SEQ", sql.Int, sortSeq);
      request.input("USE_YN", sql.VarChar, useYn);
      request.input("REGR_ID", sql.VarChar, userId);
      request.input("MODR_ID", sql.VarChar, userId);
      const query = `UPDATE dbo.CJB_AGENT_EXPD_ITEM 
                        SET EXPD_ITEM_NM = @EXPD_ITEM_NM, 
                            BASE_AMT = @BASE_AMT, 
                            SORT_SEQ = @SORT_SEQ, 
                            USE_YN = @USE_YN, 
                            MOD_DTIME = GETDATE(), 
                            MODR_ID = @MODR_ID 
                      WHERE AGENT_ID = @AGENT_ID 
                        AND EXPD_ITEM_CD = @EXPD_ITEM_CD`;
      await request.query(query);
      return { success: true };
    } catch (err) {
      console.error("Error updating income item:", err);
      throw err;
    }
  }
  // 상사 수입항목 수정 (환경설정)
  exports.updateIncomeItem = async ({ 
    agentId,
    impItemCd,
    impItemNm,
    baseAmt,
    sortSeq,
    useYn,
    userId
  }) => {
    try {
      const request = pool.request();
      request.input("AGENT_ID", sql.VarChar, agentId);
      request.input("IMP_ITEM_CD", sql.VarChar, impItemCd);
      request.input("IMP_ITEM_NM", sql.VarChar, impItemNm);
      request.input("BASE_AMT", sql.Int, baseAmt);
      request.input("SORT_SEQ", sql.Int, sortSeq);
      request.input("USE_YN", sql.VarChar, useYn);
      request.input("REGR_ID", sql.VarChar, userId);
      request.input("MODR_ID", sql.VarChar, userId);
      const query = `UPDATE dbo.CJB_AGENT_IMP_ITEM 
                        SET IMP_ITEM_NM = @IMP_ITEM_NM, 
                            BASE_AMT = @BASE_AMT, 
                            SORT_SEQ = @SORT_SEQ, 
                            USE_YN = @USE_YN, 
                            MOD_DTIME = GETDATE(), 
                            MODR_ID = @MODR_ID 
                      WHERE AGENT_ID = @AGENT_ID 
                        AND IMP_ITEM_CD = @IMP_ITEM_CD`;
      await request.query(query);
      return { success: true };
    }
    catch (err) {
      console.error("Error updating income item:", err);
      throw err;
    }
  }






/**
 * 상사 지출, 수입 항목 등록 쿼리 
 * 
 * insert into dbo.cjb_agent_expd_item (agent_id, EXPD_ITEM_CD ,EXPD_ITEM_NM, BASE_AMT, USE_YN, SORT_SEQ , regr_id, modr_id)
select distinct '00011', code1, name, 0, 'Y', row_number() over (order by code1 asc) as sort, 'admin', 'admin'
  from dbo.SMJ_CODE sc 
  where agent = '00001'
  and code1 <> '###'
  and indexcd = '80'
  and code1 < '013'
  ;

insert into dbo.cjb_agent_imp_item (agent_id, IMP_ITEM_CD ,IMP_ITEM_NM, BASE_AMT, USE_YN, SORT_SEQ , regr_id, modr_id)
select distinct '00011', code1, name, 0, 'Y', row_number() over (order by code1 asc) as sort, 'admin', 'admin'
  from dbo.SMJ_CODE sc 
  where agent = '00001'
  and indexcd = '81'
  and code1 <> '###'
  and code1 < '023'
  ;

 */