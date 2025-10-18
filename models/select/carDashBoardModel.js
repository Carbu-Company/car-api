const sql = require("mssql");
const pool = require("../../config/db");


// 매입 매출 상품화비 조회
exports.getTaxCashNoList = async ({ agentId }) => {
    try {
      const request = pool.request();
      request.input("AGENT_ID", sql.VarChar, agentId);
  
      const query = `SELECT A.CMRC_COST_SEQ  -- 상품화비 순번
                          , A.EXPD_METH_CD, B.CD_NM -- 결제 구분
                          , A.EXPD_EVDC_CD, C.CD_NM -- 영수 증빙
                          , E.USR_NM  -- 딜러명
                          , A.EXPD_AMT   -- 상품화비 금액
                          , D.PUR_AMT  -- 통지 금액
                          , D.OWNR_NM  -- 고객명
                        FROM dbo.CJB_CMRC_COST A
                          , dbo.CJB_COMM_CD B
                          , dbo.CJB_COMM_CD C
                          , dbo.CJB_CAR_PUR D
                          , dbo.CJB_USR E
                      WHERE A.EXPD_METH_CD = B.CD
                        AND B.GRP_CD = '06'   -- 결제 구분
                        AND A.EXPD_EVDC_CD = C.CD
                        AND C.GRP_CD = '07'   -- 영수 증빙
                        AND A.CAR_REG_ID = D.CAR_REG_ID
                        AND D.DLR_ID = E.USR_ID
                        AND A.EXPD_EVDC_CD IN ('001', '004')
                        and A.TAX_SCT_CD = '9'  -- 관세 대상 (세금계산서 아니면 9)
                        and A.TXBL_ISSU_DT IS NULL
                      AND D.AGENT_ID = @AGENT_ID;`; 
  
      const result = await request.query(query);
      return result.recordset; 
    } catch (err) {
      console.error("Error fetching tax cash no list:", err);
      throw err;
    }
  };
  
  // 재고금융 상태 조회
  exports.getInventoryFinanceStatus = async ({ agentId }) => {
    try {
      const request = pool.request();
      request.input("AGENT_ID", sql.VarChar, agentId);
  
      const query = `SELECT A.LOAN_CORP_NM
                          , A.TOT_LMT_AMT
                          , A.TOT_LOAN_AMT
                          , FORMAT((TOT_LOAN_AMT/TOT_LMT_AMT) * 100, 'N1') + '%' AS RT
                      FROM dbo.CJB_AGENT_LOAN_CORP A
                      WHERE A.AGENT_ID = @AGENT_ID
                      ;`; 
  
      const result = await request.query(query);
      return result.recordset; 
    } catch (err) {
      console.error("Error fetching tax cash no list:", err);
      throw err;
    }
  };
  
  
  // 차량 대출 정보 조회
  exports.getCarLoanInfo = async ({ carRegId }) => {
    try {
      const request = pool.request();
  
      request.input("CAR_REGID", sql.VarChar, carRegId);
  
      const query = `SELECT A.LOAN_AMT
                          , A.LOAN_CORP_INTR_RT 
                          , A.LOAN_DT
                          , A.TOT_PAY_INTR_AMT
                      FROM dbo.CJB_CAR_LOAN A
                      WHERE  A.CAR_REG_ID = @CAR_REGID
                      ;`; 
  
      const result = await request.query(query);
      return result.recordset; 
    } catch (err) {
      console.error("Error fetching tax cash no list:", err);
      throw err;
    }
  };
  
  // 매입 매출 요약 조회
  exports.getSalesPurchaseSummary = async ({ agentId }) => {
    try {
      const request = pool.request();
      request.input("AGENT_ID", sql.VarChar, agentId);
  
      const query = `SELECT '매입' AS GUBUN 
                          , COUNT(*) CNT
                          , SUM(PUR_SUP_AMT) SUP_AMT
                          , SUM(PUR_VAT) VAT
                          , SUM(PUR_AMT) AMT
                          , SUM(CAR_LOAN_AMT) CAR_LOAN_AMT
                          , SUM(TOT_CMRC_COST_FEE) TOT_CMRC_COST_FEE
                          , SUM(GAIN_TAX)  GAIN_TAX
                          , SUM(TOT_PAY_FEE)  TOT_PAY_FEE
                        FROM dbo.CJB_CAR_PUR A
                      WHERE AGENT_ID = @AGENT_ID
                      UNION ALL
                      SELECT '매출' AS GUBUN 
                          , COUNT(*) CNT
                          , SUM(SALE_SUP_PRC) SUP_AMT
                          , SUM(SALE_VAT) VAT
                          , SUM(SALE_AMT) AMT
                          , SUM(A.CAR_LOAN_AMT) CAR_LOAN_AMT
                          , SUM(A.TOT_CMRC_COST_FEE) TOT_CMRC_COST_FEE
                          , SUM(A.GAIN_TAX)  GAIN_TAX
                          , SUM(A.TOT_PAY_FEE)  TOT_PAY_FEE
                        FROM dbo.CJB_CAR_PUR A
                          , dbo.CJB_CAR_SEL B
                      WHERE A.AGENT_ID = @AGENT_ID
                        AND A.CAR_REG_ID = B.CAR_REG_ID
                      ;`; 
  
      const result = await request.query(query);
      return result.recordset; 
    } catch (err) {
      console.error("Error fetching tax cash no list:", err);
      throw err;
    }
  };
  
  
  // 문의 조회
  exports.getInquiryStatus = async ({ agentId }) => {
    try {
      const request = pool.request();
      request.input("AGENT_ID", sql.VarChar, agentId);
  
      const query = `SELECT BBC_NO, BBC_TIT, CONVERT(CHAR(10), REG_DTIME, 23) AS REG_DT
                       FROM dbo.CJB_INQ_BB
                      WHERE AGENT_ID = @AGENT_ID
                        AND DEL_YN = 'N';`; 
  
      const result = await request.query(query);
      return result.recordset; 
    } catch (err) {
      console.error("Error fetching tax cash no list:", err);
      throw err;
    }
  };
  
  // 공지 조회
  exports.getNoticeStatus = async ({ agentId }) => {
    try {
      const request = pool.request();
      request.input("AGENT_ID", sql.VarChar, agentId);
  
      const query = `SELECT ALL_YN, 
                            CASE WHEN ALL_YN = 'Y' THEN '전체' ELSE '개별' END GUBUN,
                            NTC_NO, NTC_TIT, 
                            CONVERT(CHAR(10), REG_DTIME, 23) REG_DT
                       FROM dbo.CJB_NTC
                      WHERE AGENT_ID = @AGENT_ID
                        AND DEL_YN = 'N';`; 
  
      const result = await request.query(query);
      return result.recordset; 
    } catch (err) {
      console.error("Error fetching tax cash no list:", err);
      throw err;
    }
  };
  