const sql = require("mssql");
const pool = require("../../config/db");


//agent, unionName, companyName, businessRegistrationNumber, representativeName, representativePhone, id, password, registrationCode, alive_dt, cnt
// 시스템 사용 요청 등록
exports.insertUserRequest = async ({ agent
                                  , unionName
                                  , companyName
                                  , businessRegistrationNumber
                                  , representativeName
                                  , representativePhone
                                  , id
                                  , password
                                  , registrationCode
                                  , alive_dt
                                  , cnt }) => {
  try {

    // 문자열 배열 10개짜리 만들고 초기값 '0'로
    let Buy_titleAmt = Array(10).fill('0');
    let Buy_titleName = [];
    Buy_titleName[0] = "상사매입비";
    Buy_titleName[1] = "매입1%납부세액";
    Buy_titleName[2] = "매입이전대행비";
    Buy_titleName[3] = "수입인지대금";
    Buy_titleName[4] = "기타";
    Buy_titleName[5] = "기타";
    Buy_titleName[6] = "기타";
    Buy_titleName[7] = "기타";
    Buy_titleName[8] = "기타";
    Buy_titleName[9] = "기타";

    // 매도수수료 기본  설정
    let Sell_titleAmt = Array(10).fill('0');
    let Sell_titleName = [];
    Sell_titleName[0] = "상사매도비";
    Sell_titleName[1] = "이전대행비";
    Sell_titleName[2] = "수입인지대금";
    Sell_titleName[3] = "기타";
    Sell_titleName[4] = "기타";
    Sell_titleName[5] = "기타";
    Sell_titleName[6] = "기타";
    Sell_titleName[7] = "기타";
    Sell_titleName[8] = "기타";
    Sell_titleName[9] = "기타";

    
    // agent, alive_dt, cnt 값을 쿼리로 받아오기
    const result = await pool.request().query(`
      select 
        dbo.SMJ_FN_MK_AGENT() as agent, 
        convert(varchar(10), DATEADD(Day, 3650, GETDATE()), 21) as alive_dt, 
        count(*) as cnt 
      from SMJ_USER 
      where LOGINID = '${id}'
    `);
    const { agent, alive_dt, cnt } = result.recordset[0];

    //console.log(result);  
    console.log(agent);
    console.log(alive_dt);
    console.log(cnt);

    // 중복 체크
    // if (cnt > 0) {
    //   throw new Error("이미 존재하는 아이디입니다.");
    // }

    const request = pool.request(); 

    request.input("agent", sql.VarChar, agent);
    request.input("unionName", sql.VarChar, unionName);
    request.input("companyName", sql.VarChar, companyName);
    request.input("businessRegistrationNumber", sql.VarChar, businessRegistrationNumber);
    request.input("representativeName", sql.VarChar, representativeName);
    request.input("representativePhone", sql.VarChar, representativePhone);
    request.input("registrationCode", sql.VarChar, registrationCode);
    request.input("alive_dt", sql.VarChar, alive_dt);

    request.input("id", sql.VarChar, id);
    request.input("password", sql.VarChar, password);


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
                      , 2000 --기본도토리 2000개
                      , '1599-1579' --문자용
                      ); 
 
    `;

    const query2 = `  INSERT INTO SMJ_AGENT_ORDER (
                      ODR_AGENT, ODR_EMPID, ODR_DATE, ODR_PRD, ODR_AMT, ODR_PREVDATE, ODR_NEXTDATE,ODR_INAMTDATE     
                      ) VALUES ( 
                        @agent
                      , @agent+'0001'
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

    // 매입수수료 및 매도수수료 기본 설정 
    for (let i = 0; i < 10; i++) {
      console.log(`for문 실행: ${i + 1}번째`);

      //매입수수료 기본 설정
      const query6 = `INSERT INTO SMJ_FEECONFIG (CNFG_FEE_AGENT, CNFG_FEE_KIND, CNFG_FEE_NO, CNFG_FEE_TITLE, CNFG_FEE_COND, CNFG_FEE_RATE, CNFG_FEE_AMT)
        VALUES (
          @agent
        , '0'
        , ${i+1}
        , '${Buy_titleName[i]}'
        , '1'
        , '0'
        , '${Buy_titleAmt[i]}'
        );
      `;

      //매도수수료 기본 설정
      const query7 = `INSERT INTO SMJ_FEECONFIG (CNFG_FEE_AGENT, CNFG_FEE_KIND, CNFG_FEE_NO, CNFG_FEE_TITLE, CNFG_FEE_COND, CNFG_FEE_RATE, CNFG_FEE_AMT)
        VALUES (
          @agent
        , '1'
        , ${i+1}
        , '${Sell_titleName[i]}'
        , '1'
        , '0'
        , '${Sell_titleAmt[i]}'
        );
      `;

      await Promise.all([request.query(query6), request.query(query7)]);
    }

  } catch (err) {
    console.error("Error inserting system use request:", err);  
    throw err;
  }
};


// 계좌정보 등록
exports.insertAccountInfo = async ({ agentId, bankCode, accountNumber, memo, accountName }) => {
  try {
    const request = pool.request();

    request.input("CAR_AGENT", sql.VarChar, agentId);
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

