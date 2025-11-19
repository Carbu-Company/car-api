const sql = require("mssql");
const pool = require("../../config/db");


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FAQ 게시판 2.0  ( 댓글 포함 )
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// FAQ 목록 조회 
exports.getFaqList = async ({ 
    agentId, 
    page,
    pageSize,
    faqTitNm,
    faqCont,
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

      if (faqTitNm) request.input("FAQ_TIT_NM", sql.VarChar, `%${faqTitNm}%`);
      if (faqCont) request.input("FAQ_CONT", sql.VarChar, `%${faqCont}%`);
  
      // 전체 카운트 조회
      const countQuery = `
      SELECT COUNT(*) as totalCount
                FROM dbo.CJB_FAQ_BOARD A
                 WHERE  A.AGENT_ID = @CAR_AGENT
      `;
    
      const dataQuery = `
                SELECT A.FAQ_NO
                    , A.FAQ_TIT_NM
                    , A.FAQ_CONT
                    , A.REG_DTIME
                    , A.REGR_ID
                    , A.MOD_DTIME
                    , A.MODR_ID
                  FROM dbo.CJB_FAQ_BOARD A
                 WHERE  A.AGENT_ID = @CAR_AGENT
      ${faqTitNm ? "AND A.FAQ_TIT_NM LIKE @FAQ_TIT_NM" : ""}
      ${faqCont ? "AND A.FAQ_CONT LIKE @FAQ_CONT" : ""}      
      ORDER BY ${orderItem === '01' ? 'A.REG_DTIME' : 'A.FAQ_NO'} ${ordAscDesc}
      OFFSET (@PAGE - 1) * @PAGE_SIZE ROWS
      FETCH NEXT @PAGE_SIZE ROWS ONLY;`;

      console.log('dataQuery:', dataQuery);
  
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
        faqlist: dataResult && dataResult.recordset ? dataResult.recordset : [],
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
      console.error("Error fetching faq board list:", err);
      throw err;
    }
  };

  // FAQ 조회
  exports.getFaqDetail = async ({ faqNo }) => {
    try {
      const request = pool.request();


      console.log('*********faqNo:***************', faqNo);
      request.input("FAQ_NO", sql.Int, faqNo);   
 
      const query = `SELECT A.FAQ_NO
                    , A.FAQ_TIT_NM
                    , A.FAQ_CONT
                    , A.REG_DTIME
                    , A.REGR_ID
                    , A.MOD_DTIME
                    , A.MODR_ID
                  FROM dbo.CJB_FAQ_BOARD A
                 WHERE  A.FAQ_NO = @FAQ_NO `;
  
      console.log('query:', query);
  
      const result = await request.query(query);
      return result.recordset[0];
    } catch (err) {
      console.error("Error fetching faq board detail:", err);
      throw err;
    }
  };

  // FAQ 저장
  exports.insertFaqBoard = async ({ 
    faqTitNm,
    faqCont,
    usrId
    }) => {
    try {
      const request = pool.request();
      request.input("FAQ_TIT_NM", sql.VarChar, faqTitNm);
      request.input("FAQ_CONT", sql.VarChar, faqCont);
      request.input("REGR_ID", sql.VarChar, usrId);
      request.input("MODR_ID", sql.VarChar, usrId);

      const query = `
        INSERT INTO dbo.CJB_FAQ_BOARD
            ( FAQ_TIT_NM,
              FAQ_CONT,
              REGR_ID,
              MODR_ID ) 
        VALUES 
          ( @FAQ_TIT_NM,
            @FAQ_CONT,
            @REGR_ID,
            @MODR_ID
          );
      `;
      await request.query(query);

      return { success: true };
    } catch (err) {
      console.error("Error inserting faq board detail:", err);
      throw err;
    }
  }


  // FAQ 수정
  exports.updateFaqBoard = async ({ 
    faqNo, 
    faqTitNm,
    faqCont,
    usrId
  }) => {
    try {
      const request = pool.request();

      request.input("FAQ_NO", sql.VarChar, faqNo);  
      request.input("FAQ_TIT_NM", sql.VarChar, faqTitNm);
      request.input("FAQ_CONT", sql.VarChar, faqCont);
      request.input("MODR_ID", sql.VarChar, usrId);

      const query = `
        UPDATE dbo.CJB_FAQ_BOARD
           SET FAQ_TIT_NM = @FAQ_TIT_NM,
               FAQ_CONT = @FAQ_CONT,
               MOD_DTIME = getdate(),
               MODR_ID = @MODR_ID
        WHERE 
          FAQ_NO = @FAQ_NO 
      `;

      await request.query(query);

      return { success: true };
    } catch (err) {
      console.error("Error updating faq board detail:", err);
      throw err;
    }
  }

  // 댓글 저장
  exports.insertRplBoard = async ({ 
    faqNo,
    rplCont,
    usrId
    }) => {
    try {
      const request = pool.request();
      request.input("RPL_CONT", sql.VarChar, rplCont);
      request.input("FAQ_NO", sql.VarChar, faqNo);
      request.input("REGR_ID", sql.VarChar, usrId);
      request.input("MODR_ID", sql.VarChar, usrId);

      const query = `
        INSERT INTO dbo.CJB_RPL_BOARD
            ( RPL_CONT,
              FAQ_NO,
              REGR_ID,
              MODR_ID ) 
        VALUES 
          ( @RPL_CONT,
            @FAQ_NO,
            @REGR_ID,
            @MODR_ID
          );
      `;
      await request.query(query);

      return { success: true };
    } catch (err) {
      console.error("Error inserting rpl board detail:", err);
      throw err;
    }
  }

  // 댓글 수정
  exports.updateRplBoard = async ({ 
    rplNo,
    rplCont,
    usrId
  }) => {
    try {
      const request = pool.request();

      request.input("RPL_NO", sql.VarChar, rplNo);  
      request.input("RPL_CONT", sql.VarChar, rplCont);
      request.input("MODR_ID", sql.VarChar, usrId);

      const query = `
        UPDATE dbo.CJB_RPL_BOARD
           SET RPL_CONT = @RPL_CONT,
               MOD_DTIME = getdate(),
               MODR_ID = @MODR_ID
        WHERE 
          RPL_NO = @RPL_NO 
      `;

      await request.query(query);

      return { success: true };
    } catch (err) {
      console.error("Error updating rpl board detail:", err);
      throw err;
    }
  }

