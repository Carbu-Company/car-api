const sql = require("mssql");
const pool = require("../../config/db");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 매도 2.0
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// 차량 판매매도 목록 조회
exports.getCarSelList = async ({ 
    carAgent, 
    page,
    pageSize,
    carNo,
    dealer,
    dtGubun,
    startDt,
    endDt, 
    dtlCustomerName,
    dtlCustGubun,
    dtlEvdcGubun,
    dtlPrsnGubun,
    dtlOwnerBrno,
    dtlOwnerSsn,
    dtlCtshNo,
    dtlCarNoBefore,
    dtlPurStatGubun, 
    orderItem = '제시일',
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
      console.log('dtlCustomerName:', dtlCustomerName);
      console.log('dtlCustGubun:', dtlCustGubun);
      console.log('dtlEvdcGubun:', dtlEvdcGubun);
      console.log('dtlPrsnGubun:', dtlPrsnGubun);
      console.log('dtlOwnerBrno:', dtlOwnerBrno);
      console.log('dtlOwnerSsn:', dtlOwnerSsn);
      console.log('dtlCtshNo:', dtlCtshNo);
      console.log('dtlCarNoBefore:', dtlCarNoBefore);
      console.log('orderItem:', orderItem);
      console.log('ordAscDesc:', ordAscDesc);
  */
      request.input("CAR_AGENT", sql.VarChar, carAgent);
      request.input("PAGE_SIZE", sql.Int, pageSize);
      request.input("PAGE", sql.Int, page);
  
  
      if (carNo) request.input("CAR_NO", sql.VarChar, `%${carNo}%`);
      if (dealer) request.input("DEALER", sql.VarChar, `%${dealer}%`);
      if (dtGubun) request.input("DT_GUBUN", sql.VarChar, dtGubun);
      if (startDt) request.input("START_DT", sql.VarChar, startDt);
      if (endDt) request.input("END_DT", sql.VarChar, endDt);
      if (dtlCustomerName) request.input("DTL_CUSTOMER_NAME", sql.VarChar, `%${dtlCustomerName}%`);
      if (dtlCustGubun) request.input("DTL_CUST_GUBUN", sql.VarChar, dtlCustGubun);
      if (dtlEvdcGubun) request.input("DTL_EVDC_GUBUN", sql.VarChar, dtlEvdcGubun);
      if (dtlPrsnGubun) request.input("DTL_PRSN_GUBUN", sql.VarChar, dtlPrsnGubun);
      if (dtlOwnerBrno) request.input("DTL_OWNER_BRNO", sql.VarChar, dtlOwnerBrno);
      if (dtlOwnerSsn) request.input("DTL_OWNER_SSN", sql.VarChar, dtlOwnerSsn);
      if (dtlCtshNo) request.input("DTL_CTSH_NO", sql.VarChar, dtlCtshNo);
      if (dtlCarNoBefore) request.input("DTL_CAR_NO_BEFORE", sql.VarChar, dtlCarNoBefore);
      if (dtlPurStatGubun) request.input("DTL_PUR_STAT_GUBUN", sql.VarChar, dtlPurStatGubun);

      // 전체 카운트 조회
      const countQuery = `
            SELECT COUNT(*) as totalCount
                FROM dbo.CJB_CAR_PUR A
                    , dbo.CJB_CAR_SEL B
                WHERE A.CAR_REG_ID = B.CAR_REG_ID
                  AND A.AGENT_ID = @CAR_AGENT
                  AND A.CAR_DEL_YN = 'N'
                  AND A.CAR_STAT_CD IN ('002', '003')     --- 일반판매, 알선판매매
                ${carNo ? "AND A.CAR_NO LIKE @CAR_NO" : ""}
                ${dealer ? "AND B.DLR_ID LIKE @DEALER" : ""}
                ${dtGubun === '01' ? "AND B.CAR_SALE_DT >= @START_DT AND B.CAR_SALE_DT <= @END_DT" : 
                  dtGubun === '02' ? "AND B.SALE_REG_DT >= @START_DT AND B.SALE_REG_DT <= @END_DT" :
                  dtGubun === '03' ? "AND B.ADJ_FIN_DT >= @START_DT AND B.ADJ_FIN_DT <= @END_DT" :
                  dtGubun === '04' ? "AND A.CAR_PUR_DT >= @START_DT AND A.CAR_PUR_DT <= @END_DT" : ""}
                ${dtlCustomerName ? "AND OWNR_NM LIKE @DTL_CUSTOMER_NAME" : ""}   -- 소유자 이름
                ${dtlCustGubun ? "AND OWNR_TP_CD = @DTL_CUST_GUBUN" : ""}     -- 고객유형
                ${dtlEvdcGubun ? "AND PUR_EVDC_CD = @DTL_EVDC_GUBUN" : ""}    -- 매출증빙 구분 (현금영수증,...)
                ${dtlPrsnGubun ? "AND PRSN_SCT_CD = @DTL_PRSN_GUBUN" : ""}   -- 제시구분 (상사매입, 고객위탁)
                ${dtlOwnerBrno ? "AND OWNR_BRNO = @DTL_OWNER_BRNO" : ""}       -- 소유자 사업자번호
                ${dtlOwnerSsn ? "AND OWNR_SSN = @DTL_OWNER_SSN" : ""}           -- 소유자 주민번호
                ${dtlCtshNo ? "AND CTSH_NO = @DTL_CTSH_NO" : ""}                  -- 계약서 번호
                ${dtlCarNoBefore ? "AND PUR_BEF_CAR_NO = @DTL_CAR_NO_BEFORE" : ""} -- 이전 차량번호
                ${dtlPurStatGubun ? "AND CAR_DEL_YN = @DTL_PUR_STAT_GUBUN" : ""}    -- 차량 삭제 여부
                     ;`;

      const dataQuery = `SELECT A.CAR_STAT_CD     -- 차량 상태 코드
                    , dbo.CJB_FN_GET_CD_NM('01', A.CAR_STAT_CD) CAR_STAT_NM
                    , B.SALE_TP_CD      -- 판매유형코드 
                    , dbo.CJB_FN_GET_CD_NM('03', B.SALE_TP_CD) SALE_TP_NM
                    , (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = B.DLR_ID) AS SEL_DLR_NM
                    , B.BUYER_NM        -- 매입자명 
                    , B.SALE_AMT        -- 매도 금액
                    , B.AGENT_SEL_COST  -- 상사 매도 비용
                    , B.PERF_INFE_AMT   -- 성능 보험료 금액
                    , B.CAR_SALE_DT     -- 차량 판매 일자 
                    , B.SALE_REG_DT     -- 매출 등록 일자
                    , A.CAR_NO          -- 차량번호
                    , A.CAR_NM          -- 차량명
                    , A.CAR_PUR_DT      -- 차량구매일
                    , A.DLR_ID
                    , (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = A.DLR_ID) AS DLR_NM
                    , A.PUR_AMT         -- 차량구매금액
                FROM dbo.CJB_CAR_PUR A
                    , dbo.CJB_CAR_SEL B
                WHERE A.CAR_REG_ID = B.CAR_REG_ID
                  AND A.AGENT_ID = @CAR_AGENT
                  AND A.CAR_DEL_YN = 'N'
                  AND A.CAR_STAT_CD IN ('002', '003')     --- 일반판매, 알선판매매
                  ${carNo ? "AND A.CAR_NO LIKE @CAR_NO" : ""}
                  ${dealer ? "AND DLR_ID LIKE @DEALER" : ""}
                  ${dtGubun === '01' ? "AND B.CAR_SALE_DT >= @START_DT AND B.CAR_SALE_DT <= @END_DT" : 
                    dtGubun === '02' ? "AND B.SALE_REG_DT >= @START_DT AND B.SALE_REG_DT <= @END_DT" :
                    dtGubun === '03' ? "AND B.ADJ_FIN_DT >= @START_DT AND B.ADJ_FIN_DT <= @END_DT" :
                    dtGubun === '04' ? "AND A.CAR_PUR_DT >= @START_DT AND A.CAR_PUR_DT <= @END_DT" : ""}
                  ${dtlCustomerName ? "AND OWNR_NM LIKE @DTL_CUSTOMER_NAME" : ""}   -- 소유자 이름
                  ${dtlCustGubun ? "AND OWNR_TP_CD = @DTL_CUST_GUBUN" : ""}     -- 고객유형
                  ${dtlEvdcGubun ? "AND PUR_EVDC_CD = @DTL_EVDC_GUBUN" : ""}    -- 매출증빙 구분 (현금영수증,...)
                  ${dtlPrsnGubun ? "AND PRSN_SCT_CD = @DTL_PRSN_GUBUN" : ""}   -- 제시구분 (상사매입, 고객위탁)
                  ${dtlOwnerBrno ? "AND OWNR_BRNO = @DTL_OWNER_BRNO" : ""}       -- 소유자 사업자번호
                  ${dtlOwnerSsn ? "AND OWNR_SSN = @DTL_OWNER_SSN" : ""}           -- 소유자 주민번호
                  ${dtlCtshNo ? "AND CTSH_NO = @DTL_CTSH_NO" : ""}                  -- 계약서 번호
                  ${dtlCarNoBefore ? "AND PUR_BEF_CAR_NO = @DTL_CAR_NO_BEFORE" : ""} -- 이전 차량번호
                  ${dtlPurStatGubun ? "AND CAR_DEL_YN = @DTL_PUR_STAT_GUBUN" : ""}    -- 차량 삭제 여부
                ORDER BY ${orderItem === '제시일' ? 'CAR_PUR_DT' : orderItem === '담당딜러' ? 'DLR_ID' : orderItem === '고객유형' ? 'OWNR_TP_CD' : orderItem} ${ordAscDesc}
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
      console.error("Error fetching suggest list:", err);
      throw err;
    }
  };
  
 
  // 제시 차량 합계 조회
  exports.getCarSelSummary = async ({  
    carAgent, 
    page,
    pageSize,
    carNo,
    dealer,
    dtGubun,
    startDt,
    endDt, 
    dtlCustomerName,
    dtlCustGubun,
    dtlEvdcGubun,
    dtlPrsnGubun,
    dtlOwnerBrno,
    dtlOwnerSsn,
    dtlCtshNo,
    dtlCarNoBefore,
    dtlPurStatGubun,
    orderItem = '제시일',
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
      console.log('dtlCustomerName:', dtlCustomerName);
      console.log('dtlCustGubun:', dtlCustGubun);
      console.log('dtlEvdcGubun:', dtlEvdcGubun);
      console.log('dtlPrsnGubun:', dtlPrsnGubun);
      console.log('dtlOwnerBrno:', dtlOwnerBrno);
      console.log('dtlOwnerSsn:', dtlOwnerSsn);
      console.log('dtlCtshNo:', dtlCtshNo);
      console.log('dtlCarNoBefore:', dtlCarNoBefore);
      console.log('dtlPurStatGubun:', dtlPurStatGubun);
      console.log('orderItem:', orderItem);
      console.log('ordAscDesc:', ordAscDesc);
  */
      request.input("CAR_AGENT", sql.VarChar, carAgent);
      request.input("PAGE_SIZE", sql.Int, pageSize);
      request.input("PAGE", sql.Int, page);
  
      if (carNo) request.input("CAR_NO", sql.VarChar, `%${carNo}%`);
      if (dealer) request.input("DEALER", sql.VarChar, `%${dealer}%`);
      if (dtGubun) request.input("DT_GUBUN", sql.VarChar, dtGubun);
      if (startDt) request.input("START_DT", sql.VarChar, startDt);
      if (endDt) request.input("END_DT", sql.VarChar, endDt);
      if (dtlCustomerName) request.input("DTL_CUSTOMER_NAME", sql.VarChar, `%${dtlCustomerName}%`);
      if (dtlCustGubun) request.input("DTL_CUST_GUBUN", sql.VarChar, dtlCustGubun);
      if (dtlEvdcGubun) request.input("DTL_EVDC_GUBUN", sql.VarChar, dtlEvdcGubun);
      if (dtlPrsnGubun) request.input("DTL_PRSN_GUBUN", sql.VarChar, dtlPrsnGubun);
      if (dtlOwnerBrno) request.input("DTL_OWNER_BRNO", sql.VarChar, dtlOwnerBrno);
      if (dtlOwnerSsn) request.input("DTL_OWNER_SSN", sql.VarChar, dtlOwnerSsn);
      if (dtlCtshNo) request.input("DTL_CTSH_NO", sql.VarChar, dtlCtshNo);
      if (dtlCarNoBefore) request.input("DTL_CAR_NO_BEFORE", sql.VarChar, dtlCarNoBefore);  
      if (dtlPurStatGubun) request.input("DTL_PUR_STAT_GUBUN", sql.VarChar, dtlPurStatGubun);

      const query = `SELECT CASE WHEN GROUPING(CASE WHEN PRSN_SCT_CD = '0' THEN '상사매입' ELSE '고객위탁' END)  = 1 THEN '합계'  
                                ELSE (CASE WHEN PRSN_SCT_CD = '0' THEN '상사매입' ELSE '고객위탁' END) END PRSN_SCT_NM
                          , COUNT(A.CAR_REG_ID) CNT
                          , SUM(A.PUR_AMT) PUR_AMT
                          , SUM(A.CAR_LOAN_AMT)
                          , SUM(B.SALE_AMT) SALE_AMT
                          , SUM(B.AGENT_SEL_COST) AGENT_SEL_COST
                          , SUM(B.PERF_INFE_AMT) PERF_INFE_AMT
                      FROM dbo.CJB_CAR_PUR A
                          , dbo.CJB_CAR_SEL B
                      WHERE A.CAR_REG_ID = B.CAR_REG_ID
                        AND A.AGENT_ID = '00011'
                        AND A.CAR_DEL_YN = 'N'
                        AND A.CAR_STAT_CD IN ('002', '003')     --- 일반판매, 알선판매매
                          ${carNo ? "AND CAR_NO LIKE @CAR_NO" : ""}
                          ${dealer ? "AND DLR_ID LIKE @DEALER" : ""}
                          ${dtGubun === '01' ? "AND CAR_SALE_DT >= @START_DT AND CAR_SALE_DT <= @END_DT" : 
                            dtGubun === '02' ? "AND SALE_REG_DT >= @START_DT AND SALE_REG_DT <= @END_DT" :
                            dtGubun === '03' ? "AND ADJ_FIN_DT >= @START_DT AND ADJ_FIN_DT <= @END_DT" :
                            dtGubun === '04' ? "AND CAR_PUR_DT >= @START_DT AND CAR_PUR_DT <= @END_DT" : ""}
                          ${endDt ? "AND CAR_PUR_DT <= @END_DT" : ""}
                          ${dtlCustomerName ? "AND OWNR_NM LIKE @DTL_CUSTOMER_NAME" : ""}   -- 소유자 이름
                          ${dtlCustGubun ? "AND OWNR_TP_CD = @DTL_CUST_GUBUN" : ""}     -- 고객유형
                          ${dtlEvdcGubun ? "AND PUR_EVDC_CD = @DTL_EVDC_GUBUN" : ""}    -- 매출증빙 구분 (현금영수증,...)
                          ${dtlPrsnGubun ? "AND PRSN_SCT_CD = @DTL_PRSN_GUBUN" : ""}   -- 제시구분 (상사매입, 고객위탁)
                          ${dtlOwnerBrno ? "AND OWNR_BRNO = @DTL_OWNER_BRNO" : ""}       -- 소유자 사업자번호
                          ${dtlOwnerSsn ? "AND OWNR_SSN = @DTL_OWNER_SSN" : ""}           -- 소유자 주민번호
                          ${dtlCtshNo ? "AND CTSH_NO = @DTL_CTSH_NO" : ""}                  -- 계약서 번호
                          ${dtlCarNoBefore ? "AND PUR_BEF_CAR_NO = @DTL_CAR_NO_BEFORE" : ""} -- 이전 차량번호
                          ${dtlPurStatGubun ? "AND CAR_DEL_YN = @DTL_PUR_STAT_GUBUN" : ""}    -- 차량 삭제 여부
                    GROUP BY ROLLUP (CASE WHEN PRSN_SCT_CD = '0' THEN '상사매입' ELSE '고객위탁' END)
                        ; `;

        console.log('query:', query);
  
      const result = await request.query(query);
      return result.recordset;
    } catch (err) {
      console.error("Error fetching suggest sum:", err);
      throw err;
    }
  };
  
  
// 차량 판매 정보 수정
exports.updateCarSel = async ({ 
  carRegId, 
  carSaleDt, 
  saleRegDt, 
  agentId, 
  dlrId, 
  saleTpCd, 
  buyerNm, 
  buyerTpCd, 
  buyerSsn, 
  buyerBrno, 
  buyerPhon, 
  buyerZip, 
  buyerAddr1, 
  buyerAddr2, 
  saleAmt, 
  saleSupPrc, 
  saleVat, 
  saleCarNo, 
  agentSelCost, 
  perfInfeAmt, 
  txblIssuYn, 
  selcstInclusYn, 
  selEvdcCd, 
  selEvdcCont, 
  selEvdcDt, 
  adjFinYn, 
  attachedFiles, 
  saleDesc, 
  totFeeAmt, 
  realFeeAmt, 
  saleCrIssuYn, 
  modrId 
}) => {
    try {
      const request = pool.request();
  
      request.input("CAR_REG_ID", sql.VarChar, carRegId);
      request.input("CAR_SALE_DT", sql.VarChar, carSaleDt);
      request.input("SALE_REG_DT", sql.VarChar, saleRegDt);
      request.input("AGENT_ID", sql.VarChar, agentId);
      request.input("DLR_ID", sql.VarChar, dlrId);
      request.input("SALE_TP_CD", sql.VarChar, saleTpCd);
      request.input("BUYER_NM", sql.VarChar, buyerNm);
      request.input("BUYER_TP_CD", sql.VarChar, buyerTpCd);
      request.input("BUYER_SSN", sql.VarChar, buyerSsn);
      request.input("BUYER_BRNO", sql.VarChar, buyerBrno);
      request.input("BUYER_PHON", sql.VarChar, buyerPhon);
      request.input("BUYER_ZIP", sql.VarChar, buyerZip);
      request.input("BUYER_ADDR1", sql.VarChar, buyerAddr1);
      request.input("BUYER_ADDR2", sql.VarChar, buyerAddr2);
      request.input("SALE_AMT", sql.Decimal, saleAmt);
      request.input("SALE_SUP_PRC", sql.Decimal, saleSupPrc);
      request.input("SALE_VAT", sql.Decimal, saleVat);
      request.input("SALE_CAR_NO", sql.VarChar, saleCarNo);
      request.input("AGENT_SEL_COST", sql.Decimal, agentSelCost);
      request.input("PERF_INFE_AMT", sql.Decimal, perfInfeAmt);
      request.input("TXBL_ISSU_YN", sql.VarChar, txblIssuYn);
      request.input("SELCST_INCLUS_YN", sql.VarChar, selcstInclusYn);
      request.input("SEL_EVDC_CD", sql.VarChar, selEvdcCd);
      request.input("SEL_EVDC_CONT", sql.VarChar, selEvdcCont);
      request.input("SEL_EVDC_DT", sql.VarChar, selEvdcDt);
      request.input("ADJ_FIN_YN", sql.VarChar, adjFinYn);
      request.input("ATTACHED_FILES", sql.VarChar, attachedFiles);
      request.input("TOT_FEE_AMT", sql.Decimal, totFeeAmt);
      request.input("REAL_FEE_AMT", sql.Decimal, realFeeAmt);
      request.input("SALE_CR_ISSU_YN", sql.VarChar, saleCrIssuYn);
      request.input("SALE_DESC", sql.VarChar, saleDesc);
      request.input("MODR_ID", sql.VarChar, modrId);
  
      const query1 = `UPDATE dbo.CJB_CAR_SEL
                        SET   CAR_SALE_DT = @carSaleDt,       -- 차량 판매 일자
                              SALE_REG_DT = @saleRegDt,      -- 매출 등록 일자
                              AGENT_ID = @agentId,       -- 상사 ID
                              DLR_ID = @dlrId,          -- 담당딜러 ID (판매)
                              SALE_TP_CD = @saleTpCd,   -- 판매유형코드
                              BUYER_NM = @buyerNm,       -- 매입자명
                              BUYER_TP_CD = @buyerTpCd,   -- 매입자 유형코드
                              BUYER_SSN = @buyerSsn,      -- 매입자 주민번호
                              BUYER_BRNO = @buyerBrno,    -- 매입자 사업자번호
                              BUYER_PHON = @buyerPhon,    -- 매입자 전화번호
                              BUYER_ZIP = @buyerZip,      -- 매입자 우편번호
                              BUYER_ADDR1 = @buyerAddr1,    -- 매입자 주소
                              BUYER_ADDR2 = @buyerAddr2,    -- 매입자 상세주소
                              SALE_AMT = @saleAmt,          -- 매도 금액
                              SALE_SUP_PRC = @saleSupPrc,   -- 매도 공급가액
                              SALE_VAT = @saleVat,          -- 매도 부가세
                              SALE_CAR_NO = @saleCarNo,        -- 판매 차량 번호
                              AGENT_SEL_COST = @agentSelCost, -- 상사 매도 비용
                              PERF_INFE_AMT = @perfInfeAmt, -- 성능 보험료 금액
                              TXBL_ISSU_YN = @txblIssuYn,    -- 세금 발행 여부
                              SELCST_INCLUS_YN = @selcstInclusYn, -- 세무비 포함 여부
                              SEL_EVDC_CD = @selEvdcCd,      -- 증빙종류
                              SEL_EVDC_CONT = @selEvdcCont,  -- 증빙내용
                              SEL_EVDC_DT = @selEvdcDt,      -- 증빙일자
                              ADJ_FIN_YN = @adjFinYn,        -- 정산산 완료 여부
                              TOT_FEE_AMT = @totFeeAmt,      -- 총 비용
                              REAL_FEE_AMT = @realFeeAmt,    -- 실제 비용
                              SALE_CR_ISSU_YN = @saleCrIssuYn, -- 차량 판매 증서 발행 여부
                              SALE_DESC = @saleDesc,          -- 매도 설명
                              MOD_DTIME = GETDATE(),         -- 수정 일자
                              MODR_ID = @modrId               -- 수정자
                        WHERE  CAR_REG_ID = @CAR_REG_ID;`;
  
      await request.query(query);     

      
      attachedFiles.forEach(async (file) => {

        console.log("file:", file.name);
        console.log("file:", file.url);

        const fileRequest = pool.request();

        fileRequest.input("CAR_REG_ID", sql.VarChar, newCarRegId);
        fileRequest.input("FILE_NM", sql.VarChar, file.name);
        fileRequest.input("FILE_PATH", sql.VarChar, file.url);
        fileRequest.input("FILE_SCT_CD", sql.VarChar, 'P');
        fileRequest.input("FILE_KND_NM", sql.VarChar, 'P');
        fileRequest.input("AGENT_ID", sql.VarChar, carAgent);
        fileRequest.input("REGR_ID", sql.VarChar, usrId);
        fileRequest.input("MODR_ID", sql.VarChar, usrId);

        await fileRequest.query(`INSERT INTO CJB_FILE_INFO (
                                            AGENT_ID,
                                            FILE_SCT_CD,
                                            FILE_KND_NM,
                                            FILE_NM,
                                            FILE_PATH,
                                            CAR_REG_ID,
                                            REGR_ID,
                                            MODR_ID) VALUES (
                                            @AGENT_ID, 
                                            @FILE_SCT_CD, 
                                            @FILE_KND_NM, 
                                            @FILE_NM, 
                                            @FILE_PATH, 
                                            @CAR_REG_ID, 
                                            @REGR_ID, 
                                            @MODR_ID)`);

      });
  

          // 차량판매
    const query2 = `UPDATE dbo.CJB_CAR_PUR
                    SET 
                    REGR_ID = @REGR_ID
                    MODR_ID = @MODR_ID
                    WHERE CAR_REG_ID = @CAR_REG_ID;`;

    await Promise.all([request.query(query1), request.query(query2)]);

    } catch (err) {
      console.error("Error updating car sel info:", err);
      throw err;
    }
  };
  
  
// 판매매도 삭제
exports.deleteCarSel = async ({carRegId, flag_type}) => {
  try {
    const request = pool.request();
    request.input("CAR_REG_ID", sql.VarChar, carRegId);

    let query = "";

    if(flag_type == "1") {

      query = `DELETE CJB_CAR_SEL
                        WHERE CAR_REG_ID = @CAR_REG_ID
                        AND CAR_DEL_YN = 'N'
            `;  
    } else {
      query = `UPDATE CJB_CAR_SEL
                        SET CAR_DEL_YN = 'Y'
                          , CAR_DEL_DT = GETDATE()
                        WHERE CAR_REG_ID = @CAR_REG_ID;
            `;  
    }

    console.log("query:", query);

    await request.query(query);

  } catch (err) {
    console.error("Error deleting car sel:", err);
    throw err;
  }
};
