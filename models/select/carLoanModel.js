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
  exports.getCarLoanSumList = async ({ 
    carAgent,
    page,
    pageSize,
    carNo,
    dealer,
    dtGubun,
    startDt,
    endDt, 
    dtlNewCarNo,
    dtlOldCarNo,
    dtlCapital,
    dtlLoanMemo,
    dtlLoanSctGubun,
    dtlLoanStatGubun,
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
      if (dtlNewCarNo) request.input("DTL_NEW_CAR_NO", sql.VarChar, dtlNewCarNo);
      if (dtlOldCarNo) request.input("DTL_OLD_CAR_NO", sql.VarChar, dtlOldCarNo);
      if (dtlCapital) request.input("LOAN_CORP_CD", sql.VarChar, dtlCapital);
      if (dtlLoanMemo) request.input("LOAN_MEMO", sql.VarChar, dtlLoanMemo);
      if (dtlLoanSctGubun) request.input("DTL_LOAN_SCT_GUBUN", sql.VarChar, dtlLoanSctGubun);
      if (dtlLoanStatGubun) request.input("DTL_LOAN_STAT_GUBUN", sql.VarChar, dtlLoanStatGubun);
  
      // 전체 카운트 조회
      const countQuery = `
                        SELECT COUNT(*) as totalCount
                        FROM dbo.CJB_CAR_PUR A, dbo.CJB_CAR_LOAN B
                        WHERE A.CAR_REG_ID = B.CAR_REG_ID
                            AND A.AGENT_ID = @CAR_AGENT
                            AND A.CAR_DEL_YN = 'N'
                ${carNo ? "AND A.CAR_NO LIKE @CAR_NO" : ""}
                ${dealer ? "AND A.DLR_ID LIKE @DEALER" : ""}
                ${startDt ? "AND A.CAR_PUR_DT >= @START_DT" : ""}
                ${endDt ? "AND A.CAR_PUR_DT <= @END_DT" : ""}
                ${dtlNewCarNo ? "AND A.CAR_NO LIKE @DTL_NEW_CAR_NO" : ""}
                ${dtlOldCarNo ? "AND A.PUR_BEF_CAR_NO LIKE @DTL_OLD_CAR_NO" : ""}
                ${dtlCapital ? "AND B.LOAN_CORP_CD LIKE @DTL_CAPITAL" : ""}
                ${dtlLoanMemo ? "AND B.LOAN_MEMO LIKE @LOAN_MEMO" : ""}
                ${dtlLoanSctGubun ? "AND B.LOAN_SCT_CD LIKE @DTL_LOAN_SCT_GUBUN" : ""}
                ${dtlLoanStatGubun ? "AND B.LOAN_STAT_CD LIKE @DTL_LOAN_STAT_GUBUN" : ""}
      `;


  
      const query = `SELECT B.LOAN_ID,           
                                A.DLR_ID DLR_ID,     
                                (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = A.DLR_ID) AS DLR_NM,    -- 딜러 명
                                A.CAR_REG_ID,
                                A.CAR_NO,         -- 차량번호
                                A.CAR_NM,         -- 차량명
                                A.CAR_PUR_DT,     -- 차량구매일
                                A.PUR_AMT,        -- 차량구매금액
                                B.LOAN_CORP_CD,
                                dbo.CJB_FN_GET_CD_NM('08', B.LOAN_CORP_CD) LOAN_CORP_NM, 
                                B.LOAN_AMT,
                                B.LOAN_DT,         -- 대출 실행 일자
                                B.LOAN_MM_CNT,
                                B.DLR_APLY_INTR_RT,
                                B.MM_INTR_AMT, 
                                B.LOAN_MM_CNT * B.MM_INTR_AMT AS TOT_INTR_AMT, 
                                B.TOT_PAY_INTR_AMT, 
                                B.RCNT_PAY_DTIME,
                                B.LOAN_SCT_CD, 
                                dbo.CJB_FN_GET_CD_NM('20', B.LOAN_CORP_CD) LOAN_SCT_NM
                      FROM dbo.CJB_CAR_PUR A
                         , dbo.CJB_CAR_LOAN B
                    WHERE 1 = 1
                      AND A.AGENT_ID = @CAR_AGENT
                      AND A.CAR_REG_ID = B.CAR_REG_ID
                      AND A.CAR_DEL_YN = 'N'
                ${carNo ? "AND A.CAR_NO LIKE @CAR_NO" : ""}
                ${dealer ? "AND A.DLR_ID LIKE @DEALER" : ""}
                ${startDt ? "AND A.CAR_PUR_DT >= @START_DT" : ""}
                ${endDt ? "AND A.CAR_PUR_DT <= @END_DT" : ""}
                ${dtlNewCarNo ? "AND A.CAR_NO LIKE @DTL_NEW_CAR_NO" : ""}
                ${dtlOldCarNo ? "AND A.PUR_BEF_CAR_NO LIKE @DTL_OLD_CAR_NO" : ""}
                ${dtlCapital ? "AND B.LOAN_CORP_CD LIKE @DTL_CAPITAL" : ""}
                ${dtlLoanMemo ? "AND B.LOAN_MEMO LIKE @LOAN_MEMO" : ""}
                ${dtlLoanSctGubun ? "AND B.LOAN_SCT_CD LIKE @DTL_LOAN_SCT_GUBUN" : ""}
                ${dtlLoanStatGubun ? "AND B.LOAN_STAT_CD LIKE @DTL_LOAN_STAT_GUBUN" : ""}
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
  exports.getCarLoanSummary= async ({     
    carAgent,
    page,
    pageSize,
    carNo,
    dealer,
    dtGubun,
    startDt,
    endDt, 
    dtlNewCarNo,
    dtlOldCarNo,
    dtlCapital,
    dtlLoanMemo,
    dtlLoanSctGubun,
    dtlLoanStatGubun,
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
      if (dtlNewCarNo) request.input("DTL_NEW_CAR_NO", sql.VarChar, dtlNewCarNo);
      if (dtlOldCarNo) request.input("DTL_OLD_CAR_NO", sql.VarChar, dtlOldCarNo);
      if (dtlCapital) request.input("LOAN_CORP_CD", sql.VarChar, dtlCapital);
      if (dtlLoanMemo) request.input("LOAN_MEMO", sql.VarChar, dtlLoanMemo);
      if (dtlLoanSctGubun) request.input("DTL_LOAN_SCT_GUBUN", sql.VarChar, dtlLoanSctGubun);
      if (dtlLoanStatGubun) request.input("DTL_LOAN_STAT_GUBUN", sql.VarChar, dtlLoanStatGubun);
  
  
      // 전체 카운트 조회
      const countQuery = `
                        SELECT COUNT(*) as totalCount
                        FROM dbo.CJB_AGENT_LOAN_CORP B
                          WHERE B.AGENT_ID = @CAR_AGENT
                ${carNo ? "AND CAR_NO LIKE @CAR_NO" : ""}
                ${dealer ? "AND DLR_ID LIKE @DEALER" : ""}
                ${startDt ? "AND CAR_PUR_DT >= @START_DT" : ""}
                ${endDt ? "AND CAR_PUR_DT <= @END_DT" : ""}
                ${dtlNewCarNo ? "AND A.CAR_NO LIKE @DTL_NEW_CAR_NO" : ""}
                ${dtlOldCarNo ? "AND A.PUR_BEF_CAR_NO LIKE @DTL_OLD_CAR_NO" : ""}
                ${dtlCapital ? "AND B.LOAN_CORP_CD LIKE @DTL_CAPITAL" : ""}
                ${dtlLoanMemo ? "AND B.LOAN_MEMO LIKE @LOAN_MEMO" : ""}
                ${dtlLoanSctGubun ? "AND B.LOAN_SCT_CD LIKE @DTL_LOAN_SCT_GUBUN" : ""}
                ${dtlLoanStatGubun ? "AND B.LOAN_STAT_CD LIKE @DTL_LOAN_STAT_GUBUN" : ""}
      `;
  
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
                ${carNo ? "AND A.CAR_NO LIKE @CAR_NO" : ""}
                ${dealer ? "AND A.DLR_ID = @DEALER" : ""}
                ${startDt ? "AND A.CAR_PUR_DT >= @START_DT" : ""}
                ${endDt ? "AND A.CAR_PUR_DT <= @END_DT" : ""}
                ${dtlNewCarNo ? "AND A.CAR_NO LIKE @DTL_NEW_CAR_NO" : ""}
                ${dtlOldCarNo ? "AND A.PUR_BEF_CAR_NO LIKE @DTL_OLD_CAR_NO" : ""}
                ${dtlCapital ? "AND B.LOAN_CORP_CD LIKE @DTL_CAPITAL" : ""}
                ${dtlLoanMemo ? "AND B.LOAN_MEMO LIKE @LOAN_MEMO" : ""}
                ${dtlLoanSctGubun ? "AND B.LOAN_SCT_CD LIKE @DTL_LOAN_SCT_GUBUN" : ""}
                ${dtlLoanStatGubun ? "AND B.LOAN_STAT_CD LIKE @DTL_LOAN_STAT_GUBUN" : ""}
                    ;`; 

 
      const result = await request.query(query);
      return result.recordset;  
  
    } catch (err) {
      console.error("Error fetching car loan car sum list:", err);
      throw err;
    }
  };
  
    
  // 재고 금융 등록
  exports.insertAgentLoanCorp = async ({
    agentId                     // 상사 ID        
  , loanCorpCd                  // 대출 업체 코드
  , loanCorpNm                  // 대출 업체 명  
  , totLmtAmt                   // 총 한도 금액  
  , totLoanAmt                  // 총 대출 금액  
  , totCnt                      // 총 건수       
  , rcntUtilDt                  // 최근 이용 일자
  , rpyFcstDt                   // 상환 예정 일자
  , regDtime                    // 등록 일시     
  , regrId                      // 등록자 ID     
  , modDtime                    // 수정 일시     
  , modrId                      // 수정자 ID     
  }) => {
  try {
    const request = pool.request();
  
    console.log("usrId:", regrId);
  
    request.input("AGENT_ID", sql.VarChar, agentId);                         // 상사 ID
    request.input("LOAN_CORP_CD", sql.VarChar, loanCorpCd);                  // 대출 업체 코드 
    request.input("LOAN_CORP_NM", sql.VarChar, loanCorpNm);                  // 대출 업체 명
    request.input("TOT_LMT_AMT", sql.Int, totLmtAmt);                        // 총 한도 금액
    request.input("TOT_LOAN_AMT", sql.Int, totLoanAmt);                      // 총 대출 금액
    request.input("TOT_CNT", sql.Int, totCnt);                               // 총 건수
    request.input("RCNT_UTIL_DT", sql.VarChar, rcntUtilDt);                  // 최근 이용 일자
    request.input("RPY_FCST_DT", sql.VarChar, rpyFcstDt);                    // 상환 예정 일자
    request.input("REGR_ID", sql.VarChar, regrId);                           // 등록자 ID
    request.input("MODR_ID", sql.VarChar, modrId);                           // 수정자 ID
  
    const query1 = `INSERT INTO dbo.CJB_AGENT_LOAN_CORP (
                    AGENT_ID,
                    LOAN_CORP_CD,
                    LOAN_CORP_NM,
                    TOT_LMT_AMT,
                    TOT_LOAN_AMT,
                    TOT_CNT,
                    RCNT_UTIL_DT,
                    RPY_FCST_DT,
                    REG_DTIME,
                    REGR_ID,
                    MOD_DTIME,
                    MODR_ID
                  ) VALUES (
                    @AGENT_ID,
                    @LOAN_CORP_CD,
                    @LOAN_CORP_NM,
                    @TOT_LMT_AMT,
                    @TOT_LOAN_AMT,
                    @TOT_CNT,
                    @RCNT_UTIL_DT,
                    @RPY_FCST_DT,
                    GETDATE(),
                    @REGR_ID,
                    GETDATE(),
                    @MODR_ID
                  )`;
  
   
    // 재고 금융
    const query2 = `UPDATE dbo.CJB_CAR_PUR
            SET CAR_LOAN_CNT = CAR_LOAN_CNT + 1
                , CAR_LOAN_AMT = CAR_LOAN_AMT + @TOT_LOAN_AMT
            WHERE AGENT_ID = @AGENT_ID
              AND LOAN_CORP_CD = @LOAN_CORP_CD;
  `;
  
    await Promise.all([request.query(query1), request.query(query2)]);
  
  } catch (err) {
    console.error("Error inserting car loan:", err);
    throw err;
  }
  };
  
      
  // 재고 금융 등록
exports.insertCarLoan = async ({
  loanSeq                      // 대출 순번        
, carRegId                     // 차량 등록 ID     
, loanSctCd                    // 대출 구분 코드   
, loanDt                       // 대출 일자        
, loanAmt                      // 대출 금액        
, loanCorpIntrRt              // 대출 업체 이자 율
, dlrAplyIntrRt               // 딜러 적용 이자 율
, totPayIntrAmt               // 총 납입 이자 금액
, rpyFcstDt                   // 상환 예정 일자   
, loanMemo                    // 대출 메모        
, agentId                     // 상사 ID          
, loanCorpCd                  // 대출 업체 코드   
, regDtime                    // 등록 일시        
, regrId                      // 등록자 ID        
, modDtime                    // 수정 일시        
, modrId                      // 수정자 ID        
}) => {
try {
  const request = pool.request();

  console.log("usrId:", usrId);

  // car_reg_id 값도 미리 만들기
  request.input("carAgent", sql.VarChar, carAgent); 
  const carRegId = await request.query(`SELECT dbo.CJB_FN_MK_CAR_REG_ID(@carAgent) as CAR_REG_ID`);
  const newCarRegId = carRegId.recordset[0].CAR_REG_ID;

  request.input("LOAN_SEQ", sql.Int, loanSeq);                              // 대출 순번
  request.input("CAR_REG_ID", sql.VarChar, carRegId);                      // 차량 등록 ID
  request.input("LOAN_SCT_CD", sql.VarChar, loanSctCd);                    // 대출 구분 코드
  request.input("LOAN_DT", sql.VarChar, loanDt);                           // 대출 일자
  request.input("LOAN_AMT", sql.Int, loanAmt);                             // 대출 금액
  request.input("LOAN_CORP_INTR_RT", sql.Decimal, loanCorpIntrRt);        // 대출 업체 이자율
  request.input("DLR_APLY_INTR_RT", sql.Decimal, dlrAplyIntrRt);          // 딜러 적용 이자율
  request.input("TOT_PAY_INTR_AMT", sql.Int, totPayIntrAmt);              // 총 납입 이자 금액
  request.input("RPY_FCST_DT", sql.VarChar, rpyFcstDt);                   // 상환 예정 일자
  request.input("LOAN_MEMO", sql.VarChar, loanMemo);                       // 대출 메모
  request.input("AGENT_ID", sql.VarChar, agentId);                         // 상사 ID
  request.input("LOAN_CORP_CD", sql.VarChar, loanCorpCd);                  // 대출 업체 코드
  request.input("REG_DTIME", sql.VarChar, regDtime);                       // 등록 일시
  request.input("REGR_ID", sql.VarChar, regrId);                          // 등록자 ID
  request.input("MOD_DTIME", sql.VarChar, modDtime);                       // 수정 일시
  request.input("MODR_ID", sql.VarChar, modrId);                          // 수정자 ID

  const query1 = `INSERT INTO dbo.CJB_CAR_LOAN (
                  CAR_REG_ID,
                  LOAN_SCT_CD,
                  LOAN_DT,
                  LOAN_AMT,
                  LOAN_CORP_INTR_RT,
                  DLR_APLY_INTR_RT,
                  TOT_PAY_INTR_AMT,
                  RPY_FCST_DT,
                  LOAN_MEMO,
                  AGENT_ID,
                  LOAN_CORP_CD,
                  REG_DTIME,
                  REGR_ID,
                  MOD_DTIME,
                  MODR_ID
                ) VALUES (
                  @CAR_REG_ID,
                  @LOAN_SCT_CD,
                  @LOAN_DT,
                  @LOAN_AMT,
                  @LOAN_CORP_INTR_RT,
                  @DLR_APLY_INTR_RT,
                  @TOT_PAY_INTR_AMT,
                  @RPY_FCST_DT,
                  @LOAN_MEMO,
                  @AGENT_ID,
                  @LOAN_CORP_CD,
                  GETDATE(),
                  @REGR_ID,
                  GETDATE(),
                  @MODR_ID
                )`;

 
  // 재고 금융
  const query2 = `UPDATE dbo.CJB_AGENT_LOAN_CORP
          SET TOT_LOAN_AMT = TOT_LOAN_AMT + @LOAN_AMT
          WHERE AGENT_ID = @AGENT_ID
            AND LOAN_CORP_CD = @LOAN_CORP_CD;
`;

  await Promise.all([request.query(query1), request.query(query2)]);

} catch (err) {
  console.error("Error inserting car loan:", err);
  throw err;
}
};


// 재고 금융 수정
exports.updateAgentLoanCorp = async ({ 
    agentId                     // 상사 ID        
  , loanCorpCd                  // 대출 업체 코드
  , loanCorpNm                  // 대출 업체 명  
  , totLmtAmt                   // 총 한도 금액  
  , totLoanAmt                  // 총 대출 금액  
  , totCnt                      // 총 건수       
  , rcntUtilDt                  // 최근 이용 일자
  , rpyFcstDt                   // 상환 예정 일자
  , regrId                      // 등록자 ID     
  , modrId                      // 수정자 ID     
}) => {
try {
const request = pool.request();

request.input("AGENT_ID", sql.VarChar, agentId);                         // 상사 ID
request.input("LOAN_CORP_CD", sql.VarChar, loanCorpCd);                  // 대출 업체 코드 
request.input("LOAN_CORP_NM", sql.VarChar, loanCorpNm);                  // 대출 업체 명
request.input("TOT_LMT_AMT", sql.Int, totLmtAmt);                        // 총 한도 금액
request.input("TOT_LOAN_AMT", sql.Int, totLoanAmt);                      // 총 대출 금액
request.input("TOT_CNT", sql.Int, totCnt);                               // 총 건수
request.input("RCNT_UTIL_DT", sql.VarChar, rcntUtilDt);                  // 최근 이용 일자
request.input("RPY_FCST_DT", sql.VarChar, rpyFcstDt);                    // 상환 예정 일자
request.input("REGR_ID", sql.VarChar, regrId);                           // 등록자 ID
request.input("MODR_ID", sql.VarChar, modrId);                           // 수정자 ID

const query1 = `
  UPDATE CJB_AGENT_LOAN_CORP  
  SET LOAN_CORP_NM = @LOAN_CORP_NM,
      TOT_LMT_AMT = @TOT_LMT_AMT, 
      TOT_LOAN_AMT = @TOT_LOAN_AMT,
      TOT_CNT = @TOT_CNT,
      RCNT_UTIL_DT = @RCNT_UTIL_DT,
      RPY_FCST_DT = @RPY_FCST_DT,
      MOD_DTIME = GETDATE(),
      MODR_ID = @MODR_ID
  WHERE AGENT_ID = @AGENT_ID
    AND LOAN_CORP_CD = @LOAN_CORP_CD;
`;  

await Promise.all([request.query(query1)]);

} catch (err) {
console.error("Error updating agent loan corp:", err);
throw err;
}
};


// 재고 금융 수정
exports.updateCarLoan = async ({ 
  loanSeq                      // 대출 순번        
, carRegId                     // 차량 등록 ID     
, loanSctCd                    // 대출 구분 코드   
, loanDt                       // 대출 일자        
, loanAmt                      // 대출 금액        
, loanCorpIntrRt              // 대출 업체 이자 율
, dlrAplyIntrRt               // 딜러 적용 이자 율
, totPayIntrAmt               // 총 납입 이자 금액
, rpyFcstDt                   // 상환 예정 일자   
, loanMemo                    // 대출 메모        
, agentId                     // 상사 ID          
, loanCorpCd                  // 대출 업체 코드   
, regDtime                    // 등록 일시        
, regrId                      // 등록자 ID        
, modDtime                    // 수정 일시        
, modrId                      // 수정자 ID        
}) => {
try {
const request = pool.request();

request.input("LOAN_SEQ", sql.Int, loanSeq);                              // 대출 순번
request.input("CAR_REG_ID", sql.VarChar, carRegId);                      // 차량 등록 ID
request.input("LOAN_SCT_CD", sql.VarChar, loanSctCd);                    // 대출 구분 코드
request.input("LOAN_DT", sql.VarChar, loanDt);                           // 대출 일자
request.input("LOAN_AMT", sql.Int, loanAmt);                             // 대출 금액
request.input("LOAN_CORP_INTR_RT", sql.Decimal, loanCorpIntrRt);        // 대출 업체 이자율
request.input("DLR_APLY_INTR_RT", sql.Decimal, dlrAplyIntrRt);          // 딜러 적용 이자율
request.input("TOT_PAY_INTR_AMT", sql.Int, totPayIntrAmt);              // 총 납입 이자 금액
request.input("RPY_FCST_DT", sql.VarChar, rpyFcstDt);                   // 상환 예정 일자
request.input("LOAN_MEMO", sql.VarChar, loanMemo);                       // 대출 메모
request.input("AGENT_ID", sql.VarChar, agentId);                         // 상사 ID
request.input("LOAN_CORP_CD", sql.VarChar, loanCorpCd);                  // 대출 업체 코드
request.input("REGR_ID", sql.VarChar, regrId);                          // 등록자 ID
request.input("MODR_ID", sql.VarChar, modrId);                          // 수정자 ID

const query1 = `
  UPDATE CJB_CAR_LOAN
  SET LOAN_SCT_CD = @LOAN_SCT_CD,
      LOAN_DT = @LOAN_DT,
      LOAN_AMT = @LOAN_AMT,
      LOAN_CORP_INTR_RT = @LOAN_CORP_INTR_RT,
      DLR_APLY_INTR_RT = @DLR_APLY_INTR_RT,
      TOT_PAY_INTR_AMT = @TOT_PAY_INTR_AMT,
      RPY_FCST_DT = @RPY_FCST_DT,
      LOAN_MEMO = @LOAN_MEMO,
      AGENT_ID = @AGENT_ID,
      LOAN_CORP_CD = @LOAN_CORP_CD,
      MOD_DTIME = GETDATE(),
      MODR_ID = @MODR_ID
  WHERE LOAN_SEQ = @LOAN_SEQ;
`;  

const query2 = `
  UPDATE CJB_AGENT_LOAN_CORP
  SET TOT_LOAN_AMT = (SELECT SUM(LOAN_AMT) 
                        FROM CJB_CAR_LOAN 
                       WHERE AGENT_ID = @AGENT_ID 
                         AND LOAN_CORP_CD = @LOAN_CORP_CD)
    , MOD_DTIME = GETDATE()
  WHERE AGENT_ID = @AGENT_ID
    AND LOAN_CORP_CD = @LOAN_CORP_CD;
`;

await Promise.all([request.query(query1), request.query(query2)]);

} catch (err) {
console.error("Error updating car pur:", err);
throw err;
}
};


// 재고 금융 삭제
exports.deleteCarLoan = async ({car_regid, flag_type}) => {
  try {
    const request = pool.request();
    request.input("CAR_REGID", sql.VarChar, car_regid);

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
    console.error("Error deleting car loan:", err);
    throw err;
  }
};


// 재고 금융 삭제
exports.deleteAgentLoanCorp = async ({agent_id, loan_corp_cd, flag_type}) => {
  try {
    const request = pool.request();
    request.input("AGENT_ID", sql.VarChar, agent_id);
    request.input("LOAN_CORP_CD", sql.VarChar, loan_corp_cd);

    let query = "";

    if(flag_type == "1") {

      query = `DELETE CJB_AGENT_LOAN_CORP
                        WHERE AGENT_ID = @AGENT_ID
                        AND LOAN_CORP_CD = @LOAN_CORP_CD
            `;  
    } else {
      query = `UPDATE CJB_AGENT_LOAN_CORP
                        SET MOD_DTIME = GETDATE()
                          , MODR_ID = @MODR_ID
                        WHERE AGENT_ID = @AGENT_ID
                        AND LOAN_CORP_CD = @LOAN_CORP_CD;
            `;  
    }

    console.log("query:", query);

    await request.query(query);

  } catch (err) {
    console.error("Error deleting car loan:", err);
    throw err;
  }
};
