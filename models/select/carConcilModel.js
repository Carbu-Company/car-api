const sql = require("mssql");
const pool = require("../../config/db");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 알선 2.0
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 알선 목록 조회 
exports.getCarConcilList = async ({ 
    agentId, 
    page,
    pageSize,
    carNo,
    dealer,
    dtGubun,
    startDt,
    endDt, 
    dtlBrkTradeItemCd,
    dtlBrkAgentNm,
    dtlCarNm,
    dtlCustNm,
    dtlEvdcGubun,
    dtlBrkMemo,
    orderItem = '01',
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
      console.log('dtGubun:', dtGubun);
      console.log('startDt:', startDt);
      console.log('endDt:', endDt);
      console.log('dtlBrkTradeItemCd:', dtlBrkTradeItemCd);
      console.log('dtlBrkAgentNm:', dtlBrkAgentNm);
      console.log('dtlCarNm:', dtlCarNm);
      console.log('dtlCustNm:', dtlCustNm);
      console.log('dtlEvdcGubun:', dtlEvdcGubun);
      console.log('dtlBrkMemo:', dtlBrkMemo);
      console.log('orderItem:', orderItem);
      console.log('ordAscDesc:', ordAscDesc);
*/

      request.input("CAR_AGENT", sql.VarChar, agentId);
      request.input("PAGE_SIZE", sql.Int, pageSize);
      request.input("PAGE", sql.Int, page);
  
  
      if (carNo) request.input("CAR_NO", sql.VarChar, `%${carNo}%`);
      if (dealer) request.input("DEALER", sql.VarChar, `%${dealer}%`);
      if (dtGubun) request.input("DT_GUBUN", sql.VarChar, dtGubun);
      if (startDt) request.input("START_DT", sql.VarChar, startDt);
      if (endDt) request.input("END_DT", sql.VarChar, endDt);
      if (dtlBrkTradeItemCd) request.input("DTL_BRK_TRADE_ITEM_CD", sql.VarChar, `%${dtlBrkTradeItemCd}%`);
      if (dtlBrkAgentNm) request.input("DTL_BRK_AGENT_NM", sql.VarChar, `%${dtlBrkAgentNm}%`);
      if (dtlCarNm) request.input("DTL_CAR_NM", sql.VarChar, `%${dtlCarNm}%`);
      if (dtlCustNm) request.input("DTL_CUST_NM", sql.VarChar, `%${dtlCustNm}%`);
      if (dtlEvdcGubun) request.input("DTL_EVDC_GUBUN", sql.VarChar, dtlEvdcGubun);
      if (dtlBrkMemo) request.input("DTL_BRK_MEMO", sql.VarChar, `%${dtlBrkMemo}%`);

      // 전체 카운트 조회
      const countQuery = `
      SELECT COUNT(*) as totalCount
                FROM dbo.CJB_CAR_PUR A
                   , dbo.CJB_CAR_SEL B
                   , dbo.CJB_CAR_SEL_BRK C
              WHERE B.CAR_REG_ID = A.CAR_REG_ID
                AND C.CAR_REG_ID = B.CAR_REG_ID
                AND A.AGENT_ID = @CAR_AGENT
                AND A.CAR_DEL_YN = 'N'
                AND A.CAR_STAT_CD = '003'   -- 알선판매
                ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO OR A.PUR_BEF_CAR_NO LIKE @CAR_NO OR B.SALE_CAR_NO LIKE @CAR_NO)" : ""}
                ${dealer ? "AND (A.DLR_ID LIKE @DEALER OR B.DLR_ID LIKE @DEALER)" : ""}
                ${startDt ? `AND ${dtGubun === '1' ? 'C.BRK_SALE_DT' : dtGubun === '2' ? 'B.CAR_SALE_DT' : 'A.CAR_PUR_DT'} >= @START_DT` : ""}
                ${endDt ? `AND ${dtGubun === '1' ? 'C.BRK_SALE_DT' : dtGubun === '2' ? 'B.CAR_SALE_DT' : 'A.CAR_PUR_DT'} <= @END_DT` : ""}
                ${dtlBrkTradeItemCd ? "AND C.BRK_TRADE_ITEM_CD LIKE @DTL_BRK_TRADE_ITEM_CD" : ""}
                ${dtlBrkAgentNm ? "AND C.BRK_AGENT_NM LIKE @DTL_BRK_AGENT_NM" : ""}
                ${dtlCarNm ? "AND B.CAR_NM LIKE @DTL_CAR_NM" : ""}
                ${dtlCustNm ? "AND B.BUYER_NM LIKE @DTL_CUST_NM" : ""}
                ${dtlEvdcGubun ? "AND B.SEL_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                ${dtlBrkMemo ? "AND C.BRK_MEMO LIKE @DTL_BRK_MEMO" : ""}

      `;
    
      const dataQuery = `
                SELECT A.CAR_NO
                    , B.SALE_CAR_NO
                    , A.DLR_ID                  
                    , (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = A.DLR_ID) AS DLR_NM
                    , A.CAR_NM 
                    , C.BRK_SALE_DT
                    , C.BRK_TRADE_ITEM_CD
                    , dbo.CJB_FN_GET_CD_NM('23', C.BRK_TRADE_ITEM_CD) BRK_TRADE_ITEM_NM
                    , C.BRK_AMT     -- 알선금액
                    , C.DEDT_AMT    -- 공제금액
                    , C.TAX_AMT     -- 세액
                    , C.PAY_AMT     -- 지급액
                    , C.BRK_EVDC_CD -- 알선 증빙 코드
                    , dbo.CJB_FN_GET_CD_NM('07', C.BRK_EVDC_CD) BRK_EVDC_NM
                    , C.EVDC_ISSU_DT
                    , C.BRK_AGENT_NM 
                    , B.BUYER_NM 
                    , C.BRK_SEQ
                FROM dbo.CJB_CAR_PUR A
                   , dbo.CJB_CAR_SEL B
                   , dbo.CJB_CAR_SEL_BRK C
              WHERE B.CAR_REG_ID = A.CAR_REG_ID
                AND C.CAR_REG_ID = B.CAR_REG_ID
                AND A.AGENT_ID = @CAR_AGENT
                AND A.CAR_DEL_YN = 'N'
                AND A.CAR_STAT_CD = '003'   -- 알선판매
                ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO OR A.PUR_BEF_CAR_NO LIKE @CAR_NO OR B.SALE_CAR_NO LIKE @CAR_NO)" : ""}
                ${dealer ? "AND (A.DLR_ID LIKE @DEALER OR B.DLR_ID LIKE @DEALER)" : ""}
                ${startDt ? `AND ${dtGubun === '1' ? 'C.BRK_SALE_DT' : dtGubun === '2' ? 'B.CAR_SALE_DT' : 'A.CAR_PUR_DT'} >= @START_DT` : ""}
                ${endDt ? `AND ${dtGubun === '1' ? 'C.BRK_SALE_DT' : dtGubun === '2' ? 'B.CAR_SALE_DT' : 'A.CAR_PUR_DT'} <= @END_DT` : ""}
                ${dtlBrkTradeItemCd ? "AND C.BRK_TRADE_ITEM_CD LIKE @DTL_BRK_TRADE_ITEM_CD" : ""}
                ${dtlBrkAgentNm ? "AND C.BRK_AGENT_NM LIKE @DTL_BRK_AGENT_NM" : ""}
                ${dtlCarNm ? "AND B.CAR_NM LIKE @DTL_CAR_NM" : ""}
                ${dtlCustNm ? "AND B.BUYER_NM LIKE @DTL_CUST_NM" : ""}
                ${dtlEvdcGubun ? "AND B.SEL_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                ${dtlBrkMemo ? "AND C.BRK_MEMO LIKE @DTL_BRK_MEMO" : ""}
          ORDER BY ${orderItem === '01' ? 'C.BRK_SALE_DT' : orderItem === '02' ? 'B.CAR_SALE_DT' : 'A.CAR_PUR_DT'} ${ordAscDesc}
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
      console.error("Error fetching car concil list:", err);
      throw err;
    }
  };
  
  // 알선 합계 조회
  exports.getCarConcilSummary = async ({  
    agentId, 
    page,
    pageSize,
    carNo,
    dealer,
    dtGubun,
    startDt,
    endDt, 
    dtlBrkTradeItemCd,
    dtlBrkAgentNm,
    dtlCarNm,
    dtlCustNm,
    dtlEvdcGubun,
    dtlBrkMemo,
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
      console.log('dtlBrkTradeItemCd:', dtlBrkTradeItemCd);
      console.log('dtlBrkAgentNm:', dtlBrkAgentNm);
      console.log('dtlCarNm:', dtlCarNm);
      console.log('dtlCustNm:', dtlCustNm);
      console.log('dtlEvdcGubun:', dtlEvdcGubun);
      console.log('dtlBrkMemo:', dtlBrkMemo);
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
      if (dtlBrkTradeItemCd) request.input("DTL_BRK_TRADE_ITEM_CD", sql.VarChar, `%${dtlBrkTradeItemCd}%`);
      if (dtlBrkAgentNm) request.input("DTL_BRK_AGENT_NM", sql.VarChar, `%${dtlBrkAgentNm}%`);
      if (dtlCarNm) request.input("DTL_CAR_NM", sql.VarChar, `%${dtlCarNm}%`);
      if (dtlCustNm) request.input("DTL_CUST_NM", sql.VarChar, `%${dtlCustNm}%`);
      if (dtlEvdcGubun) request.input("DTL_EVDC_GUBUN", sql.VarChar, dtlEvdcGubun);
      if (dtlBrkMemo) request.input("DTL_BRK_MEMO", sql.VarChar, `%${dtlBrkMemo}%`);


      const query = `SELECT '알선수수료' AS BRK_TRADE_ITEM_NM
                            , COUNT(C.BRK_SEQ) CNT
                            , ISNULL(SUM(C.BRK_AMT), 0) BRK_AMT
                            , ISNULL(SUM(C.BRK_SUP_PRC), 0) BRK_SUP_PRC
                            , ISNULL(SUM(C.BRK_VAT), 0) BRK_VAT
                            , ISNULL(SUM(C.DEDT_AMT), 0) DEDT_AMT
                            , ISNULL(SUM(C.TAX_AMT), 0) TAX_AMT
                            , ISNULL(SUM(C.PAY_AMT), 0) PAY_AMT
                        FROM dbo.CJB_CAR_PUR A
                            , dbo.CJB_CAR_SEL B
                            , dbo.CJB_CAR_SEL_BRK C
                        WHERE B.CAR_REG_ID = A.CAR_REG_ID
                            AND C.CAR_REG_ID = B.CAR_REG_ID
                            AND A.AGENT_ID = @CAR_AGENT
                            AND A.CAR_DEL_YN = 'N'
                            AND A.CAR_STAT_CD = '003'   -- 알선판매
                            AND C.BRK_TRADE_ITEM_CD = '001' -- 알선수수료 
                ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO OR A.PUR_BEF_CAR_NO LIKE @CAR_NO OR B.SALE_CAR_NO LIKE @CAR_NO)" : ""}
                ${dealer ? "AND (A.DLR_ID LIKE @DEALER OR B.DLR_ID LIKE @DEALER)" : ""}
                ${startDt ? `AND ${dtGubun === '1' ? 'C.BRK_SALE_DT' : dtGubun === '2' ? 'B.CAR_SALE_DT' : 'A.CAR_PUR_DT'} >= @START_DT` : ""}
                ${endDt ? `AND ${dtGubun === '1' ? 'C.BRK_SALE_DT' : dtGubun === '2' ? 'B.CAR_SALE_DT' : 'A.CAR_PUR_DT'} <= @END_DT` : ""}
                ${dtlBrkTradeItemCd ? "AND C.BRK_TRADE_ITEM_CD LIKE @DTL_BRK_TRADE_ITEM_CD" : ""}
                ${dtlBrkAgentNm ? "AND C.BRK_AGENT_NM LIKE @DTL_BRK_AGENT_NM" : ""}
                ${dtlCarNm ? "AND B.CAR_NM LIKE @DTL_CAR_NM" : ""}
                ${dtlCustNm ? "AND B.BUYER_NM LIKE @DTL_CUST_NM" : ""}
                ${dtlEvdcGubun ? "AND B.SEL_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                ${dtlBrkMemo ? "AND C.BRK_MEMO LIKE @DTL_BRK_MEMO" : ""}
                      UNION ALL
                        SELECT '알선수익금' AS BRK_TRADE_ITEM_NM
                            , COUNT(C.BRK_SEQ) CNT
                            , ISNULL(SUM(C.BRK_AMT), 0) BRK_AMT
                            , ISNULL(SUM(C.BRK_SUP_PRC), 0) BRK_SUP_PRC
                            , ISNULL(SUM(C.BRK_VAT), 0) BRK_VAT
                            , ISNULL(SUM(C.DEDT_AMT), 0) DEDT_AMT
                            , ISNULL(SUM(C.TAX_AMT), 0) TAX_AMT
                            , ISNULL(SUM(C.PAY_AMT), 0) PAY_AMT
                        FROM dbo.CJB_CAR_PUR A
                            , dbo.CJB_CAR_SEL B
                            , dbo.CJB_CAR_SEL_BRK C
                        WHERE B.CAR_REG_ID = A.CAR_REG_ID
                            AND C.CAR_REG_ID = B.CAR_REG_ID
                            AND A.AGENT_ID = @CAR_AGENT
                            AND A.CAR_DEL_YN = 'N'
                            AND A.CAR_STAT_CD = '003'   -- 알선판매
                            AND C.BRK_TRADE_ITEM_CD = '002' -- 알선수익금 
                ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO OR A.PUR_BEF_CAR_NO LIKE @CAR_NO OR B.SALE_CAR_NO LIKE @CAR_NO)" : ""}
                ${dealer ? "AND (A.DLR_ID LIKE @DEALER OR B.DLR_ID LIKE @DEALER)" : ""}
                ${startDt ? `AND ${dtGubun === '1' ? 'C.BRK_SALE_DT' : dtGubun === '2' ? 'B.CAR_SALE_DT' : 'A.CAR_PUR_DT'} >= @START_DT` : ""}
                ${endDt ? `AND ${dtGubun === '1' ? 'C.BRK_SALE_DT' : dtGubun === '2' ? 'B.CAR_SALE_DT' : 'A.CAR_PUR_DT'} <= @END_DT` : ""}
                ${dtlBrkTradeItemCd ? "AND C.BRK_TRADE_ITEM_CD LIKE @DTL_BRK_TRADE_ITEM_CD" : ""}
                ${dtlBrkAgentNm ? "AND C.BRK_AGENT_NM LIKE @DTL_BRK_AGENT_NM" : ""}
                ${dtlCarNm ? "AND B.CAR_NM LIKE @DTL_CAR_NM" : ""}
                ${dtlCustNm ? "AND B.BUYER_NM LIKE @DTL_CUST_NM" : ""}
                ${dtlEvdcGubun ? "AND B.SEL_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                ${dtlBrkMemo ? "AND C.BRK_MEMO LIKE @DTL_BRK_MEMO" : ""}
                      UNION ALL
                      SELECT '합계' AS BRK_TRADE_ITEM_NM
                            , COUNT(C.BRK_SEQ) CNT
                            , ISNULL(SUM(C.BRK_AMT), 0) BRK_AMT
                            , ISNULL(SUM(C.BRK_SUP_PRC), 0) BRK_SUP_PRC
                            , ISNULL(SUM(C.BRK_VAT), 0) BRK_VAT
                            , ISNULL(SUM(C.DEDT_AMT), 0) DEDT_AMT
                            , ISNULL(SUM(C.TAX_AMT), 0) TAX_AMT
                            , ISNULL(SUM(C.PAY_AMT), 0) PAY_AMT
                        FROM dbo.CJB_CAR_PUR A
                            , dbo.CJB_CAR_SEL B
                            , dbo.CJB_CAR_SEL_BRK C
                        WHERE B.CAR_REG_ID = A.CAR_REG_ID
                            AND C.CAR_REG_ID = B.CAR_REG_ID
                            AND A.AGENT_ID = @CAR_AGENT
                            AND A.CAR_DEL_YN = 'N'
                            AND A.CAR_STAT_CD = '003'   -- 알선판매
                ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO OR A.PUR_BEF_CAR_NO LIKE @CAR_NO OR B.SALE_CAR_NO LIKE @CAR_NO)" : ""}
                ${dealer ? "AND (A.DLR_ID LIKE @DEALER OR B.DLR_ID LIKE @DEALER)" : ""}
                ${startDt ? `AND ${dtGubun === '1' ? 'C.BRK_SALE_DT' : dtGubun === '2' ? 'B.CAR_SALE_DT' : 'A.CAR_PUR_DT'} >= @START_DT` : ""}
                ${endDt ? `AND ${dtGubun === '1' ? 'C.BRK_SALE_DT' : dtGubun === '2' ? 'B.CAR_SALE_DT' : 'A.CAR_PUR_DT'} <= @END_DT` : ""}
                ${dtlBrkTradeItemCd ? "AND C.BRK_TRADE_ITEM_CD LIKE @DTL_BRK_TRADE_ITEM_CD" : ""}
                ${dtlBrkAgentNm ? "AND C.BRK_AGENT_NM LIKE @DTL_BRK_AGENT_NM" : ""}
                ${dtlCarNm ? "AND B.CAR_NM LIKE @DTL_CAR_NM" : ""}
                ${dtlCustNm ? "AND B.BUYER_NM LIKE @DTL_CUST_NM" : ""}
                ${dtlEvdcGubun ? "AND B.SEL_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                ${dtlBrkMemo ? "AND C.BRK_MEMO LIKE @DTL_BRK_MEMO" : ""}
        `;
  
      const result = await request.query(query);
      return result.recordset;
    } catch (err) {
      console.error("Error fetching car concil summary:", err);
      throw err;
    }
  };
  
  // 알선 상세 조회
  exports.getCarConcilInfo = async ({ carRegId }) => {
    try {
      const request = pool.request();
      request.input("CAR_REG_ID", sql.VarChar, carRegId);   
  
      const query = `SELECT A.BRK_SEQ
                          , A.BRK_AGENT_ID 
                          , A.BRK_DLR_ID
                          , A.BRK_AMT 
                          , A.BRK_SUP_PRC 
                          , A.BRK_VAT 
                          , A.DEDT_AMT
                          , A.TAX_AMT
                          , A.PAY_AMT
                          , A.BRK_EVDC_CD
                          , A.CAR_REG_ID
                          , A.BRK_TRADE_ITEM_CD 
                          , A.BRK_MEMO 
                          , A.BRK_SALE_DT
                          , A.REGR_ID
                          , A.MODR_ID
                          , A.CAR_KND_CD
                          , A.CAR_NO
                          , A.CAR_NM
                          , A.OWNR_NM
                          , A.OWNR_PHON
                       FROM dbo.CJB_CAR_SEL_BRK A
                      WHERE A.CAR_REG_ID = @CAR_REG_ID `;

        //console.log('query:', query);
  
      const result = await request.query(query);
      return result.recordset[0];
    } catch (err) {
      console.error("Error fetching car concil info:", err);
      throw err;
    }
  };

// 알선 판매 등록
exports.insertCarConcil = async ({
  agentId,                                                  // 상사 ID              
  dealerId,                                                  // 판매딜러 ID
  tradeItemCd,                                               // 거래항목 코드
  brkSaleDt,                                                 // 알선판매일  
  brkAmt,                                                    // 알선금액
  brkSupPrc,                                                 // 공급가액
  brkVat,                                                    // 부가세
  brkDedtAmt,                                                // 공제비용
  brkTaxAmt,                                                // 세액
  brkPayAmt,                                                 // 딜러지급액
  evdcCd,                                                    // 증빙종류 코드
  carKndCd,                                                  // 차량 유형 코드
  carNm,                                                     // 차량명
  carNo,                                                     // 차량번호
  ownrNm,                                                    // 고객명/상사명
  ownrPhon,                                                  // 연락처  
  brkDesc,                                                   // 특이사항
  usrId,                                                     // 등록자 ID
  carRegId                                                 // 차량 등록 ID
}) => {
  try {
    const request = pool.request();

    console.log('carNo:', carNo);
    console.log('dealerId:', dealerId);
    console.log('tradeItemCd:', tradeItemCd);
    console.log('brkSaleDt:', brkSaleDt);
    console.log('brkAmt:', brkAmt);
    console.log('brkSupPrc:', brkSupPrc);
    console.log('brkVat:', brkVat);
    console.log('brkDedtAmt:', brkDedtAmt);
    console.log('brkTaxAmt:', brkTaxAmt);
    console.log('brkPayAmt:', brkPayAmt);
    console.log('evdcCd:', evdcCd);
    console.log('carKndCd:', carKndCd);
    console.log('carNm:', carNm);
    console.log('carNo:', carNo);
    console.log('ownrNm:', ownrNm);
    console.log('ownrPhon:', ownrPhon);
    console.log('brkDesc:', brkDesc);
    console.log('usrId:', usrId);
    console.log('carRegId:', carRegId);

    request.input("BRK_AGENT_ID", sql.VarChar, agentId);                            // 상사 ID              
    request.input("BRK_DLR_ID", sql.VarChar, dealerId);                             // 딜러 ID              
    request.input("BRK_TRADE_ITEM_CD", sql.VarChar, tradeItemCd);              // 거래항목 코드
    request.input("BRK_SALE_DT", sql.VarChar, brkSaleDt);                      // 알선판매일
    request.input("BRK_AMT", sql.Int, brkAmt);                                 // 알선금액
    request.input("BRK_SUP_PRC", sql.Int, brkSupPrc);                         // 공급가액
    request.input("BRK_VAT", sql.Int, brkVat);                                // 부가세
    request.input("DEDT_AMT", sql.Int, brkDedtAmt);                          // 공제비용
    request.input("TAX_AMT", sql.Int, brkTaxAmt);                                // 세액
    request.input("PAY_AMT", sql.Int, brkPayAmt);                            // 딜러지급액
    request.input("BRK_EVDC_CD", sql.VarChar, evdcCd);                       // 증빙종류 코드
    request.input("CAR_KND_CD", sql.VarChar, carKndCd);                      // 차량 종류 코드         
    request.input("CAR_NO", sql.VarChar, carNo);                                // 차량 번호       
    request.input("CAR_NM", sql.VarChar, carNm);                               // 차량 명              
    request.input("OWNR_NM", sql.VarChar, ownrNm);                           // 고객명/상사명
    request.input("OWNR_PHON", sql.VarChar, ownrPhon);                       // 연락처
    request.input("BRK_MEMO", sql.VarChar, brkDesc);                       // 특이사항
    request.input("REGR_ID", sql.VarChar, usrId);                            // 등록자 ID            
    request.input("MODR_ID", sql.VarChar, usrId);                            // 수정자 ID   
    request.input("CAR_REG_ID", sql.VarChar, carRegId);                      // 차량 등록 ID

    const query1 = `INSERT INTO dbo.CJB_CAR_SEL_BRK (
                        BRK_AGENT_NM
                      , BRK_AGENT_ID
                      , BRK_DLR_NM
                      , BRK_DLR_ID
                      , BRK_AMT
                      , BRK_SUP_PRC
                      , BRK_VAT
                      , DEDT_AMT
                      , TAX_AMT
                      , PAY_AMT
                      , BRK_EVDC_CD
                      , BRK_MEMO
                      , BRK_SALE_DT
                      , CAR_REG_ID
                      , REGR_ID
                      , MODR_ID
                  ) VALUES (
                    (SELECT AGENT_NM FROM dbo.CJB_AGENT A WHERE A.AGENT_ID = @BRK_AGENT_ID),
                    @BRK_AGENT_ID,
                    (SELECT USR_NM FROM dbo.CJB_USR A WHERE A.USR_ID = @BRK_DLR_ID),
                    @BRK_DLR_ID,
                    @BRK_AMT,
                    @BRK_SUP_PRC,
                    @BRK_VAT,
                    @DEDT_AMT,
                    @TAX_AMT,
                    @PAY_AMT,
                    @BRK_EVDC_CD,
                    @BRK_MEMO,
                    @BRK_SALE_DT, 
                    @CAR_REG_ID,
                    @REGR_ID,
                    @MODR_ID
                  )`;


    const query2 = `UPDATE dbo.CJB_CAR_SEL
                   SET MODR_ID = @MODR_ID
                   WHERE CAR_REG_ID = @CAR_REG_ID;`;

    await Promise.all([request.query(query1), request.query(query2)]);

  } catch (err) {
    console.error("Error inserting car concil:", err);
    throw err;
  }
};

// 알선 판매 수정
exports.updateCarConcil = async ({
  brkSeq,                                                    // 알선 판매 순번
  agentId,                                                  // 상사 ID              
  dealerId,                                                  // 판매딜러 ID
  tradeItemCd,                                               // 거래항목 코드
  brkSaleDt,                                                 // 알선판매일  
  brkAmt,                                                    // 알선금액
  brkSupPrc,                                                 // 공급가액
  brkVat,                                                    // 부가세
  brkDedtAmt,                                                // 공제비용
  brkTaxAmt,                                                // 세액
  brkPayAmt,                                                 // 딜러지급액
  evdcCd,                                                    // 증빙종류 코드
  carKndCd,                                                  // 차량 유형 코드
  carNm,                                                     // 차량명
  carNo,                                                     // 차량번호
  ownrNm,                                                    // 고객명/상사명
  ownrPhon,                                                  // 연락처  
  brkMemo,                                                   // 특이사항
  usrId,                                                     // 등록자 ID
  carRegId                                                 // 차량 등록 ID
}) => {
  try {
    const request = pool.request();

    console.log('brkSeq:', brkSeq);
    console.log('carNo:', carNo);
    console.log('dealerId:', dealerId);
    console.log('tradeItemCd:', tradeItemCd);
    console.log('brkSaleDt:', brkSaleDt);
    console.log('brkAmt:', brkAmt);
    console.log('brkSupPrc:', brkSupPrc);
    console.log('brkVat:', brkVat);
    console.log('brkDedtAmt:', brkDedtAmt);
    console.log('brkTaxAmt:', brkTaxAmt);
    console.log('brkPayAmt:', brkPayAmt);
    console.log('evdcCd:', evdcCd);
    console.log('carKndCd:', carKndCd);
    console.log('carNm:', carNm);
    console.log('carNo:', carNo);
    console.log('ownrNm:', ownrNm);
    console.log('ownrPhon:', ownrPhon);
    console.log('brkDesc:', brkMemo);
    console.log('usrId:', usrId);
    console.log('carRegId:', carRegId);

    request.input("BRK_SEQ", sql.Int, brkSeq);                        // 알선 판매 순번

    request.input("BRK_AGENT_ID", sql.VarChar, agentId);                            // 상사 ID              
    request.input("BRK_DLR_ID", sql.VarChar, dealerId);                             // 딜러 ID              
    request.input("BRK_TRADE_ITEM_CD", sql.VarChar, tradeItemCd);              // 거래항목 코드
    request.input("BRK_SALE_DT", sql.VarChar, brkSaleDt);                      // 알선판매일
    request.input("BRK_AMT", sql.Int, brkAmt);                                 // 알선금액
    request.input("BRK_SUP_PRC", sql.Int, brkSupPrc);                         // 공급가액
    request.input("BRK_VAT", sql.Int, brkVat);                                // 부가세
    request.input("DEDT_AMT", sql.Int, brkDedtAmt);                          // 공제비용
    request.input("TAX_AMT", sql.Int, brkTaxAmt);                                // 세액
    request.input("PAY_AMT", sql.Int, brkPayAmt);                            // 딜러지급액
    request.input("BRK_EVDC_CD", sql.VarChar, evdcCd);                       // 증빙종류 코드
    request.input("CAR_KND_CD", sql.VarChar, carKndCd);                      // 차량 종류 코드         
    request.input("CAR_NO", sql.VarChar, carNo);                                // 차량 번호       
    request.input("CAR_NM", sql.VarChar, carNm);                               // 차량 명              
    request.input("OWNR_NM", sql.VarChar, ownrNm);                           // 고객명/상사명
    request.input("OWNR_PHON", sql.VarChar, ownrPhon);                       // 연락처
    request.input("BRK_MEMO", sql.VarChar, brkMemo);                       // 특이사항
    request.input("REGR_ID", sql.VarChar, usrId);                            // 등록자 ID            
    request.input("MODR_ID", sql.VarChar, usrId);                            // 수정자 ID   
    request.input("CAR_REG_ID", sql.VarChar, carRegId);                      // 차량 등록 ID

    const query1 = `UPDATE dbo.CJB_CAR_SEL_BRK 
                   SET  BRK_AGENT_NM = (SELECT AGENT_NM FROM dbo.CJB_AGENT A WHERE A.AGENT_ID = @BRK_AGENT_ID) 
                      , BRK_AGENT_ID = @BRK_AGENT_ID
                      , BRK_DLR_NM = (SELECT USR_NM FROM dbo.CJB_USR A WHERE A.USR_ID = @BRK_DLR_ID)
                      , BRK_DLR_ID = @BRK_DLR_ID
                      , BRK_AMT = @BRK_AMT
                      , BRK_SUP_PRC = @BRK_SUP_PRC
                      , BRK_VAT = @BRK_VAT
                      , DEDT_AMT = @DEDT_AMT
                      , TAX_AMT = @TAX_AMT
                      , PAY_AMT = @PAY_AMT
                      , BRK_EVDC_CD = @BRK_EVDC_CD
                      , BRK_MEMO = @BRK_MEMO
                      , BRK_SALE_DT = @BRK_SALE_DT
                      , CAR_REG_ID = @CAR_REG_ID
                      , MODR_ID = @MODR_ID
                  WHERE BRK_SEQ = @BRK_SEQ`;

                  console.log('query1:', query1);
                  

    const query2 = `UPDATE dbo.CJB_CAR_SEL
                   SET MODR_ID = @MODR_ID
                   WHERE CAR_REG_ID = @CAR_REG_ID;`;

    await Promise.all([request.query(query1), request.query(query2)]);

  } catch (err) {
    console.error("Error inserting car concil:", err);
    throw err;
  }
};


