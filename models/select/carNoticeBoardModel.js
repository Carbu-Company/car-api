const sql = require("mssql");
const pool = require("../../config/db");


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 공지 게시판 2.0  
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 공지 목록 조회 
exports.getNoticeList = async ({ 
    agentId, 
    page,
    pageSize,
    ntcTitNm,
    ntcCont,
    orderItem = '01',
    ordAscDesc = 'desc'
  }) => {
    try {
      const request = pool.request();
  /*
      console.log('agentId:', agentId);
      console.log('pageSize:', pageSize);
      console.log('page:', page);

      console.log('orderItem:', faqTitNm);
      console.log('orderItem:', faqBody);

      console.log('orderItem:', orderItem);
      console.log('ordAscDesc:', ordAscDesc);
  */
      request.input("CAR_AGENT", sql.VarChar, agentId);
      request.input("PAGE_SIZE", sql.Int, pageSize);
      request.input("PAGE", sql.Int, page);

      if (ntcTitNm) request.input("NTC_TIT_NM", sql.VarChar, `%${ntcTitNm}%`);
      if (ntcCont) request.input("NTC_CONT", sql.VarChar, `%${ntcCont}%`);
  
      // 전체 카운트 조회
      const countQuery = `
      SELECT COUNT(*) as totalCount
                FROM dbo.CJB_NOTICE_BOARD A
                 WHERE  A.AGENT_ID = @CAR_AGENT
      `;
    
      const dataQuery = `
                SELECT A.NTC_NO
                    , A.NTC_TIT_NM
                    , A.NTC_CONT
                    , A.REG_DTIME
                    , A.REGR_ID
                    , A.MOD_DTIME
                    , A.MODR_ID
                  FROM dbo.CJB_NOTICE_BOARD A
                 WHERE A.AGENT_ID = @CAR_AGENT
                   AND A.USE_YN = 'Y'
      ${ntcTitNm ? "AND A.NTC_TIT_NM LIKE @NTC_TIT_NM" : ""}
      ${ntcCont ? "AND A.NTC_CONT LIKE @NTC_CONT" : ""}      
      ORDER BY ${orderItem === '01' ? 'A.REG_DTIME' : 'A.NTC_NO'} ${ordAscDesc}
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
        ntclist: dataResult.recordset,
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
      console.error("Error fetching notice board list:", err);
      throw err;
    }
  };

  // 공지 조회
  exports.getNoticeDetail = async ({ ntcNo }) => {
    try {
      const request = pool.request();

      console.log('*********ntcNo:***************', ntcNo);
      request.input("NTC_NO", sql.Int, ntcNo);   
 
      const query = `SELECT A.NTC_NO
                    , A.NTC_TIT_NM
                    , A.NTC_CONT
                    , A.REG_DTIME
                    , A.REGR_ID
                    , A.MOD_DTIME
                    , A.MODR_ID
                  FROM dbo.CJB_NOTICE_BOARD A
                 WHERE A.NTC_NO = @NTC_NO `;
  
      console.log('query:', query);
  
      const result = await request.query(query);
      return result.recordset[0];
    } catch (err) {
      console.error("Error fetching notice board detail:", err);
      throw err;
    }
  };

  // 공지 저장
  exports.insertNoticeBoard = async ({ 
    ntcTitNm,
    ntcCont,
    usrId
    }) => {
    try {
      const request = pool.request();
      request.input("NTC_TIT_NM", sql.VarChar, ntcTitNm);
      request.input("NTC_CONT", sql.VarChar, ntcCont);
      request.input("REGR_ID", sql.VarChar, usrId);
      request.input("MODR_ID", sql.VarChar, usrId);

      const query = `
        INSERT INTO dbo.CJB_NOTICE_BOARD
            ( NTC_TIT_NM,
              NTC_CONT,
              REGR_ID,
              MODR_ID ) 
        VALUES 
          ( @NTC_TIT_NM,
            @NTC_CONT,
            @REGR_ID,
            @MODR_ID
          );
      `;
      await request.query(query);

      return { success: true };
    } catch (err) {
      console.error("Error inserting notice board detail:", err);
      throw err;
    }
  }


  // 공지 수정
  exports.updateNoticeBoard = async ({ 
    ntcNo, 
    ntcTitNm,
    ntcCont,
    usrId
  }) => {
    try {
      const request = pool.request();

      request.input("NTC_NO", sql.VarChar, ntcNo);  
      request.input("NTC_TIT_NM", sql.VarChar, ntcTitNm);
      request.input("NTC_CONT", sql.VarChar, ntcCont);
      request.input("MODR_ID", sql.VarChar, usrId);

      const query = `
        UPDATE dbo.CJB_NOTICE_BOARD
           SET NTC_TIT_NM = @NTC_TIT_NM,
               NTC_CONT = @NTC_CONT,
               MOD_DTIME = getdate(),
               MODR_ID = @MODR_ID
        WHERE 
          NTC_NO = @NTC_NO 
      `;

      await request.query(query);

      return { success: true };
    } catch (err) {
      console.error("Error updating notice board detail:", err);
      throw err;
    }
  }
