const sql = require("mssql");
const pool = require("../../config/db");


// 시스템 사용 요청 등록
exports.insertUserRequest = async ({ unionName
                                  , companyName
                                  , businessRegistrationNumber
                                  , representativeName
                                  , representativePhone
                                  , id
                                  , password
                                  , registrationCode }) => {
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
  empName,
  fileUrls,
  imageUrls
}) => {
  try {
    const request = pool.request();
    request.input("mgtKey", sql.VarChar, mgtKey);
    request.input("franchiseCorpName", sql.VarChar, franchiseCorpName);
    request.input("cashBillRegDate", sql.VarChar, cashBillRegDate);
    request.input("totalAmount", sql.Decimal, totalAmount);
    request.input("empName", sql.VarChar, empName);

    // fileUrls 또는 imageUrls 처리 (둘 중 하나라도 있으면 처리)
    const urlsToProcess = fileUrls || imageUrls;
    if (Array.isArray(urlsToProcess) && urlsToProcess.length > 0) {
      for (let i = 0; i < urlsToProcess.length; i++) {
        const fileUrl = urlsToProcess[i];
        // 파일 URL을 별도 테이블에 저장
        const fileRequest = pool.request();
        fileRequest.input("mgtKey", sql.VarChar, mgtKey);
        fileRequest.input("fileUrl", sql.VarChar, fileUrl);
        fileRequest.input("empName", sql.VarChar, empName || 'SYSTEM'); // empName이 빈 값이면 기본값 사용
        await fileRequest.query(`
          INSERT INTO CJB_CASHBILL_FILES (mgtKey, fileUrl, empName)
          VALUES (@mgtKey, @fileUrl, @empName)
        `);
      }
    }
    
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


// 상품화비 등록 선처리
exports.insertGoodsFeePre = async ({ goods_regid, goods_codename, goods_sendamt, goods_senddate, goods_way, goods_receipt, goods_taxgubn, goods_taxdate, goods_desc, goods_dealsang }) => {
  try {
    const request = pool.request();

    // 기존 상품화비 삭제 
    const query1 = `DELETE FROM SMJ_GOODS WHERE GOODS_REGID = @GOODS_REGID`;

    // 상사지출도 삭제
    const query2 = `UPDATE SMJ_COST SET COST_DELGUBN ='1' 
                     WHERE COST_AGENT = @GOODS_AGENT 
                       AND COST_CARID = @GOODS_REGID 
                       AND COST_KIND = '0' 
                       AND COST_CODE = '002' `;

    await Promise.all([request.query(query1), request.query(query2)]);
  } catch (err) {
    console.error("Error inserting goods fee pre:", err);
    throw err;
  }
};


// 상품화비 등록
exports.insertGoodsExpense = async ({ goods_regid, goods_agent, goods_empid, goods_regdate, goods_code, goods_codename, goods_sendamt, goods_senddate, goods_way, goods_receipt, goods_taxgubn, goods_taxdate, goods_desc, goods_dealsang }) => {
  try {
    const request = pool.request();

    request.input("GOODS_REGID", sql.VarChar, goods_regid);
    request.input("GOODS_AGENT", sql.VarChar, goods_agent);
    request.input("GOODS_EMPID", sql.VarChar, goods_empid);
    request.input("GOODS_REGDATE", sql.VarChar, goods_regdate);
    request.input("GOODS_CODE", sql.VarChar, goods_code);
    request.input("GOODS_CODENAME", sql.VarChar, goods_codename);
    request.input("GOODS_SENDAMT", sql.Decimal, goods_sendamt);
    request.input("GOODS_SENDDATE", sql.VarChar, goods_senddate);
    request.input("GOODS_WAY", sql.VarChar, goods_way);
    request.input("GOODS_RECEIPT", sql.VarChar, goods_receipt);
    request.input("GOODS_TAXGUBN", sql.VarChar, goods_taxgubn);
    request.input("GOODS_TAXDATE", sql.VarChar, goods_taxdate);
    request.input("GOODS_DESC", sql.VarChar, goods_desc);
    request.input("GOODS_DEALSANG", sql.VarChar, goods_dealsang);

    const query = `INSERT INTO SMJ_GOODSFEE ( GOODS_AGENT, GOODS_EMPID, GOODS_REGID, GOODS_REGDATE,
                          GOODS_CODE, GOODS_CODENAME, GOODS_SENDAMT, GOODS_SENDDATE, GOODS_WAY, GOODS_RECEIPT, GOODS_TAXGUBN, GOODS_TAXDATE, GOODS_DESC, GOODS_DEALSANG )
                  VALUES (@GOODS_AGENT, @GOODS_EMPID, @GOODS_REGID, @GOODS_REGDATE,
                          @GOODS_CODE, @GOODS_CODENAME, @GOODS_SENDAMT, @GOODS_SENDDATE, @GOODS_WAY, @GOODS_RECEIPT, @GOODS_TAXGUBN, @GOODS_TAXDATE, @GOODS_DESC, @GOODS_DEALSANG);`;

    await request.query(query);

  } catch (err) {
    console.error("Error inserting goods fee:", err);
    throw err;
  }
};


// 테스트 등록
exports.insertTest = async ({ carAgent, carFee }) => {
  try {
    const request = pool.request();

    request.input("CAR_AGENT", sql.VarChar, carAgent);
    request.input("CAR_FEE", sql.VarChar, carFee);

    const query = `INSERT INTO SMJ_AGENT_FEE (AGENT, FEE) VALUES (@CAR_AGENT, @CAR_FEE);`;
    await request.query(query);

  } catch (err) {
    console.error("Error inserting test:", err);
    throw err;
  }
};