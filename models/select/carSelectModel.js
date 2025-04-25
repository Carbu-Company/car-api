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

    const query = `SELECT DBO.SMJ_FN_MK_AGENT(),
                          CONVERT(VARCHAR(10), DATEADD(DAY, 3650, GETDATE()), 21),
                          COUNT(*)
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



////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 매입 매도비 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 매입 매도비 목록 조회
exports.getBuySellFeeList = async ({ carAgent, carNo }) => {
  try {
    const request = pool.request();

    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT *
                    FROM (
                        SELECT 
                            ROW_NUMBER() OVER (ORDER BY CAR_BUYDATE DESC, CAR_REGDATE DESC) AS RNUM,
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
                    ) AS V
                    WHERE 1 = 1 --RNUM BETWEEN 1 AND 10
                    ;`;


    console.log(query);

    const result = await request.query(query);
    return result.recordset;
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 상품화비
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 상품화비 목록 조회
exports.getGoodsFeeList = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT *
                      FROM   (
                                      SELECT   ROW_NUMBER() OVER(ORDER BY SELL_DATE DESC, CAR_REGDATE DESC) AS RNUM ,
                                              CAR_REGID,
                                              DBO.SMJ_FN_EMPNAME(CAR_EMPID) AS EMPKNAME ,
                                              CAR_NO ,
                                              CAR_NAME,
                                              BUY_OWNER,
                                              BUY_NOTIAMT/10000                   AS BUY_NOTIAMT,
                                              DBO.SMJ_FN_DATEFMT('H',CAR_BUYDATE) AS CAR_BUYDATE ,
                                              SELL_OWNER,
                                              SELL_NOTIAMT/10000                AS SELL_NOTIAMT ,
                                              DBO.SMJ_FN_DATEFMT('H',SELL_DATE) AS SELL_DATE ,
                                              BUY_TOTAL_FEE ,
                                              SELL_TOTAL_FEE ,
                                              CASE CAR_STATUS
                                                        WHEN '001' THEN '제시'
                                                        ELSE '매도'
                                              END AS STATUS ,
                                              CASE CAR_GUBN
                                                        WHEN '0' THEN '상사'
                                                        WHEN '1' THEN '고객'
                                                        ELSE ''
                                              END AS CAR_GUBNNAME ,
                                              GOODS_FEE ,
                                              DBO.SMJ_FN_GOODS_TAX(CAR_REGID) AS AMTARR ,
                                              BUY_REAL_FEE ,
                                              SELL_REAL_FEE ,
                                              BUY_TOTAL_FEE  - BUY_REAL_FEE  AS MINAP ,
                                              SELL_TOTAL_FEE - SELL_REAL_FEE AS SELLMINAP ,
                                              CAR_GUBN ,
                                              CASE
                                                        WHEN SELL_NOTIAMT > 0 THEN SELL_NOTIAMT-BUY_NOTIAMT-GOODS_FEE
                                                        ELSE '0'
                                              END AS BFIT
                                      FROM     SMJ_MAINLIST A,
                                              SMJ_SOLDLIST B
                                      WHERE    A.CAR_REGID = B.SELL_CAR_REGID
                                      AND      A.CAR_DELGUBN = '0'
                                      AND      A.GOODS_FEE > 0
                                      AND      CAR_AGENT = @CAR_AGENT ) AS V
                      WHERE  RNUM BETWEEN 1 AND    10;
                      `; 

    const result = await request.query(query);
    return result.recordset;
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

// 차량 조회
exports.getSuggestList = async ({
  carAgent,
  carNo,
  carName,
  buyOwner,
  empName,
  customerName,
}) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    if (carNo) request.input("CAR_NO", sql.VarChar, `%${carNo}%`);
    if (carName) request.input("CAR_NAME", sql.VarChar, `%${carName}%`); // LIKE 검색 적용
    if (customerName) request.input("CUSTOMER_NAME", sql.VarChar, `%${customerName}%`); // LIKE 검색 적용
    if (buyOwner) request.input("BUY_OWNER", sql.VarChar, `%${buyOwner}%`); // LIKE 검색 적용
    if (empName) request.input("EMPKNAME", sql.VarChar, `%${empName}%`); // LIKE 검색 적용

    const query = `
        SELECT *
        FROM (
            SELECT 
                ROW_NUMBER() OVER (ORDER BY CAR_BUYDATE DESC, CAR_REGDATE DESC) AS rnum,
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
            FROM SMJ_MAINLIST
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
        ) a;
    `;
    console.log(query);

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching cars:", err);
    throw err;
  }
};

// 제시 차량 합계 조회
exports.getSuggestSummary = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT '상사' AS CAR_GUBN_NAME,
                          SUM(BUY_NOTIAMT) / 10000 AS BUY_NOTIAMT,
                          SUM(BUY_SUPAMT) / 10000  AS BUY_SUPAMT,
                          SUM(BUY_TAX) / 10000 AS BUY_TAX,
                          SUM(BUY_TOTAL_FEE) AS BUY_TOTAL_FEE,
                          SUM(BUY_REAL_FEE) AS BUY_REAL_FEE,
                          SUM(BUY_TOTAL_FEE) - SUM(BUY_REAL_FEE) AS BUY_DIFF_FEE,
                          COUNT(CAR_REGID) AS CAR_REGID_CNT, 
                          SUM(CAR_LOANSUM) / 10000 AS CAR_LOANSUM,
                          SUM(GOODS_FEE) AS GOODS_FEE,
                          SUM(BUY_BOHEOMAMT) AS BUY_BOHEOMAMT,
                          SUM(BUY_TAX15) AS BUY_TAX15
                          --SUM(BUY_REAL_FEE) AS BUY_REAL_FEE
                    FROM   SMJ_MAINLIST
                    WHERE  CAR_STATUS = '001'
                          AND CAR_GUBN = '0'
                          AND CAR_AGENT = '00002'
                          AND CAR_DELGUBN = '0' 
                    UNION ALL	   
                    SELECT '고객/위탁',
                          SUM(BUY_NOTIAMT),
                          SUM(BUY_SUPAMT),
                          SUM(BUY_TAX),
                          SUM(BUY_TOTAL_FEE),
                          SUM(BUY_REAL_FEE),
                          SUM(BUY_TOTAL_FEE) - SUM(BUY_REAL_FEE),
                          COUNT(CAR_REGID),
                          SUM(CAR_LOANSUM) / 10000,
                          SUM(GOODS_FEE),
                          SUM(BUY_BOHEOMAMT),
                          SUM(BUY_TAX15)
                          --SUM(BUY_REAL_FEE)
                    FROM   SMJ_MAINLIST
                    WHERE  CAR_STATUS = '001'
                          AND CAR_GUBN = '1'
                          AND CAR_AGENT = '00002'
                          AND CAR_DELGUBN = '0'   
      ;`;

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching suggest sum:", err);
    throw err;
  }
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 공통
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 관리키 조회
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

    const query = `SELECT EMPID,
                     EMPKNAME,
                     EMPTELNO1,
                     CASE
                       WHEN EMPEDATE IS NULL THEN ''
                       ELSE '[퇴사]'
                     END AS EMPEDATE1
                  FROM   SMJ_USER
                  WHERE  AGENT = @CAR_AGENT
                         AND SANGSA_CODE > 0
                         AND EMPEDATE IS NULL
                         AND EMPGRADE <> '4'
                  ORDER  BY EMPKNAME,
                            DEALER_CODE,
                            EMPEDATE;    
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
                  FROM   CJB_CD
                  WHERE  GRP_CD_ID = @GRP_CD
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


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 판매
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 판매 내역 조회
exports.getSellList = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT *
                    FROM   (SELECT ROW_NUMBER()
                                    OVER(
                                      ORDER BY SELL_DATE DESC, SELL_REGDATE DESC) AS RNUM,
                                  SELL_CAR_REGID,
                                  DBO.SMJ_FN_DATEFMT('H', CAR_BUYDATE)            AS CAR_BUYDATE,
                                  CASE CAR_GUBN
                                    WHEN '0' THEN '상사'
                                    WHEN '1' THEN '고객'
                                    ELSE ''
                                  END                                             AS CAR_GUBNNAME,
                                  CAR_NO,
                                  CAR_NAME,
                                  BUY_NOTIAMT,
                                  SELL_NOTIAMT,
                                  SELL_NOTIAMT - BUY_NOTIAMT                      AS COL1,
                                  SELL_OWNER,
                                  EMPKNAME,
                                  DATEDIFF(DAY, CAR_BUYDATE, SELL_DATE) + 1       AS ISDAY,
                                  CAR_LOANSUM,
                                  CASE CAR_LOANCNT
                                    WHEN '0' THEN ''
                                    ELSE CONVERT(VARCHAR(10), CAR_LOANCNT) + '건'
                                  END                                             AS CAR_LOANCNT,
                                  SELL_TOTAL_FEE,
                                  SELL_REAL_FEE,
                                  SELL_TOTAL_FEE - SELL_REAL_FEE                  AS COL2,
                                  DBO.SMJ_FN_DATEFMT('H', SELL_DATE)              AS SELL_DATE,
                                  CAR_GUBN,
                                  CASE SELL_ADJ_DATE
                                    WHEN '' THEN '정산대기'
                                    ELSE SELL_ADJ_DATE
                                  END                                             AS
                                  SELL_TAXENDCHECKNAME,
                                  CASE
                                    WHEN CAR_EMPID <> SELL_EMPID THEN ' (알선)'
                                    ELSE ''
                                  END                                             ALSON,
                                  CASE B.SELLFEEGUBN
                                    WHEN '0' THEN '(별도)'
                                    WHEN '1' THEN '(포함)'
                                    ELSE ''
                                  END                                             AS
                                  SELLFEEGUBNNAME,
                                  SELL_BOHEOMAMT_1 + SELL_BOHEOMAMT_2
                                  + SELL_BOHEOMAMT_3                              AS SELL_BOHEOMAMT
                                  ,
                                  BUY_TAX15
                            FROM   SMJ_MAINLIST A
                                  LEFT OUTER JOIN SMJ_SOLDLIST B
                                                ON A.CAR_REGID = B.SELL_CAR_REGID
                                  LEFT OUTER JOIN SMJ_USER C
                                                ON A.CAR_EMPID = C.EMPID
                            WHERE  CAR_AGENT = @CAR_AGENT
                                  AND A.CAR_DELGUBN = '0'
                                  AND CAR_STATUS IN ( '002', '003' )) AS V
                    WHERE  RNUM BETWEEN 1 AND 10 	   
                    ;
    `;
    const result = await request.query(query);
    return result.recordset;
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
                                  REGID,
                                  DBO.SMJ_FN_EMPNAME(CAR_EMPID)                         EMPNAME,
                                  DBO.SMJ_FN_DATEFMT('D', B.REGDATE)                    REGDATE,
                                  CASE CPTGUBN
                                    WHEN '001' THEN '신규'
                                    WHEN '002' THEN '갱신'
                                    WHEN '003' THEN '연장'
                                    ELSE ''
                                  END                                                   AS CPTGUBN,
                                  DBO.SMJ_FN_GETCDNAME('05', CPTCOMPANY)
                                  CPTCOMPANYNAME,
                                  CPTAMT / 10000                                        AS CPTAMT,
                                  CPTCMPRATE,
                                  CPTDEALRATE,
                                  CPTPERIOD,
                                  DBO.SMJ_FN_DATEFMT('H', CPTSDATE)                     CPTSDATE,
                                  DBO.SMJ_FN_DATEFMT('H', CPTPAYDATE)                   CPTPAYDATE,
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
                                  END                                                   CPT_END2,
                                  FEE_DEAL_TOT - FEE_DEAL_REAL                          AS MINAP,
                                  BUY_NOTIAMT,
                                  CASE CAR_STATUS
                                    WHEN '001' THEN '제시'
                                    ELSE '매도'
                                  END                                                   AS STATUS,
                                  CPTCOMPANY,
                                  FEE_HAEJI_SUM
                            FROM   SMJ_MAINLIST A,
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
                    FROM   SMJ_MAINLIST A,
                          SMJ_CAPITAL_LIST B
                    WHERE  A.CAR_REGID = B.REGID
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
                    FROM   SMJ_MAINLIST A,
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



////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 알선
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 알선 목록 조회
exports.getAlsonList = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, carAgent);

    const query = `SELECT *
                    FROM   (SELECT ROW_NUMBER()
                                    OVER(
                                      ORDER BY SELL_DATE DESC, SELL_REGDATE DESC) AS RNUM,
                                  CAR_REGID,
                                  DBO.SMJ_FN_DATEFMT('H', SELL_DATE)              AS SELL_DATE,
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
                                  END                                             AS
                                  SELL_CASHKINDNAME,
                                  COST_CODENAME,
                                  SETTAMT_SEND,
                                  COST_DESC,
                                  CASE CASHBILL_YN
                                    WHEN 'Y' THEN '발행'
                                    WHEN 'N' THEN '미발행'
                                    ELSE ''
                                  END                                             CASHBILL_YNNAME,
                                  COST_SEQ,
                                  BUYFEE_SUM
                            FROM   SMJ_MAINLIST A
                                  LEFT OUTER JOIN SMJ_ADJUSTMENT ST
                                                ON A.CAR_REGID = ST.ADJ_CAR_REGID
                                  LEFT OUTER JOIN SMJ_SOLDLIST B
                                                ON A.CAR_REGID = B.SELL_CAR_REGID
                                  LEFT OUTER JOIN SMJ_USER C
                                                ON A.CAR_EMPID = C.EMPID
                                  LEFT OUTER JOIN SMJ_COST D
                                                ON A.CAR_REGID = D.COST_CARID
                                                  AND COST_KIND = '1'
                            WHERE  CAR_AGENT = @CAR_AGENT
                                  AND A.CAR_DELGUBN = '0'
                                  AND CAR_STATUS = '004') AS V
                    WHERE  RNUM BETWEEN 1 AND 10 
                    ;
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching alson list:", err);
    throw err;
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 운영현황 - 매출관리 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 매출관리 목록 조회
exports.getSystemSalesList = async ({ carAgent }) => {
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
                              WHERE  COST_KIND = '1'
                                    AND COST_DELGUBN = '0'
                                    AND COST_AGENT = '00002') AS V
                      WHERE  RNUM BETWEEN 1 AND 10;
    `;
    const result = await request.query(query);
    return result.recordset;
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







