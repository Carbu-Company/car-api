const sql = require('mssql'); // mssql 모듈 가져오기
const pool = require('../config/db'); // Connection Pool 가져오기

exports.getCars = async ({ carAgent }) => {
  try {
    const request = pool.request(); // SQL Server 요청 생성
    request.input('carAgent', sql.VarChar, carAgent); // carAgent 매개변수 바인딩

    const query = `
      SELECT * 
      FROM SMJ_MAINLIST 
      WHERE CAR_AGENT = @carAgent
    `;

    const result = await request.query(query); // 쿼리 실행
    return result.recordset; // 결과 반환
  } catch (err) {
    console.error('Error fetching cars:', err);
    throw err;
  }
};
