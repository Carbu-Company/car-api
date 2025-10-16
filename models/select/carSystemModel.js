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

