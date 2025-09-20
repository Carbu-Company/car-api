const sql = require("mssql");
const pool = require("../../config/db");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 매도 2.0
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// 매도비 목록 조회
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
                ${startDt ? "AND A.CAR_PUR_DT >= @START_DT" : ""}
                ${endDt ? "AND A.CAR_PUR_DT <= @END_DT" : ""}
                ${dtlCustomerName ? "AND B.OWNR_NM LIKE @DTL_CUSTOMER_NAME" : ""}
                ${dtlCustGubun ? "AND OWNR_TP_CD = @DTL_CUST_GUBUN" : ""}
                ${dtlEvdcGubun ? "AND PUR_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                ${dtlPrsnGubun ? "AND PRSN_SCT_CD = @DTL_PRSN_GUBUN" : ""}
                ${dtlOwnerBrno ? "AND OWNR_BRNO = @DTL_OWNER_BRNO" : ""}
                ${dtlOwnerSsn ? "AND OWNR_SSN = @DTL_OWNER_SSN" : ""}
                ${dtlCtshNo ? "AND CTSH_NO = @DTL_CTSH_NO" : ""}
                ${dtlCarNoBefore ? "AND PUR_BEF_CAR_NO = @DTL_CAR_NO_BEFORE" : ""}
      `;
    
      const dataQuery = `SELECT A.CAR_STAT_CD     -- 제시구분코드
                    , B.SALE_TP_CD      -- 판매유형코드 
                    , B.BUYER_NM        -- 매입자명 
                    , B.SALE_AMT        -- 매도 금액
                    , B.AGENT_SEL_COST  -- 상사 매도 비용
                    , B.PERF_INFE_AMT   -- 성능 보험료 금액
                    , B.CAR_SALE_DT     -- 차량 판매 일자 
                    , B.SALE_REG_DT     -- 매출 등록 일자
                FROM dbo.CJB_CAR_PUR A
                    , dbo.CJB_CAR_SEL B
                WHERE A.CAR_REG_ID = B.CAR_REG_ID
                  AND A.AGENT_ID = @CAR_AGENT
                  AND A.CAR_DEL_YN = 'N'
                  AND A.CAR_STAT_CD IN ('002', '003')     --- 일반판매, 알선판매매
                  ${carNo ? "AND A.CAR_NO LIKE @CAR_NO" : ""}
                  ${dealer ? "AND DLR_ID LIKE @DEALER" : ""}
                  ${startDt ? "AND CAR_PUR_DT >= @START_DT" : ""}
                  ${endDt ? "AND CAR_PUR_DT <= @END_DT" : ""}
                  ${dtlCustomerName ? "AND OWNR_NM LIKE @DTL_CUSTOMER_NAME" : ""}
                  ${dtlCustGubun ? "AND OWNR_TP_CD = @DTL_CUST_GUBUN" : ""}
                  ${dtlEvdcGubun ? "AND PUR_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                  ${dtlPrsnGubun ? "AND PRSN_SCT_CD = @DTL_PRSN_GUBUN" : ""}
                  ${dtlOwnerBrno ? "AND OWNR_BRNO = @DTL_OWNER_BRNO" : ""}
                  ${dtlOwnerSsn ? "AND OWNR_SSN = @DTL_OWNER_SSN" : ""}
                  ${dtlCtshNo ? "AND CTSH_NO = @DTL_CTSH_NO" : ""}
                  ${dtlCarNoBefore ? "AND PUR_BEF_CAR_NO = @DTL_CAR_NO_BEFORE" : ""}
                ORDER BY ${orderItem === '제시일' ? 'CAR_PUR_DT' : orderItem === '담당딜러' ? 'DLR_ID' : orderItem === '고객유형' ? 'OWNR_TP_CD' : orderItem} ${ordAscDesc}
                OFFSET (@PAGE - 1) * @PAGE_SIZE ROWS
                FETCH NEXT @PAGE_SIZE ROWS ONLY;`;
  
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
    orderItem = '제시일',
    ordAscDesc = 'desc'
  }) => {
    try {
      const request = pool.request();
  
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
  
      const query = `SELECT '상사' AS PRSN_SCT_CD
                          , COUNT(CAR_REG_ID) CNT
                          , ISNULL(SUM(PUR_AMT), 0) PUR_AMT
                          , ISNULL(SUM(PUR_SUP_PRC), 0) PUR_SUP_PRC
                          , ISNULL(SUM(PUR_VAT), 0) PUR_VAT
                          , ISNULL(SUM(CAR_LOAN_AMT), 0) CAR_LOAN_AMT
                          , ISNULL(SUM(AGENT_PUR_CST), 0) AGENT_PUR_CST
                        FROM CJB_CAR_PUR
                        WHERE AGENT_ID = @CAR_AGENT
                          AND CAR_STAT_CD = '001'
                          AND CAR_DEL_YN = 'N'
                          AND PRSN_SCT_CD = '0'  -- 상사
                          ${carNo ? "AND CAR_NO LIKE @CAR_NO" : ""}
                          ${dealer ? "AND DLR_ID LIKE @DEALER" : ""}
                          ${startDt ? "AND CAR_PUR_DT >= @START_DT" : ""}
                          ${endDt ? "AND CAR_PUR_DT <= @END_DT" : ""}
                          ${dtlCustomerName ? "AND OWNR_NM LIKE @DTL_CUSTOMER_NAME" : ""}
                          ${dtlCustGubun ? "AND OWNR_TP_CD = @DTL_CUST_GUBUN" : ""}
                          ${dtlEvdcGubun ? "AND PUR_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                          ${dtlPrsnGubun ? "AND PRSN_SCT_CD = @DTL_PRSN_GUBUN" : ""}
                          ${dtlOwnerBrno ? "AND OWNR_BRNO = @DTL_OWNER_BRNO" : ""}
                          ${dtlOwnerSsn ? "AND OWNR_SSN = @DTL_OWNER_SSN" : ""}
                          ${dtlCtshNo ? "AND CTSH_NO = @DTL_CTSH_NO" : ""}
                          ${dtlCarNoBefore ? "AND PUR_BEF_CAR_NO = @DTL_CAR_NO_BEFORE" : ""}
                      UNION ALL
                      SELECT '고객위탁' AS PRSN_SCT_CD
                          , COUNT(CAR_REG_ID) CNT
                          , ISNULL(SUM(PUR_AMT), 0) PUR_AMT
                          , ISNULL(SUM(PUR_SUP_PRC), 0) PUR_SUP_PRC
                          , ISNULL(SUM(PUR_VAT), 0) PUR_VAT
                          , ISNULL(SUM(CAR_LOAN_AMT), 0) CAR_LOAN_AMT
                          , ISNULL(SUM(AGENT_PUR_CST), 0) AGENT_PUR_CST
                        FROM CJB_CAR_PUR
                        WHERE AGENT_ID = @CAR_AGENT
                          AND CAR_STAT_CD = '001'
                          AND CAR_DEL_YN = 'N'
                          AND PRSN_SCT_CD = '1'  -- 고객위탁
                          ${carNo ? "AND CAR_NO LIKE @CAR_NO" : ""}
                          ${dealer ? "AND DLR_ID LIKE @DEALER" : ""}
                          ${startDt ? "AND CAR_PUR_DT >= @START_DT" : ""}
                          ${endDt ? "AND CAR_PUR_DT <= @END_DT" : ""}
                          ${dtlCustomerName ? "AND OWNR_NM LIKE @DTL_CUSTOMER_NAME" : ""}
                          ${dtlCustGubun ? "AND OWNR_TP_CD = @DTL_CUST_GUBUN" : ""}
                          ${dtlEvdcGubun ? "AND PUR_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                          ${dtlPrsnGubun ? "AND PRSN_SCT_CD = @DTL_PRSN_GUBUN" : ""}
                          ${dtlOwnerBrno ? "AND OWNR_BRNO = @DTL_OWNER_BRNO" : ""}
                          ${dtlOwnerSsn ? "AND OWNR_SSN = @DTL_OWNER_SSN" : ""}
                          ${dtlCtshNo ? "AND CTSH_NO = @DTL_CTSH_NO" : ""}
                          ${dtlCarNoBefore ? "AND PUR_BEF_CAR_NO = @DTL_CAR_NO_BEFORE" : ""}
                      UNION ALL
                      SELECT '합계' AS PRSN_SCT_CD
                          , COUNT(CAR_REG_ID) CNT
                          , ISNULL(SUM(PUR_AMT), 0) PUR_AMT
                          , ISNULL(SUM(PUR_SUP_PRC), 0) PUR_SUP_PRC
                          , ISNULL(SUM(PUR_VAT), 0) PUR_VAT
                          , ISNULL(SUM(CAR_LOAN_AMT), 0) CAR_LOAN_AMT
                          , ISNULL(SUM(AGENT_PUR_CST), 0) AGENT_PUR_CST
                        FROM CJB_CAR_PUR
                        WHERE AGENT_ID = @CAR_AGENT
                          AND CAR_STAT_CD = '001'
                          AND CAR_DEL_YN = 'N'
                          ${carNo ? "AND CAR_NO LIKE @CAR_NO" : ""}
                          ${dealer ? "AND DLR_ID LIKE @DEALER" : ""}
                          ${startDt ? "AND CAR_PUR_DT >= @START_DT" : ""}
                          ${endDt ? "AND CAR_PUR_DT <= @END_DT" : ""}
                          ${dtlCustomerName ? "AND OWNR_NM LIKE @DTL_CUSTOMER_NAME" : ""}
                          ${dtlCustGubun ? "AND OWNR_TP_CD = @DTL_CUST_GUBUN" : ""}
                          ${dtlEvdcGubun ? "AND PUR_EVDC_CD = @DTL_EVDC_GUBUN" : ""}
                          ${dtlPrsnGubun ? "AND PRSN_SCT_CD = @DTL_PRSN_GUBUN" : ""}
                          ${dtlOwnerBrno ? "AND OWNR_BRNO = @DTL_OWNER_BRNO" : ""}
                          ${dtlOwnerSsn ? "AND OWNR_SSN = @DTL_OWNER_SSN" : ""}
                          ${dtlCtshNo ? "AND CTSH_NO = @DTL_CTSH_NO" : ""}
                          ${dtlCarNoBefore ? "AND PUR_BEF_CAR_NO = @DTL_CAR_NO_BEFORE" : ""}
        `;
  
      const result = await request.query(query);
      return result.recordset;
    } catch (err) {
      console.error("Error fetching suggest sum:", err);
      throw err;
    }
  };
  
  
// 차량 판매 정보 수정
exports.updateCarSel = async ({ carRegId, carSaleDt, saleRegDt, agentId, dlrId, saleTpCd, buyerNm, buyerTpCd, buyerSsn, buyerBrno, buyerPhon, buyerZip, buyerAddr1, buyerAddr2, saleAmt, saleSupPrc, saleVat, agentSelCost, perfInfeAmt, txblIssuYn, selcstInclusYn, selEvdcCd, selEvdcCont, selEvdcDt, adjFinYn, selFile1, selFile2, selFile3, selFile4, selFile5, saleDesc, totFeeAmt, realFeeAmt, saleCrIssuYn, modrId }) => {
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
      request.input("AGENT_SEL_COST", sql.Decimal, agentSelCost);
      request.input("PERF_INFE_AMT", sql.Decimal, perfInfeAmt);
      request.input("TXBL_ISSU_YN", sql.VarChar, txblIssuYn);
      request.input("SELCST_INCLUS_YN", sql.VarChar, selcstInclusYn);
      request.input("SEL_EVDC_CD", sql.VarChar, selEvdcCd);
      request.input("SEL_EVDC_CONT", sql.VarChar, selEvdcCont);
      request.input("SEL_EVDC_DT", sql.VarChar, selEvdcDt);
      request.input("ADJ_FIN_YN", sql.VarChar, adjFinYn);
      request.input("SEL_FILE1", sql.VarChar, selFile1);
      request.input("SEL_FILE2", sql.VarChar, selFile2);
      request.input("SEL_FILE3", sql.VarChar, selFile3);
      request.input("SEL_FILE4", sql.VarChar, selFile4);
      request.input("SEL_FILE5", sql.VarChar, selFile5);
      request.input("SALE_DESC", sql.VarChar, saleDesc);
      request.input("TOT_FEE_AMT", sql.Decimal, totFeeAmt);
      request.input("REAL_FEE_AMT", sql.Decimal, realFeeAmt);
      request.input("SALE_CR_ISSU_YN", sql.VarChar, saleCrIssuYn);
      request.input("MODR_ID", sql.VarChar, modrId);
  
      const query = `UPDATE dbo.CJB_CAR_SEL
                        SET   CAR_SALE_DT = @carSaleDt,
                              SALE_REG_DT = @saleRegDt,
                              AGENT_ID = @agentId,
                              DLR_ID = @dlrId,
                              SALE_TP_CD = @saleTpCd,
                              BUYER_NM = @buyerNm,
                              BUYER_TP_CD = @buyerTpCd,
                              BUYER_SSN = @buyerSsn,
                              BUYER_BRNO = @buyerBrno,
                              BUYER_PHON = @buyerPhon,
                              BUYER_ZIP = @buyerZip,
                              BUYER_ADDR1 = @buyerAddr1,
                              BUYER_ADDR2 = @buyerAddr2,
                              SALE_AMT = @saleAmt,
                              SALE_SUP_PRC = @saleSupPrc,
                              SALE_VAT = @saleVat,
                              AGENT_SEL_COST = @agentSelCost,
                              PERF_INFE_AMT = @perfInfeAmt,
                              TXBL_ISSU_YN = @txblIssuYn,
                              SELCST_INCLUS_YN = @selcstInclusYn,
                              SEL_EVDC_CD = @selEvdcCd,
                              SEL_EVDC_CONT = @selEvdcCont,
                              SEL_EVDC_DT = @selEvdcDt,
                              ADJ_FIN_YN = @adjFinYn,
                              TOT_FEE_AMT = @totFeeAmt,
                              REAL_FEE_AMT = @realFeeAmt,
                              SALE_CR_ISSU_YN = @saleCrIssuYn,
                              MOD_DTIME = GETDATE(),
                              MODR_ID = @modrId
                        WHERE  CAR_REG_ID = @CAR_REG_ID;`;
  
      await request.query(query);     
  
    } catch (err) {
      console.error("Error updating car sel info:", err);
      throw err;
    }
  };
  
  
// 판매매도 삭제
exports.deleteCarSel = async ({car_regid, flag_type}) => {
  try {
    const request = pool.request();
    request.input("CAR_REGID", sql.VarChar, car_regid);

    let query = "";

    if(flag_type == "1") {

      query = `DELETE CJB_CAR_SEL
                        WHERE CAR_REG_ID = @CAR_REGID
                        AND CAR_DEL_YN = 'N'
            `;  
    } else {
      query = `UPDATE CJB_CAR_SEL
                        SET CAR_DEL_YN = 'Y'
                          , CAR_DEL_DT = GETDATE()
                        WHERE CAR_REG_ID = @CAR_REGID;
            `;  
    }

    console.log("query:", query);

    await request.query(query);

  } catch (err) {
    console.error("Error deleting car sel:", err);
    throw err;
  }
};
