const sql = require('mssql'); // mssql 모듈 가져오기
const pool = require('../config/db'); // Connection Pool 가져오기

exports.login = async ({ loginId, loginPass }) => {
  const request = pool.request();
  request.input('loginId', sql.VarChar, loginId);
  request.input('loginPass', sql.VarChar, loginPass);

  const query = `
      SELECT A.*,
             COMNAME,
             STATE,
             DATEDIFF(DAY, GETDATE(), ENDDATE) AS AGT_ENDCHECK,
             AG_VER
      FROM   SMJ_USER A
             JOIN SMJ_AGENT B ON A.AGENT = B.AGENT
      WHERE  A.LOGINID = @loginId
             AND A.LOGINPASS = @loginPass
             AND A.EMPEDATE IS NULL
             AND A.EMPGRADE IN ('8', '9')
             AND A.DEALER_CODE = 0
  `;

  const result = await request.query(query);

  if (result.recordset.length > 0) {
    return { success: true, user: result.recordset[0] };
  } else {
    return { success: false, message: 'Invalid login credentials' };
  }
};
