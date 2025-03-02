const sql = require("mssql");
const pool = require("../../config/db");

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

    if (carNo) request.input("CAR_NO", sql.VarChar, carNo);
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
                ${carNo ? "AND CAR_NO = @CAR_NO" : ""}
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

// 현금영수증 사전 데이터 조회
exports.getCashBillPreData = async () => {
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
      WHERE  RNUM BETWEEN 1 AND 50;
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching cash bill pre data:", err);
    throw err;
  }
};
