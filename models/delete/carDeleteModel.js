const sql = require("mssql");
const pool = require("../../config/db");

// 제시 삭제
exports.deleteSuggest = async ({ mgtKey}) => {
    try {
      const request = pool.request();
      request.input("MGTKEY", sql.VarChar, mgtKey);
  
      const query1 = `
        DELETE CJB_JAESI
        WHERE MgtKey = @MGTKEY;
      `;  

      await Promise.all([request.query(query1)]);
  
    } catch (err) {
      console.error("Error deleting suggest:", err);
      throw err;
    }
  };
  