const sql = require("mssql");
const pool = require("../../config/db");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 상사 2.0
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 상사 내역 목록 조회 
exports.getCarAgentList = async ({ 
    carAgent, 
    page,
    pageSize,
    agentNm, 
    brno,
    presNm,
    agentStatCd,
    cmbtAgentCd,
    orderItem = '01',
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
      console.log('dtlCarNm:', dtlCarNm);
      console.log('dtlTradeSctNm:', dtlTradeSctNm);
      console.log('dtlTradeItemCd:', dtlTradeItemCd);
      console.log('dtlAgentAcctNo:', dtlAgentAcctNo);
      console.log('dtlTradeMemo:', dtlTradeMemo);
      console.log('dtlDtlMemo:', dtlDtlMemo);
      console.log('orderItem:', orderItem);
      console.log('ordAscDesc:', ordAscDesc);
  */
      request.input("CAR_AGENT", sql.VarChar, carAgent);
      request.input("PAGE_SIZE", sql.Int, pageSize);
      request.input("PAGE", sql.Int, page);
    
      if (agentNm) request.input("AGENT_NM", sql.VarChar, `%${agentNm}%`);
      if (brno) request.input("BRNO", sql.VarChar, `%${brno}%`);
      if (presNm) request.input("PRES_NM", sql.VarChar, `%${presNm}%`);
      if (agentStatCd) request.input("AGENT_STAT_CD", sql.VarChar, agentStatCd);
      if (cmbtAgentCd) request.input("CMBT_AGENT_CD", sql.VarChar, `%${cmbtAgentCd}%`);
  
      // 전체 카운트 조회
      const countQuery = `
      SELECT COUNT(*) as totalCount
                FROM dbo.CBJ_AGENT A
                 WHERE  1= 1
                ${agentNm ? "AND A.AGENT_NM LIKE @AGENT_NM" : ""}
                ${brno ? "AND A.BRNO LIKE @BRNO" : ""}
                ${presNm ? "AND A.PRES_NM LIKE @PRES_NM" : ""}
                ${agentStatCd ? "AND A.AGENT_STAT_CD = @AGENT_STAT_CD" : ""}
                ${cmbtAgentCd ? "AND A.CMBT_AGENT_CD LIKE @CMBT_AGENT_CD" : ""}
      `;
    
      const dataQuery = `
                SELECT B.ACCT_DTL_SEQ
                    , CONVERT(VARCHAR(19), B.TRADE_DTIME, 20) TRADE_DTIME
                    , B.TRADE_SCT_NM
                    , B.ACCT_NO 
                    , (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = C.DLR_ID)  + ' / ' + C.SALE_CAR_NO + ' / ' + D.CAR_NM AS CAR_INFO_NM
                    , C.SALE_CAR_NO 
                    , B.TRADE_ITEM_CD
                    , B.TRADE_ITEM_NM
                    , CONVERT(int, ISNULL(B.IAMT, '0')) IAMT 
                    , CONVERT(int, ISNULL(B.OAMT, '0')) OAMT 
                    , CONVERT(int, ISNULL(B.BLNC, '0')) BLNC 
                    , B.TRADE_MEMO 
                    , B.DTL_MEMO
                  FROM dbo.CBJ_AGENT A
                 WHERE 1 = 1
                ${agentNm ? "AND A.AGENT_NM LIKE @AGENT_NM" : ""}
                ${brno ? "AND A.BRNO LIKE @BRNO" : ""}
                ${presNm ? "AND A.PRES_NM LIKE @PRES_NM" : ""}
                ${agentStatCd ? "AND A.AGENT_STAT_CD = @AGENT_STAT_CD" : ""}
                ${cmbtAgentCd ? "AND A.CMBT_AGENT_CD LIKE @CMBT_AGENT_CD" : ""}
      ORDER BY ${orderItem === '01' ? 'A.REG_DTIME' : 'B.AGENT_NM'} ${ordAscDesc}
      OFFSET (@PAGE - 1) * @PAGE_SIZE ROWS
      FETCH NEXT @PAGE_SIZE ROWS ONLY;`;

      console.log('dataQuery:', dataQuery);
  
      // 두 쿼리를 동시에 실행
      const [countResult, dataResult] = await Promise.all([
        request.query(countQuery),
        request.query(dataQuery)
      ]);
  
      const totalCount = countResult.recordset[0].totalCount;
      const totalPages = Math.ceil(totalCount / pageSize);
  
      return {
        dataList: dataResult.recordset,
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
  
  // 상사 합계 조회
  exports.getCarAdjSummary = async ({  
    carAgent, 
    page,
    pageSize,
    agentNm, 
    brno,
    presNm,
    agentStatCd,
    cmbtAgentCd,
    orderItem = '01',
    ordAscDesc = 'desc'
  }) => {
    try {
      const request = pool.request();
  
      console.log('carAgent:', carAgent);
      console.log('pageSize:', pageSize);
      console.log('page:', page);
  
      console.log('agentNm:', agentNm);
      console.log('brno:', brno);
      console.log('presNm:', presNm);
      console.log('agentStatCd:', agentStatCd);
      console.log('cmbtAgentCd:', cmbtAgentCd);
      console.log('orderItem:', orderItem);
      console.log('ordAscDesc:', ordAscDesc);
  
      request.input("CAR_AGENT", sql.VarChar, carAgent);
      request.input("PAGE_SIZE", sql.Int, pageSize);
      request.input("PAGE", sql.Int, page);
    
      if (agentNm) request.input("AGENT_NM", sql.VarChar, `%${agentNm}%`);
      if (brno) request.input("BRNO", sql.VarChar, `%${brno}%`);
      if (presNm) request.input("PRES_NM", sql.VarChar, `%${presNm}%`);
      if (agentStatCd) request.input("AGENT_STAT_CD", sql.VarChar, agentStatCd);
      if (cmbtAgentCd) request.input("CMBT_AGENT_CD", sql.VarChar, `%${cmbtAgentCd}%`);
  
      const query = `SELECT SUM(I_CNT) AS I_CNT
                          , SUM(O_CNT) AS O_CNT
                       FROM (SELECT COUNT(A.AGENT_CD) AS I_CNT
                                  , COUNT(A.AGENT_CD) AS O_CNT
                              FROM dbo.CJB_AGENT A
                             WHERE 1 = 1
                               AND A.REG_DTIME > DATEADD(day, 0, CONVERT(date, GETDATE()))
                              $${agentNm ? "AND A.AGENT_NM LIKE @AGENT_NM" : ""}
                              ${brno ? "AND A.BRNO LIKE @BRNO" : ""}
                              ${presNm ? "AND A.PRES_NM LIKE @PRES_NM" : ""}
                              ${agentStatCd ? "AND A.AGENT_STAT_CD = @AGENT_STAT_CD" : ""}
                              ${cmbtAgentCd ? "AND A.CMBT_AGENT_CD LIKE @CMBT_AGENT_CD" : ""}
                            UNION ALL
                            SELECT  COUNT(A.AGENT_CD) AS I_CNT
                                  , COUNT(A.AGENT_CD) AS O_CNT
                               FROM dbo.CJB_AGENT A
                             WHERE 1 = 1
                              AND A.REG_DTIME >= DATEADD(day, -1, CONVERT(date, GETDATE())) 
                              AND A.REG_DTIME <  DATEADD(day, 0, CONVERT(date, GETDATE()))
                              ${agentNm ? "AND A.AGENT_NM LIKE @AGENT_NM" : ""}
                              ${brno ? "AND A.BRNO LIKE @BRNO" : ""}
                              ${presNm ? "AND A.PRES_NM LIKE @PRES_NM" : ""}
                              ${agentStatCd ? "AND A.AGENT_STAT_CD = @AGENT_STAT_CD" : ""}
                              ${cmbtAgentCd ? "AND A.CMBT_AGENT_CD LIKE @CMBT_AGENT_CD" : ""}
                            UNION ALL
                            SELECT  COUNT(A.AGENT_CD) AS I_CNT
                                  , COUNT(A.AGENT_CD) AS O_CNT
                              FROM dbo.CJB_AGENT A
                            WHERE 1 = 1
                              ${agentNm ? "AND A.AGENT_NM LIKE @AGENT_NM" : ""}
                              ${brno ? "AND A.BRNO LIKE @BRNO" : ""}
                              ${presNm ? "AND A.PRES_NM LIKE @PRES_NM" : ""}
                              ${agentStatCd ? "AND A.AGENT_STAT_CD = @AGENT_STAT_CD" : ""}
                              ${cmbtAgentCd ? "AND A.CMBT_AGENT_CD LIKE @CMBT_AGENT_CD" : ""}
                      ) A`;
        
      
      console.log('query:', query);

      const result = await request.query(query);
      return result.recordset;
    } catch (err) {
      console.error("Error fetching car pur sum:", err);
      throw err;
    }
  };
  
  // 상사 상세 조회
  exports.getCarAgentDetail = async ({ carRegId }) => {
    try {
      const request = pool.request();

      request.input("carRegId", sql.VarChar, carRegId);   
      console.log('carRegId:', carRegId);
  
      const query = `SELECT ACCT_DTL_SEQ     -- 계좌 내역 순번
                          , A.BNK_CD       -- 은행코드
                          , (SELECT TOP 1 CD_NM FROM dbo.CJB_COMM_CD WHERE GRP_CD = '09' AND CD = A.BNK_CD) BNK_NM  -- 은행명
                          , A.ACCT_NO      -- 계좌번호
                          , A.ACCT_NM      -- 계좌명
                          , A.ACCT_HLDR    -- 예금주
                          , A.MAST_YN
                          , B.TID
                          , B.TRADE_DT
                          , B.TRADE_SN
                          , B.TRADE_SCT_NM
                          , B.TRADE_RMRK_NM
                          , B.TRADE_ITEM_CD
                          , B.TRADE_ITEM_NM
                          , CONVERT(VARCHAR(19), B.TRADE_DTIME, 20) TRADE_DTIME 
                          , B.IAMT
                          , B.OAMT
                          , B.BLNC
                          , B.NOTE1
                        FROM dbo.CJB_AGENT A
                        WHERE AGENT_CD = @AGENT_CD `;
  
      console.log('query:', query);
  
      const result = await request.query(query);
      return result.recordset[0];
    } catch (err) {
      console.error("Error fetching car pur detail:", err);
      throw err;
    }
  };


  // 상사 저장 
  exports.insertCarAgent = async ({ 
    agentNm, 
    brno, 
    presNm, 
    email, 
    agrmAgrYn, 
    firmYn,
    agentStatCd,
    phon,
    fax,
    zip,
    addr1,
    addr2,
    feeSctCd,
    cmbtAgentCd,
    cmbtAgentStatNm,
    usrId
  }) => {
    try {

      const request = pool.request();

      // car_reg_id 값도 미리 만들기
      const newAgentId = await request.query(`SELECT dbo.CJB_FN_AGENT() as AGENT_ID`);
      const AgentId = newAgentId.recordset[0].AGENT_ID;

      request.input("AGENT_ID", sql.VarChar, AgentId);
      request.input("AGENT_NM", sql.VarChar, agentNm);
      request.input("BRNO", sql.VarChar, brno);
      request.input("PRES_NM", sql.VarChar, presNm);
      request.input("EMAIL", sql.VarChar, email);
      request.input("AGRM_AGR_YN", sql.VarChar, agrmAgrYn);
      request.input("FIRM_YN", sql.VarChar, firmYn);
      request.input("AGENT_STAT_CD", sql.VarChar, agentStatCd);
      request.input("PHON", sql.VarChar, phon);
      request.input("FAX", sql.VarChar, fax);
      request.input("ZIP", sql.VarChar, zip);
      request.input("ADDR1", sql.VarChar, addr1);
      request.input("ADDR2", sql.VarChar, addr2);
      request.input("FEE_SCT_CD", sql.VarChar, feeSctCd);
      request.input("CMBT_AGENT_CD", sql.VarChar, cmbtAgentCd);
      request.input("CMBT_AGENT_STAT_CD", sql.VarChar, cmbtAgentStatNm);
      request.input("REGR_ID", sql.VarChar, usrId);
      request.input("MODR_ID", sql.VarChar, usrId);

      const query = `
        INSERT INTO dbo.CJB_AGENT
          ( AGENT_CD,
            AGENT_NM,
            BRNO,
            PRES_NM,
            EMAIL,
            AGRM_AGR_YN,
            FIRM_YN,
            AGENT_STAT_CD,
            PHON,
            FAX,
            ZIP,
            ADDR1,
            ADDR2,
            FEE_SCT_CD,
            CMBT_AGENT_CD,
            CMBT_AGENT_STAT_CD,
            REGR_ID,
            MODR_ID ) 
        VALUES 
          ( @AGENT_CD,
            @AGENT_NM,
            @BRNO,
            @PRES_NM,
            @EMAIL,
            @AGRM_AGR_YN,
            @FIRM_YN,
            @AGENT_STAT_CD,
            @PHON,
            @FAX,
            @ZIP,
            @ADDR1,
            @ADDR2,
            @FEE_SCT_CD,
            @CMBT_AGENT_CD,
            @CMBT_AGENT_STAT_CD,
            @REGR_ID,
            @MODR_ID
          );
      `;
      await request.query(query);

      return { success: true };
    } catch (err) {
      console.error("Error inserting car agent:", err);
      throw err;
    }
  }

  // 상사 수정
  exports.updateCarAgent = async ({ 
    agentId,
    agentNm, 
    brno, 
    presNm, 
    email, 
    agrmAgrYn, 
    firmYn,
    agentStatCd,
    phon,
    fax,
    zip,
    addr1,
    addr2,
    feeSctCd,
    cmbtAgentCd,
    cmbtAgentStatNm,
    usrId
  }) => {
    try {
      const request = pool.request();
      
      request.input("AGENT_ID", sql.VarChar, agentId);
      request.input("AGENT_NM", sql.VarChar, agentNm);
      request.input("BRNO", sql.VarChar, brno);
      request.input("PRES_NM", sql.VarChar, presNm);
      request.input("EMAIL", sql.VarChar, email);
      request.input("AGRM_AGR_YN", sql.VarChar, agrmAgrYn);
      request.input("FIRM_YN", sql.VarChar, firmYn);
      request.input("AGENT_STAT_CD", sql.VarChar, agentStatCd);
      request.input("PHON", sql.VarChar, phon);
      request.input("FAX", sql.VarChar, fax);
      request.input("ZIP", sql.VarChar, zip);
      request.input("ADDR1", sql.VarChar, addr1);
      request.input("ADDR2", sql.VarChar, addr2);
      request.input("FEE_SCT_CD", sql.VarChar, feeSctCd);
      request.input("CMBT_AGENT_CD", sql.VarChar, cmbtAgentCd);
      request.input("CMBT_AGENT_STAT_CD", sql.VarChar, cmbtAgentStatNm);
      request.input("MODR_ID", sql.VarChar, usrId);

      const query = `
        UPDATE dbo.CJB_AGENT
           SET AGENT_NM = @AGENT_NM,
               BRNO = @BRNO,
               PRES_NM = @PRES_NM,
               EMAIL = @EMAIL,
               AGRM_AGR_YN = @AGRM_AGR_YN,
               FIRM_YN = @FIRM_YN,
               PHON = @PHON,
               FAX = @FAX,
               ZIP = @ZIP,
               ADDR1 = @ADDR1,
               ADDR2 = @ADDR2,
               FEE_SCT_CD = @FEE_SCT_CD,
               CMBT_AGENT_CD = @CMBT_AGENT_CD,
               CMBT_AGENT_STAT_CD = @CMBT_AGENT_STAT_CD
               MOD_DTIME = GETDATE(),
               MODR_ID = @MODR_ID
        WHERE 
          AGENT_ID = @AGENT_ID 
      `;

      await request.query(query);

      return { success: true };
    } catch (err) {
      console.error("Error updating car acct detail:", err);
      throw err;
    }
  }


// 상사 삭제 (상태 변경)
exports.deleteAgent = async ({agentId, usrId}) => {
  try {
    const request = pool.request();
    request.input("AGENT_ID", sql.VarChar, agentId);
    request.input("MODR_ID", sql.VarChar, usrId);

    query = `UPDATE dbo.CJB_AGENT
                 SET AGENT_STAT_CD = '004'
                   , MOD_DTIME = GETDATE()
                   , MODR_ID = @MODR_ID
               WHERE AGENT_ID = @AGENT_ID
        `;  

      await request.query(query);

  } catch (err) {
    console.error("Error deleting car pur:", err);
    throw err;
  }
};
