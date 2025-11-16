const sql = require("mssql");
const pool = require("../../config/db");


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 사용자 2.0 (딜러, 사무장, 대표이사 등)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 사용자 목록 조회 
exports.getUsrList = async ({ 
    agentId, 
    page,
    pageSize,
    orderItem = '01',
    ordAscDesc = 'desc'
  }) => {
    try {
      const request = pool.request();
  /*
      console.log('agentId:', agentId);
      console.log('pageSize:', pageSize);
      console.log('page:', page);

      console.log('orderItem:', orderItem);
      console.log('ordAscDesc:', ordAscDesc);
  */
      request.input("CAR_AGENT", sql.VarChar, agentId);
      request.input("PAGE_SIZE", sql.Int, pageSize);
      request.input("PAGE", sql.Int, page);
  
      // 전체 카운트 조회
      const countQuery = `
      SELECT COUNT(*) as totalCount
                FROM dbo.CJB_USR A
                 WHERE  A.AGENT_ID = @CAR_AGENT
      `;
    
      const dataQuery = `
                SELECT A.USR_ID
                    , A.AGENT_ID
                    , A.LOGIN_ID
                    , A.LOGIN_PASSWD
                    , A.USR_NM
                    , A.USR_GRADE_CD
                    , A.USR_STAT_CD
                    , A.USR_PHON
                    , A.USR_EMAIL
                    , A.USR_STRT_DT
                    , A.USR_END_DT
                    , A.ZIP
                    , A.ADDR1
                    , A.ADDR2
                    , A.USR_PHOTO_NM
                    , A.TAX_SCT_CD
                    , A.EMP_SN
                    , A.EMP_BRNO
                    , A.EMP_BNK_CD
                    , A.EMP_ACTN
                    , A.PUR_FEE_SCT_CD
                    , A.SALE_FEE_SCT_CD
                    , A.AGENT_CD
                    , A.DLR_CD
                    , A.LOGIN_IP
                    , A.LAST_LOGIN_DTIME
                    , A.REG_DTIME
                    , A.REGR_ID
                    , A.MOD_DTIME
                    , A.MODR_ID
                  FROM dbo.CJB_USR A
                 WHERE  A.AGENT_ID = @CAR_AGENT
      ORDER BY ${orderItem === '01' ? 'A.USR_NM' : 'A.USR_NM'} ${ordAscDesc}
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

  // 현금영수증 상세 조회
  exports.getUsrDetail = async ({ usrId }) => {
    try {
      const request = pool.request();


      console.log('*********usrId:***************', usrId);
      request.input("USR_ID", sql.Int, usrId);   

      console.log('usrId:', usrId);
  
      const query = `SELECT A.USR_ID
                          , A.AGENT_ID
                          , A.LOGIN_ID
                          , A.LOGIN_PASSWD
                          , A.USR_NM
                          , A.USR_GRADE_CD
                          , A.USR_STAT_CD
                          , A.USR_PHON
                          , A.USR_EMAIL
                          , A.USR_STRT_DT
                          , A.USR_END_DT
                          , A.ZIP
                          , A.ADDR1
                          , A.ADDR2
                          , A.USR_PHOTO_NM
                          , A.TAX_SCT_CD
                          , A.EMP_SN
                          , A.EMP_BRNO
                          , A.EMP_BNK_CD
                          , A.EMP_ACTN
                          , A.PUR_FEE_SCT_CD
                          , A.SALE_FEE_SCT_CD
                          , A.AGENT_CD
                          , A.DLR_CD
                          , A.LOGIN_IP
                          , A.LAST_LOGIN_DTIME
                          , A.REG_DTIME
                          , A.REGR_ID
                          , A.MOD_DTIME
                          , A.MODR_ID
                       FROM dbo.CJB_USR A
                      WHERE A.USR_ID = @USR_ID `;
  
      console.log('query:', query);
  
      const result = await request.query(query);
      return result.recordset[0];
    } catch (err) {
      console.error("Error fetching car pur detail:", err);
      throw err;
    }
  };

  // 계 좌정보 상세 저장
  exports.insertUsr = async ({ 
    usrId,
    agentId,
    loginId,
    loginPasswd, 
    usrNm,
    usrGradeCd,
    usrStatCd,
    usrPhon,
    usrEmail,
    usrStrtDt,
    usrEndDt,
    zip,
    addr1,
    addr2,
    usrPhotoNm,
    taxSctCd,
    empSn,
    empBrno,
    empBnkCd,
    empActn,
    purFeeSctCd,
    saleFeeSctCd,
    agentCd,
    dlrCd,
    loginIp,
    lastLoginDtime,
    regrId,
    modrId
  }) => {
    try {
      const request = pool.request();
      request.input("USR_ID", sql.VarChar, usrId);
      request.input("AGENT_ID", sql.VarChar, agentId);
      request.input("LOGIN_ID", sql.VarChar, loginId);
      request.input("LOGIN_PASSWD", sql.VarChar, loginPasswd);
      request.input("USR_NM", sql.VarChar, usrNm); 
      request.input("USR_GRADE_CD", sql.VarChar, usrGradeCd);
      request.input("USR_STAT_CD", sql.VarChar, usrStatCd);
      request.input("USR_PHON", sql.VarChar, usrPhon);
      request.input("USR_EMAIL", sql.VarChar, usrEmail);
      request.input("USR_STRT_DT", sql.VarChar, usrStrtDt);
      request.input("USR_END_DT", sql.VarChar, usrEndDt);
      request.input("ZIP", sql.VarChar, zip);
      request.input("ADDR1", sql.VarChar, addr1);
      request.input("ADDR2", sql.VarChar, addr2);
      request.input("USR_PHOTO_NM", sql.VarChar, usrPhotoNm);
      request.input("TAX_SCT_CD", sql.VarChar, taxSctCd);
      request.input("EMP_SN", sql.VarChar, empSn);
      request.input("EMP_BRNO", sql.VarChar, empBrno);
      request.input("EMP_BNK_CD", sql.VarChar, empBnkCd);
      request.input("EMP_ACTN", sql.VarChar, empActn);
      request.input("PUR_FEE_SCT_CD", sql.VarChar, purFeeSctCd);
      request.input("SALE_FEE_SCT_CD", sql.VarChar, saleFeeSctCd);
      request.input("AGENT_CD", sql.VarChar, agentCd);
      request.input("DLR_CD", sql.VarChar, dlrCd);
      request.input("LOGIN_IP", sql.VarChar, loginIp);
      request.input("LAST_LOGIN_DTIME", sql.VarChar, lastLoginDtime);
      request.input("REGR_ID", sql.VarChar, regrId);
      request.input("MODR_ID", sql.VarChar, modrId);

      const query = `
        INSERT INTO dbo.CJB_USR
            ( USR_ID,
              AGENT_ID,
              LOGIN_ID,
              LOGIN_PASSWD,
              USR_NM,
              USR_GRADE_CD,
              USR_STAT_CD,
              USR_PHON,
              USR_EMAIL,
              USR_STRT_DT,
              USR_END_DT,
              ZIP,
              ADDR1,
              ADDR2,
              USR_PHOTO_NM,
              TAX_SCT_CD,
              EMP_SN,
              EMP_BRNO,
              EMP_BNK_CD,
              EMP_ACTN,
              PUR_FEE_SCT_CD,
              SALE_FEE_SCT_CD,
              AGENT_CD,
              DLR_CD,
              LOGIN_IP,
              LAST_LOGIN_DTIME,
              REGR_ID,
              MODR_ID ) 
        VALUES 
          ( @USR_ID,
            @AGENT_ID,
            @LOGIN_ID,
            @LOGIN_PASSWD,
            @USR_NM,
            @USR_GRADE_CD,
            @USR_STAT_CD,
            @USR_PHON,
            @USR_EMAIL,
            @USR_STRT_DT,
            @USR_END_DT,
            @ZIP,
            @ADDR1,
            @ADDR2,
            @USR_PHOTO_NM,
            @TAX_SCT_CD,
            @EMP_SN,
            @EMP_BRNO,
            @EMP_BNK_CD,
            @EMP_ACTN,
            @PUR_FEE_SCT_CD,
            @SALE_FEE_SCT_CD,
            @AGENT_CD,
            @DLR_CD,
            @LOGIN_IP,
            @LAST_LOGIN_DTIME,
            @REGR_ID,
            @MODR_ID
          );
      `;
      await request.query(query);

      return { success: true };
    } catch (err) {
      console.error("Error inserting car acct detail:", err);
      throw err;
    }
  }

  // 계좌정보 상세 수정
  exports.updateUsr = async ({ 
    usrId, 
    agentId, 
    loginId, 
    loginPasswd, 
    usrNm, 
    usrGradeCd, 
    usrStatCd, 
    usrPhon, 
    usrEmail, 
    usrStrtDt, 
    usrEndDt, 
    zip, 
    addr1, 
    addr2, 
    usrPhotoNm, 
    taxSctCd, 
    empSn, 
    empBrno, 
    empBnkCd, 
    empActn, 
    purFeeSctCd, 
    saleFeeSctCd, 
    agentCd, 
    dlrCd, 
    modrId
  }) => {
    try {
      const request = pool.request();

      request.input("USR_ID", sql.VarChar, usrId);  
      request.input("AGENT_ID", sql.VarChar, agentId);
      request.input("LOGIN_ID", sql.VarChar, loginId);
      request.input("LOGIN_PASSWD", sql.VarChar, loginPasswd);
      request.input("USR_NM", sql.VarChar, usrNm);
      request.input("USR_GRADE_CD", sql.VarChar, usrGradeCd);
      request.input("USR_STAT_CD", sql.VarChar, usrStatCd);
      request.input("USR_PHON", sql.VarChar, usrPhon);
      request.input("USR_EMAIL", sql.VarChar, usrEmail);
      request.input("USR_STRT_DT", sql.VarChar, usrStrtDt);
      request.input("USR_END_DT", sql.VarChar, usrEndDt);
      request.input("ZIP", sql.VarChar, zip);
      request.input("ADDR1", sql.VarChar, addr1);
      request.input("ADDR2", sql.VarChar, addr2);
      request.input("USR_PHOTO_NM", sql.VarChar, usrPhotoNm);
      request.input("TAX_SCT_CD", sql.VarChar, taxSctCd);
      request.input("EMP_SN", sql.VarChar, empSn);
      request.input("EMP_BRNO", sql.VarChar, empBrno);
      request.input("EMP_BNK_CD", sql.VarChar, empBnkCd);
      request.input("EMP_ACTN", sql.VarChar, empActn);
      request.input("PUR_FEE_SCT_CD", sql.VarChar, purFeeSctCd);
      request.input("SALE_FEE_SCT_CD", sql.VarChar, saleFeeSctCd);
      request.input("AGENT_CD", sql.VarChar, agentCd);
      request.input("DLR_CD", sql.VarChar, dlrCd);
      request.input("MODR_ID", sql.VarChar, modrId);

      const query = `
        UPDATE dbo.CJB_USR
           SET TRADE_ITEM_CD = @TRADE_ITEM_CD,
               USR_GRADE_CD = @USR_GRADE_CD,
               USR_STAT_CD = @USR_STAT_CD,
               USR_PHON = @USR_PHON,
               USR_EMAIL = @USR_EMAIL,
               USR_STRT_DT = @USR_STRT_DT,
               USR_END_DT = @USR_END_DT,
               ZIP = @ZIP,
               ADDR1 = @ADDR1,
               ADDR2 = @ADDR2,
               USR_PHOTO_NM = @USR_PHOTO_NM,
               TAX_SCT_CD = @TAX_SCT_CD,
               EMP_SN = @EMP_SN,
               EMP_BRNO = @EMP_BRNO,
               EMP_BNK_CD = @EMP_BNK_CD,
               EMP_ACTN = @EMP_ACTN,
               PUR_FEE_SCT_CD = @PUR_FEE_SCT_CD,
               SALE_FEE_SCT_CD = @SALE_FEE_SCT_CD,
               AGENT_CD = @AGENT_CD,
               DLR_CD = @DLR_CD,
               LOGIN_IP = @LOGIN_IP,
               LAST_LOGIN_DTIME = @LAST_LOGIN_DTIME,
               MOD_DTIME = getdate(),
               MODR_ID = @MODR_ID
        WHERE 
          USR_ID = @USR_ID 
      `;

      await request.query(query);

      return { success: true };
    } catch (err) {
      console.error("Error updating car acct detail:", err);
      throw err;
    }
  }

  