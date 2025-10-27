const sql = require("mssql");
const pool = require("../../config/db");
const carCustModel = require("../../models/select/carCustModel");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 매도 2.0
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// 차량 판매매도 목록 조회
exports.getCarSelList = async ({ 
    agentId, 
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
    dtlPurStatGubun, 
    orderItem = '제시일',
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
      request.input("CAR_AGENT", sql.VarChar, agentId);
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
      if (dtlPurStatGubun) request.input("DTL_PUR_STAT_GUBUN", sql.VarChar, dtlPurStatGubun);

      // 전체 카운트 조회
      const countQuery = `
            SELECT COUNT(*) as totalCount
                FROM dbo.CJB_CAR_PUR A
                    , dbo.CJB_CAR_SEL B
                WHERE A.CAR_REG_ID = B.CAR_REG_ID
                  AND A.AGENT_ID = @CAR_AGENT
                  AND A.CAR_DEL_YN = 'N'
                  AND A.CAR_STAT_CD IN ('002', '003')     --- 일반판매, 알선판매매
                ${carNo ? "AND A.CAR_NO LIKE @CAR_NO" : ""}
                ${dealer ? "AND B.DLR_ID LIKE @DEALER" : ""}
                ${dtGubun === '01' ? "AND B.CAR_SALE_DT >= @START_DT AND B.CAR_SALE_DT <= @END_DT" : 
                  dtGubun === '02' ? "AND B.SALE_REG_DT >= @START_DT AND B.SALE_REG_DT <= @END_DT" :
                  dtGubun === '03' ? "AND B.ADJ_FIN_DT >= @START_DT AND B.ADJ_FIN_DT <= @END_DT" :
                  dtGubun === '04' ? "AND A.CAR_PUR_DT >= @START_DT AND A.CAR_PUR_DT <= @END_DT" : ""}
                ${dtlCustomerName ? "AND OWNR_NM LIKE @DTL_CUSTOMER_NAME" : ""}   -- 소유자 이름
                ${dtlCustGubun ? "AND OWNR_TP_CD = @DTL_CUST_GUBUN" : ""}     -- 고객유형
                ${dtlEvdcGubun ? "AND PUR_EVDC_CD = @DTL_EVDC_GUBUN" : ""}    -- 매출증빙 구분 (현금영수증,...)
                ${dtlPrsnGubun ? "AND PRSN_SCT_CD = @DTL_PRSN_GUBUN" : ""}   -- 제시구분 (상사매입, 고객위탁)
                ${dtlOwnerBrno ? "AND OWNR_BRNO = @DTL_OWNER_BRNO" : ""}       -- 소유자 사업자번호
                ${dtlOwnerSsn ? "AND OWNR_SSN = @DTL_OWNER_SSN" : ""}           -- 소유자 주민번호
                ${dtlCtshNo ? "AND CTSH_NO = @DTL_CTSH_NO" : ""}                  -- 계약서 번호
                ${dtlCarNoBefore ? "AND PUR_BEF_CAR_NO = @DTL_CAR_NO_BEFORE" : ""} -- 이전 차량번호
                ${dtlPurStatGubun ? "AND CAR_DEL_YN = @DTL_PUR_STAT_GUBUN" : ""}    -- 차량 삭제 여부
                     ;`;

      const dataQuery = `SELECT A.CAR_REG_ID
                    , A.CAR_STAT_CD     -- 차량 상태 코드
                    , dbo.CJB_FN_GET_CD_NM('01', A.CAR_STAT_CD) CAR_STAT_NM
                    , B.SALE_TP_CD      -- 판매유형코드 
                    , dbo.CJB_FN_GET_CD_NM('03', B.SALE_TP_CD) SALE_TP_NM
                    , (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = B.DLR_ID) AS SEL_DLR_NM
                    , B.BUYER_NM        -- 매입자명 
                    , B.SALE_AMT        -- 매도 금액
                    , B.AGENT_SEL_COST  -- 상사 매도 비용
                    , B.PERF_INFE_AMT   -- 성능 보험료 금액
                    , B.CAR_SALE_DT     -- 차량 판매 일자 
                    , B.SALE_REG_DT     -- 매출 등록 일자
                    , A.CAR_NO          -- 차량번호
                    , A.CAR_NM          -- 차량명
                    , A.CAR_PUR_DT      -- 차량구매일
                    , A.DLR_ID
                    , (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = A.DLR_ID) AS DLR_NM
                    , A.PUR_AMT         -- 차량구매금액
                    , B.ADJ_FIN_DT      -- 정산일
                FROM dbo.CJB_CAR_PUR A
                    , dbo.CJB_CAR_SEL B
                WHERE A.CAR_REG_ID = B.CAR_REG_ID
                  AND A.AGENT_ID = @CAR_AGENT
                  AND A.CAR_DEL_YN = 'N'
                  AND A.CAR_STAT_CD IN ('002', '003')     --- 일반판매, 알선판매매
                  ${carNo ? "AND A.CAR_NO LIKE @CAR_NO" : ""}
                  ${dealer ? "AND DLR_ID LIKE @DEALER" : ""}
                  ${dtGubun === '01' ? "AND B.CAR_SALE_DT >= @START_DT AND B.CAR_SALE_DT <= @END_DT" : 
                    dtGubun === '02' ? "AND B.SALE_REG_DT >= @START_DT AND B.SALE_REG_DT <= @END_DT" :
                    dtGubun === '03' ? "AND B.ADJ_FIN_DT >= @START_DT AND B.ADJ_FIN_DT <= @END_DT" :
                    dtGubun === '04' ? "AND A.CAR_PUR_DT >= @START_DT AND A.CAR_PUR_DT <= @END_DT" : ""}
                  ${dtlCustomerName ? "AND OWNR_NM LIKE @DTL_CUSTOMER_NAME" : ""}   -- 소유자 이름
                  ${dtlCustGubun ? "AND OWNR_TP_CD = @DTL_CUST_GUBUN" : ""}     -- 고객유형
                  ${dtlEvdcGubun ? "AND PUR_EVDC_CD = @DTL_EVDC_GUBUN" : ""}    -- 매출증빙 구분 (현금영수증,...)
                  ${dtlPrsnGubun ? "AND PRSN_SCT_CD = @DTL_PRSN_GUBUN" : ""}   -- 제시구분 (상사매입, 고객위탁)
                  ${dtlOwnerBrno ? "AND OWNR_BRNO = @DTL_OWNER_BRNO" : ""}       -- 소유자 사업자번호
                  ${dtlOwnerSsn ? "AND OWNR_SSN = @DTL_OWNER_SSN" : ""}           -- 소유자 주민번호
                  ${dtlCtshNo ? "AND CTSH_NO = @DTL_CTSH_NO" : ""}                  -- 계약서 번호
                  ${dtlCarNoBefore ? "AND PUR_BEF_CAR_NO = @DTL_CAR_NO_BEFORE" : ""} -- 이전 차량번호
                  ${dtlPurStatGubun ? "AND CAR_DEL_YN = @DTL_PUR_STAT_GUBUN" : ""}    -- 차량 삭제 여부
                ORDER BY ${orderItem === '제시일' ? 'CAR_PUR_DT' : orderItem === '담당딜러' ? 'DLR_ID' : orderItem === '고객유형' ? 'OWNR_TP_CD' : orderItem} ${ordAscDesc}
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
      console.error("Error fetching suggest list:", err);
      throw err;
    }
  };
  
 
  // 제시 차량 합계 조회
  exports.getCarSelSummary = async ({  
    agentId, 
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
    dtlPurStatGubun,
    orderItem = '제시일',
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
      console.log('dtlCustomerName:', dtlCustomerName);
      console.log('dtlCustGubun:', dtlCustGubun);
      console.log('dtlEvdcGubun:', dtlEvdcGubun);
      console.log('dtlPrsnGubun:', dtlPrsnGubun);
      console.log('dtlOwnerBrno:', dtlOwnerBrno);
      console.log('dtlOwnerSsn:', dtlOwnerSsn);
      console.log('dtlCtshNo:', dtlCtshNo);
      console.log('dtlCarNoBefore:', dtlCarNoBefore);
      console.log('dtlPurStatGubun:', dtlPurStatGubun);
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
      if (dtlCustomerName) request.input("DTL_CUSTOMER_NAME", sql.VarChar, `%${dtlCustomerName}%`);
      if (dtlCustGubun) request.input("DTL_CUST_GUBUN", sql.VarChar, dtlCustGubun);
      if (dtlEvdcGubun) request.input("DTL_EVDC_GUBUN", sql.VarChar, dtlEvdcGubun);
      if (dtlPrsnGubun) request.input("DTL_PRSN_GUBUN", sql.VarChar, dtlPrsnGubun);
      if (dtlOwnerBrno) request.input("DTL_OWNER_BRNO", sql.VarChar, dtlOwnerBrno);
      if (dtlOwnerSsn) request.input("DTL_OWNER_SSN", sql.VarChar, dtlOwnerSsn);
      if (dtlCtshNo) request.input("DTL_CTSH_NO", sql.VarChar, dtlCtshNo);
      if (dtlCarNoBefore) request.input("DTL_CAR_NO_BEFORE", sql.VarChar, dtlCarNoBefore);  
      if (dtlPurStatGubun) request.input("DTL_PUR_STAT_GUBUN", sql.VarChar, dtlPurStatGubun);

      const query = `SELECT '상사매입' PRSN_SCT_NM
                          , COUNT(A.CAR_REG_ID) CNT
                          , ISNULL(SUM(A.PUR_AMT), 0) PUR_AMT
                          , ISNULL(SUM(A.CAR_LOAN_AMT), 0) CAR_LOAN_AMT
                          , ISNULL(SUM(B.SALE_AMT), 0) SALE_AMT
                          , ISNULL(SUM(B.AGENT_SEL_COST), 0) AGENT_SEL_COST
                          , ISNULL(SUM(B.PERF_INFE_AMT), 0) PERF_INFE_AMT
                      FROM dbo.CJB_CAR_PUR A
                          , dbo.CJB_CAR_SEL B
                      WHERE A.CAR_REG_ID = B.CAR_REG_ID
                        AND A.AGENT_ID = '00011'
                        AND A.CAR_DEL_YN = 'N'
                        AND A.CAR_STAT_CD IN ('002', '003')     --- 일반판매, 알선판매
                        AND PRSN_SCT_CD = '0'  -- 상사매입
                          ${carNo ? "AND CAR_NO LIKE @CAR_NO" : ""}
                          ${dealer ? "AND DLR_ID LIKE @DEALER" : ""}
                          ${dtGubun === '01' ? "AND CAR_SALE_DT >= @START_DT AND CAR_SALE_DT <= @END_DT" : 
                            dtGubun === '02' ? "AND SALE_REG_DT >= @START_DT AND SALE_REG_DT <= @END_DT" :
                            dtGubun === '03' ? "AND ADJ_FIN_DT >= @START_DT AND ADJ_FIN_DT <= @END_DT" :
                            dtGubun === '04' ? "AND CAR_PUR_DT >= @START_DT AND CAR_PUR_DT <= @END_DT" : ""}
                          ${endDt ? "AND CAR_PUR_DT <= @END_DT" : ""}
                          ${dtlCustomerName ? "AND OWNR_NM LIKE @DTL_CUSTOMER_NAME" : ""}   -- 소유자 이름
                          ${dtlCustGubun ? "AND OWNR_TP_CD = @DTL_CUST_GUBUN" : ""}     -- 고객유형
                          ${dtlEvdcGubun ? "AND PUR_EVDC_CD = @DTL_EVDC_GUBUN" : ""}    -- 매출증빙 구분 (현금영수증,...)
                          ${dtlPrsnGubun ? "AND PRSN_SCT_CD = @DTL_PRSN_GUBUN" : ""}   -- 제시구분 (상사매입, 고객위탁)
                          ${dtlOwnerBrno ? "AND OWNR_BRNO = @DTL_OWNER_BRNO" : ""}       -- 소유자 사업자번호
                          ${dtlOwnerSsn ? "AND OWNR_SSN = @DTL_OWNER_SSN" : ""}           -- 소유자 주민번호
                          ${dtlCtshNo ? "AND CTSH_NO = @DTL_CTSH_NO" : ""}                  -- 계약서 번호
                          ${dtlCarNoBefore ? "AND PUR_BEF_CAR_NO = @DTL_CAR_NO_BEFORE" : ""} -- 이전 차량번호
                          ${dtlPurStatGubun ? "AND CAR_DEL_YN = @DTL_PUR_STAT_GUBUN" : ""}    -- 차량 삭제 여부
                      UNION ALL
                     SELECT '고객위탁' PRSN_SCT_NM
                          , COUNT(A.CAR_REG_ID) CNT
                          , ISNULL(SUM(A.PUR_AMT), 0) PUR_AMT
                          , ISNULL(SUM(A.CAR_LOAN_AMT), 0) CAR_LOAN_AMT
                          , ISNULL(SUM(B.SALE_AMT), 0) SALE_AMT
                          , ISNULL(SUM(B.AGENT_SEL_COST), 0) AGENT_SEL_COST
                          , ISNULL(SUM(B.PERF_INFE_AMT), 0) PERF_INFE_AMT
                      FROM dbo.CJB_CAR_PUR A
                          , dbo.CJB_CAR_SEL B
                      WHERE A.CAR_REG_ID = B.CAR_REG_ID
                        AND A.AGENT_ID = '00011'
                        AND A.CAR_DEL_YN = 'N'
                        AND A.CAR_STAT_CD IN ('002', '003')     --- 일반판매, 알선판매매
                        AND PRSN_SCT_CD = '1'  -- 고객위탁 
                          ${carNo ? "AND CAR_NO LIKE @CAR_NO" : ""}
                          ${dealer ? "AND DLR_ID LIKE @DEALER" : ""}
                          ${dtGubun === '01' ? "AND CAR_SALE_DT >= @START_DT AND CAR_SALE_DT <= @END_DT" : 
                            dtGubun === '02' ? "AND SALE_REG_DT >= @START_DT AND SALE_REG_DT <= @END_DT" :
                            dtGubun === '03' ? "AND ADJ_FIN_DT >= @START_DT AND ADJ_FIN_DT <= @END_DT" :
                            dtGubun === '04' ? "AND CAR_PUR_DT >= @START_DT AND CAR_PUR_DT <= @END_DT" : ""}
                          ${endDt ? "AND CAR_PUR_DT <= @END_DT" : ""}
                          ${dtlCustomerName ? "AND OWNR_NM LIKE @DTL_CUSTOMER_NAME" : ""}   -- 소유자 이름
                          ${dtlCustGubun ? "AND OWNR_TP_CD = @DTL_CUST_GUBUN" : ""}     -- 고객유형
                          ${dtlEvdcGubun ? "AND PUR_EVDC_CD = @DTL_EVDC_GUBUN" : ""}    -- 매출증빙 구분 (현금영수증,...)
                          ${dtlPrsnGubun ? "AND PRSN_SCT_CD = @DTL_PRSN_GUBUN" : ""}   -- 제시구분 (상사매입, 고객위탁)
                          ${dtlOwnerBrno ? "AND OWNR_BRNO = @DTL_OWNER_BRNO" : ""}       -- 소유자 사업자번호
                          ${dtlOwnerSsn ? "AND OWNR_SSN = @DTL_OWNER_SSN" : ""}           -- 소유자 주민번호
                          ${dtlCtshNo ? "AND CTSH_NO = @DTL_CTSH_NO" : ""}                  -- 계약서 번호
                          ${dtlCarNoBefore ? "AND PUR_BEF_CAR_NO = @DTL_CAR_NO_BEFORE" : ""} -- 이전 차량번호
                          ${dtlPurStatGubun ? "AND CAR_DEL_YN = @DTL_PUR_STAT_GUBUN" : ""}    -- 차량 삭제 여부
                          UNION ALL
					        SELECT  '합계' PRSN_SCT_NM
                          , COUNT(A.CAR_REG_ID) CNT
                          , ISNULL(SUM(A.PUR_AMT), 0) PUR_AMT
                          , ISNULL(SUM(A.CAR_LOAN_AMT), 0) CAR_LOAN_AMT
                          , ISNULL(SUM(B.SALE_AMT), 0) SALE_AMT
                          , ISNULL(SUM(B.AGENT_SEL_COST), 0) AGENT_SEL_COST
                          , ISNULL(SUM(B.PERF_INFE_AMT), 0) PERF_INFE_AMT
                      FROM dbo.CJB_CAR_PUR A
                          , dbo.CJB_CAR_SEL B
                      WHERE A.CAR_REG_ID = B.CAR_REG_ID
                        AND A.AGENT_ID = '00011'
                        AND A.CAR_DEL_YN = 'N'
                        AND A.CAR_STAT_CD IN ('002', '003')     --- 일반판매, 알선판매매
                          ${carNo ? "AND CAR_NO LIKE @CAR_NO" : ""}
                          ${dealer ? "AND DLR_ID LIKE @DEALER" : ""}
                          ${dtGubun === '01' ? "AND CAR_SALE_DT >= @START_DT AND CAR_SALE_DT <= @END_DT" : 
                            dtGubun === '02' ? "AND SALE_REG_DT >= @START_DT AND SALE_REG_DT <= @END_DT" :
                            dtGubun === '03' ? "AND ADJ_FIN_DT >= @START_DT AND ADJ_FIN_DT <= @END_DT" :
                            dtGubun === '04' ? "AND CAR_PUR_DT >= @START_DT AND CAR_PUR_DT <= @END_DT" : ""}
                          ${endDt ? "AND CAR_PUR_DT <= @END_DT" : ""}
                          ${dtlCustomerName ? "AND OWNR_NM LIKE @DTL_CUSTOMER_NAME" : ""}   -- 소유자 이름
                          ${dtlCustGubun ? "AND OWNR_TP_CD = @DTL_CUST_GUBUN" : ""}     -- 고객유형
                          ${dtlEvdcGubun ? "AND PUR_EVDC_CD = @DTL_EVDC_GUBUN" : ""}    -- 매출증빙 구분 (현금영수증,...)
                          ${dtlPrsnGubun ? "AND PRSN_SCT_CD = @DTL_PRSN_GUBUN" : ""}   -- 제시구분 (상사매입, 고객위탁)
                          ${dtlOwnerBrno ? "AND OWNR_BRNO = @DTL_OWNER_BRNO" : ""}       -- 소유자 사업자번호
                          ${dtlOwnerSsn ? "AND OWNR_SSN = @DTL_OWNER_SSN" : ""}           -- 소유자 주민번호
                          ${dtlCtshNo ? "AND CTSH_NO = @DTL_CTSH_NO" : ""}                  -- 계약서 번호
                          ${dtlCarNoBefore ? "AND PUR_BEF_CAR_NO = @DTL_CAR_NO_BEFORE" : ""} -- 이전 차량번호
                          ${dtlPurStatGubun ? "AND CAR_DEL_YN = @DTL_PUR_STAT_GUBUN" : ""}    -- 차량 삭제 여부
                      `;

        console.log('query:', query);
  
      const result = await request.query(query);
      return result.recordset;
    } catch (err) {
      console.error("Error fetching suggest sum:", err);
      throw err;
    }
  };
  


// 차량 판매매도 목록 조회
exports.getCarSelInfo = async ({ carRegId }) => {
  try {

    const request = pool.request();
    
    request.input("CAR_REG_ID", sql.VarChar, carRegId);

    const dataQuery = `SELECT A.CAR_REG_ID
                  , A.CAR_STAT_CD     -- 차량 상태 코드
                  , dbo.CJB_FN_GET_CD_NM('01', A.CAR_STAT_CD) CAR_STAT_NM
                  , B.SALE_TP_CD      -- 판매유형코드 
                  , dbo.CJB_FN_GET_CD_NM('03', B.SALE_TP_CD) SALE_TP_NM
                  , (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = B.DLR_ID) AS SEL_DLR_NM
                  , B.BUYER_NM        -- 매입자명 
                  , B.SALE_AMT        -- 매도 금액
                  , B.SALE_SUP_PRC    -- 매도 공급가액
                  , B.SALE_VAT        -- 매도 부가세
                  , B.AGENT_SEL_COST  -- 상사 매도 비용
                  , B.PERF_INFE_AMT   -- 성능 보험료 금액
                  , B.CAR_SALE_DT     -- 차량 판매 일자 
                  , B.SALE_REG_DT     -- 매출 등록 일자
                  , A.CAR_NO          -- 차량번호
                  , A.CAR_NM          -- 차량명
                  , A.CAR_PUR_DT      -- 차량구매일
                  , A.DLR_ID
                  , (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = A.DLR_ID) AS DLR_NM
                  , A.PUR_AMT         -- 차량구매금액
                  , B.ADJ_FIN_DT      -- 정산일
                  , B.SALE_CAR_NO     -- 판매 차량 번호
                  , B.SALE_DESC       -- 매도 설명
              FROM dbo.CJB_CAR_PUR A
                 , dbo.CJB_CAR_SEL B
              WHERE A.CAR_REG_ID = B.CAR_REG_ID
                AND A.CAR_DEL_YN = 'N'
                AND A.CAR_STAT_CD IN ('002', '003')     --- 일반판매, 알선판매매
                AND A.CAR_REG_ID = @CAR_REG_ID
                ;`;

      console.log('dataQuery:', dataQuery);

      const result = await request.query(dataQuery);
      return result.recordset[0];

  } catch (err) {
    console.error("Error fetching car sel info:", err);
    throw err;
  }
};


exports.getCarSelFilesList = async ({ carRegId }) => {
  try {
    const request = pool.request();
    request.input("CAR_REG_ID", sql.VarChar, carRegId);

    const dataQuery = `SELECT A.FILE_SEQ
                        , A.FILE_NM
                        , A.FILE_PATH
                        , A.FILE_SCT_CD
                        , dbo.CJB_FN_GET_CD_NM('01', A.FILE_SCT_CD) AS FILE_SCT_NM
                        , A.FILE_KND_NM
                        , A.AGENT_ID
                        , (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = A.REGR_ID) AS REGR_NM
                        , A.MODR_ID
                        , (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = A.MODR_ID) AS MODR_NM
                        FROM dbo.CJB_FILE_INFO A 
                        WHERE A.CAR_REG_ID = @CAR_REG_ID
                        ORDER BY A.FILE_SEQ ASC`;
    const result = await request.query(dataQuery);
    return result.recordset;

  } catch (err) {
    console.error("Error fetching car sel file info:", err);
    throw err;
  }
};


exports.getCarSelCustList = async ({ carRegId }) => {
  try {
    const request = pool.request();
    request.input("CAR_REG_ID", sql.VarChar, carRegId);
    const dataQuery = `SELECT A.BUY_SEQ
                        , A.CUST_NO
                        , A.CUST_NM
                        , A.CUST_TP_CD
                        , A.CUST_PHON
                        , A.CUST_EMAIL
                        , A.CUST_SSN
                        , A.CUST_BRNO
                        , A.CUST_ZIP
                        , A.CUST_ADDR1
                        , A.CUST_ADDR2
                        , A.MODR_ID
                        , (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = A.MODR_ID) AS MODR_NM
                        , A.SHARE_RATE
                        FROM dbo.CJB_CAR_BUY_CUST A 
                        WHERE A.CAR_REG_ID = @CAR_REG_ID`;
    const result = await request.query(dataQuery);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching car sel cust list:", err);
    throw err;
  }
};





// 차량 판매 정보 수정 (판매처리)
/**
 * 제시 등록시 차량 판매테이블에 저장처리 됨. (기본 정보만 입력됨)
 * 판매 처리시에는 차량 판매 테이블 update 처리
 * 1. 차량매도 금액, 상사매도비, 성능보험료에 대한 세금계산서, 현금영수증 중에 처리 테이블에 필요한 데이터 저장 
 * 2. 차량매도 금액, 상사매도비, 성능보험료는 여러 매수인 정보로 분해되어 등록 될 수 있음.
 *     차량매도금액- 여러사람 각 지분별, 상사매도비 - 여러사람 각 지분별, 성능보험료 - 여러사람 각 지분별
 */
exports.updateCarSel = async ({ 
  carRegId, 
  carSaleDt, 
  saleRegDt, 
  agentId, 
  dlrId, 
  saleTpCd, 
  buyerNm, 
  buyerTpCd, 
  buyerSsn, 
  buyerBrno, 
  buyerPhon, 
  buyerZip, 
  buyerAddr1, 
  buyerAddr2, 
  saleAmt, 
  saleSupPrc, 
  saleVat, 
  saleCarNo, 
  agentSelCost, 
  perfInfeAmt, 
  txblIssuYn, 
  selcstInclusYn, 
  selEvdcCd, 
  selEvdcCont, 
  selEvdcDt, 
  adjFinYn, 
  attachedFiles, 
  saleDesc, 
  totFeeAmt, 
  realFeeAmt, 
  saleCrIssuYn, 
  modrId,
  buyerCustomers
}) => {
    try {
      const request = pool.request();
  
      request.input("CAR_REG_ID", sql.VarChar, carRegId);
      request.input("CAR_SALE_DT", sql.VarChar, carSaleDt);
      request.input("SALE_REG_DT", sql.VarChar, saleRegDt);
      request.input("AGENT_ID", sql.VarChar, agentId);
      request.input("DLR_ID", sql.VarChar, dlrId);
      request.input("SALE_TP_CD", sql.VarChar, saleTpCd);
      request.input("BUYER_NM", sql.VarChar, buyerNm);
      request.input("BUYER_TP_CD", sql.VarChar, buyerTpCd);
      request.input("BUYER_SSN", sql.VarChar, buyerSsn);
      request.input("BUYER_BRNO", sql.VarChar, buyerBrno);
      request.input("BUYER_PHON", sql.VarChar, buyerPhon);
      request.input("BUYER_ZIP", sql.VarChar, buyerZip);
      request.input("BUYER_ADDR1", sql.VarChar, buyerAddr1);
      request.input("BUYER_ADDR2", sql.VarChar, buyerAddr2);
      request.input("SALE_AMT", sql.Decimal, saleAmt);
      request.input("SALE_SUP_PRC", sql.Decimal, saleSupPrc);
      request.input("SALE_VAT", sql.Decimal, saleVat);
      request.input("SALE_CAR_NO", sql.VarChar, saleCarNo);
      request.input("AGENT_SEL_COST", sql.Decimal, agentSelCost);
      request.input("PERF_INFE_AMT", sql.Decimal, perfInfeAmt);
      request.input("TXBL_ISSU_YN", sql.VarChar, txblIssuYn);
      request.input("SELCST_INCLUS_YN", sql.VarChar, selcstInclusYn);
      request.input("SEL_EVDC_CD", sql.VarChar, selEvdcCd);
      request.input("SEL_EVDC_CONT", sql.VarChar, selEvdcCont);
      request.input("SEL_EVDC_DT", sql.VarChar, selEvdcDt);
      request.input("ADJ_FIN_YN", sql.VarChar, adjFinYn);
      request.input("ATTACHED_FILES", sql.VarChar, attachedFiles);
      request.input("TOT_FEE_AMT", sql.Decimal, totFeeAmt);
      request.input("REAL_FEE_AMT", sql.Decimal, realFeeAmt);
      request.input("SALE_CR_ISSU_YN", sql.VarChar, saleCrIssuYn);
      request.input("SALE_DESC", sql.VarChar, saleDesc);
      request.input("MODR_ID", sql.VarChar, modrId);
  
      const query1 = `UPDATE dbo.CJB_CAR_SEL
                        SET   CAR_SALE_DT = @carSaleDt,       -- 차량 판매 일자
                              SALE_REG_DT = @saleRegDt,      -- 매출 등록 일자
                              AGENT_ID = @agentId,       -- 상사 ID
                              DLR_ID = @dlrId,          -- 담당딜러 ID (판매)
                              SALE_TP_CD = @saleTpCd,   -- 판매유형코드
                              BUYER_NM = @buyerNm,       -- 매입자명
                              BUYER_TP_CD = @buyerTpCd,   -- 매입자 유형코드
                              BUYER_SSN = @buyerSsn,      -- 매입자 주민번호
                              BUYER_BRNO = @buyerBrno,    -- 매입자 사업자번호
                              BUYER_PHON = @buyerPhon,    -- 매입자 전화번호
                              BUYER_ZIP = @buyerZip,      -- 매입자 우편번호
                              BUYER_ADDR1 = @buyerAddr1,    -- 매입자 주소
                              BUYER_ADDR2 = @buyerAddr2,    -- 매입자 상세주소
                              SALE_AMT = @saleAmt,          -- 매도 금액
                              SALE_SUP_PRC = @saleSupPrc,   -- 매도 공급가액
                              SALE_VAT = @saleVat,          -- 매도 부가세
                              SALE_CAR_NO = @saleCarNo,        -- 판매 차량 번호
                              AGENT_SEL_COST = @agentSelCost, -- 상사 매도 비용
                              PERF_INFE_AMT = @perfInfeAmt, -- 성능 보험료 금액
                              TXBL_ISSU_YN = @txblIssuYn,    -- 세금 발행 여부
                              SELCST_INCLUS_YN = @selcstInclusYn, -- 세무비 포함 여부
                              SEL_EVDC_CD = @selEvdcCd,      -- 증빙종류
                              SEL_EVDC_CONT = @selEvdcCont,  -- 증빙내용
                              SEL_EVDC_DT = @selEvdcDt,      -- 증빙일자
                              ADJ_FIN_YN = @adjFinYn,        -- 정산산 완료 여부
                              TOT_FEE_AMT = @totFeeAmt,      -- 총 비용
                              REAL_FEE_AMT = @realFeeAmt,    -- 실제 비용
                              SALE_CR_ISSU_YN = @saleCrIssuYn, -- 차량 판매 증서 발행 여부
                              SALE_DESC = @saleDesc,          -- 매도 설명
                              MOD_DTIME = GETDATE(),         -- 수정 일자
                              MODR_ID = @modrId               -- 수정자
                        WHERE  CAR_REG_ID = @CAR_REG_ID;`;
  
      // 첨부파일
      attachedFiles.forEach(async (file) => {

        console.log("file:", file.name);
        console.log("file:", file.url);

        const fileRequest = pool.request();

        fileRequest.input("CAR_REG_ID", sql.VarChar, carRegId);
        fileRequest.input("FILE_NM", sql.VarChar, file.name);
        fileRequest.input("FILE_PATH", sql.VarChar, file.url);
        fileRequest.input("FILE_SCT_CD", sql.VarChar, 'P');
        fileRequest.input("FILE_KND_NM", sql.VarChar, 'P');
        fileRequest.input("AGENT_ID", sql.VarChar, agentId);
        fileRequest.input("REGR_ID", sql.VarChar, usrId);
        fileRequest.input("MODR_ID", sql.VarChar, usrId);

        await fileRequest.query(`INSERT INTO dbo.CJB_FILE_INFO (
                                            AGENT_ID,
                                            FILE_SCT_CD,
                                            FILE_KND_NM,
                                            FILE_NM,
                                            FILE_PATH,
                                            CAR_REG_ID,
                                            REGR_ID,
                                            MODR_ID) VALUES (
                                            @AGENT_ID, 
                                            @FILE_SCT_CD, 
                                            @FILE_KND_NM, 
                                            @FILE_NM, 
                                            @FILE_PATH, 
                                            @CAR_REG_ID, 
                                            @REGR_ID, 
                                            @MODR_ID)`);

      });
  
      // 매입자 고객 정보
      /**
       * 고객정보에 먼저 등록하고 고객번호을 가지고 매입자 고객정보에 등록한다.
       */
      buyerCustomers.forEach(async (cust) => {

        /**
         * 총 4개의 항목으로 검색해서 존재하지 않으면 신규 등록 하고, 존재하면 고객번호를 가지고 등록
         */
          console.log("customerName:", cust.customerName);
          console.log("residentNumber:", cust.residentNumber);
          console.log("businessNumber:", cust.businessNumber);
          console.log("phone:", cust.phone);
          console.log("zip:", cust.zip);
          console.log("address:", cust.address);
          console.log("memo:", cust.memo);
          console.log("shareRate:", cust.shareRate);

          const custInfo = carCustModel.getCarCustExist(
            cust.customerName,
            cust.residentNumber,
            cust.businessNumber,
            cust.phone
          );

          console.log('custInfo:********' + custInfo);

          /**
           * 미 등록 고객이면
           */
          if(!custInfo.CUST_NO)
          {
            const insCust = carCustModel.insertCarCust
                              ( agentId, 
                                buyerNm,
                                custTpCd,    // 사업자 번호 있으면 ... 사업자 ?!
                                buyerPhon,
                                '',
                                buyerSsn,
                                buyerBrno,
                                buyerZip,
                                buyerAddr1,
                                buyerAddr2,
                                usrId )

            newCustNo = insCust.custNo;
          }
          else
          {
            newCustNo = custInfo.CUST_NO;
          }

          const custRequest = pool.request();


        /* 테이블 변경 *
        /* 내용 */
        /*'차량인수고객테이블

           차량등록ID
           차량 비용 항목 코드 (차량매도, 상사매도비, 성능보험료)
           총금액


         차량 인수 고객 비율
           차량등록ID
           차량 비용 항목 코드 (차량매도, 상사매도비, 성능보험료)
           고객번호
           인수지분율
           인수지분금액
           증빙구분코드
           증빙발행일자
           증빙발행여부
          */

          custRequest.input("CAR_REG_ID", sql.VarChar, carRegId);
          custRequest.input("REGR_ID", sql.VarChar, usrId);
          custRequest.input("MODR_ID", sql.VarChar, usrId);

          await custRequest.query(`INSERT INTO dbo.CJB_CAR_RCV_CUST (
                                              CAR_REG_ID,
                                              RCV_SEQ,
                                              CUST_SSN,
                                              CUST_BRNO,
                                              CUST_PHON,
                                              CUST_ZIP,
                                              CUST_ADDR,
                                              CUST_MEMO,
                                              RCV_SHR_RT,
                                              RCV_AMT
                                              REGR_ID,
                                              MODR_ID) VALUES (
                                              @CAR_REG_ID, 
                                              @BUY_SEQ, 
                                              @CUST_SSN, 
                                              @CUST_BRNO, 
                                              @CUST_PHON, 
                                              @CUST_ZIP, 
                                              @CUST_ADDR, 
                                              @CUST_MEMO, 
                                              @RCV_SHR_RT, 
                                              0, 
                                              @REGR_ID, 
                                              @MODR_ID)`);

      });
  

    // 차량상태코드 (매입 -> 일반판매)
    const query2 = `UPDATE dbo.CJB_CAR_PUR
                       SET CAR_STAT_CD = '002' -- 일반판매
                         , MODR_ID = @MODR_ID
                     WHERE CAR_REG_ID = @CAR_REG_ID
                       AND PRSN_SCT_CD = '0'   -- 상사
                       `;

    await Promise.all([request.query(query1), request.query(query2)]);

    } catch (err) {
      console.error("Error updating car sel info:", err);
      throw err;
    }
  };
  
  
// 판매매도 삭제
exports.deleteCarSel = async ({carRegId, usrId}) => {
  try {
    const request = pool.request();
    request.input("CAR_REG_ID", sql.VarChar, carRegId);
    request.input("MODR_ID", sql.VarChar, usrId);

    /**
     * 1. 매입에서 매도일자 null 셋팅
     * 2. 차량 상태 코드를 001 값으로 셋팅 (매입상태로 변경)
     * 3. 상사매도비 비용 0 셋팅 
     * 4. 성능보험료 비용 0 셋팅 
     * 5. 정산여부 체크해서 정산이 완료된것은 삭제가 안되게 처리
     * 6. 알선인 경우에는 알선 정보도 전체삭제
     * 7. 매도 첨부파일 전체 삭제
     * 8. 매입자 고객 정보 전체 삭제
     * 9. 매도에서 판매 일자 null 셋팅
     * 10. 매도에서 매출 등록 일자 null 셋팅
     * 11. 매도에서 판매 차량 번호 null 셋팅
     * 12. 매도에서 상사 매도 비용 0 셋팅
     * 13. 매도에서 성능보험료 비용 0 셋팅
     * 14. 매도에서 세무비 포함 여부 null 셋팅
     * 15. 매도에서 증빙종류 null 셋팅
     * 16. 매도에서 증빙내용 null 셋팅
     * 17. 매도에서 증빙일자 null 셋팅
     */    

    // 매도 정보 변경경
    const query1 = `UPDATE dbo.CJB_CAR_SEL
                      SET CAR_SALE_DT = NULL
                        , SALE_REG_DT = NULL
                        , DLR_ID = NULL
                        , SALE_TP_CD = NULL
                        , BUYER_NM = NULL
                        , BUYER_TP_CD = NULL
                        , BUYER_SSN = NULL
                        , BUYER_BRNO = NULL
                        , BUYER_PHON = NULL
                        , BUYER_ZIP = NULL
                        , BUYER_ADDR1 = NULL
                        , BUYER_ADDR2 = NULL
                        , SALE_AMT = 0
                        , SALE_SUP_PRC = 0
                        , SALE_VAT = 0
                        , SALE_CAR_NO = NULL
                        , AGENT_SEL_COST = 0
                        , PERF_INFE_AMT = 0
                        , TXBL_ISSU_YN = 'N'
                        , SEL_CST_INCLUS_YN = 'N'
                        , SEL_EVDC_CD = NULL
                        , SEL_EVDC_CONT = NULL
                        , SEL_EVDC_DT = NULL
                        , ADJ_FIN_DT = NULL
                        , ADJ_FIN_YN = 'N'
                        , TOT_FEE_AMT = 0
                        , REAL_FEE_AMT = 0
                        , SALE_CR_ISSU_YN = 'N'
                        , SALE_DESC = NULL
                        , MOD_DTIME = GETDATE()
                        , MODR_ID = @MODR_ID
                      WHERE CAR_REG_ID = @CAR_REG_ID
                        AND CAR_SALE_DT IS NOT NULL`;

    // 매입 정보 변경
    const query2 = `UPDATE dbo.CJB_CAR_PUR
                      SET CAR_SALE_DT = NULL
                        , CAR_STAT_CD = '001'    -- 매입상태로 변경
                        , MOD_DTIME = GETDATE()
                        , MODR_ID = @MODR_ID
                      WHERE CAR_REG_ID = @CAR_REG_ID
                        AND CAR_STAT_CD IN ('002', '003')`;

    // 알선 데이터 존재시 삭제 처리 
    const query3 = `DELETE FROM dbo.CJB_CAR_SEL_BRK
                      WHERE CAR_REG_ID = @CAR_REG_ID`;

    // 매도 첨부파일 전체 삭제
    const query4 = `DELETE FROM dbo.CJB_FILE_INFO
                      WHERE CAR_REG_ID = @CAR_REG_ID`;

    // 매입자 고객 전체 삭제
    const query5 = `DELETE FROM dbo.CJB_CAR_BUY_CUST
                      WHERE CAR_REG_ID = @CAR_REG_ID`;

    await Promise.all([request.query(query1), request.query(query2), request.query(query3), request.query(query4), request.query(query5)]);
    
    return { success: true };
  } catch (err) {
    console.error("Error deleting car sel:", err);
    throw err;
  }
}; 

// 매입자 고객 정보 등록
exports.insertCarBuyCust = async ({
  carRegId,
  buySeq,
  custNm,
  custSsn,
  custBrno, 
  custPhon,
  custZip,
  custAddr,
  custMemo,
  regrId,
  modrId
}) => {
  try {
    const request = pool.request();

    request.input("CAR_REG_ID", sql.VarChar, carRegId);
    request.input("BUY_SEQ", sql.Int, buySeq); // Default to 1 for new record
    request.input("CUST_NM", sql.VarChar, custNm);
    request.input("CUST_SSN", sql.VarChar, custSsn);
    request.input("CUST_BRNO", sql.VarChar, custBrno);
    request.input("CUST_PHON", sql.VarChar, custPhon);
    request.input("CUST_ZIP", sql.VarChar, custZip);
    request.input("CUST_ADDR", sql.VarChar, custAddr);
    request.input("CUST_MEMO", sql.VarChar, custMemo);
    request.input("REGR_ID", sql.VarChar, regrId);
    request.input("MODR_ID", sql.VarChar, modrId);

    const query = `INSERT INTO dbo.CJB_CAR_BUY_CUST (
      CAR_REG_ID,
      BUY_SEQ,
      CUST_NM,
      CUST_SSN,
      CUST_BRNO,
      CUST_PHON,
      CUST_ZIP,
      CUST_ADDR,
      CUST_MEMO,
      REGR_ID,
      MODR_ID
    ) VALUES (
      @CAR_REG_ID,
      @BUY_SEQ,
      @CUST_NM,
      @CUST_SSN,
      @CUST_BRNO,
      @CUST_PHON,
      @CUST_ZIP,
      @CUST_ADDR,
      @CUST_MEMO,
      @REGR_ID,
      @MODR_ID
    );`;

    await request.query(query);

  } catch (err) {
    console.error("Error inserting car buy cust:", err);
    throw err;
  }
  
};
