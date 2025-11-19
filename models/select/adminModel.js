const sql = require("mssql");
const pool = require("../../config/db");


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 관리자 2.0
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// 상사정보관리 조회

exports.getAdminAgentList = async ({ 
    agentId, 
    page,
    pageSize,
    agentNm,
    combCd,
    dtGubun,
    startDt,
    endDt,
    orderItem = '01',
    ordAscDesc = 'ASC'
  }) => {
    try {
      const request = pool.request();

      request.input("CAR_AGENT", sql.VarChar, agentId);
      request.input("PAGE_SIZE", sql.Int, pageSize);
      request.input("PAGE", sql.Int, page);
  
      if (agentNm) request.input("AGENT_NM", sql.VarChar, `%${agentNm}%`);
      if (combCd) request.input("COMB_CD", sql.VarChar, combCd);
      if (dtGubun) request.input("DT_GUBUN", sql.VarChar, dtGubun);
      if (startDt) request.input("START_DT", sql.VarChar, startDt);
      if (endDt) request.input("END_DT", sql.VarChar, endDt);

      const countQuery = `
        SELECT COUNT(*) as totalCount
                FROM dbo.CJB_AGENT A
                WHERE 1 = 1
                ${agentNm ? "AND A.AGENT_NM LIKE @AGENT_NM" : ""}
                ${combCd ? "AND A.CMBT_AGENT_CD = @COMB_CD" : ""}
                ${startDt ? `AND ${dtGubun === '1' ? 'A.REG_DTIME' : 'A.CAR_PUR_DT'} >= @START_DT` : ""}
                ${endDt ? `AND ${dtGubun === '1' ? 'A.REG_DTIME' : 'A.CAR_PUR_DT'} <= @END_DT` : ""}

      `;
  
      const dataQuery = `SELECT AGENT_NM  AS COMNAME
                          , DBO.CJB_FN_DATEFMT('D', A.REG_DTIME ) REGDATE
                          , BRNO
                          , PRES_NM 
                          , PRES_PHON
                          , EMAIL
                          , AGRM_AGR_YN
                          , FIRM_YN
                          , AGENT_STAT_CD
                          , AEMP_ID
                          , (SELECT USR_NM FROM dbo.CJB_USR WHERE USR_ID = A.AEMP_ID) AS AEMP_NM
                          , (SELECT USR_PHON FROM dbo.CJB_USR WHERE USR_ID = A.AEMP_ID) AS AEMP_PHON
                          , CASE WHEN AGENT_STAT_CD = '1' THEN '정상' ELSE '비정상' END AS AGENT_STAT_CD_NM
                          , PHON
                          , FAX
                          , ZIP
                          , ADDR1
                          , ADDR2
                          , FEE_SCT_CD
                          , CMBT_CD
                          , CMBT_NM
                          , CMBT_AGENT_CD
                          , CMBT_AGENT_STAT_NM
                      FROM dbo.CJB_AGENT A
                      WHERE 1 = 1
                      ${agentNm ? "AND A.AGENT_NM LIKE @AGENT_NM" : ""}
                      ${combCd ? "AND A.CMBT_AGENT_CD = @COMB_CD" : ""}
                      ${startDt ? `AND ${dtGubun === '1' ? 'A.REG_DTIME' : 'A.CAR_PUR_DT'} >= @START_DT` : ""}
                      ${endDt ? `AND ${dtGubun === '1' ? 'A.REG_DTIME' : 'A.CAR_PUR_DT'} <= @END_DT` : ""}
      ORDER BY ${orderItem === '01' ? 'A.AGENT_NM' : 'A.REG_DTIME'} ${ordAscDesc}
      OFFSET (@PAGE - 1) * @PAGE_SIZE ROWS
      FETCH NEXT @PAGE_SIZE ROWS ONLY;`;

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
        agentlist: dataResult && dataResult.recordset ? dataResult.recordset : [],
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
      console.error("Error fetching admin agent list:", err);
      throw err;
    }
  };