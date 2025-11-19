const sql = require("mssql");
const pool = require("../../config/db");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 상품화비 2.0
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 상품화비용 리스트 조회
exports.getGoodsFeeList = async ({   agentId, 
    page,
    pageSize,
    carNo,
    dealer,
    dtGubun,
    startDt,
    endDt, 
    dtlOldCarNo,
    dtlNewCarNo,
    dtlExpdItem,
    dtlTaxGubun,
    dtlExpdGubun,
    dtlExpdEvdc,
    dtlRmrk,
    dtlAdjInclusYN,
    orderItem = '제시일',
    ordAscDesc = 'desc' }) => {
    try {
      const request = pool.request();


      /*
      */
      console.log("dtGubun:", dtGubun);



      request.input("AGENT_ID", sql.VarChar, agentId);
      request.input("PAGE", sql.Int, page);
      request.input("PAGESIZE", sql.Int, pageSize);
  
      if (carNo) request.input("CAR_NO", sql.VarChar, `%${carNo}%`);
      if (dealer) request.input("DEALER", sql.VarChar, `%${dealer}%`);  
      if (dtGubun) request.input("DT_GUBUN", sql.VarChar, dtGubun);
      if (startDt) request.input("START_DT", sql.VarChar, startDt);
      if (endDt) request.input("END_DT", sql.VarChar, endDt);
      if (dtlOldCarNo) request.input("PUR_BEF_CAR_NO", sql.VarChar, `%${dtlOldCarNo}%`);
      if (dtlNewCarNo) request.input("SEL_CAR_NO", sql.VarChar, `%${dtlNewCarNo}%`);
      if (dtlExpdItem) request.input("EXPD_ITEM_CD", sql.VarChar, dtlExpdItem);
      if (dtlTaxGubun) request.input("TAX_SCT_CD", sql.VarChar, dtlTaxGubun);
      if (dtlExpdGubun) request.input("EXPD_SCT_CD", sql.VarChar, dtlExpdGubun);
      if (dtlExpdEvdc) request.input("EXPD_EVDC_CD", sql.VarChar, dtlExpdEvdc);
      if (dtlRmrk) request.input("RMRK", sql.VarChar, `%${dtlRmrk}%`);
      if (dtlAdjInclusYN) request.input("ADJ_INCLUS_YN", sql.VarChar, dtlAdjInclusYN);
  
      // 전체 카운트 조회
      const countQuery = `SELECT COUNT(*) as totalCount
                            FROM dbo.CJB_CAR_PUR A, dbo.CJB_GOODS_FEE B
                            WHERE A.CAR_REG_ID = B.CAR_REG_ID
                                AND A.AGENT_ID = @AGENT_ID
                                AND A.CAR_DEL_YN = 'N'
                                AND B.DEL_YN = 'N'
                ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO OR A.PUR_BEF_CAR_NO LIKE @CAR_NO OR A.SEL_CAR_NO LIKE @CAR_NO)" : ""}
                ${dealer ? "AND (A.DLR_ID LIKE @DEALER)" : ""}
                ${startDt ? `AND ${dtGubun === '01' ? 'A.CAR_PUR_DT' : dtGubun === '02' ? 'CONVERT(CHAR(10), B.REG_DTIME, 23)' : 'A.CAR_SEL_DT'} >= @START_DT` : ""}
                ${endDt ? `AND ${dtGubun === '01' ? 'A.CAR_PUR_DT' : dtGubun === '02' ? 'CONVERT(CHAR(10), B.REG_DTIME, 23)' : 'A.CAR_SEL_DT'} <= @END_DT` : ""}
                ${dtlOldCarNo ? "AND A.PUR_BEF_CAR_NO LIKE @PUR_BEF_CAR_NO" : ""}
                ${dtlNewCarNo ? "AND A.SEL_CAR_NO LIKE @SEL_CAR_NO" : ""}
                ${dtlExpdItem ? "AND B.EXPD_ITEM_CD = @EXPD_ITEM_CD" : ""}
                ${dtlTaxGubun ? "AND B.TAX_SCT_CD = @TAX_SCT_CD" : ""}
                ${dtlExpdGubun ? "AND B.EXPD_SCT_CD = @EXPD_SCT_CD" : ""}
                ${dtlExpdEvdc ? "AND B.EXPD_EVDC_CD = @EXPD_EVDC_CD" : ""}
                ${dtlRmrk ? "AND B.RMRK = @RMRK" : ""}
                ${dtlAdjInclusYN ? "AND B.ADJ_INCLUS_YN = @ADJ_INCLUS_YN" : ""}
      `;
  
      const dataQuery = `SELECT B.GOODS_FEE_SEQ,           
                                A.DLR_ID DLR_ID,     
                                (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = A.DLR_ID) AS DLR_NM,    -- 딜러 명
                                A.CAR_REG_ID,
                                A.CAR_NO,         -- 차량번호
                                A.CAR_NM,         -- 차량명
                                A.CAR_PUR_DT,     -- 차량구매일
                                A.PUR_AMT,        -- 차량구매금액
                                B.EXPD_ITEM_CD,
                                B.EXPD_ITEM_NM,   -- 비용항목
                                B.EXPD_SCT_CD,
                                CASE WHEN B.EXPD_SCT_CD = '0' THEN '딜러' 
                                      ELSE '상사' END AS EXPD_SCT_NM,     -- 치출구분
                                B.TAX_SCT_CD,
                                CASE WHEN B.TAX_SCT_CD =  '0' THEN '과세' 
                                      ELSE '비과세' END AS TAX_SCT_NM,        -- 과세구분
                                B.EXPD_SUP_PRC,       -- 공급가
                                B.EXPD_VAT,           -- 부가세
                                B.EXPD_AMT,           -- 금액    
                                B.EXPD_DT,            -- 결제일
                                B.EXPD_EVDC_CD,
                                dbo.CJB_FN_GET_CD_NM('07', B.EXPD_EVDC_CD) AS EXPD_EVDC_NM,    -- 지출증빙
                                B.RMRK,            -- 비고
                                B.ADJ_INCLUS_YN,   -- 정산 포함 여부 
                                B.EXPD_METH_CD,
                                dbo.CJB_FN_GET_CD_NM('06', B.EXPD_METH_CD) AS EXPD_METH_NM,
                                B.TXBL_ISSU_DT,
                                B.CASH_RECPT_RCGN_NO,
                                B.CASH_MGMTKEY,
                                CONVERT(CHAR(10), B.REG_DTIME, 23) REG_DTIME,
                                B.REGR_ID,
                                CONVERT(CHAR(10), B.MOD_DTIME, 23) MOD_DTIME,
                                B.MODR_ID
                      FROM dbo.CJB_CAR_PUR A, dbo.CJB_GOODS_FEE B
                      WHERE A.CAR_REG_ID = B.CAR_REG_ID
                          AND A.AGENT_ID = @AGENT_ID
                          AND A.CAR_DEL_YN = 'N'
                          AND B.DEL_YN = 'N'
                ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO OR A.PUR_BEF_CAR_NO LIKE @CAR_NO OR A.SEL_CAR_NO LIKE @CAR_NO)" : ""}
                ${dealer ? "AND (A.DLR_ID LIKE @DEALER)" : ""}
                ${startDt ? `AND ${dtGubun === '01' ? 'A.CAR_PUR_DT' : dtGubun === '02' ? 'CONVERT(CHAR(10), B.REG_DTIME, 23)' : 'A.CAR_SEL_DT'} >= @START_DT` : ""}
                ${endDt ? `AND ${dtGubun === '01' ? 'A.CAR_PUR_DT' : dtGubun === '02' ? 'CONVERT(CHAR(10), B.REG_DTIME, 23)' : 'A.CAR_SEL_DT'} <= @END_DT` : ""}
                ${dtlOldCarNo ? "AND A.PUR_BEF_CAR_NO LIKE @PUR_BEF_CAR_NO" : ""}
                ${dtlNewCarNo ? "AND A.SEL_CAR_NO LIKE @SEL_CAR_NO" : ""}
                ${dtlExpdItem ? "AND B.EXPD_ITEM_CD = @EXPD_ITEM_CD" : ""}
                ${dtlTaxGubun ? "AND B.TAX_SCT_CD = @TAX_SCT_CD" : ""}
                ${dtlExpdGubun ? "AND B.EXPD_SCT_CD = @EXPD_SCT_CD" : ""}
                ${dtlExpdEvdc ? "AND B.EXPD_EVDC_CD = @EXPD_EVDC_CD" : ""}
                ${dtlRmrk ? "AND B.RMRK = @RMRK" : ""}
                ${dtlAdjInclusYN ? "AND B.ADJ_INCLUS_YN = @ADJ_INCLUS_YN" : ""}
                      ORDER BY ${orderItem === '제시일' ? 'CAR_PUR_DT' : orderItem === '담당딜러' ? 'DLR_ID' : orderItem === '고객유형' ? 'OWNR_TP_CD' : orderItem} ${ordAscDesc}
                      OFFSET (@PAGE - 1) * @PAGESIZE ROWS
                      FETCH NEXT @PAGESIZE ROWS ONLY
                      `;
  
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
      console.error("Error fetching goods fee list:", err);
      throw err;
    }
  }
  
  
  // 차량별 리스트 조회
  exports.getGoodsFeeCarSumList = async ({ 
    agentId,
    page,
    pageSize,
    carNo,
    dealer,
    dtGubun,
    startDt,
    endDt, 
    dtlOldCarNo,
    dtlNewCarNo,
    dtlExpdItem,
    dtlTaxGubun,
    dtlExpdGubun,
    dtlExpdEvdc,
    dtlRmrk,
    dtlAdjInclusYN,
    orderItem = '제시일',
    ordAscDesc = 'desc'
    }) => {
    try {
      const request = pool.request();

      /*
      */
      console.log("dtGubun:", dtGubun);


      request.input("AGENT_ID", sql.VarChar, agentId);
      request.input("PAGE", sql.Int, page);
      request.input("PAGESIZE", sql.Int, pageSize);
  
      if (carNo) request.input("CAR_NO", sql.VarChar, `%${carNo}%`);
      if (dealer) request.input("DEALER", sql.VarChar, `%${dealer}%`);  
      if (dtGubun) request.input("DT_GUBUN", sql.VarChar, dtGubun);
      if (startDt) request.input("START_DT", sql.VarChar, startDt);
      if (endDt) request.input("END_DT", sql.VarChar, endDt);
      if (dtlOldCarNo) request.input("PUR_BEF_CAR_NO", sql.VarChar, `%${dtlOldCarNo}%`);
      if (dtlNewCarNo) request.input("SEL_CAR_NO", sql.VarChar, `%${dtlNewCarNo}%`);
      if (dtlExpdItem) request.input("EXPD_ITEM_CD", sql.VarChar, dtlExpdItem);
      if (dtlTaxGubun) request.input("TAX_SCT_CD", sql.VarChar, dtlTaxGubun);
      if (dtlExpdGubun) request.input("EXPD_SCT_CD", sql.VarChar, dtlExpdGubun);
      if (dtlExpdEvdc) request.input("EXPD_EVDC_CD", sql.VarChar, dtlExpdEvdc);
      if (dtlRmrk) request.input("RMRK", sql.VarChar, `%${dtlRmrk}%`);
      if (dtlAdjInclusYN) request.input("ADJ_INCLUS_YN", sql.VarChar, dtlAdjInclusYN);
  
      // 전체 카운트 조회
      const countQuery = `
                        SELECT COUNT(A.CAR_REG_ID) OVER() AS totalCount
                        FROM dbo.CJB_CAR_PUR A, dbo.CJB_GOODS_FEE B
                        WHERE A.CAR_REG_ID = B.CAR_REG_ID
                            AND A.AGENT_ID = @AGENT_ID
                            AND A.CAR_DEL_YN = 'N'
                            AND B.DEL_YN = 'N'
                ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO OR A.PUR_BEF_CAR_NO LIKE @CAR_NO OR A.SEL_CAR_NO LIKE @CAR_NO)" : ""}
                ${dealer ? "AND (A.DLR_ID LIKE @DEALER)" : ""}
                ${startDt ? `AND ${dtGubun === '01' ? 'A.CAR_PUR_DT' : dtGubun === '02' ? 'CONVERT(CHAR(10), B.REG_DTIME, 23)' : 'A.CAR_SEL_DT'} >= @START_DT` : ""}
                ${endDt ? `AND ${dtGubun === '01' ? 'A.CAR_PUR_DT' : dtGubun === '02' ? 'CONVERT(CHAR(10), B.REG_DTIME, 23)' : 'A.CAR_SEL_DT'} <= @END_DT` : ""}
                ${dtlOldCarNo ? "AND A.PUR_BEF_CAR_NO LIKE @PUR_BEF_CAR_NO" : ""}
                ${dtlNewCarNo ? "AND A.SEL_CAR_NO LIKE @SEL_CAR_NO" : ""}
                ${dtlExpdItem ? "AND B.EXPD_ITEM_CD = @EXPD_ITEM_CD" : ""}
                ${dtlTaxGubun ? "AND B.TAX_SCT_CD = @TAX_SCT_CD" : ""}
                ${dtlExpdGubun ? "AND B.EXPD_SCT_CD = @EXPD_SCT_CD" : ""}
                ${dtlExpdEvdc ? "AND B.EXPD_EVDC_CD = @EXPD_EVDC_CD" : ""}
                ${dtlRmrk ? "AND B.RMRK = @RMRK" : ""}
                ${dtlAdjInclusYN ? "AND B.ADJ_INCLUS_YN = @ADJ_INCLUS_YN" : ""}
                                      GROUP BY A.CAR_REG_ID
                                      ;`;
  
      const query = `SELECT 
                        A.CAR_REG_ID, 
                        MIN(A.CAR_NO) AS CAR_NO,
                        MIN(A.DLR_ID) AS DLR_ID,
                        MIN(A.CAR_NM) AS CAR_NM,
                        MIN(A.CAR_PUR_DT) AS CAR_PUR_DT,
                        MIN(A.PUR_AMT) AS PUR_AMT,
                        COUNT(B.CAR_REG_ID) AS CNT,
                        SUM(B.EXPD_AMT) AS EXPD_AMT,
                        SUM(B.EXPD_SUP_PRC) AS EXPD_SUP_PRC,
                        SUM(B.EXPD_VAT) AS EXPD_VAT,
                        MIN(A.CAR_STAT_CD) AS CAR_STAT_CD,
                        dbo.CJB_FN_GET_CD_NM('01', MIN(A.CAR_STAT_CD)) AS CAR_STAT_NM,
                        MIN(A.CAR_SEL_DT) AS CAR_SEL_DT,
                        (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = MIN(A.DLR_ID)) AS DLR_NM
                    FROM dbo.CJB_CAR_PUR A
                    INNER JOIN dbo.CJB_GOODS_FEE B ON A.CAR_REG_ID = B.CAR_REG_ID
                    WHERE A.AGENT_ID = @AGENT_ID
                        AND A.CAR_DEL_YN = 'N'
                        AND B.DEL_YN = 'N'
                        ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO OR A.PUR_BEF_CAR_NO LIKE @CAR_NO OR A.SEL_CAR_NO LIKE @CAR_NO)" : ""}
                        ${dealer ? "AND (A.DLR_ID LIKE @DEALER)" : ""}
                        ${startDt ? `AND ${dtGubun === '01' ? 'A.CAR_PUR_DT' : dtGubun === '02' ? 'CONVERT(CHAR(10), B.REG_DTIME, 23)' : 'A.CAR_SEL_DT'} >= @START_DT` : ""}
                        ${endDt ? `AND ${dtGubun === '01' ? 'A.CAR_PUR_DT' : dtGubun === '02' ? 'CONVERT(CHAR(10), B.REG_DTIME, 23)' : 'A.CAR_SEL_DT'} <= @END_DT` : ""}
                        ${dtlOldCarNo ? "AND A.PUR_BEF_CAR_NO LIKE @PUR_BEF_CAR_NO" : ""}
                        ${dtlNewCarNo ? "AND A.SEL_CAR_NO LIKE @SEL_CAR_NO" : ""}
                        ${dtlExpdItem ? "AND B.EXPD_ITEM_CD = @EXPD_ITEM_CD" : ""}
                        ${dtlTaxGubun ? "AND B.TAX_SCT_CD = @TAX_SCT_CD" : ""}
                        ${dtlExpdGubun ? "AND B.EXPD_SCT_CD = @EXPD_SCT_CD" : ""}
                        ${dtlExpdEvdc ? "AND B.EXPD_EVDC_CD = @EXPD_EVDC_CD" : ""}
                        ${dtlRmrk ? "AND B.RMRK = @RMRK" : ""}
                        ${dtlAdjInclusYN ? "AND B.ADJ_INCLUS_YN = @ADJ_INCLUS_YN" : ""}
                    GROUP BY A.CAR_REG_ID
                    ORDER BY ${
                        orderItem === '제시일' ? 'MIN(A.CAR_PUR_DT)' 
                        : orderItem === '담당딜러' ? 'MIN(A.DLR_ID)' 
                        : orderItem === '고객유형' ? 'MIN(A.OWNR_TP_CD)' 
                        : `MIN(A.${orderItem})`
                    } ${ordAscDesc}
                    OFFSET (@PAGE - 1) * @PAGESIZE ROWS
                    FETCH NEXT @PAGESIZE ROWS ONLY
                    ;`;


                    
      const [countResult, dataResult] = await Promise.all([
        request.query(countQuery),
        request.query(query)
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
      console.error("Error fetching goods fee car sum list:", err);
      throw err;
    }
  };
  
  
  // 차량에 대한 상품화비 정보 조회
  exports.getCarGoodsInfo = async ({ carRegId }) => {
    try {
      const request = pool.request();
      request.input("CAR_REG_ID", sql.VarChar, carRegId); 
  
      const query = `SELECT B.GOODS_FEE_SEQ,           
                                A.DLR_ID DLR_ID,     
                                (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = A.DLR_ID) AS DLR_NM,    -- 딜러 명
                                A.CAR_REG_ID,
                                A.CAR_NO,         -- 차량번호
                                A.CAR_NM,         -- 차량명
                                B.EXPD_ITEM_CD,
                                B.EXPD_ITEM_NM,   -- 비용항목
                                B.EXPD_SCT_CD,
                                CASE WHEN B.EXPD_SCT_CD = '0' THEN '딜러' 
                                      ELSE '상사' END AS EXPD_SCT_NM,     -- 치출구분
                                B.TAX_SCT_CD,
                                CASE WHEN B.TAX_SCT_CD =  '0' THEN '과세' 
                                      ELSE '비과세' END AS TAX_SCT_NM,        -- 과세구분
                                B.EXPD_SUP_PRC,       -- 공급가
                                B.EXPD_VAT,           -- 부가세
                                B.EXPD_AMT,           -- 금액    
                                B.EXPD_DT,            -- 결제일
                                B.EXPD_EVDC_CD,       -- 지출증빙 코드드
                                dbo.CJB_FN_GET_CD_NM('07', B.EXPD_EVDC_CD) AS EXPD_EVDC_NM,    -- 지출증빙 명
                                B.RMRK,            -- 비고
                                B.ADJ_INCLUS_YN,   -- 정산 포함 여부 
                                B.EXPD_METH_CD,     -- 지출 방식 코드
                                dbo.CJB_FN_GET_CD_NM('06', B.EXPD_METH_CD) AS EXPD_METH_NM,    -- 지출 방식 명
                                B.TXBL_ISSU_DT,
                                B.CASH_RECPT_RCGN_NO,
                                B.CASH_MGMTKEY,
                                B.REG_DTIME,
                                B.REGR_ID,
                                B.MOD_DTIME,
                                B.MODR_ID
                      FROM dbo.CJB_CAR_PUR A, dbo.CJB_GOODS_FEE B
                      WHERE A.CAR_REG_ID = B.CAR_REG_ID
                          AND A.CAR_REG_ID = @CAR_REG_ID
                          AND B.DEL_YN = 'N'
                      ORDER BY B.EXPD_ITEM_CD ASC
                      ;`;
  
      const result = await request.query(query);
      return result.recordset;
    } catch (err) {
      console.error("Error fetching goods fee detail:", err);
      throw err;
    }
  };
  
  
  // 상품화비 한건에 대한 상세 조회
  exports.getGoodsFeeDetail = async ({ goodsFeeSeq }) => {
    try {
      const request = pool.request();  
  
      request.input("GOODS_FEE_SEQ", sql.Int, goodsFeeSeq); 
  
      const query = `SELECT B.GOODS_FEE_SEQ,           
                                A.DLR_ID DLR_ID,     
                                (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = A.DLR_ID) AS DLR_NM,    -- 딜러 명
                                A.CAR_REG_ID,
                                A.CAR_NO,         -- 차량번호
                                A.CAR_NM,         -- 차량명
                                B.EXPD_ITEM_CD,
                                B.EXPD_ITEM_NM,   -- 비용항목
                                B.EXPD_SCT_CD,
                                CASE WHEN B.EXPD_SCT_CD = '0' THEN '딜러' 
                                      ELSE '상사' END AS EXPD_SCT_NM,     -- 치출구분
                                B.TAX_SCT_CD,
                                CASE WHEN B.TAX_SCT_CD =  '0' THEN '과세' 
                                      ELSE '비과세' END AS TAX_SCT_NM,        -- 과세구분
                                B.EXPD_SUP_PRC,       -- 공급가
                                B.EXPD_VAT,           -- 부가세
                                B.EXPD_AMT,           -- 금액    
                                B.EXPD_DT,            -- 결제일
                                B.EXPD_EVDC_CD,
                                dbo.CJB_FN_GET_CD_NM('07', B.EXPD_EVDC_CD) AS EXPD_EVDC_NM,    -- 지출증빙
                                B.RMRK,            -- 비고
                                B.ADJ_INCLUS_YN,   -- 정산 포함 여부 
                                B.EXPD_METH_CD,
                                dbo.CJB_FN_GET_CD_NM('06', B.EXPD_METH_CD) AS EXPD_METH_NM,
                                B.TXBL_ISSU_DT,
                                B.CASH_RECPT_RCGN_NO,
                                B.CASH_MGMTKEY,
                                B.REG_DTIME,
                                B.REGR_ID,
                                B.MOD_DTIME,
                                B.MODR_ID
                      FROM dbo.CJB_CAR_PUR A, dbo.CJB_GOODS_FEE B
                      WHERE A.CAR_REG_ID = B.CAR_REG_ID
                          AND B.GOODS_FEE_SEQ = @GOODS_FEE_SEQ
                          AND B.DEL_YN = 'N'
                       ;`;
  
      const result = await request.query(query);
      return result.recordset[0];  
    } catch (err) {
      console.error("Error fetching goods fee detail:", err);
      throw err;
    }
  };
  
  // 차량별 리스트 조회
  exports.getGoodsFeeCarSummary= async ({ 
    agentId,
    page,
    pageSize,
    carNo,
    dealer,
    dtGubun,
    startDt,
    endDt, 
    dtlOldCarNo,
    dtlNewCarNo,
    dtlExpdItem,
    dtlTaxGubun,
    dtlExpdGubun,
    dtlExpdEvdc,
    dtlRmrk,
    dtlAdjInclusYN,
    orderItem = '제시일',
    ordAscDesc = 'desc'
    }) => {
    try {
      const request = pool.request();
      request.input("AGENT_ID", sql.VarChar, agentId);
      request.input("PAGE", sql.Int, page);
      request.input("PAGESIZE", sql.Int, pageSize);
  
      if (carNo) request.input("CAR_NO", sql.VarChar, carNo);
      if (dealer) request.input("DEALER", sql.VarChar, dealer);
      if (startDt) request.input("START_DT", sql.VarChar, startDt);
      if (endDt) request.input("END_DT", sql.VarChar, endDt);
      if (dtlOldCarNo) request.input("PUR_BEF_CAR_NO", sql.VarChar, dtlOldCarNo);
      if (dtlNewCarNo) request.input("CAR_NO", sql.VarChar, dtlNewCarNo);
      if (dtlExpdItem) request.input("EXPD_ITEM_CD", sql.VarChar, dtlExpdItem);
      if (dtlTaxGubun) request.input("TAX_SCT_CD", sql.VarChar, dtlTaxGubun);
      if (dtlExpdGubun) request.input("EXPD_SCT_CD", sql.VarChar, dtlExpdGubun);
      if (dtlExpdEvdc) request.input("EXPD_EVDC_CD", sql.VarChar, dtlExpdEvdc);
      if (dtlRmrk) request.input("RMRK", sql.VarChar, dtlRmrk);
      if (dtlAdjInclusYN) request.input("ADJ_INCLUS_YN", sql.VarChar, dtlAdjInclusYN);
  
      // 전체 카운트 조회
      const query = `
                        SELECT '과세' AS TAX_SCT_NM
                              , COUNT(GOODS_FEE_SEQ) CNT
                              , ISNULL(SUM(B.EXPD_AMT), 0) AS EXPD_AMT
                              , ISNULL(SUM(B.EXPD_SUP_PRC), 0) AS EXPD_SUP_PRC
                              , ISNULL(SUM(B.EXPD_VAT), 0) AS EXPD_VAT
                           FROM dbo.CJB_CAR_PUR A
                              , dbo.CJB_GOODS_FEE B
                          WHERE 1 = 1
                            AND A.CAR_DEL_YN = 'N'
                            AND B.DEL_YN = 'N'
                            AND A.AGENT_ID = @AGENT_ID
                            AND A.CAR_REG_ID = B.CAR_REG_ID
                            AND B.TAX_SCT_CD = '01'
                ${carNo ? "AND CAR_NO LIKE @CAR_NO" : ""}
                ${dealer ? "AND DLR_ID LIKE @DEALER" : ""}
                ${startDt ? "AND CAR_PUR_DT >= @START_DT" : ""}
                ${endDt ? "AND CAR_PUR_DT <= @END_DT" : ""}
                ${dtlOldCarNo ? "AND PUR_BEF_CAR_NO = @PUR_BEF_CAR_NO" : ""}
                ${dtlNewCarNo ? "AND CAR_NO = @CAR_NO" : ""}
                ${dtlExpdItem ? "AND EXPD_ITEM_CD = @EXPD_ITEM_CD" : ""}
                ${dtlTaxGubun ? "AND TAX_SCT_CD = @TAX_SCT_CD" : ""}
                ${dtlExpdGubun ? "AND EXPD_SCT_CD = @EXPD_SCT_CD" : ""}
                ${dtlExpdEvdc ? "AND EXPD_EVDC_CD = @EXPD_EVDC_CD" : ""}
                ${dtlRmrk ? "AND RMRK = @RMRK" : ""}
                ${dtlAdjInclusYN ? "AND ADJ_INCLUS_YN = @ADJ_INCLUS_YN" : ""}
                UNION ALL
                        SELECT '비과세' AS TAX_SCT_NM
                              , COUNT(GOODS_FEE_SEQ) CNT
                              , ISNULL(SUM(B.EXPD_AMT), 0) AS EXPD_AMT
                              , ISNULL(SUM(B.EXPD_SUP_PRC), 0) AS EXPD_SUP_PRC
                              , ISNULL(SUM(B.EXPD_VAT), 0) AS EXPD_VAT
                           FROM dbo.CJB_CAR_PUR A
                              , dbo.CJB_GOODS_FEE B
                          WHERE 1 = 1
                            AND A.CAR_DEL_YN = 'N'
                            AND B.DEL_YN = 'N'
                            AND A.AGENT_ID = @AGENT_ID
                            AND A.CAR_REG_ID = B.CAR_REG_ID
                            AND B.TAX_SCT_CD = '02'
                ${carNo ? "AND CAR_NO LIKE @CAR_NO" : ""}
                ${dealer ? "AND DLR_ID LIKE @DEALER" : ""}
                ${startDt ? "AND CAR_PUR_DT >= @START_DT" : ""}
                ${endDt ? "AND CAR_PUR_DT <= @END_DT" : ""}
                ${dtlOldCarNo ? "AND PUR_BEF_CAR_NO = @PUR_BEF_CAR_NO" : ""}
                ${dtlNewCarNo ? "AND CAR_NO = @CAR_NO" : ""}
                ${dtlExpdItem ? "AND EXPD_ITEM_CD = @EXPD_ITEM_CD" : ""}
                ${dtlTaxGubun ? "AND TAX_SCT_CD = @TAX_SCT_CD" : ""}
                ${dtlExpdGubun ? "AND EXPD_SCT_CD = @EXPD_SCT_CD" : ""}
                ${dtlExpdEvdc ? "AND EXPD_EVDC_CD = @EXPD_EVDC_CD" : ""}
                ${dtlRmrk ? "AND RMRK = @RMRK" : ""}
                ${dtlAdjInclusYN ? "AND ADJ_INCLUS_YN = @ADJ_INCLUS_YN" : ""}
      `;

                  /*
                  UNION ALL
                          SELECT '합계' AS TAX_SCT_NM
                                , COUNT(GOODS_FEE_SEQ) CNT
                                , ISNULL(SUM(B.EXPD_AMT), 0) AS EXPD_AMT
                                , ISNULL(SUM(B.EXPD_SUP_PRC), 0) AS EXPD_SUP_PRC
                                , ISNULL(SUM(B.EXPD_VAT), 0) AS EXPD_VAT
                            FROM dbo.CJB_CAR_PUR A
                                , dbo.CJB_GOODS_FEE B
                            WHERE 1 = 1
                              AND A.CAR_DEL_YN = 'N'
                              AND B.DEL_YN = 'N'
                              AND A.AGENT_ID = @AGENT_ID
                              AND A.CAR_REG_ID = B.CAR_REG_ID
                              AND B.TAX_SCT_CD IN ('01', '02')
                  ${carNo ? "AND CAR_NO LIKE @CAR_NO" : ""}
                  ${dealer ? "AND DLR_ID LIKE @DEALER" : ""}
                  ${startDt ? "AND CAR_PUR_DT >= @START_DT" : ""}
                  ${endDt ? "AND CAR_PUR_DT <= @END_DT" : ""}
                  ${dtlOldCarNo ? "AND PUR_BEF_CAR_NO = @PUR_BEF_CAR_NO" : ""}
                  ${dtlNewCarNo ? "AND CAR_NO = @CAR_NO" : ""}
                  ${dtlExpdItem ? "AND EXPD_ITEM_CD = @EXPD_ITEM_CD" : ""}
                  ${dtlTaxGubun ? "AND TAX_SCT_CD = @TAX_SCT_CD" : ""}
                  ${dtlExpdGubun ? "AND EXPD_SCT_CD = @EXPD_SCT_CD" : ""}
                  ${dtlExpdEvdc ? "AND EXPD_EVDC_CD = @EXPD_EVDC_CD" : ""}
                  ${dtlRmrk ? "AND RMRK = @RMRK" : ""}
                  ${dtlAdjInclusYN ? "AND ADJ_INCLUS_YN = @ADJ_INCLUS_YN" : ""}
                  */
      const result = await request.query(query);
      return result.recordset;  
  
    } catch (err) {
      console.error("Error fetching goods fee car sum list:", err);
      throw err;
    }
  };
  

  // 상품화비 등록 처리
exports.insertGoodsFee = async ({ 
    agentId,          // 상사 ID
    carRegId,         // 차량 등록 ID
    expdItemCd,       // 지출 항목 코드
    expdItemNm,       // 지출 항목 명
    expdSctCd,        // 지출 구분 코드
    expdAmt,          // 지출 금액
    expdSupPrc,       // 지출 공급가
    expdVat,          // 지출 부가세
    expdDt,           // 지출 일자
    expdMethCd,       // 지출 방식 코드
    expdEvdcCd,       // 지출 증빙 코드
    taxSctCd,         // 세금 구분 코드
    txblIssuDt,       // 세금계산서 발행 일자
    rmrk,             // 비고
    adjInclusYn,      // 정산 포함 여부
    cashRecptRcgnNo,  // 현금 영수증 식별 번호
    cashMgmtkey,      // 현금 관리키
    delYn,            // 삭제여부
    regrId,           // 등록자 ID
    modrId            // 수정자 ID
  }) => {
    try {
      const request = pool.request();

      console.log("agentId:", agentId);
      console.log("carRegId:", carRegId);
      console.log("expdItemCd:", expdItemCd);
      console.log("expdItemNm:", expdItemNm);
      console.log("expdSctCd:", expdSctCd);
      console.log("expdAmt:", expdAmt);
      console.log("expdSupPrc:", expdSupPrc);
      console.log("expdVat:", expdVat);
      console.log("expdDt:", expdDt);
      console.log("expdMethCd:", expdMethCd);
      console.log("expdEvdcCd:", expdEvdcCd);
      console.log("taxSctCd:", taxSctCd);
      console.log("txblIssuDt:", txblIssuDt);
      console.log("rmrk:", rmrk);
      console.log("adjInclusYn:", adjInclusYn);
      console.log("cashRecptRcgnNo:", cashRecptRcgnNo);
      console.log("cashMgmtkey:", cashMgmtkey);

      request.input("AGENT_ID", sql.VarChar, agentId);
      request.input("CAR_REG_ID", sql.VarChar, carRegId);
      request.input("EXPD_ITEM_CD", sql.VarChar, expdItemCd);
      request.input("EXPD_ITEM_NM", sql.VarChar, expdItemNm);
      request.input("EXPD_SCT_CD", sql.VarChar, expdSctCd);
      request.input("EXPD_AMT", sql.Int, expdAmt);
      request.input("EXPD_SUP_PRC", sql.Int, expdSupPrc);
      request.input("EXPD_VAT", sql.Int, expdVat);
      request.input("EXPD_DT", sql.VarChar, expdDt);
      request.input("EXPD_METH_CD", sql.VarChar, expdMethCd);
      request.input("EXPD_EVDC_CD", sql.VarChar, expdEvdcCd);
      request.input("TAX_SCT_CD", sql.VarChar, taxSctCd);
      request.input("TXBL_ISSU_DT", sql.VarChar, txblIssuDt);
      request.input("RMRK", sql.VarChar, rmrk);
      request.input("ADJ_INCLUS_YN", sql.VarChar, adjInclusYn);
      request.input("CASH_RECPT_RCGN_NO", sql.VarChar, cashRecptRcgnNo);
      request.input("CASH_MGMTKEY", sql.VarChar, cashMgmtkey);
      request.input("DEL_YN", sql.VarChar, delYn);
      request.input("REGR_ID", sql.VarChar, regrId);
      request.input("MODR_ID", sql.VarChar, modrId);
  
      // 상품화비 등록
      const query1 = `
        INSERT INTO dbo.CJB_GOODS_FEE (
          AGENT_ID,
          CAR_REG_ID,
          EXPD_ITEM_CD,
          EXPD_ITEM_NM, 
          EXPD_SCT_CD,
          EXPD_AMT,
          EXPD_SUP_PRC,
          EXPD_VAT,
          EXPD_DT,
          EXPD_METH_CD,
          EXPD_EVDC_CD,
          TAX_SCT_CD,
          TXBL_ISSU_DT,
          RMRK,
          ADJ_INCLUS_YN,
          CASH_RECPT_RCGN_NO,
          CASH_MGMTKEY,
          DEL_YN,
          REGR_ID,
          MODR_ID
        ) VALUES (
          @AGENT_ID,
          @CAR_REG_ID,
          @EXPD_ITEM_CD,
          @EXPD_ITEM_NM,
          @EXPD_SCT_CD,
          @EXPD_AMT,
          @EXPD_SUP_PRC,
          @EXPD_VAT,
          @EXPD_DT,
          @EXPD_METH_CD,
          @EXPD_EVDC_CD,
          @TAX_SCT_CD,
          @TXBL_ISSU_DT,
          @RMRK,
          @ADJ_INCLUS_YN,
          @CASH_RECPT_RCGN_NO,
          @CASH_MGMTKEY,
          @DEL_YN,
          @REGR_ID,
          @MODR_ID
        );`;
  
  
      // 상품화비 총 금액 업데이트
  
      const query2 = `
        UPDATE dbo.CJB_CAR_PUR 
        SET tot_cmrc_cost_fee = tot_cmrc_cost_fee + @EXPD_AMT 
        WHERE CAR_REG_ID = @CAR_REG_ID;`;
  
      await Promise.all([request.query(query1), request.query(query2)]);
    } catch (err) {
      console.error("Error inserting goods fee:", err);
      throw err;
    }
  };
  

  // 상품화비 수정 처리
exports.updateGoodsFee = async ({ 
    goodsFeeSeq,      // 상품화비 순번
    carRegId,         // 차량 등록 ID
    expdItemCd,       // 지출 항목 코드
    expdItemNm,       // 지출 항목 명
    expdSctCd,        // 지출 구분 코드
    expdAmt,          // 지출 금액
    expdSupPrc,       // 지출 공급가
    expdVat,          // 지출 부가세
    expdDt,           // 지출 일자
    expdMethCd,       // 지출 방식 코드
    expdEvdcCd,       // 지출 증빙 코드
    taxSctCd,         // 세금 구분 코드
    txblIssuDt,       // 세금계산서 발행 일자
    rmrk,             // 비고
    adjInclusYn,      // 정산 포함 여부
    cashRecptRcgnNo,  // 현금 영수증 식별 번호
    cashMgmtkey,      // 현금 관리키
    delYn,            // 삭제여부
    regrId,           // 등록자 ID
    modrId            // 수정자 ID
  }) => {
    try {

      console.log("goodsFeeSeq:", goodsFeeSeq);

      const request = pool.request();
      request.input("GOODS_FEE_SEQ", sql.Int, goodsFeeSeq);
      request.input("CAR_REG_ID", sql.VarChar, carRegId);
      request.input("EXPD_ITEM_CD", sql.VarChar, expdItemCd);
      request.input("EXPD_ITEM_NM", sql.VarChar, expdItemNm);
      request.input("EXPD_SCT_CD", sql.VarChar, expdSctCd);
      request.input("EXPD_AMT", sql.Int, expdAmt);
      request.input("EXPD_SUP_PRC", sql.Int, expdSupPrc);
      request.input("EXPD_VAT", sql.Int, expdVat);
      request.input("EXPD_DT", sql.VarChar, expdDt);
      request.input("EXPD_METH_CD", sql.VarChar, expdMethCd);
      request.input("EXPD_EVDC_CD", sql.VarChar, expdEvdcCd);
      request.input("TAX_SCT_CD", sql.VarChar, taxSctCd);
      request.input("TXBL_ISSU_DT", sql.VarChar, txblIssuDt);
      request.input("RMRK", sql.VarChar, rmrk);
      request.input("ADJ_INCLUS_YN", sql.VarChar, adjInclusYn);
      request.input("CASH_RECPT_RCGN_NO", sql.VarChar, cashRecptRcgnNo);
      request.input("CASH_MGMTKEY", sql.VarChar, cashMgmtkey);
      request.input("DEL_YN", sql.VarChar, delYn);
      request.input("REGR_ID", sql.VarChar, regrId);
      request.input("MODR_ID", sql.VarChar, modrId);

      // 기존 상품화비 삭제 하고 다시 등록 

      const minusQuery = `
        UPDATE dbo.CJB_CAR_PUR 
        SET tot_cmrc_cost_fee = tot_cmrc_cost_fee - CAST((SELECT EXPD_AMT FROM dbo.CJB_GOODS_FEE WHERE GOODS_FEE_SEQ = @GOODS_FEE_SEQ) AS INT)
        WHERE CAR_REG_ID = @CAR_REG_ID;`;

      const deleteQuery = `DELETE FROM dbo.CJB_GOODS_FEE WHERE GOODS_FEE_SEQ = @GOODS_FEE_SEQ;`;

      // 상품화비 수정
      const query1 = `
        INSERT INTO dbo.CJB_GOODS_FEE (
          CAR_REG_ID,
          EXPD_ITEM_CD,
          EXPD_ITEM_NM, 
          EXPD_SCT_CD,
          EXPD_AMT,
          EXPD_SUP_PRC,
          EXPD_VAT,
          EXPD_DT,
          EXPD_METH_CD,
          EXPD_EVDC_CD,
          TAX_SCT_CD,
          TXBL_ISSU_DT,
          RMRK,
          ADJ_INCLUS_YN,
          CASH_RECPT_RCGN_NO,
          CASH_MGMTKEY,
          DEL_YN,
          REGR_ID,
          MODR_ID
        ) VALUES (
          @CAR_REG_ID,
          @EXPD_ITEM_CD,
          @EXPD_ITEM_NM,
          @EXPD_SCT_CD,
          @EXPD_AMT,
          @EXPD_SUP_PRC,
          @EXPD_VAT,
          @EXPD_DT,
          @EXPD_METH_CD,
          @EXPD_EVDC_CD,
          @TAX_SCT_CD,
          @TXBL_ISSU_DT,
          @RMRK,
          @ADJ_INCLUS_YN,
          @CASH_RECPT_RCGN_NO,
          @CASH_MGMTKEY,
          @DEL_YN,
          @REGR_ID,
          @MODR_ID
        );`;
   
      // 상품화비 총 금액 업데이트
  
      const query2 = `
        UPDATE dbo.CJB_CAR_PUR 
        SET tot_cmrc_cost_fee = tot_cmrc_cost_fee + @EXPD_AMT 
        WHERE CAR_REG_ID = @CAR_REG_ID;`;
  
      await Promise.all([request.query(minusQuery), request.query(deleteQuery), request.query(query1), request.query(query2)]);
    } catch (err) {
      console.error("Error updating goods fee:", err);
      throw err;
    }
  };
  


  // 차량에 걸려 있는 상품화비 전체 삭제 
exports.deleteAllGoodsFee = async ({carRegId, usrId}) => {
  try {
    const request = pool.request();

    request.input("CAR_REG_ID", sql.VarChar, carRegId);
    request.input("MODR_ID", sql.VarChar, usrId);

    // 차량에 걸려 있는 상품화비 전체 삭제 
    const query = `DELETE FROM dbo.CJB_GOODS_FEE 
                    WHERE CAR_REG_ID = @CAR_REG_ID;`;


                    console.log("query:", query);

    // 차량에 걸려 있는 상품화비 총 금액 0 셋팅 
    const query2 = `UPDATE dbo.CJB_CAR_PUR 
                    SET tot_cmrc_cost_fee = 0 
                    , MOD_DTIME = GETDATE()
                    , MODR_ID = @MODR_ID
                    WHERE CAR_REG_ID = @CAR_REG_ID;`;

                    console.log("query2:", query2);

    await Promise.all([request.query(query), request.query(query2)]);

  } catch (err) {
    console.error("Error deleting all goods fee:", err);
    throw err;
  }
};


  // 상품화비 한건 삭제 
exports.deleteGoodsFee = async ({goodsFeeSeq, usrId}) => {
  try {
    const request = pool.request();
    request.input("GOODS_FEE_SEQ", sql.Int, goodsFeeSeq);
    request.input("MODR_ID", sql.VarChar, usrId);
    // 차량에 걸려 있는 상품화비 전체 삭제 
    const query = `DELETE FROM dbo.CJB_GOODS_FEE 
                    WHERE GOODS_FEE_SEQ = @GOODS_FEE_SEQ ;`;

    // 차량에 걸려 있는 상품화비 총 금액 0 셋팅 
    const query2 = `UPDATE dbo.CJB_CAR_PUR 
                    SET tot_cmrc_cost_fee = tot_cmrc_cost_fee - (SELECT EXPD_AMT FROM dbo.CJB_GOODS_FEE WHERE GOODS_FEE_SEQ = @GOODS_FEE_SEQ) 
                    , MOD_DTIME = GETDATE()
                    , MODR_ID = @MODR_ID
                    WHERE CAR_REG_ID = (SELECT CAR_REG_ID FROM dbo.CJB_GOODS_FEE WHERE GOODS_FEE_SEQ = @GOODS_FEE_SEQ);`;

    await Promise.all([request.query(query), request.query(query2)]);

  } catch (err) {
    console.error("Error deleting all goods fee:", err);
    throw err;
  }
};