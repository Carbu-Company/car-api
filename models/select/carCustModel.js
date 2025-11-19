const sql = require("mssql");
const pool = require("../../config/db");


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 계좌 2.0
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 고객 목록 조회 
exports.getCarCustList = async ({ 
    agentId, 
    page,
    pageSize,
    custNm,
    custPhon,
    orderItem = '01',
    ordAscDesc = 'desc'
  }) => {
    try {
      const request = pool.request();
  /*
      console.log('agentId:', agentId);
      console.log('pageSize:', pageSize);
      console.log('page:', page);
  
      console.log('custNm:', custNm);
      console.log('custPhon:', custPhon);
  */
      request.input("AGENT_ID", sql.VarChar, agentId);
      request.input("PAGE_SIZE", sql.Int, pageSize);
      request.input("PAGE", sql.Int, page);
  
  
      if (custNm) request.input("CUST_NM", sql.VarChar, `%${custNm}%`);
      if (custPhon) request.input("CUST_PHON", sql.VarChar, `%${custPhon}%`);
  
      // 전체 카운트 조회
      const countQuery = `
      SELECT COUNT(*) as totalCount
                FROM dbo.CJB_CUST A
                 WHERE  A.AGENT_ID = @AGENT_ID
                ${custNm ? "AND B.CUST_NM LIKE @CUST_NM" : ""}
                ${custPhon ? "AND B.CUST_PHON LIKE @CUST_PHON" : ""}
      `;
    
      const dataQuery = `
                SELECT A.CUST_NO     -- 고객번호
                          , A.CUST_NM
                          , A.CUST_TP_CD
                          , A.CUST_PHON
                          , A.CUST_EMAIL
                          , A.SSN
                          , A.BRNO
                          , A.ZIP
                          , A.ADDR1
                          , A.ADDR2
                          , A.MODR_ID
                FROM dbo.CJB_CUST A
                 WHERE  A.AGENT_ID = @AGENT_ID
                ${custNm ? "AND B.CUST_NM LIKE @CUST_NM" : ""}
                ${custPhon ? "AND B.CUST_PHON LIKE @CUST_PHON" : ""}
      OFFSET (@PAGE - 1) * @PAGE_SIZE ROWS
      FETCH NEXT @PAGE_SIZE ROWS ONLY;`;
  
      // 두 쿼리를 동시에 실행
      const [countResult, dataResult] = await Promise.all([
        request.query(countQuery),
        request.query(dataQuery)
      ]);
  
      // Handle case where countResult or countResult.recordset is undefined or empty
      const totalCount = countResult && countResult.recordset && countResult.recordset.length > 0 && countResult.recordset[0].totalCount !== undefined
        ? countResult.recordset[0].totalCount
        : 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        carlist: dataResult && dataResult.recordset ? dataResult.recordset : [],
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
      console.error("Error fetching cust list:", err);
      throw err;
    }
  };
  
  // 고객 상세 조회
  exports.getCarCustDetail = async ({ custNo }) => {
    try {
      const request = pool.request();
      request.input("CUST_NO", sql.VarChar, custNo);   
  
      const query = `SELECT A.AGENT_ID     -- 상사 UID
                          , A.CUST_NM
                          , A.CUST_TP_CD
                          , A.CUST_PHON
                          , A.CUST_EMAIL
                          , A.SSN
                          , A.BRNO
                          , A.ZIP
                          , A.ADDR1
                          , A.ADDR2
                          , A.MODR_ID
                        FROM dbo.CJB_CUST A
                        WHERE A.CUST_NO = B.CUST_NO `;
  
      console.log('query:', query);
  
      const result = await request.query(query);
      return result.recordset[0];
    } catch (err) {
      console.error("Error fetching cust detail:", err);
      throw err;
    }
  };


  // 고객 정보 저장
  exports.insertCarCust = async ({ 
    agentId, 
    custNm,
    custTpCd,
    custPhon,
    custEmail,
    ssn,
    brno,
    zip,
    addr1,
    addr2,
    usrId
  }) => {
    try {
      const request = pool.request();

      console.log("agentId****************:", agentId);

      /**
       * 고객번호 획득
       */
      // car_reg_id 값도 미리 만들기
      request.input("agentId", sql.VarChar, agentId); 
      const custId = await request.query(`SELECT dbo.CJB_FN_MK_CUST_NO(@agentId) as CUST_NO`);
      const newCustId = custId.recordset[0].CUST_NO;

      request.input("CUST_NO", sql.VarChar, newCustId);
      request.input("AGENT_ID", sql.VarChar, agentId);
      request.input("CUST_NM", sql.VarChar, custNm);     
      request.input("CUST_TP_CD", sql.VarChar, custTpCd);
      request.input("CUST_PHON", sql.VarChar, custPhon);
      request.input("CUST_EMAIL", sql.VarChar, custEmail);
      request.input("SSN", sql.VarChar, ssn);
      request.input("BRNO", sql.VarChar, brno);
      request.input("ZIP", sql.VarChar, zip);
      request.input("ADDR1", sql.VarChar, addr1);
      request.input("ADDR2", sql.VarChar, addr2);
      request.input("REGR_ID", sql.VarChar, usrId);
      request.input("MODR_ID", sql.VarChar, usrId);

      const query = `
        INSERT INTO dbo.CJB_CUST
          ( CUST_NO,
            AGENT_ID,
            CUST_NM,
            CUST_TP_CD,
            CUST_PHON,
            CUST_EMAIL,
            SSN,
            BRNO,
            ZIP,
            ADDR1,
            ADDR2,
            REGR_ID,
            MODR_ID ) 
        VALUES 
          ( @CUST_NO,
            @AGENT_ID,
            @CUST_NM,
            @CUST_TP_CD,
            @CUST_PHON,
            @CUST_EMAIL,
            @SSN,
            @BRNO,
            @ZIP,
            @ADDR1,
            @ADDR2,
            @REGR_ID,
            @MODR_ID
          );
      `;
      await request.query(query);

      return { custNo : newCustId };
    } catch (err) {
      console.error("Error inserting cust info:", err);
      throw err;
    }
  }


  // 고객 상세 조회

  /**
   * 고객 정보 조회 - 사용하지 말고,, 그냥 고객정보를 저장처리.
   * @param {고객명, 주민번호, 사업자번호, 연락처} param0 
   * @returns {고객정보}
   */
  exports.getCarCustExist = async ({ custNm, ssn, brno, custPhon }) => {
    try {
      const request = pool.request();
      
      if (custNm) request.input("SSN", sql.VarChar, `%${custNm}%`);
      if (ssn) request.input("SSN", sql.VarChar, `%${ssn}%`);
      if (brno) request.input("BRNO", sql.VarChar, `%${brno}%`);
      if (custPhon) request.input("CUST_PHON", sql.VarChar, `%${custPhon}%`);

      const query = `SELECT TOP 1 A.AGENT_ID     -- 상사 UID
                          , A.CUST_NM
                          , A.CUST_TP_CD
                          , A.CUST_PHON
                          , A.CUST_EMAIL
                          , A.SSN
                          , A.BRNO
                          , A.ZIP
                          , A.ADDR1
                          , A.ADDR2
                          , A.MODR_ID
                        FROM dbo.CJB_CUST A   
                ${custNm ? "AND CUST_NM LIKE @CUST_NM" : ""}                   -- 
                ${ssn ? "AND SSN LIKE @SSN" : ""}                       -- 
                ${brno ? "AND BRNO LIKE @BRNO" : ""}              -- 
                ${custPhon ? "AND CUST_PHON LIKE @CUST_PHON" : ""}    -- 
                     ;`;

      console.log('query:', query);
  
      const result = await request.query(query);
      return result.recordset[0];
    } catch (err) {
      console.error("Error fetching cust exist:", err);
      throw err;
    }
  };
