const sql = require("mssql");
const pool = require("../../config/db");

// 제시 삭제
exports.deleteSuggest = async ({ car_regid}) => {
    try {
      const request = pool.request();
      request.input("CAR_REGID", sql.VarChar, car_regid);
  
      const query1 = `
        DELETE CJB_JAESI
        WHERE CAR_REGID = @CAR_REGID;
      `;  

      await Promise.all([request.query(query1)]);
  
    } catch (err) {
      console.error("Error deleting suggest:", err);
      throw err;
    }
  };
  