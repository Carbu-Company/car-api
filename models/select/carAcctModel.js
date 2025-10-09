const sql = require("mssql");
const pool = require("../../config/db");


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 계좌 2.0
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 계좌 상세 내역 목록 조회 
exports.getCarAcctList = async ({ 
    carAgent, 
    page,
    pageSize,
    carNo,
    dealer,
    dtGubun,
    startDt,
    endDt, 
    dtlCustomerName,
    dtlCustGubun,
    dtlEvdcGubun,
    dtlPrsnGubun,
    dtlOwnerBrno,
    dtlOwnerSsn,
    dtlCtshNo,
    dtlCarNoBefore,
    orderItem = '제시일',
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
      console.log('dtlCustomerName:', dtlCustomerName);
      console.log('dtlCustGubun:', dtlCustGubun);
      console.log('dtlEvdcGubun:', dtlEvdcGubun);
      console.log('dtlPrsnGubun:', dtlPrsnGubun);
      console.log('dtlOwnerBrno:', dtlOwnerBrno);
      console.log('dtlOwnerSsn:', dtlOwnerSsn);
      console.log('dtlCtshNo:', dtlCtshNo);
      console.log('dtlCarNoBefore:', dtlCarNoBefore);
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
      if (dtlCustomerName) request.input("DTL_CUSTOMER_NAME", sql.VarChar, `%${dtlCustomerName}%`);
      if (dtlCustGubun) request.input("DTL_CUST_GUBUN", sql.VarChar, dtlCustGubun);
      if (dtlEvdcGubun) request.input("DTL_EVDC_GUBUN", sql.VarChar, dtlEvdcGubun);
      if (dtlPrsnGubun) request.input("DTL_PRSN_GUBUN", sql.VarChar, dtlPrsnGubun);
      if (dtlOwnerBrno) request.input("DTL_OWNER_BRNO", sql.VarChar, dtlOwnerBrno);
      if (dtlOwnerSsn) request.input("DTL_OWNER_SSN", sql.VarChar, dtlOwnerSsn);
      if (dtlCtshNo) request.input("DTL_CTSH_NO", sql.VarChar, dtlCtshNo);
      if (dtlCarNoBefore) request.input("DTL_CAR_NO_BEFORE", sql.VarChar, dtlCarNoBefore);
  
      // 전체 카운트 조회
      const countQuery = `
      SELECT COUNT(*) as totalCount
                FROM dbo.CJB_ACCT A
                   , dbo.CJB_ACCT_DTL B
                   , dbo.C
              WHERE B.ACCT_ID = A.ACCT_ID
                AND A.AGENT_ID = @CAR_AGENT
                AND A.USE_YN = 'Y'
                ${carNo ? "AND A.CAR_NO LIKE @CAR_NO" : ""}
                ${dealer ? "AND A.DLR_ID LIKE @DEALER" : ""}
                ${startDt ? "AND A.CAR_PUR_DT >= @START_DT" : ""}
                ${endDt ? "AND A.CAR_PUR_DT <= @END_DT" : ""}
                ${dtlCustomerName ? "AND A.OWNR_NM LIKE @DTL_CUSTOMER_NAME" : ""}
                ${dtlCustGubun ? "AND A.OWNR_TP_CD = @DTL_CUST_GUBUN" : ""}
                ${dtlEvdcGubun ? "AND A.PUR_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                ${dtlPrsnGubun ? "AND A.PRSN_SCT_CD = @DTL_PRSN_GUBUN" : ""}
                ${dtlOwnerBrno ? "AND A.OWNR_BRNO = @DTL_OWNER_BRNO" : ""}
                ${dtlOwnerSsn ? "AND A.OWNR_SSN = @DTL_OWNER_SSN" : ""}
                ${dtlCtshNo ? "AND A.CTSH_NO = @DTL_CTSH_NO" : ""}
                ${dtlCarNoBefore ? "AND A.PUR_BEF_CAR_NO = @DTL_CAR_NO_BEFORE" : ""}
      `;
    
      const dataQuery = `
                SELECT B.NTS_CONF_NO     -- 국세청 승인 번호
                    , B.TRADE_DT
                    , B.TRADE_SCT_NM     -- 거래 구분  (승인, 취소)
                    , B.TRADE_TP_NM      -- 거래 유형  (소득공제, 지출증빙)
                    , B.TRADE_AMT   -- 거래 금액
                    , B.RCGN_NO               -- 식별 번호
                    , B.CUST_NM               -- 고객명
                    , B.ORD_GOODS_NM          -- 주문 상품명(품명)
                    , B.GOODS_FEE_SEQ
                    , A.AGENT_ID
                    , A.CAR_REG_ID               
                    , A.CAR_STAT_CD             
                    , A.AGENT_ID                
                    , A.DLR_ID                  
                    , (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = A.DLR_ID) AS DLR_NM
                FROM dbo.CJB_CAR_PUR A
                   , dbo.CJB_CAR_SEL B
                   , dbo.CJB_CAR_SEL_BRK C
              WHERE B.CAR_REG_ID = A.CAR_REG_ID
                AND C.CAR_REG_ID = B.CAR_REG_ID
                AND A.AGENT_ID = @CAR_AGENT
                AND A.CAR_DEL_YN = 'N'
                AND B.CAR_STAT_CD = '003'   -- 알선판매
        ${carNo ? "AND A.CAR_NO LIKE @CAR_NO" : ""}
        ${dealer ? "AND A.DLR_ID LIKE @DEALER" : ""}
        ${startDt ? "AND A.CAR_PUR_DT >= @START_DT" : ""}
        ${endDt ? "AND A.CAR_PUR_DT <= @END_DT" : ""}
        ${dtlCustomerName ? "AND A.OWNR_NM LIKE @DTL_CUSTOMER_NAME" : ""}
        ${dtlCustGubun ? "AND A.OWNR_TP_CD = @DTL_CUST_GUBUN" : ""}
        ${dtlEvdcGubun ? "AND A.PUR_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
        ${dtlPrsnGubun ? "AND A.PRSN_SCT_CD = @DTL_PRSN_GUBUN" : ""}
        ${dtlOwnerBrno ? "AND A.OWNR_BRNO = @DTL_OWNER_BRNO" : ""}
        ${dtlOwnerSsn ? "AND A.OWNR_SSN = @DTL_OWNER_SSN" : ""}
        ${dtlCtshNo ? "AND A.CTSH_NO = @DTL_CTSH_NO" : ""}
        ${dtlCarNoBefore ? "AND A.PUR_BEF_CAR_NO = @DTL_CAR_NO_BEFORE" : ""}
      ORDER BY ${orderItem === '제시일' ? 'A.CAR_PUR_DT' : orderItem === '담당딜러' ? 'A.DLR_ID' : orderItem === '고객유형' ? 'A.OWNR_TP_CD' : orderItem} ${ordAscDesc}
      OFFSET (@PAGE - 1) * @PAGE_SIZE ROWS
      FETCH NEXT @PAGE_SIZE ROWS ONLY;`;
  
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
  
  // 현금영수증 합계 조회
  exports.getCarAcctSummary = async ({  
    carAgent, 
    page,
    pageSize,
    carNo,
    dealer,
    dtGubun,
    startDt,
    endDt, 
    dtlCustomerName,
    dtlCustGubun,
    dtlEvdcGubun,
    dtlPrsnGubun,
    dtlOwnerBrno,
    dtlOwnerSsn,
    dtlCtshNo,
    dtlCarNoBefore,
    orderItem = '제시일',
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
      console.log('dtlCustomerName:', dtlCustomerName);
      console.log('dtlCustGubun:', dtlCustGubun);
      console.log('dtlEvdcGubun:', dtlEvdcGubun);
      console.log('dtlPrsnGubun:', dtlPrsnGubun);
      console.log('dtlOwnerBrno:', dtlOwnerBrno);
      console.log('dtlOwnerSsn:', dtlOwnerSsn);
      console.log('dtlCtshNo:', dtlCtshNo);
      console.log('dtlCarNoBefore:', dtlCarNoBefore);
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
      if (dtlCustomerName) request.input("DTL_CUSTOMER_NAME", sql.VarChar, `%${dtlCustomerName}%`);
      if (dtlCustGubun) request.input("DTL_CUST_GUBUN", sql.VarChar, dtlCustGubun);
      if (dtlEvdcGubun) request.input("DTL_EVDC_GUBUN", sql.VarChar, dtlEvdcGubun);
      if (dtlPrsnGubun) request.input("DTL_PRSN_GUBUN", sql.VarChar, dtlPrsnGubun);
      if (dtlOwnerBrno) request.input("DTL_OWNER_BRNO", sql.VarChar, dtlOwnerBrno);
      if (dtlOwnerSsn) request.input("DTL_OWNER_SSN", sql.VarChar, dtlOwnerSsn);
      if (dtlCtshNo) request.input("DTL_CTSH_NO", sql.VarChar, dtlCtshNo);
      if (dtlCarNoBefore) request.input("DTL_CAR_NO_BEFORE", sql.VarChar, dtlCarNoBefore);
  
      const query = `SELECT '알선수수료' AS PRSN_SCT_CD
                            , COUNT(B.BRK_SEQ) CNT
                            , ISNULL(SUM(B.BRK_AMT), 0) BRK_AMT
                            , ISNULL(SUM(B.DEDT_AMT), 0) DEDT_AMT
                            , ISNULL(SUM(B.TAX_AMT), 0) TAX_AMT
                            , ISNULL(SUM(B.PAY_AMT), 0) PAY_AMT
                        FROM dbo.CJB_CAR_PUR A
                            , dbo.CJB_CAR_SEL B
                            , dbo.CJB_CAR_SEL_BRK C
                        WHERE B.CAR_REG_ID = A.CAR_REG_ID
                            AND C.CAR_REG_ID = B.CAR_REG_ID
                            AND A.AGENT_ID = @CAR_AGENT
                            AND A.CAR_DEL_YN = 'N'
                            AND B.CAR_STAT_CD = '003'   -- 알선판매
                ${carNo ? "AND A.CAR_NO LIKE @CAR_NO" : ""}
                ${dealer ? "AND A.DLR_ID LIKE @DEALER" : ""}
                ${startDt ? "AND A.CAR_PUR_DT >= @START_DT" : ""}
                ${endDt ? "AND A.CAR_PUR_DT <= @END_DT" : ""}
                ${dtlCustomerName ? "AND A.OWNR_NM LIKE @DTL_CUSTOMER_NAME" : ""}
                ${dtlCustGubun ? "AND A.OWNR_TP_CD = @DTL_CUST_GUBUN" : ""}
                ${dtlEvdcGubun ? "AND A.PUR_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                ${dtlPrsnGubun ? "AND A.PRSN_SCT_CD = @DTL_PRSN_GUBUN" : ""}
                ${dtlOwnerBrno ? "AND A.OWNR_BRNO = @DTL_OWNER_BRNO" : ""}
                ${dtlOwnerSsn ? "AND A.OWNR_SSN = @DTL_OWNER_SSN" : ""}
                ${dtlCtshNo ? "AND A.CTSH_NO = @DTL_CTSH_NO" : ""}
                ${dtlCarNoBefore ? "AND A.PUR_BEF_CAR_NO = @DTL_CAR_NO_BEFORE" : ""}
                      UNION ALL
                        SELECT '알선수익금' AS PRSN_SCT_CD
                            , COUNT(B.CASH_MGMTKEY) CNT
                            , ISNULL(SUM(B.TRADE_AMT), 0) TRADE_AMT
                            , ISNULL(SUM(B.SUP_PRC), 0) SUP_PRC
                            , ISNULL(SUM(B.VAT), 0) VAT
                        FROM dbo.CJB_CAR_PUR A
                            , dbo.CJB_CAR_SEL B
                            , dbo.CJB_CAR_SEL_BRK C
                        WHERE B.CAR_REG_ID = A.CAR_REG_ID
                            AND C.CAR_REG_ID = B.CAR_REG_ID
                            AND A.AGENT_ID = @CAR_AGENT
                            AND A.CAR_DEL_YN = 'N'
                            AND B.CAR_STAT_CD = '003'   -- 알선판매
                ${carNo ? "AND A.CAR_NO LIKE @CAR_NO" : ""}
                ${dealer ? "AND A.DLR_ID LIKE @DEALER" : ""}
                ${startDt ? "AND A.CAR_PUR_DT >= @START_DT" : ""}
                ${endDt ? "AND A.CAR_PUR_DT <= @END_DT" : ""}
                ${dtlCustomerName ? "AND A.OWNR_NM LIKE @DTL_CUSTOMER_NAME" : ""}
                ${dtlCustGubun ? "AND A.OWNR_TP_CD = @DTL_CUST_GUBUN" : ""}
                ${dtlEvdcGubun ? "AND A.PUR_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                ${dtlPrsnGubun ? "AND A.PRSN_SCT_CD = @DTL_PRSN_GUBUN" : ""}
                ${dtlOwnerBrno ? "AND A.OWNR_BRNO = @DTL_OWNER_BRNO" : ""}
                ${dtlOwnerSsn ? "AND A.OWNR_SSN = @DTL_OWNER_SSN" : ""}
                ${dtlCtshNo ? "AND A.CTSH_NO = @DTL_CTSH_NO" : ""}
                ${dtlCarNoBefore ? "AND A.PUR_BEF_CAR_NO = @DTL_CAR_NO_BEFORE" : ""}
                      UNION ALL
                      SELECT '합계' AS PRSN_SCT_CD
                          , COUNT(B.CASH_MGMTKEY) CNT
                          , ISNULL(SUM(B.TRADE_AMT), 0) TRADE_AMT
                          , ISNULL(SUM(B.SUP_PRC), 0) SUP_PRC
                          , ISNULL(SUM(B.VAT), 0) VAT
                        FROM dbo.CJB_CAR_PUR A
                            , dbo.CJB_CAR_SEL B
                            , dbo.CJB_CAR_SEL_BRK C
                        WHERE B.CAR_REG_ID = A.CAR_REG_ID
                            AND C.CAR_REG_ID = B.CAR_REG_ID
                            AND A.AGENT_ID = @CAR_AGENT
                            AND A.CAR_DEL_YN = 'N'
                            AND B.CAR_STAT_CD = '003'   -- 알선판매
                ${carNo ? "AND A.CAR_NO LIKE @CAR_NO" : ""}
                ${dealer ? "AND A.DLR_ID LIKE @DEALER" : ""}
                ${startDt ? "AND A.CAR_PUR_DT >= @START_DT" : ""}
                ${endDt ? "AND A.CAR_PUR_DT <= @END_DT" : ""}
                ${dtlCustomerName ? "AND A.OWNR_NM LIKE @DTL_CUSTOMER_NAME" : ""}
                ${dtlCustGubun ? "AND A.OWNR_TP_CD = @DTL_CUST_GUBUN" : ""}
                ${dtlEvdcGubun ? "AND A.PUR_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                ${dtlPrsnGubun ? "AND A.PRSN_SCT_CD = @DTL_PRSN_GUBUN" : ""}
                ${dtlOwnerBrno ? "AND A.OWNR_BRNO = @DTL_OWNER_BRNO" : ""}
                ${dtlOwnerSsn ? "AND A.OWNR_SSN = @DTL_OWNER_SSN" : ""}
                ${dtlCtshNo ? "AND A.CTSH_NO = @DTL_CTSH_NO" : ""}
                ${dtlCarNoBefore ? "AND A.PUR_BEF_CAR_NO = @DTL_CAR_NO_BEFORE" : ""}
        `;
  
      const result = await request.query(query);
      return result.recordset;
    } catch (err) {
      console.error("Error fetching car pur sum:", err);
      throw err;
    }
  };
  
  // 현금영수증 상세 조회
  exports.getCarAcctDetail = async ({ car_regid }) => {
    try {
      const request = pool.request();
      request.input("CAR_REGID", sql.VarChar, car_regid);   
  
      const query = `SELECT A.BNK_CD
                          , A.ACCT_NO
                          , A.ACCT_NM
                          , A.MAST_YN
                          , B.TID
                          , B.TRADE_DT
                          , B.TRADE_SN
                          , B.TRADE_DTIME
                          , B.IAMT
                          , B.OAMT
                          , B.BLNC
                          , B.NOTE1
                        FROM dbo.CJB_ACCT A
                           , dbo.CJB_ACCT_DTL B
                        WHERE A.ACCT_NO = B.ACCT_NO
                          AND A.USE_YN = 'Y'   
                          AND A.ACCT_NO = @ACCT_NO `;
  
      console.log('query:', query);
  
      const result = await request.query(query);
      return result.recordset[0];
    } catch (err) {
      console.error("Error fetching car pur detail:", err);
      throw err;
    }
  };

