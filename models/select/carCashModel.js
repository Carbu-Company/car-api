const sql = require("mssql");
const pool = require("../../config/db");


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 현금영수증 2.0
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// 현금영수증(004), 전자세금계산서(001) 목록 조회 (발행 대상 목록 정보 )
exports.getTradeIssueList = async ({ 
  agentId, 
  page,
  pageSize,
  carNo,
  dealer,
  dtGubun,
  startDt,
  endDt, 
  dtlNewCarNo,
  dtlOldCarNo,
  dtlCustomerName,
  dtlSaleItem,
  dtlMemo,
  dtlTradeProcNm,
  dtlTradeSctGubun,
  dtlCrStat,
  dtlRcgnNo,
  dtlNtsConfNo,
  orderItem = '01',
  ordAscDesc = 'desc',
  taxGubun = '004'  // 004: 현금영수증, 001: 전자세금계산서
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
    console.log('dtlCustomerName:', dtlCustomerName);
    console.log('dtlSaleItem:', dtlSaleItem);
    console.log('dtlMemo:', dtlMemo);
    console.log('dtlTradeProcNm:', dtlTradeProcNm);
    console.log('dtlTradeSctGubun:', dtlTradeSctGubun);
    console.log('dtlCrStat:', dtlCrStat);
    console.log('dtlRcgnNo:', dtlRcgnNo);
    console.log('dtlNtsConfNo:', dtlNtsConfNo);
    console.log('orderItem:', orderItem);
    console.log('ordAscDesc:', ordAscDesc);
    console.log('taxGubun:', taxGubun);

    request.input("AGENT_ID", sql.VarChar, agentId);
    request.input("PAGE_SIZE", sql.Int, pageSize);
    request.input("PAGE", sql.Int, page);
  
    if (carNo) request.input("CAR_NO", sql.VarChar, `%${carNo}%`);
    if (dealer) request.input("DEALER", sql.VarChar, `%${dealer}%`);
    if (dtGubun) request.input("DT_GUBUN", sql.VarChar, dtGubun);
    if (startDt) request.input("START_DT", sql.VarChar, startDt);
    if (endDt) request.input("END_DT", sql.VarChar, endDt);

    if (dtlNewCarNo) request.input("DTL_NEW_CAR_NO", sql.VarChar, `%${dtlNewCarNo}%`);
    if (dtlOldCarNo) request.input("DTL_OLD_CAR_NO", sql.VarChar, `%${dtlOldCarNo}%`);
    if (dtlCustomerName) request.input("DTL_CUSTOMER_NAME", sql.VarChar, `%${dtlCustomerName}%`);
    if (dtlMemo) request.input("MEMO", sql.VarChar, `%${dtlMemo}%`);
    if (dtlTradeProcNm) request.input("TRADE_PROC_NM", sql.VarChar, `%${dtlTradeProcNm}%`);
    if (dtlTradeSctGubun) request.input("TRADE_SCT_NM", sql.VarChar, dtlTradeSctGubun);
    if (dtlCrStat && dtlCrStat.length > 0) request.input("CR_MTS_STAT_CD", sql.VarChar, dtlCrStat.join(','));
    if (dtlRcgnNo) request.input("RCGN_NO", sql.VarChar, `%${dtlRcgnNo}%`);
    if (dtlNtsConfNo) request.input("NTS_CONF_NO", sql.VarChar, `%${dtlNtsConfNo}%`);
    if (taxGubun) request.input("TAX_GUBUN", sql.VarChar, taxGubun);

    // 전체 카운트 조회
    const countQuery = `
            SELECT COUNT(*) as totalCount
              FROM dbo.CJB_CAR_TRADE_AMT A
                , dbo.CJB_CAR_PUR B
                , dbo.CJB_CAR_SEL C
            WHERE 1 = 1
              AND B.AGENT_ID = @AGENT_ID -- 상사ID
              AND A.CAR_REG_ID = B.CAR_REG_ID 
              AND B.CAR_REG_ID = C.CAR_REG_ID 
              AND A.TRADE_PAY_DT IS NULL
              AND A.TRADE_EVDC_CD = @TAX_GUBUN
          ${carNo ? "AND (D.CAR_NO LIKE @CAR_NO OR D.PUR_BEF_CAR_NO LIKE @CAR_NO OR C.SALE_CAR_NO LIKE @CAR_NO)" : ""}
          ${dealer ? "AND (D.DLR_ID LIKE @DEALER OR C.DLR_ID LIKE @DEALER)" : ""}
          ${startDt ? `AND ${dtGubun === '1' ? 'D.TRADE_DT' : dtGubun === '2' ? 'C.CAR_SALE_DT' : 'B.CAR_PUR_DT'} >= @START_DT` : ""}
          ${endDt ? `AND ${dtGubun === '1' ? 'D.TRADE_DT' : dtGubun === '2' ? 'C.CAR_SALE_DT' : 'B.CAR_PUR_DT'} <= @END_DT` : ""}
          ${dtlCustomerName ? "AND (D.OWNR_NM LIKE @DTL_CUSTOMER_NAME OR C.BUYER_NM LIKE @DTL_CUSTOMER_NAME)" : ""}
          ${dtlSaleItem ? `AND ${dtlSaleItem === '1' ? 'C.SALE_AMT' : dtlSaleItem === '2' ? 'C.AGENT_SEL_COST' : 'C.PREF_INFE_AMT'} > 0` : ""}
          ${dtlMemo ? "AND A.MEMO LIKE @MEMO" : ""}
          ${dtlTradeProcNm ? "AND A.TRADE_PROC_NM LIKE @TRADE_PROC_NM" : ""}
          ${dtlTradeSctGubun ? "AND A.TRADE_SCT_NM = @TRADE_SCT_NM" : ""}
          ${dtlCrStat && dtlCrStat.length > 0 ? "AND A.CR_MTS_STAT_CD = @CR_MTS_STAT_CD" : ""}
          ${dtlRcgnNo ? "AND A.RCGN_NO = @RCGN_NO" : ""}
          ${dtlNtsConfNo ? "AND A.NTS_CONF_NO = @NTS_CONF_NO" : ""}
    `;

    console.log('countQuery:', countQuery);
  
    const dataQuery = `
                 SELECT T.TRADE_SEQ
                      , T.CAR_DT
                      , T.CAR_NM
                      , T.CAR_NO
                      , T.DLR_ID
                      , T.DLR_NM
                      , T.TRADE_DT
                      , T.TRADE_ITEM_CD
                      , T.TRADE_ITEM_NM
                      , T.TRADE_ITEM_AMT
                      , T.TRADE_ITEM_SUP_PRC
                      , T.TRADE_ITEM_VAT
                      , T.TRADE_TGT_NM
                      , T.TRADE_TGT_PHON
                      , T.TRADE_TP_CD
                      , T.TRADE_TP_NM
                      , T.RCGN_NO
                      , T.CAR_REG_ID
                      , T.PUR_BEF_CAR_NO
                      , T.SALE_CAR_NO
                      , T.SEL_DLR_ID
                      , T.SEL_DLR_NM
                      , T.CAR_SALE_DT
                      , T.TRADE_MEMO
                      , T.CUST_NM
                      , T.CUST_PHON
                      , T.CUST_BRNO
                    FROM (SELECT TRADE_SEQ
                          , B.CAR_PUR_DT + ' (매입)' CAR_DT
                          , B.CAR_NM
                          , B.CAR_NO
                          , B.DLR_ID
                          , (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = B.DLR_ID) AS DLR_NM
                          , A.TRADE_DT
                          , A.TRADE_ITEM_CD
                          , A.TRADE_ITEM_NM
                          , A.TRADE_ITEM_AMT
                          , A.TRADE_ITEM_SUP_PRC
                          , A.TRADE_ITEM_VAT
                          , A.TRADE_TGT_NM
                          , A.TRADE_TGT_PHON
                          , A.TRADE_TP_CD
                          , dbo.CJB_FN_GET_CD_NM('28', A.TRADE_TP_CD) TRADE_TP_NM
                          , A.RCGN_NO
                          , A.CAR_REG_ID
                          , B.PUR_BEF_CAR_NO
                          , C.SALE_CAR_NO
                          , C.DLR_ID AS SEL_DLR_ID
                          , (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = C.DLR_ID) AS SEL_DLR_NM
                          , C.CAR_SALE_DT
                          , A.TRADE_MEMO
                          , B.OWNR_NM　CUST_NM
                          , B.OWNR_PHON CUST_PHON
                          , B.OWNR_BRNO CUST_BRNO
                       FROM dbo.CJB_CAR_TRADE_AMT A
                          , dbo.CJB_CAR_PUR B
                          , dbo.CJB_CAR_SEL C
                      WHERE 1 = 1
                        AND B.AGENT_ID = @AGENT_ID -- 상사ID
                        AND A.CAR_REG_ID = B.CAR_REG_ID 
                        AND B.CAR_REG_ID = C.CAR_REG_ID 
                        AND A.TRADE_PAY_DT IS NULL
                        AND A.TRADE_EVDC_CD = @TAX_GUBUN -- 현금영수즈 코드 
                        AND A.TRADE_SCT_CD = '0' --- 매입자료 
                      UNION ALL
                      SELECT A.TRADE_SEQ
                          , C.SALE_REG_DT  + ' (매출)' CAR_DT
                          , B.CAR_NM
                          , B.CAR_NO
                          , B.DLR_ID
                          , (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = B.DLR_ID) AS DLR_NM
                          , A.TRADE_DT
                          , A.TRADE_ITEM_CD
                          , A.TRADE_ITEM_NM
                          , A.TRADE_ITEM_AMT
                          , A.TRADE_ITEM_SUP_PRC
                          , A.TRADE_ITEM_VAT
                          , A.TRADE_TGT_NM
                          , A.TRADE_TGT_PHON
                          , A.TRADE_TP_CD
                          , dbo.CJB_FN_GET_CD_NM('28', A.TRADE_TP_CD) TRADE_TP_NM
                          , A.RCGN_NO
                          , A.CAR_REG_ID
                          , B.PUR_BEF_CAR_NO
                          , C.SALE_CAR_NO
                          , C.DLR_ID AS SEL_DLR_ID
                          , (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = C.DLR_ID) AS SEL_DLR_NM
                          , C.CAR_SALE_DT
                          , A.TRADE_MEMO
                          , C.BUYER_NM  CUST_NM
                          , C.BUYER_PHON CUST_PHON
                          , C.BUYER_BRNO CUST_BRNO
                        FROM dbo.CJB_CAR_TRADE_AMT A
                          , dbo.CJB_CAR_PUR B
                          , dbo.CJB_CAR_SEL C
                      WHERE 1 = 1
                        AND B.AGENT_ID = @AGENT_ID-- 상사ID
                        AND A.CAR_REG_ID = B.CAR_REG_ID 
                        AND B.CAR_REG_ID = C.CAR_REG_ID 
                        AND A.TRADE_PAY_DT IS NULL
                        AND A.TRADE_EVDC_CD = @TAX_GUBUN
                        AND A.TRADE_SCT_CD = '1' --- 매출자료 
                    ) T
              WHERE 1 = 1
          ${carNo ? "AND (T.CAR_NO LIKE @CAR_NO OR T.PUR_BEF_CAR_NO LIKE @CAR_NO OR T.SALE_CAR_NO LIKE @CAR_NO)" : ""}
          ${dealer ? "AND (T.DLR_ID LIKE @DEALER OR T.SEL_DLR_ID LIKE @DEALER)" : ""}
          ${startDt ? `AND ${dtGubun === '1' ? 'T.TRADE_DT' : dtGubun === '2' ? 'T.CAR_SALE_DT' : 'B.CAR_PUR_DT'} >= @START_DT` : ""}
          ${endDt ? `AND ${dtGubun === '1' ? 'T.TRADE_DT' : dtGubun === '2' ? 'T.CAR_SALE_DT' : 'B.CAR_PUR_DT'} <= @END_DT` : ""}
          ${dtlCustomerName ? "AND (T.OWNR_NM LIKE @DTL_CUSTOMER_NAME OR T.BUYER_NM LIKE @DTL_CUSTOMER_NAME)" : ""}
          ${dtlSaleItem ? `AND ${dtlSaleItem === '1' ? 'C.SALE_AMT' : dtlSaleItem === '2' ? 'C.AGENT_SEL_COST' : 'C.PREF_INFE_AMT'} > 0` : ""}
          ${dtlMemo ? "AND T.TRADE_MEMO LIKE @MEMO" : ""}
          ${dtlTradeProcNm ? "AND A.TRADE_PROC_NM LIKE @TRADE_PROC_NM" : ""}
          ${dtlTradeSctGubun ? "AND A.TRADE_SCT_NM = @TRADE_SCT_NM" : ""}
          ${dtlCrStat && dtlCrStat.length > 0 ? "AND A.CR_MTS_STAT_CD = @CR_MTS_STAT_CD" : ""}
          ${dtlRcgnNo ? "AND A.RCGN_NO = @RCGN_NO" : ""}
          ${dtlNtsConfNo ? "AND A.NTS_CONF_NO = @NTS_CONF_NO" : ""}
        ORDER BY ${orderItem === '01' ? 'T.TRADE_DT' : orderItem === '02' ? 'T.DLR_ID' : orderItem === '03' ? 'T.CAR_DT' : orderItem} ${ordAscDesc}
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


// 현금영수증 합계 조회 (발행 대상 목록 정보 합계)
exports.getTradeIssueSummary = async ({  
  agentId, 
  page,
  pageSize,
  carNo,
  dealer,
  dtGubun,
  startDt,
  endDt, 
  dtlNewCarNo,
  dtlOldCarNo,
  dtlCustomerName,
  dtlSaleItem,
  dtlMemo,
  dtlTradeProcNm,
  dtlTradeSctGubun,
  dtlCrStat,
  dtlRcgnNo,
  dtlNtsConfNo,
  orderItem = '01',
  ordAscDesc = 'desc',
  taxGubun = '004'  // 004: 현금영수증, 001: 전자세금계산서
}) => {
  try {
    const request = pool.request();

    request.input("AGENT_ID", sql.VarChar, agentId);
    request.input("PAGE_SIZE", sql.Int, pageSize);
    request.input("PAGE", sql.Int, page);

    if (carNo) request.input("CAR_NO", sql.VarChar, `%${carNo}%`);
    if (dealer) request.input("DEALER", sql.VarChar, `%${dealer}%`);
    if (dtGubun) request.input("DT_GUBUN", sql.VarChar, dtGubun);
    if (startDt) request.input("START_DT", sql.VarChar, startDt);
    if (endDt) request.input("END_DT", sql.VarChar, endDt);
    if (dtlNewCarNo) request.input("DTL_NEW_CAR_NO", sql.VarChar, `%${dtlNewCarNo}%`);
    if (dtlOldCarNo) request.input("DTL_OLD_CAR_NO", sql.VarChar, `%${dtlOldCarNo}%`);
    if (dtlCustomerName) request.input("DTL_CUSTOMER_NAME", sql.VarChar, `%${dtlCustomerName}%`);
    if (dtlMemo) request.input("MEMO", sql.VarChar, `%${dtlMemo}%`);
    if (dtlTradeProcNm) request.input("TRADE_PROC_NM", sql.VarChar, `%${dtlTradeProcNm}%`);
    if (dtlTradeSctGubun) request.input("TRADE_SCT_NM", sql.VarChar, dtlTradeSctGubun);
    if (dtlCrStat && dtlCrStat.length > 0) request.input("CR_MTS_STAT_CD", sql.VarChar, dtlCrStat.join(','));
    if (dtlRcgnNo) request.input("RCGN_NO", sql.VarChar, `%${dtlRcgnNo}%`);
    if (dtlNtsConfNo) request.input("NTS_CONF_NO", sql.VarChar, `%${dtlNtsConfNo}%`);
    if (taxGubun) request.input("TAX_GUBUN", sql.VarChar, taxGubun);

    const query = `SELECT A.TRADE_TP_CD
                        , dbo.CJB_FN_GET_CD_NM('28', A.TRADE_TP_CD) TRADE_TP_NM
                        , MIN(CASE WHEN A.TRADE_SCT_CD = '0' THEN '매입' ELSE '매출' END) TRADE_SCT_NM
                        , COUNT(A.TRADE_SEQ) CNT
                        , ISNULL(SUM(A.TRADE_ITEM_AMT), 0) TRADE_AMT
                        , ISNULL(SUM(A.TRADE_ITEM_SUP_PRC), 0) SUP_PRC
                        , ISNULL(SUM(A.TRADE_ITEM_VAT), 0) VAT
                    FROM dbo.CJB_CAR_TRADE_AMT A
                    INNER JOIN dbo.CJB_CAR_SEL C ON (A.CAR_REG_ID = C.CAR_REG_ID)
                    INNER JOIN dbo.CJB_CAR_PUR D ON (C.CAR_REG_ID = D.CAR_REG_ID)
                    WHERE 1 = 1
                      AND B.AGENT_ID = @AGENT_ID -- 상사ID
                      AND A.TRADE_PAY_DT IS NULL
                      AND A.TRADE_EVDC_CD = @TAX_GUBUN -- 현금영수즈 코드 
              ${carNo ? "AND (D.CAR_NO LIKE @CAR_NO OR D.PUR_BEF_CAR_NO LIKE @CAR_NO OR C.SALE_CAR_NO LIKE @CAR_NO)" : ""}
              ${dealer ? "AND (D.DLR_ID LIKE @DEALER OR C.DLR_ID LIKE @DEALER)" : ""}
              ${startDt ? `AND ${dtGubun === '1' ? 'D.TRADE_DT' : dtGubun === '2' ? 'C.CAR_SALE_DT' : 'B.CAR_PUR_DT'} >= @START_DT` : ""}
              ${endDt ? `AND ${dtGubun === '1' ? 'D.TRADE_DT' : dtGubun === '2' ? 'C.CAR_SALE_DT' : 'B.CAR_PUR_DT'} <= @END_DT` : ""}
              ${dtlCustomerName ? "AND (D.OWNR_NM LIKE @DTL_CUSTOMER_NAME OR C.BUYER_NM LIKE @DTL_CUSTOMER_NAME)" : ""}
              ${dtlSaleItem ? `AND ${dtlSaleItem === '1' ? 'C.SALE_AMT' : dtlSaleItem === '2' ? 'C.AGENT_SEL_COST' : 'C.PREF_INFE_AMT'} > 0` : ""}
              ${dtlMemo ? "AND A.TRADE_MEMO LIKE @MEMO" : ""}
              ${dtlTradeProcNm ? "AND A.TRADE_PROC_NM LIKE @TRADE_PROC_NM" : ""}
              ${dtlTradeSctGubun ? "AND A.TRADE_SCT_NM = @TRADE_SCT_NM" : ""}
              ${dtlCrStat && dtlCrStat.length > 0 ? "AND A.CR_MTS_STAT_CD = @CR_MTS_STAT_CD" : ""}
              ${dtlRcgnNo ? "AND A.RCGN_NO = @RCGN_NO" : ""}
              ${dtlNtsConfNo ? "AND A.NTS_CONF_NO = @NTS_CONF_NO" : ""}              
                      GROUP BY A.TRADE_TP_CD --- 소득공제, 지출증빙 
      `;


    console.log('query:', query);

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching car pur sum:", err);
    throw err;
  }
};



// 현금영수증 발행 완료된 목록 조회
exports.getCarCashList = async ({ 
  agentId, 
  page,
  pageSize,
  carNo,
  dealer,
  dtGubun,
  startDt,
  endDt, 
  dtlNewCarNo,
  dtlOldCarNo,
  dtlCustomerName,
  dtlSaleItem,
  dtlMemo,
  dtlTradeProcNm,
  dtlTradeSctGubun,
  dtlCrStat,
  dtlRcgnNo,
  dtlNtsConfNo,
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
    console.log('dtlCustomerName:', dtlCustomerName);
    console.log('dtlSaleItem:', dtlSaleItem);
    console.log('dtlMemo:', dtlMemo);
    console.log('dtlTradeProcNm:', dtlTradeProcNm);
    console.log('dtlTradeSctGubun:', dtlTradeSctGubun);
    console.log('dtlCrStat:', dtlCrStat);
    console.log('dtlRcgnNo:', dtlRcgnNo);
    console.log('dtlNtsConfNo:', dtlNtsConfNo);
    console.log('orderItem:', orderItem);
    console.log('ordAscDesc:', ordAscDesc);

    request.input("AGENT_ID", sql.VarChar, agentId);
    request.input("PAGE_SIZE", sql.Int, pageSize);
    request.input("PAGE", sql.Int, page);
  
    if (carNo) request.input("CAR_NO", sql.VarChar, `%${carNo}%`);
    if (dealer) request.input("DEALER", sql.VarChar, `%${dealer}%`);
    if (dtGubun) request.input("DT_GUBUN", sql.VarChar, dtGubun);
    if (startDt) request.input("START_DT", sql.VarChar, startDt);
    if (endDt) request.input("END_DT", sql.VarChar, endDt);

    if (dtlNewCarNo) request.input("DTL_NEW_CAR_NO", sql.VarChar, `%${dtlNewCarNo}%`);
    if (dtlOldCarNo) request.input("DTL_OLD_CAR_NO", sql.VarChar, `%${dtlOldCarNo}%`);
    if (dtlCustomerName) request.input("DTL_CUSTOMER_NAME", sql.VarChar, `%${dtlCustomerName}%`);
    if (dtlMemo) request.input("MEMO", sql.VarChar, `%${dtlMemo}%`);
    if (dtlTradeProcNm) request.input("TRADE_PROC_NM", sql.VarChar, `%${dtlTradeProcNm}%`);
    if (dtlTradeSctGubun) request.input("TRADE_SCT_NM", sql.VarChar, dtlTradeSctGubun);
    if (dtlCrStat && dtlCrStat.length > 0) request.input("CR_MTS_STAT_CD", sql.VarChar, dtlCrStat.join(','));
    if (dtlRcgnNo) request.input("RCGN_NO", sql.VarChar, `%${dtlRcgnNo}%`);
    if (dtlNtsConfNo) request.input("NTS_CONF_NO", sql.VarChar, `%${dtlNtsConfNo}%`);

    // 전체 카운트 조회
    const countQuery = `
    SELECT COUNT(*) as totalCount
                    FROM dbo.CJB_GOODS_FEE B 
                    LEFT JOIN dbo.CJB_CASH_RECPT A ON (A.GOODS_FEE_SEQ = B.GOODS_FEE_SEQ)
                            LEFT JOIN dbo.CJB_CAR_PUR D ON (B.CAR_REG_ID = D.CAR_REG_ID)
                            LEFT JOIN dbo.CJB_CAR_SEL C ON (C.CAR_REG_ID = D.CAR_REG_ID)
                  WHERE B.AGENT_ID = @CAR_AGENT
                    AND D.CAR_DEL_YN = 'N'
                    AND B.EXPD_EVDC_CD = '004'
          ${carNo ? "AND (D.CAR_NO LIKE @CAR_NO OR D.PUR_BEF_CAR_NO LIKE @CAR_NO OR C.SALE_CAR_NO LIKE @CAR_NO)" : ""}
          ${dealer ? "AND (D.DLR_ID LIKE @DEALER OR C.DLR_ID LIKE @DEALER)" : ""}
          ${startDt ? `AND ${dtGubun === '1' ? 'D.TRADE_DT' : dtGubun === '2' ? 'C.CAR_SALE_DT' : 'B.CAR_PUR_DT'} >= @START_DT` : ""}
          ${endDt ? `AND ${dtGubun === '1' ? 'D.TRADE_DT' : dtGubun === '2' ? 'C.CAR_SALE_DT' : 'B.CAR_PUR_DT'} <= @END_DT` : ""}
          ${dtlCustomerName ? "AND (D.OWNR_NM LIKE @DTL_CUSTOMER_NAME OR C.BUYER_NM LIKE @DTL_CUSTOMER_NAME)" : ""}
          ${dtlSaleItem ? `AND ${dtlSaleItem === '1' ? 'C.SALE_AMT' : dtlSaleItem === '2' ? 'C.AGENT_SEL_COST' : 'C.PREF_INFE_AMT'} > 0` : ""}
          ${dtlMemo ? "AND A.MEMO LIKE @MEMO" : ""}
          ${dtlTradeProcNm ? "AND A.TRADE_PROC_NM LIKE @TRADE_PROC_NM" : ""}
          ${dtlTradeSctGubun ? "AND A.TRADE_SCT_NM = @TRADE_SCT_NM" : ""}
          ${dtlCrStat && dtlCrStat.length > 0 ? "AND A.CR_MTS_STAT_CD = @CR_MTS_STAT_CD" : ""}
          ${dtlRcgnNo ? "AND A.RCGN_NO = @RCGN_NO" : ""}
          ${dtlNtsConfNo ? "AND A.NTS_CONF_NO = @NTS_CONF_NO" : ""}
    `;

    console.log('countQuery:', countQuery);
  
    const dataQuery = `
                  SELECT A.AGENT_ID
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
                      , A.NTS_CONF_NO     -- 국세청 승인 번호
                      , A.TRADE_DT
                      , A.TRADE_SCT_NM     -- 거래 구분  (승인, 취소)
                      , A.TRADE_TP_NM      -- 거래 유형  (소득공제, 지출증빙)
                      , A.TRADE_AMT   -- 거래 금액
                      , A.RCGN_NO               -- 식별 번호
                      , A.CUST_NM               -- 고객명
                      , A.CUST_HP               -- 고객 휴대폰번호
                      , A.CUST_EMAIL            -- 고객 이메일
                      , A.ORD_GOODS_NM          -- 주문 상품명(품명)
                      , A.CR_TRNS_STAT_CD       -- 현금영수증 전송 상태 코드
                      , dbo.CJB_FN_GET_CD_NM('22', A.CR_TRNS_STAT_CD) CR_TRNS_STAT_NM
                      , A.GOODS_FEE_SEQ
                      , D.AGENT_ID
                      , D.CAR_REG_ID                -- 차량 등록 번호
                      , D.CAR_STAT_CD               -- 차량 상태 코드
                      , D.CAR_NO              -- 매입(제시) 차량번호
                      , D.CAR_NM              -- 매입(제시) 차량명
                      , D.CAR_PUR_DT         -- 차량 매입(제시)일
                      , D.DLR_ID                   -- 매입(제시) 딜러 아이디
                      , (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = D.DLR_ID) AS DLR_NM  -- 매입(제시) 딜러 아이디
                    FROM dbo.CJB_GOODS_FEE B 
                    LEFT JOIN dbo.CJB_CASH_RECPT A ON (A.GOODS_FEE_SEQ = B.GOODS_FEE_SEQ)
                            LEFT JOIN dbo.CJB_CAR_PUR D ON (B.CAR_REG_ID = D.CAR_REG_ID)
                            LEFT JOIN dbo.CJB_CAR_SEL C ON (C.CAR_REG_ID = D.CAR_REG_ID)
                  WHERE B.AGENT_ID = @CAR_AGENT
                    AND D.CAR_DEL_YN = 'N'
                    AND B.EXPD_EVDC_CD = '004'
          ${carNo ? "AND (D.CAR_NO LIKE @CAR_NO OR D.PUR_BEF_CAR_NO LIKE @CAR_NO OR C.SALE_CAR_NO LIKE @CAR_NO)" : ""}
          ${dealer ? "AND (D.DLR_ID LIKE @DEALER OR C.DLR_ID LIKE @DEALER)" : ""}
          ${startDt ? `AND ${dtGubun === '1' ? 'D.TRADE_DT' : dtGubun === '2' ? 'C.CAR_SALE_DT' : 'B.CAR_PUR_DT'} >= @START_DT` : ""}
          ${endDt ? `AND ${dtGubun === '1' ? 'D.TRADE_DT' : dtGubun === '2' ? 'C.CAR_SALE_DT' : 'B.CAR_PUR_DT'} <= @END_DT` : ""}
          ${dtlCustomerName ? "AND (D.OWNR_NM LIKE @DTL_CUSTOMER_NAME OR C.BUYER_NM LIKE @DTL_CUSTOMER_NAME)" : ""}
          ${dtlSaleItem ? `AND ${dtlSaleItem === '1' ? 'C.SALE_AMT' : dtlSaleItem === '2' ? 'C.AGENT_SEL_COST' : 'C.PREF_INFE_AMT'} > 0` : ""}
          ${dtlMemo ? "AND A.MEMO LIKE @MEMO" : ""}
          ${dtlTradeProcNm ? "AND A.TRADE_PROC_NM LIKE @TRADE_PROC_NM" : ""}
          ${dtlTradeSctGubun ? "AND A.TRADE_SCT_NM = @TRADE_SCT_NM" : ""}
          ${dtlCrStat && dtlCrStat.length > 0 ? "AND A.CR_MTS_STAT_CD = @CR_MTS_STAT_CD" : ""}
          ${dtlRcgnNo ? "AND A.RCGN_NO = @RCGN_NO" : ""}
          ${dtlNtsConfNo ? "AND A.NTS_CONF_NO = @NTS_CONF_NO" : ""}
        ORDER BY ${orderItem === '01' ? 'A.TRADE_DT' : orderItem === '02' ? 'C.DLR_ID' : orderItem === '03' ? 'D.CAR_PUR_DT' : orderItem} ${ordAscDesc}
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


// 현금영수증 발행 완료된 목록 합계 조회
exports.getCarCashSummary = async ({  
  agentId, 
  page,
  pageSize,
  carNo,
  dealer,
  dtGubun,
  startDt,
  endDt, 
  dtlNewCarNo,
  dtlOldCarNo,
  dtlCustomerName,
  dtlSaleItem,
  dtlMemo,
  dtlTradeProcNm,
  dtlTradeSctGubun,
  dtlCrStat,
  dtlRcgnNo,
  dtlNtsConfNo,
  orderItem = '01',
  ordAscDesc = 'desc'
}) => {
  try {
    const request = pool.request();

    request.input("AGENT_ID", sql.VarChar, agentId);
    request.input("PAGE_SIZE", sql.Int, pageSize);
    request.input("PAGE", sql.Int, page);

    if (carNo) request.input("CAR_NO", sql.VarChar, `%${carNo}%`);
    if (dealer) request.input("DEALER", sql.VarChar, `%${dealer}%`);
    if (dtGubun) request.input("DT_GUBUN", sql.VarChar, dtGubun);
    if (startDt) request.input("START_DT", sql.VarChar, startDt);
    if (endDt) request.input("END_DT", sql.VarChar, endDt);
    if (dtlNewCarNo) request.input("DTL_NEW_CAR_NO", sql.VarChar, `%${dtlNewCarNo}%`);
    if (dtlOldCarNo) request.input("DTL_OLD_CAR_NO", sql.VarChar, `%${dtlOldCarNo}%`);
    if (dtlCustomerName) request.input("DTL_CUSTOMER_NAME", sql.VarChar, `%${dtlCustomerName}%`);
    if (dtlMemo) request.input("MEMO", sql.VarChar, `%${dtlMemo}%`);
    if (dtlTradeProcNm) request.input("TRADE_PROC_NM", sql.VarChar, `%${dtlTradeProcNm}%`);
    if (dtlTradeSctGubun) request.input("TRADE_SCT_NM", sql.VarChar, dtlTradeSctGubun);
    if (dtlCrStat && dtlCrStat.length > 0) request.input("CR_MTS_STAT_CD", sql.VarChar, dtlCrStat.join(','));
    if (dtlRcgnNo) request.input("RCGN_NO", sql.VarChar, `%${dtlRcgnNo}%`);
    if (dtlNtsConfNo) request.input("NTS_CONF_NO", sql.VarChar, `%${dtlNtsConfNo}%`);

    const query = `SELECT '소득공제' AS TRADE_TP_NM
                        , '승인' AS TRADE_PROC_NM
                        , COUNT(A.CASH_MGMTKEY) CNT
                        , ISNULL(SUM(A.TRADE_AMT), 0) TRADE_AMT
                        , ISNULL(SUM(A.SUP_PRC), 0) SUP_PRC
                        , ISNULL(SUM(A.VAT), 0) VAT
                    FROM dbo.CJB_CASH_RECPT A
                    LEFT JOIN dbo.CJB_GOODS_FEE B ON (A.GOODS_FEE_SEQ = B.GOODS_FEE_SEQ)
                            LEFT JOIN dbo.CJB_CAR_SEL C ON (B.CAR_REG_ID = C.CAR_REG_ID)
                            LEFT JOIN dbo.CJB_CAR_PUR D ON (C.CAR_REG_ID = D.CAR_REG_ID)
                  WHERE A.AGENT_ID = @AGENT_ID -- 상사ID
                    AND D.CAR_DEL_YN = 'N'
              AND A.TRADE_TP_NM = '소득공제'
              AND A.TRADE_PROC_NM = '승인'
              ${carNo ? "AND (D.CAR_NO LIKE @CAR_NO OR D.PUR_BEF_CAR_NO LIKE @CAR_NO OR C.SALE_CAR_NO LIKE @CAR_NO)" : ""}
              ${dealer ? "AND (D.DLR_ID LIKE @DEALER OR C.DLR_ID LIKE @DEALER)" : ""}
              ${startDt ? `AND ${dtGubun === '1' ? 'D.TRADE_DT' : dtGubun === '2' ? 'C.CAR_SALE_DT' : 'B.CAR_PUR_DT'} >= @START_DT` : ""}
              ${endDt ? `AND ${dtGubun === '1' ? 'D.TRADE_DT' : dtGubun === '2' ? 'C.CAR_SALE_DT' : 'B.CAR_PUR_DT'} <= @END_DT` : ""}
              ${dtlCustomerName ? "AND (D.OWNR_NM LIKE @DTL_CUSTOMER_NAME OR C.BUYER_NM LIKE @DTL_CUSTOMER_NAME)" : ""}
              ${dtlSaleItem ? `AND ${dtlSaleItem === '1' ? 'C.SALE_AMT' : dtlSaleItem === '2' ? 'C.AGENT_SEL_COST' : 'C.PREF_INFE_AMT'} > 0` : ""}
              ${dtlMemo ? "AND A.MEMO LIKE @MEMO" : ""}
              ${dtlTradeProcNm ? "AND A.TRADE_PROC_NM LIKE @TRADE_PROC_NM" : ""}
              ${dtlTradeSctGubun ? "AND A.TRADE_SCT_NM = @TRADE_SCT_NM" : ""}
              ${dtlCrStat && dtlCrStat.length > 0 ? "AND A.CR_MTS_STAT_CD = @CR_MTS_STAT_CD" : ""}
              ${dtlRcgnNo ? "AND A.RCGN_NO = @RCGN_NO" : ""}
              ${dtlNtsConfNo ? "AND A.NTS_CONF_NO = @NTS_CONF_NO" : ""}
                    UNION ALL
                    SELECT '소득공제' AS TRADE_TP_NM
                        , '취소' AS TRADE_PROC_NM
                        , COUNT(A.CASH_MGMTKEY) CNT
                        , ISNULL(SUM(A.TRADE_AMT), 0) TRADE_AMT
                        , ISNULL(SUM(A.SUP_PRC), 0) SUP_PRC
                        , ISNULL(SUM(A.VAT), 0) VAT
                    FROM dbo.CJB_CASH_RECPT A
                    LEFT JOIN dbo.CJB_GOODS_FEE B ON (A.GOODS_FEE_SEQ = B.GOODS_FEE_SEQ)
                            LEFT JOIN dbo.CJB_CAR_SEL C ON (B.CAR_REG_ID = C.CAR_REG_ID)
                            LEFT JOIN dbo.CJB_CAR_PUR D ON (C.CAR_REG_ID = D.CAR_REG_ID)
                  WHERE A.AGENT_ID = @AGENT_ID -- 상사ID
                    AND D.CAR_DEL_YN = 'N'
              AND A.TRADE_TP_NM = '소득공제'
              AND A.TRADE_PROC_NM = '취소'
              ${carNo ? "AND (D.CAR_NO LIKE @CAR_NO OR D.PUR_BEF_CAR_NO LIKE @CAR_NO OR C.SALE_CAR_NO LIKE @CAR_NO)" : ""}
              ${dealer ? "AND (D.DLR_ID LIKE @DEALER OR C.DLR_ID LIKE @DEALER)" : ""}
              ${startDt ? `AND ${dtGubun === '1' ? 'D.TRADE_DT' : dtGubun === '2' ? 'C.CAR_SALE_DT' : 'B.CAR_PUR_DT'} >= @START_DT` : ""}
              ${endDt ? `AND ${dtGubun === '1' ? 'D.TRADE_DT' : dtGubun === '2' ? 'C.CAR_SALE_DT' : 'B.CAR_PUR_DT'} <= @END_DT` : ""}
              ${dtlCustomerName ? "AND (D.OWNR_NM LIKE @DTL_CUSTOMER_NAME OR C.BUYER_NM LIKE @DTL_CUSTOMER_NAME)" : ""}
              ${dtlSaleItem ? `AND ${dtlSaleItem === '1' ? 'C.SALE_AMT' : dtlSaleItem === '2' ? 'C.AGENT_SEL_COST' : 'C.PREF_INFE_AMT'} > 0` : ""}
              ${dtlMemo ? "AND A.MEMO LIKE @MEMO" : ""}
              ${dtlTradeProcNm ? "AND A.TRADE_PROC_NM LIKE @TRADE_PROC_NM" : ""}
              ${dtlTradeSctGubun ? "AND A.TRADE_SCT_NM = @TRADE_SCT_NM" : ""}
              ${dtlCrStat && dtlCrStat.length > 0 ? "AND A.CR_MTS_STAT_CD = @CR_MTS_STAT_CD" : ""}
              ${dtlRcgnNo ? "AND A.RCGN_NO = @RCGN_NO" : ""}
              ${dtlNtsConfNo ? "AND A.NTS_CONF_NO = @NTS_CONF_NO" : ""}
                    UNION ALL
                    SELECT '지출증빙' AS TRADE_TP_NM
                        , '승인' AS TRADE_PROC_NM
                        , COUNT(A.CASH_MGMTKEY) CNT
                        , ISNULL(SUM(A.TRADE_AMT), 0) TRADE_AMT
                        , ISNULL(SUM(A.SUP_PRC), 0) SUP_PRC
                        , ISNULL(SUM(A.VAT), 0) VAT
                    FROM dbo.CJB_CASH_RECPT A
                    LEFT JOIN dbo.CJB_GOODS_FEE B ON (A.GOODS_FEE_SEQ = B.GOODS_FEE_SEQ)
                            LEFT JOIN dbo.CJB_CAR_SEL C ON (B.CAR_REG_ID = C.CAR_REG_ID)
                            LEFT JOIN dbo.CJB_CAR_PUR D ON (C.CAR_REG_ID = D.CAR_REG_ID)
                  WHERE A.AGENT_ID = @AGENT_ID -- 상사ID
                    AND D.CAR_DEL_YN = 'N'
              AND A.TRADE_TP_NM = '지출증빙'
              AND A.TRADE_PROC_NM = '승인'
              ${carNo ? "AND (D.CAR_NO LIKE @CAR_NO OR D.PUR_BEF_CAR_NO LIKE @CAR_NO OR C.SALE_CAR_NO LIKE @CAR_NO)" : ""}
              ${dealer ? "AND (D.DLR_ID LIKE @DEALER OR C.DLR_ID LIKE @DEALER)" : ""}
              ${startDt ? `AND ${dtGubun === '1' ? 'D.TRADE_DT' : dtGubun === '2' ? 'C.CAR_SALE_DT' : 'B.CAR_PUR_DT'} >= @START_DT` : ""}
              ${endDt ? `AND ${dtGubun === '1' ? 'D.TRADE_DT' : dtGubun === '2' ? 'C.CAR_SALE_DT' : 'B.CAR_PUR_DT'} <= @END_DT` : ""}
              ${dtlCustomerName ? "AND (D.OWNR_NM LIKE @DTL_CUSTOMER_NAME OR C.BUYER_NM LIKE @DTL_CUSTOMER_NAME)" : ""}
              ${dtlSaleItem ? `AND ${dtlSaleItem === '1' ? 'C.SALE_AMT' : dtlSaleItem === '2' ? 'C.AGENT_SEL_COST' : 'C.PREF_INFE_AMT'} > 0` : ""}
              ${dtlMemo ? "AND A.MEMO LIKE @MEMO" : ""}
              ${dtlTradeProcNm ? "AND A.TRADE_PROC_NM LIKE @TRADE_PROC_NM" : ""}
              ${dtlTradeSctGubun ? "AND A.TRADE_SCT_NM = @TRADE_SCT_NM" : ""}
              ${dtlCrStat && dtlCrStat.length > 0 ? "AND A.CR_MTS_STAT_CD = @CR_MTS_STAT_CD" : ""}
              ${dtlRcgnNo ? "AND A.RCGN_NO = @RCGN_NO" : ""}
              ${dtlNtsConfNo ? "AND A.NTS_CONF_NO = @NTS_CONF_NO" : ""}
                    UNION ALL
                    SELECT '지출증빙' AS TRADE_TP_NM
                        , '취소' AS TRADE_PROC_NM
                        , COUNT(A.CASH_MGMTKEY) CNT
                        , ISNULL(SUM(A.TRADE_AMT), 0) TRADE_AMT
                        , ISNULL(SUM(A.SUP_PRC), 0) SUP_PRC
                        , ISNULL(SUM(A.VAT), 0) VAT
                    FROM dbo.CJB_CASH_RECPT A
                    LEFT JOIN dbo.CJB_GOODS_FEE B ON (A.GOODS_FEE_SEQ = B.GOODS_FEE_SEQ)
                            LEFT JOIN dbo.CJB_CAR_SEL C ON (B.CAR_REG_ID = C.CAR_REG_ID)
                            LEFT JOIN dbo.CJB_CAR_PUR D ON (C.CAR_REG_ID = D.CAR_REG_ID)
                  WHERE A.AGENT_ID = @AGENT_ID -- 상사ID
                    AND D.CAR_DEL_YN = 'N'
              AND A.TRADE_TP_NM = '지출증빙'
              AND A.TRADE_PROC_NM = '취소'
              ${carNo ? "AND (D.CAR_NO LIKE @CAR_NO OR D.PUR_BEF_CAR_NO LIKE @CAR_NO OR C.SALE_CAR_NO LIKE @CAR_NO)" : ""}
              ${dealer ? "AND (D.DLR_ID LIKE @DEALER OR C.DLR_ID LIKE @DEALER)" : ""}
              ${startDt ? `AND ${dtGubun === '1' ? 'D.TRADE_DT' : dtGubun === '2' ? 'C.CAR_SALE_DT' : 'B.CAR_PUR_DT'} >= @START_DT` : ""}
              ${endDt ? `AND ${dtGubun === '1' ? 'D.TRADE_DT' : dtGubun === '2' ? 'C.CAR_SALE_DT' : 'B.CAR_PUR_DT'} <= @END_DT` : ""}
              ${dtlCustomerName ? "AND (D.OWNR_NM LIKE @DTL_CUSTOMER_NAME OR C.BUYER_NM LIKE @DTL_CUSTOMER_NAME)" : ""}
              ${dtlSaleItem ? `AND ${dtlSaleItem === '1' ? 'C.SALE_AMT' : dtlSaleItem === '2' ? 'C.AGENT_SEL_COST' : 'C.PREF_INFE_AMT'} > 0` : ""}
              ${dtlMemo ? "AND A.MEMO LIKE @MEMO" : ""}
              ${dtlTradeProcNm ? "AND A.TRADE_PROC_NM LIKE @TRADE_PROC_NM" : ""}
              ${dtlTradeSctGubun ? "AND A.TRADE_SCT_NM = @TRADE_SCT_NM" : ""}
              ${dtlCrStat && dtlCrStat.length > 0 ? "AND A.CR_MTS_STAT_CD = @CR_MTS_STAT_CD" : ""}
              ${dtlRcgnNo ? "AND A.RCGN_NO = @RCGN_NO" : ""}
              ${dtlNtsConfNo ? "AND A.NTS_CONF_NO = @NTS_CONF_NO" : ""}
                    UNION ALL
                    SELECT '합계' AS TRADE_TP_NM
                        , '승인' AS TRADE_PROC_NM
                        , COUNT(A.CASH_MGMTKEY) CNT
                        , ISNULL(SUM(A.TRADE_AMT), 0) TRADE_AMT
                        , ISNULL(SUM(A.SUP_PRC), 0) SUP_PRC
                        , ISNULL(SUM(A.VAT), 0) VAT
                    FROM dbo.CJB_CASH_RECPT A
                    LEFT JOIN dbo.CJB_GOODS_FEE B ON (A.GOODS_FEE_SEQ = B.GOODS_FEE_SEQ)
                            LEFT JOIN dbo.CJB_CAR_SEL C ON (B.CAR_REG_ID = C.CAR_REG_ID)
                            LEFT JOIN dbo.CJB_CAR_PUR D ON (C.CAR_REG_ID = D.CAR_REG_ID)
                  WHERE A.AGENT_ID = @AGENT_ID -- 상사ID
                    AND D.CAR_DEL_YN = 'N'
              AND A.TRADE_PROC_NM = '승인'
              ${carNo ? "AND (D.CAR_NO LIKE @CAR_NO OR D.PUR_BEF_CAR_NO LIKE @CAR_NO OR C.SALE_CAR_NO LIKE @CAR_NO)" : ""}
              ${dealer ? "AND (D.DLR_ID LIKE @DEALER OR C.DLR_ID LIKE @DEALER)" : ""}
              ${startDt ? `AND ${dtGubun === '1' ? 'D.TRADE_DT' : dtGubun === '2' ? 'C.CAR_SALE_DT' : 'B.CAR_PUR_DT'} >= @START_DT` : ""}
              ${endDt ? `AND ${dtGubun === '1' ? 'D.TRADE_DT' : dtGubun === '2' ? 'C.CAR_SALE_DT' : 'B.CAR_PUR_DT'} <= @END_DT` : ""}
              ${dtlCustomerName ? "AND (D.OWNR_NM LIKE @DTL_CUSTOMER_NAME OR C.BUYER_NM LIKE @DTL_CUSTOMER_NAME)" : ""}
              ${dtlSaleItem ? `AND ${dtlSaleItem === '1' ? 'C.SALE_AMT' : dtlSaleItem === '2' ? 'C.AGENT_SEL_COST' : 'C.PREF_INFE_AMT'} > 0` : ""}
              ${dtlMemo ? "AND A.MEMO LIKE @MEMO" : ""}
              ${dtlTradeProcNm ? "AND A.TRADE_PROC_NM LIKE @TRADE_PROC_NM" : ""}
              ${dtlTradeSctGubun ? "AND A.TRADE_SCT_NM = @TRADE_SCT_NM" : ""}
              ${dtlCrStat && dtlCrStat.length > 0 ? "AND A.CR_MTS_STAT_CD = @CR_MTS_STAT_CD" : ""}
              ${dtlRcgnNo ? "AND A.RCGN_NO = @RCGN_NO" : ""}
              ${dtlNtsConfNo ? "AND A.NTS_CONF_NO = @NTS_CONF_NO" : ""}
              UNION ALL
                    SELECT '합계' AS TRADE_TP_NM
                        , '취소' AS TRADE_PROC_NM
                        , COUNT(A.CASH_MGMTKEY) CNT
                        , ISNULL(SUM(A.TRADE_AMT), 0) TRADE_AMT
                        , ISNULL(SUM(A.SUP_PRC), 0) SUP_PRC
                        , ISNULL(SUM(A.VAT), 0) VAT
                    FROM dbo.CJB_CASH_RECPT A
                    LEFT JOIN dbo.CJB_GOODS_FEE B ON (A.GOODS_FEE_SEQ = B.GOODS_FEE_SEQ)
                            LEFT JOIN dbo.CJB_CAR_SEL C ON (B.CAR_REG_ID = C.CAR_REG_ID)
                            LEFT JOIN dbo.CJB_CAR_PUR D ON (C.CAR_REG_ID = D.CAR_REG_ID)
                  WHERE A.AGENT_ID = @AGENT_ID -- 상사ID
                    AND D.CAR_DEL_YN = 'N'
              AND A.TRADE_PROC_NM = '취소'
              ${carNo ? "AND (D.CAR_NO LIKE @CAR_NO OR D.PUR_BEF_CAR_NO LIKE @CAR_NO OR C.SALE_CAR_NO LIKE @CAR_NO)" : ""}
              ${dealer ? "AND (D.DLR_ID LIKE @DEALER OR C.DLR_ID LIKE @DEALER)" : ""}
              ${startDt ? `AND ${dtGubun === '1' ? 'D.TRADE_DT' : dtGubun === '2' ? 'C.CAR_SALE_DT' : 'B.CAR_PUR_DT'} >= @START_DT` : ""}
              ${endDt ? `AND ${dtGubun === '1' ? 'D.TRADE_DT' : dtGubun === '2' ? 'C.CAR_SALE_DT' : 'B.CAR_PUR_DT'} <= @END_DT` : ""}
              ${dtlCustomerName ? "AND (D.OWNR_NM LIKE @DTL_CUSTOMER_NAME OR C.BUYER_NM LIKE @DTL_CUSTOMER_NAME)" : ""}
              ${dtlSaleItem ? `AND ${dtlSaleItem === '1' ? 'C.SALE_AMT' : dtlSaleItem === '2' ? 'C.AGENT_SEL_COST' : 'C.PREF_INFE_AMT'} > 0` : ""}
              ${dtlMemo ? "AND A.MEMO LIKE @MEMO" : ""}
              ${dtlTradeProcNm ? "AND A.TRADE_PROC_NM LIKE @TRADE_PROC_NM" : ""}
              ${dtlTradeSctGubun ? "AND A.TRADE_SCT_NM = @TRADE_SCT_NM" : ""}
              ${dtlCrStat && dtlCrStat.length > 0 ? "AND A.CR_MTS_STAT_CD = @CR_MTS_STAT_CD" : ""}
              ${dtlRcgnNo ? "AND A.RCGN_NO = @RCGN_NO" : ""}
              ${dtlNtsConfNo ? "AND A.NTS_CONF_NO = @NTS_CONF_NO" : ""}
      `;


    console.log('query:', query);

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching car pur sum:", err);
    throw err;
  }
};

// 현금영수증 상세 조회  (수정 필요!!! CJB_GOODS_FEE -> CJB_CAR_TRADE_AMT)
exports.getCarCashInfo = async ({ carRegId }) => {
  try {
    const request = pool.request();
    request.input("CAR_REG_ID", sql.VarChar, carRegId);   

    const query = `SELECT  C.CASH_MGMTKEY                  -- 현금 관리키             
                          , C.NTS_CONF_NO                   -- 국세청 승인 번호        
                          , C.TRADE_DT                      -- 거래 일자                
                          , C.TRADE_DTIME                   -- 거래 일시                
                          , C.TRADE_SHP_NM                  -- 거래 형태 명             
                          , C.TRADE_SCT_NM                  -- 거래 구분 명             
                          , C.TRADE_TP_NM                   -- 거래 유형 명             
                          , C.TAX_SHP_NM                    -- 과세 형태 명             
                          , C.TRADE_AMT                     -- 거래 금액                
                          , C.SUP_PRC                       -- 공급가                   
                          , C.VAT                           -- 부가세                   
                          , C.SRVC                          -- 봉사료                   
                          , C.MERS_BRNO                     -- 가맹점 사업자            
                          , C.MERS_MRPL_BIZ_RCGNNO          -- 가맹점 종사업등록번      
                          , C.MERS_MTL_NM                   -- 가맹점 상호 맛?식별번호              ?                                     호                                                                                                      전송 여부                                                   
                          , C.MERS_PRES_NM                  -- 가맹점 대표자?                           
                          , C.MERS_ADDR                     -- 가맹점 주소                               
                          , C.MERS_PHON                     -- 가맹점 전화번                             
                          , C.RCGN_NO                       -- 식별 번호               
                          , C.CUST_NM                       -- 고객 명                 
                          , C.ORD_GOODS_NM                  -- 주문 상품 명            
                          , C.ORD_NO                        -- 주문 번호               
                          , C.CUST_EMAIL                    -- 고객 이메일  
                          , C.CUST_HP                       -- 고객 핸드폰  
                          , C.CUST_NTCCHR_TRNS_YN           -- 고객 알림문자
                          , C.CNCL_CAUS_CD                  -- 취소 사유 코?
                          , C.MEMO                          -- 메모         
                          , C.EMAIL_TIT_NM                  -- 이메일 제목 ?
                          , C.GOODS_FEE_SEQ                 -- 비용 순번    
                          , C.AGENT_ID                      -- T            
                          , C.REG_DTIME                     -- 등록 일시    
                          , C.REGR_ID                       -- 등록자 ID    
                          , C.MOD_DTIME                     -- 수정 일시    
                          , C.MODR_ID                       -- 수정자 ID          
                      FROM dbo.CJB_CAR_PUR A
                          , dbo.CJB_GOODS_FEE B
                          , dbo.CJB_CASH_RECPT C
                      WHERE B.CAR_REG_ID = A.CAR_REG_ID
                        AND C.GOODS_FEE_SEQ = B.GOODS_FEE_SEQ
                        AND A.CAR_DEL_YN = 'N'   
                        AND A.CAR_REG_ID = @CAR_REG_ID `;

    console.log('query:', query);

    const result = await request.query(query);j
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching car pur detail:", err);
    throw err;
  }
};


// 현금영수증 발행 상제 정보 조회
exports.getCashIssueInfo = async ({ tradeSeq }) => {

  try {
    const request = pool.request();

    console.log('tradeSeq:', tradeSeq);
    request.input("TRADE_SEQ", sql.Int, tradeSeq);

    const query = ` SELECT dbo.CJB_FN_MK_CASH_MGMTKEY(A.AGENT_ID) AS CASH_MGMTKEY
                        , A.TRADE_DT AS TRADE_DT 
                        , NULL TRADE_DTIME
                        , '승인거래' AS TRADE_PROC_NM    -- 001 : 승인거래, 002 : 취소거래
                        , '소득공제용' AS TRADE_SCT_NM     -- 001 : 소득공제용, 002 : 지출증빙용
                        , NULL AS TRADE_TP_NM       
                        , NULL AS TAX_SHP_NM
                        , A.TRADE_ITEM_AMT 
                        , A.TRADE_ITEM_SUP_PRC 
                        , A.TRADE_ITEM_VAT 
                        , 0 AS SRVC                -- 봉사료
                        , B.BRNO 
                        , NULL AS RCGNNO           -- 종사업장 식별번호
                        , B.AGENT_NM 
                        , B.PRES_NM 
                        , B.ADDR1 + ' ' + B.ADDR2 AS ADDR
                        , B.PHON 
                        , A.RCGN_NO AS RCGN_NO -- 식별 번호
                        , A.TRADE_TGT_NM    -- 고객명 
                        , A.TRADE_MEMO      -- 주문 상품명  : 차량명 + 차량번호 + 비용 항목명 
                        , NULL AS ORD_N0    -- 주문 번호 
                        , A.TRADE_TGT_EMAIL
                        , A.TRADE_TGT_PHON 
                        , 'N' AS TRNS_YN      -- 핸드폰 전송 여부 (이건 어디서 설정 ?)
                        , NULL AS CNCL_CAUS_CD     -- 취소 사유 코드 
                        , NULL AS MEMO               --- 전송시  메모 내용
                        , NULL AS EMAIL_TIT_NM     -- EMAIL 타이틀 ???
                        , NULL AS CR_TRAN_STAT_CD  -- 현금영수증 전송 상태 코드 
                      FROM dbo.CJB_CAR_TRADE_AMT A
                        , dbo.CJB_AGENT B
                    WHERE A.TRADE_SEQ = @TRADE_SEQ
                      --AND A.AGENT_ID = B.AGENT_ID
                      `;

    console.log('query:', query);

    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error("Error fetching trade issue info:", err);
    throw err;
  }
};

  
// 현금영수증 직접 등록
exports.insertCarCash = async ({
    cashMgmtkey,                  // 현금 관리키             
    ntsConfNo,                    // 국세청 승인 번호        
    tradeDt,                      // 거래 일자               
    tradeDtime,                   // 거래 일시               
    tradeShpNm,                   // 거래 형태 명            
    tradeSctNm,                   // 거래 구분 명            
    tradeTpNm,                    // 거래 유형 명            
    taxShpNm,                     // 과세 형태 명            
    tradeAmt,                     // 거래 금액               
    supPrc,                       // 공급가                  
    vat,                          // 부가세                  
    srvc,                         // 봉사료                  
    mersBrno,                     // 가맹점 사업자등록번     
    mersMrplBizRcgnno,           // 가맹점 종사업장 식별번호
    mersMtlNm,                    // 가맹점 상호 명          
    mersPresNm,                   // 가맹점 대표자           
    mersAddr,                     // 가맹점 주소             
    mersPhon,                     // 가맹점 전화번호         
    rcgnNo,                       // 식별 번호               
    custNm,                       // 고객 명                 
    ordGoodsNm,                   // 주문 상품 명            
    ordNo,                        // 주문 번호               
    custEmail,                    // 고객 이메일             
    custHp,                       // 고객 핸드폰             
    custNtcchrTrnsYn,            // 고객 알림문자 전송 여부 
    cnclCausCd,                  // 취소 사유 코드          
    memo,                        // 메모                    
    emailTitNm,                  // 이메일 제목 명          
    goodsFeeSeq,                 // 비용 순번               
    agentId,                     // T                 
    regDtime,                    // 등록 일시               
    regrId,                      // 등록자 ID               
    modDtime,                    // 수정 일시               
}) => {
  try {
    const request = pool.request();

    console.log("usrId:", usrId);

    // car_reg_id 값도 미리 만들기
    request.input("agentId", sql.VarChar, agentId); 
    const carRegId = await request.query(`SELECT dbo.CJB_FN_MK_CAR_REG_ID(@agentId) as CAR_REG_ID`);
    const newCarRegId = carRegId.recordset[0].CAR_REG_ID;

    request.input("CASH_MGMT_KEY", sql.VarChar, cashMgmtkey);
    request.input("NTS_CONF_NO", sql.VarChar, ntsConfNo);
    request.input("TRADE_DT", sql.VarChar, tradeDt);
    request.input("TRADE_DTIME", sql.VarChar, tradeDtime);
    request.input("TRADE_SHP_NM", sql.VarChar, tradeShpNm);
    request.input("TRADE_SCT_NM", sql.VarChar, tradeSctNm);
    request.input("TRADE_TP_NM", sql.VarChar, tradeTpNm);
    request.input("TAX_SHP_NM", sql.VarChar, taxShpNm);
    request.input("TRADE_AMT", sql.Decimal, tradeAmt);
    request.input("SUP_PRC", sql.Decimal, supPrc);
    request.input("VAT", sql.Decimal, vat);
    request.input("SRVC", sql.VarChar, srvc);
    request.input("MERS_BRNO", sql.VarChar, mersBrno);
    request.input("MERS_MRPL_BIZ_RCGN_NO", sql.VarChar, mersMrplBizRcgnno);
    request.input("MERS_MTL_NM", sql.VarChar, mersMtlNm);
    request.input("MERS_PRES_NM", sql.VarChar, mersPresNm);
    request.input("MERS_ADDR", sql.VarChar, mersAddr);
    request.input("MERS_PHON", sql.VarChar, mersPhon);
    request.input("RCGN_NO", sql.VarChar, rcgnNo);
    request.input("CUST_NM", sql.VarChar, custNm);
    request.input("ORD_GOODS_NM", sql.VarChar, ordGoodsNm);
    request.input("ORD_NO", sql.VarChar, ordNo);
    request.input("CUST_EMAIL", sql.VarChar, custEmail);
    request.input("CUST_HP", sql.VarChar, custHp);
    request.input("CUST_NTCCHR_TRNS_YN", sql.VarChar, custNtcchrTrnsYn);
    request.input("CNCL_CAUS_CD", sql.VarChar, cnclCausCd);
    request.input("MEMO", sql.VarChar, memo);
    request.input("EMAIL_TIT_NM", sql.VarChar, emailTitNm);
    request.input("GOODS_FEE_SEQ", sql.Int, goodsFeeSeq);
    request.input("AGENT_ID", sql.VarChar, agentId);
    request.input("REG_DTIME", sql.VarChar, regDtime);
    request.input("REGR_ID", sql.VarChar, regrId);
    request.input("MOD_DTIME", sql.VarChar, modDtime);

    const query1 = `INSERT INTO dbo.CJB_CASH_RECPT (
                          CASH_MGMTKEY                  -- 현금 관리키                
                        , NTS_CONF_NO                   -- 국세청 승인 번호           
                        , TRADE_DT                      -- 거래 일자                  
                        , TRADE_DTIME                   -- 거래 일시                  
                        , TRADE_SHP_NM                  -- 거래 형태 명               
                        , TRADE_SCT_NM                  -- 거래 구분 명               
                        , TRADE_TP_NM                   -- 거래 유형 명               
                        , TAX_SHP_NM                    -- 과세 형태 명               
                        , TRADE_AMT                     -- 거래 금액                  
                        , SUP_PRC                       -- 공급가                     
                        , VAT                           -- 부가세                     
                        , SRVC                          -- 봉사료                     
                        , MERS_BRNO                     -- 가맹점 사업자등록번        
                        , MERS_MRPL_BIZ_RCGNNO          -- 가맹점 종사업장 식별번호   
                        , MERS_MTL_NM                   -- 가맹점 상호 명             
                        , MERS_PRES_NM                  -- 가맹점 대표자              
                        , MERS_ADDR                     -- 가맹점 주소                
                        , MERS_PHON                     -- 가맹점 전화번호            
                        , RCGN_NO                       -- 식별 번호                  
                        , CUST_NM                       -- 고객 명                    
                        , ORD_GOODS_NM                  -- 주문 상품 명               
                        , ORD_NO                        -- 주문 번호                  
                        , CUST_EMAIL                    -- 고객 이메일                
                        , CUST_HP                       -- 고객 핸드폰                
                        , CUST_NTCCHR_TRNS_YN           -- 고객 알림문자 전송 여부    
                        , CNCL_CAUS_CD                  -- 취소 사유 코드             
                        , MEMO                          -- 메모                       
                        , EMAIL_TIT_NM                  -- 이메일 제목 명             
                        , GOODS_FEE_SEQ                 -- 비용 순번                  
                        , AGENT_ID                      -- 상사 ID                       
                        , REG_DTIME                     -- 등록 일시                  
                        , REGR_ID                       -- 등록자 ID                  
                        , MOD_DTIME                     -- 수정 일시                  
                        , MODR_ID                       -- 수정자 ID        
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
                    @REG_DTIME,
                    @REGR_ID,
                    @MOD_DTIME,
                    @MODR_ID

                  )`;



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



// 현금영수증 수정 등록 
exports.updateCarCash = async ({ 
    cashMgmtkey,                  // 현금 관리키             
    ntsConfNo,                    // 국세청 승인 번호        
    tradeDt,                      // 거래 일자               
    tradeDtime,                   // 거래 일시               
    tradeShpNm,                   // 거래 형태 명            
    tradeSctNm,                   // 거래 구분 명            
    tradeTpNm,                    // 거래 유형 명            
    taxShpNm,                     // 과세 형태 명            
    tradeAmt,                     // 거래 금액               
    supPrc,                       // 공급가                  
    vat,                          // 부가세                  
    srvc,                         // 봉사료                  
    mersBrno,                     // 가맹점 사업자등록번     
    mersMrplBizRcgnno,           // 가맹점 종사업장 식별번호
    mersMtlNm,                    // 가맹점 상호 명          
    mersPresNm,                   // 가맹점 대표자           
    mersAddr,                     // 가맹점 주소             
    mersPhon,                     // 가맹점 전화번호         
    rcgnNo,                       // 식별 번호               
    custNm,                       // 고객 명                 
    ordGoodsNm,                   // 주문 상품 명            
    ordNo,                        // 주문 번호               
    custEmail,                    // 고객 이메일             
    custHp,                       // 고객 핸드폰             
    custNtcchrTrnsYn,            // 고객 알림문자 전송 여부 
    cnclCausCd,                  // 취소 사유 코드          
    memo,                        // 메모                    
    emailTitNm,                  // 이메일 제목 명          
    goodsFeeSeq,                 // 비용 순번               
    agentId,                     // T                 
    regDtime,                    // 등록 일시               
    regrId,                      // 등록자 ID               
    modDtime,                    // 수정 일시       
    modrId,                      // 수정자 ID
}) => {
  try {
    const request = pool.request();
    request.input("CAR_REG_ID", sql.VarChar, carRegId);
    request.input("AGENT_ID", sql.VarChar, agentId);
    request.input("DLR_ID", sql.VarChar, dealerId);
    request.input("CAR_KND_CD", sql.VarChar, carKndCd?.split('|')[0]);
    request.input("PRSN_SCT_CD", sql.VarChar, prsnSctCd);
    request.input("CAR_PUR_DT", sql.VarChar, carPurDt);
    request.input("CAR_REG_DT", sql.VarChar, carRegDt);
    request.input("CAR_NO", sql.VarChar, carNo);
    request.input("PUR_BEF_CAR_NO", sql.VarChar, purBefCarNo);
    request.input("CAR_NM", sql.VarChar, carNm);
    request.input("PUR_EVDC_CD", sql.VarChar, evdcCd);
    request.input("OWNR_NM", sql.VarChar, ownrNm);
    request.input("OWNR_TP_CD", sql.VarChar, ownrTpCd);
    request.input("OWNR_SSN", sql.VarChar, ownrSsn);
    request.input("OWNR_BRNO", sql.VarChar, ownrBrno);
    request.input("OWNR_PHON", sql.VarChar, ownrPhon);
    request.input("OWNR_ZIP", sql.VarChar, ownrZip);
    request.input("OWNR_ADDR1", sql.VarChar, ownrAddr1);
    request.input("OWNR_ADDR2", sql.VarChar, ownrAddr2);
    request.input("OWNR_EMAIL", sql.VarChar, ownrEmail);
    request.input("PUR_AMT", sql.Decimal, purAmt);
    request.input("PUR_SUP_PRC", sql.Decimal, purSupPrc);
    request.input("PUR_VAT", sql.Decimal, purVat);
    request.input("GAIN_TAX", sql.Decimal, gainTax);
    request.input("AGENT_PUR_CST", sql.Decimal, agentPurCst);
    request.input("AGENT_PUR_CST_PAY_DT", sql.VarChar, brokerageDate);
    request.input("TXBL_RCV_YN", sql.VarChar, txblRcvYn);
    request.input("TXBL_ISSU_DT", sql.VarChar, txblIssuDt);
    request.input("FCT_CNDC_YN", sql.VarChar, fctCndcYn);
    request.input("PUR_DESC", sql.VarChar, purDesc);
    request.input("PARK_ZON_CD", sql.VarChar, parkingCd);
    request.input("PARK_ZON_DESC", sql.VarChar, parkingLocationDesc);
    request.input("PARK_KEY_NO", sql.VarChar, parkKeyNo);
    request.input("CTSH_NO", sql.VarChar, ctshNo);
    request.input("REGR_ID", sql.VarChar, usrId);
    request.input("MODR_ID", sql.VarChar, usrId);

    const query1 = `
      UPDATE dbo.CJB_CASH_RECPT
      SET NTS_CONF_NO = @NTS_CONF_NO,
          TRADE_DT = @TRADE_DT,
          TRADE_DTIME = @TRADE_DTIME,
          TRADE_SHP_NM = @TRADE_SHP_NM,
          TRADE_SCT_NM = @TRADE_SCT_NM,
          TRADE_TP_NM = @TRADE_TP_NM,
          TAX_SHP_NM = @TAX_SHP_NM,
          TRADE_AMT = @TRADE_AMT,
          SUP_PRC = @SUP_PRC,
          VAT = @VAT,
          SRVC = @SRVC,
          MERS_BRNO = @MERS_BRNO,
          MERS_MRPL_BIZ_RCGN_NO = @MERS_MRPL_BIZ_RCGN_NO,
          MERS_MTL_NM = @MERS_MTL_NM,
          MERS_PRES_NM = @MERS_PRES_NM,
          MERS_ADDR = @MERS_ADDR,
          MERS_PHON = @MERS_PHON,
          RCGN_NO = @RCGN_NO,
          CUST_NM = @CUST_NM,
          ORD_GOODS_NM = @ORD_GOODS_NM,
          ORD_NO = @ORD_NO,
          CUST_EMAIL = @CUST_EMAIL,
          CUST_HP = @CUST_HP,
          CUST_NTCCHR_TRNS_YN = @CUST_NTCCHR_TRNS_YN,
          CNCL_CAUS_CD = @CNCL_CAUS_CD,
          MEMO = @MEMO,
          EMAIL_TIT_NM = @EMAIL_TIT_NM,
          GOODS_FEE_SEQ = @GOODS_FEE_SEQ,
          AGENT_ID = @AGENT_ID,
          REG_DTIME = @REG_DTIME,
          REGR_ID = @REGR_ID,
          MOD_DTIME = @MOD_DTIME,
          MODR_ID = @MODR_ID
      WHERE CASH_MGMTKEY = @CASH_MGMTKEY;
    `;  

    const query2 = `
      UPDATE CJB_GOODS_FEE
      SET CASH_RECPT_RCGN_NO = @CASH_RECPT_RCGN_NO
        , MOD_DTIME = GETDATE()
      WHERE GOODS_FEE_SEQ = @GOODS_FEE_SEQ;
    `;

    await Promise.all([request.query(query1), request.query(query2)]);

  } catch (err) {
    console.error("Error updating car pur:", err);
    throw err;
  }
};
