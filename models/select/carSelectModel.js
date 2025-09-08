const sql = require("mssql");
const pool = require("../../config/db");



////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 시스템 사용 요청 조회
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 시스템 사용 요청 조회
exports.getSystemUseRequest = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);  

    const query = `SELECT DBO.SMJ_FN_MK_AGENT() as agent,
                          CONVERT(VARCHAR(10), DATEADD(DAY, 3650, GETDATE()), 21) as alive_dt,
                          COUNT(*) cnt
                     FROM SMJ_USER
                    WHERE LOGINID = 'SS';
                    `;  

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching system use request:", err);
    throw err;
  }
};



 // 인증번호 조회
exports.checkSangsaCode = async ({ SangsaCode }) => {
  try {
    const request = pool.request();
    request.input("SS_CODE", sql.VarChar, SangsaCode);  

    const query = `SELECT COUNT(*) CNT
                     FROM KU_SANGSA
                    WHERE SS_CODE = @SS_CODE;`;
    const result = await request.query(query);
    
    console.log("SangsaCode:", SangsaCode);
    console.log("result:", result.recordset[0].CNT);
    return result.recordset[0].CNT  ;

  } catch (err) {
    console.error("Error fetching sangsa code:", err);
    throw err;
  }
};

// 인증번호 조회
exports.getPhoneAuthNumber = async ({ representativePhone }) => {
  try {
    const request = pool.request();
    request.input("AUTH_PHONE", sql.VarChar, representativePhone);  

    const query = `SELECT FLOOR(RAND() * 9000 + 1000) AS NUM;`;
    const result = await request.query(query);
    return result.recordset[0].NUM  ;
  } catch (err) {
    console.error("Error fetching auth number:", err);
    throw err;
  }
};

// 인증번호 확인 조회
exports.checkPhoneAuthNumber = async ({ representativePhone, authNumber }) => {
  try {
    const request = pool.request();
    request.input("AUTH_PHONE", sql.VarChar, representativePhone);  
    request.input("CERT_NO", sql.Int, authNumber);

    const query = `SELECT top 1 cert_no FROM CJB_CERT_NO_REG where cell_no = @AUTH_PHONE and cert_no = @CERT_NO order by strt_dtime DESC `; 

    const result = await request.query(query);
    return result.recordset[0].cert_no;
  } catch (err) {
    console.error("Error fetching auth number:", err);
    throw err;
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 매입 매도비 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 매입 매도비 목록 조회
exports.getBuySellFeeList = async ({ carAgent, carNo, page = 1, pageSize = 10 }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);
    request.input("PAGE", sql.Int, page);
    request.input("PAGESIZE", sql.Int, pageSize);

    // 전체 카운트 조회
    const countQuery = `
        SELECT COUNT(*) as totalCount
        FROM SMJ_MAINLIST A
        JOIN SMJ_SOLDLIST B ON A.CAR_REGID = B.SELL_CAR_REGID
        WHERE A.CAR_DELGUBN = '0'
            AND CAR_STATUS <> '004'
            AND CAR_AGENT = @CAR_AGENT
    `;

    const dataQuery = `
        SELECT 
            CAR_REGID,
            DBO.SMJ_FN_EMPNAME(CAR_EMPID) AS EMPKNAME,
            CAR_NO,
            CAR_NAME,
            BUY_OWNER,
            BUY_NOTIAMT,
            DBO.SMJ_FN_DATEFMT('H', CAR_BUYDATE) AS CAR_BUYDATE,
            SELL_OWNER,
            SELL_NOTIAMT,
            CASE CAR_STATUS 
                WHEN '001' THEN '' 
                ELSE DBO.SMJ_FN_DATEFMT('H', SELL_DATE)
            END AS SELL_DATE,
            BUY_TOTAL_FEE,
            SELL_TOTAL_FEE,
            CASE CAR_STATUS 
                WHEN '001' THEN '제시'
                ELSE '매도'
            END AS STATUS,
            BUY_REAL_FEE,
            SELL_REAL_FEE,
            CASE CAR_GUBN
                WHEN '0' THEN '상사'
                WHEN '1' THEN '고객'
                ELSE ''
            END AS CAR_GUBN_NAME,
            BUY_TOTAL_FEE - BUY_REAL_FEE AS MINAP,
            SELL_TOTAL_FEE - SELL_REAL_FEE AS SELLMINAP,
            CAR_GUBN,
            CASE 
                WHEN CAR_EMPID <> SELL_EMPID THEN ' (알선)'
                ELSE ''
            END AS ALSON,
            CASE SELL_TAXENDCHECK
                WHEN 'Y' THEN '정산완료'
                WHEN 'N' THEN '정산대기'
                ELSE ''
            END AS SELL_TAXENDCHECKNAME,
            CASE SELLFEEGUBN
                WHEN '1' THEN '(포함)'
                ELSE ''
            END AS SELLFEEGUBNNAME
        FROM SMJ_MAINLIST A
        JOIN SMJ_SOLDLIST B ON A.CAR_REGID = B.SELL_CAR_REGID
        WHERE A.CAR_DELGUBN = '0'
            AND CAR_STATUS <> '004'
            AND CAR_AGENT = @CAR_AGENT
        ORDER BY CAR_BUYDATE DESC, CAR_REGDATE DESC
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
    console.error("Error fetching buy sell fee list:", err);
    throw err;
  }
};

// 매입 매도비 합계
exports.getBuySellFeeSum = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT SUM(BUY_TOTAL_FEE) AS BUY_TOTAL_FEE,
                          SUM(BUY_REAL_FEE) AS BUY_REAL_FEE,
                          SUM(BUY_TOTAL_FEE) - SUM(BUY_REAL_FEE) AS BUY_DIFF_FEE,
                          SUM(SELL_TOTAL_FEE) AS SELL_TOTAL_FEE,
                          SUM(SELL_REAL_FEE) AS SELL_REAL_FEE,
                          SUM(SELL_TOTAL_FEE) - SUM(SELL_REAL_FEE) AS SELL_DIFF_FEE,
                          SUM(BUY_TOTAL_FEE) + SUM(SELL_TOTAL_FEE) AS TOTAL_FEE,
                          SUM(BUY_REAL_FEE) + SUM(SELL_REAL_FEE) AS REAL_FEE,
                          (SUM(BUY_TOTAL_FEE) - SUM(BUY_REAL_FEE)) + (SUM(SELL_TOTAL_FEE) - SUM(SELL_REAL_FEE)) AS DIFF_FEE
                    FROM  SMJ_MAINLIST A,
                          SMJ_SOLDLIST B
                    WHERE A.CAR_REGID = B.SELL_CAR_REGID
                      AND A.CAR_DELGUBN = '0'
                      AND CAR_STATUS <> '004'
                      AND CAR_AGENT = @CAR_AGENT ;`; 

    const result = await request.query(query);
    return result.recordset; 
  } catch (err) {
    console.error("Error fetching buy sell fee sum:", err);
    throw err;
  }
};


// REAL PAGE
exports.getTaxCashNoList = async ({ agent_id }) => {
  try {
    const request = pool.request();
    request.input("AGENT_ID", sql.VarChar, agent_id);

    const query = `SELECT A.CMRC_COST_SEQ  -- 상품화비 순번
                        , A.EXPD_METH_CD, B.CD_NM -- 결제 구분
                        , A.EXPD_EVDC_CD, C.CD_NM -- 영수 증빙
                        , E.USR_NM  -- 딜러명
                        , A.EXPD_AMT   -- 상품화비 금액
                        , D.PUR_AMT  -- 통지 금액
                        , D.OWNR_NM  -- 고객명
                      FROM dbo.CJB_CMRC_COST A
                        , dbo.CJB_COMM_CD B
                        , dbo.CJB_COMM_CD C
                        , dbo.CJB_CAR_PUR D
                        , dbo.CJB_USR E
                    WHERE A.EXPD_METH_CD = B.CD
                      AND B.GRP_CD = '06'   -- 결제 구분
                      AND A.EXPD_EVDC_CD = C.CD
                      AND C.GRP_CD = '07'   -- 영수 증빙
                      AND A.CAR_REG_ID = D.CAR_REG_ID
                      AND D.DLR_ID = E.USR_ID
                      AND A.EXPD_EVDC_CD IN ('001', '004')
                      and A.TAX_SCT_CD = '9'  -- 관세 대상 (세금계산서 아니면 9)
                      and A.TXBL_ISSU_DT IS NULL
                    AND D.AGENT_ID = @AGENT_ID;`; 

    const result = await request.query(query);
    return result.recordset; 
  } catch (err) {
    console.error("Error fetching tax cash no list:", err);
    throw err;
  }
};

// REAL PAGE
exports.getInventoryFinanceStatus = async ({ agent_id }) => {
  try {
    const request = pool.request();
    request.input("AGENT_ID", sql.VarChar, agent_id);

    const query = `SELECT A.LOAN_CORP_NM
                        , A.TOT_LMT_AMT
                        , A.TOT_LOAN_AMT
                        , FORMAT((TOT_LOAN_AMT/TOT_LMT_AMT) * 100, 'N1') + '%' AS RT
                    FROM dbo.CJB_AGENT_LOAN_CORP A
                    WHERE  A.AGENT_ID = @AGENT_ID;`; 

    const result = await request.query(query);
    return result.recordset; 
  } catch (err) {
    console.error("Error fetching tax cash no list:", err);
    throw err;
  }
};


// REAL PAGE
exports.getSalesPurchaseSummary = async ({ agent_id }) => {
  try {
    const request = pool.request();
    request.input("AGENT_ID", sql.VarChar, agent_id);

    const query = `SELECT '매입' AS GUBUN 
                        , COUNT(*) CNT
                        , SUM(PUR_SUP_AMT) SUP_AMT
                        , SUM(PUR_VAT) VAT
                        , SUM(PUR_AMT) AMT
                        , SUM(CAR_LOAN_AMT) CAR_LOAN_AMT
                        , SUM(TOT_CMRC_COST_FEE) TOT_CMRC_COST_FEE
                        , SUM(GAIN_TAX)  GAIN_TAX
                        , SUM(TOT_PAY_FEE)  TOT_PAY_FEE
                      FROM dbo.CJB_CAR_PUR A
                    WHERE AGENT_ID = @AGENT_ID
                    UNION ALL
                    SELECT '매출' AS GUBUN 
                        , COUNT(*) CNT
                        , SUM(SALE_SUP_PRC) SUP_AMT
                        , SUM(SALE_VAT) VAT
                        , SUM(SALE_AMT) AMT
                        , SUM(A.CAR_LOAN_AMT) CAR_LOAN_AMT
                        , SUM(A.TOT_CMRC_COST_FEE) TOT_CMRC_COST_FEE
                        , SUM(A.GAIN_TAX)  GAIN_TAX
                        , SUM(A.TOT_PAY_FEE)  TOT_PAY_FEE
                      FROM dbo.CJB_CAR_PUR A
                        , dbo.CJB_CAR_SEL B
                    WHERE A.AGENT_ID = @AGENT_ID
                      AND A.CAR_REG_ID = B.CAR_REG_ID
                    ;`; 

    const result = await request.query(query);
    return result.recordset; 
  } catch (err) {
    console.error("Error fetching tax cash no list:", err);
    throw err;
  }
};


// REAL PAGE
exports.getInquiryStatus = async ({ agent_id }) => {
  try {
    const request = pool.request();
    request.input("AGENT_ID", sql.VarChar, agent_id);

    const query = `SELECT BBC_NO, BBC_TIT, CONVERT(CHAR(10), REG_DTIME, 23) AS REG_DT
                     FROM dbo.CJB_INQ_BB
                    WHERE AGENT_ID = @AGENT_ID
                      AND DEL_YN = 'N';`; 

    const result = await request.query(query);
    return result.recordset; 
  } catch (err) {
    console.error("Error fetching tax cash no list:", err);
    throw err;
  }
};

// REAL PAGE
exports.getNoticeStatus = async ({ agent_id }) => {
  try {
    const request = pool.request();
    request.input("AGENT_ID", sql.VarChar, agent_id);

    const query = `SELECT ALL_YN, 
                          CASE WHEN ALL_YN = 'Y' THEN '전체' ELSE '개별' END GUBUN,
                          NTC_NO, NTC_TIT, 
                          CONVERT(CHAR(10), REG_DTIME, 23) REG_DT
                     FROM dbo.CJB_NTC
                    WHERE AGENT_ID = @AGENT_ID
                      AND DEL_YN = 'N';`; 

    const result = await request.query(query);
    return result.recordset; 
  } catch (err) {
    console.error("Error fetching tax cash no list:", err);
    throw err;
  }
};

// 매입 매도비 상세 조회
exports.getBuySellFeeDetail = async ({ car_regid }) => {
  try {
    const request = pool.request();
    request.input("CAR_REGID", sql.VarChar, car_regid);   

    const query = `SELECT CAR_REGID,
                          DBO.SMJ_FN_DATEFMT('F', CAR_REGDATE) AS CAR_REGDATE,
                          CAR_STATUS,
                          CAR_DELGUBN,
                          CAR_AGENT,
                          DBO.SMJ_FN_EMPNAME(CAR_EMPID) AS CAR_EMPID,
                          DBO.SMJ_FN_GETCDNAME('02', CAR_KIND) AS CAR_KIND,
                          DBO.SMJ_FN_DATEFMT('D', CAR_BUYDATE) AS CAR_BUYDATE,
                          CAR_LOANCNT,
                          CAR_NO,
                          CAR_NONEW,
                          CAR_NAME,
                          CAR_CATEGORY,
                          CAR_MAKER,
                          CAR_BIRTH,
                          DBO.SMJ_FN_COMMA(CAR_KM)             AS CAR_KM,   
                          CAR_ID,
                          CAR_STDAMT,
                          BUY_OWNER,
                          DBO.SMJ_FN_GETCDNAME_04('04', BUY_OWNERKIND) AS BUY_OWNERKIND,
                          BUY_SSNO,
                          BUY_BUZNO,
                          BUY_TELNO,
                          BUY_ZIP,
                          BUY_ADDR1,
                          BUY_ADDR2,
                          BUY_NOTIAMT,
                          DBO.SMJ_FN_COMMA(BUY_SUPAMT),
                          DBO.SMJ_FN_COMMA(BUY_TAX),
                          CASE BUY_TAXRSVCHECK
                            WHEN '' THEN '해당없음'
                            WHEN '0' THEN '수취'
                            WHEN '1' THEN '미수취'
                            ELSE ''
                          END AS BUY_TAXRSVCHECK,
                          DBO.SMJ_FN_DATEFMT('D', BUY_TAXDATE) AS BUY_TAXDATE,
                          CASE BUY_DOCUMENT
                            WHEN '' THEN '해당없음'
                            WHEN '0' THEN '수령'
                            WHEN '1' THEN '미수령'
                            ELSE ''
                          END AS BUY_DOCUMENT,
                          BUY_FILE_1,
                          BUY_FILE_2,
                          BUY_FILE_3,
                          BUY_FILE_4,
                          BUY_FILE_5,
                          BUY_DESC,
                          BUY_TOTAL_FEE,
                          BUY_REAL_FEE,
                          BUY_TOTAL_FEE - BUY_REAL_FEE,
                          CASE CAR_GUBN
                            WHEN '0' THEN '상사'
                            WHEN '1' THEN '고객'
                            ELSE ''
                          END AS CAR_GUBN,
                          CAR_YEAR,
                          BUY_EMAIL,
                          BUY_TAX_ONE,
                          CASE BUY_TAXGUBN
                            WHEN '0' THEN '전자(세금)계산서'
                            WHEN '1' THEN '종이계산서'
                            ELSE '해당없음'
                          END AS BUY_TAXGUBN,
                          GOODS_FEE,
                          CAR_EMPID,
                          BUY_TAX15,
                          KU_JESI_NO,
                          CASE KU_JESI_NO
                            WHEN '' THEN ''
                            ELSE DBO.SMJ_FN_KUMAEDODATE(KU_JESI_NO)
                          END                                  AS MAEDODATE
                    FROM   SMJ_MAINLIST
                    WHERE  CAR_REGID = @CAR_REGID ;`;

    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching suggest detail:", err);
    throw err;
  }
};

// 매입비 항목 관리 (제시-매입정보)
exports.getBuyInfoList = async ({ fee_car_regid }) => {
  try {
    const request = pool.request();
    request.input("FEE_CAR_REGID", sql.VarChar, fee_car_regid);

    const query = `SELECT DBO.SMJ_FN_EMPNAME(CAR_EMPID) AS EMPKNAME,
                          CAR_NO,
                          CAR_EMPID,
                          CAR_REGID,
                          BUY_NOTIAMT,
                          DBO.SMJ_FN_DATEFMT('D', CAR_BUYDATE) AS CAR_BUYDATE,
                          DBO.SMJ_FN_DATEFMT('D', Getdate())   AS CURDATE,
                          CAR_NAME,
                          DBO.SMJ_FN_GETCDNAME('02', CAR_KIND) AS CAR_KIND,
                          DBO.SMJ_FN_GETCDNAME_04('04', BUY_OWNERKIND) AS BUY_OWNERKIND_NAME,
                          BUY_OWNERKIND
                    FROM   SMJ_MAINLIST
                    WHERE  CAR_REGID = @FEE_CAR_REGID  ;`;

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching buy info list:", err);
    throw err;
  }
};


// 매입비 항목 관리 (제시-매입정보)
exports.getBuyFeeList = async ({ fee_car_regid }) => {
  try {
    const request = pool.request();
    request.input("FEE_CAR_REGID", sql.VarChar, fee_car_regid);

    const query = `SELECT FEE_SEQNO,
                          FEE_NO,
                          FEE_TITLE,
                          FEE_COND,
                          FEE_RATE,
                          FEE_AMT,
                          FEE_INAMT,
                          DBO.SMJ_FN_DATEFMT('D', FEE_INDATE) AS FEE_INDATE,
                          FEE_INDESC,
                          CASE FEE_COND
                            WHEN '0' THEN '변동금액 ('
                                          + CONVERT(VARCHAR, FEE_RATE) + '%)'
                            WHEN '1' THEN '고정금액 ('
                                          + CONVERT(VARCHAR, Replace(CONVERT(VARCHAR(50), Cast(
                                          FEE_AMT AS
                                          MONEY), 1), '.00', ''))
                                          + '원)'
                            ELSE ''
                          END AS FEE_COND_NAME,
                          CASE FEE_COND
                            WHEN '0' THEN Floor(7700000 * ( FEE_RATE / 100 ))
                            WHEN '1' THEN Floor(FEE_AMT)
                            ELSE 0
                          END AS FEE_AMT_VAT
                    FROM   SMJ_FEEAMT
                    WHERE  FEE_CAR_REGID = @FEE_CAR_REGID
                          AND FEE_KIND = '0' ;`;

    const result = await request.query(query);
    return result.recordset;
  } catch (err) { 
    console.error("Error fetching buy fee list:", err);
    throw err;
  }
};

// 매도비 항목 관리 (제시-매도정보)
exports.getSellInfoList = async ({ fee_car_regid }) => {
  try {
    const request = pool.request();
    request.input("FEE_CAR_REGID", sql.VarChar, fee_car_regid); 

    const query = `SELECT DBO.SMJ_FN_EMPNAME(CAR_EMPID) AS EMPKNAME,
                          CAR_NO,
                          CAR_EMPID,
                          CAR_REGID,
                          BUY_NOTIAMT,
                          DBO.SMJ_FN_DATEFMT('D', CAR_BUYDATE) AS CAR_BUYDATE,
                          DBO.SMJ_FN_DATEFMT('D', Getdate())   AS CURDATE,
                          CAR_NAME,
                          DBO.SMJ_FN_GETCDNAME('02', CAR_KIND) AS CAR_KIND,
                          CASE CAR_STATUS
                            WHEN '001' THEN '매입'
                            WHEN '002' THEN '일반판매'
                            WHEN '003' THEN '알선판매'
                            ELSE ''
                          END                                  AS STATUS,
                          SELL_EMPID,
                          DBO.SMJ_FN_DATEFMT('D', SELL_DATE) AS SELL_DATE,
                          SELL_NOTIAMT
                    FROM   SMJ_MAINLIST A,
                          SMJ_SOLDLIST B
                    WHERE  A.CAR_REGID = B.SELL_CAR_REGID
                          AND CAR_REGID = @FEE_CAR_REGID ;`;

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching sell info list:", err);
    throw err;
  }
};

// 매도비 항목 관리 (제시-매도정보)
exports.getSellFeeList = async ({ fee_car_regid }) => {
  try {
    const request = pool.request();
    request.input("FEE_CAR_REGID", sql.VarChar, fee_car_regid); 

    const query = `SELECT TOP 5 FEE_SEQNO,
                          FEE_NO,
                          FEE_TITLE,
                          FEE_COND,
                          FEE_RATE,
                          FEE_AMT,
                          FEE_INAMT,
                          DBO.SMJ_FN_DATEFMT('D', FEE_INDATE),
                          FEE_INDESC,
                          CASE FEE_COND
                            WHEN '0' THEN '변동금액 ('
                                          + CONVERT(VARCHAR, FEE_RATE) + '%)'
                            WHEN '1' THEN '고정금액 ('
                                          + CONVERT(VARCHAR, Replace(CONVERT(VARCHAR(50),
                                          Cast(FEE_STDAMT
                                          AS MONEY), 1), '.00', ''))
                                          + '원)'
                            ELSE ''
                          END,
                          CASE FEE_COND
                            WHEN '0' THEN Floor(9500000 * ( FEE_RATE / 100 ))
                            WHEN '1' THEN Floor(FEE_AMT)
                            ELSE 0
                          END AS feeAMT
              FROM   SMJ_FEEAMT
              WHERE  FEE_CAR_REGID = @FEE_CAR_REGID
                    AND FEE_KIND = '1' ;`;

    const result = await request.query(query);
    return result.recordset;
  } catch (err) { 
    console.error("Error fetching sell fee list:", err);
    throw err;
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 상품화비
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 상품화비 목록 조회
exports.getGoodsFeeList = async ({ carAgent, page = 1, pageSize = 10 }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);
    request.input("PAGE", sql.Int, page);
    request.input("PAGESIZE", sql.Int, pageSize);

    // 전체 카운트 조회
    const countQuery = `
        SELECT COUNT(*) as totalCount
        FROM SMJ_MAINLIST A, SMJ_SOLDLIST B
        WHERE A.CAR_REGID = B.SELL_CAR_REGID
            AND A.CAR_DELGUBN = '0'
            AND A.GOODS_FEE > 0
            AND CAR_AGENT = @CAR_AGENT
    `;

    const dataQuery = `
        SELECT 
            CAR_REGID,
            DBO.SMJ_FN_EMPNAME(CAR_EMPID) AS EMPKNAME,
            CAR_NO,
            CAR_NAME,
            BUY_OWNER,
            BUY_NOTIAMT/10000 AS BUY_NOTIAMT,
            DBO.SMJ_FN_DATEFMT('H',CAR_BUYDATE) AS CAR_BUYDATE,
            SELL_OWNER,
            SELL_NOTIAMT/10000 AS SELL_NOTIAMT,
            DBO.SMJ_FN_DATEFMT('H',SELL_DATE) AS SELL_DATE,
            BUY_TOTAL_FEE,
            SELL_TOTAL_FEE,
            CASE CAR_STATUS
                WHEN '001' THEN '제시'
                ELSE '매도'
            END AS STATUS,
            CASE CAR_GUBN
                WHEN '0' THEN '상사'
                WHEN '1' THEN '고객'
                ELSE ''
            END AS CAR_GUBNNAME,
            GOODS_FEE,
            DBO.SMJ_FN_GOODS_TAX(CAR_REGID) AS AMTARR,
            BUY_REAL_FEE,
            SELL_REAL_FEE,
            BUY_TOTAL_FEE - BUY_REAL_FEE AS MINAP,
            SELL_TOTAL_FEE - SELL_REAL_FEE AS SELLMINAP,
            CAR_GUBN,
            CASE
                WHEN SELL_NOTIAMT > 0 THEN SELL_NOTIAMT-BUY_NOTIAMT-GOODS_FEE
                ELSE '0'
            END AS BFIT
        FROM SMJ_MAINLIST A, SMJ_SOLDLIST B
        WHERE A.CAR_REGID = B.SELL_CAR_REGID
            AND A.CAR_DELGUBN = '0'
            AND A.GOODS_FEE > 0
            AND CAR_AGENT = @CAR_AGENT
        ORDER BY SELL_DATE DESC, CAR_REGDATE DESC
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

// 상품화비 합계
exports.getGoodsFeeSum = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT SUM(CNT_0) GOODS_0_CNT,
                          SUM(SUM_0) GOODS_0_SUM,
                          SUM(CNT_1) GOODS_1_CNT,
                          SUM(SUM_1) GOODS_1_SUM,
                          DBO.SMJ_FN_VAT_SUP(SUM(SUM_1)) VAT_SUP,
                          DBO.SMJ_FN_VAT_AMT(SUM(SUM_1)) VAT_AMT,
                          SUM(CNT_0 + CNT_1) GOODS_CNT,
                          SUM(SUM_0 + SUM_1) GOODS_SUM
                    FROM   (SELECT GOODS_REGID,
                                  ( CASE
                                      WHEN GOODS_TAXGUBN = '0' THEN 1
                                      ELSE 0
                                    END ) AS CNT_0,
                                  ( CASE
                                      WHEN GOODS_TAXGUBN = '1' THEN 1
                                      ELSE 0
                                    END ) AS CNT_1,
                                  ( CASE
                                      WHEN GOODS_TAXGUBN = '0' THEN GOODS_SENDAMT
                                      ELSE 0
                                    END ) AS SUM_0,
                                  ( CASE
                                      WHEN GOODS_TAXGUBN = '1' THEN GOODS_SENDAMT
                                      ELSE 0
                                    END ) AS SUM_1
                            FROM   SMJ_GOODSFEE
                            WHERE  GOODS_AGENT = '00511') A
                          LEFT OUTER JOIN SMJ_MAINLIST B
                                        ON GOODS_REGID = CAR_REGID
                    WHERE  1 = 1
                          AND B.CAR_DELGUBN = '0'`; 

    const result = await request.query(query);
    return result.recordset; 
  } catch (err) {
    console.error("Error fetching goods fee sum:", err);
    throw err;
  }
};

// 상품화비 상세 조회
exports.getGoodsFeeDetail = async ({ goods_regid }) => {
  try {
    const request = pool.request();
    request.input("GOODS_REGID", sql.VarChar, goods_regid); 

    const query = `SELECT CAR_REGID,
                          DBO.SMJ_FN_DATEFMT('F', CAR_REGDATE) AS CAR_REGDATE,
                          CAR_STATUS,
                          CAR_DELGUBN,
                          CAR_AGENT,
                          DBO.SMJ_FN_EMPNAME(CAR_EMPID) AS EMPKNAME,
                          DBO.SMJ_FN_GETCDNAME('02', CAR_KIND) AS CAR_KIND,
                          DBO.SMJ_FN_DATEFMT('D', CAR_BUYDATE) AS CAR_BUYDATE,
                          CAR_LOANCNT,
                          CAR_NO,
                          CAR_NONEW,
                          CAR_NAME,
                          CAR_CATEGORY,
                          CAR_MAKER,
                          CAR_BIRTH,
                          DBO.SMJ_FN_COMMA(CAR_KM)             AS CAR_KM,
                          CAR_ID,
                          DBO.SMJ_FN_COMMA(CAR_STDAMT)         AS CAR_STDAMT,
                          BUY_OWNER,
                          DBO.SMJ_FN_GETCDNAME('04', BUY_OWNERKIND) AS BUY_OWNERKIND,
                          BUY_SSNO,
                          BUY_BUZNO,
                          BUY_TELNO,
                          BUY_ZIP,
                          BUY_ADDR1,
                          BUY_ADDR2,
                          BUY_NOTIAMT,
                          DBO.SMJ_FN_COMMA(BUY_SUPAMT) AS BUY_SUPAMT,
                          DBO.SMJ_FN_COMMA(BUY_TAX) AS BUY_TAX,
                          CASE BUY_TAXRSVCHECK
                            WHEN '' THEN '해당없음'
                            WHEN '0' THEN '수령'
                            WHEN '1' THEN '미수령'
                            ELSE ''
                          END AS BUY_TAXRSVCHECK,
                          DBO.SMJ_FN_DATEFMT('D', BUY_TAXDATE) AS BUY_TAXDATE,
                          CASE BUY_DOCUMENT
                            WHEN '' THEN '해당없음'
                            WHEN '0' THEN '수령'
                            WHEN '1' THEN '미수령'
                            ELSE ''
                          END AS BUY_DOCUMENT,
                          BUY_FILE_1,
                          BUY_FILE_2,
                          BUY_FILE_3,
                          BUY_FILE_4,
                          BUY_FILE_5,
                          BUY_DESC,
                          BUY_TOTAL_FEE,
                          BUY_REAL_FEE,
                          BUY_TOTAL_FEE - BUY_REAL_FEE,
                          CASE CAR_GUBN
                            WHEN '0' THEN '상사'
                            WHEN '1' THEN '고객'
                            ELSE ''
                          END AS CAR_GUBN,
                          CAR_YEAR,
                          BUY_EMAIL,
                          BUY_TAX_ONE,
                          CASE BUY_TAXGUBN
                            WHEN '0' THEN '전자(세금)계산서'
                            WHEN '1' THEN '종이계산서'
                            ELSE ''
                          END AS BUY_TAXGUBN,
                          CAR_EMPID,
                          SELL_TAXENDCHECK
                    FROM  SMJ_MAINLIST A,
                          SMJ_SOLDLIST B
                    WHERE  A.CAR_REGID = B.SELL_CAR_REGID
                          AND CAR_DELGUBN = '0'
                          AND CAR_REGID = @GOODS_REGID ;`;

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching goods fee detail:", err);
    throw err;
  }
};

// 상품화비 상세 리스트 조회
exports.getGoodsFeeDetailList = async ({ goods_regid }) => {
  try {
    const request = pool.request();
    request.input("GOODS_REGID", sql.VarChar, goods_regid); 

    const query = `SELECT GOODS_SEQ,
                          DBO.SMJ_FN_DATEFMT('D', GOODS_REGDATE)  AS GOODS_REGDATE,
                          GOODS_CODENAME,
                          GOODS_SENDAMT,
                          DBO.SMJ_FN_DATEFMT('D', GOODS_SENDDATE) AS GOODS_SENDDATE,
                          DBO.SMJ_FN_GETCDNAME('06', GOODS_WAY) AS GOODS_WAY,
                          DBO.SMJ_FN_GETCDNAME('07', GOODS_RECEIPT) AS GOODS_RECEIPT,
                          CASE GOODS_TAXGUBN
                            WHEN '0' THEN '미공제'
                            WHEN '1' THEN '공제'
                            ELSE ''
                          END AS GOODS_TAXGUBN,
                          DBO.SMJ_FN_DATEFMT('D', GOODS_TAXDATE) AS GOODS_TAXDATE,
                          GOODS_DESC,
                          CASE GOODS_DEALSANG
                            WHEN '0' THEN '딜러선지출'
                            WHEN '1' THEN '상사지출'
                            ELSE ''
                          END AS GOODS_DEALSANG
                    FROM   SMJ_GOODSFEE
                    WHERE  GOODS_REGID = @GOODS_REGID
                    ORDER  BY GOODS_SENDDATE DESC ;`;

    const result = await request.query(query);
    return result.recordset;  
  } catch (err) {
    console.error("Error fetching goods fee detail list:", err);
    throw err;
  }
};


// 상품화비용 지출 내역
exports.getGoodsFeeExpenseList = async ({ goods_regid }) => {
  try {
    const request = pool.request();
    request.input("GOODS_REGID", sql.VarChar, goods_regid); 

    const query = `SELECT GOODS_SEQ,
                          GOODS_CODE,
                          GOODS_CODENAME,
                          GOODS_SENDAMT,
                          DBO.SMJ_FN_DATEFMT('D', GOODS_SENDDATE) AS GOODS_SENDDATE,
                          GOODS_WAY,
                          GOODS_RECEIPT,
                          GOODS_TAXGUBN,
                          DBO.SMJ_FN_DATEFMT('D', GOODS_TAXDATE)  AS GOODS_TAXDATE,
                          GOODS_DESC,
                          GOODS_DEALSANG
                     FROM SMJ_GOODSFEE
                    WHERE GOODS_REGID = @GOODS_REGID
                    ORDER BY GOODS_SENDDATE ;`;

    const result = await request.query(query);
    return result.recordset;  
  } catch (err) {
    console.error("Error fetching goods fee expense list:", err);
    throw err;
  }
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 시제(계좌) 내역
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 계좌정보 조회
exports.getAccountInfo = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT REPLACE(BRNO, '-', ''),
                          POPBILL_ID,
                          BANKCODE,
                          DBO.SMJ_FN_BANKNAME(BANKCODE) AS BKNAME,
                          ACCOUNTNUMBER,
                          USEDATE,
                          MEMO,
                          ACCOUNTNAME
                     FROM SMJ_AGENT_BANK A,
                          SMJ_AGENT B
                    WHERE A.AGENT = B.AGENT
                      AND A.AGENT = @CAR_AGENT
                      AND A.USECHECK = 'Y';`;

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching account info:", err);
    throw err;
  }
};

// 시재 관리
exports.getAssetList = async ({ carAgent, accountNumber, startDate, endDate }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);
    request.input("ACCOUNT_NUMBER", sql.VarChar, accountNumber);
    request.input("START_DATE", sql.VarChar, startDate);
    request.input("END_DATE", sql.VarChar, endDate);

    let query = ` SELECT *
                      FROM   (SELECT ROW_NUMBER()
                                      OVER(
                                        ORDER BY TID DESC)    AS RNUM,
                                    TID,
                                    BANKCODE,
                                    ACCOUNTNUMBER,
                                    DBO.SMJ_FN_DATETIME(TRDT) AS TRDT,
                                    ACCIN,
                                    ACCOUT,
                                    BALANCE,
                                    REMARK1,
                                    CARNO,
                                    ACKIND,
                                    DEALER,
                                    MEMO
                              FROM   SMJ_AGENT_BANK_SEARCH
                              WHERE  AGENT = @CAR_AGENT
                                    AND ACCOUNTNUMBER = @ACCOUNT_NUMBER
                                    AND CONVERT (DATE, TRDATE) >= @START_DATE
                                    AND CONVERT (DATE, TRDATE) <= @END_DATE) AS V
                      WHERE  1 = 1 --RNUM BETWEEN 1 AND 30 
                      ;`;

                      query = `SELECT *
                                FROM   (SELECT ROW_NUMBER()
                                                OVER(
                                                  ORDER BY TID DESC)    AS RNUM,
                                              TID,
                                              BANKCODE,
                                              ACCOUNTNUMBER,
                                              DBO.SMJ_FN_DATETIME(TRDT) AS TRDT,
                                              ACCIN,
                                              ACCOUT,
                                              BALANCE,
                                              REMARK1,
                                              CARNO,
                                              ACKIND,
                                              DEALER,
                                              MEMO
                                        FROM   SMJ_AGENT_BANK_SEARCH
                                        WHERE  1 = 1 -- AGENT = '00518'
                                              --AND ACCOUNTNUMBER LIKE '%04850103804051%'
                                              AND CONVERT (DATE, TRDATE) >= '2020-01-26'
                                              AND CONVERT (DATE, TRDATE) <= '2025-01-26') AS V
                                WHERE  RNUM BETWEEN 1 AND 30 ;`;


    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching asset list:", err);
    throw err;
  }
};

// 시재 합계
exports.getAssetSum = async ({ carAgent, accountNumber, startDate, endDate }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);
    request.input("ACCOUNT_NUMBER", sql.VarChar, accountNumber);  
    request.input("START_DATE", sql.VarChar, startDate);
    request.input("END_DATE", sql.VarChar, endDate);

    const query = `SELECT SUM(CONVERT(INT, ACCIN)) AS ACCIN,
                          SUM(CONVERT(INT, ACCOUT)) AS ACCOUT
                      FROM SMJ_AGENT_BANK_SEARCH
                      WHERE AGENT = @CAR_AGENT
                            AND ACCOUNTNUMBER = @ACCOUNT_NUMBER
                            AND CONVERT (DATE, TRDATE) >= @START_DATE
                            AND CONVERT (DATE, TRDATE) <= @END_DATE;`;

    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching asset sum:", err);
    throw err;
  }
};



////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 제시
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.getSuggestListNew = async ({ 
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
              FROM dbo.CJB_CAR_PUR A
            WHERE AGENT_ID = @CAR_AGENT
              AND CAR_DEL_YN = 'N'
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
  
    const dataQuery = `SELECT CAR_REG_ID               
       , CAR_REG_DT              
       , CAR_DEL_DT              
       , CAR_STAT_CD             
       , CAR_DEL_YN              
       , AGENT_ID                
       , DLR_ID                  
       , (SELECT USR_NM FROM CJB_USR WHERE USR_ID = A.DLR_ID) AS DLR_NM
       , CAR_KND_CD              
       , PRSN_SCT_CD             
       , CAR_PUR_DT              
       , CAR_LOAN_CNT            
       , CAR_LOAN_AMT            
       , CAR_NO                  
       , CAR_NEW_YN              
       , CAR_NM                  
       , CAR_CAT_NM              
       , MFCP_NM                 
       , CAR_MNFT_DT             
       , RUN_DSTN                
       , CAR_YOM                 
       , OWNR_NM                 
       , OWNR_TP_CD             
       , OWNR_SSN                
       , OWNR_BRNO               
       , OWNR_PHON               
       , OWNR_ZIP                
       , OWNR_ADDR1              
       , OWNR_ADDR2     
       , SUBSTRING(OWNR_EMAIL, 1, CHARINDEX('@', OWNR_EMAIL) - 1) AS OWNR_EMAIL
       , SUBSTRING(OWNR_EMAIL, CHARINDEX('@', OWNR_EMAIL) + 1, LEN(OWNR_EMAIL)) AS OWNR_EMAIL_DOMAIN
       , PUR_AMT                 
       , PUR_SUP_PRC             
       , PUR_VAT                 
       , GAIN_TAX                
       , AGENT_PUR_CST           
       , PURACSH_RCV_YN          
       , TXBL_ISSU_DT            
       , PUR_DESC                
       , TOT_PUR_FEE             
       , TOT_PAY_FEE             
       , TOT_CMRC_COST_FEE       
       , CUST_NO                 
       , PRSN_NO                 
       , PARK_ZON_CD             
       , PARK_ZON_DESC           
       , PARK_KEY_NO             
       , REG_DTIME               
       , REGR_ID                 
       , MOD_DTIME               
       , MODR_ID             
                FROM dbo.CJB_CAR_PUR A
              WHERE AGENT_ID = @CAR_AGENT
                AND CAR_DEL_YN = 'N'
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
              ORDER BY ${orderItem === '제시일' ? 'CAR_PUR_DT' : orderItem === '담당딜러' ? 'DLR_ID' : orderItem === '고객유형' ? 'OWNR_TP_CD' : orderItem} ${ordAscDesc}
              OFFSET (@PAGE - 1) * @PAGE_SIZE ROWS
              FETCH NEXT @PAGE_SIZE ROWS ONLY;`;

    // 두 쿼리를 동시에 실행
    const [countResult, dataResult] = await Promise.all([
      request.query(countQuery),
      request.query(dataQuery)
    ]);

    const totalCount = countResult.recordset[0].totalCount;
    const totalPages = Math.ceil(totalCount / pageSize);

//console.log('totalCount:', countQuery);
//console.log('totalPages:', dataQuery);
    //console.log('page:', page);
    //console.log('pageSize:', pageSize);

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

// 차량 조회
exports.getSuggestList = async ({
  carAgent,
  carNo,
  carName,
  buyOwner,
  empName,
  customerName,
  page = 1,
  pageSize = 10
}) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);
    request.input("PAGE", sql.Int, page);
    request.input("PAGESIZE", sql.Int, pageSize);

    if (carNo) request.input("CAR_NO", sql.VarChar, `%${carNo}%`);
    if (carName) request.input("CAR_NAME", sql.VarChar, `%${carName}%`); // LIKE 검색 적용
    if (customerName) request.input("CUSTOMER_NAME", sql.VarChar, `%${customerName}%`); // LIKE 검색 적용
    if (buyOwner) request.input("BUY_OWNER", sql.VarChar, `%${buyOwner}%`); // LIKE 검색 적용
    if (empName) request.input("EMPKNAME", sql.VarChar, `%${empName}%`); // LIKE 검색 적용

    // 전체 카운트 조회
    const countQuery = `
        SELECT COUNT(*) as totalCount
        FROM CJB_JAESI
        WHERE CAR_AGENT = @CAR_AGENT
            AND CAR_STATUS = '001'
            ${carNo ? "AND CAR_NO LIKE @CAR_NO" : ""}
            ${carName ? "AND CAR_NAME LIKE @CAR_NAME" : ""}
            ${buyOwner ? "AND BUY_OWNER LIKE @BUY_OWNER" : ""}
            ${
              empName
                ? "AND dbo.SMJ_FN_EMPNAME(CAR_EMPID) LIKE @EMPKNAME"
                : ""
            }
            ${customerName ? "AND BUY_OWNER LIKE @CUSTOMER_NAME" : ""}
    `;

    const dataQuery = `
        SELECT 
            CAR_REGID,
            CAR_EMPID,
            dbo.SMJ_FN_EMPNAME(CAR_EMPID) AS EMPKNAME,
            CAR_NO,
            CAR_NAME,
            BUY_OWNER,
            BUY_TELNO,
            dbo.SMJ_FN_DATEFMT('H', CAR_BUYDATE) AS CAR_BUYDATE,
            CASE CAR_LOANCNT
                WHEN '0' THEN ''
                ELSE '(' + CONVERT(VARCHAR(10), CAR_LOANCNT) + ')'
            END AS CAR_LOANCNT,
            dbo.SMJ_FN_DATEFMT('D', CAR_REGDATE) AS CAR_REGDATE,
            BUY_TOTAL_FEE,                                                    -- 매입비 청구금액
            DATEDIFF(DAY, CAR_BUYDATE, DATEADD(DAY, 1, GETDATE())) AS IsDay,
            dbo.SMJ_FN_CPTSEQNO(CAR_REGID) AS CPTSEQNO,
            CAR_DELGUBN,
            BUY_REAL_FEE,                                                     -- 매입비 징구금액
            BUY_TOTAL_FEE - BUY_REAL_FEE AS Minap,                          -- 매입비 미납
            '(' + BUY_ZIP + ') ' + BUY_ADDR1 + ' ' + BUY_ADDR2 AS ADDR,
            BUY_NOTIAMT,
            CASE CAR_GUBN
                WHEN '0' THEN '상사'
                WHEN '1' THEN '고객'
                ELSE ''
            END AS CAR_GUBN_NAME,
            CASE 
                WHEN CAR_LOANSUM > 0 THEN CAR_LOANSUM 
                ELSE '' 
            END AS loansumamt,
            CAR_STDAMT,
            dbo.SMJ_FN_GETCDNAME('04', BUY_OWNERKIND) AS OWNERKINDNAME,
            CAR_GUBN,
            BUY_OWNERKIND,
            BUY_DOCUMENT,
            GOODS_FEE,
            CASE KU_JESI_NO
                WHEN '' THEN ''
                ELSE dbo.SMJ_FN_KUMAEDODATE(KU_JESI_NO)
            END AS MAEDODATE,
            BUY_BOHEOMAMT,                                                   -- 성능보험료
            BUY_TAX15                                                        -- 취득세
        FROM CJB_JAESI
        WHERE CAR_AGENT = @CAR_AGENT
            AND CAR_STATUS = '001'
            ${carNo ? "AND CAR_NO LIKE @CAR_NO" : ""}
            ${carName ? "AND CAR_NAME LIKE @CAR_NAME" : ""}
            ${buyOwner ? "AND BUY_OWNER LIKE @BUY_OWNER" : ""}
            ${
              empName
                ? "AND dbo.SMJ_FN_EMPNAME(CAR_EMPID) LIKE @EMPKNAME"
                : ""
            }
            ${customerName ? "AND BUY_OWNER LIKE @CUSTOMER_NAME" : ""}
        ORDER BY CAR_BUYDATE DESC, CAR_REGDATE DESC
        OFFSET (@PAGE - 1) * @PAGESIZE ROWS
        FETCH NEXT @PAGESIZE ROWS ONLY;
    `;

    // 쿼리 로깅
    console.log('carAgent:', carAgent);
    console.log('Count Query:', countQuery);
    console.log('Data Query:', dataQuery);

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
    console.error("Error fetching cars:", err);
    throw err;
  }
};

// 제시 차량 합계 조회
exports.getSuggestSummary = async ({  
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

    const query = `SELECT '상사' AS PRSN_SCT_CD
                        , COUNT(CAR_REG_ID) CNT
                        , ISNULL(SUM(PUR_AMT), 0) PUR_AMT
                        , ISNULL(SUM(PUR_SUP_PRC), 0) PUR_SUP_PRC
                        , ISNULL(SUM(PUR_VAT), 0) PUR_VAT
                        , ISNULL(SUM(CAR_LOAN_AMT), 0) CAR_LOAN_AMT
                        , ISNULL(SUM(AGENT_PUR_CST), 0) AGENT_PUR_CST
                      FROM CJB_CAR_PUR
                      WHERE AGENT_ID = @CAR_AGENT
                        AND CAR_STAT_CD = '001'
                        AND CAR_DEL_YN = 'N'
                        AND PRSN_SCT_CD = '0'  -- 상사
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
                    UNION ALL
                    SELECT '고객위탁' AS PRSN_SCT_CD
                        , COUNT(CAR_REG_ID) CNT
                        , ISNULL(SUM(PUR_AMT), 0) PUR_AMT
                        , ISNULL(SUM(PUR_SUP_PRC), 0) PUR_SUP_PRC
                        , ISNULL(SUM(PUR_VAT), 0) PUR_VAT
                        , ISNULL(SUM(CAR_LOAN_AMT), 0) CAR_LOAN_AMT
                        , ISNULL(SUM(AGENT_PUR_CST), 0) AGENT_PUR_CST
                      FROM CJB_CAR_PUR
                      WHERE AGENT_ID = @CAR_AGENT
                        AND CAR_STAT_CD = '001'
                        AND CAR_DEL_YN = 'N'
                        AND PRSN_SCT_CD = '1'  -- 고객위탁
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
                    UNION ALL
                    SELECT '합계' AS PRSN_SCT_CD
                        , COUNT(CAR_REG_ID) CNT
                        , ISNULL(SUM(PUR_AMT), 0) PUR_AMT
                        , ISNULL(SUM(PUR_SUP_PRC), 0) PUR_SUP_PRC
                        , ISNULL(SUM(PUR_VAT), 0) PUR_VAT
                        , ISNULL(SUM(CAR_LOAN_AMT), 0) CAR_LOAN_AMT
                        , ISNULL(SUM(AGENT_PUR_CST), 0) AGENT_PUR_CST
                      FROM CJB_CAR_PUR
                      WHERE AGENT_ID = @CAR_AGENT
                        AND CAR_STAT_CD = '001'
                        AND CAR_DEL_YN = 'N'
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

      console.log('totalCount:', query);

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching suggest sum:", err);
    throw err;
  }
};

// 제시 차량 상세 조회
exports.getSuggestDetailNew = async ({ car_regid }) => {
  try {
    const request = pool.request();
    request.input("CAR_REGID", sql.VarChar, car_regid);   

    const query = `SELECT                  
                          CAR_REG_ID              
                          , CAR_REG_DT            
                          , CAR_DEL_DT            
                          , CAR_STAT_CD           
                          , CAR_DEL_YN            
                          , AGENT_ID              
                          , DLR_ID                
                          , CAR_KND_CD           
                          , PRSN_SCT_CD           
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
                          , OWNR_NM               
                          , OWNR_TP_CD            
                          , OWNR_SSN              
                          , OWNR_BRNO             
                          , OWNR_PHON             
                          , OWNR_ZIP              
                          , OWNR_ADDR1            
                          , OWNR_ADDR2            
                          , OWNR_EMAIL            
                          , PUR_AMT               
                          , PUR_SUP_PRC           
                          , PUR_VAT               
                          , GAIN_TAX              
                          , AGENT_PUR_CST         
                          , AGENT_PUR_CST_PAY_DT  
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
                          , PARK_ZON_DESC         
                          , PARK_KEY_NO           
                          , CTSH_NO               
                          , CMBT_PRSN_MEMO        
                          , REG_DTIME             
                          , REGR_ID               
                          , MOD_DTIME             
                          , MODR_ID               
                            FROM CJB_CAR_PUR      
                          WHERE  CAR_REG_ID    = @CAR_REGID `;

    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching suggest detail:", err);
    throw err;
  }
};


// 제시 차량 상세 조회
exports.getSuggestDetail = async ({ car_regid }) => {
  try {
    const request = pool.request();
    request.input("CAR_REGID", sql.VarChar, car_regid);   

    const query = `SELECT CAR_REGID,
                          DBO.SMJ_FN_DATEFMT('F', CAR_REGDATE) AS CAR_REGDATE,
                          CAR_STATUS,
                          CAR_DELGUBN,
                          CAR_AGENT,
                          DBO.SMJ_FN_EMPNAME(CAR_EMPID) AS CAR_EMPID,
                          DBO.SMJ_FN_GETCDNAME('02', CAR_KIND) AS CAR_KIND,
                          DBO.SMJ_FN_DATEFMT('D', CAR_BUYDATE) AS CAR_BUYDATE,
                          CAR_LOANCNT,
                          CAR_NO,
                          CAR_NONEW,
                          CAR_NAME,
                          CAR_CATEGORY,
                          CAR_MAKER,
                          CAR_BIRTH,
                          DBO.SMJ_FN_COMMA(CAR_KM)             AS CAR_KM,   
                          CAR_ID,
                          CAR_STDAMT,
                          BUY_OWNER,
                          DBO.SMJ_FN_GETCDNAME_04('04', BUY_OWNERKIND) AS BUY_OWNERKIND,
                          BUY_SSNO,
                          BUY_BUZNO,
                          BUY_TELNO,
                          BUY_ZIP,
                          BUY_ADDR1,
                          BUY_ADDR2,
                          BUY_NOTIAMT,
                          DBO.SMJ_FN_COMMA(BUY_SUPAMT),
                          DBO.SMJ_FN_COMMA(BUY_TAX),
                          CASE BUY_TAXRSVCHECK
                            WHEN '' THEN '해당없음'
                            WHEN '0' THEN '수취'
                            WHEN '1' THEN '미수취'
                            ELSE ''
                          END AS BUY_TAXRSVCHECK,
                          DBO.SMJ_FN_DATEFMT('D', BUY_TAXDATE) AS BUY_TAXDATE,
                          CASE BUY_DOCUMENT
                            WHEN '' THEN '해당없음'
                            WHEN '0' THEN '수령'
                            WHEN '1' THEN '미수령'
                            ELSE ''
                          END AS BUY_DOCUMENT,
                          BUY_FILE_1,
                          BUY_FILE_2,
                          BUY_FILE_3,
                          BUY_FILE_4,
                          BUY_FILE_5,
                          BUY_DESC,
                          BUY_TOTAL_FEE,
                          BUY_REAL_FEE,
                          BUY_TOTAL_FEE - BUY_REAL_FEE,
                          CASE CAR_GUBN
                            WHEN '0' THEN '상사'
                            WHEN '1' THEN '고객'
                            ELSE ''
                          END AS CAR_GUBN,
                          CAR_YEAR,
                          BUY_EMAIL,
                          BUY_TAX_ONE,
                          CASE BUY_TAXGUBN
                            WHEN '0' THEN '전자(세금)계산서'
                            WHEN '1' THEN '종이계산서'
                            ELSE '해당없음'
                          END AS BUY_TAXGUBN,
                          GOODS_FEE,
                          CAR_EMPID,
                          BUY_TAX15,
                          KU_JESI_NO,
                          CASE KU_JESI_NO
                            WHEN '' THEN ''
                            ELSE DBO.SMJ_FN_KUMAEDODATE(KU_JESI_NO)
                          END                                  AS MAEDODATE
                    FROM   CJB_JAESI
                    WHERE  CAR_REGID = @CAR_REGID `;

    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching suggest detail:", err);
    throw err;
  }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 공통
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// 관리키 조회  dbo.SMJ_FN_MK_REGID   car_reg_id 값 만드는 함수 
exports.getMgtKey = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("carAgent", sql.VarChar, carAgent);

    const query = `
      SELECT DBO.SMJ_FN_MK_MGTKEY(A.AGENT_ID) AS MgtKey,
             AGENT_NM AS FranchiseCorpName
        FROM CJB_AGENT A,
             CJB_USR B
       WHERE A.AGENT_ID = B.AGENT_ID
         AND B.USR_GRADE_CD = '9'
         AND A.AGENT_ID = @carAgent;
    `;

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching management key:", err);
    throw err;
  }
};



// 관리키 조회  - 이전 코드


/*
exports.getMgtKey = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("carAgent", sql.VarChar, carAgent);

    const query = `
      SELECT DBO.SMJ_FN_MK_MGTKEY(@carAgent) AS MgtKey,
             AG_NAME AS FranchiseCorpName
      FROM   SMJ_AGENT A,
             SMJ_USER B
      WHERE  A.AGENT = B.AGENT
             AND B.EMPGRADE = '9'
             AND A.AGENT = @carAgent;
    `;

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching management key:", err);
    throw err;
  }
};
*/



// 조합 전산 딜러 조회
exports.getCombineDealerList = async ({ carCombineAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_COMBINE_AGENT", sql.VarChar, carCombineAgent);

    const query = `SELECT DL_SEQNO,
                          DL_CODE,
                          DL_NAME,
                          DL_SANGSA_CODE,
                          DL_NO,
                          DL_SNO,
                          DL_INDATE,
                          DL_OUTDATE,
                          DL_TELNO, 
                          DL_ZIP,
                          DL_ADDR1,
                          DL_ADDR2,
                          DL_REG_DATETIME,
                          DL_FLAG,
                          DL_INSERT_DATETIME
                    FROM   KU_DEALER
                    WHERE  DL_SANGSA_CODE = @CAR_COMBINE_AGENT
                          AND DL_FLAG = '' 
                    ORDER BY DL_NAME
                    ;   
    `;  
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching combination dealer list:", err);
    throw err;
  }
};

// 딜러 조회
exports.getDealerList = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT USR_ID,
                     USR_NM,
                     USR_PHON
                  FROM   dbo.CJB_USR
                  WHERE  AGENT_ID = @CAR_AGENT
                         AND AGENT_CD > 0
                         AND dbo.CJB_FN_DATEFMT('D', GETDATE()) BETWEEN USR_STRT_DT AND USR_END_DT
                         AND USR_GRADE_CD NOT IN ('9', '4')
                  ORDER  BY USR_NM 
    `;

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching dealer list:", err);
    throw err;
  }
};

// 딜러 상세 목록 
exports.getDealerDetailList = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `
      SELECT *
        FROM   (SELECT ROW_NUMBER()
                        OVER(
                          ORDER BY EMPEDATE, EMPKNAME, DEALER_CODE, EMPGRADE DESC,
                        EMPKNAME )
                              AS RNUM,
                      EMPID,
                      EMPKNAME,
                      EMPTELNO1,
                      EMPEMAIL,
                      CONVERT(VARCHAR, EMPSDATE, 23)
                              AS EMPSDATE,
                      CASE CONVERT(VARCHAR, EMPEDATE, 23)
                        WHEN '1900-01-01' THEN ''
                        ELSE CONVERT(VARCHAR, EMPEDATE, 23)
                      END
                              EDNM,
                      EMPPHOTO,
                      CASE EMPGRADE
                        WHEN '0' THEN '딜러'
                        WHEN '1' THEN '사무장'
                        WHEN '9' THEN '대표'
                        ELSE ''
                      END
                              EMPGRADENAME,
                      CASE EMPTAXGUBN
                        WHEN '0' THEN '원천징수대상자'
                        WHEN '1' THEN '사업자등록'
                        ELSE ''
                      END
                              EMPTAXGUBNNAME,
                      CASE
                        WHEN LEN(EMPADDR1) > 15 THEN SUBSTRING(EMPADDR1, 1, 15)
                        ELSE EMPADDR1
                      END
                              ADDR1,
                      EMPGRADE,
                      SANGSA_CODE,
                      DEALER_CODE,
                      EMPSNO
                FROM   SMJ_USER
                WHERE  AGENT = @CAR_AGENT
                      AND SANGSA_CODE > 0
                      AND EMPGRADE IN ( '0', '9' )) AS V
        WHERE  1 = 1 -- RNUM BETWEEN 1 AND 100 
   ;
    `;  
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching dealer detail list:", err);
    throw err;
  }
};

// 공통코드 조회
exports.getCDList = async ({ grpCD }) => {
  try {
    const request = pool.request();
    request.input("GRP_CD", sql.VarChar, grpCD);

    const query = `SELECT CD
                        , CD_NM
                  FROM   dbo.CJB_COMM_CD
                  WHERE  GRP_CD = @GRP_CD
                         AND USE_YN = 'Y'
                  ORDER  BY CD;
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching CD list:", err);
    throw err;
  }
};

// 상사 지출 항목 조회  (공통코드)
exports.getAgentExpenseList = async () => {
  try {
    const request = pool.request();
    const query = ` SELECT INDEXCD,
                          CODE1,
                          CODE2,
                          NAME,
                          CASE ISUSE
                            WHEN 'Y' THEN '사용'
                            ELSE '미사용'
                          END AS ISUSE,
                          NAME2,
                          SORTNO
                    FROM   SMJ_CODE
                    WHERE  INDEXCD = 80
                          AND CODE1 != '###'
                          AND AGENT = '00002'
                    ORDER  BY SORTNO ASC,
                              NAME ;
                  `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching company profit list:", err);
    throw err;
  }
};


// 상사 매입비 항목 조회  (공통코드)
exports.getAgentBuyFeeList = async () => {
  try {
    const request = pool.request();
    const query = ` SELECT CNFG_FEE_SEQ,
                           CNFG_FEE_NO,
                           CNFG_FEE_TITLE,
                           CNFG_FEE_COND,
                           CNFG_FEE_RATE,
                           CNFG_FEE_AMT
                      FROM SMJ_FEECONFIG
                     WHERE CNFG_FEE_KIND = '0'
                           AND CNFG_FEE_AGENT = '00518' 
                      ;`;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching agent sell fee list:", err);
    throw err;
  }
};


// 상사 매입비 항목 조회  (공통코드)
exports.getAgentBuyFeeList = async () => {
  try {
    const request = pool.request();
    const query = ` SELECT CNFG_FEE_SEQ,
                           CNFG_FEE_NO,
                           CNFG_FEE_TITLE,
                           CNFG_FEE_COND,
                           CNFG_FEE_RATE,
                           CNFG_FEE_AMT
                      FROM SMJ_FEECONFIG
                     WHERE CNFG_FEE_KIND = '0'
                           AND CNFG_FEE_AGENT = '00518' 
                      ;`;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching agent sell fee list:", err);
    throw err;
  }
};

// 상사 매도비 항목 조회  (공통코드)
exports.getAgentSellFeeList = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);
    const query = ` SELECT CNFG_FEE_SEQ,
                           CNFG_FEE_NO,
                           CNFG_FEE_TITLE,
                           CNFG_FEE_COND,
                           CNFG_FEE_RATE,
                           CNFG_FEE_AMT
                      FROM SMJ_FEECONFIG
                     WHERE CNFG_FEE_KIND = '1'
                           AND CNFG_FEE_AGENT = '00518' 
                      ;`;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching agent sell fee list:", err);
    throw err;
  }
};

// 상사 수익 항목 조회  (공통코드)
exports.getAgentProfitList = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);
    const query = ` SELECT INDEXCD,
                            CODE1,
                            CODE2,
                            NAME,
                            CASE ISUSE
                              WHEN 'Y' THEN '사용'
                              ELSE '미사용'
                            END AS ISUSE,
                            NAME2,
                            SORTNO
                      FROM   SMJ_CODE
                      WHERE  INDEXCD = 81
                            AND CODE1 != '###'
                            AND AGENT = @CAR_AGENT
                      ORDER  BY SORTNO ASC,
                                NAME ;
                  `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching company profit list:", err);
    throw err;
  }
};

// 상사 수익 항목 조회  (공통코드)
exports.getCompanyProfitList = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);
    const query = ` SELECT INDEXCD,
                            CODE1,
                            CODE2,
                            NAME,
                            CASE ISUSE
                              WHEN 'Y' THEN '사용'
                              ELSE '미사용'
                            END AS ISUSE,
                            NAME2,
                            SORTNO
                      FROM   SMJ_CODE
                      WHERE  INDEXCD = 81
                            AND CODE1 != '###'
                            AND AGENT = @CAR_AGENT
                      ORDER  BY SORTNO ASC,
                                NAME ;
                  `;

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching company profit list:", err);
    throw err;
  }
};


// 고객 목록 조회
exports.getCustomerList = async ({ carAgent, search }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);
    request.input("SEARCH", sql.VarChar, search);
    const query = `SELECT CUSTNO,
                          NAME,
                          CUSTKIND,
                          TELNO1,
                          EMAIL,
                          SSNO,
                          BUZNO,
                          ZIP,
                          ADDR1,
                          ADDR2,
                          DBO.SMJ_FN_GETCDNAME('04', CUSTKIND) AS CUSTKINDNAME
                    FROM   (SELECT CUSTNO,
                                  NAME,
                                  CUSTKIND,
                                  TELNO1,
                                  EMAIL,
                                  SSNO,
                                  BUZNO,
                                  ZIP,
                                  ADDR1,
                                  ADDR2,
                                  ROW_NUMBER()
                                    OVER(
                                      ORDER BY NAME ASC) RN
                            FROM   SMJ_CUSER
                            WHERE  1 = 1
                                  AND AGENT = @CAR_AGENT
                                  AND ( NAME LIKE '%' + @SEARCH + '%'
                                        OR TELNO1 LIKE '%' + @SEARCH + '%' )) AS LIST
                    WHERE  LIST.RN BETWEEN 1 AND 10 ;
    `;

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching customer list:", err);
    throw err;
  }
};





////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 재고금융
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 재고금융 목록 조회
exports.getFinanceList = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);
    const query = `SELECT *
                    FROM   (SELECT ROW_NUMBER()
                                    OVER(
                                      ORDER BY CPT_END, B.REGDATE DESC, CPTSDATE DESC ) AS RNUM,
                                  CPTSEQNO,
                                  REGID AS CAR_REGID,
                                  DBO.SMJ_FN_EMPNAME(CAR_EMPID)                         EMPNAME,
                                  DBO.SMJ_FN_DATEFMT('D', B.REGDATE)                    REGDATE,
                                  CASE CPTGUBN
                                    WHEN '001' THEN '신규'
                                    WHEN '002' THEN '갱신'
                                    WHEN '003' THEN '연장'
                                    ELSE ''
                                  END                                                   AS CPTGUBN,
                                  DBO.SMJ_FN_GETCDNAME('05', CPTCOMPANY)                AS CPTCOMPANYNAME,
                                  CPTAMT / 10000                                        AS CPTAMT,
                                  CPTCMPRATE,
                                  CPTDEALRATE,
                                  CPTPERIOD,
                                  DBO.SMJ_FN_DATEFMT('H', CPTSDATE)                     AS CPTSDATE,
                                  DBO.SMJ_FN_DATEFMT('H', CPTPAYDATE)                   AS CPTPAYDATE,
                                  FEE_DEAL_TOT,
                                  FEE_DEAL_REAL,
                                  CPTDESC,
                                  CAR_NO,
                                  CAR_NAME,
                                  BUY_OWNER,
                                  CPT_END,
                                  CASE CPT_END
                                    WHEN '0' THEN '진행중'
                                    WHEN '1' THEN '종료'
                                    ELSE ''
                                  END                                                   AS CPT_END2,
                                  FEE_DEAL_TOT - FEE_DEAL_REAL                          AS MINAP,
                                  BUY_NOTIAMT,
                                  CASE CAR_STATUS
                                    WHEN '001' THEN '제시'
                                    ELSE '매도'
                                  END                                                   AS STATUS,
                                  CPTCOMPANY,
                                  FEE_HAEJI_SUM
                            FROM  SMJ_MAINLIST A,
                                  SMJ_CAPITAL_LIST B
                            WHERE  A.CAR_REGID = B.REGID
                                  AND A.CAR_AGENT = @CAR_AGENT
                                  AND A.CAR_DELGUBN = '0') AS V
                    WHERE  RNUM BETWEEN 1 AND 10 
                    ;
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching finance list:", err);
    throw err;
  }
};

// 재고금융 합계 조회
exports.getFinanceSum = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);
    const query = `SELECT '0' GUBUN, 
                          SUM(CPTAMT) CPTAMT,
                          SUM(FEE_COMP_SUM) FEE_COMP_SUM,
                          SUM(FEE_DEAL_TOT) FEE_DEAL_TOT,
                          SUM(FEE_DEAL_REAL) FEE_DEAL_REAL,
                          SUM(FEE_DEAL_TOT) - SUM(FEE_DEAL_REAL) FEE_DEAL_DIFF,
                          SUM(BUY_NOTIAMT) BUY_NOTIAMT,
                          COUNT(CPTSEQNO) CNT
                    FROM  SMJ_MAINLIST A,
                          SMJ_CAPITAL_LIST B
                    WHERE A.CAR_REGID = B.REGID
                          AND A.CAR_AGENT = '00002'
                          AND A.CAR_DELGUBN = '0'
                          AND B.CPT_END = '0' 
                    UNION ALL
                    SELECT '1' GUBUN, 
                          SUM(CPTAMT) CPTAMT,
                          SUM(FEE_COMP_SUM) FEE_COMP_SUM,
                          SUM(FEE_DEAL_TOT) FEE_DEAL_TOT,
                          SUM(FEE_DEAL_REAL) FEE_DEAL_REAL,
                          SUM(FEE_DEAL_TOT) - SUM(FEE_DEAL_REAL) FEE_DEAL_DIFF,
                          SUM(BUY_NOTIAMT) BUY_NOTIAMT,
                          COUNT(CPTSEQNO) CNT
                    FROM  SMJ_MAINLIST A,
                          SMJ_CAPITAL_LIST B
                    WHERE  A.CAR_REGID = B.REGID
                          AND A.CAR_AGENT = '00511'
                          AND A.CAR_DELGUBN = '0'
                          AND B.CPT_END = '1' 
                    ;
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching finance sum:", err);
    throw err;
  }
};

// 재고금융 상세 조회
exports.getFinanceDetail = async ({ carRegid }) => {
  try {
    const request = pool.request();
    request.input("CAR_REGID", sql.VarChar, carRegid);

    const query = `SELECT DBO.SMJ_FN_EMPNAME(CAR_EMPID) AS EMPNAME,
                          CAR_NO,
                          CAR_EMPID,
                          CAR_REGID,
                          BUY_NOTIAMT,
                          DBO.SMJ_FN_DATEFMT('D', CAR_BUYDATE) AS CAR_BUYDATE,
                          DBO.SMJ_FN_DATEFMT('D', Getdate())   AS CURDATE,
                          CAR_NAME,
                          DBO.SMJ_FN_GETCDNAME('02', CAR_KIND) AS CAR_KINDNAME
                    FROM   SMJ_MAINLIST
                    WHERE  CAR_REGID = @CAR_REGID ;
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching finance detail:", err);
    throw err;
  }
};


// 재고금융 차량 상세 조회
exports.getFinanceDetailCarInfo = async ({ carRegid }) => {
  try {
    const request = pool.request();
    request.input("CAR_REGID", sql.VarChar, carRegid);

    const query = `SELECT CPTSEQNO,
                          A.CAR_REGID,
                          A.CAR_EMPID,
                          CASE CPTGUBN
                            WHEN '001' THEN '신규대출'
                            WHEN '002' THEN '갱신(재)대출'
                            WHEN '003' THEN '연장처리'
                            ELSE ''
                          END                                    AS CPTGUBN,
                          DBO.SMJ_FN_GETCDNAME('05', CPTCOMPANY) AS CPTCOMPANY,
                          CPTAMT,
                          CPTCMPRATE,
                          CPTDEALRATE,
                          CPTPERIOD,
                          DBO.SMJ_FN_DATEFMT('D', CPTSDATE) AS CPTSDATE,
                          DBO.SMJ_FN_DATEFMT('D', CPTPAYDATE) AS CPTPAYDATE,
                          B.REGDATE,
                          DBO.SMJ_FN_EMPNAME(A.CAR_EMPID) AS EMPNAME,
                          CAR_NO,
                          CPT_END,
                          FEE_HAEJI_SUM
                    FROM  SMJ_MAINLIST A
                          LEFT OUTER JOIN SMJ_CAPITAL_LIST B
                            ON A.CAR_REGID = B.REGID
                   WHERE A.CAR_REGID = @CAR_REGID ;`;

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching finance detail:", err);
    throw err;
  }
};

// 재고금융 상세 목록 조회
exports.getFinanceDetailList = async ({ carRegid }) => {
  try {
    const request = pool.request();
    request.input("CAR_REGID", sql.VarChar, carRegid);
    //request.input("CPTSEQNO", sql.VarChar, cptseqno);

    const query = `SELECT CPTDTLSEQNO,
                          CPTDTLCHASU,
                          CPTDTLMNY,
                          DBO.SMJ_FN_DATEFMT('D', CPTDTLPAYDATE) AS CPTDTLPAYDATE,
                          CPTDTLMNYDEAL,
                          CPTDTLREALMNYDEAL,
                          DBO.SMJ_FN_DATEFMT('D', CPTDTLDEALDATE) AS CPTDTLDEALDATE,
                          CPTDTLDESC,
                          CPTDAYCNT,
                          CONVERT(INT, ( CPTAMT * ( CONVERT(FLOAT, CPTCMPRATE) / 100 ) ) / 365) AS CPTDTLMNYDEAL,
                          CONVERT(INT, ( CPTAMT * ( CONVERT(FLOAT, CPTDEALRATE) / 100 ) ) / 365) AS CPTDTLREALMNYDEAL
                    FROM   SMJ_CAPITAL_LIST A,
                          SMJ_CAPITAL_DETAIL B
                    WHERE  A.CPTSEQNO = B.CPTSEQNO
                          AND A.REGID = @CAR_REGID ;
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching finance detail list:", err);
    throw err;
  }
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 판매 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 판매 내역 조회
exports.getSellList = async ({ carAgent, page = 1, pageSize = 10 }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);
    request.input("PAGE", sql.Int, page);
    request.input("PAGESIZE", sql.Int, pageSize);

    // 전체 카운트 조회
    const countQuery = `
        SELECT COUNT(*) as totalCount
        FROM SMJ_MAINLIST A
        LEFT OUTER JOIN SMJ_SOLDLIST B ON A.CAR_REGID = B.SELL_CAR_REGID
        LEFT OUTER JOIN SMJ_USER C ON A.CAR_EMPID = C.EMPID
        WHERE CAR_AGENT = @CAR_AGENT
            AND A.CAR_DELGUBN = '0'
            AND CAR_STATUS IN ('002', '003')
    `;

    const dataQuery = `
        SELECT 
            SELL_CAR_REGID,
            DBO.SMJ_FN_DATEFMT('H', CAR_BUYDATE) AS CAR_BUYDATE,
            CASE CAR_GUBN
                WHEN '0' THEN '상사'
                WHEN '1' THEN '고객'
                ELSE ''
            END AS CAR_GUBNNAME,
            CAR_NO,
            CAR_NAME,
            BUY_NOTIAMT,
            SELL_NOTIAMT,
            SELL_NOTIAMT - BUY_NOTIAMT AS COL1,
            SELL_OWNER,
            EMPKNAME,
            DATEDIFF(DAY, CAR_BUYDATE, SELL_DATE) + 1 AS ISDAY,
            CAR_LOANSUM,
            CASE CAR_LOANCNT
                WHEN '0' THEN ''
                ELSE CONVERT(VARCHAR(10), CAR_LOANCNT) + '건'
            END AS CAR_LOANCNT,
            SELL_TOTAL_FEE,
            SELL_REAL_FEE,
            SELL_TOTAL_FEE - SELL_REAL_FEE AS COL2,
            DBO.SMJ_FN_DATEFMT('H', SELL_DATE) AS SELL_DATE,
            CAR_GUBN,
            CASE SELL_ADJ_DATE
                WHEN '' THEN '정산대기'
                ELSE SELL_ADJ_DATE
            END AS SELL_TAXENDCHECKNAME,
            CASE
                WHEN CAR_EMPID <> SELL_EMPID THEN ' (알선)'
                ELSE ''
            END ALSON,
            CASE B.SELLFEEGUBN
                WHEN '0' THEN '(별도)'
                WHEN '1' THEN '(포함)'
                ELSE ''
            END AS SELLFEEGUBNNAME,
            SELL_BOHEOMAMT_1 + SELL_BOHEOMAMT_2 + SELL_BOHEOMAMT_3 AS SELL_BOHEOMAMT,
            BUY_TAX15
        FROM SMJ_MAINLIST A
        LEFT OUTER JOIN SMJ_SOLDLIST B ON A.CAR_REGID = B.SELL_CAR_REGID
        LEFT OUTER JOIN SMJ_USER C ON A.CAR_EMPID = C.EMPID
        WHERE CAR_AGENT = @CAR_AGENT
            AND A.CAR_DELGUBN = '0'
            AND CAR_STATUS IN ('002', '003')
        ORDER BY SELL_DATE DESC, SELL_REGDATE DESC
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
    console.error("Error fetching sell list:", err);
    throw err;
  }
};

// 매도 종합 합계 조회
exports.getSellSum = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);  

    const query = `SELECT '상사' GUBUN,
                          SUM(BUY_NOTIAMT) / 10000 AS BUY_NOTIAMT,
                          SUM(CAR_STDAMT) / 10000 AS CAR_STDAMT,
                          SUM(BUY_NOTIAMT) / 10000 - SUM(CAR_STDAMT) / 10000 AS CAR_STDAMT_DIFF,
                          SUM(SELL_NOTIAMT) / 10000 AS SELL_NOTIAMT,
                          SUM(SELL_NOTIAMT) / 10000 - SUM(BUY_NOTIAMT) / 10000 AS BUY_NOTIAMT_DIFF,
                          SUM(SELL_TOTAL_FEE) / 10000 AS SELL_TOTAL_FEE,
                          SUM(SELL_REAL_FEE) / 10000 AS SELL_REAL_FEE,
                          SUM(SELL_TOTAL_FEE) / 10000 - SUM(SELL_REAL_FEE) / 10000 AS SELL_REAL_DIFF,
                          COUNT(CAR_REGID) CAR_CNT
                    FROM   SMJ_MAINLIST A
                          LEFT OUTER JOIN SMJ_SOLDLIST B
                                        ON A.CAR_REGID = B.SELL_CAR_REGID
                    WHERE  CAR_AGENT = '00002'
                          AND A.CAR_DELGUBN = '0'
                          AND CAR_STATUS IN ( '002', '003' )
                          AND CAR_GUBN = '0' 
                    UNION ALL  
                    SELECT '고객/위탁',
                          SUM(BUY_NOTIAMT) / 10000,
                          SUM(CAR_STDAMT) / 10000,
                          SUM(BUY_NOTIAMT) / 10000 - SUM(CAR_STDAMT) / 10000,
                          SUM(SELL_NOTIAMT) / 10000,
                          SUM(SELL_NOTIAMT) / 10000 - SUM(BUY_NOTIAMT) / 10000,
                          SUM(SELL_TOTAL_FEE) / 10000,
                          SUM(SELL_REAL_FEE) / 10000,
                          SUM(SELL_TOTAL_FEE) / 10000 - SUM(SELL_REAL_FEE) / 10000,
                          COUNT(CAR_REGID)
                    FROM   SMJ_MAINLIST A
                          LEFT OUTER JOIN SMJ_SOLDLIST B
                                        ON A.CAR_REGID = B.SELL_CAR_REGID
                    WHERE  CAR_AGENT = '00002'
                          AND A.CAR_DELGUBN = '0'
                          AND CAR_STATUS IN ( '002', '003' )
                          AND CAR_GUBN = '1'  ;     
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching sell sum:", err);
    throw err;
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 판매 상세 조회
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 매도비 조회
exports.getSellFee = async ({ sell_car_regid }) => {
  try {
    const request = pool.request();
    request.input("CAR_REGID", sql.VarChar, sell_car_regid);

    const query = `SELECT SELL_TOTAL_FEE,
                          SELL_REAL_FEE,
                          (SELL_TOTAL_FEE - SELL_REAL_FEE) AS SELL_MINAP_FEE
                    FROM   SMJ_SOLDLIST
                    WHERE  SELL_CAR_REGID = @CAR_REGID ;`;

    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching sell fee:", err);
    throw err;
  }
};

// 재고금융이자 조회
exports.getFinanceInterest = async ({ sell_car_regid }) => {
  try {
    const request = pool.request();
    request.input("CAR_REGID", sql.VarChar, sell_car_regid);

    const query = `SELECT COUNT(CPTSEQNO) AS CPTSEQNO,
                          SUM(FEE_DEAL_TOT) AS FEE_DEAL_TOT,
                          SUM(FEE_DEAL_REAL) AS FEE_DEAL_REAL,
                          SUM(FEE_DEAL_TOT) - SUM(FEE_DEAL_REAL) AS FEE_DEAL_DIFF,
                          SUM(FEE_HAEJI_SUM) AS FEE_HAEJI_SUM
                    FROM   SMJ_CAPITAL_LIST
                    WHERE  REGID = @CAR_REGID ;`;

    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching finance interest:", err);
    throw err;
  }
};

// 매출증빙 목록 조회
exports.getSellProofList = async ({ sell_car_regid }) => {
  try {
    const request = pool.request();
    request.input("SELL_CAR_REGID", sql.VarChar, sell_car_regid); 

    const query = `SELECT SELL_RECEIPT_AMT_1,
                          SELL_RECEIPT_FEEAMT_1,
                          SELL_SENGNUNGAMT_1,
                          SELL_BOHEOMAMT_1,
                          CASE SELL_RECEIPT_GUBN_1
                            WHEN '0' THEN '현금영수증'
                            WHEN '1' THEN '세금계산서'
                            ELSE '카드매출'
                          END AS SELL_RECEIPT_GUBN_1_NAME,
                          CASE Len(SELL_RECEIPT_NO_1)
                            WHEN 10 THEN LEFT(SELL_RECEIPT_NO_1, 6) + '****'
                            WHEN 11 THEN LEFT(SELL_RECEIPT_NO_1, 7) + '****'
                            ELSE LEFT(SELL_RECEIPT_NO_1, 6) + '-*******'
                          END AS SELL_RECEIPT_NO_1_NAME,
                          CASE RECEIPT_GUBN_1
                            WHEN 'S' THEN '주민번호'
                            WHEN 'H' THEN '휴대폰'
                            ELSE '사업자번호'
                          END AS RECEIPT_GUBN_1_NAME,
                          SELL_RECEIPT_MEMO_1,
                          SELL_RECEIPT_AMT_2,
                          SELL_RECEIPT_FEEAMT_2,
                          SELL_SENGNUNGAMT_2,
                          SELL_BOHEOMAMT_2,
                          CASE SELL_RECEIPT_GUBN_2
                            WHEN '0' THEN '현금영수증'
                            WHEN '1' THEN '세금계산서'
                            ELSE '카드매출'
                          END AS SELL_RECEIPT_GUBN_2_NAME,
                          CASE Len(SELL_RECEIPT_NO_2)
                            WHEN 10 THEN LEFT(SELL_RECEIPT_NO_2, 6) + '****'
                            WHEN 11 THEN LEFT(SELL_RECEIPT_NO_2, 7) + '****'
                            ELSE LEFT(SELL_RECEIPT_NO_2, 6) + '-*******'
                          END AS SELL_RECEIPT_NO_2_NAME,
                          CASE RECEIPT_GUBN_2
                            WHEN 'S' THEN '주민번호'
                            WHEN 'H' THEN '휴대폰'
                            ELSE '사업자번호'
                          END AS RECEIPT_GUBN_2_NAME,
                          SELL_RECEIPT_MEMO_2,
                          SELL_RECEIPT_AMT_3,
                          SELL_RECEIPT_FEEAMT_3,
                          SELL_SENGNUNGAMT_3,
                          SELL_BOHEOMAMT_3,
                          CASE SELL_RECEIPT_GUBN_3
                            WHEN '0' THEN '현금영수증'
                            WHEN '1' THEN '세금계산서'
                            ELSE '카드매출'
                          END AS SELL_RECEIPT_GUBN_3_NAME,
                          CASE Len(SELL_RECEIPT_NO_3)
                            WHEN 10 THEN LEFT(SELL_RECEIPT_NO_3, 6) + '****'
                            WHEN 11 THEN LEFT(SELL_RECEIPT_NO_3, 7) + '****'
                            ELSE LEFT(SELL_RECEIPT_NO_3, 6) + '-*******'
                          END AS SELL_RECEIPT_NO_3_NAME,
                          CASE RECEIPT_GUBN_3
                            WHEN 'S' THEN '주민번호'
                            WHEN 'H' THEN '휴대폰'
                            ELSE '사업자번호'
                          END AS RECEIPT_GUBN_3_NAME,
                          SELL_RECEIPT_MEMO_3,
                          SELL_ADJ_DATE
                    FROM   SMJ_SOLDLIST B
                    WHERE  SELL_CAR_REGID = @SELL_CAR_REGID ;`;

    const result = await request.query(query);
    return result.recordset;
  } catch (err) { 
    console.error("Error fetching sell proof list:", err);
    throw err;
  }
};

// 매도 상세 조회
exports.getSellDetail = async ({ sell_car_regid }) => {
  try {
    const request = pool.request();
    request.input("SELL_CAR_REGID", sql.VarChar, sell_car_regid);

    const query = `SELECT SELL_EMPID,
                          DBO.SMJ_FN_GETCDNAME('03', SELL_KIND) AS SELL_KIND,
                          DBO.SMJ_FN_DATEFMT('D', SELL_DATE) AS SELL_DATE,
                          SELL_OWNER,
                          DBO.SMJ_FN_GETCDNAME('04', SELL_OWNERKIND) AS SELL_OWNERKIND,
                          SELL_SSNO,
                          SELL_BUZNO,
                          SELL_TELNO,
                          SELL_ZIP,
                          SELL_ADDR1,
                          SELL_ADDR2,
                          SELL_NOTIAMT,
                          SELL_SUPAMT,
                          SELL_TAX,
                          SELL_TAXRECEIPT,
                          SELLFEEGUBN,
                          SELL_CASHKIND,
                          SELL_CASHDESC,
                          DBO.SMJ_FN_DATEFMT('D', SELL_CASHDATE) AS SELL_CASHDATE,
                          SELL_FILE_1,
                          SELL_FILE_2,
                          SELL_FILE_3,
                          SELL_FILE_4,
                          SELL_FILE_5,
                          SELL_DESC,
                          BUY_EMP_TAXGUBN,
                          SELL_EMP_TAXGUBN,
                          SELL_COSIGNSHOP,
                          SELL_COSIGNAGENT,
                          SELL_COSIGNEMPID,
                          SELL_COSIGNEMPNAME,
                          SELL_COSIGNTELNO,
                          SELL_COSIGNSNO,
                          SELL_COSIGNBIZNO,
                          SELL_COSIGNBANK,
                          SELL_COSIGNBANKNO,
                          SELL_COSIGNZIP,
                          SELL_COSIGNADDR1,
                          SELL_COSIGNADDR2,
                          SELL_COSIGNEMPAMT,
                          CASE SELL_EMPID
                            WHEN '000000000' THEN SELL_COSIGNEMPNAME
                            WHEN '999999999' THEN SELL_COSIGNEMPNAME
                            ELSE DBO.SMJ_FN_EMPNAME(SELL_EMPID)
                          END                              AS SELL_EMPNAME,
                          CASE BUY_EMP_TAXGUBN
                            WHEN '0' THEN '(원천징수대상자)'
                            WHEN '1' THEN '(사업자등록자)'
                            ELSE ''
                          END                              AS BUY_EMP_TAXNAME,
                          CASE SELL_EMP_TAXGUBN
                            WHEN '0' THEN '(원천징수대상자)'
                            WHEN '1' THEN '(사업자등록자)'
                            ELSE ''
                          END                              AS SELL_EMP_TAXNAME,
                          SELL_NOTIAMT - SELL_COSIGNEMPAMT AS ALSONTAXSTDAMT,
                          BUYFEEGUBN,
                          CASE SELL_CASHKIND
                            WHEN '0' THEN '현금영수증'
                            WHEN '1' THEN '(세금계산서)'
                            WHEN '2' THEN '(카드매출)'
                            ELSE ''
                          END                              AS SELL_CASHKINDNAME,
                          SELL_TAXENDCHECK,
                          SELL_CASHBILL_YN,
                          SELL_CASHBILLFEE_YN,
                          CASE
                            WHEN CONVERT(DATE, SELL_ADJ_DATE) >= CONVERT(DATE, '2019-06-23') THEN
                            'New'
                            ELSE 'Old'
                          END                              AS NEWOLD
                    FROM  SMJ_MAINLIST A,
                          SMJ_SOLDLIST B
                    WHERE A.CAR_REGID = B.SELL_CAR_REGID
                      AND CAR_DELGUBN = '0'
                      AND SELL_CAR_REGID = @SELL_CAR_REGID ;`;


    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching sell detail list:", err);
    throw err;
  }
};


// 매입(제시) 상세 조회
exports.getBuyDetail = async ({ sell_car_regid }) => {
  try {
    const request = pool.request();
    request.input("SELL_CAR_REGID", sql.VarChar, sell_car_regid);

    const query = `SELECT CAR_REGID,
                          DBO.SMJ_FN_DATEFMT('F', CAR_REGDATE) AS CAR_REGDATE,
                          CAR_STATUS,
                          CAR_DELGUBN,
                          CAR_AGENT,
                          CAR_EMPID,
                          DBO.SMJ_FN_GETCDNAME('02', CAR_KIND) AS CAR_KIND,
                          DBO.SMJ_FN_DATEFMT('D', CAR_BUYDATE) AS CAR_BUYDATE,
                          CAR_LOANCNT,
                          CAR_NO,
                          CAR_NONEW,
                          CAR_NAME,
                          CAR_CATEGORY,
                          CAR_MAKER,
                          CAR_BIRTH,
                          DBO.SMJ_FN_COMMA(CAR_KM)             AS CAR_KM,
                          CAR_ID,
                          DBO.SMJ_FN_COMMA(CAR_STDAMT)         AS CAR_STDAMT,
                          BUY_OWNER,
                          DBO.SMJ_FN_GETCDNAME_04('04', BUY_OWNERKIND) AS BUY_OWNERKIND,
                          BUY_SSNO,
                          BUY_BUZNO,
                          BUY_TELNO,
                          BUY_ZIP,
                          BUY_ADDR1,
                          BUY_ADDR2,
                          BUY_NOTIAMT,
                          DBO.SMJ_FN_COMMA(BUY_SUPAMT) AS BUY_SUPAMT,
                          DBO.SMJ_FN_COMMA(BUY_TAX) AS BUY_TAX,
                          CASE BUY_TAXRSVCHECK
                            WHEN '' THEN '해당없음'
                            WHEN '0' THEN '수령'
                            WHEN '1' THEN '미수령'
                            ELSE ''
                          END AS BUY_TAXRSVCHECK,
                          DBO.SMJ_FN_DATEFMT('D', BUY_TAXDATE) AS BUY_TAXDATE,
                          CASE BUY_DOCUMENT
                            WHEN '' THEN '해당없음'
                            WHEN '0' THEN '수령'
                            WHEN '1' THEN '미수령'
                            ELSE ''
                          END AS BUY_DOCUMENT,
                          BUY_FILE_1,
                          BUY_FILE_2,
                          BUY_FILE_3,
                          BUY_FILE_4,
                          BUY_FILE_5,
                          BUY_DESC,
                          BUY_TOTAL_FEE,
                          BUY_REAL_FEE,
                          (BUY_TOTAL_FEE - BUY_REAL_FEE) AS BUY_MINAP_FEE,
                          CAR_GUBN,
                          CAR_YEAR,
                          BUY_EMAIL,
                          BUY_TAX_ONE,
                          CASE BUY_TAXGUBN
                            WHEN '0' THEN '전자(세금)계산서'
                            WHEN '1' THEN '종이계산서'
                            ELSE ''
                          END AS BUY_TAXGUBNNAME,
                          GOODS_FEE,
                          DBO.SMJ_FN_EMPNAME(CAR_EMPID)        AS EMPNAME,
                          EMPTAXGUBN,
                          CASE CAR_GUBN
                            WHEN '0' THEN '상사'
                            WHEN '1' THEN '고객'
                            ELSE ''
                          END AS CAR_GUBNNAME
                    FROM  SMJ_MAINLIST A,
                          SMJ_USER B
                    WHERE A.CAR_EMPID = B.EMPID
                          AND CAR_DELGUBN = '0'
                          AND CAR_REGID = @SELL_CAR_REGID ;`;
/*
car_regid = RsUtil.convts(rs.getString(1));
car_regdate = RsUtil.convts(rs.getString(2));
car_status = RsUtil.convts(rs.getString(3));
car_delgubn = RsUtil.convts(rs.getString(4));
car_agent = RsUtil.convts(rs.getString(5));
car_empid = RsUtil.convts(rs.getString(6));
car_kind = RsUtil.convts(rs.getString(7));
car_buydate = RsUtil.convts(rs.getString(8));
car_loancnt =  rs.getInt(9);
car_no = RsUtil.convts(rs.getString(10));
car_nonew = RsUtil.convts(rs.getString(11));
car_name = RsUtil.convts(rs.getString(12));
car_category = RsUtil.convts(rs.getString(13));
car_maker = RsUtil.convts(rs.getString(14));
car_birth = RsUtil.convts(rs.getString(15));
car_km = RsUtil.convts(rs.getString(16));
car_id = RsUtil.convts(rs.getString(17));
car_stdamt = RsUtil.convts(rs.getString(18));
buy_owner = RsUtil.convts(rs.getString(19));
buy_ownerkind = RsUtil.convts(rs.getString(20));
buy_ssno = RsUtil.convts(rs.getString(21));
buy_buzno = RsUtil.convts(rs.getString(22));
buy_telno = RsUtil.convts(rs.getString(23));
buy_zip = RsUtil.convts(rs.getString(24));
buy_addr1 = RsUtil.convts(rs.getString(25));
buy_addr2 = RsUtil.convts(rs.getString(26));
buy_notiamt = rs.getInt(27);
buy_supamt = RsUtil.convts(rs.getString(28));
buy_tax = RsUtil.convts(rs.getString(29));
buy_taxrsvcheck = RsUtil.convts(rs.getString(30));
buy_taxdate = RsUtil.convts(rs.getString(31));
buy_document = RsUtil.convts(rs.getString(32));
buy_file_1 = RsUtil.convts(rs.getString(33));
buy_file_2 = RsUtil.convts(rs.getString(34));
buy_file_3 = RsUtil.convts(rs.getString(35));
buy_file_4 = RsUtil.convts(rs.getString(36));
buy_file_5 = RsUtil.convts(rs.getString(37));
buy_desc = RsUtil.convts(rs.getString(38));


buy_total_fee = rs.getInt(39);
buy_real_fee = rs.getInt(40);
buy_minap_fee = rs.getInt(41);



car_gubn = RsUtil.convts(rs.getString(42));
car_year = RsUtil.convts(rs.getString(43));
buy_email = RsUtil.convts(rs.getString(44));
buy_tax_one = RsUtil.convts(rs.getString(45));
buy_taxgubn = RsUtil.convts(rs.getString(46));

buy_goods_fee = rs.getInt(47);
buyempname = RsUtil.convts(rs.getString(48));
emptaxgubn = RsUtil.convts(rs.getString(49));//판매시는 저장된 거 가져오니까 필요없음
car_gubnname = RsUtil.convts(rs.getString(50));
*/

    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching sell detail:", err);
    throw err;
  }
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 정산 처리
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// 정산 매입 정보
exports.getSettlementPurchaseInfo = async ({ carRegid }) => {
  try {
  const request = pool.request();
  request.input("CAR_REGID", sql.VarChar, carRegid);


  const query = `SELECT CAR_REGID,
                        DBO.SMJ_FN_DATEFMT('F', CAR_REGDATE) AS CAR_REGDATE,
                        CAR_STATUS,
                        CAR_DELGUBN,
                        CAR_AGENT,
                        CAR_EMPID,
                        DBO.SMJ_FN_GETCDNAME('02', CAR_KIND) AS CAR_KIND,
                        DBO.SMJ_FN_DATEFMT('D', CAR_BUYDATE)         AS CAR_BUYDATE,
                        CAR_LOANCNT,
                        CAR_NO,
                        CAR_NONEW,
                        CAR_NAME,
                        CAR_CATEGORY,
                        CAR_MAKER,
                        CAR_BIRTH,
                        DBO.SMJ_FN_COMMA(CAR_KM)                     AS CAR_KM,
                        CAR_ID,
                        DBO.SMJ_FN_COMMA(CAR_STDAMT)                 AS CAR_STDAMT,
                        BUY_OWNER,
                        DBO.SMJ_FN_GETCDNAME_04('04', BUY_OWNERKIND) AS BUY_OWNERKINDNAME,
                        BUY_SSNO,
                        BUY_BUZNO,
                        BUY_TELNO,
                        BUY_ZIP,
                        BUY_ADDR1,
                        BUY_ADDR2,
                        BUY_NOTIAMT,
                        BUY_SUPAMT,
                        BUY_TAX,
                        CASE BUY_TAXRSVCHECK
                          WHEN '' THEN '해당없음'
                          WHEN '0' THEN '수령'
                          WHEN '1' THEN '미수령'
                          ELSE ''
                        END AS BUY_TAXRSVCHECK,
                        DBO.SMJ_FN_DATEFMT('D', BUY_TAXDATE)         AS BUY_TAXDATE,
                        CASE BUY_DOCUMENT
                          WHEN '' THEN '해당없음'
                          WHEN '0' THEN '수령'
                          WHEN '1' THEN '미수령'
                          ELSE ''
                        END AS BUY_DOCUMENT,
                        BUY_FILE_1,
                        BUY_FILE_2,
                        BUY_FILE_3,
                        BUY_FILE_4,
                        BUY_FILE_5,
                        BUY_DESC,
                        BUY_TOTAL_FEE,  -- sum_buy_tot_fee
                        BUY_REAL_FEE,  -- sum_buy_real_fee
                        BUY_TOTAL_FEE - BUY_REAL_FEE AS BUY_MINAP_FEE,     -- sum_buy_minap_fee
                        CAR_GUBN,
                        CAR_YEAR,
                        BUY_EMAIL,
                        BUY_TAX_ONE,
                        CASE BUY_TAXGUBN
                          WHEN '0' THEN '전자(세금)계산서'
                          WHEN '1' THEN '종이계산서'
                          ELSE ''
                        END AS BUY_TAXGUBNNAME,
                        GOODS_FEE,
                        DBO.SMJ_FN_EMPNAME(CAR_EMPID)                AS EMPNAME,
                        EMPTAXGUBN,
                        CAR_LOANSUM,
                        BUY_TAX15,
                        Floor(Round(BUY_TAX15 * 0.033, 0)) AS BUY_TAX15_SUP,
                        BUY_OWNERKIND,
                        Floor(Round(BUY_NOTIAMT * 0.0083, 0)) AS BUY_NOTIAMT_SUP,
                        Floor(Round(BUY_NOTIAMT * 0.0017, 0)) AS BUY_NOTIAMT_VAT,
                        EMPTELNO1
                  FROM  SMJ_MAINLIST A,
                        SMJ_USER B
                  WHERE  A.CAR_EMPID = B.EMPID
                        AND CAR_DELGUBN = '0'
                        AND CAR_REGID = @CAR_REGID 
                        `;
/*

car_regid = RsUtil.convts(rs.getString(1));
car_regdate = RsUtil.convts(rs.getString(2));
car_status = RsUtil.convts(rs.getString(3));
car_delgubn = RsUtil.convts(rs.getString(4));
car_agent = RsUtil.convts(rs.getString(5));
car_empid = RsUtil.convts(rs.getString(6));
car_kind = RsUtil.convts(rs.getString(7));
car_buydate = RsUtil.convts(rs.getString(8));
car_loancnt =  rs.getInt(9);
car_no = RsUtil.convts(rs.getString(10));
car_nonew = RsUtil.convts(rs.getString(11));
car_name = RsUtil.convts(rs.getString(12));
car_category = RsUtil.convts(rs.getString(13));
car_maker = RsUtil.convts(rs.getString(14));
car_birth = RsUtil.convts(rs.getString(15));
car_km = RsUtil.convts(rs.getString(16));
car_id = RsUtil.convts(rs.getString(17));
car_stdamt = RsUtil.convts(rs.getString(18));
buy_owner = RsUtil.convts(rs.getString(19));
buy_ownerkindname = RsUtil.convts(rs.getString(20));
buy_ssno = RsUtil.convts(rs.getString(21));
buy_buzno = RsUtil.convts(rs.getString(22));
buy_telno = RsUtil.convts(rs.getString(23));
buy_zip = RsUtil.convts(rs.getString(24));
buy_addr1 = RsUtil.convts(rs.getString(25));
buy_addr2 = RsUtil.convts(rs.getString(26));
buy_notiamt = rs.getInt(27);
buyamt = RsUtil.convts(rs.getString(27));

buy_supamt = rs.getInt(28);
buy_tax =  rs.getInt(29);
buy_taxrsvcheck = RsUtil.convts(rs.getString(30));
buy_taxdate = RsUtil.convts(rs.getString(31));
buy_document = RsUtil.convts(rs.getString(32));
buy_file_1 = RsUtil.convts(rs.getString(33));
buy_file_2 = RsUtil.convts(rs.getString(34));
buy_file_3 = RsUtil.convts(rs.getString(35));
buy_file_4 = RsUtil.convts(rs.getString(36));
buy_file_5 = RsUtil.convts(rs.getString(37));
buy_desc = RsUtil.convts(rs.getString(38));


buy_total_fee = rs.getInt(39);
buy_real_fee = rs.getInt(40);
buy_minap_fee = rs.getInt(41);



car_gubn = RsUtil.convts(rs.getString(42));
car_year = RsUtil.convts(rs.getString(43));
buy_email = RsUtil.convts(rs.getString(44));
buy_tax_one = RsUtil.convts(rs.getString(45));
buy_taxgubn = RsUtil.convts(rs.getString(46));

buy_goods_fee = rs.getInt(47);
buyempname = RsUtil.convts(rs.getString(48));
emptaxgubn = RsUtil.convts(rs.getString(49));//판매시는 저장된 거 가져오니까 필요없음
car_gubnname = RsUtil.convts(rs.getString(50));
*/


  const result = await request.query(query);
  return result.recordset[0];
} catch (err) {
  console.error("Error fetching settlement purchase info:", err);
  throw err;
}
};



// 정산 매입매도비 합계 조회
exports.getSettlementPurchaseFee = async ({ carRegid }) => {
  try {
    const request = pool.request();
    request.input("CAR_REGID", sql.VarChar, carRegid);

    const query = `SELECT Sum(FEE_AMT) AS SUM_FEE_AMT    -- buy_fee1
                    FROM   SMJ_FEEAMT
                    WHERE  FEE_KIND = '0'
                          AND FEE_NO <> 2
                          AND FEE_CAR_REGID = @CAR_REGID ;`; 

    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching settlement purchase fee:", err);
    throw err;
  }
};


// 정산 매입매도비 차이 조회
exports.getSettlementPurchaseFeeDiff = async ({ carRegid }) => {
  try {
    const request = pool.request();
    request.input("CAR_REGID", sql.VarChar, carRegid);

    const query = `SELECT A-B AS FEE_DIFF    --  sunnapmaeip
                    FROM   (
                                  SELECT ISNULL(Sum(FEE_INAMT),0) AS A
                                  FROM   SMJ_FEEAMT
                                  WHERE  FEE_KIND = '0'
                                  AND    FEE_INDATE <> '1900-01-01 00:00:00'
                                  AND    FEE_CAR_REGID = @CAR_REGID ) ATBL,
                          (
                                  SELECT ISNULL(Sum(FEE_INAMT),0) AS B
                                  FROM   SMJ_FEEAMT
                                  WHERE  FEE_KIND = '0'
                                  AND    FEE_NO = 2
                                  AND    FEE_INDATE <> '1900-01-01 00:00:00'
                                  AND    FEE_CAR_REGID = @CAR_REGID ) BTBL 
                    ;`; 

    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching settlement purchase fee diff:", err);
    throw err;
  }
};


// 정산 상품화비(부가세 공제건만 가져옴)
// 부가세 공제건만 딜러 공제 인정해주는 상사
exports.getSettlementGoodsFee = async ({ carRegid,  goodsDealsang,  goodsTaxgubn }) => {
  try {
    const request = pool.request();
    request.input("CAR_REGID", sql.VarChar, carRegid);
    request.input("GOODS_DEALSANG", sql.VarChar, goodsDealsang);  
    request.input("GOODS_TAXGUBN", sql.VarChar, goodsTaxgubn);  

      const query = `SELECT SUM(GOODS_SENDAMT) AS GOODS_SENDAMT  -- buy_goods_fee
                      FROM   SMJ_GOODSFEE
                      WHERE  GOODS_REGID = @CAR_REGID
                            AND GOODS_DEALSANG = @GOODS_DEALSANG              -- 0:딜러 1:상사
                            AND GOODS_TAXGUBN = @GOODS_TAXGUBN ;`;             // 0:미공제 1:공제   (부가세 공제건만 딜러 공제 인정해주는 상사이면 : 1 조건 추가)
/*
 				buy_goods_fee_dl = rs.getInt(1);
				buyfee_sangpum_d = RsUtil.convts(rs.getString(1));
*/
    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching settlement product fee:", err);
    throw err;
  }
};

// 부가세 공제건만 딜러 공제 인정해주는 상사
exports.getSettlementGoodsDealFee = async ({ carRegid,  goodsDealsang }) => {
  try {
    const request = pool.request();
    request.input("CAR_REGID", sql.VarChar, carRegid);
    request.input("GOODS_DEALSANG", sql.VarChar, goodsDealsang);    

      const query = `SELECT SUM(GOODS_SENDAMT) AS GOODS_SENDAMT  -- buy_goods_fee
                      FROM   SMJ_GOODSFEE
                      WHERE  GOODS_REGID = @CAR_REGID
                            AND GOODS_DEALSANG = @GOODS_DEALSANG                -- 0:딜러 1:상사
                            AND GOODS_TAXGUBN = '1' ;`;             // 0:미공제 1:공제   (부가세 공제건만 딜러 공제 인정해주는 상사이면 : 1 조건 추가)
/*
 				buy_goods_fee_dl = rs.getInt(1);
				buyfee_sangpum_d = RsUtil.convts(rs.getString(1));
*/
    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching settlement product fee:", err);
    throw err;
  }
};


// 정산 상품화비 합계 조회
exports.getSettlementGoodsFeeSum = async ({ carRegid }) => {
  try {
    const request = pool.request();
    request.input("CAR_REGID", sql.VarChar, carRegid);

    const query = `SELECT Sum(GOODS_SENDAMT) AS GOODS_SENDAMT,                 --buy_goods_fee_tot
                          DBO.SMJ_FN_VAT_SUP(Sum(GOODS_SENDAMT)) AS VAT_SUP,   --buy_goods_fee_sup
                          DBO.SMJ_FN_VAT_AMT(Sum(GOODS_SENDAMT)) AS VAT_AMT    --buy_goods_fee_vat
                    FROM   SMJ_GOODSFEE
                    WHERE  GOODS_REGID = @CAR_REGID ;`;
/*
				buy_goods_fee_tot = rs.getInt(1);
				buy_goods_fee_sup = rs.getInt(2);
				buy_goods_fee_vat = rs.getInt(3);
*/
    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching settlement product fee sum:", err);
    throw err;
  }
};


// 정산 매도비 조회
exports.getSettlementSellFee = async ({ carRegid }) => {
  try {
    const request = pool.request();
    request.input("CAR_REGID", sql.VarChar, carRegid);    

    const query = `SELECT SELL_TOTAL_FEE,
                          SELL_REAL_FEE,
                          SELL_TOTAL_FEE - SELL_REAL_FEE AS SELL_MINAP_FEE,
                          DBO.SMJ_FN_VAT_SUP(SELL_TOTAL_FEE) AS SELL_TOTAL_FEE_SUP,
                          DBO.SMJ_FN_VAT_AMT(SELL_TOTAL_FEE) AS SELL_TOTAL_FEE_AMT,
                          SELL_SENGNUNGAMT_1 + SELL_SENGNUNGAMT_2 + SELL_SENGNUNGAMT_3 AS SELL_SENGNUNGAMT_SUM,
                          DBO.SMJ_FN_VAT_SUP(SELL_SENGNUNGAMT_1 + SELL_SENGNUNGAMT_2 + SELL_SENGNUNGAMT_3) AS SELL_SENGNUNGAMT_SUP,
                          DBO.SMJ_FN_VAT_AMT(SELL_SENGNUNGAMT_1 + SELL_SENGNUNGAMT_2 + SELL_SENGNUNGAMT_3) AS SELL_SENGNUNGAMT_AMT,
                          SELL_BOHEOMAMT_1 + SELL_BOHEOMAMT_2 + SELL_BOHEOMAMT_3 AS SELL_BOHEOMAMT_SUM,
                          DBO.SMJ_FN_VAT_SUP(SELL_BOHEOMAMT_1 + SELL_BOHEOMAMT_2 + SELL_BOHEOMAMT_3) AS SELL_BOHEOMAMT_SUP,
                          DBO.SMJ_FN_VAT_AMT(SELL_BOHEOMAMT_1 + SELL_BOHEOMAMT_2 + SELL_BOHEOMAMT_3) AS SELL_BOHEOMAMT_AMT,
                          SELL_NOTIAMT + SELL_TOTAL_FEE + SELL_COSIGNEMP_ALFEE + (SELL_SENGNUNGAMT_1 + SELL_SENGNUNGAMT_2 + SELL_SENGNUNGAMT_3) + (SELL_BOHEOMAMT_1 + SELL_BOHEOMAMT_2 + SELL_BOHEOMAMT_3) AS SELL_NOTIAMT_SUM,
                          DBO.SMJ_FN_VAT_SUP(SELL_NOTIAMT + SELL_TOTAL_FEE + SELL_COSIGNEMP_ALFEE + (SELL_SENGNUNGAMT_1 + SELL_SENGNUNGAMT_2 + SELL_SENGNUNGAMT_3) + (SELL_BOHEOMAMT_1 + SELL_BOHEOMAMT_2 + SELL_BOHEOMAMT_3)) AS SELL_NOTIAMT_SUP,
                          DBO.SMJ_FN_VAT_AMT(SELL_NOTIAMT + SELL_TOTAL_FEE + SELL_COSIGNEMP_ALFEE + (SELL_SENGNUNGAMT_1 + SELL_SENGNUNGAMT_2 + SELL_SENGNUNGAMT_3) + (SELL_BOHEOMAMT_1 + SELL_BOHEOMAMT_2 + SELL_BOHEOMAMT_3)) AS SELL_NOTIAMT_AMT
                    FROM   SMJ_SOLDLIST
                    WHERE  SELL_CAR_REGID = @CAR_REGID;`; 


        /*

        sum_sell_tot_fee = rs.getInt(1);
				sum_sell_real_fee = rs.getInt(2);
				sum_sell_minap_fee = rs.getInt(3);
				sum_sell_tot_fee_sup = rs.getInt(4);
				sum_sell_tot_fee_vat = rs.getInt(5);
				
				sum_sengnung = rs.getInt(6);
				sum_sengnung_sup = rs.getInt(7);
				sum_sengnung_vat = rs.getInt(8);
				
				sum_boheom = rs.getInt(9);
				sum_boheom_sup = rs.getInt(10);
				sum_boheom_vat = rs.getInt(11);
				
				
				machulamt = rs.getInt(12);
				machulamt_sup = rs.getInt(13);
				machulamt_vat = rs.getInt(14);

        */

    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching settlement sell fee:", err);
    throw err;  
  }
};


// 정산 수수료 표준 금액 조회
exports.getSettlementSellFeeStandard = async ({ carRegid }) => {
  try {
    const request = pool.request();
    request.input("CAR_REGID", sql.VarChar, carRegid);  

    const query = `SELECT Sum(FEE_STDAMT) AS SUM_SELL_FEE_STDAMT
                    FROM   SMJ_FEEAMT
                    WHERE  FEE_CAR_REGID = @CAR_REGID
                          AND FEE_KIND = '1' ;`;

/*
    sum_sell_tot_fee_std = rs.getInt(1);
*/
    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching settlement sell fee standard:", err);
    throw err;
  }
};


// 매도 상세 조회
exports.getSoldDetail = async ({ carRegid }) => {
  try {
    const request = pool.request();
    request.input("CAR_REGID", sql.VarChar, carRegid);  

    const query = `SELECT SELL_EMPID,
                          SELL_KIND,
                          DBO.SMJ_FN_DATEFMT('D', SELL_DATE) AS SELL_DATE,
                          SELL_OWNER,
                          SELL_OWNERKIND,
                          SELL_SSNO,
                          SELL_BUZNO,
                          SELL_TELNO,
                          SELL_ZIP,
                          SELL_ADDR1,
                          SELL_ADDR2,
                          SELL_NOTIAMT,
                          SELL_SUPAMT,
                          SELL_TAX,
                          SELL_TAXRECEIPT,
                          SELLFEEGUBN,
                          SELL_CASHKIND,
                          SELL_CASHDESC,
                          DBO.SMJ_FN_DATEFMT('D', SELL_CASHDATE) AS SELL_CASHDATE,
                          SELL_FILE_1,
                          SELL_FILE_2,
                          SELL_FILE_3,
                          SELL_FILE_4,
                          SELL_FILE_5,
                          SELL_DESC,
                          BUY_EMP_TAXGUBN,
                          SELL_EMP_TAXGUBN,
                          SELL_COSIGNSHOP,
                          SELL_COSIGNAGENT,
                          SELL_COSIGNEMPID,
                          SELL_COSIGNEMPNAME,
                          SELL_COSIGNTELNO,
                          SELL_COSIGNSNO,
                          SELL_COSIGNBIZNO,
                          SELL_COSIGNBANK,
                          SELL_COSIGNBANKNO,
                          SELL_COSIGNZIP,
                          SELL_COSIGNADDR1,
                          SELL_COSIGNADDR2,
                          SELL_COSIGNEMPAMT,
                          DBO.SMJ_FN_EMPNAME(SELL_EMPID)   AS SELLEMPNAME,
                          CASE BUY_EMP_TAXGUBN
                            WHEN '0' THEN '(원천징수대상자)'
                            WHEN '1' THEN '(사업자등록자)'
                            ELSE ''
                          END                              AS BUY_EMP_TAXNAME,
                          CASE SELL_EMP_TAXGUBN
                            WHEN '0' THEN '(원천징수대상자)'
                            WHEN '1' THEN '(사업자등록자)'
                            ELSE ''
                          END                              AS SELL_EMP_TAXNAME,
                          SELL_NOTIAMT - SELL_COSIGNEMPAMT AS ALSONTAXSTDAMT,
                          BUYFEEGUBN,
                          SELL_COSIGNEMP_ALFEE,
                          DBO.SMJ_FN_VAT_SUP(SELL_COSIGNEMP_ALFEE) AS SELL_COSIGNEMP_ALFEE_SUP,
                          DBO.SMJ_FN_VAT_AMT(SELL_COSIGNEMP_ALFEE) AS SELL_COSIGNEMP_ALFEE_VAT
                     FROM SMJ_MAINLIST A,
                          SMJ_SOLDLIST B
                    WHERE A.CAR_REGID = B.SELL_CAR_REGID
                      AND CAR_DELGUBN = '0'
                      AND CAR_REGID = @CAR_REGID ; `;



/*
		{

			sell_empid  =  RsUtil.convts(rs.getString(1));
			sell_kind =  RsUtil.convts(rs.getString(2));
			sell_date =  RsUtil.convts(rs.getString(3));
			sell_owner =  RsUtil.convts(rs.getString(4));
			sell_ownerkind =  RsUtil.convts(rs.getString(5));
			sell_ssno =  RsUtil.convts(rs.getString(6));
			sell_buzno =  RsUtil.convts(rs.getString(7));
			sell_telno =  RsUtil.convts(rs.getString(8));
			sell_zip =  RsUtil.convts(rs.getString(9));
			sell_addr1 =  RsUtil.convts(rs.getString(10));

			sell_addr2 =  RsUtil.convts(rs.getString(11));
			sell_notiamt =  RsUtil.convts(rs.getString(12));
			sellamt =  RsUtil.convts(rs.getString(12));
			sell_supamt =  RsUtil.convts(rs.getString(13));
			sell_tax =  RsUtil.convts(rs.getString(14));
			sell_taxreceipt =  RsUtil.convts(rs.getString(15));
			sellfeegubn =  RsUtil.convts(rs.getString(16));
//out.println("!!"+sellfeegubn);
			sell_cashkind =  RsUtil.convts(rs.getString(17));
			sell_cashdesc =  RsUtil.convts(rs.getString(18));
			sell_cashdate =  RsUtil.convts(rs.getString(19));

			sell_file_1 =  RsUtil.convts(rs.getString(20));
			sell_file_2 =  RsUtil.convts(rs.getString(21));
			sell_file_3 =  RsUtil.convts(rs.getString(22));
			sell_file_4 =  RsUtil.convts(rs.getString(23));
			sell_file_5 =  RsUtil.convts(rs.getString(24));
			sell_desc =  RsUtil.convts(rs.getString(25));
    		buy_emp_taxgubn  =  RsUtil.convts(rs.getString(26));
    		sell_emp_taxgubn  =  RsUtil.convts(rs.getString(27));    
    
   	sell_cosignshop  =  RsUtil.convts(rs.getString(28));
    sell_cosignagent  =  RsUtil.convts(rs.getString(29));
    sell_cosignempid  =  RsUtil.convts(rs.getString(30));
    sell_cosignempname  =  RsUtil.convts(rs.getString(31));
    sell_cosigntelno  =  RsUtil.convts(rs.getString(32));
    sell_cosignsno  =  RsUtil.convts(rs.getString(33));
    sell_cosignbizno  =  RsUtil.convts(rs.getString(34));
    sell_cosignbank  =  RsUtil.convts(rs.getString(35));
    sell_cosignbankno  =  RsUtil.convts(rs.getString(36));
    sell_cosignzip  =  RsUtil.convts(rs.getString(37));
    sell_cosignaddr1  =  RsUtil.convts(rs.getString(38));
    sell_cosignaddr2  =  RsUtil.convts(rs.getString(39));
    sell_cosignempamt  =  RsUtil.convts(rs.getString(40));
    sellempname  =  RsUtil.convts(rs.getString(41));
    
buyemp_taxname  =  RsUtil.convts(rs.getString(42));
sellemp_taxname  =  RsUtil.convts(rs.getString(43));

alsontaxstdamt  =  RsUtil.convts(rs.getString(44));




buyfeegubn  =  RsUtil.convts(rs.getString(45));

sell_cosignemp_alfee  =  RsUtil.convts(rs.getString(46));
sellfee_alseon =  RsUtil.convts(rs.getString(46));

sellfee_alseon_sup =  RsUtil.convts(rs.getString(47));
sellfee_alseon_vat =  RsUtil.convts(rs.getString(48));




*/
    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching sell detail:", err);
    throw err;
  }
};


// 정산 재고금융 존재 여부
exports.getSettlementStockFinanceExist = async ({ carRegid }) => {
  try {
    const request = pool.request();
    request.input("CAR_REGID", sql.VarChar, carRegid);

    const query = `SELECT Count(CPTSEQNO) AS SUM_STOCK_FINANCE_CNT
                    FROM   SMJ_CAPITAL_LIST
                    WHERE  CPT_END = '0'
                          AND REGID = @CAR_REGID ;`;

                          /*
                          loan_end_check = rs.getInt(1);
                          */
    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching settlement stock finance exist:", err);
    throw err;
  }
};


// 정산 이자 수익 계산
exports.getSettlementInterestRevenue = async ({ carRegid }) => {
  try {
    const request = pool.request();
    request.input("CAR_REGID", sql.VarChar, carRegid);

    const query = `SELECT Sum(CPTDTLMNYDEAL - CPTDTLMNY) AS SUM_INTEREST_REVENUE
                    FROM   SMJ_CAPITAL_LIST A,
                          SMJ_CAPITAL_DETAIL B
                    WHERE  A.CPTSEQNO = B.CPTSEQNO
                          AND A.REGID = @CAR_REGID ;`;
        /*
				loansuip = rs.getInt(1);
        */
    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching settlement interest revenue:", err);
    throw err;
  }
};


// 재고금융 합계 조회
exports.getSettlementInterestRevenueSum = async ({ carRegid, cptdttlDealdate }) => {
  try {
    const request = pool.request();
    request.input("CAR_REGID", sql.VarChar, carRegid);
    request.input("CPTDTLDEALDATE", sql.VarChar, cptdttlDealdate);

    const query = `SELECT Sum(CPTDTLREALMNYDEAL) AS SUM_INTEREST_REVENUE
                     FROM SMJ_CAPITAL_DETAIL
                    WHERE REGID = @CAR_REGID
                      AND CPTDTLDEALDATE = @CPTDTLDEALDATE ;`;   
/*
				oldloanminap = rs.getInt(1);
*/
    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching settlement stock finance sum:", err);
    throw err;
  }
};

// 매도 미납 총 합계
exports.getSettlementSellMinapSum = async ({ sell_car_regid }) => {
  try {
    const request = pool.request();
    request.input("SELL_CAR_REGID", sql.VarChar, sell_car_regid);  

    const query = `SELECT MINAP_MAEIP + MINAP_LOAN + MINAP_MAEDO
                    FROM   SMJ_SOLDLIST
                    WHERE  SELL_CAR_REGID = @SELL_CAR_REGID  ;`;
/*
				oldtotalminap = rs.getInt(1);
*/
    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching settlement sell minap sum:", err);    
    throw err;
  }
};


// 정산 매입,매도,재고금융 명칭 가져오기
exports.getSettlementStockFinanceName = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT BUYFEE_1_NAME,
                          BUYFEE_2_NAME,
                          BUYFEE_3_NAME,
                          SELLFEE_1_NAME,
                          SELLFEE_2_NAME,
                          SELLFEE_3_NAME,
                          SETTAMT_1_NAME,
                          SETTAMT_2_NAME,
                          SETTAMT_3_NAME,
                          SETTAMTETC_1_NAME,
                          SETTAMTETC_2_NAME
                    FROM  SMJ_ADJUSTMENT
                    WHERE ADJ_AGENT = @CAR_AGENT
                          AND ADJ_REGDATE = (SELECT Max(ADJ_REGDATE)
                                            FROM   SMJ_ADJUSTMENT
                                            WHERE  ADJ_AGENT = @CAR_AGENT ) ;`;
/*
			max_buyfee_1_name  =  RsUtil.convts(rs.getString(1));
			max_buyfee_2_name =  RsUtil.convts(rs.getString(2));
			max_buyfee_3_name =  RsUtil.convts(rs.getString(3));
			max_sellfee_1_name =  RsUtil.convts(rs.getString(4));
			max_sellfee_2_name =  RsUtil.convts(rs.getString(5));
			max_sellfee_3_name =  RsUtil.convts(rs.getString(6));
			max_settamt_1_name =  RsUtil.convts(rs.getString(7));
			max_settamt_2_name =  RsUtil.convts(rs.getString(8));
			max_settamt_3_name =  RsUtil.convts(rs.getString(9));
			max_settamtetc_1_name =  RsUtil.convts(rs.getString(10));
			max_settamtetc_2_name =  RsUtil.convts(rs.getString(11));
*/
    const result = await request.query(query);  
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching settlement stock finance name:", err);
    throw err;
  }
};

// 정산 재고금융 합계 조회
/*
exports.getSettlementStockFinance = async ({ carRegid }) => {
  try {
    const request = pool.request();
    request.input("CAR_REGID", sql.VarChar, carRegid);

    const query = `SELECT Count(CPTSEQNO) AS SUM_LOAN_TOT_CNT,
                          Sum(FEE_DEAL_TOT) AS SUM_LOAN_TOT_FEE,
                          Sum(FEE_DEAL_REAL) AS SUM_LOAN_REAL_FEE,
                          Sum(FEE_DEAL_TOT) - Sum(FEE_DEAL_REAL) AS SUM_LOAN_MINAP_FEE,
                          Sum(FEE_HAEJI_SUM) AS SUM_LOAN_HAEJI_FEE
                    FROM   SMJ_CAPITAL_LIST
                    WHERE  REGID = @CAR_REGID ;`;
				sum_loan_tot_cnt = rs.getInt(1);
				sum_loan_tot_fee = rs.getInt(2);
        buyfee_ija = RsUtil.convts(rs.getString(2));
				sum_loan_real_fee = rs.getInt(3);
				sum_loan_minap_fee = rs.getInt(4);
				sum_loan_haeji_fee = rs.getInt(5);


        sum_cost = sum_buy_real_fee + buy_goods_fee + buy_goods_fee_dl + sum_sell_real_fee + sum_loan_real_fee ;

        //딜러선납금액 = 매입비(1%제외) + 재고금융입금액 + 상품화비 딜러
        buybackfee =  sunnapmaeip + sum_loan_real_fee + buy_goods_fee_dl;

    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching settlement stock finance:", err);
    throw err;
  }
};

*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 알선
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.getAlsonList = async ({ carAgent, page = 1, pageSize = 10 }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);
    request.input("PAGE", sql.Int, page);
    request.input("PAGESIZE", sql.Int, pageSize);

    // 전체 카운트 조회
    const countQuery = `
        SELECT COUNT(*) as totalCount
        FROM SMJ_MAINLIST A
        LEFT OUTER JOIN SMJ_ADJUSTMENT ST ON A.CAR_REGID = ST.ADJ_CAR_REGID
        LEFT OUTER JOIN SMJ_SOLDLIST B ON A.CAR_REGID = B.SELL_CAR_REGID
        LEFT OUTER JOIN SMJ_USER C ON A.CAR_EMPID = C.EMPID
        LEFT OUTER JOIN SMJ_COST D ON A.CAR_REGID = D.COST_CARID AND COST_KIND = '1'
        WHERE CAR_AGENT = @CAR_AGENT
            AND A.CAR_DELGUBN = '0'
            AND CAR_STATUS = '004'
    `;

    const dataQuery = `
        SELECT 
            CAR_REGID,
            DBO.SMJ_FN_DATEFMT('H', SELL_DATE) AS SELL_DATE,
            EMPKNAME,
            SELL_OWNER,
            SELL_TELNO,
            CAR_NAME,
            CAR_NO,
            SELL_COSIGNEMP_ALFEE,
            CASE SELL_CASHKIND
                WHEN '0' THEN '현금영수증'
                WHEN '1' THEN '세금계산서'
                WHEN '2' THEN '신용카드'
                ELSE ''
            END AS SELL_CASHKINDNAME,
            COST_CODENAME,
            SETTAMT_SEND,
            COST_DESC,
            CASE CASHBILL_YN
                WHEN 'Y' THEN '발행'
                WHEN 'N' THEN '미발행'
                ELSE ''
            END CASHBILL_YNNAME,
            COST_SEQ,
            BUYFEE_SUM
        FROM SMJ_MAINLIST A
        LEFT OUTER JOIN SMJ_ADJUSTMENT ST ON A.CAR_REGID = ST.ADJ_CAR_REGID
        LEFT OUTER JOIN SMJ_SOLDLIST B ON A.CAR_REGID = B.SELL_CAR_REGID
        LEFT OUTER JOIN SMJ_USER C ON A.CAR_EMPID = C.EMPID
        LEFT OUTER JOIN SMJ_COST D ON A.CAR_REGID = D.COST_CARID AND COST_KIND = '1'
        WHERE CAR_AGENT = @CAR_AGENT
            AND A.CAR_DELGUBN = '0'
            AND CAR_STATUS = '004'
        ORDER BY SELL_DATE DESC, SELL_REGDATE DESC
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
    console.error("Error fetching alson list:", err);
    throw err;
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 운영현황 - 매출관리 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 매출관리 목록 조회
exports.getSystemSalesList = async ({ carAgent, page = 1, pageSize = 10 }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);
    request.input("PAGE", sql.Int, page);
    request.input("PAGESIZE", sql.Int, pageSize);

    // 전체 카운트 조회
    const countQuery = `
        SELECT COUNT(*) as totalCount
        FROM SMJ_COST A
        LEFT OUTER JOIN SMJ_MAINLIST B ON CAR_REGID = COST_CARID
        LEFT OUTER JOIN SMJ_USER C ON A.COST_EMPID = C.EMPID
        WHERE COST_KIND = '1'
            AND COST_DELGUBN = '0'
            AND COST_AGENT = @CAR_AGENT
    `;

    const dataQuery = `
        SELECT 
            COST_SEQ,
            COST_YEARMONTH,
            DBO.SMJ_FN_DATEFMT('D', COST_DATE) COST_DATE,
            COST_CODENAME,
            COST_REALAMT,
            DBO.SMJ_FN_GETCDNAME('06', COST_WAY) COST_WAY,
            DBO.SMJ_FN_GETCDNAME('07', COST_RECEIPT) COST_RECEIPTNAME,
            CASE COST_TAXGUBN
                WHEN '0' THEN '미공제'
                WHEN '1' THEN '공제'
                ELSE ''
            END COST_TAXGUBN,
            DBO.SMJ_FN_DATEFMT('D', COST_TAXDATE) COST_TAXDATE,
            COST_DESC,
            DBO.SMJ_FN_DATEFMT('D', COST_REGDATE) COST_REGDATE,
            COST_CAR_NO,
            CASE COST_EMPID
                WHEN '000000000' THEN '타딜러'
                WHEN '999999999' THEN '타딜러'
                ELSE EMPKNAME
            END EMPNAME,
            CASE CASHBILL_YN
                WHEN 'Y' THEN '발행'
                WHEN 'N' THEN '미발행'
                ELSE ''
            END CASHBILL_YNNAME,
            COST_CODE,
            COST_CARID,
            COST_RECEIPT,
            CAR_NAME,
            REPLACE(DBO.SMJ_FN_DATEFMT('D', COST_REGDATE), '-', '') AS COST_REGDATE2,
            CASE CONVERT(CHAR(10), COST_TAXDATE, 23)
                WHEN '1900-01-01' THEN '미발행'
                ELSE '발행'
            END TAX_YNNAME
        FROM SMJ_COST A
        LEFT OUTER JOIN SMJ_MAINLIST B ON CAR_REGID = COST_CARID
        LEFT OUTER JOIN SMJ_USER C ON A.COST_EMPID = C.EMPID
        WHERE COST_KIND = '1'
            AND COST_DELGUBN = '0'
            AND COST_AGENT = @CAR_AGENT
        ORDER BY COST_REGDATE DESC, COST_YEARMONTH DESC, COST_DATE DESC
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
    console.error("Error fetching system sales list:", err);
    throw err;
  }
};  

// 매출관리 합계 조회
exports.getSystemSalesSum = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);  

    const query = `SELECT COST_CNT0
                        , COST_SUM0
                        , COST_CNT1
                        , COST_SUM1
                        , ROUND((COST_SUM1 - (COST_SUM1/1.1)*0.1), 0) AS SUM1_SUP
                        , ROUND((COST_SUM1/1.1)*0.1, 0) AS SUM1_VAT
                        , COST_CNT0 + COST_CNT1 AS COST_CNT
                        , COST_SUM0 + COST_SUM1 AS CNT_SUM
                    FROM (SELECT COUNT(COST_SEQ) AS COST_CNT0,
                              ISNULL(SUM(COST_REALAMT / 10000), 0) AS COST_SUM0
                              , 0 COST_CNT1
                              , 0 COST_SUM1
                        FROM   SMJ_COST
                        WHERE  COST_KIND = '1'
                              AND COST_DELGUBN = '0'
                              AND COST_TAXGUBN = '0'
                              --AND COST_AGENT = '00511' 
                        UNION ALL
                        -- 합계
                        SELECT 0, 
                              0, 
                              COUNT(COST_SEQ) AS COST_CNT,
                              ISNULL(SUM(COST_REALAMT / 10000), 0) AS COST_SUM
                        FROM   SMJ_COST
                        WHERE  COST_KIND = '1'
                              AND COST_DELGUBN = '0'
                              AND COST_TAXGUBN = '1'
                              --AND COST_AGENT = '00511'
                               ) A
    `;
    const result = await request.query(query);    
    return result.recordset;
  } catch (err) {
    console.error("Error fetching system sales sum:", err);
    throw err;
  }
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 운영현황 - 매입관리 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 매입관리 목록 조회
exports.getSystemPurchaseList = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT *
                    FROM   (SELECT ROW_NUMBER()
                                    OVER(
                                      ORDER BY COST_REGDATE DESC, COST_YEARMONTH DESC, COST_DATE
                                      DESC ) AS
                                            RNUM,
                                    COST_SEQ,
                                    COST_YEARMONTH,
                                    DBO.SMJ_FN_DATEFMT('D', COST_DATE)
                                            COST_DATE,
                                    COST_CODENAME,
                                    COST_REALAMT,
                                    DBO.SMJ_FN_GETCDNAME('06', COST_WAY)
                                            COST_WAY,
                                    DBO.SMJ_FN_GETCDNAME('07', COST_RECEIPT)
                                            COST_RECEIPTNAME,
                                    CASE COST_TAXGUBN
                                      WHEN '0' THEN '미공제'
                                      WHEN '1' THEN '공제'
                                      ELSE ''
                                    END
                                            COST_TAXGUBN,
                                    DBO.SMJ_FN_DATEFMT('D', COST_TAXDATE)
                                            COST_TAXDATE,
                                    COST_DESC,
                                    DBO.SMJ_FN_DATEFMT('D', COST_REGDATE)
                                            COST_REGDATE,
                                    COST_CAR_NO,  
                                    CASE COST_EMPID
                                      WHEN '000000000' THEN '타딜러'
                                      WHEN '999999999' THEN '타딜러'
                                      ELSE EMPKNAME
                                    END
                                            EMPNAME,  
                                    CASE CASHBILL_YN
                                      WHEN 'Y' THEN '발행'
                                      WHEN 'N' THEN '미발행'
                                      ELSE ''
                                    END
                                            CASHBILL_YNNAME,      
                                    COST_CODE,
                                    COST_CARID,
                                    COST_RECEIPT,
                                    CAR_NAME,
                                    REPLACE(DBO.SMJ_FN_DATEFMT('D', COST_REGDATE), '-', '')
                                    AS
                                            COST_REGDATE2,
                                    CASE CONVERT(CHAR(10), COST_TAXDATE, 23)
                                      WHEN '1900-01-01' THEN '미발행'
                                      ELSE '발행'
                                    END
                                            TAX_YNNAME
                              FROM   SMJ_COST A
                                    LEFT OUTER JOIN SMJ_MAINLIST B
                                                          ON CAR_REGID = COST_CARID
                                    LEFT OUTER JOIN SMJ_USER C
                                                  ON A.COST_EMPID = C.EMPID
                              WHERE  1 = 1 -- COST_KIND = '2' 나중에 확인 
                                    AND COST_DELGUBN = '0'
                                    --AND COST_AGENT = '00511'
                                    ) AS V
                      WHERE  RNUM BETWEEN 1 AND 10 ;
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching system purchase list:", err);
    throw err;
  }
};

// 매입관리 합계 조회 
exports.getSystemPurchaseSum = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT SUM ( CNT1 ) AS SUM_CNT1
                        , SUM ( SUM1 ) AS SUM_SUM1
                        , SUM ( CNT2 ) AS SUM_CNT2
                        , SUM ( REALAMT1 ) AS SUM_REALAMT1
                        , SUM ( SUP1 ) AS SUM_SUP1
                        , SUM ( VAT1 ) AS SUM_VAT1
                        , SUM ( CNT3 ) AS SUM_CNT3
                        , SUM ( REALAMT2 ) AS SUM_REALAMT2
                        , SUM ( SUP2 ) AS SUM_SUP2
                        , SUM ( VAT2 ) AS SUM_VAT2
                        , SUM ( CNT1 ) + SUM ( CNT2 ) + SUM ( CNT3 ) AS CNT_T
                        , ISNULL(SUM ( SUM1 ), 0) + ISNULL(SUM ( REALAMT1 ), 0) + ISNULL(SUM ( REALAMT2 ), 0) AS SUM_T
                    FROM (
                    SELECT COUNT(COST_SEQ) AS CNT1,
                          SUM(COST_REALAMT) / 10000 AS SUM1,
                          NULL CNT2,
                          NULL REALAMT1,
                          NULL SUP1,
                          NULL VAT1,
                          NULL CNT3,
                          NULL REALAMT2,
                          NULL SUP2,
                          NULL VAT2
                    FROM   SMJ_COST
                    WHERE  COST_KIND = '0'
                          AND COST_DELGUBN = '0'
                          AND COST_TAXGUBN = '0'
                          AND COST_AGENT = '00002'
                    UNION ALL
                    SELECT NULL, 
                          NULL, 
                          COUNT(COST_SEQ) AS CNT2,
                          SUM(CONVERT(BIGINT, COST_REALAMT)) / 10000 AS REALAMT1,
                          SUM(FLOOR(ROUND(CONVERT(BIGINT, COST_REALAMT) / 1.09, 0))) / 10000 AS SUP1,
                          SUM(CONVERT(BIGINT, COST_REALAMT) - ( FLOOR(ROUND(CONVERT(BIGINT, COST_REALAMT) / 1.09, 0)) )) / 10000 AS VAT1,
                          NULL ,
                          NULL ,
                          NULL ,
                          NULL 
                    FROM   SMJ_COST
                    WHERE  COST_KIND = '0'
                          AND COST_DELGUBN = '0'
                          AND COST_TAXGUBN = '1'
                          AND COST_RECEIPT = '010'
                          AND COST_AGENT = '00002' 
                    UNION ALL
                    SELECT NULL, 
                          NULL, 
                          NULL, 
                          NULL, 
                          NULL, 
                          NULL, 
                          COUNT(COST_SEQ) CNT3,
                          SUM(CONVERT(BIGINT, COST_REALAMT)) / 10000 AS REALAMT2,
                          SUM(FLOOR(ROUND(CONVERT(BIGINT, COST_REALAMT) / 1.09, 0))) / 10000 AS SUP2,
                          SUM(CONVERT(BIGINT, COST_REALAMT) - ( FLOOR(ROUND(CONVERT(BIGINT,
                                                                            COST_REALAMT)
                                                                            /
                                                                            1.09, 0)) )) / 10000
                          VAT2
                    FROM   SMJ_COST
                    WHERE  COST_KIND = '0'
                          AND COST_DELGUBN = '0'
                          AND COST_TAXGUBN = '1'
                          AND COST_RECEIPT <> '010'
                          AND COST_AGENT = '00002' 
                    ) A;
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching system purchase sum:", err);
    throw err;
  }
};



////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 운영현황 - 원천징수 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 원천징수 목록 조회
exports.getSystemWithholdingList = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT *
                    FROM   (SELECT ROW_NUMBER()
                                    OVER(
                                      ORDER BY ADJ_REGDATE DESC, SELL_DATE DESC) AS RNUM,
                                  ADJ_CAR_NO,
                                  CAR_NAME,
                                  CAR_EMPID,
                                  ADJ_DATE,
                                  EMPKNAME,
                                  SETTAMTBASIC - SETTAMTVAT - SETTAMTCHWIDEUK - SETTAMT_1_VAL
                                  - SETTAMT_2_VAL
                                  - SETTAMT_3_VAL                                AS A,
                                  SETTAMT,
                                  DBO.SMJ_FN_VAT_SUP(SETTAMT33)                  AS TAX1,
                                  DBO.SMJ_FN_VAT_AMT(SETTAMT33)                  AS TAX2,
                                  EMPBANK,
                                  EMPBANKNO,
                                  EMPSNO,
                                  EMPZIP,
                                  EMPADDR1,
                                  EMPADDR2,
                                  SELL_COSIGNEMPNAME,
                                  ALSAMTBASIC - ALSAMTVAT                        AS AA,
                                  ALSAMT,
                                  CASE
                                    WHEN ( ALSONNOT33 = '1' ) THEN 0
                                    ELSE FLOOR(ROUND(( ALSAMTBASIC - ALSAMTVAT ) * 0.03, 0))
                                  END                                            AS AC,
                                  CASE
                                    WHEN ( ALSONNOT33 = '1' ) THEN 0
                                    ELSE FLOOR(ROUND(( ALSAMTBASIC - ALSAMTVAT ) * 0.03 * 0.1, 0))
                                  END                                            AS AD,
                                  SELL_COSIGNBANK,
                                  SELL_COSIGNBANKNO,
                                  SELL_COSIGNSNO,
                                  SELL_COSIGNZIP,
                                  SELL_COSIGNADDR1,
                                  SELL_COSIGNADDR2,
                                  DBO.SMJ_FN_DATEFMT('D', SELL_DATE)             SELL_DATE,
                                  SETTAMTCHWIDEUK
                            FROM   SMJ_MAINLIST A,
                                  SMJ_SOLDLIST B,
                                  SMJ_ADJUSTMENT C,
                                  SMJ_USER D
                            WHERE  A.CAR_REGID = B.SELL_CAR_REGID
                                  AND A.CAR_REGID = C.ADJ_CAR_REGID
                                  AND A.CAR_EMPID = D.EMPID
                                  AND CAR_AGENT = '00002'
                                  AND SELL_TAXENDCHECK = 'Y'
                                  AND CAR_DELGUBN = '0') AS V
                    WHERE  RNUM BETWEEN 1 AND 10
                    ;
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching system withholding list:", err);
    throw err;
  }
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 운영현황 - 정산내역 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 정산내역 목록 조회
exports.getSystemSettleList = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT *
                    FROM   (SELECT ROW_NUMBER()
                                    OVER(
                                      ORDER BY SELL_DATE DESC, SELL_REGDATE DESC) AS RNUM,
                                  SELL_CAR_REGID,
                                  DBO.SMJ_FN_DATEFMT('H', CAR_BUYDATE)            AS CAR_BUYDATE,
                                  DBO.SMJ_FN_DATEFMT('H', SELL_DATE)              AS SELL_DATE,
                                  DBO.SMJ_FN_DATEFMT('H', SELL_ADJ_DATE)          AS SELL_ADJ_DATE,
                                  CASE CAR_GUBN
                                    WHEN '0' THEN '상사'
                                    WHEN '1' THEN '고객'
                                    ELSE ''
                                  END                                             AS CAR_GUBNNAME,
                                  CASE
                                    WHEN CAR_EMPID <> SELL_EMPID THEN ' (알선)'
                                    ELSE ''
                                  END                                             ALSON,
                                  CAR_NO,
                                  CAR_NAME,
                                  BUY_NOTIAMT,
                                  SELL_NOTIAMT,
                                  SETTAMTBASIC,
                                  SETTAMTSODEUK,
                                  SETTAMT,
                                  SETTAMT_SEND,
                                  SETTAMT_DEPOSIT,
                                  EMPKNAME,
                                  CASE
                                    WHEN CONVERT(DATE, SELL_ADJ_DATE) >=
                                          CONVERT(DATE, '2019-06-23') THEN
                                    'NEW'
                                    ELSE 'OLD'
                                  END                                             NEWOLD
                            FROM   SMJ_MAINLIST A
                                  LEFT OUTER JOIN SMJ_SOLDLIST B
                                                ON A.CAR_REGID = B.SELL_CAR_REGID
                                  LEFT OUTER JOIN SMJ_USER C
                                                ON A.CAR_EMPID = C.EMPID
                                  LEFT OUTER JOIN SMJ_ADJUSTMENT D
                                                ON B.SELL_CAR_REGID = D.ADJ_CAR_REGID
                            WHERE  CAR_AGENT = '00002'
                                  AND A.CAR_DELGUBN = '0'
                                  AND CAR_STATUS IN ( '002', '003' )
                                  AND SELL_ADJ_DATE >= '2020-01-01'
                                  AND SELL_ADJ_DATE <= '2025-01-26'
                                  AND SELL_TAXENDCHECK = 'Y') AS V
                    WHERE  RNUM BETWEEN 1 AND 10 
                    ;
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching system settle list:", err);
    throw err;
  }
};


// 정산내역 합계 조회
exports.getSystemSettleSum = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT SUM(BUY_NOTIAMT) / 10000 BUY_NOTIAMT,
                          SUM(SELL_NOTIAMT) / 10000 SELL_NOTIAMT,
                          SUM(SETTAMTBASIC) / 10000 SETTAMTBASIC,
                          SUM(SETTAMTSODEUK) / 10000 SETTAMTSODEUK,
                          SUM(SETTAMT) / 10000 SETTAMT,
                          SUM(SETTAMT_SEND) / 10000 SETTAMT_SEND,
                          SUM(SETTAMT_DEPOSIT) / 10000 SETTAMT_DEPOSIT,
                          COUNT(CAR_REGID) CAR_CNT
                    FROM   SMJ_MAINLIST A
                          LEFT OUTER JOIN SMJ_SOLDLIST B
                                        ON A.CAR_REGID = B.SELL_CAR_REGID
                          LEFT OUTER JOIN SMJ_ADJUSTMENT C
                                        ON B.SELL_CAR_REGID = C.ADJ_CAR_REGID
                    WHERE  CAR_AGENT = '00002'
                          AND A.CAR_DELGUBN = '0'
                          AND CAR_STATUS IN ( '002', '003' )
                          AND CAR_GUBN = '0'
                          AND SELL_ADJ_DATE >= '2020-01-01'
                          AND SELL_ADJ_DATE <= '2025-01-26'
                          AND SELL_TAXENDCHECK = 'Y'
                    ;
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching system settle sum:", err);
    throw err;
  }
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 운영현황 - 종합내역 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 종합내역 - 딜러 목록 조회
exports.getSystemOverallDealerList = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT EMPID,
                          AGENT, EMPKNAME, EMPGRADE, 
                          EMPTELNO1,
                          CASE
                            WHEN EMPEDATE IS NULL THEN ''
                            ELSE '[퇴사]'
                          END AS EMPEDATE1
                    FROM   SMJ_USER
                    WHERE  AGENT = '00511'
                          AND SANGSA_CODE > 0
                          AND EMPGRADE <> '4'
                          AND EMPEDATE IS NULL
                    ORDER  BY EMPEDATE,
                              EMPKNAME  ;
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching system overall dealer list:", err);
    throw err;
  }
};


// 종합내역 - 딜러 실적 목록 조회
exports.getSystemOverallDealerSumList = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT *
                      FROM   (SELECT EMPID,
                                    EMPKNAME,
                                    COUNT(CAR_REGID)
                                            AS BUYCNT,
                                    SUM(CONVERT(INT, DATEDIFF(DAY, CAR_BUYDATE,
                                                      DATEADD(DAY, 1, GETDATE())))
                                            ) AS
                                    HADAY,
                                    SUM(BUY_NOTIAMT)
                                            AS BUYAMT,
                                    SUM(BUY_TOTAL_FEE) - SUM(BUY_REAL_FEE)
                                            AS BUYMINAP
                              FROM   SMJ_USER A
                                    LEFT OUTER JOIN SMJ_MAINLIST B
                                                  ON A.EMPID = B.CAR_EMPID
                                                    AND CAR_BUYDATE >= '2020-01-01 00:00:00'
                                                    AND CAR_BUYDATE <= '2025-01-26 23:59:59'
                                                    AND CAR_DELGUBN = '0'
                                                    AND CAR_STATUS = '001'
                              WHERE  AGENT = '00511'
                                    AND SANGSA_CODE > 0
                                    AND EMPGRADE <> '4'
                                    AND EMPEDATE IS NULL
                              GROUP  BY EMPID,
                                        EMPKNAME) AS BUY
                            LEFT OUTER JOIN (SELECT CAR_EMPID,
                                                    COUNT(CAR_REGID)
                                                                                                AS
                                                    SELLCNT,
                                                    SUM(CONVERT(INT, DATEDIFF(DAY, CAR_BUYDATE,
                                                                      DATEADD(DAY, 1, SELL_DATE)))
                                                                      ) AS
                                                    SHADAY,
                                                    SUM(BUY_NOTIAMT)
                                                                                                AS
                                                    SBUYAMT,
                                                    SUM(SELL_NOTIAMT)
                                                                                                AS
                                                    SELLAMT,
                                                    SUM(SELL_NOTIAMT - BUY_NOTIAMT)
                                                                                                AS
                                                    SBENIAMT,
                                                    SUM(SELL_TOTAL_FEE) - SUM(SELL_REAL_FEE)
                                                                                                AS
                                                    SELLMINAP
                                              FROM   SMJ_MAINLIST A,
                                                    SMJ_SOLDLIST B
                                              WHERE  A.CAR_REGID = B.SELL_CAR_REGID
                                                    AND CAR_DELGUBN = '0'
                                                    AND CAR_STATUS IN ( '002', '003' )
                                                    AND CAR_AGENT = '00511'
                                                    AND CAR_BUYDATE >= '2020-01-01 00:00:00'
                                                    AND CAR_BUYDATE <= '2025-01-26 23:59:59'
                                              GROUP  BY CAR_EMPID) AS SELL
                                          ON BUY.EMPID = SELL.CAR_EMPID
                      ORDER  BY EMPKNAME ;
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching system overall dealer sum list:", err);
    throw err;
  }
};



// 종합내역 - 현 제시 목록 조회
exports.getSystemOverallSuggestionList = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT EMPID, 
                          EMPKNAME,
                          COUNT(CAR_REGID) CAR_CNT,
                          SUM(CONVERT(INT, DATEDIFF(DAY, CAR_BUYDATE, DATEADD(DAY, 1, GETDATE()))))
                          AS
                          HADAY,
                          SUM(BUY_NOTIAMT) BUY_NOTIAMT,
                          SUM(CAR_STDAMT) CAR_STDAMT,
                          SUM(BUY_NOTIAMT) - SUM(CAR_STDAMT) CAR_AMT_DIFF,
                          SUM(BUY_SUPAMT) BUY_SUPAMT,
                          SUM(BUY_TAX) BUY_TAX,
                          SUM(BUY_TAX_ONE) BUY_TAX_ONE
                    FROM   SMJ_USER A
                          LEFT OUTER JOIN SMJ_MAINLIST B
                                        ON A.EMPID = B.CAR_EMPID
                                          AND CAR_STATUS = '001'
                                          AND CAR_BUYDATE >= '2020-04-01 00:00:00'
                                          AND CAR_BUYDATE <= '2025-04-12 23:59:59'
                                          AND CAR_DELGUBN = '0'
                    WHERE  AGENT = '00511'
                          AND SANGSA_CODE > 0
                          AND EMPGRADE <> '4'
                          AND EMPEDATE IS NULL
                    GROUP  BY EMPID,
                              EMPKNAME
                    ORDER  BY EMPKNAME ;
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching system overall suggestion list:", err);
    throw err;
  }
};





// 종합내역 - 매입매도비 목록 조회
exports.getSystemOverallBuySellList = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT EMPID,
                          EMPKNAME,
                          COUNT(CAR_REGID) CAR_CNT,
                          SUM(CONVERT(INT, DATEDIFF(DAY, CAR_BUYDATE, DATEADD(DAY, 1, GETDATE()))))
                          /
                          COUNT(CAR_REGID) AS HADAY,
                          SUM(BUY_TOTAL_FEE) BUY_TOTAL_FEE,
                          SUM(BUY_REAL_FEE) BUY_REAL_FEE,
                          SUM(BUY_TOTAL_FEE) - SUM(BUY_REAL_FEE) BUY_REAL_FEE_DIFF,
                          SUM(SELL_TOTAL_FEE) SELL_TOTAL_FEE,
                          SUM(SELL_REAL_FEE) SELL_REAL_FEE,
                          SUM(SELL_TOTAL_FEE) - SUM(SELL_REAL_FEE) SELL_REAL_FEE_DIFF,
                          SUM(BUY_TOTAL_FEE + SELL_TOTAL_FEE) TOTAL_FEE,
                          SUM(BUY_REAL_FEE + SELL_REAL_FEE) REAL_FEE,
                          SUM(BUY_TOTAL_FEE + SELL_TOTAL_FEE) - SUM(BUY_REAL_FEE + SELL_REAL_FEE) FEE,
                          SUM(GOODS_FEE) GOODS_FEE
                    FROM   SMJ_USER A
                          LEFT OUTER JOIN SMJ_MAINLIST B
                                        ON A.EMPID = B.CAR_EMPID
                                          AND CAR_DELGUBN = '0'
                          LEFT OUTER JOIN SMJ_SOLDLIST C
                                        ON B.CAR_REGID = C.SELL_CAR_REGID
                    WHERE  AGENT = '00511'
                          AND SANGSA_CODE > 0
                          AND EMPGRADE <> '4'
                          AND EMPEDATE IS NULL
                          AND CAR_BUYDATE >= '2020-04-01 00:00:00'
                          AND CAR_BUYDATE <= '2025-04-12 23:59:59'
                    GROUP  BY EMPID,
                              EMPKNAME
                    ORDER  BY EMPKNAME  ;
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching system overall buy sell list:", err);
    throw err;
  }
};



// 종합내역 - 상품화비 목록 조회
exports.getSystemOverallGoodsFeeList = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT GOODS_EMPID,
                          EMPKNAME,
                          SUM(CNT_0) CNT_0,
                          SUM(SUM_0) SUM_0,
                          SUM(CNT_1) CNT_1,
                          SUM(SUM_1) SUM_1,
                          SUM(CNT_0 + CNT_1) CNT_01,
                          SUM(SUM_0 + SUM_1) SUM_01
                    FROM   SMJ_USER A
                          INNER JOIN (SELECT GOODS_EMPID,
                                              ( CASE
                                                  WHEN GOODS_TAXGUBN = '0' THEN 1
                                                  ELSE 0
                                                END ) AS CNT_0,
                                              ( CASE
                                                  WHEN GOODS_TAXGUBN = '1' THEN 1
                                                  ELSE 0
                                                END ) AS CNT_1,
                                              ( CASE
                                                  WHEN GOODS_TAXGUBN = '0' THEN GOODS_SENDAMT
                                                  ELSE 0
                                                END ) AS SUM_0,
                                              ( CASE
                                                  WHEN GOODS_TAXGUBN = '1' THEN GOODS_SENDAMT
                                                  ELSE 0
                                                END ) AS SUM_1
                                      FROM   SMJ_GOODSFEE
                                      WHERE  1 = 1
                                              AND GOODS_SENDDATE >= '2020-04-01 00:00:00'
                                              AND GOODS_SENDDATE <= '2025-04-12 23:59:59')B
                                  ON GOODS_EMPID = EMPID
                    WHERE  AGENT = '00511'
                          AND SANGSA_CODE > 0
                          AND EMPGRADE <> '4'
                    GROUP  BY GOODS_EMPID,
                              EMPKNAME
                    ORDER  BY EMPKNAME   ;
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching system overall goods fee list:", err);
    throw err;
  }
};



// 종합내역 - 재고금융 목록 조회
exports.getSystemOverallFinanceList = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT A.EMPID,
                          EMPKNAME,
                          COUNT(CPTSEQNO) CPT_CNT,
                          SUM(CPTAMT) CPT_AMT,
                          SUM(FEE_COMP_SUM) FEE_COMP_SUM,
                          SUM(FEE_DEAL_TOT) FEE_DEAL_TOT,
                          SUM(FEE_DEAL_REAL) FEE_DEAL_REAL,
                          SUM(FEE_DEAL_TOT) - SUM(FEE_DEAL_REAL) FEE_DEAL_DIFF,
                          SUM(BUY_NOTIAMT) BUY_NOTIAMT
                    FROM   SMJ_USER A
                          INNER JOIN SMJ_MAINLIST B
                                  ON A.EMPID = B.CAR_EMPID
                                      AND CAR_DELGUBN = '0'
                          INNER JOIN SMJ_CAPITAL_LIST C
                                  ON B.CAR_REGID = C.REGID
                    WHERE  A.AGENT = '00511'
                          AND SANGSA_CODE > 0
                          AND EMPGRADE <> '4'
                          AND CAR_EMPID = '000020004'
                          AND CAR_BUYDATE >= '2020-04-01 00:00:00'
                          AND CAR_BUYDATE <= '2025-04-12 23:59:59'
                    GROUP  BY A.EMPID,
                              EMPKNAME
                    ORDER  BY EMPKNAME ;
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching system overall finance list:", err);
    throw err;
  }
};


// 종합내역 - 매도현황 목록 조회
exports.getSystemOverallSellList = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT EMPID,
                          EMPKNAME,
                          COUNT(CAR_REGID) CAR_CNT,
                          SUM(BUY_NOTIAMT) BUY_NOTIAMT,
                          SUM(CAR_STDAMT) CAR_STDAMT, 
                          SUM(BUY_NOTIAMT) - SUM(CAR_STDAMT) CAR_STDAMT_DIFF,
                          SUM(SELL_NOTIAMT) SELL_NOTIAMT,
                          SUM(SELL_NOTIAMT) - SUM(BUY_NOTIAMT) BUY_NOTIAMT_DIFF,
                          SUM(SELL_TOTAL_FEE) SELL_TOTAL_FEE,
                          SUM(SELL_REAL_FEE) SELL_REAL_FEE,
                          SUM(SELL_TOTAL_FEE) - SUM(SELL_REAL_FEE) SELL_REAL_FEE_DIFF,
                          SUM(CONVERT(INT, DATEDIFF(DAY, CAR_BUYDATE, DATEADD(DAY, 1, SELL_DATE))))
                          AS
                          HADAY
                    FROM   SMJ_USER A
                          INNER JOIN SMJ_MAINLIST B
                                  ON A.EMPID = B.CAR_EMPID
                                      AND CAR_DELGUBN = '0'
                                      AND CAR_STATUS IN ( '002', '003' )
                          INNER JOIN SMJ_SOLDLIST C
                                  ON B.CAR_REGID = C.SELL_CAR_REGID
                    WHERE  AGENT = '00511'
                          AND SANGSA_CODE > 0
                          AND EMPGRADE <> '4'
                          AND EMPEDATE IS NULL
                          AND SELL_DATE >= '2020-04-01 00:00:00'
                          AND SELL_DATE <= '2025-04-12 23:59:59'
                    GROUP  BY EMPID,
                              EMPKNAME
                    ORDER  BY EMPKNAME  ;
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching system overall sell list:", err);
    throw err;
  }
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 운영현황 - 월별 현황  
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 월별 현황 목록 조회
exports.getSystemMonthlyList = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT 1 NO,
                          SUBSTRING(A.CAL_DATE, 1, 7) AS CALMM,
                          ISNULL(FIXCNT, 0) FIXCNT,
                          ISNULL(ENDCNT, 0) ENDCNT,
                          ISNULL(FIXCNT, 0) - ISNULL(ENDCNT, 0) CNT_DIFF
                    FROM   SMJ_CALENDAR A
                          LEFT OUTER JOIN (SELECT SUM(CONVERT(BIGINT, COST_REALAMT)) / 10000 AS
                                                  FIXCNT,
                                                  COST_YEARMONTH                             AS
                                                  FIXMM
                                            FROM   SMJ_COST
                                            WHERE  COST_AGENT = '00002'
                                                  AND COST_KIND = '1'
                                                  AND COST_DELGUBN = '0'
                                            GROUP  BY COST_YEARMONTH) B
                                        ON SUBSTRING(A.CAL_DATE, 1, 7) = B.FIXMM
                          LEFT OUTER JOIN (SELECT SUM(CONVERT(BIGINT, COST_REALAMT)) / 10000 AS
                                                  ENDCNT,
                                                  COST_YEARMONTH                             AS
                                                  ENDMM
                                            FROM   SMJ_COST
                                            WHERE  COST_AGENT = '00002'
                                                  AND COST_KIND = '0'
                                                  AND COST_DELGUBN = '0'
                                            GROUP  BY COST_YEARMONTH) C
                                        ON SUBSTRING(A.CAL_DATE, 1, 7) = C.ENDMM
                    WHERE  A.CAL_DATE BETWEEN DATEADD(MONTH, -4, GETDATE()) - ( DAY(GETDATE()) - 1 )
                                              AND
                                              GETDATE()
                    GROUP  BY SUBSTRING(A.CAL_DATE, 1, 7),
                              FIXCNT,
                              ENDCNT
                    ORDER  BY CALMM ASC;
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching system monthly list:", err);
    throw err;
  }
};




////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 운영현황 - 예상부가세  
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 예상부가세 매출 현황 목록 조회
exports.getSystemVatSalesList = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT Count(cost_seq) AS CNT,
                          Sum(cost_realamt / 10000) AS RT,
                          Sum(Floor(Round(cost_realamt / 10000 / 1.1, 0))) AS SP,
                          Sum(cost_realamt / 10000 - ( Floor(Round(cost_realamt / 10000 / 1.1, 0))
                                                      )) AS VT
                    FROM   smj_cost
                    WHERE  1 = 1 --cost_kind = '1'
                          AND cost_delgubn = '0'
                          --AND cost_agent = '00511'
                          AND cost_taxdate BETWEEN '2024-04-01 00:00:00' AND '2025-04-18 23:59:59';
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching system vat sales list:", err);
    throw err;
  }
};


// 예상부가세 매입 현황 목록 조회
exports.getSystemVatPurchaseList = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT Count(cost_seq) AS CNT,
                          Sum(cost_realamt / 10000) AS RT,
                          Sum(sup / 10000)          AS SP,
                          Sum(vat / 10000)          AS VT
                    FROM   (SELECT cost_seq,
                                  cost_realamt,
                                  CASE cost_taxrate
                                    WHEN '0' THEN cost_realamt
                                    WHEN '1' THEN Floor(Round(cost_realamt / 1.1, 0))
                                    WHEN '2' THEN Floor(Round(cost_realamt / 1.1, 0))
                                    ELSE '0'
                                  END sup,
                                  CASE cost_taxrate
                                    WHEN '0' THEN '0'
                                    WHEN '1' THEN cost_realamt - ( Floor(Round(cost_realamt / 1.1,
                                                                          0)) )
                                    WHEN '2' THEN cost_realamt - ( Floor(Round(cost_realamt / 1.1,
                                                                          0)) )
                                    ELSE '0'
                                  END vat
                            FROM   smj_cost
                            WHERE cost_kind = '0'
                                  AND cost_delgubn = '0'
                                  -- AND cost_agent = '00002'
                                  AND cost_taxdate BETWEEN '2024-04-01 00:00:00' AND
                                                            '2025-04-18 23:59:59'
                          ) tbl 
                    ;

    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching system vat purchase list:", err);
    throw err;
  }
};




////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 현금영수증
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 현금영수증 목록 데이터 조회
exports.getCashBillList = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);
    const query = `
      SELECT *
      FROM   (SELECT ROW_NUMBER()
                     OVER(
                       ORDER BY COST_REGDATE DESC, COST_YEARMONTH DESC, COST_DATE DESC ) AS RNUM,
                   COST_SEQ,
                   COST_YEARMONTH,
                   DBO.SMJ_FN_DATEFMT('D', COST_DATE) AS COST_DATE,
                   COST_CODENAME,
                   COST_REALAMT,
                   DBO.SMJ_FN_GETCDNAME('06', COST_WAY) AS COST_WAY,
                   DBO.SMJ_FN_GETCDNAME('07', COST_RECEIPT) AS COST_RECEIPTNAME,
                   CASE COST_TAXGUBN
                     WHEN '0' THEN '미공제'
                     WHEN '1' THEN '공제'
                     ELSE ''
                   END AS COST_TAXGUBN,
                   DBO.SMJ_FN_DATEFMT('D', COST_TAXDATE) AS COST_TAXDATE,
                   COST_DESC,
                   DBO.SMJ_FN_DATEFMT('D', COST_REGDATE) AS COST_REGDATE,
                   COST_CAR_NO,
                   CASE COST_EMPID
                     WHEN '000000000' THEN '타딜러'
                     ELSE EMPKNAME
                   END AS EMPNAME,
                   CASE CASHBILL_YN
                     WHEN 'Y' THEN '발행'
                     WHEN 'N' THEN '미발행'
                     ELSE ''
                   END AS CASHBILL_YNNAME,
                   COST_CODE,
                   COST_CARID,
                   COST_RECEIPT,
                   CAR_NAME,
                   SELL_OWNER,
                   SELL_TELNO,
                   REPLACE(COST_RECEIPT_NO, '-', '') AS COST_RECEIPT_NO_RE,
                   COST_AUTO,
                   DBO.SMJ_FN_VAT_SUP(COST_REALAMT) AS SUP,
                   DBO.SMJ_FN_VAT_AMT(COST_REALAMT) AS VAT
            FROM   SMJ_COST A
                   LEFT OUTER JOIN SMJ_MAINLIST B ON CAR_REGID = COST_CARID
                   LEFT OUTER JOIN SMJ_SOLDLIST D ON CAR_REGID = SELL_CAR_REGID
                   LEFT OUTER JOIN SMJ_USER C ON A.COST_EMPID = C.EMPID
            WHERE  COST_KIND = '1'
                   AND COST_DELGUBN = '0' 
                   AND COST_AGENT = '00002'
                   AND COST_RECEIPT = '004'
                   AND CASHBILL_YN = 'N'
                   AND COST_REALAMT > 0
                   AND CASHBILL_VIEW = 'Y') AS V
      WHERE  1 = 1 --RNUM BETWEEN 1 AND 50
      ;
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching cash bill pre data:", err);
    throw err;
  }
};


// 현금영수증 사전 데이터 조회 - 총거래금액, 공급가액, 부가세
exports.getCashBillAmount = async ({ costSeq }) => {
  try {
    const request = pool.request();
    request.input("COST_SEQ", sql.VarChar, costSeq);
    const query = `
    SELECT COST_CODENAME,
               COST_REALAMT,
               SELL_OWNER,
               SELL_TELNO,
               DBO.SMJ_FN_VAT_SUP(COST_REALAMT) AS SUP,
               DBO.SMJ_FN_VAT_AMT(COST_REALAMT) AS VAT
        FROM   SMJ_COST A
               LEFT OUTER JOIN SMJ_MAINLIST B
                            ON CAR_REGID = COST_CARID
               LEFT OUTER JOIN SMJ_SOLDLIST D
                            ON CAR_REGID = SELL_CAR_REGID
               LEFT OUTER JOIN SMJ_USER C
                            ON A.COST_EMPID = C.EMPID
        WHERE  COST_SEQ = @COST_SEQ;	
    `;
    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching cash bill amount:", err);
    throw err;
  }
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 현금영수증 발행리스트
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 현금영수증 발행리스트 조회
exports.getReceiptIssueList = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    // 발행 변수
    const issuedate = new Date();

    const query = `SELECT *
                    FROM   (SELECT ROW_NUMBER()
                                    OVER(
                                      ORDER BY TAXREGDATE DESC)       AS RNUM,
                                  MGTKEY,
                                  WRITEDATE,
                                  INVOICEECORPNAME,
                                  INVOICEECORPNUM,
                                  TOTALAMOUNT,
                                  CASE TAXEMP
                                    WHEN '000000000' THEN '타딜러'
                                    WHEN '999999999' THEN '타딜러'
                                    ELSE DBO.SMJ_FN_EMPNAME(TAXEMP)
                                  END                                 EMPNAME,
                                  COST_CODENAME,
                                  ITEMNAME,
                                  DBO.SMJ_FN_DATEFMT('D', TAXREGDATE) TAXREGDATE,
                                  SUPPLYCOSTTOTAL,
                                  TAXTOTAL,
                                  DBO.SMJ_FN_DATEFMT('D', TAXDELDATE) TAXDELDATE,
                                  INVOICEETEL1,
                                  CARREGID,
                                  COSTSEQ,
                                  COSTCODE
                            FROM   SMJ_TAXBILL A,
                                  SMJ_COST B
                            WHERE  A.COSTSEQ = B.COST_SEQ
                                  AND COST_KIND = '1'
                                  AND COST_RECEIPT = '001'
                                  --AND A.AGENT = '00002'
                                  ) AS V
                    WHERE  RNUM BETWEEN 1 AND 10;
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching receipt issue list:", err);
    throw err;
  }
};  

// 현금영수증 발행리스트 합계 
exports.getReceiptIssueSummary = async ({ carAgent }) => {  
  try { 
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);  

    const query = `SELECT 0 GUBUN,
                          G1,
                          G2,
                          G3,
                          G4,
                          J1,
                          J2,
                          J3,
                          J4,
                          G1 + J1,
                          G2 + J2,
                          G3 + J3,
                          G4 + J4
                    FROM   (SELECT COUNT(MGTKEY)               AS G1,
                                  ISNULL(SUM(TOTALAMOUNT), 0) AS G2,
                                  ISNULL(SUM(SUPPLYCOST), 0)  AS G3,
                                  ISNULL(SUM(TAX), 0)         AS G4
                            FROM   SMJ_CASHBILL
                            WHERE  1= 1 --AND  AGENT = ?
                                  AND TRADETYPE = '승인거래'
                                  AND TRADEUSAGE = '소득공제용'
                                  AND IDENTITYNUM <> '0100001234'
                                  AND CASHDELDATE IS NULL) AS A,
                          (SELECT COUNT(MGTKEY)               AS J1,
                                  ISNULL(SUM(TOTALAMOUNT), 0) AS J2,
                                  ISNULL(SUM(SUPPLYCOST), 0)  AS J3,
                                  ISNULL(SUM(TAX), 0)         AS J4
                            FROM   SMJ_CASHBILL
                            WHERE 1= 1 --AND   AGENT = ?
                                  AND TRADETYPE = '승인거래'
                                  AND TRADEUSAGE = '지출증빙용'
                                  AND IDENTITYNUM <> '0100001234'
                                  AND CASHDELDATE IS NULL) AS B
                    UNION ALL
                    SELECT 1 GUBUN,
                          G1,
                          G2,
                          G3,
                          G4,
                          J1,
                          J2,
                          J3,
                          J4,
                          G1 + J1,
                          G2 + J2,
                          G3 + J3,
                          G4 + J4
                    FROM   (SELECT COUNT(MGTKEY)               AS G1,
                                  ISNULL(SUM(TOTALAMOUNT), 0) AS G2,
                                  ISNULL(SUM(SUPPLYCOST), 0)  AS G3,
                                  ISNULL(SUM(TAX), 0)         AS G4
                            FROM   SMJ_CASHBILL
                            WHERE  1= 1 --AND  AGENT = ?
                                  AND TRADETYPE = '승인거래'
                                  AND TRADEUSAGE = '소득공제용'
                                  AND IDENTITYNUM = '0100001234'
                                  AND CASHDELDATE IS NULL) AS A,
                          (SELECT COUNT(MGTKEY)               AS J1,
                                  ISNULL(SUM(TOTALAMOUNT), 0) AS J2,
                                  ISNULL(SUM(SUPPLYCOST), 0)  AS J3,
                                  ISNULL(SUM(TAX), 0)         AS J4
                            FROM   SMJ_CASHBILL
                            WHERE  1= 1 --AND  AGENT = ?
                                  AND TRADETYPE = '승인거래'
                                  AND TRADEUSAGE = '지출증빙용'
                                  AND IDENTITYNUM = '0100001234'
                                  AND CASHDELDATE IS NULL) AS B ;
    `;  
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching receipt issue list:", err);
    throw err;
  }
};




////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 전자세금계산서 발행
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 전자세금계산서 목록 데이터 조회
exports.getTaxInvoiceList = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);
    const query = `SELECT *
                    FROM   (SELECT ROW_NUMBER()
                                    OVER(
                                      ORDER BY TAXREGDATE DESC)       AS RNUM,
                                  MGTKEY,
                                  WRITEDATE,
                                  INVOICEECORPNAME,
                                  INVOICEECORPNUM,
                                  TOTALAMOUNT,
                                  CASE TAXEMP
                                    WHEN '000000000' THEN '타딜러'
                                    WHEN '999999999' THEN '타딜러'
                                    ELSE DBO.SMJ_FN_EMPNAME(TAXEMP)
                                  END                                 EMPNAME,
                                  COST_CODENAME,
                                  ITEMNAME,
                                  DBO.SMJ_FN_DATEFMT('D', TAXREGDATE) TAXREGDATE,
                                  SUPPLYCOSTTOTAL,
                                  TAXTOTAL,
                                  DBO.SMJ_FN_DATEFMT('D', TAXDELDATE) TAXDELDATE,
                                  INVOICEETEL1,
                                  CARREGID,
                                  COSTSEQ,
                                  COSTCODE
                            FROM   SMJ_TAXBILL A,
                                  SMJ_COST B
                            WHERE  A.COSTSEQ = B.COST_SEQ
                                  AND COST_KIND = '1'
                                  AND COST_RECEIPT = '001'
                                  AND A.AGENT = '00511'
                                  ) AS V
                    WHERE  RNUM BETWEEN 1 AND 10 
                    ;
    `;  
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching tax invoice list:", err);
    throw err;
  }
};


// 전자세금계산서 사전 데이터 조회 - 총거래금액, 공급가액, 부가세
exports.getTaxInvoiceAmount = async ({ eInvoiceSeq }) => {
  try {
    const request = pool.request();
    request.input("E_INVOICE_SEQ", sql.VarChar, eInvoiceSeq);
    const query = `SELECT G1,
                        G2,
                        G3,
                        G4,
                        J1,
                        J2,
                        J3,
                        J4,
                        G1 + J1,
                        G2 + J2,
                        G3 + J3,
                        G4 + J4
                  FROM   (SELECT COUNT(MGTKEY)                   AS G1,
                                ISNULL(SUM(TOTALAMOUNT), 0)     AS G2,
                                ISNULL(SUM(SUPPLYCOSTTOTAL), 0) AS G3,
                                ISNULL(SUM(TAXTOTAL), 0)        AS G4
                          FROM   SMJ_TAXBILL
                          WHERE  AGENT =  '00002'
                                AND TAXDELDATE IS NULL) AS A,
                        (SELECT COUNT(MGTKEY)                   AS J1,
                                ISNULL(SUM(TOTALAMOUNT), 0)     AS J2,
                                ISNULL(SUM(SUPPLYCOSTTOTAL), 0) AS J3,
                                ISNULL(SUM(TAXTOTAL), 0)        AS J4
                          FROM   SMJ_TAXBILL
                          WHERE  AGENT =  '00002'
                                AND TAXDELDATE IS NOT NULL) AS B ;
    `;
    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching tax invoice amount:", err);
    throw err;
  }
};



////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 전자세금계산서 발행리스트
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 세금계산서 발행리스트 조회
exports.getTaxIssueList = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    // 발행 변수
    const issuedate = new Date();

    const query = `SELECT *
                    FROM   (SELECT ROW_NUMBER()
                                    OVER(
                                      ORDER BY TAXREGDATE DESC)       AS RNUM,
                                  MGTKEY,
                                  WRITEDATE,
                                  INVOICEECORPNAME,
                                  INVOICEECORPNUM,
                                  TOTALAMOUNT,
                                  CASE TAXEMP
                                    WHEN '000000000' THEN '타딜러'
                                    WHEN '999999999' THEN '타딜러'
                                    ELSE DBO.SMJ_FN_EMPNAME(TAXEMP)
                                  END                                 EMPNAME,
                                  COST_CODENAME,
                                  ITEMNAME,
                                  DBO.SMJ_FN_DATEFMT('D', TAXREGDATE) TAXREGDATE,
                                  SUPPLYCOSTTOTAL,
                                  TAXTOTAL,
                                  DBO.SMJ_FN_DATEFMT('D', TAXDELDATE) TAXDELDATE,
                                  INVOICEETEL1,
                                  CARREGID,
                                  COSTSEQ,
                                  COSTCODE
                            FROM   SMJ_TAXBILL A,
                                  SMJ_COST B
                            WHERE  A.COSTSEQ = B.COST_SEQ
                                  AND COST_KIND = '1'
                                  AND COST_RECEIPT = '001'
                                  --AND A.AGENT = '00002'
                                  ) AS V
                    WHERE  RNUM BETWEEN 1 AND 10;
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching tax invoice issue list:", err);
    throw err;
  }
};  

// 세금계산서 발행리스트 합계 
exports.getTaxIssueSummary = async ({ carAgent }) => {  
  try { 
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);  

    const query = `SELECT G1,
                          G2,
                          G3,
                          G4,
                          J1,
                          J2,
                          J3,
                          J4,
                          G1 + J1,
                          G2 + J2,
                          G3 + J3,
                          G4 + J4
                    FROM   (SELECT COUNT(MGTKEY)                  AS G1,
                                  ISNULL(SUM(TOTALAMOUNT), 0)     AS G2,
                                  ISNULL(SUM(SUPPLYCOSTTOTAL), 0) AS G3,
                                  ISNULL(SUM(TAXTOTAL), 0)        AS G4
                            FROM   SMJ_TAXBILL
                            WHERE  AGENT =  '00002'
                                  AND TAXDELDATE IS NULL) AS A,
                          (SELECT COUNT(MGTKEY)                   AS J1,
                                  ISNULL(SUM(TOTALAMOUNT), 0)     AS J2,
                                  ISNULL(SUM(SUPPLYCOSTTOTAL), 0) AS J3,
                                  ISNULL(SUM(TAXTOTAL), 0)        AS J4
                            FROM   SMJ_TAXBILL
                            WHERE  AGENT =  '00002'
                                  AND TAXDELDATE IS NOT NULL) AS B 
    `;  
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching tax invoice issue list:", err);
    throw err;
  }
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 환경 설정
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 상사정보관리 조회
exports.getCompanyInfo = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT COMNAME,
                          DBO.SMJ_FN_DATEFMT('D', REGDATE) AS REGDATE,
                          ENDDATE,
                          EMPKNAME,
                          AG_TEL,
                          AG_FAX,
                          AG_ZIP,
                          AG_ADDR1,
                          AG_ADDR2,
                          BRNO,
                          AG_BUY_TAX15,
                          AG_VAT_1PRO,
                          AG_FEE_BACK,
                          AG_AUTH_TEL,
                          AG_SMS_ADJ_D,
                          AG_SMS_ADJ_A
                    FROM   SMJ_AGENT A,
                          SMJ_USER B
                    WHERE  A.AGENT = B.AGENT
                          AND EMPGRADE = '9'
                          AND A.AGENT = @CAR_AGENT`;
    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching company info:", err);
    throw err;
  }
};


// 상사 조합 딜러 관리
exports.getCompanySangsaDealer = async ({ sangsaCode }) => {
  try {
    const request = pool.request();
    request.input("DL_SANGSA_CODE", sql.VarChar, sangsaCode);

    const query = `SELECT DL_SEQNO,
                          DL_CODE,
                          DL_NAME,
                          DL_SANGSA_CODE,
                          DL_NO,
                          DL_SNO,
                          DL_INDATE,
                          DL_OUTDATE,
                          DL_TELNO,
                          DL_ZIP,
                          DL_ADDR1,
                          DL_ADDR2,
                          DL_REG_DATETIME,
                          DL_FLAG,
                          DL_INSERT_DATETIME
                    FROM   KU_DEALER
                    WHERE  DL_SANGSA_CODE = 301442
                          AND DL_FLAG = '' 
                    ORDER BY DL_NAME
                    ;   `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching company sangsa dealer:", err);
    throw err;
  }
};


// 상사딜러관리
exports.getCompanyDealer = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT *
                    FROM   (SELECT ROW_NUMBER()
                                    OVER(
                                      ORDER BY EMPEDATE, EMPKNAME, DEALER_CODE, EMPGRADE DESC,
                                    EMPKNAME )
                                          AS RNUM,
                                  EMPID,
                                  EMPKNAME,
                                  EMPTELNO1,
                                  EMPEMAIL,
                                  CONVERT(VARCHAR, EMPSDATE, 23)
                                          AS EMPSDATE,
                                  CASE CONVERT(VARCHAR, EMPEDATE, 23)
                                    WHEN '1900-01-01' THEN ''
                                    ELSE CONVERT(VARCHAR, EMPEDATE, 23)
                                  END
                                          EDNM,
                                  EMPPHOTO,
                                  CASE EMPGRADE
                                    WHEN '0' THEN '딜러'
                                    WHEN '1' THEN '사무장'
                                    WHEN '9' THEN '대표'
                                    ELSE ''
                                  END
                                          EMPGRADENAME,
                                  CASE EMPTAXGUBN
                                    WHEN '0' THEN '원천징수대상자'
                                    WHEN '1' THEN '사업자등록'
                                    ELSE ''
                                  END
                                          EMPTAXGUBNNAME,
                                  CASE
                                    WHEN LEN(EMPADDR1) > 15 THEN SUBSTRING(EMPADDR1, 1, 15)
                                    ELSE EMPADDR1
                                  END
                                          ADDR1,
                                  EMPGRADE,
                                  SANGSA_CODE,
                                  DEALER_CODE,
                                  EMPSNO
                            FROM   SMJ_USER
                            WHERE  1 = 1 --AGENT = '00518'
                                  AND SANGSA_CODE > 0
                                  AND EMPGRADE IN ( '0', '9' )) AS V
                                        WHERE  RNUM BETWEEN 1 AND 100 
                    ;   `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching company dealer:", err);
    throw err;
  }
};

// 매입비 설정
exports.getPurchaseCost = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT CNFG_FEE_SEQ,
                          CNFG_FEE_NO,
                          CNFG_FEE_TITLE,
                          CNFG_FEE_COND,
                          CNFG_FEE_RATE,
                          CNFG_FEE_AMT
                    FROM   SMJ_FEECONFIG
                    WHERE  CNFG_FEE_KIND = '1'
                          AND CNFG_FEE_AGENT = '00511' 
                    ;
`;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching purchase cost:", err);
    throw err;
  }
};

// 매도비 설정 합계
exports.getSellCostSummary = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT CNFG_FEE_SEQ,
                          CNFG_FEE_NO,
                          CNFG_FEE_TITLE,
                          CNFG_FEE_COND,
                          CNFG_FEE_RATE,
                          CNFG_FEE_AMT
                    FROM   SMJ_FEECONFIG
                    WHERE  CNFG_FEE_KIND = '1'
                          AND CNFG_FEE_AGENT = '00511' 
                    ;`;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching sell cost:", err);
    throw err;
  }
};


// 상사지출항목설정
exports.getCompanyExpense = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT INDEXCD,
                          CODE1,
                          CODE2,
                          NAME,
                          CASE ISUSE
                            WHEN 'Y' THEN '사용'
                            ELSE '미사용'
                          END AS ISUSE,
                          NAME2,
                          SORTNO
                    FROM   SMJ_CODE
                    WHERE  INDEXCD = 80
                          AND CODE1 != '###'
                          AND AGENT = '00002'
                    ORDER  BY SORTNO ASC,
                              NAME ;`;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching company expense:", err);
    throw err;
  }
};

// 상사수입항목설정
exports.getCompanyIncome = async ({ carAgent }) => {  
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT INDEXCD,
                          CODE1,
                          CODE2,
                          NAME,
                          CASE ISUSE
                            WHEN 'Y' THEN '사용'
                            ELSE '미사용'
                          END AS ISUSE,
                          NAME2,
                          SORTNO
                    FROM   SMJ_CODE
                    WHERE  INDEXCD = 81
                          AND CODE1 != '###'
                          AND AGENT = '00002'
                    ORDER  BY SORTNO ASC,
                              NAME ;
                          `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching company income:", err);
    throw err;
  }
};    







