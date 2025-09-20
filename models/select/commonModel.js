const sql = require("mssql");
const pool = require("../../config/db");

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
                          , CD_NM2
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
