const sql = require("mssql");
const pool = require("../../config/db");


// 시스템 사용 요청 등록
exports.insertUserRequest = async ({ agent, unionName, companyName, businessRegistrationNumber, representativeName, representativePhone, id, password, registrationCode, alive_dt, cnt }) => {
  try {
    const request = pool.request(); 

    request.input("agent", sql.VarChar, agent);
    request.input("unionName", sql.VarChar, unionName);
    request.input("companyName", sql.VarChar, companyName);
    request.input("businessRegistrationNumber", sql.VarChar, businessRegistrationNumber);
    request.input("representativeName", sql.VarChar, representativeName);
    request.input("representativePhone", sql.VarChar, representativePhone);
    request.input("id", sql.VarChar, id);
    request.input("password", sql.VarChar, password);
    request.input("registrationCode", sql.VarChar, registrationCode);
    request.input("alive_dt", sql.VarChar, alive_dt);
    request.input("cnt", sql.Int, cnt);

    const query1 = ` INSERT INTO SMJ_AGENT (
                       AGENT     
                      ,COMNAME  
                      ,REGDATE  
                      ,ENDDATE 
                      ,BRNO 
                      ,AG_CODE 
                      ,AG_CEO_HP 
                      ,STATE 
                      ,AG_DOTORI 
                      ,AG_AUTH_TEL 
                      ) VALUES ( 
                        @agent
                      , @companyName --COMNAME 상호명
                      , getDate() 
                      , @alive_dt --만료일
                      , @businessRegistrationNumber --사업자번호
                      , @registrationCode --상사코드
                      , @representativePhone --휴대전호
                      , '1' --상태 우선 1(사용불가) 인증처리 후 0(사용가)으로 바꿈
                      , @cnt --기본도토리 2000개
                      , '1234' --문자용
                      ); 
 
    `;

    const query2 = `  INSERT INTO SMJ_AGENT_ORDER (
                      ODR_AGENT, ODR_EMPID, ODR_DATE, ODR_PRD, ODR_AMT, ODR_PREVDATE, ODR_NEXTDATE,ODR_INAMTDATE     
                      ) VALUES ( 
                        @agent
                      , @id 
                      , getDate() 
                      , 0 
                      , 0 
                      , getDate() 
                      , @alive_dt 
                      , getDate() );
                      
    `;

    const query3 = ` INSERT INTO SMJ_USER (
                            AGENT, EMPID 
                            , LOGINID, LOGINPASS, EMPKNAME
                            , EMPREGDATE
                            , EMPSDATE
                            , EMPGRADE
                            , EMPTAXGUBN
                            , EMPTELNO1
                            ) values ( 
                              @agent
                            , dbo.SMJ_FN_MK_EMP(@agent) 
                            , @id
                            , @password
                            , @representativeName
                            , getDate()
                            , getDate()
                            , '9' 
                            , '0' 
                            , @representativePhone 
                            )  
                                `;

    const query4 = `insert into SMJ_CODE(AGENT, INDEXCD, CODE1, CODE2, NAME, ISUSE,NAME2,SORTNO) 
                    SELECT 
                          @agent,INDEXCD,CODE1,CODE2,NAME,ISUSE,NAME2,ISFIX
                            FROM SMJ_CODE
                          WHERE AGENT = '99999'
                            AND INDEXCD = '80';
                  `;

    const query5 = `insert into SMJ_CODE(AGENT, INDEXCD, CODE1, CODE2, NAME, ISUSE,NAME2,SORTNO) 
                    SELECT 
                          @agent,INDEXCD,CODE1,CODE2,NAME,ISUSE,NAME2,ISFIX
                            FROM SMJ_CODE
                          WHERE AGENT = '99999'
                            AND INDEXCD = '81';
                `;


    await Promise.all([request.query(query1), request.query(query2), request.query(query3), request.query(query4), request.query(query5)]);
  } catch (err) {
    console.error("Error inserting system use request:", err);  
    throw err;
  }
};

// 인증번호 등록
exports.insertPhoneAuthNumber = async ({ representativePhone, authNumber }) => {
  try {
    const request = pool.request();
    request.input("AUTH_PHONE", sql.VarChar, representativePhone);
    request.input("CERT_NO", sql.Int, authNumber);

    const query = `INSERT INTO CJB_CERT_NO_REG (CELL_NO, STRT_DTIME, END_DTIME, CERT_NO) VALUES (@AUTH_PHONE, GETDATE(), DATEADD(MINUTE, 3, GETDATE()), @CERT_NO)`;

    await request.query(query);
  } catch (err) {
    console.error("Error inserting auth number:", err);
    throw err;
  }
};


// 계좌정보 등록
exports.insertAccountInfo = async ({ carAgent, bankCode, accountNumber, memo, accountName }) => {
  try {
    const request = pool.request();

    request.input("CAR_AGENT", sql.VarChar, carAgent);
    request.input("BANKCODE", sql.VarChar, bankCode);
    request.input("ACCOUNTNUMBER", sql.VarChar, accountNumber);
    request.input("MEMO", sql.VarChar, memo);
    request.input("ACCOUNTNAME", sql.VarChar, accountName);

    const query = `INSERT INTO SMJ_AGENT_BANK
                              (AGENT,
                              BANKCODE,
                              ACCOUNTNUMBER,
                              USECHECK,
                              MEMO,
                              REGDATE,
                              ACCOUNTNAME)
                  VALUES      ( @CAR_AGENT, 
                                @BANKCODE,
                                @ACCOUNTNUMBER,
                                'Y',  
                                @MEMO,
                                GETDATE(),
                                @ACCOUNTNAME) ;
                                `;

    await request.query(query);
  } catch (err) {
    console.error("Error inserting account info:", err);
    throw err;  
  }
};


// 제시 직접 등록
exports.insertSuggest = async ({
  mgtKey,
  franchiseCorpName,
  cashBillRegDate,
  totalAmount,
}) => {
  try {
    const request = pool.request();
    request.input("mgtKey", sql.VarChar, mgtKey);
    request.input("franchiseCorpName", sql.VarChar, franchiseCorpName);
    request.input("cashBillRegDate", sql.VarChar, cashBillRegDate);
    request.input("totalAmount", sql.Decimal, totalAmount);

    const query1 = `
      INSERT INTO CJB_CASHBILL2 (MgtKey, FranchiseCorpName, CashBillRegDate, TotalAmount)
      VALUES (@mgtKey, @franchiseCorpName, @cashBillRegDate, @totalAmount);
    `;

    const query2 = `
      INSERT INTO CJB_CASHBILL_LOG2 (MgtKey, CashBillRegDate)
      VALUES (@mgtKey, @cashBillRegDate);
    `;

    await Promise.all([request.query(query1), request.query(query2)]);
  } catch (err) {
    console.error("Error inserting car:", err);
    throw err;
  }
};


// 매입비 항목 등록
exports.insertBuyFee = async ({ fee_car_regid, fee_kind, fee_agent, fee_no, fee_title, fee_cond, fee_rate, fee_amt, fee_inamt, fee_indate, fee_indesc }) => {
  try {
    const request = pool.request();

    request.input("FEE_CAR_REGID", sql.VarChar, fee_car_regid);
    request.input("FEE_KIND", sql.VarChar, fee_kind);
    request.input("FEE_AGENT", sql.VarChar, fee_agent);
    request.input("FEE_NO", sql.Int, fee_no);
    request.input("FEE_TITLE", sql.VarChar, fee_title);
    request.input("FEE_COND", sql.VarChar, fee_cond);
    request.input("FEE_RATE", sql.Decimal, fee_rate);
    request.input("FEE_AMT", sql.Decimal, fee_amt);
    request.input("FEE_INAMT", sql.Decimal, fee_inamt);
    request.input("FEE_INDATE", sql.VarChar, fee_indate);
    request.input("FEE_INDESC", sql.VarChar, fee_indesc);

    const query = `INSERT INTO SMJ_FEEAMT ( FEE_CAR_REGID, FEE_KIND, FEE_AGENT, FEE_NO, FEE_TITLE, FEE_COND, FEE_RATE, FEE_AMT, FEE_INAMT, FEE_INDATE, FEE_INDESC )
                  VALUES (@FEE_CAR_REGID, @FEE_KIND, @FEE_AGENT, @FEE_NO, @FEE_TITLE, @FEE_COND, @FEE_RATE, @FEE_AMT, @FEE_INAMT, @FEE_INDATE, @FEE_INDESC);`;

    await request.query(query);

  } catch (err) {
    console.error("Error inserting buy fee:", err);
    throw err;
  }
};



// 매도비 항목 등록
exports.insertSellFee = async ({ fee_car_regid, fee_kind, fee_agent, fee_no, fee_title, fee_cond, fee_rate, fee_amt, fee_inamt, fee_indate, fee_indesc }) => {
  try {
    const request = pool.request();

    request.input("FEE_CAR_REGID", sql.VarChar, fee_car_regid);
    request.input("FEE_KIND", sql.VarChar, fee_kind);
    request.input("FEE_AGENT", sql.VarChar, fee_agent);
    request.input("FEE_NO", sql.Int, fee_no);
    request.input("FEE_TITLE", sql.VarChar, fee_title);
    request.input("FEE_COND", sql.VarChar, fee_cond);
    request.input("FEE_RATE", sql.Decimal, fee_rate);
    request.input("FEE_AMT", sql.Decimal, fee_amt);
    request.input("FEE_INAMT", sql.Decimal, fee_inamt);
    request.input("FEE_INDATE", sql.VarChar, fee_indate);
    request.input("FEE_INDESC", sql.VarChar, fee_indesc);

    const query = `INSERT INTO SMJ_FEEAMT ( FEE_CAR_REGID, FEE_KIND, FEE_AGENT, FEE_NO, FEE_TITLE, FEE_COND, FEE_RATE, FEE_AMT, FEE_INAMT, FEE_INDATE, FEE_INDESC )
                  VALUES (@FEE_CAR_REGID, @FEE_KIND, @FEE_AGENT, @FEE_NO, @FEE_TITLE, @FEE_COND, @FEE_RATE, @FEE_AMT, @FEE_INAMT, @FEE_INDATE, @FEE_INDESC);`;

    await request.query(query);

  } catch (err) {
    console.error("Error inserting sell fee:", err);
    throw err;
  }
};
