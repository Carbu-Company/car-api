const sql = require("mssql");
const pool = require("../../config/db");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 세금계산서 2.0
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 세금계산서 발행된 목록 조회
exports.getCarTaxList = async ({ 
    agentId, 
    page,
    pageSize,
    carNo,
    dealer,
    dtGubun,
    startDt,
    endDt, 
    dtlOldCarNo,    
    dtlTaxTargetTpNm,
    dtlNmNoGubun,
    dtlNmNoValue,
    dtlCrStat,
    dtlWriteTpNm,
    dtlNtsNo,
    dtlMemo,
    orderItem = '01',
    ordAscDesc = 'desc'
  }) => {
    try {
      const request = pool.request();

      console.log('agentId:', agentId);
      console.log('pageSize:', pageSize);
      console.log('page:', page);
  
      console.log('carNo:', carNo);
      console.log('dealer:', dealer);
      console.log('dtGubun:', dtGubun);
      console.log('startDt:', startDt);
      console.log('endDt:', endDt);
      console.log('dtlOldCarNo:', dtlOldCarNo);
      console.log('dtlTaxTargetTpNm:', dtlTaxTargetTpNm);
      console.log('dtlNmNoGubun:', dtlNmNoGubun);
      console.log('dtlNmNoValue:', dtlNmNoValue);
      console.log('dtlCrStat:', dtlCrStat);
      console.log('dtlWriteTpNm:', dtlWriteTpNm);
      console.log('dtlNtsNo:', dtlNtsNo);
      console.log('dtlMemo:', dtlMemo);
      console.log('orderItem:', orderItem);
      console.log('ordAscDesc:', ordAscDesc);

      request.input("CAR_AGENT", sql.VarChar, agentId);
      request.input("PAGE_SIZE", sql.Int, pageSize);
      request.input("PAGE", sql.Int, page);
    
      if (carNo) request.input("CAR_NO", sql.VarChar, `%${carNo}%`);
      if (dealer) request.input("DEALER", sql.VarChar, `%${dealer}%`);
      if (dtGubun) request.input("DT_GUBUN", sql.VarChar, dtGubun);
      if (startDt) request.input("START_DT", sql.VarChar, startDt);
      if (endDt) request.input("END_DT", sql.VarChar, endDt);
      if (dtlOldCarNo) request.input("OLD_CAR_NO", sql.VarChar, `%${dtlOldCarNo}%`);
      if (dtlTaxTargetTpNm) request.input("TAX_TGT_TP_NM", sql.VarChar, dtlTaxTargetTpNm);
      if (dtlNmNoGubun) request.input("NM_NO_GUBUN", sql.VarChar, dtlNmNoGubun);
      if (dtlNmNoValue) request.input("NM_NO_VALUE", sql.VarChar, dtlNmNoValue);
      if (dtlCrStat && dtlCrStat.length > 0) request.input("TXBL_TRNS_STAT_CD", sql.VarChar, dtlCrStat.join(','));
      if (dtlWriteTpNm) request.input("MK_TP_NM", sql.VarChar, dtlWriteTpNm);
      if (dtlNtsNo) request.input("NTS_CONF_NO", sql.VarChar, dtlNtsNo);
      if (dtlMemo) request.input("MEMO", sql.VarChar, `%${dtlMemo}%`);
  
      // 전체 카운트 조회
      const countQuery = `
      SELECT COUNT(*) as totalCount
                FROM dbo.CJB_CAR_TRADE_AMT B
                LEFT JOIN dbo.CJB_TXBL A ON (A.TRADE_SEQ = B.TRADE_SEQ)
                LEFT JOIN dbo.CJB_CAR_PUR C ON (B.CAR_REG_ID = C.CAR_REG_ID)
                LEFT JOIN dbo.CJB_CAR_SEL D ON (C.CAR_REG_ID = D.CAR_REG_ID)
              WHERE B.AGENT_ID = @CAR_AGENT
                AND C.CAR_DEL_YN = 'N'
                AND B.TRADE_EVDC_CD = '001'    -- 001 : 세금계산서 
                ${carNo ? "AND (C.CAR_NO LIKE @CAR_NO OR C.PUR_BEF_CAR_NO LIKE @CAR_NO OR D.SALE_CAR_NO LIKE @CAR_NO)" : ""}
                ${dealer ? "AND (C.DLR_ID LIKE @DEALER OR D.DLR_ID LIKE @DEALER)" : ""}
                ${startDt ? `AND ${dtGubun === '1' ? 'A.MK_DT' : dtGubun === '2' ? 'CONVERT(CHAR(10), A.TRADE_DTIME, 23)' : dtGubun === '3' ? 'D.CAR_SELE_DT' : 'C.CAR_PUR_DT'} >= @START_DT` : ""}
                ${endDt ? `AND ${dtGubun === '1' ? 'A.MK_DT' : dtGubun === '2' ? 'CONVERT(CHAR(10), A.TRADE_DTIME, 23)' : dtGubun === '3' ? 'D.CAR_SELE_DT' : 'C.CAR_PUR_DT'} <= @START_DT` : ""}
                ${dtlOldCarNo ? "AND (C.CAR_NO LIKE @CAR_NO OR C.PUR_BEF_CAR_NO LIKE @CAR_NO" : ""}
                ${dtlTaxTargetTpNm ? "AND A.TAX_TGT_TP_NM = @TAX_TGT_TP_NM" : ""}
                ${dtlNmNoGubun ? dtlNmNoGubun === '1' ? "AND (A.BUYR_MTL_NM = @NM_NO_VALUE OR A.BUYR_AEMP_NM = @NM_NO_VALUE)" : dtlNmNoGubun === '2' ? "AND (A.BUYR_BRNO = @NM_NO_VALUE OR A.BUYR_BRNO = @NM_NO_VALUE)" : "" : ""}    -- 2인경우 주민번호 컬럼 으로 ??????
                ${dtlCrStat && dtlCrStat.length > 0 ? "AND A.TXBL_TRNS_STAT_CD IN (@TXBL_TRNS_STAT_CD)" : ""}
                ${dtlWriteTpNm ? "AND A.MK_TP_NM = @MK_TP_NM" : ""}
                ${dtlNtsNo ? "AND A.NTS_CONF_NO = @NTS_CONF_NO" : ""}
                ${dtlMemo ? "AND A.MEMO LIKE @MEMO" : ""}
      `;

      //console.log('countQuery:', countQuery);
    
      const dataQuery = `SELECT B.AGENT_ID
                        , B.CAR_REG_ID
                        , B.EXPD_ITEM_CD
                        , B.EXPD_ITEM_NM
                        , B.EXPD_SCT_CD
                        , B.EXPD_AMT
                        , B.EXPD_SUP_PRC
                        , B.EXPD_VAT
                        , B.EXPD_DT
                        , B.EXPD_METH_CD
                        , B.EXPD_EVDC_CD
                        , B.TAX_SCT_CD
                        , B.TXBL_ISSU_DT
                        , B.RMRK
                        , B.ADJ_INCLUS_YN
                        , B.CASH_RECPT_RCGN_NO
                        , B.CASH_MGMTKEY
                        , C.CAR_NO
                        , C.DLR_ID 
                        , (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = C.DLR_ID) AS DLR_NM
                        , C.CAR_NM 
                        , C.CAR_PUR_DT 
                        , C.PUR_AMT        
                        , A.ISSU_SHP_NM    -- 문서
                        , A.MK_DT          -- 작성일자
                        , A.TRADE_DTIME    -- 발행일자
                        , A.BUYR_MTL_NM    -- 거래처
                        , A.BUYR_BRNO 
                        , D.DLR_ID AS SEL_DLR_ID
                        , (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = D.DLR_ID) AS SEL_DLR_NM
                        , (SELECT TOP 1 ARTC_NM FROM dbo.CJB_TXBL_ITEM B WHERE B.TAX_MGMTKEY = A.TAX_MGMTKEY) AS ITEM_NM
                        , A.TOT_SUP_PRC 
                        , A.TOT_VAT
                        , A.TOT_AMT 
                        , A.TXBL_TRNS_STAT_CD
                        , dbo.CJB_FN_GET_CD_NM('22', A.TXBL_TRNS_STAT_CD) TXBL_TRNS_STAT_NM
                        , A.TAX_MGMTKEY
                      FROM dbo.CJB_CAR_TRADE_AMT B
                      LEFT JOIN dbo.CJB_TXBL A ON (A.GOODS_FEE_SEQ = B.GOODS_FEE_SEQ)
                      LEFT JOIN dbo.CJB_CAR_PUR C ON (B.CAR_REG_ID = C.CAR_REG_ID)
                      LEFT JOIN dbo.CJB_CAR_SEL D ON (C.CAR_REG_ID = D.CAR_REG_ID)
                    WHERE B.AGENT_ID = @CAR_AGENT
                      AND C.CAR_DEL_YN = 'N'
                      AND B.EXPD_EVDC_CD = '001'
        ${carNo ? "AND (C.CAR_NO LIKE @CAR_NO OR C.PUR_BEF_CAR_NO LIKE @CAR_NO OR D.SALE_CAR_NO LIKE @CAR_NO)" : ""}
        ${dealer ? "AND (C.DLR_ID LIKE @DEALER OR D.DLR_ID LIKE @DEALER)" : ""}
        ${startDt ? `AND ${dtGubun === '1' ? 'A.MK_DT' : dtGubun === '2' ? 'CONVERT(CHAR(10), A.TRADE_DTIME, 23)' : dtGubun === '3' ? 'D.CAR_SELE_DT' : 'C.CAR_PUR_DT'} >= @START_DT` : ""}
        ${endDt ? `AND ${dtGubun === '1' ? 'A.MK_DT' : dtGubun === '2' ? 'CONVERT(CHAR(10), A.TRADE_DTIME, 23)' : dtGubun === '3' ? 'D.CAR_SELE_DT' : 'C.CAR_PUR_DT'} <= @START_DT` : ""}
        ${dtlOldCarNo ? "AND (C.CAR_NO LIKE @CAR_NO OR C.PUR_BEF_CAR_NO LIKE @CAR_NO" : ""}
        ${dtlTaxTargetTpNm ? "AND A.TAX_TGT_TP_NM = @TAX_TGT_TP_NM" : ""}
        ${dtlNmNoGubun ? dtlNmNoGubun === '1' ? "AND (A.BUYR_MTL_NM = @NM_NO_VALUE OR A.BUYR_AEMP_NM = @NM_NO_VALUE)" : dtlNmNoGubun === '2' ? "AND (A.BUYR_BRNO = @NM_NO_VALUE OR A.BUYR_BRNO = @NM_NO_VALUE)" : "" : ""}    -- 2인경우 주민번호 컬럼 으로 ??????
        ${dtlCrStat && dtlCrStat.length > 0 ? "AND A.TXBL_TRNS_STAT_CD IN (@TXBL_TRNS_STAT_CD)" : ""}
        ${dtlWriteTpNm ? "AND A.MK_TP_NM = @MK_TP_NM" : ""}
        ${dtlNtsNo ? "AND A.NTS_CONF_NO = @NTS_CONF_NO" : ""}
        ${dtlMemo ? "AND A.MEMO LIKE @MEMO" : ""}
      ORDER BY ${orderItem === '01' ? 'A.MK_DT' : orderItem === '02' ? 'CONVERT(CHAR(10), A.TRADE_DTIME, 23)' : orderItem === '03' ? 'D.CAR_SELE_DT' : 'C.CAR_PUR_DT'} ${ordAscDesc}
      OFFSET (@PAGE - 1) * @PAGE_SIZE ROWS
      FETCH NEXT @PAGE_SIZE ROWS ONLY;`;
  
      //console.log('dataQuery:', dataQuery);

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
      console.error("Error fetching car pur list:", err);
      throw err;
    }
  };
  
  // 세금계산서 발행된 합계 조회
  exports.getCarTaxSummary = async ({  
    agentId, 
    page,
    pageSize,
    carNo,
    dealer,
    dtGubun,
    startDt,
    endDt, 
    dtlOldCarNo,    
    dtlTaxTargetTpNm,
    dtlNmNoGubun,
    dtlNmNoValue,
    dtlCrStat,
    dtlWriteTpNm,
    dtlNtsNo,
    dtlMemo,
    orderItem = '01',
    ordAscDesc = 'desc'
  }) => {
    try {
      const request = pool.request();
  
      console.log('agentId:', agentId);
      console.log('pageSize:', pageSize);
      console.log('page:', page);
  
      console.log('carNo:', carNo);
      console.log('dealer:', dealer);
      console.log('dtGubun:', dtGubun);
      console.log('startDt:', startDt);
      console.log('endDt:', endDt);
      console.log('dtlOldCarNo:', dtlOldCarNo);
      console.log('dtlTaxTargetTpNm:', dtlTaxTargetTpNm);
      console.log('dtlNmNoGubun:', dtlNmNoGubun);
      console.log('dtlNmNoValue:', dtlNmNoValue);
      console.log('dtlCrStat:', dtlCrStat);
      console.log('dtlWriteTpNm:', dtlWriteTpNm);
      console.log('dtlNtsNo:', dtlNtsNo);
      console.log('dtlMemo:', dtlMemo);
      console.log('orderItem:', orderItem);
      console.log('ordAscDesc:', ordAscDesc);
  
      request.input("CAR_AGENT", sql.VarChar, agentId);
      request.input("PAGE_SIZE", sql.Int, pageSize);
      request.input("PAGE", sql.Int, page);
  
      if (carNo) request.input("CAR_NO", sql.VarChar, `%${carNo}%`);
      if (dealer) request.input("DEALER", sql.VarChar, `%${dealer}%`);
      if (dtGubun) request.input("DT_GUBUN", sql.VarChar, dtGubun);
      if (startDt) request.input("START_DT", sql.VarChar, startDt);
      if (endDt) request.input("END_DT", sql.VarChar, endDt);
      if (dtlOldCarNo) request.input("OLD_CAR_NO", sql.VarChar, `%${dtlOldCarNo}%`);
      if (dtlTaxTargetTpNm) request.input("TAX_TGT_TP_NM", sql.VarChar, dtlTaxTargetTpNm);
      if (dtlNmNoGubun) request.input("NM_NO_GUBUN", sql.VarChar, dtlNmNoGubun);
      if (dtlNmNoValue) request.input("NM_NO_VALUE", sql.VarChar, dtlNmNoValue);
      if (dtlCrStat && dtlCrStat.length > 0) request.input("TXBL_TRNS_STAT_CD", sql.VarChar, dtlCrStat.join(','));
      if (dtlWriteTpNm) request.input("MK_TP_NM", sql.VarChar, dtlWriteTpNm);
      if (dtlNtsNo) request.input("NTS_CONF_NO", sql.VarChar, dtlNtsNo);
      if (dtlMemo) request.input("MEMO", sql.VarChar, `%${dtlMemo}%`);
  
      const query = `SELECT '사업자 발급분' AS MK_TP_NM
                          , COUNT(A.TAX_MGMTKEY) TAX_CNT
                          , COUNT(A.BUYR_BRNO) BUYR_CNT
                          , ISNULL(SUM(A.TOT_AMT), 0) TRADE_AMT
                          , ISNULL(SUM(A.TOT_SUP_PRC), 0) SUP_PRC
                          , ISNULL(SUM(A.TOT_VAT), 0) VAT
                      FROM dbo.CJB_TXBL A
                      LEFT JOIN dbo.CJB_CAR_TRADE_AMT B ON (A.TRADE_SEQ = B.TRADE_SEQ)
                      LEFT JOIN dbo.CJB_CAR_PUR C ON (B.CAR_REG_ID = C.CAR_REG_ID)
                      LEFT JOIN dbo.CJB_CAR_SEL D ON (C.CAR_REG_ID = D.CAR_REG_ID)
                    WHERE A.AGENT_ID = @CAR_AGENT
                      AND A.MK_TP_NM = '사업자'
                      ${carNo ? "AND (C.CAR_NO LIKE @CAR_NO OR C.PUR_BEF_CAR_NO LIKE @CAR_NO OR D.SALE_CAR_NO LIKE @CAR_NO)" : ""}
                      ${dealer ? "AND (C.DLR_ID LIKE @DEALER OR D.DLR_ID LIKE @DEALER)" : ""}
                      ${startDt ? `AND ${dtGubun === '1' ? 'A.MK_DT' : dtGubun === '2' ? 'CONVERT(CHAR(10), A.TRADE_DTIME, 23)' : dtGubun === '3' ? 'D.CAR_SELE_DT' : 'C.CAR_PUR_DT'} >= @START_DT` : ""}
                      ${endDt ? `AND ${dtGubun === '1' ? 'A.MK_DT' : dtGubun === '2' ? 'CONVERT(CHAR(10), A.TRADE_DTIME, 23)' : dtGubun === '3' ? 'D.CAR_SELE_DT' : 'C.CAR_PUR_DT'} <= @START_DT` : ""}
                      ${dtlOldCarNo ? "AND (C.CAR_NO LIKE @CAR_NO OR C.PUR_BEF_CAR_NO LIKE @CAR_NO" : ""}
                      ${dtlTaxTargetTpNm ? "AND A.TAX_TGT_TP_NM = @TAX_TGT_TP_NM" : ""}
                      ${dtlNmNoGubun ? dtlNmNoGubun === '1' ? "AND (A.BUYR_MTL_NM = @NM_NO_VALUE OR A.BUYR_AEMP_NM = @NM_NO_VALUE)" : dtlNmNoGubun === '2' ? "AND (A.BUYR_BRNO = @NM_NO_VALUE OR A.BUYR_BRNO = @NM_NO_VALUE)" : "" : ""}    -- 2인경우 주민번호 컬럼 으로 ??????
                      ${dtlCrStat && dtlCrStat.length > 0 ? "AND A.TXBL_TRNS_STAT_CD IN (@TXBL_TRNS_STAT_CD)" : ""}
                      ${dtlWriteTpNm ? "AND A.MK_TP_NM = @MK_TP_NM" : ""}
                      ${dtlNtsNo ? "AND A.NTS_CONF_NO = @NTS_CONF_NO" : ""}
                      ${dtlMemo ? "AND A.MEMO LIKE @MEMO" : ""}
                      UNION ALL
                      SELECT '주민번호 발급분' AS MK_TP_NM
                          , COUNT(A.TAX_MGMTKEY) TAX_CNT
                          , COUNT(A.BUYR_BRNO) BUYR_CNT
                          , ISNULL(SUM(A.TOT_AMT), 0) TRADE_AMT
                          , ISNULL(SUM(A.TOT_SUP_PRC), 0) SUP_PRC
                          , ISNULL(SUM(A.TOT_VAT), 0) VAT
                      FROM dbo.CJB_TXBL A
                      LEFT JOIN dbo.CJB_CAR_TRADE_AMT B ON (A.TRADE_SEQ = B.TRADE_SEQ)
                      LEFT JOIN dbo.CJB_CAR_PUR C ON (B.CAR_REG_ID = C.CAR_REG_ID)
                      LEFT JOIN dbo.CJB_CAR_SEL D ON (C.CAR_REG_ID = D.CAR_REG_ID)
                    WHERE A.AGENT_ID = @CAR_AGENT
                      AND A.MK_TP_NM = '주민번호'
                      ${carNo ? "AND (C.CAR_NO LIKE @CAR_NO OR C.PUR_BEF_CAR_NO LIKE @CAR_NO OR D.SALE_CAR_NO LIKE @CAR_NO)" : ""}
                      ${dealer ? "AND (C.DLR_ID LIKE @DEALER OR D.DLR_ID LIKE @DEALER)" : ""}
                      ${startDt ? `AND ${dtGubun === '1' ? 'A.MK_DT' : dtGubun === '2' ? 'CONVERT(CHAR(10), A.TRADE_DTIME, 23)' : dtGubun === '3' ? 'D.CAR_SELE_DT' : 'C.CAR_PUR_DT'} >= @START_DT` : ""}
                      ${endDt ? `AND ${dtGubun === '1' ? 'A.MK_DT' : dtGubun === '2' ? 'CONVERT(CHAR(10), A.TRADE_DTIME, 23)' : dtGubun === '3' ? 'D.CAR_SELE_DT' : 'C.CAR_PUR_DT'} <= @START_DT` : ""}
                      ${dtlOldCarNo ? "AND (C.CAR_NO LIKE @CAR_NO OR C.PUR_BEF_CAR_NO LIKE @CAR_NO" : ""}
                      ${dtlTaxTargetTpNm ? "AND A.TAX_TGT_TP_NM = @TAX_TGT_TP_NM" : ""}
                      ${dtlNmNoGubun ? dtlNmNoGubun === '1' ? "AND (A.BUYR_MTL_NM = @NM_NO_VALUE OR A.BUYR_AEMP_NM = @NM_NO_VALUE)" : dtlNmNoGubun === '2' ? "AND (A.BUYR_BRNO = @NM_NO_VALUE OR A.BUYR_BRNO = @NM_NO_VALUE)" : "" : ""}    -- 2인경우 주민번호 컬럼 으로 ??????
                      ${dtlCrStat && dtlCrStat.length > 0 ? "AND A.TXBL_TRNS_STAT_CD IN (@TXBL_TRNS_STAT_CD)" : ""}
                      ${dtlWriteTpNm ? "AND A.MK_TP_NM = @MK_TP_NM" : ""}
                      ${dtlNtsNo ? "AND A.NTS_CONF_NO = @NTS_CONF_NO" : ""}
                      ${dtlMemo ? "AND A.MEMO LIKE @MEMO" : ""}
                      UNION ALL
                      SELECT '합계' AS MK_TP_NM
                          , COUNT(A.TAX_MGMTKEY) TAX_CNT
                          , COUNT(A.BUYR_BRNO) BUYR_CNT
                          , ISNULL(SUM(A.TOT_AMT), 0) TRADE_AMT
                          , ISNULL(SUM(A.TOT_SUP_PRC), 0) SUP_PRC
                          , ISNULL(SUM(A.TOT_VAT), 0) VAT
                      FROM dbo.CJB_TXBL A
                      LEFT JOIN dbo.CJB_CAR_TRADE_AMT B ON (A.TRADE_SEQ = B.TRADE_SEQ)
                      LEFT JOIN dbo.CJB_CAR_PUR C ON (B.CAR_REG_ID = C.CAR_REG_ID)
                      LEFT JOIN dbo.CJB_CAR_SEL D ON (C.CAR_REG_ID = D.CAR_REG_ID)
                    WHERE A.AGENT_ID = @CAR_AGENT
                      ${carNo ? "AND (C.CAR_NO LIKE @CAR_NO OR C.PUR_BEF_CAR_NO LIKE @CAR_NO OR D.SALE_CAR_NO LIKE @CAR_NO)" : ""}
                      ${dealer ? "AND (C.DLR_ID LIKE @DEALER OR D.DLR_ID LIKE @DEALER)" : ""}
                      ${startDt ? `AND ${dtGubun === '1' ? 'A.MK_DT' : dtGubun === '2' ? 'CONVERT(CHAR(10), A.TRADE_DTIME, 23)' : dtGubun === '3' ? 'D.CAR_SELE_DT' : 'C.CAR_PUR_DT'} >= @START_DT` : ""}
                      ${endDt ? `AND ${dtGubun === '1' ? 'A.MK_DT' : dtGubun === '2' ? 'CONVERT(CHAR(10), A.TRADE_DTIME, 23)' : dtGubun === '3' ? 'D.CAR_SELE_DT' : 'C.CAR_PUR_DT'} <= @START_DT` : ""}
                      ${dtlOldCarNo ? "AND (C.CAR_NO LIKE @CAR_NO OR C.PUR_BEF_CAR_NO LIKE @CAR_NO" : ""}
                      ${dtlTaxTargetTpNm ? "AND A.TAX_TGT_TP_NM = @TAX_TGT_TP_NM" : ""}
                      ${dtlNmNoGubun ? dtlNmNoGubun === '1' ? "AND (A.BUYR_MTL_NM = @NM_NO_VALUE OR A.BUYR_AEMP_NM = @NM_NO_VALUE)" : dtlNmNoGubun === '2' ? "AND (A.BUYR_BRNO = @NM_NO_VALUE OR A.BUYR_BRNO = @NM_NO_VALUE)" : "" : ""}    -- 2인경우 주민번호 컬럼 으로 ??????
                      ${dtlCrStat && dtlCrStat.length > 0 ? "AND A.TXBL_TRNS_STAT_CD IN (@TXBL_TRNS_STAT_CD)" : ""}
                      ${dtlWriteTpNm ? "AND A.MK_TP_NM = @MK_TP_NM" : ""}
                      ${dtlNtsNo ? "AND A.NTS_CONF_NO = @NTS_CONF_NO" : ""}
                      ${dtlMemo ? "AND A.MEMO LIKE @MEMO" : ""}
        `;
  
      console.log('query:', query);

      const result = await request.query(query);
      return result.recordset;
    } catch (err) {
      console.error("Error fetching car pur sum:", err);
      throw err;
    }
  };
  
  // 차량 등록 ID에 해당되는 세금계산서 발행된 목록 조회
  exports.getCarTaxInfo = async ({ carRegId }) => {
    try {
      const request = pool.request();
      request.input("CAR_REG_ID", sql.VarChar, carRegId);   
  
      const query = `SELECT C.CASH_MGMTKEY                  -- 현금 관리키             
                            C.NTS_CONF_NO                   -- 국세청 승인 번호        
                            C.TRADE_DT                      -- 거래 일자               
                            C.TRADE_DTIME                   -- 거래 일시               
                            C.TRADE_SHP_NM                  -- 거래 형태 명            
                            C.TRADE_SCT_NM                  -- 거래 구분 명            
                            C.TRADE_TP_NM                   -- 거래 유형 명            
                            C.TAX_SHP_NM                    -- 과세 형태 명            
                            C.TRADE_AMT                     -- 거래 금액               
                            C.SUP_PRC                       -- 공급가                  
                            C.VAT                           -- 부가세                  
                            C.SRVC                          -- 봉사료                  
                            C.MERS_BRNO                     -- 가맹점 사업자등록번     
                            C.MERS_MRPL_BIZ_RCGNNO          -- 가맹점 종사업장 식별번호
                            C.MERS_MTL_NM                   -- 가맹점 상호 명          
                            C.MERS_PRES_NM                  -- 가맹점 대표자           
                            C.MERS_ADDR                     -- 가맹점 주소             
                            C.MERS_PHON                     -- 가맹점 전화번호         
                            C.RCGN_NO                       -- 식별 번호               
                            C.CUST_NM                       -- 고객 명                 
                            C.ORD_GOODS_NM                  -- 주문 상품 명            
                            C.ORD_NO                        -- 주문 번호               
                            C.CUST_EMAIL                    -- 고객 이메일             
                            C.CUST_HP                       -- 고객 핸드폰             
                            C.CUST_NTCCHR_TRNS_YN           -- 고객 알림문자 전송 여부 
                            C.CNCL_CAUS_CD                  -- 취소 사유 코드          
                            C.MEMO                          -- 메모                    
                            C.EMAIL_TIT_NM                  -- 이메일 제목 명          
                            C.GOODS_FEE_SEQ                 -- 비용 순번               
                            C.AGENT_ID                      -- 상사 ID                 
                            C.REG_DTIME                     -- 등록 일시               
                            C.REGR_ID                       -- 등록자 ID               
                            C.MOD_DTIME                     -- 수정 일시               
                            C.MODR_ID                       -- 수정자 ID               
                        FROM dbo.CJB_CAR_PUR A
                           , dbo.CJB_CAR_TRADE_AMT B                           
                           , dbo.CJB_TXBL C
                        WHERE B.CAR_REG_ID = A.CAR_REG_ID
                          AND C.TRADE_SEQ = B.TRADE_SEQ
                          AND A.CAR_REG_ID = @CAR_REG_ID `;
  
      console.log('query:', query);
  
      const result = await request.query(query);
      return result.recordset[0];
    } catch (err) {
      console.error("Error fetching car pur detail:", err);
      throw err;
    }
  };

  // 세금계산서 항목 상세 조회
  exports.getCarTaxItemInfo = async ({ taxMgmtkey }) => {
    try {
      const request = pool.request();
      request.input("TAX_MGMTKEY", sql.VarChar, taxMgmtkey);   
  
      const query = `SELECT A.TXBL_DTL_SN                     -- 세금계산서 상세 일련번호
                            , A.TAX_MGMTKEY                   -- 세금 관리키             
                            , A.TRADE_DT                      -- 거래 일자               
                            , A.ARTC_NM                       -- 품목 명                 
                            , A.STD                           -- 규격                    
                            , A.QTY                           -- 수량                    
                            , A.PRC                           -- 단가                    
                            , A.SUP_PRC                       -- 공급가                  
                            , A.TAXAMT                        -- 세액                    
                            , A.NOTE                          -- 비고               
                        FROM dbo.CJB_TXBL A
                           , dbo.CJB_TXBL_ITEM B
                        WHERE B.TAX_MGMTKEY = A.TAX_MGMTKEY
                          AND A.TAX_MGMTKEY = @TAX_MGMTKEY `;
  
      console.log('query:', query);
  
      const result = await request.query(query);
      return result.recordset[0];
    } catch (err) {
      console.error("Error fetching car tax item detail:", err);
      throw err;
    }
  };


// 전자세금계산서 발행시 필요한 정보를 조회 (차량 한대 기준 - 공급자, 공급받는자 정보)
exports.getCarTaxIssueInfo = async ({ carRegId }) => {

  try {
    const request = pool.request();
    request.input("CAR_REG_ID", sql.VarChar, carRegId);

    const query = `SELECT dbo.CJB_FN_MK_TAX_MGMTKEY('00011') AS TAX_MGMTKEY
                        , A.AGENT_ID
                        , A.CAR_REG_ID
                        , A.TRADE_SEQ
                        , A.TRADE_DT AS MK_DT
                        , NULL TRADE_DTIME
                        , NULL DEL_DTIME
                        , '정발행' AS ISSU_SHP_NM         -- 발급 형태 명: 정발행, 역발행, 위수탁
                        , '과세' AS TAX_SHP_NM          -- 과세 형태 명: 과세, 영세, 면세
                        , '정과금' AS TAX_DRCN_NM         -- 과세 방향 명: 정과금, 역과금 
                        , '영수' AS TAX_USE_NM         -- 과세 용도 명: 영수, 청구
                        , A.TRADE_ITEM_AMT 
                        , A.TRADE_ITEM_SUP_PRC 
                        , A.TRADE_ITEM_VAT 
                        , NULL NOTE1
                        , B.BRNO AS SPLR_BRNO
                        , NULL AS SPLR_MRPL_BIZ_RCGNNO           -- 종사업장 식별번호
                        , B.AGENT_NM  AS SPLR_MTL_NM
                        , B.PRES_NM  AS SPLR_PRES_NM
                        , B.ADDR1 + ' ' + B.ADDR2 AS SPLR_ADDR
                        , B.PHON 
                        , B.BUCO AS SPLR_BUCO                       -- 업태
                        , B.STK AS SPLR_STK                        -- 종목 
                        , C.USR_NM AS SPLR_AEMP_NM                    -- 담당자명
                        , C.USR_DEPT_NM AS SPLR_AEMP_DEPT_NM               -- 공급자 담당자 부서 명
                        , B.PHON AS SPLR_PHON                       -- 공급자 (회사번호)
                        , C.USR_PHON AS SPLR_HP                         -- 공급자 (담당자 폰)
                        , C.USR_EMAIL AS SPLR_AEMP_EMAIL                 -- 공급자 담자자 이메일
                        , 'N' AS SPLR_NTCCHR_TRNS_YN             -- 공급자 알림문자 전송 여부 
                        , NULL AS BUYR_DOCNO              -- 공급받는자 문서번호
                        , D.CUST_TP_CD AS  BUYR_TP_CD                      -- 공급받는자 유형 명   : 사업자 , 개인, 외국인   
                        , dbo.CJB_FN_GET_CD_NM('04', D.CUST_TP_CD) BUYR_TP_NM
                        , D.BRNO AS BUYR_BRNO                       -- 공급받는자 사업자 번호 /주민등록번호
                        , NULL AS BUYR_MNR_BMAN_RCGNNO            -- 공급받는자 종사업장 식별번호
                        , D.CUST_NM AS BUYR_MTL_NM                     -- 공급받는자 상호명 
                        , D.PRES_NM AS BUYR_PRES_NM                    -- 공급받는자 대표자명   
                        , D.ADDR1 + ' ' + D.ADDR2 AS BUYR_ADDR                       -- 공급받는자 주소 
                        , D.BUCO AS CBUYR_BUCO                       -- 공급받는자 업태  
                        , D.STK AS BUYR_STK                        -- 공급받는자 종목 
                        , D.CUST_NM AS BUYR_AEMP_NM                    -- 공급받는자 담당자명 (고객에서 담당자 없는데 어떻게 ?)
                        , D.DEPT_NM AS BUYR_AEMP_DEPT_NM               -- 공급받는자 담당자 부서명  
                        , D.CUST_PHON AS BUYR_AEMP_PHON                  -- 공급받는자 담당자 전화번호
                        , D.CUST_PHON AS BUYR_AEMP_HP                    -- 공급받는자 담당자 폰
                        , D.CUST_EMAIL AS BUYR_AEMP_EMAIL                 -- 공급받는자 담당자 EMAIL
                        , 'N' AS BUYR_NTCCHR_TRNS_YN             -- 공급받는자 담당자 알림문자 전송 여부 
                        , NULL AS MOD_CAUS_CD                     -- 수정 사유 코드 
                        , NULL AS PERSS_NTS_CONF_NO       -- 당초 국세청 승인 번호
                        , NULL AS MEMO                    -- 메모
                        , NULL AS TXBL_TRNS_STAT_CD               -- 세금계산서 전송 상태코드
                        , NULL AS MK_TP_CD                        -- 작성 유형 명
                      FROM dbo.CJB_CAR_TRADE_AMT A
                        , dbo.CJB_AGENT B
                        , dbo.CJB_USR C
                        , dbo.CJB_CUST D
                    WHERE 1 = 1
                      AND A.CAR_REG_ID = @CAR_REG_ID
                      AND A.AGENT_ID = B.AGENT_ID
                      AND B.AEMP_ID = C.USR_ID
                      AND A.TRADE_TGT_ID = CUST_NO
                      `;

    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching trade issue info:", err);
    throw err;
  }
};

// 전자세금계산서 발행시 필요한 정보를 조회 (개별 거래 기준 - 공급자, 공급받는자 정보)
exports.getTaxIssueInfo = async ({ tradeSeq }) => {

  try {
    const request = pool.request();
    request.input("TRADE_SEQ", sql.Int, tradeSeq);

    const query = `SELECT dbo.CJB_FN_MK_TAX_MGMTKEY('00011') AS TAX_MGMTKEY
                        , A.AGENT_ID
                        , A.CAR_REG_ID
                        , A.TRADE_SEQ
                        , A.TRADE_DT AS MK_DT
                        , NULL TRADE_DTIME
                        , NULL DEL_DTIME
                        , '정발행' AS ISSU_SHP_NM         -- 발급 형태 명: 정발행, 역발행, 위수탁
                        , '과세' AS TAX_SHP_NM          -- 과세 형태 명: 과세, 영세, 면세
                        , '정과금' AS TAX_DRCN_NM         -- 과세 방향 명: 정과금, 역과금 
                        , '영수' AS TAX_USE_NM         -- 과세 용도 명: 영수, 청구
                        , A.TRADE_ITEM_AMT 
                        , A.TRADE_ITEM_SUP_PRC 
                        , A.TRADE_ITEM_VAT 
                        , NULL NOTE1
                        , B.BRNO AS SPLR_BRNO
                        , NULL AS SPLR_MRPL_BIZ_RCGNNO           -- 종사업장 식별번호
                        , B.AGENT_NM  AS SPLR_MTL_NM
                        , B.PRES_NM  AS SPLR_PRES_NM
                        , B.ADDR1 + ' ' + B.ADDR2 AS SPLR_ADDR
                        , B.PHON 
                        , B.BUCO AS SPLR_BUCO                       -- 업태
                        , B.STK AS SPLR_STK                        -- 종목 
                        , C.USR_NM AS SPLR_AEMP_NM                    -- 담당자명
                        , C.USR_DEPT_NM AS SPLR_AEMP_DEPT_NM               -- 공급자 담당자 부서 명
                        , B.PHON AS SPLR_PHON                       -- 공급자 (회사번호)
                        , C.USR_PHON AS SPLR_HP                         -- 공급자 (담당자 폰)
                        , C.USR_EMAIL AS SPLR_AEMP_EMAIL                 -- 공급자 담자자 이메일
                        , 'N' AS SPLR_NTCCHR_TRNS_YN             -- 공급자 알림문자 전송 여부 
                        , NULL AS BUYR_DOCNO              -- 공급받는자 문서번호
                        , D.CUST_TP_CD AS  BUYR_TP_CD                      -- 공급받는자 유형 명   : 사업자 , 개인, 외국인   
                        , dbo.CJB_FN_GET_CD_NM('04', D.CUST_TP_CD) BUYR_TP_NM
                        , D.BRNO AS BUYR_BRNO                       -- 공급받는자 사업자 번호 /주민등록번호
                        , NULL AS BUYR_MNR_BMAN_RCGNNO            -- 공급받는자 종사업장 식별번호
                        , D.CUST_NM AS BUYR_MTL_NM                     -- 공급받는자 상호명 
                        , D.PRES_NM AS BUYR_PRES_NM                    -- 공급받는자 대표자명   
                        , D.ADDR1 + ' ' + D.ADDR2 AS BUYR_ADDR                       -- 공급받는자 주소 
                        , D.BUCO AS CBUYR_BUCO                       -- 공급받는자 업태  
                        , D.STK AS BUYR_STK                        -- 공급받는자 종목 
                        , D.CUST_NM AS BUYR_AEMP_NM                    -- 공급받는자 담당자명 (고객에서 담당자 없는데 어떻게 ?)
                        , D.DEPT_NM AS BUYR_AEMP_DEPT_NM               -- 공급받는자 담당자 부서명  
                        , D.CUST_PHON AS BUYR_AEMP_PHON                  -- 공급받는자 담당자 전화번호
                        , D.CUST_PHON AS BUYR_AEMP_HP                    -- 공급받는자 담당자 폰
                        , D.CUST_EMAIL AS BUYR_AEMP_EMAIL                 -- 공급받는자 담당자 EMAIL
                        , 'N' AS BUYR_NTCCHR_TRNS_YN             -- 공급받는자 담당자 알림문자 전송 여부 
                        , NULL AS MOD_CAUS_CD                     -- 수정 사유 코드 
                        , NULL AS PERSS_NTS_CONF_NO       -- 당초 국세청 승인 번호
                        , NULL AS MEMO                    -- 메모
                        , NULL AS TXBL_TRNS_STAT_CD               -- 세금계산서 전송 상태코드
                        , NULL AS MK_TP_CD                        -- 작성 유형 명
                      FROM dbo.CJB_CAR_TRADE_AMT A
                        , dbo.CJB_AGENT B
                        , dbo.CJB_USR C
                        , dbo.CJB_CUST D
                    WHERE 1 = 1
                      AND A.TRADE_SEQ = 9
                      AND A.AGENT_ID = B.AGENT_ID
                      AND B.AEMP_ID = C.USR_ID
                      AND A.TRADE_TGT_ID = CUST_NO
                      `;

    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching trade issue info:", err);
    throw err;
  }
};


// 전자세금계산서 등록
exports.insertCarTax = async ({
    taxMgmtkey,                   // 세금 관리키                  
    agentId,                      // 상사 ID                      
    tradeSeq,                     // 거래 순번                    
    mkDt,                         // 작성 일자                    
    tradeDtime,                   // 거래 일시                    
    delDtime,                     // 삭제 일시                    
    issuShpNm,                    // 발급 형태 명                 
    taxShpNm,                     // 과세 형태 명                 
    taxDrcnNm,                    // 과세 방향 명                 
    taxUseNm,                     // 과세 용도 명                 
    totAmt,                       // 총 금액                      
    totSupPrc,                    // 총 공급가                    
    totVat,                       // 총 부가세                    
    note1,                        // 비고1                        
    splrBrno,                     // 공급자 사업자등록번호        
    splrMrplBizRcgnno,           // 공급자 종사업장 식별번호     
    splrMtlNm,                    // 공급자 상호 명               
    splrPresNm,                   // 공급자 대표자 명             
    splrAddr,                     // 공급자 주소                  
    splrBuco,                     // 공급자 업태                  
    splrStk,                      // 공급자 종목                  
    splrAempNm,                   // 공급자 담당자 명             
    splrAempDeptNm,              // 공급자 담당자 부서 명        
    splrPhon,                     // 공급자 전화번호              
    splrHp,                       // 공급자 연락                  
    splrAempEmail,               // 공급자 담당자 이메일         
    splrNtcchrTrnsYn,            // 공급자 알림문자 전송 여부    
    buyrDocno,                    // 공급받는자 문서번호          
    buyrTpNm,                     // 공급받는자 유형 명           
    buyrBrno,                     // 공급받는자 사업자등록번호    
    buyrMnrBmanRcgnno,           // 공급받는자 종사업자 식별번호 
    buyrMtlNm,                    // 공급받는자 상호 명           
    buyrPresNm,                   // 공급받는자 대표자 명         
    buyrAddr,                     // 공급받는자 주소              
    buyrBuco,                     // 공급받는자 업태              
    buyrStk,                      // 공급받는자 종                
    buyrAempNm,                   // 공급받는자 담당자 명         
    buyrAempDeptNm,              // 공급받는자 담당자 부서 명    
    buyrAempPhon,                // 공급받는자 담당자 전화번호   
    buyrAempHp,                  // 공급받는자 담당자 휴대폰     
    buyrAempEmail,               // 공급받는자 담당자 이메일     
    buyrNtcchrTrnsYn,            // 공급받는자 알림문자 전송 여부
    modCausCd,                   // 수정 사유 코드               
    perssNtsConfNo,              // 당초 국세청 승인 번호        
    memo,                        // 메모                         
    goodsFeeSeq,                 // 상품화비 순번                
    attachedItems,               // 첨부 항목
    regrId,                      // 등록자 ID                    
    modrId,                      // 수정자 ID                    
}) => {
  try {
    const request = pool.request();

    request.input("TAX_MGMTKEY", sql.VarChar, taxMgmtkey);
    request.input("AGENT_ID", sql.VarChar, agentId);
    request.input("TRADE_SEQ", sql.Int, tradeSeq);
    request.input("MK_DT", sql.VarChar, mkDt);
    request.input("TRADE_DTIME", sql.VarChar, tradeDtime);
    request.input("DEL_DTIME", sql.VarChar, delDtime);
    request.input("ISSU_SHP_NM", sql.VarChar, issuShpNm);
    request.input("TAX_SHP_NM", sql.VarChar, taxShpNm);
    request.input("TAX_DRCN_NM", sql.VarChar, taxDrcnNm);
    request.input("TAX_USE_NM", sql.VarChar, taxUseNm);
    request.input("TOT_AMT", sql.Decimal, totAmt);
    request.input("TOT_SUP_PRC", sql.Decimal, totSupPrc);
    request.input("TOT_VAT", sql.Decimal, totVat);
    request.input("NOTE1", sql.VarChar, note1);
    request.input("SPLR_BRNO", sql.VarChar, splrBrno);
    request.input("SPLR_MRPL_BIZ_RCGNNO", sql.VarChar, splrMrplBizRcgnno);
    request.input("SPLR_MTL_NM", sql.VarChar, splrMtlNm);
    request.input("SPLR_PRES_NM", sql.VarChar, splrPresNm);
    request.input("SPLR_ADDR", sql.VarChar, splrAddr);
    request.input("SPLR_BUCO", sql.VarChar, splrBuco);
    request.input("SPLR_STK", sql.VarChar, splrStk);
    request.input("SPLR_AEMP_NM", sql.VarChar, splrAempNm);
    request.input("SPLR_AEMP_DEPT_NM", sql.VarChar, splrAempDeptNm);
    request.input("SPLR_PHON", sql.VarChar, splrPhon);
    request.input("SPLR_HP", sql.VarChar, splrHp);
    request.input("SPLR_AEMP_EMAIL", sql.VarChar, splrAempEmail);
    request.input("SPLR_NTCCHR_TRNS_YN", sql.VarChar, splrNtcchrTrnsYn);
    request.input("BUYR_DOCNO", sql.VarChar, buyrDocno);
    request.input("BUYR_TP_NM", sql.VarChar, buyrTpNm);
    request.input("BUYR_BRNO", sql.VarChar, buyrBrno);
    request.input("BUYR_MNR_BMAN_RCGNNO", sql.VarChar, buyrMnrBmanRcgnno);
    request.input("BUYR_MTL_NM", sql.VarChar, buyrMtlNm);
    request.input("BUYR_PRES_NM", sql.VarChar, buyrPresNm);
    request.input("BUYR_ADDR", sql.VarChar, buyrAddr);
    request.input("BUYR_BUCO", sql.VarChar, buyrBuco);
    request.input("BUYR_STK", sql.VarChar, buyrStk);
    request.input("BUYR_AEMP_NM", sql.VarChar, buyrAempNm);
    request.input("BUYR_AEMP_DEPT_NM", sql.VarChar, buyrAempDeptNm);
    request.input("BUYR_AEMP_PHON", sql.VarChar, buyrAempPhon);
    request.input("BUYR_AEMP_HP", sql.VarChar, buyrAempHp);
    request.input("BUYR_AEMP_EMAIL", sql.VarChar, buyrAempEmail);
    request.input("BUYR_NTCCHR_TRNS_YN", sql.VarChar, buyrNtcchrTrnsYn);
    request.input("MOD_CAUS_CD", sql.VarChar, modCausCd);
    request.input("PERSS_NTS_CONF_NO", sql.VarChar, perssNtsConfNo);
    request.input("MEMO", sql.VarChar, memo);
    request.input("GOODS_FEE_SEQ", sql.Int, goodsFeeSeq);
    request.input("REGR_ID", sql.VarChar, regrId);
    request.input("MODR_ID", sql.VarChar, modrId);

    const query1 = `INSERT INTO dbo.CJB_TXBL (
                          TAX_MGMTKEY             -- 세금 관리키                            
                        , AGENT_ID                -- 상사 ID                      
                        , CAR_REG_ID              -- 차량 등록 ID                 
                        , TRADE_SEQ               -- 거래 순번                    
                        , MK_DT                   -- 작성 일자                    
                        , TRADE_DTIME             -- 거래 일시                    
                        , DEL_DTIME               -- 삭제 일시                    
                        , ISSU_SHP_NM             -- 발급 형태 명                 
                        , TAX_SHP_NM              -- 과세 형태 명                 
                        , TAX_DRCN_NM             -- 과세 방향 명                 
                        , TAX_USE_NM              -- 과세 용도 명                 
                        , TOT_AMT                 -- 총 금액                      
                        , TOT_SUP_PRC             -- 총 공급가                    
                        , TOT_VAT                 -- 총 부가세                    
                        , NOTE1                   -- 비고1                        
                        , SPLR_BRNO               -- 공급자 사업자등록번호        
                        , SPLR_MRPL_BIZ_RCGNNO    -- 공급자 종사업장 식별번호     
                        , SPLR_MTL_NM             -- 공급자 상호 명               
                        , SPLR_PRES_NM            -- 공급자 대표자 명             
                        , SPLR_ADDR               -- 공급자 주소                  
                        , SPLR_BUCO               -- 공급자 업태                  
                        , SPLR_STK                -- 공급자 종목                  
                        , SPLR_AEMP_NM            -- 공급자 담당자 명             
                        , SPLR_AEMP_DEPT_NM       -- 공급자 담당자 부서 명        
                        , SPLR_PHON               -- 공급자 전화번호              
                        , SPLR_HP                 -- 공급자 연락                  
                        , SPLR_AEMP_EMAIL         -- 공급자 담당자 이메일         
                        , SPLR_NTCCHR_TRNS_YN     -- 공급자 알림문자 전송 여부    
                        , BUYR_DOCNO              -- 공급받는자 문서번호          
                        , BUYR_TP_NM              -- 공급받는자 유형 명           
                        , BUYR_BRNO               -- 공급받는자 사업자등록번호    
                        , BUYR_MNR_BMAN_RCGNNO    -- 공급받는자 종사업자 식별번호 
                        , BUYR_MTL_NM             -- 공급받는자 상호 명           
                        , BUYR_PRES_NM            -- 공급받는자 대표자 명         
                        , BUYR_ADDR               -- 공급받는자 주소              
                        , BUYR_BUCO               -- 공급받는자 업태              
                        , BUYR_STK                -- 공급받는자 종                
                        , BUYR_AEMP_NM            -- 공급받는자 담당자 명         
                        , BUYR_AEMP_DEPT_NM       -- 공급받는자 담당자 부서 명    
                        , BUYR_AEMP_PHON          -- 공급받는자 담당자 전화번호   
                        , BUYR_AEMP_HP            -- 공급받는자 담당자 휴대폰     
                        , BUYR_AEMP_EMAIL         -- 공급받는자 담당자 이메일     
                        , BUYR_NTCCHR_TRNS_YN     -- 공급받는자 알림문자 전송 여부
                        , MOD_CAUS_CD             -- 수정 사유 코드               
                        , PERSS_NTS_CONF_NO       -- 당초 국세청 승인 번호        
                        , MEMO                    -- 메모                         
                        , GOODS_FEE_SEQ           -- 상품화비 순번                
                        , TXBL_TRNS_STAT_CD       -- [NULL]                       
                        , MK_TP_NM                -- 작성 유형 명                 
                        , REG_DTIME               -- 등록 일시                    
                        , REGR_ID                 -- 등록자 ID                    
                        , MOD_DTIME               -- 수정 일시                    
                        , MODR_ID                 -- 수정자 ID                 
                  ) VALUES (
                    @CASH_MGMT_KEY,
                    @NTS_CONF_NO,
                    @TRADE_DT,
                    @TRADE_DTIME,
                    @TRADE_SHP_NM,
                    @TRADE_SCT_NM,
                    @TRADE_TP_NM,
                    @TAX_SHP_NM,
                    @TRADE_AMT,
                    @SUP_PRC,
                    @VAT,
                    @SRVC,
                    @MERS_BRNO,
                    @MERS_MRPL_BIZ_RCGN_NO,
                    @MERS_MTL_NM,
                    @MERS_PRES_NM,
                    @MERS_ADDR,
                    @MERS_PHON,
                    @RCGN_NO,
                    @CUST_NM,
                    @ORD_GOODS_NM,
                    @ORD_NO,
                    @CUST_EMAIL,
                    @CUST_HP,
                    @CUST_NTCCHR_TRNS_YN,
                    @CNCL_CAUS_CD,
                    @MEMO,
                    @EMAIL_TIT_NM,
                    @GOODS_FEE_SEQ,
                    @AGENT_ID,
                    GETDATE(),
                    @REGR_ID,
                    GETDATE(),
                    @MODR_ID

                  )`;

                  
    attachedItems.forEach(async (item) => {

        console.log("file:", item.artcNm);
        console.log("file:", item.tradeDtime);
        console.log("file:", item.std);
  
        const fileRequest = pool.request();
  
        fileRequest.input("TAX_MGMTKEY", sql.VarChar, taxMgmtkey);
        fileRequest.input("TRADE_DT", sql.VarChar, tradeDtime);
        fileRequest.input("ARTC_NM", sql.VarChar, item.artcNm);
        fileRequest.input("STD", sql.Int, item.std);
        fileRequest.input("QTY", sql.Int, item.qty);
        fileRequest.input("PRC", sql.Int, item.prc);
        fileRequest.input("SUP_PRC", sql.Int, item.sup_prc);
        fileRequest.input("TAXAMT", sql.Int, item.taxamt);
        fileRequest.input("NOTE", sql.VarChar, item.note)
  
        await fileRequest.query(`INSERT INTO CJB_TXBL_ITEM (
                                            TAX_MGMTKEY,
                                            TRADE_DT,
                                            ARTC_NM,
                                            STD,
                                            QTY,
                                            PRC,
                                            SUP_PRC,
                                            TAXAMT,
                                            NOTE) VALUES (
                                            @TAX_MGMTKEY,
                                            @TRADE_DT,
                                            @ARTC_NM,
                                            @STD,
                                            @QTY,
                                            @PRC,
                                            @SUP_PRC,
                                            @TAXAMT,
                                            @NOTE);`);
  
      });


    // 차량판매
    const query2 = `UPDATE dbo.CJB_GOODS_FEE
                    SET CASH_RECPT_RCGN_NO = @CASH_RECPT_RCGN_NO
                    WHERE GOODS_FEE_SEQ = @GOODS_FEE_SEQ;
                    `;      

    await Promise.all([request.query(query1), request.query(query2)]);

  } catch (err) {
    console.error("Error inserting car pur:", err);
    throw err;
  }
};



// 제시 수정 등록 
exports.updateCarTax = async ({ 
    taxMgmtkey,                   // 세금 관리키                  
    agentId,                      // 상사 ID                      
    costSeq,                      // 비용 순번                    
    mkDt,                         // 작성 일자                    
    tradeDtime,                   // 거래 일시                    
    delDtime,                     // 삭제 일시                    
    issuShpNm,                    // 발급 형태 명                 
    taxShpNm,                     // 과세 형태 명                 
    taxDrcnNm,                    // 과세 방향 명                 
    taxUseNm,                     // 과세 용도 명                 
    totAmt,                       // 총 금액                      
    totSupPrc,                    // 총 공급가                    
    totVat,                       // 총 부가세                    
    note1,                        // 비고1                        
    splrBrno,                     // 공급자 사업자등록번호        
    splrMrplBizRcgnno,           // 공급자 종사업장 식별번호     
    splrMtlNm,                    // 공급자 상호 명               
    splrPresNm,                   // 공급자 대표자 명             
    splrAddr,                     // 공급자 주소                  
    splrBuco,                     // 공급자 업태                  
    splrStk,                      // 공급자 종목                  
    splrAempNm,                   // 공급자 담당자 명             
    splrAempDeptNm,              // 공급자 담당자 부서 명        
    splrPhon,                     // 공급자 전화번호              
    splrHp,                       // 공급자 연락                  
    splrAempEmail,               // 공급자 담당자 이메일         
    splrNtcchrTrnsYn,            // 공급자 알림문자 전송 여부    
    buyrDocno,                    // 공급받는자 문서번호          
    buyrTpNm,                     // 공급받는자 유형 명           
    buyrBrno,                     // 공급받는자 사업자등록번호    
    buyrMnrBmanRcgnno,           // 공급받는자 종사업자 식별번호 
    buyrMtlNm,                    // 공급받는자 상호 명           
    buyrPresNm,                   // 공급받는자 대표자 명         
    buyrAddr,                     // 공급받는자 주소              
    buyrBuco,                     // 공급받는자 업태              
    buyrStk,                      // 공급받는자 종                
    buyrAempNm,                   // 공급받는자 담당자 명         
    buyrAempDeptNm,              // 공급받는자 담당자 부서 명    
    buyrAempPhon,                // 공급받는자 담당자 전화번호   
    buyrAempHp,                  // 공급받는자 담당자 휴대폰     
    buyrAempEmail,               // 공급받는자 담당자 이메일     
    buyrNtcchrTrnsYn,            // 공급받는자 알림문자 전송 여부
    modCausCd,                   // 수정 사유 코드               
    perssNtsConfNo,              // 당초 국세청 승인 번호        
    memo,                        // 메모                         
    goodsFeeSeq,                 // 상품화비 순번    
    attachedItems,               // 첨부 항목
    regrId,                      // 등록자 ID                    
    modrId,                      // 수정자 ID      
}) => {
try {
  const request = pool.request();
 
  request.input("TAX_MGMTKEY", sql.VarChar, taxMgmtkey);
  request.input("AGENT_ID", sql.VarChar, agentId);
  request.input("COST_SEQ", sql.Int, costSeq);
  request.input("MK_DT", sql.VarChar, mkDt);
  request.input("TRADE_DTIME", sql.VarChar, tradeDtime);
  request.input("DEL_DTIME", sql.VarChar, delDtime);
  request.input("ISSU_SHP_NM", sql.VarChar, issuShpNm);
  request.input("TAX_SHP_NM", sql.VarChar, taxShpNm);
  request.input("TAX_DRCN_NM", sql.VarChar, taxDrcnNm);
  request.input("TAX_USE_NM", sql.VarChar, taxUseNm);
  request.input("TOT_AMT", sql.Decimal, totAmt);
  request.input("TOT_SUP_PRC", sql.Decimal, totSupPrc);
  request.input("TOT_VAT", sql.Decimal, totVat);
  request.input("NOTE1", sql.VarChar, note1);
  request.input("SPLR_BRNO", sql.VarChar, splrBrno);
  request.input("SPLR_MRPL_BIZ_RCGNNO", sql.VarChar, splrMrplBizRcgnno);
  request.input("SPLR_MTL_NM", sql.VarChar, splrMtlNm);
  request.input("SPLR_PRES_NM", sql.VarChar, splrPresNm);
  request.input("SPLR_ADDR", sql.VarChar, splrAddr);
  request.input("SPLR_BUCO", sql.VarChar, splrBuco);
  request.input("SPLR_STK", sql.VarChar, splrStk);
  request.input("SPLR_AEMP_NM", sql.VarChar, splrAempNm);
  request.input("SPLR_AEMP_DEPT_NM", sql.VarChar, splrAempDeptNm);
  request.input("SPLR_PHON", sql.VarChar, splrPhon);
  request.input("SPLR_HP", sql.VarChar, splrHp);
  request.input("SPLR_AEMP_EMAIL", sql.VarChar, splrAempEmail);
  request.input("SPLR_NTCCHR_TRNS_YN", sql.VarChar, splrNtcchrTrnsYn);
  request.input("BUYR_DOCNO", sql.VarChar, buyrDocno);
  request.input("BUYR_TP_NM", sql.VarChar, buyrTpNm);
  request.input("BUYR_BRNO", sql.VarChar, buyrBrno);
  request.input("BUYR_MNR_BMAN_RCGNNO", sql.VarChar, buyrMnrBmanRcgnno);
  request.input("BUYR_MTL_NM", sql.VarChar, buyrMtlNm);
  request.input("BUYR_PRES_NM", sql.VarChar, buyrPresNm);
  request.input("BUYR_ADDR", sql.VarChar, buyrAddr);
  request.input("BUYR_BUCO", sql.VarChar, buyrBuco);
  request.input("BUYR_STK", sql.VarChar, buyrStk);
  request.input("BUYR_AEMP_NM", sql.VarChar, buyrAempNm);
  request.input("BUYR_AEMP_DEPT_NM", sql.VarChar, buyrAempDeptNm);
  request.input("BUYR_AEMP_PHON", sql.VarChar, buyrAempPhon);
  request.input("BUYR_AEMP_HP", sql.VarChar, buyrAempHp);
  request.input("BUYR_AEMP_EMAIL", sql.VarChar, buyrAempEmail);
  request.input("BUYR_NTCCHR_TRNS_YN", sql.VarChar, buyrNtcchrTrnsYn);
  request.input("MOD_CAUS_CD", sql.VarChar, modCausCd);
  request.input("PERSS_NTS_CONF_NO", sql.VarChar, perssNtsConfNo);
  request.input("MEMO", sql.VarChar, memo);
  request.input("GOODS_FEE_SEQ", sql.Int, goodsFeeSeq);
  request.input("REGR_ID", sql.VarChar, regrId);
  request.input("MODR_ID", sql.VarChar, modrId);

  const query1 = `
    UPDATE dbo.CJB_TXBL
    SET AGENT_ID = @AGENT_ID,
        COST_SEQ = @COST_SEQ,
        MK_DT = @MK_DT,
        TRADE_DTIME = @TRADE_DTIME,
        DEL_DTIME = @DEL_DTIME,
        ISSU_SHP_NM = @ISSU_SHP_NM,
        TAX_SHP_NM = @TAX_SHP_NM,
        TAX_DRCN_NM = @TAX_DRCN_NM,
        TAX_USE_NM = @TAX_USE_NM,
        TOT_AMT = @TOT_AMT,
        TOT_SUP_PRC = @TOT_SUP_PRC,
        TOT_VAT = @TOT_VAT,
        NOTE1 = @NOTE1,
        SPLR_BRNO = @SPLR_BRNO,
        SPLR_MRPL_BIZ_RCGNNO = @SPLR_MRPL_BIZ_RCGNNO,
        SPLR_MTL_NM = @SPLR_MTL_NM,
        SPLR_PRES_NM = @SPLR_PRES_NM,
        SPLR_ADDR = @SPLR_ADDR,
        SPLR_BUCO = @SPLR_BUCO,
        SPLR_STK = @SPLR_STK,
        SPLR_AEMP_NM = @SPLR_AEMP_NM,
        SPLR_AEMP_DEPT_NM = @SPLR_AEMP_DEPT_NM,
        SPLR_PHON = @SPLR_PHON,
        SPLR_HP = @SPLR_HP,
        SPLR_AEMP_EMAIL = @SPLR_AEMP_EMAIL,
        SPLR_NTCCHR_TRNS_YN = @SPLR_NTCCHR_TRNS_YN,
        BUYR_DOCNO = @BUYR_DOCNO,
        BUYR_TP_NM = @BUYR_TP_NM,
        BUYR_BRNO = @BUYR_BRNO,
        BUYR_MNR_BMAN_RCGNNO = @BUYR_MNR_BMAN_RCGNNO,
        BUYR_MTL_NM = @BUYR_MTL_NM,
        BUYR_PRES_NM = @BUYR_PRES_NM,
        BUYR_ADDR = @BUYR_ADDR,
        BUYR_BUCO = @BUYR_BUCO,
        BUYR_STK = @BUYR_STK,
        BUYR_AEMP_NM = @BUYR_AEMP_NM,
        BUYR_AEMP_DEPT_NM = @BUYR_AEMP_DEPT_NM,
        BUYR_AEMP_PHON = @BUYR_AEMP_PHON,
        BUYR_AEMP_HP = @BUYR_AEMP_HP,
        BUYR_AEMP_EMAIL = @BUYR_AEMP_EMAIL,
        BUYR_NTCCHR_TRNS_YN = @BUYR_NTCCHR_TRNS_YN,
        MOD_CAUS_CD = @MOD_CAUS_CD,
        PERSS_NTS_CONF_NO = @PERSS_NTS_CONF_NO,
        MEMO = @MEMO,
        GOODS_FEE_SEQ = @GOODS_FEE_SEQ,
        MOD_DTIME = GETDATE(),
        MODR_ID = @MODR_ID
    WHERE TAX_MGMTKEY = @TAX_MGMTKEY;
  `;  

   const query2 = `
        UPDATE CJB_GOODS_FEE
        SET CASH_RECPT_RCGN_NO = @CASH_RECPT_RCGN_NO
        , MOD_DTIME = GETDATE()
        WHERE GOODS_FEE_SEQ = @GOODS_FEE_SEQ;
   `;

   const query3 = `DELETE FROM CJB_TXBL_ITEM WHERE TAX_MGMTKEY = @TAX_MGMTKEY; `
   
   await Promise.all([request.query(query1), request.query(query2), request.query(query3)]);

   attachedItems.forEach(async (item) => {

    console.log("file:", item.artcNm);
    console.log("file:", item.tradeDtime);
    console.log("file:", item.std);

    const fileRequest = pool.request();

    fileRequest.input("TAX_MGMTKEY", sql.VarChar, taxMgmtkey);
    fileRequest.input("TRADE_DT", sql.VarChar, tradeDtime);
    fileRequest.input("ARTC_NM", sql.VarChar, item.artcNm);
    fileRequest.input("STD", sql.Int, item.std);
    fileRequest.input("QTY", sql.Int, item.qty);
    fileRequest.input("PRC", sql.Int, item.prc);
    fileRequest.input("SUP_PRC", sql.Int, item.sup_prc);
    fileRequest.input("TAXAMT", sql.Int, item.taxamt);
    fileRequest.input("NOTE", sql.VarChar, item.note)

    await fileRequest.query(`INSERT INTO CJB_TXBL_ITEM (
                                        TAX_MGMTKEY,
                                        TRADE_DT,
                                        ARTC_NM,
                                        STD,
                                        QTY,
                                        PRC,
                                        SUP_PRC,
                                        TAXAMT,
                                        NOTE) VALUES (
                                        @TAX_MGMTKEY,
                                        @TRADE_DT,
                                        @ARTC_NM,
                                        @STD,
                                        @QTY,
                                        @PRC,
                                        @SUP_PRC,
                                        @TAXAMT,
                                        @NOTE);`);

  });



} catch (err) {
  console.error("Error updating car pur:", err);
  throw err;
}
};
