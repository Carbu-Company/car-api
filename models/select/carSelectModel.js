const sql = require("mssql");
const pool = require("../../config/db");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 매입 매도비 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 매입 매도비 목록 조회
exports.getBuySellFeeList = async ({ carAgent }) => {
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
    return result.recordset[0]; 
  } catch (err) {
    console.error("Error fetching buy sell fee sum:", err);
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

    const query = ` SELECT *
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
exports.SuggestSelectData = async ({
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
    if (customerName)
      request.input("CUSTOMER_NAME", sql.VarChar, `%${customerName}%`); // LIKE 검색 적용
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
exports.getAgentSellFeeList = async () => {
  try {
    const request = pool.request();
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
exports.getAgentProfitList = async () => {
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
                      WHERE  INDEXCD = 81
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

// 상사 수익 항목 조회  (공통코드)
exports.getCompanyProfitList = async () => {
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
                      WHERE  INDEXCD = 81
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


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 현금영수증
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 현금영수증 목록 데이터 조회
exports.getCashBillList = async () => {
  try {
    const request = pool.request();
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
// 판매
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 판매 내역 조회
exports.getSellPreData = async () => {
  try {
    const request = pool.request();
    const query = `
        SELECT *
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
                WHERE  CAR_AGENT = '00002'
                      AND A.CAR_DELGUBN = '0'
                      AND CAR_STATUS IN ( '002', '003' )) AS V
        WHERE  RNUM BETWEEN 1 AND 10 	   
        ;
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching sell pre data:", err);
    throw err;
  }
};

