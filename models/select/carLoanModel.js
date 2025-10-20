const sql = require("mssql");
const pool = require("../../config/db");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 재고금융 2.0
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// 재고금융 리스트 조회 
exports.getCarLoanList = async ({   agentId, 
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
    orderItem = '제시일',
    ordAscDesc = 'desc' }) => {
    try {
      const request = pool.request();
      request.input("CAR_AGENT", sql.VarChar, agentId);
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
 
      // 전체 카운트 조회
      const countQuery = `SELECT COUNT(*) as totalCount
                            FROM dbo.CJB_CAR_PUR A
                           INNER JOIN dbo.CJB_CAR_LOAN B ON (A.CAR_REG_ID = B.CAR_REG_ID)
                            LEFT JOIN dbo.CJB_LOAN_INTR_PAY C ON (B.LOAN_ID = C.LOAN_ID)
                           WHERE 1 = 1
                             AND A.AGENT_ID = @CAR_AGENT
                ${carNo ? "AND A.CAR_NO LIKE @CAR_NO" : ""}
                ${dealer ? "AND A.DLR_ID LIKE @DEALER" : ""}
                ${startDt ? "AND A.CAR_PUR_DT >= @START_DT" : ""}
                ${endDt ? "AND A.CAR_PUR_DT <= @END_DT" : ""}
                ${dtlNewCarNo ? "AND A.CAR_NO LIKE @DTL_NEW_CAR_NO" : ""}
                ${dtlOldCarNo ? "AND A.PUR_BEF_CAR_NO LIKE @DTL_OLD_CAR_NO" : ""}
                ${dtlCapital ? "AND B.LOAN_CORP_CD LIKE @DTL_CAPITAL" : ""}
                ${dtlLoanMemo ? "AND B.LOAN_MEMO LIKE @LOAN_MEMO" : ""}
          `;

      console.log(countQuery);
  
      const query = `SELECT B.LOAN_ID,           
                                A.DLR_ID DLR_ID,     
                                (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = A.DLR_ID) AS DLR_NM,    -- 딜러 명
                                A.CAR_REG_ID,
                                A.CAR_NO,         -- 차량번호
                                A.CAR_NM,         -- 차량명
                                A.CAR_PUR_DT,     -- 차량구매일
                                A.PUR_AMT,        -- 차량구매금액
                                B.LOAN_CORP_CD, -- 대출 업체 코드
                                dbo.CJB_FN_GET_CD_NM('08', B.LOAN_CORP_CD) LOAN_CORP_NM, 
                                B.LOAN_AMT, -- 대출 금액
                                B.LOAN_DT,         -- 대출 실행 일자
                                B.LOAN_MM_CNT, -- 대출 개월 수
                                B.DLR_APLY_INTR_RT, -- 딜러 적용 이자율
                                B.MM_INTR_AMT, -- 월 이자액
                                B.LOAN_MM_CNT * B.MM_INTR_AMT AS TOT_INTR_AMT, -- 총 이자액
                                B.TOT_PAY_INTR_AMT, -- 총 납입 이자액
                                B.RCNT_PAY_DTIME, -- 최근 납입 일자
                                B.LOAN_SCT_CD, -- 대출 구분 코드
                                dbo.CJB_FN_GET_CD_NM('20', B.LOAN_CORP_CD) LOAN_SCT_NM,
                                B.LOAN_STAT_CD, -- 대출 상태 코드
                                dbo.CJB_FN_GET_CD_NM('20', B.LOAN_STAT_CD) LOAN_STAT_NM, 
                                ISNULL(C.INTR_PAY_AMT, 0) INTR_PAY_AMT,
                                C.INTR_PAY_DT
                      FROM dbo.CJB_CAR_PUR A
                     INNER JOIN dbo.CJB_CAR_LOAN B ON (A.CAR_REG_ID = B.CAR_REG_ID)
                      LEFT JOIN dbo.CJB_LOAN_INTR_PAY C ON (B.LOAN_ID = C.LOAN_ID)
                    WHERE 1 = 1
                      AND A.AGENT_ID = @CAR_AGENT
                  ${carNo ? "AND A.CAR_NO LIKE @CAR_NO" : ""}
                  ${dealer ? "AND A.DLR_ID LIKE @DEALER" : ""}
                  ${startDt ? "AND A.CAR_PUR_DT >= @START_DT" : ""}
                  ${endDt ? "AND A.CAR_PUR_DT <= @END_DT" : ""}
                  ${dtlNewCarNo ? "AND A.CAR_NO LIKE @DTL_NEW_CAR_NO" : ""}
                  ${dtlOldCarNo ? "AND A.PUR_BEF_CAR_NO LIKE @DTL_OLD_CAR_NO" : ""}
                  ${dtlCapital ? "AND B.LOAN_CORP_CD LIKE @DTL_CAPITAL" : ""}
                  ${dtlLoanMemo ? "AND B.LOAN_MEMO LIKE @LOAN_MEMO" : ""}
                      ORDER BY ${orderItem === '실행일' ? 'LOAN_DT' : orderItem === '결제일' ? 'INTR_PAY_DT' : orderItem === '이자납입일' ? 'INTR_PAY_DT' : 'LOAN_DT'} ${ordAscDesc}
                      OFFSET (@PAGE - 1) * @PAGESIZE ROWS
                      FETCH NEXT @PAGESIZE ROWS ONLY
                      `;
  
      console.log(query);
      // 두 쿼리를 동시에 실행
      const [countResult, dataResult] = await Promise.all([
        request.query(countQuery),
        request.query(query)
      ]);
  
      const totalCount = countResult.recordset[0].totalCount;
      const totalPages = Math.ceil(totalCount / pageSize);
  
      return {
        loanList: dataResult.recordset,
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
      console.error("Error fetching car loan list:", err);
      throw err;
    }
  }
  
  
  // 재고금융 차량별 리스트 조회
  exports.getCarLoanSumList = async ({ 
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
    dtlCapital,
    dtlLoanMemo,
    dtlLoanSctGubun,
    dtlLoanStatGubun,
    orderItem = '제시일',
    ordAscDesc = 'desc'
    }) => {
    try {
      const request = pool.request();
      request.input("CAR_AGENT", sql.VarChar, agentId);
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
                        FROM dbo.CJB_CAR_PUR A
                           , dbo.CJB_CAR_LOAN B
                        WHERE A.CAR_REG_ID = B.CAR_REG_ID
                          AND A.AGENT_ID = @CAR_AGENT
                 --       AND A.CAR_DEL_YN = 'N'
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

      console.log(countQuery);
  
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
                                dbo.CJB_FN_GET_CD_NM('20', B.LOAN_CORP_CD) LOAN_SCT_NM,
                                B.LOAN_STAT_CD,
                                dbo.CJB_FN_GET_CD_NM('20', B.LOAN_STAT_CD) LOAN_STAT_NM
                      FROM dbo.CJB_CAR_PUR A
                         , dbo.CJB_CAR_LOAN B
                    WHERE 1 = 1
                      AND A.AGENT_ID = @CAR_AGENT
                      AND A.CAR_REG_ID = B.CAR_REG_ID
                      --AND A.CAR_DEL_YN = 'N'
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
                      ORDER BY ${orderItem === '실행일' ? 'LOAN_DT' : orderItem === '결제일' ? 'INTR_PAY_DT' : orderItem === '이자납입일' ? 'INTR_PAY_DT' : 'LOAN_DT'} ${ordAscDesc}
                      OFFSET (@PAGE - 1) * @PAGESIZE ROWS
                      FETCH NEXT @PAGESIZE ROWS ONLY
                      `;

      console.log(query);

      const [countResult, dataResult] = await Promise.all([
        request.query(countQuery),
        request.query(query)
      ]);
  
      const totalCount = countResult.recordset[0].totalCount;
      const totalPages = Math.ceil(totalCount / pageSize);  
  
      return {
        loanList: dataResult.recordset,
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
      console.error("Error fetching car loan list:", err);
      throw err;
    }
  };
  
  
  
  // 재고금융 차량별 리스트 조회
  exports.getCarLoanSummary= async ({     
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
    dtlCapital,
    dtlLoanMemo,
    dtlLoanSctGubun,
    dtlLoanStatGubun,
    orderItem = '제시일',
    ordAscDesc = 'desc'
   }) => {
    try {
      const request = pool.request();
      request.input("CAR_AGENT", sql.VarChar, agentId);
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


  // 차량 대출 정보 조회
  exports.getCarLoanInfo = async ({ carRegId }) => {
    try {
      const request = pool.request();
      request.input("CAR_REG_ID", sql.VarChar, carRegId);
      const query = `SELECT A.LOAN_AMT
                        , A.LOAN_CORP_INTR_RT 
                        , A.LOAN_DT
                        , A.TOT_PAY_INTR_AMT
                    FROM dbo.CJB_CAR_LOAN A
                    WHERE  A.CAR_REG_ID = @CAR_REG_ID
                    ;`;
      const result = await request.query(query);
      return result.recordset;
    } catch (err) {
      console.error("Error fetching car loan info:", err);
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
  , usrId                       // 사용자 ID
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
    request.input("REGR_ID", sql.VarChar, usrId);                            // 등록자 ID
    request.input("MODR_ID", sql.VarChar, usrId);                            // 수정자 ID
  
    const query1 = `INSERT INTO dbo.CJB_AGENT_LOAN_CORP (
                    AGENT_ID,
                    LOAN_CORP_CD,
                    LOAN_CORP_NM,
                    TOT_LMT_AMT,
                    TOT_LOAN_AMT,
                    TOT_CNT,
                    RCNT_UTIL_DT,
                    RPY_FCST_DT,
                    REGR_ID,
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
                    @REGR_ID,
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
  agentId,                // 상사 ID
  carRegId,               // 차량 등록 ID
  loanCorpCd,           // 대출회사 코드
  loanAmt,                 // 대출금액
  loanDt,                   // 대출실행일
  loanMmCnt,             // 대출기간
  loanCorpIntrRt,   // 캐피탈이율
  dlrAplyIntrRt,     // 딜러이율
  loanSctCd,             // 대출유형
  loanMemo,               // 특이사항 
  usrId                  // 사용자 ID
}) => {
try {
  const request = pool.request();

  // car_reg_id 값도 미리 만들기
  request.input("AGENT_ID", sql.VarChar, agentId); 
  const loanID = await request.query(`SELECT dbo.CJB_FN_MK_LOAN_NO(@AGENT_ID) as LOAN_ID`);
  const newLoanId = loanID.recordset[0].LOAN_ID;
  request.input("LOAN_ID", sql.VarChar, newLoanId);                        // 대출 ID
  request.input("CAR_REG_ID", sql.VarChar, carRegId);                      // 차량 등록 ID
  request.input("LOAN_CORP_CD", sql.VarChar, loanCorpCd);                  // 대출회사 코드
  request.input("LOAN_SCT_CD", sql.VarChar, loanSctCd);                    // 대출 구분 코드
  request.input("LOAN_DT", sql.VarChar, loanDt);                           // 대출 일자
  request.input("LOAN_AMT", sql.Int, loanAmt);                             // 대출 금액
  request.input("LOAN_MM_CNT", sql.Int, loanMmCnt);                        // 대출 기간
  request.input("LOAN_CORP_INTR_RT", sql.Decimal, loanCorpIntrRt);         // 대출 업체 이자율
  request.input("DLR_APLY_INTR_RT", sql.Decimal, dlrAplyIntrRt);           // 딜러 적용 이자율
  request.input("LOAN_MEMO", sql.VarChar, loanMemo);                       // 대출 메모
  request.input("REGR_ID", sql.VarChar, usrId);                            // 등록자 ID
  request.input("MODR_ID", sql.VarChar, usrId);                            // 수정자 ID

  // 재고 금융
  const query1 = `INSERT INTO dbo.CJB_CAR_LOAN (
                  LOAN_ID,
                  CAR_REG_ID,
                  LOAN_SCT_CD,
                  LOAN_DT,
                  LOAN_AMT,
                  LOAN_CORP_INTR_RT,
                  DLR_APLY_INTR_RT,
                  LOAN_MEMO,
                  LOAN_CORP_CD,
                  AGENT_ID,
                  REGR_ID,
                  MODR_ID
                ) VALUES (
                  @LOAN_ID,
                  @CAR_REG_ID,
                  @LOAN_SCT_CD,
                  @LOAN_DT,
                  @LOAN_AMT,
                  @LOAN_CORP_INTR_RT,
                  @DLR_APLY_INTR_RT,
                  @LOAN_MEMO,
                  @LOAN_CORP_CD,
                  @AGENT_ID,
                  @REGR_ID,
                  @MODR_ID
                )`;
 
  // 재고 금융 업체 
  const query2 = `UPDATE dbo.CJB_AGENT_LOAN_CORP
          SET TOT_LOAN_AMT = TOT_LOAN_AMT + @LOAN_AMT
            , TOT_CNT = TOT_CNT + 1
            , RCNT_UTIL_DT = GETDATE()
            , MOD_DTIME = GETDATE()
            , MODR_ID = @MODR_ID
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
, usrId                       // 사용자 ID
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
    request.input("LOAN_MEMO", sql.VarChar, loanMemo);                      // 대출 메모
    request.input("AGENT_ID", sql.VarChar, agentId);                        // 상사 ID
    request.input("LOAN_CORP_CD", sql.VarChar, loanCorpCd);                 // 대출 업체 코드
    request.input("REGR_ID", sql.VarChar, usrId);                           // 등록자 ID
    request.input("MODR_ID", sql.VarChar, usrId);                           // 수정자 ID

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
        , MODR_ID = @MODR_ID
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
exports.deleteCarLoan = async ({carRegId, flag_type}) => {
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
    console.error("Error deleting car loan:", err);
    throw err;
  }
};


// 재고 금융 삭제
exports.deleteAgentLoanCorp = async ({agentId, loan_corp_cd, flag_type}) => {
  try {
    const request = pool.request();
    request.input("AGENT_ID", sql.VarChar, agentId);
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


// 대출 이자 납입 리스트 조회 
exports.getCarIntrPayList = async ({ 
    loanId,
    orderItem = '제시일',
    ordAscDesc = 'desc' }) => {
    try {
      const request = pool.request();
      request.input("LOAN_ID", sql.VarChar, loanId);
      // 전체 카운트 조회
      const countQuery = `SELECT COUNT(*) as totalCount
                            FROM dbo.CJB_LOAN_INTR_PAY A
                           WHERE 1 = 1
                             AND A.LOAN_ID = @LOAN_ID
          `;

      console.log(countQuery);
  
      const query = `SELECT A.PAY_SEQ
                          , A.INTR_PAY_DT
                          , A.INTR_PAY_AMT
                          , A.REG_DTIME
                          , A.REGR_ID
                          , A.MOD_DTIME
                          , A.MODR_ID
                      FROM dbo.CJB_LOAN_INTR_PAY A
                    WHERE 1 = 1
                      AND A.LOAN_ID = @LOAN_ID
                      ORDER BY ${orderItem === '01' ? 'A.INTR_PAY_DT' : orderItem === '02' ? 'A.REG_DTIME' : 'A.INTR_PAY_DT'} ${ordAscDesc}
                      OFFSET (@PAGE - 1) * @PAGESIZE ROWS
                      FETCH NEXT @PAGESIZE ROWS ONLY
                      `;
  
      console.log(query);
      // 두 쿼리를 동시에 실행
      const [countResult, dataResult] = await Promise.all([
        request.query(countQuery),
        request.query(query)
      ]);
  
      const totalCount = countResult.recordset[0].totalCount;
      const totalPages = Math.ceil(totalCount / pageSize);
  
      return {
        loanList: dataResult.recordset,
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
      console.error("Error fetching car loan list:", err);
      throw err;
    }
  }

// 이자 납입 수정
exports.updateCarIntrPay = async ({ 
    loanId                      // 상사 ID        
  , paySeq                      // 납입 순번
  , intrPayDt                   // 이자 납입 일자  
  , intrPayAmt                  // 이자 납입 금액
  , usrId                       // 사용자 ID
}) => {
  try {

    const request = pool.request();

    request.input("LOAN_ID", sql.VarChar, loanId);                          // 상사 ID
    request.input("PAY_SEQ", sql.Int, paySeq);                              // 납입 순번 
    request.input("INTR_PAY_DT", sql.VarChar, intrPayDt);                   // 이자 납입 일자 
    request.input("INTR_PAY_AMT", sql.Int, intrPayAmt);                     // 이자 납입 금액
    request.input("MODR_ID", sql.VarChar, usrId);                           // 수정자 ID

    const query1 = `
      UPDATE dbo.CJB_LOAN_INTR_PAY
      SET INTR_PAY_DT = @INTR_PAY_DT,
          INTR_PAY_AMT = @INTR_PAY_AMT, 
          MOD_DTIME = GETDATE(),
          MODR_ID = @MODR_ID
      WHERE LOAN_ID = @LOAN_ID
        AND PAY_SEQ = @PAY_SEQ;
    `;  

    const query2 = `
      UPDATE dbo.CJB_LOAN
      SET LOAN_AMT = LOAN_AMT + @INTR_PAY_AMT
          MOD_DTIME = GETDATE(),
          MODR_ID = @MODR_ID
      WHERE LOAN_ID = @LOAN_ID
    `; 

    await Promise.all([request.query(query1), request.query(query2)]);

  } catch (err) {
    console.error("Error updating agent loan corp:", err);
    throw err;
  }
};


// 이자 납입 삭제
exports.deleteCarIntrPay = async ({ 
    loanId                      // 상사 ID        
  , paySeq                      // 납입 순번
  , intrPayDt                   // 이자 납입 일자  
  , intrPayAmt                  // 이자 납입 금액
  , usrId                       // 사용자 ID
}) => {
  try {
    const request = pool.request();

    request.input("LOAN_ID", sql.VarChar, loanId);                          // 상사 ID
    request.input("PAY_SEQ", sql.Int, paySeq);                              // 납입 순번 
    request.input("INTR_PAY_DT", sql.VarChar, intrPayDt);                   // 이자 납입 일자 
    request.input("INTR_PAY_AMT", sql.Int, intrPayAmt);                     // 이자 납입 금액
    request.input("MODR_ID", sql.VarChar, usrId);                           // 수정자 ID

    const query1 = `
      DELETE dbo.CJB_CAR_INTR_PAY
       WHERE LOAN_ID = @LOAN_ID
         AND PAY_SEQ = @PAY_SEQ;
    `;  

    const query2 = `
      UPDATE dbo.CJB_LOAN
      SET LOAN_AMT = LOAN_AMT - @INTR_PAY_AMT
          MOD_DTIME = GETDATE(),
          MODR_ID = @MODR_ID
      WHERE LOAN_ID = @LOAN_ID
    `; 

    await Promise.all([request.query(query1), request.query(query2)]);

  } catch (err) {
    console.error("Error updating car pur:", err);
    throw err;
  }
};


// 차량 대출 정보 조회
exports.getCarLoanCorpList = async ({ agentId }) => {
  try {
    const request = pool.request();
    request.input("AGENT_ID", sql.VarChar, agentId);

    const query = `SELECT B.LOAN_CORP_CD, 
                             B.LOAN_CORP_NM,       -- 캐피탈사사
                             B.TOT_LMT_AMT,        -- 총 대출한도액
                             B.TOT_LOAN_AMT,       -- 총 대출액
                             (TOT_LMT_AMT - TOT_LOAN_AMT) AS LMT_AMT, -- 남은 한도액
                             (TOT_LOAN_AMT/TOT_LMT_AMT) * 100 AS RT -- 사용률률
                    FROM dbo.CJB_AGENT_LOAN_CORP B
                    WHERE B.AGENT_ID = @AGENT_ID
                    ORDER BY B.LOAN_CORP_CD;`;

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching car loan corp list:", err);
    throw err;
  }
};
  


// 대출 한건에 대한 정보
exports.getCarLoanIdOneInfo = async ({ loanId }) => {
  try {
    const request = pool.request();
    request.input("LOAN_ID", sql.VarChar, loanId);

    const query = `SELECT B.LOAN_ID,
                          B.CAR_REG_ID, 
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
                          dbo.CJB_FN_GET_CD_NM('20', B.LOAN_CORP_CD) LOAN_SCT_NM,
                          B.LOAN_STAT_CD,
                          dbo.CJB_FN_GET_CD_NM('20', B.LOAN_STAT_CD) LOAN_STAT_NM,
                          B.LOAN_MEMO
                    FROM dbo.CJB_CAR_LOAN B
                    WHERE B.LOAN_ID = @LOAN_ID;`;

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching car loan corp list:", err);
    throw err;
  }
};
  