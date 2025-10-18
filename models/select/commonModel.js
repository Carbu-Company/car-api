const sql = require("mssql");
const pool = require("../../config/db");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 공통
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// 관리키 조회  dbo.SMJ_FN_MK_REGID   car_reg_id 값 만드는 함수 
exports.getMgtKey = async ({ agentId }) => {
    try {
      const request = pool.request();
      request.input("agentId", sql.VarChar, agentId);
  
      const query = `
        SELECT DBO.SMJ_FN_MK_MGTKEY(A.AGENT_ID) AS MgtKey,
               AGENT_NM AS FranchiseCorpName
          FROM CJB_AGENT A,
               CJB_USR B
         WHERE A.AGENT_ID = B.AGENT_ID
           AND B.USR_GRADE_CD = '9'
           AND A.AGENT_ID = @agentId;
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
  exports.getDealerList = async ({ agentId }) => {
    try {
      const request = pool.request();
      request.input("CAR_AGENT", sql.VarChar, agentId);
  
      const query = `SELECT USR_ID,
                       USR_NM,
                       USR_PHON,
                       USR_EMAIL,
                       USR_ENTR_DT,     -- 입사일
                       ZIP,
                       ADDR1,
                       ADDR2,
                       USR_STAT_CD,
                       dbo.CJB_FN_GET_CD_NM('25', A.USR_STAT_CD) USR_STAT_NM
                    FROM   dbo.CJB_USR A
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
  exports.getDealerDetailList = async ({ agentId }) => {
    try {
      const request = pool.request();
      request.input("CAR_AGENT", sql.VarChar, agentId);
  
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
                       FROM dbo.CJB_COMM_CD
                      WHERE GRP_CD = @GRP_CD
                        AND USE_YN = 'Y'
                      ORDER BY CD;
      `;
      const result = await request.query(query);
      return result.recordset;
    } catch (err) {
      console.error("Error fetching CD list:", err);
      throw err;
    }
  };
  

  
  // 공통코드 조회
  exports.getCDAllList = async ({ grpCD }) => {
    try {
      const request = pool.request();
      request.input("GRP_CD", sql.VarChar, grpCD);
  
      const query = `SELECT CD
                          , CD_NM
                          , CD_NM2
                          , ADD_CD
                          , USE_YN
                          , SORT_SEQ
                          , FIX_YN
                          , REGR_ID
                          , REG_DTIME
                          , MODR_ID
                          , MODR_DTIME
                       FROM dbo.CJB_COMM_CD
                      WHERE GRP_CD = @GRP_CD
                      ORDER BY SORT_SEQ;
      `;
      const result = await request.query(query);
      return result.recordset;
    } catch (err) {
      console.error("Error fetching CD list:", err);
      throw err;
    }
  };
  
 
  // 공통코드 상세 조회
  exports.getCDDetail = async ({ cd }) => {
    try {
      const request = pool.request();
      request.input("CD", sql.VarChar, cd);
  
      const query = `SELECT CD
                          , CD_NM
                          , CD_NM2
                          , ADD_CD
                          , USE_YN
                          , SORT_SEQ
                          , FIX_YN
                          , REGR_ID
                          , REG_DTIME
                          , MODR_ID
                          , MODR_DTIME
                       FROM dbo.CJB_COMM_CD
                      WHERE CD = @CD
                      ORDER BY CD;
      `;
      const result = await request.query(query);
      return result.recordset;
    } catch (err) {
      console.error("Error fetching CD list:", err);
      throw err;
    }
  };
  


  // 공통코드 저장
  exports.insertCommCd = async ({ 
    grpCd
    , cd
    , addCd
    , cdNm
    , useYn
    , sortSeq
    , cdNm2
    , fixYn
    , usrId
  }) => {
    try {
      const request = pool.request();
      request.input("GRP_CD", sql.VarChar, grpCd);
      request.input("CD", sql.VarChar, cd);
      request.input("ADD_CD", sql.VarChar, addCd);
      request.input("CD_NM", sql.VarChar, cdNm);
      request.input("USE_YN", sql.VarChar, useYn);
      request.input("SORT_SEQ", sql.Int, sortSeq);
      request.input("CD_NM2", sql.VarChar, cdNm2);
      request.input("FIX_YN", sql.VarChar, fixYn);
      request.input("REGR_ID", sql.VarChar, usrId);
      request.input("MODR_ID", sql.VarChar, usrId);

      const query = `
        INSERT INTO dbo.CJB_COMM_CD
            ( GRP_CD,
              CD,
              ADD_CD,
              CD_NM,
              USE_YN,
              SORT_SEQ,
              CD_NM2,
              FIX_YN,
              REGR_ID,
              MODR_ID ) 
        VALUES 
          ( @GRP_CD,
            @CD,
            @ADD_CD,
            @CD_NM,
            @USE_YN,
            @SORT_SEQ,
            @CD_NM2,
            @FIX_YN,
            @REGR_ID,
            @MODR_ID
          );
      `;
      await request.query(query);

      return { success: true };
    } catch (err) {
      console.error("Error inserting comm cd:", err);
      throw err;
    }
  }

  // 공통코드 수정
  exports.updateCommCd = async ({ 
    grpCd
    , cd
    , addCd
    , cdNm
    , useYn
    , sortSeq
    , cdNm2
    , fixYn
    , usrId
  }) => {
    try {
      const request = pool.request();

      request.input("GRP_CD", sql.VarChar, grpCd);
      request.input("CD", sql.VarChar, cd);
      request.input("ADD_CD", sql.VarChar, addCd);
      request.input("CD_NM", sql.VarChar, cdNm);
      request.input("USE_YN", sql.VarChar, useYn);
      request.input("SORT_SEQ", sql.Int, sortSeq);
      request.input("CD_NM2", sql.VarChar, cdNm2);
      request.input("FIX_YN", sql.VarChar, fixYn);
      request.input("REGR_ID", sql.VarChar, usrId);
      request.input("MODR_ID", sql.VarChar, usrId);

      const query = `
        UPDATE dbo.CJB_USR
           SET ADD_CD = @ADD_CD,
               CD_NM = @CD_NM,
               USE_YN = @USE_YN,
               SORT_SEQ = @SORT_SEQ,
               CD_NM2 = @CD_NM2,
               FIX_YN = @FIX_YN,
               MOD_DTIME = getdate(),
               MODR_ID = @MODR_ID
        WHERE GRP_CD = @GRP_CD 
          AND CD = @CD
      `;

      await request.query(query);

      return { success: true };
    } catch (err) {
      console.error("Error updating comm cd:", err);
      throw err;
    }
  }

// 고객 목록 조회
/*
exports.getCustomerList = async ({ agentId, search }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, agentId);
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


*/

exports.getCustomerList = async ({ agentId, custNm }) => {
  try {

    const request = pool.request();

    console.log('agentId:', agentId);
    console.log('custNm:', custNm);

    request.input("CAR_AGENT", sql.VarChar, agentId);
    request.input("CUST_NM", sql.VarChar, custNm);

    const query = `SELECT CUST_NO
                        , CUST_NM
                        , CUST_TP_CD
                        , CUST_PHON
                        , CUST_EMAIL
                        , SSN
                        , BRNO
                        , ZIP
                        , ADDR1
                        , ADDR2
                        , MOD_DTIME
                        FROM  dbo.CJB_CUST A
                        WHERE AGENT_ID = @CAR_AGENT
                          AND CUST_NM LIKE '%' + @CUST_NM + '%'
                        ORDER BY CUST_NM;
    `;

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching customer list:", err);
    throw err;
  }
};


exports.getCarList = async ({ 
  agentId, 
  page,
  pageSize,
  carNo,
  dealer,
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
    console.log('orderItem:', orderItem);
    console.log('ordAscDesc:', ordAscDesc);
*/
    request.input("CAR_AGENT", sql.VarChar, agentId);
    request.input("PAGE_SIZE", sql.Int, pageSize);
    request.input("PAGE", sql.Int, page);


    if (carNo) request.input("CAR_NO", sql.VarChar, `%${carNo}%`);
    if (dealer) request.input("DEALER", sql.VarChar, `%${dealer}%`);


    // 전체 카운트 조회
    const countQuery = `
    SELECT COUNT(*) as totalCount
              FROM dbo.CJB_CAR_PUR A
            WHERE AGENT_ID = @CAR_AGENT
              AND CAR_DEL_YN = 'N'
              ${carNo ? "AND CAR_NO LIKE @CAR_NO" : ""}
              ${dealer ? "AND DLR_ID LIKE @DEALER" : ""}
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


// 상사 대출 업체 대출 한도

exports.getCompanyLoanLimit = async ({ agentId }) => { 
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, agentId);

    const query = `SELECT LOAN_CORP_CD
                        , LOAN_CORP_NM
                        , A.TOT_LMT_AMT    -- 총 대출한도액
                        , A.TOT_LOAN_AMT   -- 총 대출액
                      FROM dbo.CJB_AGENT_LOAN_CORP A
                        , dbo.CJB_COMM_CD B
                    WHERE A.AGENT_ID  = @CAR_AGENT
                      AND A.LOAN_CORP_CD = B.CD
                      AND B.GRP_CD = '05'
                    ORDER BY A.SORT_SEQ;
                    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching company loan limit:", err);
    throw err;
  }
};

// 상사정보관리 조회
exports.getAgentInfo = async ({ agentId }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, agentId);

    const query = `SELECT AGENT_NM  AS COMNAME
                        , DBO.SMJ_FN_DATEFMT('D', A.REG_DTIME ) REGDATE
                        , BRNO
                        , PRES_NM 
                        , SUBSTRING(EMAIL, 1, CHARINDEX('@', EMAIL) - 1) AS EMAIL_ID
                        , SUBSTRING(EMAIL, CHARINDEX('@', EMAIL) + 1, LEN(EMAIL)) AS EMAIL_DOMAIN
                        , AGRM_AGR_YN
                        , FIRM_YN
                        , AGENT_STAT_CD
                        , dbo.SMJ_FN_GETCDNAME('06', AGENT_STAT_CD) AS AGENT_STAT_CD_NM
                        , PHON
                        , FAX
                        , ZIP
                        , ADDR1
                        , ADDR2
                        , FEE_SCT_CD
                        , CMBT_AGENT_CD
                        , CMBT_AGENT_STAT_NM
                    FROM dbo.CJB_AGENT A
                    WHERE A.AGENT_ID = @CAR_AGENT`;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching agent info:", err);
    throw err;
  }
};
