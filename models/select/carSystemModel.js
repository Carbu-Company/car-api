const sql = require("mssql");
const pool = require("../../config/db");


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 기준 항목
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 기준 항목 조회
exports.getSystemBaseList = async ({ grpCd }) => {
  try {
    const request = pool.request();
    request.input("GRP_CD", sql.VarChar, grpCd);

    const query = `SELECT * FROM dbo.CJB_COMM_CD WHERE GRP_CD = @GRP_CD`;
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching system base list:", err);
    throw err;
  }
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 차량 검색 설정
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.getCarSearchList = async ({ 
  agentId, 
  carNo,
  page = 1,
  pageSize = 10,
  orderItem = '1',   //1: 제시일, 2: 담당딜러, 3: 고객유형, 4: 차량번호
  ordAscDesc = 'desc'
}) => {
  try {
    const request = pool.request();

    console.log('agentId:', agentId);
    console.log('pageSize:', pageSize);
    console.log('page:', page);

    console.log('carNo:', carNo);
    console.log('orderItem:', orderItem);
    console.log('ordAscDesc:', ordAscDesc);

    request.input("CAR_AGENT", sql.VarChar, agentId);
    request.input("PAGE_SIZE", sql.Int, pageSize);
    request.input("PAGE", sql.Int, page);


    if (carNo) request.input("CAR_NO", sql.VarChar, `%${carNo}%`);

    // 전체 카운트 조회
    const countQuery = `
    SELECT COUNT(*) as totalCount
              FROM dbo.CJB_CAR_PUR A
                  , dbo.CJB_CAR_SEL B
            WHERE A.AGENT_ID = @CAR_AGENT
              AND A.CAR_REG_ID = B.CAR_REG_ID
              AND A.CAR_DEL_YN = 'N'
              AND A.CAR_STAT_CD = '001'  -- 매입 ( 제시 차량 )
              ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO OR A.PUR_BEF_CAR_NO LIKE @CAR_NO OR B.SEL_CAR_NO LIKE @CAR_NO)" : ""}
              ORDER BY ${orderItem === '1' ? 'A.CAR_PUR_DT' : orderItem === '2' ? 'A.DLR_ID' : orderItem === '3' ? 'A.PRSN_SCT_CD' : orderItem === '4' ? 'A.OWNR_TP_CD' : 'A.OWNR_TP_CD'} ${ordAscDesc}
              OFFSET (@PAGE - 1) * @PAGE_SIZE ROWS
              FETCH NEXT @PAGE_SIZE ROWS ONLY;`;  

    //console.log('countQuery:', countQuery);
  
    const dataQuery = `SELECT A.CAR_REG_ID               
       , A.CAR_REG_DT              
       , A.CAR_DEL_DT              
       , A.CAR_STAT_CD             
       , dbo.CJB_FN_GET_CD_NM('01', A.CAR_STAT_CD) CAR_STAT_NM
       , A.CAR_DEL_YN              
       , A.AGENT_ID                
       , A.DLR_ID                  
       , (SELECT USR_NM FROM CJB_USR WHERE USR_ID = A.DLR_ID) AS DLR_NM
       , A.CAR_KND_CD              
       , A.PRSN_SCT_CD
       , CASE WHEN PRSN_SCT_CD = '0' THEN '상사매입' ELSE '고객위탁' END PRSN_SCT_NM
       , A.CAR_PUR_DT              
       , A.CAR_LOAN_CNT            
       , A.CAR_LOAN_AMT            
       , A.CAR_NO               
       , A.PUR_BEF_CAR_NO   
       , A.CAR_NEW_YN              
       , A.CAR_NM                  
       , A.CAR_CAT_NM              
       , A.MFCP_NM                 
       , A.CAR_MNFT_DT             
       , A.RUN_DSTN                
       , A.CAR_YOM
       , A.PUR_EVDC_CD                 -- 매출증빙 구분 코드
       , dbo.CJB_FN_GET_CD_NM('07', A.PUR_EVDC_CD) PUR_EVDC_NM
       , A.OWNR_NM                 
       , A.OWNR_TP_CD             
       , dbo.CJB_FN_GET_CD_NM('04', A.OWNR_TP_CD) OWNR_TP_NM
       , A.OWNR_SSN                
       , A.OWNR_BRNO               
       , A.OWNR_PHON               
       , A.OWNR_ZIP                
       , A.OWNR_ADDR1              
       , A.OWNR_ADDR2     
       , SUBSTRING(A.OWNR_EMAIL, 1, CHARINDEX('@', A.OWNR_EMAIL) - 1) AS OWNR_EMAIL
       , SUBSTRING(A.OWNR_EMAIL, CHARINDEX('@', A.OWNR_EMAIL) + 1, LEN(A.OWNR_EMAIL)) AS OWNR_EMAIL_DOMAIN
       , A.PUR_AMT                 
       , A.PUR_SUP_PRC             
       , A.PUR_VAT                 
       , A.GAIN_TAX                
       , A.AGENT_PUR_CST           
       , A.PURACSH_RCV_YN          
       , A.TXBL_ISSU_DT            
       , A.PUR_DESC                
       , A.TOT_PUR_FEE             
       , A.TOT_PAY_FEE             
       , A.TOT_CMRC_COST_FEE       
       , A.CUST_NO                 
       , A.PRSN_NO                 
       , A.PARK_ZON_CD             
       , A.PARK_ZON_DESC           
       , A.PARK_KEY_NO             
       , A.REG_DTIME               
       , A.REGR_ID                 
       , A.MOD_DTIME               
       , A.MODR_ID             
                FROM dbo.CJB_CAR_PUR A
                    , dbo.CJB_CAR_SEL B
              WHERE A.AGENT_ID = @CAR_AGENT
                AND A.CAR_REG_ID = B.CAR_REG_ID
                AND A.CAR_DEL_YN = 'N'
                AND A.CAR_STAT_CD = '001'  -- 매입 ( 제시 차량 )
              ${carNo ? "AND (A.CAR_NO LIKE @CAR_NO OR A.PUR_BEF_CAR_NO LIKE @CAR_NO OR B.SEL_CAR_NO LIKE @CAR_NO)" : ""}
              ORDER BY ${orderItem === '1' ? 'A.CAR_PUR_DT' : orderItem === '2' ? 'A.DLR_ID' : orderItem === '3' ? 'A.PRSN_SCT_CD' : orderItem === '4' ? 'A.OWNR_TP_CD' : 'A.OWNR_TP_CD'} ${ordAscDesc}
              OFFSET (@PAGE - 1) * @PAGE_SIZE ROWS
              FETCH NEXT @PAGE_SIZE ROWS ONLY;`;

    //console.log('dataQuery:', dataQuery);

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
