const sql = require("mssql");
const pool = require("../../config/db");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 제시 2.0
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.getCarPurList = async ({ 
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
    orderItem = '1',   //1: 제시일, 2: 담당딜러, 3: 고객유형, 4: 차량번호
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
      if (dtlOwnerBrno) request.input("DTL_OWNER_BRNO", sql.VarChar, `%${dtlOwnerBrno}%`);
      if (dtlOwnerSsn) request.input("DTL_OWNER_SSN", sql.VarChar, `%${dtlOwnerSsn}%` );
      if (dtlCtshNo) request.input("DTL_CTSH_NO", sql.VarChar, `%${dtlCtshNo}%` );
      if (dtlCarNoBefore) request.input("DTL_CAR_NO_BEFORE", sql.VarChar, `%${dtlCarNoBefore}%`);
  
      // 전체 카운트 조회
      const countQuery = `
      SELECT COUNT(*) as totalCount
                FROM dbo.CJB_CAR_PUR A
                    , dbo.CJB_CAR_SEL B
              WHERE A.AGENT_ID = @CAR_AGENT
                AND A.CAR_REG_ID = B.CAR_REG_ID
                AND A.CAR_DEL_YN = 'N'
                AND A.CAR_STAT_CD = '001'  -- 매입 ( 제시 차량 )
                ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO OR A.PUR_BEF_CAR_NO LIKE @CAR_NO OR B.SALE_CAR_NO LIKE @CAR_NO)" : ""}
                ${dealer ? "AND (A.DLR_ID LIKE @DEALER OR B.DLR_ID LIKE @DEALER)" : ""}
                ${startDt ? `AND ${dtGubun === '1' ? 'A.CAR_PUR_DT' : dtGubun === '2' ? 'A.CAR_REG_DT' : 'CONVERT(CHAR(10), REG_DTIME, 23)'} >= @START_DT` : ""}
                ${endDt ? `AND ${dtGubun === '1' ? 'A.CAR_PUR_DT' : dtGubun === '2' ? 'A.CAR_REG_DT' : 'CONVERT(CHAR(10), REG_DTIME, 23)'} <= @END_DT` : ""}
                ${dtlCustomerName ? "AND A.OWNR_NM LIKE @DTL_CUSTOMER_NAME" : ""}
                ${dtlCustGubun ? "AND A.OWNR_TP_CD = @DTL_CUST_GUBUN" : ""}
                ${dtlEvdcGubun ? "AND A.PUR_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                ${dtlPrsnGubun ? "AND A.PRSN_SCT_CD = @DTL_PRSN_GUBUN" : ""}
                ${dtlOwnerBrno ? "AND A.OWNR_BRNO LIKE @DTL_OWNER_BRNO" : ""}
                ${dtlOwnerSsn ? "AND A.OWNR_SSN LIKE @DTL_OWNER_SSN" : ""}
                ${dtlCtshNo ? "AND A.CTSH_NO LIKE @DTL_CTSH_NO" : ""}
                ${dtlCarNoBefore ? "AND A.PUR_BEF_CAR_NO LIKE @DTL_CAR_NO_BEFORE" : ""}
      `;

      //console.log('countQuery:', countQuery);
    
      const dataQuery = `SELECT A.CAR_REG_ID               
         , A.CAR_REG_DT              
         , A.CAR_DEL_DT              
         , A.CAR_STAT_CD             
         , dbo.CJB_FN_GET_CD_NM('01', A.CAR_STAT_CD) CAR_STAT_NM
         , A.CAR_DEL_YN              
         , A.AGENT_ID                
         , A.DLR_ID                  
         , (SELECT USR_NM FROM CJB_USR WHERE USR_ID = A.DLR_ID) AS DLR_NM
         , A.CAR_KND_CD              
         , A.PRSN_SCT_CD
         , CASE WHEN PRSN_SCT_CD = '0' THEN '상사매입' ELSE '고객위탁' END PRSN_SCT_NM
         , A.CAR_PUR_DT              
         , A.CAR_LOAN_CNT            
         , A.CAR_LOAN_AMT            
         , A.CAR_NO               
         , A.PUR_BEF_CAR_NO   
         , A.CAR_NEW_YN              
         , A.CAR_NM                  
         , A.CAR_CAT_NM              
         , A.MFCP_NM                 
         , A.CAR_MNFT_DT             
         , A.RUN_DSTN                
         , A.CAR_YOM
         , A.PUR_EVDC_CD                 -- 매출증빙 구분 코드
         , dbo.CJB_FN_GET_CD_NM('07', A.PUR_EVDC_CD) PUR_EVDC_NM
         , A.OWNR_NM                 
         , A.OWNR_TP_CD             
         , dbo.CJB_FN_GET_CD_NM('04', A.OWNR_TP_CD) OWNR_TP_NM
         , A.OWNR_SSN                
         , A.OWNR_BRNO               
         , A.OWNR_PHON               
         , A.OWNR_ZIP                
         , A.OWNR_ADDR1              
         , A.OWNR_ADDR2     
         , A.OWNR_EMAIL
         , A.OWNR_EMAIL_DOMAIN
         , A.PUR_AMT                 
         , A.PUR_SUP_PRC             
         , A.PUR_VAT                 
         , A.GAIN_TAX                
         , A.AGENT_PUR_CST           
         , A.PURACSH_RCV_YN          
         , A.TXBL_ISSU_DT            
         , A.PUR_DESC                
         , A.TOT_PUR_FEE             
         , A.TOT_PAY_FEE             
         , A.TOT_CMRC_COST_FEE       
         , A.CUST_NO                 
         , A.PRSN_NO                 
         , A.PARK_ZON_CD             
         , A.PARK_ZON_DESC           
         , A.PARK_KEY_NO             
         , A.REG_DTIME               
         , A.REGR_ID                 
         , A.MOD_DTIME               
         , A.MODR_ID             
                  FROM dbo.CJB_CAR_PUR A
                      , dbo.CJB_CAR_SEL B
                WHERE A.AGENT_ID = @CAR_AGENT
                  AND A.CAR_REG_ID = B.CAR_REG_ID
                  AND A.CAR_DEL_YN = 'N'
                  AND A.CAR_STAT_CD = '001'  -- 매입 ( 제시 차량 )
                ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO OR A.PUR_BEF_CAR_NO LIKE @CAR_NO OR B.SALE_CAR_NO LIKE @CAR_NO)" : ""}
                ${dealer ? "AND (A.DLR_ID LIKE @DEALER OR B.DLR_ID LIKE @DEALER)" : ""}
                ${startDt ? `AND ${dtGubun === '1' ? 'A.CAR_PUR_DT' : dtGubun === '2' ? 'A.CAR_REG_DT' : 'CONVERT(CHAR(10), REG_DTIME, 23)'} >= @START_DT` : ""}
                ${endDt ? `AND ${dtGubun === '1' ? 'A.CAR_PUR_DT' : dtGubun === '2' ? 'A.CAR_REG_DT' : 'CONVERT(CHAR(10), REG_DTIME, 23)'} <= @END_DT` : ""}
                ${dtlCustomerName ? "AND A.OWNR_NM LIKE @DTL_CUSTOMER_NAME" : ""}
                ${dtlCustGubun ? "AND A.OWNR_TP_CD = @DTL_CUST_GUBUN" : ""}
                ${dtlEvdcGubun ? "AND A.PUR_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                ${dtlPrsnGubun ? "AND A.PRSN_SCT_CD = @DTL_PRSN_GUBUN" : ""}
                ${dtlOwnerBrno ? "AND A.OWNR_BRNO LIKE @DTL_OWNER_BRNO" : ""}
                ${dtlOwnerSsn ? "AND A.OWNR_SSN LIKE @DTL_OWNER_SSN" : ""}
                ${dtlCtshNo ? "AND A.CTSH_NO LIKE @DTL_CTSH_NO" : ""}
                ${dtlCarNoBefore ? "AND A.PUR_BEF_CAR_NO LIKE @DTL_CAR_NO_BEFORE" : ""}
                ORDER BY ${orderItem === '1' ? 'A.CAR_PUR_DT' : orderItem === '2' ? 'A.DLR_ID' : orderItem === '3' ? 'A.PRSN_SCT_CD' : orderItem === '4' ? 'A.OWNR_TP_CD' : 'A.OWNR_TP_CD'} ${ordAscDesc}
                OFFSET (@PAGE - 1) * @PAGE_SIZE ROWS
                FETCH NEXT @PAGE_SIZE ROWS ONLY;`;
  
      //console.log('dataQuery:', dataQuery);

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
  
  // 제시 차량 합계 조회
  exports.getCarPurSummary = async ({  
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
  
      const query = `SELECT '상사' AS PRSN_SCT_CD
                          , COUNT(A.CAR_REG_ID) CNT
                          , ISNULL(SUM(A.PUR_AMT), 0) PUR_AMT
                          , ISNULL(SUM(A.PUR_SUP_PRC), 0) PUR_SUP_PRC
                          , ISNULL(SUM(A.PUR_VAT), 0) PUR_VAT
                          , ISNULL(SUM(A.CAR_LOAN_AMT), 0) CAR_LOAN_AMT
                          , ISNULL(SUM(A.AGENT_PUR_CST), 0) AGENT_PUR_CST
                        FROM dbo.CJB_CAR_PUR A
                            , dbo.CJB_CAR_SEL B
                        WHERE A.AGENT_ID = @CAR_AGENT
                          AND A.CAR_REG_ID = B.CAR_REG_ID
                          AND A.CAR_STAT_CD = '001'
                          AND A.CAR_DEL_YN = 'N'
                          AND PRSN_SCT_CD = '0'  -- 상사
                        ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO OR A.PUR_BEF_CAR_NO LIKE @CAR_NO OR B.SALE_CAR_NO LIKE @CAR_NO)" : ""}
                        ${dealer ? "AND (A.DLR_ID LIKE @DEALER OR B.DLR_ID LIKE @DEALER)" : ""}
                        ${startDt ? `AND ${dtGubun === '1' ? 'A.CAR_PUR_DT' : dtGubun === '2' ? 'A.CAR_REG_DT' : 'CONVERT(CHAR(10), REG_DTIME, 23)'} >= @START_DT` : ""}
                        ${endDt ? `AND ${dtGubun === '1' ? 'A.CAR_PUR_DT' : dtGubun === '2' ? 'A.CAR_REG_DT' : 'CONVERT(CHAR(10), REG_DTIME, 23)'} <= @END_DT` : ""}
                        ${dtlCustomerName ? "AND A.OWNR_NM LIKE @DTL_CUSTOMER_NAME" : ""}
                        ${dtlCustGubun ? "AND A.OWNR_TP_CD = @DTL_CUST_GUBUN" : ""}
                        ${dtlEvdcGubun ? "AND A.PUR_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                        ${dtlPrsnGubun ? "AND A.PRSN_SCT_CD = @DTL_PRSN_GUBUN" : ""}
                        ${dtlOwnerBrno ? "AND A.OWNR_BRNO LIKE @DTL_OWNER_BRNO" : ""}
                        ${dtlOwnerSsn ? "AND A.OWNR_SSN LIKE @DTL_OWNER_SSN" : ""}
                        ${dtlCtshNo ? "AND A.CTSH_NO LIKE @DTL_CTSH_NO" : ""}
                        ${dtlCarNoBefore ? "AND A.PUR_BEF_CAR_NO LIKE @DTL_CAR_NO_BEFORE" : ""}
                      UNION ALL
                      SELECT '고객위탁' AS PRSN_SCT_CD
                          , COUNT(A.CAR_REG_ID) CNT
                          , ISNULL(SUM(A.PUR_AMT), 0) PUR_AMT
                          , ISNULL(SUM(A.PUR_SUP_PRC), 0) PUR_SUP_PRC
                          , ISNULL(SUM(A.PUR_VAT), 0) PUR_VAT
                          , ISNULL(SUM(A.CAR_LOAN_AMT), 0) CAR_LOAN_AMT
                          , ISNULL(SUM(A.AGENT_PUR_CST), 0) AGENT_PUR_CST
                        FROM dbo.CJB_CAR_PUR A
                            , dbo.CJB_CAR_SEL B
                        WHERE A.AGENT_ID = @CAR_AGENT
                          AND A.CAR_REG_ID = B.CAR_REG_ID
                          AND A.CAR_STAT_CD = '001'
                          AND A.CAR_DEL_YN = 'N'
                          AND A.PRSN_SCT_CD = '1'  -- 고객위탁
                        ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO OR A.PUR_BEF_CAR_NO LIKE @CAR_NO OR B.SALE_CAR_NO LIKE @CAR_NO)" : ""}
                        ${dealer ? "AND (A.DLR_ID LIKE @DEALER OR B.DLR_ID LIKE @DEALER)" : ""}
                        ${startDt ? `AND ${dtGubun === '1' ? 'A.CAR_PUR_DT' : dtGubun === '2' ? 'A.CAR_REG_DT' : 'CONVERT(CHAR(10), REG_DTIME, 23)'} >= @START_DT` : ""}
                        ${endDt ? `AND ${dtGubun === '1' ? 'A.CAR_PUR_DT' : dtGubun === '2' ? 'A.CAR_REG_DT' : 'CONVERT(CHAR(10), REG_DTIME, 23)'} <= @END_DT` : ""}
                        ${dtlCustomerName ? "AND A.OWNR_NM LIKE @DTL_CUSTOMER_NAME" : ""}
                        ${dtlCustGubun ? "AND A.OWNR_TP_CD = @DTL_CUST_GUBUN" : ""}
                        ${dtlEvdcGubun ? "AND A.PUR_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                        ${dtlPrsnGubun ? "AND A.PRSN_SCT_CD = @DTL_PRSN_GUBUN" : ""}
                        ${dtlOwnerBrno ? "AND A.OWNR_BRNO LIKE @DTL_OWNER_BRNO" : ""}
                        ${dtlOwnerSsn ? "AND A.OWNR_SSN LIKE @DTL_OWNER_SSN" : ""}
                        ${dtlCtshNo ? "AND A.CTSH_NO LIKE @DTL_CTSH_NO" : ""}
                        ${dtlCarNoBefore ? "AND A.PUR_BEF_CAR_NO LIKE @DTL_CAR_NO_BEFORE" : ""}
                      UNION ALL
                      SELECT '합계' AS PRSN_SCT_CD
                          , COUNT(A.CAR_REG_ID) CNT
                          , ISNULL(SUM(A.PUR_AMT), 0) PUR_AMT
                          , ISNULL(SUM(A.PUR_SUP_PRC), 0) PUR_SUP_PRC
                          , ISNULL(SUM(A.PUR_VAT), 0) PUR_VAT
                          , ISNULL(SUM(A.CAR_LOAN_AMT), 0) CAR_LOAN_AMT
                          , ISNULL(SUM(A.AGENT_PUR_CST), 0) AGENT_PUR_CST
                        FROM dbo.CJB_CAR_PUR A
                            , dbo.CJB_CAR_SEL B
                        WHERE A.AGENT_ID = @CAR_AGENT
                          AND A.CAR_REG_ID = B.CAR_REG_ID
                          AND A.CAR_STAT_CD = '001'
                          AND A.CAR_DEL_YN = 'N'
                        ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO OR A.PUR_BEF_CAR_NO LIKE @CAR_NO OR B.SALE_CAR_NO LIKE @CAR_NO)" : ""}
                        ${dealer ? "AND (A.DLR_ID LIKE @DEALER OR B.DLR_ID LIKE @DEALER)" : ""}
                        ${startDt ? `AND ${dtGubun === '1' ? 'A.CAR_PUR_DT' : dtGubun === '2' ? 'A.CAR_REG_DT' : 'CONVERT(CHAR(10), REG_DTIME, 23)'} >= @START_DT` : ""}
                        ${endDt ? `AND ${dtGubun === '1' ? 'A.CAR_PUR_DT' : dtGubun === '2' ? 'A.CAR_REG_DT' : 'CONVERT(CHAR(10), REG_DTIME, 23)'} <= @END_DT` : ""}
                        ${dtlCustomerName ? "AND A.OWNR_NM LIKE @DTL_CUSTOMER_NAME" : ""}
                        ${dtlCustGubun ? "AND A.OWNR_TP_CD = @DTL_CUST_GUBUN" : ""}
                        ${dtlEvdcGubun ? "AND A.PUR_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                        ${dtlPrsnGubun ? "AND A.PRSN_SCT_CD = @DTL_PRSN_GUBUN" : ""}
                        ${dtlOwnerBrno ? "AND A.OWNR_BRNO LIKE @DTL_OWNER_BRNO" : ""}
                        ${dtlOwnerSsn ? "AND A.OWNR_SSN LIKE @DTL_OWNER_SSN" : ""}
                        ${dtlCtshNo ? "AND A.CTSH_NO LIKE @DTL_CTSH_NO" : ""}
                        ${dtlCarNoBefore ? "AND A.PUR_BEF_CAR_NO LIKE @DTL_CAR_NO_BEFORE" : ""}
        `;

      const result = await request.query(query);
      return result.recordset;
    } catch (err) {
      console.error("Error fetching car pur sum:", err);
      throw err;
    }
  };
  
  // 제시 차량 정보 조회
  exports.getCarPurInfo = async ({ carRegId }) => {
    try {
      const request = pool.request();
      request.input("CAR_REG_ID", sql.VarChar, carRegId);   
  
      const query = `SELECT                  
                            CAR_REG_ID              
                            , CAR_REG_DT            
                            , CAR_DEL_DT            
                            , CAR_STAT_CD           
                            , dbo.CJB_FN_GET_CD_NM('01', A.CAR_STAT_CD) CAR_STAT_NM
                            , CAR_DEL_YN            
                            , AGENT_ID              
                            , DLR_ID      
                            , (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = A.DLR_ID) AS DLR_NM          
                            , CAR_KND_CD         
                            , dbo.CJB_FN_GET_CD_NM('92', A.CAR_KND_CD) CAR_KND_NM
                            , PRSN_SCT_CD     
                            , CASE WHEN PRSN_SCT_CD = '0' THEN '상사매입' ELSE '고객위탁' END PRSN_SCT_NM
                            , CAR_PUR_DT            
                            , CAR_LOAN_CNT          
                            , CAR_LOAN_AMT          
                            , CAR_NO                
                            , PUR_BEF_CAR_NO        
                            , CAR_NEW_YN            
                            , CAR_NM                
                            , CAR_CAT_NM            
                            , MFCP_NM               
                            , CAR_MNFT_DT           
                            , RUN_DSTN              
                            , CAR_YOM               
                            , PUR_EVDC_CD           
                            , dbo.CJB_FN_GET_CD_NM('07', A.PUR_EVDC_CD) PUR_EVDC_NM
                            , OWNR_NM               
                            , OWNR_TP_CD            
                            , dbo.CJB_FN_GET_CD_NM('04', A.OWNR_TP_CD) OWNR_TP_NM
                            , OWNR_SSN              
                            , OWNR_BRNO             
                            , OWNR_PHON             
                            , OWNR_ZIP              
                            , OWNR_ADDR1            
                            , OWNR_ADDR2            
                            , OWNR_EMAIL            
                            , OWNR_EMAIL_DOMAIN     
                            , PUR_AMT               
                            , PUR_SUP_PRC           
                            , PUR_VAT               
                            , GAIN_TAX              
                            , AGENT_PUR_CST         
                            , AGENT_PUR_CST_PAY_DT  
                            , AGENT_PUR_CST_ISSU_CD
                            , TXBL_RCV_YN           
                            , PURACSH_RCV_YN        
                            , TXBL_ISSU_DT          
                            , FCT_CNDC_YN           
                            , PUR_DESC              
                            , TOT_PUR_FEE           
                            , TOT_PAY_FEE           
                            , TOT_CMRC_COST_FEE     
                            , CUST_NO               
                            , PRSN_NO               
                            , PARK_ZON_CD        
                            , (SELECT CD_NM FROM dbo.CJB_COMM_CD WHERE CD = A.PARK_ZON_CD AND GRP_CD = '91') AS PARK_ZON_NM   
                            , PARK_ZON_DESC         
                            , PARK_KEY_NO           
                            , CTSH_NO               
                            , CMBT_PRSN_MEMO        
                            , REG_DTIME             
                            , REGR_ID               
                            , MOD_DTIME             
                            , MODR_ID               
                              FROM dbo.CJB_CAR_PUR A     
                            WHERE  A.CAR_REG_ID = @CAR_REG_ID `;
  
      const result = await request.query(query);

      console.log("result:", result.recordset[0]);


      return result.recordset[0];
    } catch (err) {
      console.error("Error fetching car pur detail:", err);
      throw err;
    }
  };


// 제시 직접 등록
exports.insertCarPur = async ({
    agentId                 // 상사 ID              
  , purAmt                  // 매입금액
  , purSupPrc               // 공급가
  , purVat                  // 부가세
  , carPurDt                // 매입일   
  , agentPurCst             // 상사매입비
  , brokerageDate           // 상사매입비 입금일
  , cstTypeCd               // 상사매입비 발행 코드
  , gainTax                 // 취득세
  , carNm                   // 차량명
  , carNo                   // 차량번호(매입후)
  , purBefCarNo             // 차량번호(매입전)
  , ownrTpCd                // 소유자 유형 코드
  , ownrSsn                 // 주민등록번호
  , ownrBrno               // 사업자등록번호
  , ownrNm                 // 고객명
  , ownrZip                // 우편번호
  , evdcCd                 // 증빙종류
  , carKndCd               // 차량 종류 코드
  , prsnSctCd              // 제시 구분 코드
  , ownrPhon               // 연락처
  , ownrEmail              // 이메일 아이디
  , emailDomain            // 이메일 도메인
  , txblIssuDt             // 세금계산서 발행 일자
  , purDesc                // 매입 설명
  , ownrAddr1              // 주소
  , ownrAddr2              // 상세주소
  , attachedFiles          // 관련 서류 첨부
  , usrId                  // 사용자 ID
  , dealerId               // 매입딜러
  , parkingCd              // 주차위치 코드
  , parkingLocationDesc    // 주차위치 설명
  , parkKeyNo              // 주차키 번호
  , fctCndcYn              // 사실 확인서 여부
  , txblRcvYn              // 매입계산서 수령 여부
  , ctshNo                 // 고객 번호
}) => {
  try {
    const request = pool.request();

    // car_reg_id 값도 미리 만들기
    request.input("agentId", sql.VarChar, agentId); 
    const carRegId = await request.query(`SELECT dbo.CJB_FN_MK_CAR_REG_ID(@agentId) as CAR_REG_ID`);
    const newCarRegId = carRegId.recordset[0].CAR_REG_ID;

    request.input("CAR_REG_ID", sql.VarChar, newCarRegId);                        // 차량 등록 ID         
    request.input("AGENT_ID", sql.VarChar, agentId);                            // 상사 ID              
    request.input("DLR_ID", sql.VarChar, dealerId);                             // 딜러 ID              
    request.input("CAR_KND_CD", sql.VarChar, carKndCd?.split('|')[0]);                         // 차량 종류 코드         
    request.input("PRSN_SCT_CD", sql.VarChar, prsnSctCd);                       // 제시 구분 코드       
    request.input("CAR_PUR_DT", sql.VarChar, carPurDt);                         // 차량 매입 일자       
    request.input("CAR_NO", sql.VarChar, carNo);                                // 차량 번호       
    request.input("PUR_BEF_CAR_NO", sql.VarChar, purBefCarNo);                 // 차량 번호 이전     
    request.input("CAR_NM", sql.VarChar, carNm);                               // 차량 명              
    request.input("PUR_EVDC_CD", sql.VarChar, evdcCd);                         // 증빙종류     
    request.input("OWNR_NM", sql.VarChar, ownrNm);                             // 소유자 명            
    request.input("OWNR_TP_CD", sql.VarChar, ownrTpCd);                        // 소유자 유형 명       
    request.input("OWNR_SSN", sql.VarChar, ownrSsn);                           // 소유자 주민등록번호  
    request.input("OWNR_BRNO", sql.VarChar, ownrBrno);                         // 소유자 사업자등록번호
    request.input("OWNR_PHON", sql.VarChar, ownrPhon);                         // 소유자 전화번호      
    request.input("OWNR_ZIP", sql.VarChar, ownrZip);                           // 소유자 주소          
    request.input("OWNR_ADDR1", sql.VarChar, ownrAddr1);                       // 소유자 주소1         
    request.input("OWNR_ADDR2", sql.VarChar, ownrAddr2);                       // 소유자 주소2         
    request.input("OWNR_EMAIL", sql.VarChar, ownrEmail);                       // 소유자 이메일    
    request.input("OWNR_EMAIL_DOMAIN", sql.VarChar, emailDomain);              // 소유자 이메일 도메인    
    request.input("PUR_AMT", sql.Int, purAmt);                                 // 매입금액액 금액            
    request.input("PUR_SUP_PRC", sql.Int, purSupPrc);                          // 공급가               
    request.input("PUR_VAT", sql.Int, purVat);                                 // 부가세               
    request.input("GAIN_TAX", sql.Int, gainTax);                              // 취득 세              
    request.input("AGENT_PUR_CST", sql.Int, agentPurCst);                     // 상사 매입 비         
    request.input("AGENT_PUR_CST_PAY_DT", sql.VarChar, brokerageDate);        // 상사 매입 비 입금일
    request.input("AGENT_PUR_CST_ISSU_CD", sql.VarChar, cstTypeCd);           // 상사 매입 비 발행 코드
    request.input("TXBL_RCV_YN", sql.VarChar, txblRcvYn);                     // 매입계산서 수령 여부 
    request.input("PURACSH_RCV_YN", sql.VarChar, txblRcvYn);                  // 매입계산서 수령 여부 
    request.input("TXBL_ISSU_DT", sql.VarChar, txblIssuDt);                   // 세금계산서 발행 일자 
    request.input("FCT_CNDC_YN", sql.VarChar, fctCndcYn);                     // 사실확인서 여부부 
    request.input("PUR_DESC", sql.VarChar, purDesc);                          // 매입 설명           
    request.input("TOT_PUR_FEE", sql.Int, 0);                                 // 총 매입 수수료       
    request.input("CUST_NO", sql.VarChar, ctshNo);                            // 고객 번              
    request.input("PARK_ZON_CD", sql.VarChar, parkingCd);                     // 주차 구역 코드       
    request.input("PARK_ZON_DESC", sql.VarChar, parkingLocationDesc);         // 주차 구역 설명       
    request.input("PARK_KEY_NO", sql.VarChar, parkKeyNo);                     // 주차 키 번호         
    request.input("REGR_ID", sql.VarChar, usrId);                            // 등록자 ID            
    request.input("MODR_ID", sql.VarChar, usrId);                            // 수정자 ID   

    const query1 = `INSERT INTO dbo.CJB_CAR_PUR (
                    CAR_REG_ID,
                    CAR_REG_DT,
                    --CAR_DEL_DT,
                    --CAR_STAT_CD,
                    --CAR_DEL_YN,
                    AGENT_ID,
                    DLR_ID,
                    CAR_KND_CD,
                    PRSN_SCT_CD,
                    CAR_PUR_DT,
                    --CAR_LOAN_CNT,
                    --CAR_LOAN_AMT,
                    CAR_NO,
                    PUR_BEF_CAR_NO,
                    --CAR_NEW_YN,
                    CAR_NM,
                    --CAR_CAT_NM,
                    --MFCP_NM,
                    --CAR_MNFT_DT,
                    --RUN_DSTN,
                    --CAR_YOM,
                    PUR_EVDC_CD,
                    OWNR_NM,
                    OWNR_TP_CD,
                    OWNR_SSN,
                    OWNR_BRNO,
                    OWNR_PHON,
                    OWNR_ZIP,
                    OWNR_ADDR1,
                    OWNR_ADDR2,
                    OWNR_EMAIL,
                    OWNR_EMAIL_DOMAIN,
                    PUR_AMT,
                    PUR_SUP_PRC,
                    PUR_VAT,
                    GAIN_TAX,
                    AGENT_PUR_CST,
                    AGENT_PUR_CST_PAY_DT,
                    AGENT_PUR_CST_ISSU_CD,
                    PURACSH_RCV_YN,
                    TXBL_RCV_YN,
                    TXBL_ISSU_DT,
                    FCT_CNDC_YN,                  
                    PUR_DESC,
                    TOT_PUR_FEE,
                    --TOT_PAY_FEE,
                    --TOT_CMRC_COST_FEE,
                    CUST_NO,
                    --PRSN_NO,
                    PARK_ZON_CD,
                    PARK_ZON_DESC,
                    PARK_KEY_NO,
                    REGR_ID,
                    MODR_ID
                  ) VALUES (
                    @CAR_REG_ID,
                    CONVERT(CHAR(10), GETDATE(), 23),
                    --@CAR_DEL_DT,
                    --@CAR_STAT_CD,
                    --@CAR_DEL_YN,
                    @AGENT_ID,
                    @DLR_ID,
                    @CAR_KND_CD,
                    @PRSN_SCT_CD,
                    @CAR_PUR_DT,
                    --@CAR_LOAN_CNT,
                    --@CAR_LOAN_AMT,
                    @CAR_NO,
                    @PUR_BEF_CAR_NO,
                    --@CAR_NEW_YN,
                    @CAR_NM,
                    --@CAR_CAT_NM,
                    --@MFCP_NM,
                    --@CAR_MNFT_DT,
                    --@RUN_DSTN,
                    --@CAR_YOM,
                    @PUR_EVDC_CD,
                    @OWNR_NM,
                    @OWNR_TP_CD,
                    @OWNR_SSN,
                    @OWNR_BRNO,
                    @OWNR_PHON,
                    @OWNR_ZIP,
                    @OWNR_ADDR1,
                    @OWNR_ADDR2,
                    @OWNR_EMAIL,
                    @OWNR_EMAIL_DOMAIN,
                    @PUR_AMT,
                    @PUR_SUP_PRC,
                    @PUR_VAT,
                    @GAIN_TAX,
                    @AGENT_PUR_CST,
                    @AGENT_PUR_CST_PAY_DT,
                    @AGENT_PUR_CST_ISSU_CD,
                    @PURACSH_RCV_YN,
                    @TXBL_RCV_YN,
                    @TXBL_ISSU_DT,
                    @FCT_CNDC_YN,
                    @PUR_DESC,
                    @TOT_PUR_FEE,
                    --@TOT_PAY_FEE,
                    --@TOT_CMRC_COST_FEE,
                    @CUST_NO,
                    --@PRSN_NO,
                    @PARK_ZON_CD,
                    @PARK_ZON_DESC,
                    @PARK_KEY_NO,
                    @REGR_ID,
                    @MODR_ID
                  )`;

    //console.log("query:", query1);

    attachedFiles.forEach(async (file) => {

      console.log("file:", file.name);
      console.log("file:", file.url);

      const fileRequest = pool.request();

      fileRequest.input("CAR_REG_ID", sql.VarChar, newCarRegId);
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

    // 차량판매 기본값 저장장
    const query2 = `INSERT INTO dbo.CJB_CAR_SEL
            (CAR_REG_ID,
             AGENT_ID,
             REGR_ID, 
             MODR_ID)
       VALUES (
        @CAR_REG_ID,
        @AGENT_ID,
        @REGR_ID,
        @MODR_ID);`;

    await Promise.all([request.query(query1), request.query(query2)]);

    /**
     * cstTypeCd 해당사항 없음 이면 등록 안되게
     */
    if (cstTypeCd && cstTypeCd !== '000') {
      // 차량 거래 항목 (상사매입비) 참조하여 저장 처리 
      const query3 = `INSERT dbo.CJB_CAR_TRADE_AMT (
                        CAR_REG_ID
                        ,TRADE_DT
                        ,TRADE_SCT_CD
                        ,TRADE_ITEM_CD
                        ,TRADE_ITEM_NM
                        ,TRADE_ITEM_AMT
                        ,TRADE_ITEM_SUP_PRC
                        ,TRADE_ITEM_VAT
                        ,TRADE_PAY_AMT
                        ,TRADE_PAY_DT
                        ,TRADE_TGT_ID
                        ,TRADE_TGT_NM
                        ,TRADE_TGT_PHON
                        ,TRADE_TGT_SCT_CD
                        ,TRADE_TP_CD
                        ,RCGN_NO
                        ,TRADE_EVDC_CD
                        ,TRADE_MEMO
                        ,REGR_ID
                        ,MODR_ID)
                      SELECT @CAR_REG_ID AS CAR_REG_ID
                          , @CAR_PUR_DT AS CAR_PUR_DT 
                          , TRADE_SCT_CD
                          , TRADE_ITEM_CD
                          , TRADE_ITEM_NM     
                          , TRADE_ITEM_AMT
                          , ROUND(TRADE_ITEM_AMT/1.1, 0) TRADE_ITEM_SUP_PRC
                          , TRADE_ITEM_AMT - ROUND(TRADE_ITEM_AMT/1.1, 0) AS TRADE_ITEM_VAT
                          , 0
                          , NULL
                          , @DLR_ID AS DLR_ID
                          , (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = @DLR_ID) AS DLR_NM
                          , (SELECT USR_PHON FROM dbo.CJB_USR WHERE USR_ID = @DLR_ID) AS DLR_PHON
                          , 'U' AS TRADE_TGT_SCT_CD
                          , '001' TRADE_TP_CD  -- 소득공제 DEFAULT
                          , '' RCGN_NO
                          , '004'AS TRADE_EVDC_CD -- 현금영수증
                          , '' AS TRADE_MEMO
                          , @REGR_ID AS REGR_ID
                          , @MODR_ID AS MODR_ID
                        FROM dbo.CJB_CAR_TRADE_ITEM A
                      WHERE A.AGENT_ID = @AGENT_ID
                        AND A.TRADE_SCT_CD = '0' --매입
                        AND A.TRADE_ITEM_CD = '001'  -- 상사매입비
                    ;`;


        // 상사 매입비 상품화 비용에 추가 처리   (상사매입비 발행코드가 해당없음도 상품화 비용에 넣어줘야 ???)
        const query4 = `INSERT INTO dbo.CJB_GOODS_FEE (
                          AGENT_ID,
                          CAR_REG_ID,
                          EXPD_ITEM_CD,
                          EXPD_ITEM_NM,
                          EXPD_SCT_CD,
                          EXPD_AMT,
                          EXPD_SUP_PRC,
                          EXPD_VAT,
                          EXPD_DT,
                          EXPD_METH_CD,
                          EXPD_EVDC_CD,
                          TAX_SCT_CD,   -- 0: 미공제, 1: 공제
                          TXBL_ISSU_DT,     
                          RMRK,
                          ADJ_INCLUS_YN, -- 0: 미정산, 1: 정산
                          CASH_RECPT_RCGN_NO,
                          CASH_MGMTKEY,
                          DEL_YN,
                          REGR_ID,
                          MODR_ID)
                        SELECT @AGENT_ID AS AGENT_ID
                          , @CAR_REG_ID AS CAR_REG_ID
                          , '999' AS EXPD_ITEM_CD
                          , '상사매입비' AS EXPD_ITEM_NM
                          , '0' AS EXPD_SCT_CD           -- 0: 딜러선지출, 1: 상사선지출 
                          , @AGENT_PUR_CST AS EXPD_AMT
                          , ROUND(@AGENT_PUR_CST/1.1, 0) AS EXPD_SUP_PRC
                          , @AGENT_PUR_CST - ROUND(@AGENT_PUR_CST/1.1, 0) AS EXPD_VAT
                          , @AGENT_PUR_CST_PAY_DT AS EXPD_DT
                          , NULL AS EXPD_METH_CD
                          , @AGENT_PUR_CST_ISSU_CD AS EXPD_EVDC_CD
                          , CASE WHEN @AGENT_PUR_CST_ISSU_CD = '000' THEN '1' ELSE '0' END AS TAX_SCT_CD
                          , NULL AS TXBL_ISSU_DT  -- 현금, 세금계산서 발행시 셋팅
                          , NULL AS RMRK  -- REMARK
                          , CASE WHEN @AGENT_PUR_CST_ISSU_CD = '000' THEN '1' ELSE '0' END AS ADJ_INCLUS_YN
                          , NULL AS CASH_RECPT_RCGN_NO
                          , NULL AS CASH_MGMTKEY
                          , 'N' AS DEL_YN
                          , @REGR_ID AS REGR_ID
                          , @MODR_ID AS MODR_ID
                        ;`;

        await Promise.all([request.query(query3), request.query(query4)]);
    }



    // gainTax 취득세가 존재 하면 상품화비용에 적재

    if (gainTax > 0) {
      const query5 = `INSERT INTO dbo.CJB_GOODS_FEE (
        AGENT_ID,
        CAR_REG_ID,
        EXPD_ITEM_CD,
        EXPD_ITEM_NM,
        EXPD_SCT_CD,
        EXPD_AMT,
        EXPD_SUP_PRC,
        EXPD_VAT,
        EXPD_DT,
        EXPD_METH_CD,
        EXPD_EVDC_CD,
        TAX_SCT_CD,   -- 0: 미공제, 1: 공제
        TXBL_ISSU_DT,     
        RMRK,
        ADJ_INCLUS_YN, -- 0: 미정산, 1: 정산
        CASH_RECPT_RCGN_NO,
        CASH_MGMTKEY,
        DEL_YN,
        REGR_ID,
        MODR_ID)
      SELECT @AGENT_ID AS AGENT_ID
        , @CAR_REG_ID AS CAR_REG_ID
        , '998' AS EXPD_ITEM_CD
        , '취득세' AS EXPD_ITEM_NM
        , '0' AS EXPD_SCT_CD           -- 0: 딜러선지출, 1: 상사선지출 
        , @GAIN_TAX AS EXPD_AMT
        , 0 AS EXPD_SUP_PRC
        , 0 AS EXPD_VAT
        , NULL AS EXPD_DT
        , NULL AS EXPD_METH_CD
        , NULL AS EXPD_EVDC_CD
        , NULL AS TAX_SCT_CD
        , NULL AS TXBL_ISSU_DT  -- 현금, 세금계산서 발행시 셋팅
        , NULL AS RMRK  -- REMARK
        , '1' AS ADJ_INCLUS_YN
        , NULL AS CASH_RECPT_RCGN_NO
        , NULL AS CASH_MGMTKEY
        , 'N' AS DEL_YN
        , @REGR_ID AS REGR_ID
        , @MODR_ID AS MODR_ID
      ;`;

      await Promise.all([request.query(query5)]);
    }

  } catch (err) {
    console.error("Error inserting car pur:", err);
    throw err;
  }
  
};



// 제시 수정 등록 
exports.updateCarPur = async ({ 
    carRegId,                                                  // 차량 등록 ID
    agentId,                                                  // 상사사 ID
    purAmt,                                                    // 매입금액
    purSupPrc,                                                 // 공급가액
    purVat,                                                    // 부가세
    carPurDt,                                                  // 매입일   
    agentPurCst,                                               // 상사매입비
    brokerageDate,                                             // 상사매입비 입금일
    cstTypeCd,                                                 // 상사매입비 발행 코드
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
  request.input("AGENT_ID", sql.VarChar, agentId);
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
  request.input("OWNR_EMAIL", sql.VarChar, ownrEmail);
  request.input("OWNR_EMAIL_DOMAIN", sql.VarChar, emailDomain);
  request.input("PUR_AMT", sql.Decimal, purAmt);
  request.input("PUR_SUP_PRC", sql.Decimal, purSupPrc);
  request.input("PUR_VAT", sql.Decimal, purVat);
  request.input("GAIN_TAX", sql.Decimal, gainTax);
  request.input("AGENT_PUR_CST", sql.Decimal, agentPurCst);
  request.input("AGENT_PUR_CST_PAY_DT", sql.VarChar, brokerageDate);
  request.input("AGENT_PUR_CST_ISSU_CD", sql.VarChar, cstTypeCd);
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
        OWNR_EMAIL_DOMAIN = @OWNR_EMAIL_DOMAIN,
        PUR_AMT = @PUR_AMT,
        PUR_SUP_PRC = @PUR_SUP_PRC,
        PUR_VAT = @PUR_VAT,
        GAIN_TAX = @GAIN_TAX,
        AGENT_PUR_CST = @AGENT_PUR_CST,
        AGENT_PUR_CST_PAY_DT = @AGENT_PUR_CST_PAY_DT,
        AGENT_PUR_CST_ISSU_CD = @AGENT_PUR_CST_ISSU_CD,
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
  console.error("Error updating car pur:", err);
  throw err;
}
};


// 제시 삭제
exports.deleteCarPur = async ({carRegId, flag_type}) => {
  try {
    const request = pool.request();
    request.input("CAR_REGID", sql.VarChar, carRegId);

    let query = "";

    if(flag_type == "1") {

      query = `DELETE CJB_CAR_PUR
                        WHERE CAR_REG_ID = @CAR_REGID
                        AND CAR_DEL_YN = 'N'
            `;  
    } else {
      query = `UPDATE CJB_CAR_PUR
                        SET CAR_DEL_YN = 'Y'
                          , CAR_DEL_DT = GETDATE()
                        WHERE CAR_REG_ID = @CAR_REGID;
            `;  
    }

    console.log("query:", query);

    await request.query(query);

  } catch (err) {
    console.error("Error deleting car pur:", err);
    throw err;
  }
};
