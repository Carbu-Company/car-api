const sql = require("mssql");
const pool = require("../../config/db");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 알선 2.0
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 알선 목록 조회 
exports.getCarBrkTradeList = async ({ 
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
                FROM dbo.CJB_CAR_BRK_TRADE A  -- 매출자료
              WHERE 1 = 1
                AND A.AGENT_ID = @CAR_AGENT
                AND A.DEL_YN = 'N'
                ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO)" : ""}
                ${dealer ? "AND (A.SALE_DLR_ID LIKE @DEALER)" : ""}
                ${startDt ? `AND ${dtGubun === '1' ? 'A.BRK_SALE_DT' : 'CONVERT(VARCHAR(10), A.REG_DTIME, 23)'} >= @START_DT` : ""}
                ${endDt ? `AND ${dtGubun === '1' ? 'A.BRK_SALE_DT' : 'CONVERT(VARCHAR(10), A.REG_DTIME, 23)'} <= @END_DT` : ""}
                ${dtlBrkTradeItemCd ? "AND C.TRADE_ITEM_CD LIKE @DTL_BRK_TRADE_ITEM_CD" : ""}
                ${dtlBrkAgentNm ? "AND A.BRK_AGENT_NM LIKE @DTL_BRK_AGENT_NM" : ""}
                ${dtlCarNm ? "AND A.CAR_NM LIKE @DTL_CAR_NM" : ""}
                ${dtlCustNm ? "AND A.CUST_NM LIKE @DTL_CUST_NM" : ""}
                ${dtlEvdcGubun ? "AND B.SALE_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                ${dtlBrkMemo ? "AND A.BRK_MEMO LIKE @DTL_BRK_MEMO" : ""}
      `;
    
      const dataQuery = `
                SELECT A.BRK_TRADE_SEQ    
                    , A.SALE_DLR_ID      
                    , A.TRADE_ITEM_CD    
                    , A.TRADE_ITEM_NM    
                    , A.BRK_SALE_DT      
                    , A.TRADE_AMT        
                    , A.DEDT_AMT         
                    , A.DLR_PAY_AMT      
                    , A.SALE_EVDC_CD     
                    , A.CAR_NM           
                    , A.CAR_KND_CD       
                    , A.CAR_NO           
                    , A.BRK_AGENT_NM    
                    , A.CUST_NM          
                    , A.CUST_PHON        
                    , A.BRK_MEMO      
                    , A.REGR_ID          
                    , A.MODR_ID          
                FROM dbo.CJB_CAR_SEL_BRK A
              WHERE  1 = 1
                AND A.AGENT_ID = @CAR_AGENT
                AND A.DEL_YN = 'N'
                ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO)" : ""}
                ${dealer ? "AND (A.SALE_DLR_ID LIKE @DEALER)" : ""}
                ${startDt ? `AND ${dtGubun === '1' ? 'A.BRK_SALE_DT' : 'CONVERT(VARCHAR(10), A.REG_DTIME, 23)'} >= @START_DT` : ""}
                ${endDt ? `AND ${dtGubun === '1' ? 'A.BRK_SALE_DT' : 'CONVERT(VARCHAR(10), A.REG_DTIME, 23)'} <= @END_DT` : ""}
                ${dtlBrkTradeItemCd ? "AND A.TRADE_ITEM_CD LIKE @DTL_BRK_TRADE_ITEM_CD" : ""}
                ${dtlBrkAgentNm ? "AND A.BRK_AGENT_NM LIKE @DTL_BRK_AGENT_NM" : ""}
                ${dtlCarNm ? "AND A.CAR_NM LIKE @DTL_CAR_NM" : ""}
                ${dtlCustNm ? "AND A.CUST_NM LIKE @DTL_CUST_NM" : ""}
                ${dtlEvdcGubun ? "AND A.SALE_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                ${dtlBrkMemo ? "AND A.BRK_MEMO LIKE @DTL_BRK_MEMO" : ""}
          ORDER BY ${orderItem === '01' ? 'A.BRK_SALE_DT' : 'CONVERT(VARCHAR(10), A.REG_DTIME, 23)'} ${ordAscDesc}
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
  exports.getCarBrkTradeSummary = async ({  
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
                            , COUNT(C.BRK_TRADE_SEQ) CNT
                            , ISNULL(SUM(C.TRADE_AMT), 0) TRADE_AMT
                            , ISNULL(SUM(C.TRADE_SUP_PRC), 0) TRADE_SUP_PRC
                            , ISNULL(SUM(C.TRADE_VAT), 0) TRADE_VAT
                            , ISNULL(SUM(C.DEDT_AMT), 0) DEDT_AMT
                            , ISNULL(SUM(C.DLR_PAY_AMT), 0) DLR_PAY_AMT
                        FROM dbo.CJB_CAR_BRK_TRADE A
                        WHERE A.AGENT_ID = @CAR_AGENT
                            AND A.DEL_YN = 'N'
                            AND A.TRADE_ITEM_CD = '001' -- 알선수수료 
                ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO)" : ""}
                ${dealer ? "AND (A.SALE_DLR_ID LIKE @DEALER)" : ""}
                ${startDt ? `AND ${dtGubun === '1' ? 'A.BRK_SALE_DT' : 'CONVERT(VARCHAR(10), A.REG_DTIME, 23)'} >= @START_DT` : ""}
                ${endDt ? `AND ${dtGubun === '1' ? 'A.BRK_SALE_DT' : 'CONVERT(VARCHAR(10), A.REG_DTIME, 23)'} <= @END_DT` : ""}
                ${dtlBrkTradeItemCd ? "AND A.TRADE_ITEM_CD LIKE @DTL_BRK_TRADE_ITEM_CD" : ""}
                ${dtlBrkAgentNm ? "AND A.BRK_AGENT_NM LIKE @DTL_BRK_AGENT_NM" : ""}
                ${dtlCarNm ? "AND A.CAR_NM LIKE @DTL_CAR_NM" : ""}
                ${dtlCustNm ? "AND A.CUST_NM LIKE @DTL_CUST_NM" : ""}
                ${dtlEvdcGubun ? "AND A.SALE_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                ${dtlBrkMemo ? "AND A.BRK_MEMO LIKE @DTL_BRK_MEMO" : ""}
                      UNION ALL
                        SELECT '알선수익금' AS BRK_TRADE_ITEM_NM
                            , COUNT(C.BRK_TRADE_SEQ) CNT
                            , ISNULL(SUM(C.TRADE_AMT), 0) TRADE_AMT
                            , ISNULL(SUM(C.TRADE_SUP_PRC), 0) TRADE_SUP_PRC
                            , ISNULL(SUM(C.TRADE_VAT), 0) TRADE_VAT
                            , ISNULL(SUM(C.DEDT_AMT), 0) DEDT_AMT
                            , ISNULL(SUM(C.DLR_PAY_AMT), 0) DLR_PAY_AMT
                        FROM dbo.CJB_CAR_BRK_TRADE A
                        WHERE A.AGENT_ID = @CAR_AGENT
                            AND A.DEL_YN = 'N'
                            AND A.TRADE_ITEM_CD = '002' -- 알선수익금 
                ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO)" : ""}
                ${dealer ? "AND (A.SALE_DLR_ID LIKE @DEALER)" : ""}
                ${startDt ? `AND ${dtGubun === '1' ? 'A.BRK_SALE_DT' : 'CONVERT(VARCHAR(10), A.REG_DTIME, 23)'} >= @START_DT` : ""}
                ${endDt ? `AND ${dtGubun === '1' ? 'A.BRK_SALE_DT' : 'CONVERT(VARCHAR(10), A.REG_DTIME, 23)'} <= @END_DT` : ""}
                ${dtlBrkTradeItemCd ? "AND A.TRADE_ITEM_CD LIKE @DTL_BRK_TRADE_ITEM_CD" : ""}
                ${dtlBrkAgentNm ? "AND A.BRK_AGENT_NM LIKE @DTL_BRK_AGENT_NM" : ""}
                ${dtlCarNm ? "AND A.CAR_NM LIKE @DTL_CAR_NM" : ""}
                ${dtlCustNm ? "AND A.CUST_NM LIKE @DTL_CUST_NM" : ""}
                ${dtlEvdcGubun ? "AND A.SALE_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                ${dtlBrkMemo ? "AND A.BRK_MEMO LIKE @DTL_BRK_MEMO" : ""}
                      UNION ALL
                      SELECT '합계' AS BRK_TRADE_ITEM_NM
                            , COUNT(C.BRK_TRADE_SEQ) CNT
                            , ISNULL(SUM(C.TRADE_AMT), 0) TRADE_AMT
                            , ISNULL(SUM(C.TRADE_SUP_PRC), 0) TRADE_SUP_PRC
                            , ISNULL(SUM(C.TRADE_VAT), 0) TRADE_VAT
                            , ISNULL(SUM(C.DEDT_AMT), 0) DEDT_AMT
                            , ISNULL(SUM(C.DLR_PAY_AMT), 0) DLR_PAY_AMT
                        FROM dbo.CJB_CAR_BRK_TRADE A
                        WHERE A.AGENT_ID = @CAR_AGENT
                            AND A.DEL_YN = 'N'
                ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO)" : ""}
                ${dealer ? "AND (A.SALE_DLR_ID LIKE @DEALER)" : ""}
                ${startDt ? `AND ${dtGubun === '1' ? 'A.BRK_SALE_DT' : 'CONVERT(VARCHAR(10), A.REG_DTIME, 23)'} >= @START_DT` : ""}
                ${endDt ? `AND ${dtGubun === '1' ? 'A.BRK_SALE_DT' : 'CONVERT(VARCHAR(10), A.REG_DTIME, 23)'} <= @END_DT` : ""}
                ${dtlBrkTradeItemCd ? "AND A.TRADE_ITEM_CD LIKE @DTL_BRK_TRADE_ITEM_CD" : ""}
                ${dtlBrkAgentNm ? "AND A.BRK_AGENT_NM LIKE @DTL_BRK_AGENT_NM" : ""}
                ${dtlCarNm ? "AND A.CAR_NM LIKE @DTL_CAR_NM" : ""}
                ${dtlCustNm ? "AND A.CUST_NM LIKE @DTL_CUST_NM" : ""}
                ${dtlEvdcGubun ? "AND A.SALE_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                ${dtlBrkMemo ? "AND A.BRK_MEMO LIKE @DTL_BRK_MEMO" : ""}
        `;
  
      const result = await request.query(query);
      return result.recordset;
    } catch (err) {
      console.error("Error fetching car concil summary:", err);
      throw err;
    }
  };
  
  // 알선 상세 조회
  exports.getCarBrkTradeInfo = async ({ carRegId }) => {
    try {
      const request = pool.request();
      request.input("CAR_REG_ID", sql.VarChar, carRegId);   
  
      const query = `SELECT A.BRK_TRADE_SEQ    
                          , A.SALE_DLR_ID      
                          , A.TRADE_ITEM_CD    
                          , A.TRADE_ITEM_NM    
                          , A.BRK_SALE_DT      
                          , A.TRADE_AMT  
                          , A.TRADE_SUP_PRC      
                          , A.TRADE_VAT      
                          , A.DEDT_AMT         
                          , A.DLR_PAY_AMT      
                          , A.SALE_EVDC_CD     
                          , A.CAR_NM           
                          , A.CAR_KND_CD       
                          , A.CAR_NO           
                          , A.BRK_AGENT_NM    
                          , A.CUST_NM          
                          , A.CUST_PHON        
                          , A.BRK_MEMO      
                          , A.REGR_ID          
                          , A.MODR_ID    
                       FROM dbo.CJB_CAR_BRK_TRADE A
                      WHERE A.BRK_TRADE_SEQ = @BRK_TRADE_SEQ `;

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
  saleDlrId,                 // SALE_DLR_ID: 판매딜러 ID
  tradeItemCd,               // TRADE_ITEM_CD: 거래항목 코드
  tradeItemNm,               // TRADE_ITEM_NM: 거래항목명
  brkSaleDt,                 // BRK_SALE_DT: 알선판매일  
  tradeAmt,                    // TRADE_AMT: 알선금액
  tradeSupPrc,                 // TRADE_SUP_PRC: 공급가액
  tradeVat,                    // TRADE_VAT: 부가세
  dedtAmt,                // DEDT_AMT: 공제비용
  dlrPayAmt,                 // DLR_PAY_AMT: 딜러지급액
  saleEvdcCd,                    // SALE_EVDC_CD: 증빙종류 코드
  carNm,                     // CAR_NM: 차량명
  carKndCd,                  // CAR_KND_CD: 차량 유형 코드
  carNo,                     // CAR_NO: 차량번호
  brkAgentNm,                   // BRK_AGENT_NM: 고객상사명(상사명)
  custNm,                    // CUST_NM: 고객명/상사명
  custPhon,                  // CUST_PHON: 연락처  
  brkMemo,                   // BRK_MEMO: 특이사항
  usrId,                     // REGR_ID: 등록자 ID
  usrId,                     // MODR_ID: 수정자 ID
  carRegId                   // 차량 등록 ID
}) => {
  try {
    const request = pool.request();

    // BRK_TRADE_SEQ는 자동 생성(IDENTITY)로 입력하지 않음

    // Insert를 위한 input 매핑
    request.input("SALE_DLR_ID", sql.VarChar, saleDlrId);                // 딜러 ID
    request.input("TRADE_ITEM_CD", sql.VarChar, tradeItemCd);            // 거래항목 코드
    request.input("TRADE_ITEM_NM", sql.VarChar, tradeItemNm);            // 거래항목명
    request.input("BRK_SALE_DT", sql.VarChar, brkSaleDt);                // 알선판매일
    request.input("TRADE_AMT", sql.Int, tradeAmt);                       // 알선금액
    request.input("TRADE_SUP_PRC", sql.Int, tradeSupPrc);                // 공급가액
    request.input("TRADE_VAT", sql.Int, tradeVat);                       // 부가세
    request.input("DEDT_AMT", sql.Int, dedtAmt);                         // 공제비용
    request.input("DLR_PAY_AMT", sql.Int, dlrPayAmt);                    // 딜러지급액
    request.input("SALE_EVDC_CD", sql.VarChar, saleEvdcCd);              // 증빙종류 코드
    request.input("CAR_NM", sql.VarChar, carNm);                         // 차량명
    request.input("CAR_KND_CD", sql.VarChar, carKndCd);                  // 차량 종류 코드
    request.input("CAR_NO", sql.VarChar, carNo);                         // 차량번호
    request.input("BRK_AGENT_NM", sql.VarChar, brkAgentNm);             // 고객상사명(상사명)
    request.input("CUST_NM", sql.VarChar, custNm);                       // 고객명/상사명
    request.input("CUST_PHON", sql.VarChar, custPhon);                   // 연락처
    request.input("BRK_MEMO", sql.VarChar, brkMemo);                     // 특이사항
    request.input("REGR_ID", sql.VarChar, usrId);                        // 등록자 ID
    request.input("MODR_ID", sql.VarChar, usrId);                        // 수정자 ID

    const query1 = `INSERT INTO dbo.CJB_CAR_BRK_TRADE (
                        SALE_DLR_ID,      
                        TRADE_ITEM_CD,    
                        TRADE_ITEM_NM,    
                        BRK_SALE_DT,      
                        TRADE_AMT,  
                        TRADE_SUP_PRC,      
                        TRADE_VAT,      
                        DEDT_AMT,         
                        DLR_PAY_AMT,      
                        SALE_EVDC_CD,     
                        CAR_NM,           
                        CAR_KND_CD,       
                        CAR_NO,           
                        BRK_AGENT_NM,    
                        CUST_NM,          
                        CUST_PHON,        
                        BRK_MEMO,      
                        REGR_ID,          
                        MODR_ID       
                  ) VALUES (
                    @SALE_DLR_ID,
                    @TRADE_ITEM_CD,
                    @TRADE_ITEM_NM,
                    @BRK_SALE_DT,
                    @TRADE_AMT,
                    @TRADE_SUP_PRC,
                    @TRADE_VAT,
                    @DEDT_AMT,
                    @DLR_PAY_AMT,
                    @SALE_EVDC_CD,
                    @CAR_NM,
                    @CAR_KND_CD,
                    @CAR_NO,
                    @BRK_AGENT_NM,
                    @CUST_NM,
                    @CUST_PHON,
                    @BRK_MEMO,
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
exports.updateCarBrkTrade = async ({
  brkTradeSeq,                // BRK_TRADE_SEQ: 알선 판매 순번
  saleDlrId,                 // SALE_DLR_ID: 판매딜러 ID
  tradeItemCd,               // TRADE_ITEM_CD: 거래항목 코드
  tradeItemNm,               // TRADE_ITEM_NM: 거래항목명
  brkSaleDt,                 // BRK_SALE_DT: 알선판매일  
  tradeAmt,                    // TRADE_AMT: 알선금액
  tradeSupPrc,                 // TRADE_SUP_PRC: 공급가액
  tradeVat,                    // TRADE_VAT: 부가세
  dedtAmt,                // DEDT_AMT: 공제비용
  dlrPayAmt,                 // DLR_PAY_AMT: 딜러지급액
  saleEvdcCd,                    // SALE_EVDC_CD: 증빙종류 코드
  carNm,                     // CAR_NM: 차량명
  carKndCd,                  // CAR_KND_CD: 차량 유형 코드
  carNo,                     // CAR_NO: 차량번호
  brkAgentNm,                   // BRK_AGENT_NM: 고객상사명(상사명)
  custNm,                    // CUST_NM: 고객명/상사명
  custPhon,                  // CUST_PHON: 연락처  
  brkMemo,                   // BRK_MEMO: 특이사항
  usrId,                     // REGR_ID: 등록자 ID
  usrId,                     // MODR_ID: 수정자 ID
}) => {
  try {
    const request = pool.request();

    // Update를 위한 input 매핑
    request.input("BRK_TRADE_SEQ", sql.Int, brkTradeSeq);                // 알선 판매 순번
    request.input("SALE_DLR_ID", sql.VarChar, saleDlrId);                // 딜러 ID
    request.input("TRADE_ITEM_CD", sql.VarChar, tradeItemCd);            // 거래항목 코드
    request.input("TRADE_ITEM_NM", sql.VarChar, tradeItemNm);            // 거래항목명
    request.input("BRK_SALE_DT", sql.VarChar, brkSaleDt);                // 알선판매일
    request.input("TRADE_AMT", sql.Int, tradeAmt);                       // 알선금액
    request.input("TRADE_SUP_PRC", sql.Int, tradeSupPrc);                // 공급가액
    request.input("TRADE_VAT", sql.Int, tradeVat);                       // 부가세
    request.input("DEDT_AMT", sql.Int, dedtAmt);                         // 공제비용
    request.input("DLR_PAY_AMT", sql.Int, dlrPayAmt);                    // 딜러지급액
    request.input("SALE_EVDC_CD", sql.VarChar, saleEvdcCd);              // 증빙종류 코드
    request.input("CAR_NM", sql.VarChar, carNm);                         // 차량명
    request.input("CAR_KND_CD", sql.VarChar, carKndCd);                  // 차량 종류 코드
    request.input("CAR_NO", sql.VarChar, carNo);                         // 차량번호
    request.input("BRK_AGENT_NM", sql.VarChar, brkAgentNm);             // 고객상사명(상사명)
    request.input("CUST_NM", sql.VarChar, custNm);                       // 고객명/상사명
    request.input("CUST_PHON", sql.VarChar, custPhon);                   // 연락처
    request.input("BRK_MEMO", sql.VarChar, brkMemo);                     // 특이사항
    request.input("REGR_ID", sql.VarChar, usrId);                        // 등록자 ID
    request.input("MODR_ID", sql.VarChar, usrId);                        // 수정자 ID

    const query1 = `UPDATE dbo.CJB_CAR_BRK_TRADE 
                   SET  SALE_DLR_ID = @SALE_DLR_ID,
                        TRADE_ITEM_CD = @TRADE_ITEM_CD,
                        TRADE_ITEM_NM = @TRADE_ITEM_NM,
                        BRK_SALE_DT = @BRK_SALE_DT,
                        TRADE_AMT = @TRADE_AMT,
                        TRADE_SUP_PRC = @TRADE_SUP_PRC,
                        TRADE_VAT = @TRADE_VAT,
                        DEDT_AMT = @DEDT_AMT,
                        DLR_PAY_AMT = @DLR_PAY_AMT,
                        SALE_EVDC_CD = @SALE_EVDC_CD,
                        CAR_NM = @CAR_NM,
                        CAR_KND_CD = @CAR_KND_CD,
                        CAR_NO = @CAR_NO,
                        BRK_AGENT_NM = @BRK_AGENT_NM,
                        CUST_NM = @CUST_NM,
                        CUST_PHON = @CUST_PHON,
                        BRK_MEMO = @BRK_MEMO,
                        MOD_DTIME = GETDATE(),
                        MODR_ID = @MODR_ID
                  WHERE BRK_TRADE_SEQ = @BRK_TRADE_SEQ`;

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


