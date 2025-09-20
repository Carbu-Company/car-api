const sql = require("mssql");
const pool = require("../../config/db");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 재고금융 2.0
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// 재고금융 리스트 조회 
exports.getCarLoanList = async ({   carAgent, 
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
    ordAscDesc = 'desc' }) => {
    try {
      const request = pool.request();
      request.input("CAR_AGENT", sql.VarChar, carAgent);
      request.input("PAGE", sql.Int, page);
      request.input("PAGESIZE", sql.Int, pageSize);
  
      if (carNo) request.input("CAR_NO", sql.VarChar, carNo);
      if (dealer) request.input("DEALER", sql.VarChar, dealer);
      if (startDt) request.input("START_DT", sql.VarChar, startDt);
      if (endDt) request.input("END_DT", sql.VarChar, endDt);
      if (dtlCustomerName) request.input("DTL_CUSTOMER_NAME", sql.VarChar, dtlCustomerName);
      if (dtlCustGubun) request.input("DTL_CUST_GUBUN", sql.VarChar, dtlCustGubun);
      if (dtlEvdcGubun) request.input("DTL_EVDC_GUBUN", sql.VarChar, dtlEvdcGubun);
      if (dtlPrsnGubun) request.input("DTL_PRSN_GUBUN", sql.VarChar, dtlPrsnGubun);
      if (dtlOwnerBrno) request.input("DTL_OWNER_BRNO", sql.VarChar, dtlOwnerBrno);
      if (dtlOwnerSsn) request.input("DTL_OWNER_SSN", sql.VarChar, dtlOwnerSsn);
      if (dtlCtshNo) request.input("DTL_CTSH_NO", sql.VarChar, dtlCtshNo);
      if (dtlCarNoBefore) request.input("DTL_CAR_NO_BEFORE", sql.VarChar, dtlCarNoBefore);
  
      // 전체 카운트 조회
      const countQuery = `SELECT COUNT(*) as totalCount
                            FROM dbo.CJB_CAR_PUR A, dbo.CJB_GOODS_FEE B
                            WHERE A.CAR_REG_ID = B.CAR_REG_ID
                                AND A.AGENT_ID = @CAR_AGENT
                                AND A.CAR_DEL_YN = 'N'
                                AND B.DEL_YN = 'N'
                ${carNo ? "AND CAR_NO LIKE @CAR_NO" : ""}
                ${dealer ? "AND DLR_ID LIKE @DEALER" : ""}
                ${startDt ? "AND CAR_PUR_DT >= @START_DT" : ""}
                ${endDt ? "AND CAR_PUR_DT <= @END_DT" : ""}
                ${dtlCustomerName ? "AND OWNR_NM LIKE @DTL_CUSTOMER_NAME" : ""}
                ${dtlCustGubun ? "AND OWNR_TP_CD = @DTL_CUST_GUBUN" : ""}
                ${dtlEvdcGubun ? "AND PUR_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                ${dtlPrsnGubun ? "AND PRSN_SCT_CD = @DTL_PRSN_GUBUN" : ""}
                ${dtlOwnerBrno ? "AND OWNR_BRNO = @DTL_OWNER_BRNO" : ""}
                ${dtlOwnerSsn ? "AND OWNR_SSN = @DTL_OWNER_SSN" : ""}
                ${dtlCtshNo ? "AND CTSH_NO = @DTL_CTSH_NO" : ""}
                ${dtlCarNoBefore ? "AND PUR_BEF_CAR_NO = @DTL_CAR_NO_BEFORE" : ""}
      `;
  
      const dataQuery = `SELECT B.GOODS_FEE_SEQ,           
                                A.DLR_ID DLR_ID,     
                                (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = A.DLR_ID) AS DLR_NM,    -- 딜러 명
                                A.CAR_REG_ID,
                                A.CAR_NO,         -- 차량번호
                                A.CAR_NM,         -- 차량명
                                B.EXPD_ITEM_CD,
                                B.EXPD_ITEM_NM,   -- 비용항목
                                B.EXPD_SCT_CD,
                                CASE WHEN B.EXPD_SCT_CD = '0' THEN '딜러' 
                                      ELSE '상사' END AS EXPD_SCT_NM,     -- 치출구분
                                B.TAX_SCT_CD,
                                CASE WHEN B.TAX_SCT_CD =  '0' THEN '과세' 
                                      ELSE '비과세' END AS TAX_SCT_NM,        -- 과세구분
                                B.EXPD_SUP_PRC,       -- 공급가
                                B.EXPD_VAT,           -- 부가세
                                B.EXPD_AMT,           -- 금액    
                                B.EXPD_DT,            -- 결제일
                                B.EXPD_EVDC_CD,
                                dbo.CJB_FN_GET_CD_NM('07', B.EXPD_EVDC_CD) AS EXPD_EVDC_NM,    -- 지출증빙
                                B.RMRK,            -- 비고
                                B.ADJ_INCLUS_YN,   -- 정산 포함 여부 
                                B.EXPD_METH_CD,
                                dbo.CJB_FN_GET_CD_NM('06', B.EXPD_METH_CD) AS EXPD_METH_NM,
                                B.TXBL_ISSU_DT,
                                B.CASH_RECPT_RCGN_NO,
                                B.CASH_MGMTKEY,
                                B.REG_DTIME,
                                B.REGR_ID,
                                B.MOD_DTIME,
                                B.MODR_ID
                      FROM dbo.CJB_CAR_PUR A, dbo.CJB_GOODS_FEE B
                      WHERE A.CAR_REG_ID = B.CAR_REG_ID
                          AND A.AGENT_ID = @CAR_AGENT
                          AND A.CAR_DEL_YN = 'N'
                          AND B.DEL_YN = 'N'
                ${carNo ? "AND CAR_NO LIKE @CAR_NO" : ""}
                ${dealer ? "AND DLR_ID LIKE @DEALER" : ""}
                ${startDt ? "AND CAR_PUR_DT >= @START_DT" : ""}
                ${endDt ? "AND CAR_PUR_DT <= @END_DT" : ""}
                ${dtlCustomerName ? "AND OWNR_NM LIKE @DTL_CUSTOMER_NAME" : ""}
                ${dtlCustGubun ? "AND OWNR_TP_CD = @DTL_CUST_GUBUN" : ""}
                ${dtlEvdcGubun ? "AND PUR_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                ${dtlPrsnGubun ? "AND PRSN_SCT_CD = @DTL_PRSN_GUBUN" : ""}
                ${dtlOwnerBrno ? "AND OWNR_BRNO = @DTL_OWNER_BRNO" : ""}
                ${dtlOwnerSsn ? "AND OWNR_SSN = @DTL_OWNER_SSN" : ""}
                ${dtlCtshNo ? "AND CTSH_NO = @DTL_CTSH_NO" : ""}
                ${dtlCarNoBefore ? "AND PUR_BEF_CAR_NO = @DTL_CAR_NO_BEFORE" : ""}
                      ORDER BY ${orderItem} ${ordAscDesc}
                      OFFSET (@PAGE - 1) * @PAGESIZE ROWS
                      FETCH NEXT @PAGESIZE ROWS ONLY
                      `;
  
      // 두 쿼리를 동시에 실행
      const [countResult, dataResult] = await Promise.all([
        request.query(countQuery),
        request.query(dataQuery)
      ]);
  
      const totalCount = countResult.recordset[0].totalCount;
      const totalPages = Math.ceil(totalCount / pageSize);
  
      return {
        data: dataResult.recordset,
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
      console.error("Error fetching goods fee list:", err);
      throw err;
    }
  }
  
  
  // 재고금융 차량별 리스트 조회
  exports.getCarLoanCarSumList = async ({ 
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
      request.input("CAR_AGENT", sql.VarChar, carAgent);
      request.input("PAGE", sql.Int, page);
      request.input("PAGESIZE", sql.Int, pageSize);
  
      if (carNo) request.input("CAR_NO", sql.VarChar, carNo);
      if (dealer) request.input("DEALER", sql.VarChar, dealer);
      if (startDt) request.input("START_DT", sql.VarChar, startDt);
      if (endDt) request.input("END_DT", sql.VarChar, endDt);
      if (dtlCustomerName) request.input("DTL_CUSTOMER_NAME", sql.VarChar, dtlCustomerName);
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
                        FROM dbo.CJB_CAR_PUR A, dbo.CJB_GOODS_FEE B
                        WHERE A.CAR_REG_ID = B.CAR_REG_ID
                            AND A.AGENT_ID = @CAR_AGENT
                            AND A.CAR_DEL_YN = 'N'
                            AND B.DEL_YN = 'N'
                ${carNo ? "AND CAR_NO LIKE @CAR_NO" : ""}
                ${dealer ? "AND DLR_ID LIKE @DEALER" : ""}
                ${startDt ? "AND CAR_PUR_DT >= @START_DT" : ""}
                ${endDt ? "AND CAR_PUR_DT <= @END_DT" : ""}
                ${dtlCustomerName ? "AND OWNR_NM LIKE @DTL_CUSTOMER_NAME" : ""}
                ${dtlCustGubun ? "AND OWNR_TP_CD = @DTL_CUST_GUBUN" : ""}
                ${dtlEvdcGubun ? "AND PUR_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                ${dtlPrsnGubun ? "AND PRSN_SCT_CD = @DTL_PRSN_GUBUN" : ""}
                ${dtlOwnerBrno ? "AND OWNR_BRNO = @DTL_OWNER_BRNO" : ""}
                ${dtlOwnerSsn ? "AND OWNR_SSN = @DTL_OWNER_SSN" : ""}
                ${dtlCtshNo ? "AND CTSH_NO = @DTL_CTSH_NO" : ""}
                ${dtlCarNoBefore ? "AND PUR_BEF_CAR_NO = @DTL_CAR_NO_BEFORE" : ""}
      `;
  
      const query = `SELECT B.CAR_REG_ID, 
                            MIN(A.DLR_ID) DLR_ID,
                            (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = MIN(A.DLR_ID)) AS DLR_NM,
                            MIN(A.CAR_NM) CAR_NM,
                            MIN(A.CAR_NO) CAR_NO,
                            COUNT(B.CAR_REG_ID) CNT,
                            SUM(B.EXPD_AMT) AS EXPD_AMT,
                            SUM(B.EXPD_SUP_PRC) AS EXPD_SUP_PRC,
                            SUM(B.EXPD_VAT) AS EXPD_VAT
                      FROM dbo.CJB_CAR_PUR A
                         , dbo.CJB_GOODS_FEE B
                    WHERE 1 = 1
                      AND A.AGENT_ID = @CAR_AGENT
                      AND A.CAR_REG_ID = B.CAR_REG_ID
                      AND A.CAR_DEL_YN = 'N'
                      AND B.DEL_YN = 'N'
                ${carNo ? "AND CAR_NO LIKE @CAR_NO" : ""}
                ${dealer ? "AND DLR_ID LIKE @DEALER" : ""}
                ${startDt ? "AND CAR_PUR_DT >= @START_DT" : ""}
                ${endDt ? "AND CAR_PUR_DT <= @END_DT" : ""}
                ${dtlCustomerName ? "AND OWNR_NM LIKE @DTL_CUSTOMER_NAME" : ""}
                ${dtlCustGubun ? "AND OWNR_TP_CD = @DTL_CUST_GUBUN" : ""}
                ${dtlEvdcGubun ? "AND PUR_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                ${dtlPrsnGubun ? "AND PRSN_SCT_CD = @DTL_PRSN_GUBUN" : ""}
                ${dtlOwnerBrno ? "AND OWNR_BRNO = @DTL_OWNER_BRNO" : ""}
                ${dtlOwnerSsn ? "AND OWNR_SSN = @DTL_OWNER_SSN" : ""}
                ${dtlCtshNo ? "AND CTSH_NO = @DTL_CTSH_NO" : ""}
                ${dtlCarNoBefore ? "AND PUR_BEF_CAR_NO = @DTL_CAR_NO_BEFORE" : ""}
                      GROUP BY B.CAR_REG_ID
                    ;`; 
  
      const [countResult, dataResult] = await Promise.all([
        request.query(countQuery),
        request.query(query)
      ]);
  
      const totalCount = countResult.recordset[0].totalCount;
      const totalPages = Math.ceil(totalCount / pageSize);  
  
      return {
        data: dataResult.recordset,
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
      console.error("Error fetching goods fee car sum list:", err);
      throw err;
    }
  };
  
  
  
  // 재고금융 차량별 리스트 조회
  exports.getCarLoanSummary= async ({ carAgent }) => {
    try {
      const request = pool.request();
      request.input("CAR_AGENT", sql.VarChar, carAgent);
  
      // 기본 목록 조회
      const query = `SELECT B.LOAN_CORP_CD, 
                               B.LOAN_CORP_NM,       -- 캐피탈사사
                               B.TOT_LMT_AMT,        -- 총 대출한도액
                               B.TOT_LOAN_AMT,       -- 총 대출액
                               (TOT_LMT_AMT - TOT_LOAN_AMT) AS LMT_AMT, -- 남은 한도액
                               (TOT_LOAN_AMT/TOT_LMT_AMT) * 100 AS RT, -- 사용률률
                               B.TOT_CNT,            -- 총 실행건수
                               B.RCNT_UTIL_DT,       -- 최근 사용일
                               B.RPY_FCST_DT,        -- 이자납입일일
                               C.CAR_NO, 
                               C.CAR_NM , 
                               C.DLR_NM ,
                               C.LOAN_DT 
                      FROM dbo.CJB_AGENT_LOAN_CORP B
                 LEFT JOIN (SELECT K.CAR_REG_ID
                                , K.CAR_NO 
                                , K.CAR_NM 
                                , K.DLR_NM 
                                , K.LOAN_DT 
                                , K.AGENT_ID
                                , K.LOAN_CORP_CD
                              FROM (SELECT  ROW_NUMBER() OVER(PARTITION BY B.LOAN_CORP_CD ORDER BY B.LOAN_DT DESC) AS RN
                                    , C.CAR_NO
                                    , C.CAR_NM
                                    , (SELECT USR_ID FROM dbo.CJB_USR X WHERE X.USR_ID = C.DLR_ID) AS DLR_NM
                                    , B.LOAN_DT
                                    , A.AGENT_ID 
                                    , A.LOAN_CORP_CD
                                    , B.CAR_REG_ID
                                  FROM dbo.CJB_AGENT_LOAN_CORP A
                                  LEFT JOIN dbo.CJB_CAR_LOAN B ON (A.AGENT_ID = B.AGENT_ID AND A.LOAN_CORP_CD = B.LOAN_CORP_CD)
                                  LEFT JOIN dbo.CJB_CAR_PUR C  ON (B.CAR_REG_ID = C.CAR_REG_ID)
                                WHERE A.AGENT_ID = @CAR_AGENT ) K
                            WHERE K.RN = 1) C
                    ON ( B.AGENT_ID = C.AGENT_ID AND B.LOAN_CORP_CD = C.LOAN_CORP_CD )
      `;
  
      const result = await request.query(query);
      return result.recordset;  
  
    } catch (err) {
      console.error("Error fetching car loan car sum list:", err);
      throw err;
    }
  };
  
  