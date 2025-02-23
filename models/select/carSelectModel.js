const sql = require("mssql");
const pool = require("../../config/db");

// 차량 조회
exports.getCars = async ({ carAgent }) => {
  try {
    const request = pool.request();
    request.input("carAgent", sql.VarChar, carAgent);

    const query = `
        SELECT
            *
        FROM (
                 SELECT
                     ROW_NUMBER() OVER(ORDER BY CAR_BUYDATE DESC, CAR_REGDATE DESC) AS rnum,
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
                     BUY_TOTAL_FEE,
                     DATEDIFF(DAY, CAR_BUYDATE, DATEADD(DAY, 1, GETDATE())) AS IsDay,
                     dbo.SMJ_FN_CPTSEQNO(CAR_REGID) AS CPTSEQNO,
                     CAR_DELGUBN,
                     BUY_REAL_FEE,
                     BUY_TOTAL_FEE - BUY_REAL_FEE AS Minap,
                     '(' + BUY_ZIP + ') ' + BUY_ADDR1 + ' ' + BUY_ADDR2 AS ADDR,
                     BUY_NOTIAMT,
                     CASE CAR_GUBN
                         WHEN '0' THEN '상사'
                         WHEN '1' THEN '고객'
                         ELSE ''
                         END AS CAR_GUBN_NAME,
                     CASE WHEN CAR_LOANSUM > 0 THEN CAR_LOANSUM ELSE '' END AS loansumamt,
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
                     BUY_BOHEOMAMT,
                     BUY_TAX15
                 FROM SMJ_MAINLIST
                 WHERE
                     CAR_AGENT = @carAgent
                   AND CAR_STATUS = '001'
             ) a
    `;

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching cars:", err);
    throw err;
  }
};

// 관리키 조회
exports.getMgKey = async ({ carAgent }) => {
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
