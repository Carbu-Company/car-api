const sql = require("mssql");
const pool = require("../../config/db");

// 제시 삭제
exports.deleteSuggest = async ({car_regid, flag_type}) => {
    try {
      const request = pool.request();
      request.input("CAR_REGID", sql.VarChar, car_regid);

      let query = "";
  
      if(flag_type == "1") {

        query = `DELETE CJB_CAR_PUR
                          WHERE CAR_REG_ID = @CAR_REGID
                          AND CAR_DEL_YN = 'N'
              `;  
      } else {
        query = `UPDATE CJB_CAR_PUR
                          SET CAR_DEL_YN = 'Y'
                            , CAR_DEL_DT = GETDATE()
                          WHERE CAR_REG_ID = @CAR_REGID;
              `;  
      }

      console.log("query:", query);

      await request.query(query);
  
    } catch (err) {
      console.error("Error deleting suggest:", err);
      throw err;
    }
  };
  