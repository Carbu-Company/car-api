const sql = require("mssql");
const pool = require("../../config/db");


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 사용 요청 등록
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.registerUser = async ({ AgentNm, AgentRegNo, CeoNm, Email, CombAgentCd, UserId, UserPw, UsrNm, UsrTel }) => {
  try {
    const request = pool.request();

    console.log("UserId:", UserId);
    console.log("CombAgentCd:", CombAgentCd);

    // id값이 이미 존재하는지 체크
    request.input("UserId", sql.VarChar, UserId);
    const id_check = await request.query(`SELECT COUNT(*) as count FROM dbo.CJB_USR WHERE LOGIN_ID = @UserId`);
    console.log("id_check:", id_check.recordset[0].count);
    if (id_check.recordset[0].count > 0) {
      console.log("USER_ID_EXIST");
      throw new Error("USER_ID_EXIST");
    }

    // 상사코드 존재하는지 체크
    let new_agent_id = '';
    const agent_check_request = pool.request();
    agent_check_request.input("CombAgentCd", sql.VarChar, CombAgentCd);
    const agent_check = await agent_check_request.query(`SELECT COUNT(*) as count FROM dbo.CJB_AGENT WHERE CMBT_AGENT_CD = @CombAgentCd`);
    if (agent_check.recordset[0].count > 0) {
      // 존재하면 Agent_ID값 가져오기
      const agent_id_request = pool.request();
      agent_id_request.input("CombAgentCd", sql.VarChar, CombAgentCd);
      const agent_id = await agent_id_request.query(`SELECT AGENT_ID FROM dbo.CJB_AGENT WHERE CMBT_AGENT_CD = @CombAgentCd`);
      new_agent_id = agent_id.recordset[0].AGENT_ID;

      console.log("agent_id:", new_agent_id);
    }
    else {
      // 존재하지 않으면 agent_id 값 미리 생성 하고 해당 값을 넘기기. 함수는 CJB_FN_MK_AGENT_ID()
      const agent_id_request = pool.request();
      const agent_id = await agent_id_request.query(`SELECT dbo.CJB_FN_MK_AGENT_ID() as agent_id`);
      new_agent_id = agent_id.recordset[0].agent_id;
      console.log("new_agent_id:", new_agent_id);

      // 상사 정보 저장 처리 함수 
      request.input("AGENT_ID", sql.VarChar, new_agent_id);
      request.input("AGENT_NM", sql.VarChar, AgentNm);
      request.input("AGENT_REG_NO", sql.VarChar, AgentRegNo);
      request.input("CEO_NM", sql.VarChar, CeoNm);
      request.input("AGRM_AGR_YN", sql.VarChar, 'N');
      request.input("CMBT_AGENT_CD", sql.VarChar, CombAgentCd);
      request.input("FIRM_YN", sql.VarChar, 'N');
      request.input("REGR_ID", sql.VarChar, 'USER');
      request.input("MODR_ID", sql.VarChar, 'USER');

      const query = `INSERT INTO dbo.CJB_AGENT (AGENT_ID
                                                 , AGENT_NM
                                                 , BRNO
                                                 , PRES_NM
                                                 , AGRM_AGR_YN
                                                 , CMBT_AGENT_CD
                                                 , FIRM_YN
                                                 , REGR_ID
                                                 , MODR_ID) VALUES 
                                                 ( @AGENT_ID
                                                 , @AGENT_NM
                                                 , @AGENT_REG_NO
                                                 , @CEO_NM
                                                 , @AGRM_AGR_YN
                                                 , @CMBT_AGENT_CD
                                                 , @FIRM_YN
                                                 , @REGR_ID
                                                 , @MODR_ID);`;
      await request.query(query);



      // 딜러 정보도 등록 한다.

      const dealer_insert_request = pool.request();
      dealer_insert_request.input("AGENT_ID", sql.VarChar, new_agent_id);
      dealer_insert_request.input("CombAgentCd", sql.VarChar, CombAgentCd);
      const dealer_insert_query = `INSERT INTO dbo.CJB_USR
                                          ( USR_ID
                                          , AGENT_ID
                                          , LOGIN_ID
                                          , LOGIN_PASSWD
                                          , USR_NM
                                          , USR_GRADE_CD
                                          , USR_PHON
                                          , USR_EMAIL
                                          , USR_STRT_DT
                                          , USR_END_DT
                                          , ZIP
                                          , ADDR1
                                          , ADDR2
                                          , USR_PHOTO_NM
                                          , TAX_SCT_CD
                                          , EMP_SN
                                          , EMP_BRNO
                                          , EMP_BNK_CD
                                          , EMP_ACTN
                                          , PUR_FEE_SCT_CD
                                          , SALE_FEE_SCT_CD
                                          , AGENT_CD
                                          , DLR_CD
                                          , LOGIN_IP
                                          , LAST_LOGIN_DTIME
                                          , REGR_ID
                                          , MODR_ID)
                                    SELECT dbo.CJB_FN_MK_USR_ID(@AGENT_ID) AS USR_ID  -- USR_ID            
                                        , @AGENT_ID                                  -- AGENT_ID          
                                        , NULL                                     -- LOGIN_ID          
                                        , NULL                                     -- LOGIN_PASSWD      
                                        , DL_NAME                                  -- USR_NM            
                                        , '0'                                      -- USR_GRADE_CD      
                                        , DL_TELNO                                 -- USR_PHON          
                                        , ''                                       -- USR_EMAIL         
                                        , DL_INDATE                                -- USR_STRT_DT       
                                        , DL_OUTDATE                               -- USR_END_DT        
                                        , DL_ZIP                                   -- ZIP               
                                        , DL_ADDR1                                 -- ADDR1             
                                        , DL_ADDR2                                 -- ADDR2             
                                        , ''                                       -- USR_PHOTO_NM      
                                        , '0'                                      -- TAX_SCT_CD        
                                        , DL_SNO                                   -- EMP_SN            
                                        , ''                                       -- EMP_BRNO          
                                        , ''                                       -- EMP_BNK_CD        
                                        , ''                                       -- EMP_ACTN          
                                        , '0'                                      -- PUR_FEE_SCT_CD    
                                        , '0'                                      -- SALE_FEE_SCT_CD   
                                        , DL_SANGSA_CODE                           -- AGENT_CD          
                                        , DL_CODE                                  -- DLR_CD            
                                        , ''                                       -- LOGIN_IP          
                                        , NULL                                     -- LAST_LOGIN_DTIME  
                                        , 'USER'                                   -- REGR_ID           
                                        , 'USER'                                   -- MODR_ID          
                                    FROM dbo.KU_DEALER
                                   WHERE DL_SANGSA_CODE = @CombAgentCd
                                    ;`;
      await dealer_insert_request.query(dealer_insert_query);

    }

    // usr_id 값 미리 생성 하고 해당 값을 넘기기. 함수는 CJB_FN_MK_USR_ID(상사ID)
    const usr_id_request = pool.request();
    usr_id_request.input("NewAgentId", sql.VarChar, new_agent_id); 
    const usr_id = await usr_id_request.query(`SELECT dbo.CJB_FN_MK_USR_ID(@NewAgentId) as usr_id`);
    const new_usr_id = usr_id.recordset[0].usr_id;

    const user_insert_request = pool.request();
    user_insert_request.input("usr_id", sql.VarChar, new_usr_id); 
    user_insert_request.input("agent_id", sql.VarChar, new_agent_id); 
    user_insert_request.input("login_id", sql.VarChar, UserId);
    user_insert_request.input("login_passwd", sql.VarChar, UserPw);
    user_insert_request.input("usr_nm", sql.VarChar, UsrNm);
    user_insert_request.input("email", sql.VarChar, Email);
    user_insert_request.input("phone", sql.VarChar, UsrTel);
    user_insert_request.input("agent_cd", sql.VarChar, CombAgentCd);
    user_insert_request.input("login_ip", sql.VarChar, "");

    console.log(new_usr_id);
    console.log(new_agent_id);
    console.log(UserId);
    console.log(UserPw);
    console.log(UsrNm);
    console.log(Email);
    console.log(UsrTel);
    console.log(CombAgentCd);
    console.log("");

    const query = `
         INSERT INTO dbo.CJB_USR ( USR_ID    --  사용자 ID           CJB_FN_MK_USR_ID(상사ID)
              , AGENT_ID                     --  상사 ID                        
              , LOGIN_ID                     --  로그인 ID            INPUT
              , LOGIN_PASSWD                 --  로그인 비밀번호       INPUT
              , USR_NM                       --  사용자 명            INPUT
              , USR_GRADE_CD                 --  사용자 등급코드       '9'
              , USR_PHON                     --  사용자 전화번호       INPUT          
              , USR_EMAIL                    --  사용자 이메일         INPUT
              , USR_STRT_DT                  --  사용자 시작 일자      GETDATE()
              , USR_END_DT                   --  사용자 종료 일자     '2999-12-31'
              , AGENT_CD                     --  상사 코드            input 존재하면 agent_id 값을 획득 가능함.  
              , LOGIN_IP                     --  로그인 IP      
            ) VALUES (  
                @usr_id
              , @agent_id
              , @login_id
              , @login_passwd
              , @usr_nm
              , '9'
              , @phone
              , @email
              , GETDATE()
              , '2999-12-31'
              , @agent_cd
              , @login_ip);`;


    console.log(query);

    await user_insert_request.query(query);
  } catch (err) {
    console.error("Error inserting register user:", err);
    throw err;
  }
};


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
    carAgent                 // 상사 ID              
  , purAmt                  // 매입금액
  , purSupPrc               // 공급가
  , purVat                  // 부가세
  , carPurDt                // 매입일   
  , agentPurCst             // 상사매입비
  , brokerageDate           // 상사매입비 입금일
  , gainTax                 // 취득세
  , carNm                   // 차량명
  , carNo                   // 차량번호(매입후)
  , purBefCarNo            // 차량번호(매입전)
  , ownrTpCd               // 소유자 유형 코드
  , ownrSsn                // 주민등록번호
  , ownrBrno               // 사업자등록번호
  , ownrNm                 // 고객명
  , ownrZip                // 우편번호
  , evdcCd                 // 증빙종류
  , carKndCd               // 차량 종류 코드
  , prsnSctCd              // 제시 구분 코드
  , ownrPhon               // 연락처
  , ownrEmail              // 이메일 아이디
  , emailDomain            // 이메일 도메인
  , txblIssuDt             // 세금계산서 발행 일자
  , purDesc                // 매입 설명
  , ownrAddr1              // 주소
  , ownrAddr2              // 상세주소
  , attachedFiles          // 관련 서류 첨부
  , usrId                  // 사용자 ID
  , dealerId               // 매입딜러
  , parkingCd              // 주차위치 코드
  , parkingLocationDesc    // 주차위치 설명
  , parkKeyNo              // 주차키 번호
  , fctCndcYn              // 사실 확인서 여부
  , txblRcvYn              // 매입계산서 수령 여부
  , ctshNo                 // 고객 번호
}) => {
  try {
    const request = pool.request();

    console.log("usrId:", usrId);

    // car_reg_id 값도 미리 만들기
    request.input("carAgent", sql.VarChar, carAgent); 
    const carRegId = await request.query(`SELECT dbo.CJB_FN_MK_CAR_REG_ID(@carAgent) as CAR_REG_ID`);
    const newCarRegId = carRegId.recordset[0].CAR_REG_ID;

    request.input("CAR_REG_ID", sql.VarChar, newCarRegId);                        // 차량 등록 ID         
    request.input("AGENT_ID", sql.VarChar, carAgent);                            // 상사 ID              
    request.input("DLR_ID", sql.VarChar, dealerId);                             // 딜러 ID              
    request.input("CAR_KND_CD", sql.VarChar, carKndCd);                         // 차량 종류 코드         
    request.input("PRSN_SCT_CD", sql.VarChar, prsnSctCd);                       // 제시 구분 코드       
    request.input("CAR_PUR_DT", sql.VarChar, carPurDt);                         // 차량 매입 일자       
    request.input("CAR_NO", sql.VarChar, carNo);                                // 차량 번호       
    request.input("PUR_BEF_CAR_NO", sql.VarChar, purBefCarNo);                 // 차량 번호 이전     
    request.input("CAR_NM", sql.VarChar, carNm);                               // 차량 명              
    request.input("PUR_EVDC_CD", sql.VarChar, evdcCd);                         // 증빙종류     
    request.input("OWNR_NM", sql.VarChar, ownrNm);                             // 소유자 명            
    request.input("OWNR_TP_CD", sql.VarChar, ownrTpCd);                        // 소유자 유형 명       
    request.input("OWNR_SSN", sql.VarChar, ownrSsn);                           // 소유자 주민등록번호  
    request.input("OWNR_BRNO", sql.VarChar, ownrBrno);                         // 소유자 사업자등록번호
    request.input("OWNR_PHON", sql.VarChar, ownrPhon);                         // 소유자 전화번호      
    request.input("OWNR_ZIP", sql.VarChar, ownrZip);                           // 소유자 주소          
    request.input("OWNR_ADDR1", sql.VarChar, ownrAddr1);                       // 소유자 주소1         
    request.input("OWNR_ADDR2", sql.VarChar, ownrAddr2);                       // 소유자 주소2         
    request.input("OWNR_EMAIL", sql.VarChar, ownrEmail + '@' + emailDomain);   // 소유자 이메일        
    request.input("PUR_AMT", sql.Int, purAmt);                                 // 매입금액액 금액            
    request.input("PUR_SUP_PRC", sql.Int, purSupPrc);                          // 공급가               
    request.input("PUR_VAT", sql.Int, purVat);                                 // 부가세               
    request.input("GAIN_TAX", sql.Int, gainTax);                              // 취득 세              
    request.input("AGENT_PUR_CST", sql.Int, agentPurCst);                     // 상사 매입 비         
    request.input("AGENT_PUR_CST_PAY_DT", sql.VarChar, brokerageDate);        // 상사 매입 비 입금일
    request.input("TXBL_RCV_YN", sql.VarChar, txblRcvYn);                     // 매입계산서 수령 여부 
    request.input("PURACSH_RCV_YN", sql.VarChar, txblRcvYn);                  // 매입계산서 수령 여부 
    request.input("TXBL_ISSU_DT", sql.VarChar, txblIssuDt);                   // 세금계산서 발행 일자 
    request.input("FCT_CNDC_YN", sql.VarChar, fctCndcYn);                     // 사실확인서 여부부 
    request.input("PUR_DESC", sql.VarChar, purDesc);                          // 매입 설명           
    request.input("TOT_PUR_FEE", sql.Int, 0);                                 // 총 매입 수수료       
    request.input("CUST_NO", sql.VarChar, ctshNo);                            // 고객 번              
    request.input("PARK_ZON_CD", sql.VarChar, parkingCd);                     // 주차 구역 코드       
    request.input("PARK_ZON_DESC", sql.VarChar, parkingLocationDesc);         // 주차 구역 설명       
    request.input("PARK_KEY_NO", sql.VarChar, parkKeyNo);                     // 주차 키 번호         
    request.input("REGR_ID", sql.VarChar, usrId);                            // 등록자 ID            
    request.input("MODR_ID", sql.VarChar, usrId);                            // 수정자 ID   

    const query = `INSERT INTO dbo.CJB_CAR_PUR (
                    CAR_REG_ID,
                    CAR_REG_DT,
                    --CAR_DEL_DT,
                    --CAR_STAT_CD,
                    --CAR_DEL_YN,
                    AGENT_ID,
                    DLR_ID,
                    CAR_KND_CD,
                    PRSN_SCT_CD,
                    CAR_PUR_DT,
                    --CAR_LOAN_CNT,
                    --CAR_LOAN_AMT,
                    CAR_NO,
                    PUR_BEF_CAR_NO,
                    --CAR_NEW_YN,
                    CAR_NM,
                    --CAR_CAT_NM,
                    --MFCP_NM,
                    --CAR_MNFT_DT,
                    --RUN_DSTN,
                    --CAR_YOM,
                    PUR_EVDC_CD,
                    OWNR_NM,
                    OWNR_TP_CD,
                    OWNR_SSN,
                    OWNR_BRNO,
                    OWNR_PHON,
                    OWNR_ZIP,
                    OWNR_ADDR1,
                    OWNR_ADDR2,
                    OWNR_EMAIL,
                    PUR_AMT,
                    PUR_SUP_PRC,
                    PUR_VAT,
                    GAIN_TAX,
                    AGENT_PUR_CST,
                    AGENT_PUR_CST_PAY_DT,
                    PURACSH_RCV_YN,
                    TXBL_RCV_YN,
                    TXBL_ISSU_DT,
                    FCT_CNDC_YN,                  
                    PUR_DESC,
                    TOT_PUR_FEE,
                    --TOT_PAY_FEE,
                    --TOT_CMRC_COST_FEE,
                    CUST_NO,
                    --PRSN_NO,
                    PARK_ZON_CD,
                    PARK_ZON_DESC,
                    PARK_KEY_NO,
                    REGR_ID,
                    MODR_ID
                  ) VALUES (
                    @CAR_REG_ID,
                    CONVERT(CHAR(10), GETDATE(), 23),
                    --@CAR_DEL_DT,
                    --@CAR_STAT_CD,
                    --@CAR_DEL_YN,
                    @AGENT_ID,
                    @DLR_ID,
                    @CAR_KND_CD,
                    @PRSN_SCT_CD,
                    @CAR_PUR_DT,
                    --@CAR_LOAN_CNT,
                    --@CAR_LOAN_AMT,
                    @CAR_NO,
                    @PUR_BEF_CAR_NO,
                    --@CAR_NEW_YN,
                    @CAR_NM,
                    --@CAR_CAT_NM,
                    --@MFCP_NM,
                    --@CAR_MNFT_DT,
                    --@RUN_DSTN,
                    --@CAR_YOM,
                    @PUR_EVDC_CD,
                    @OWNR_NM,
                    @OWNR_TP_CD,
                    @OWNR_SSN,
                    @OWNR_BRNO,
                    @OWNR_PHON,
                    @OWNR_ZIP,
                    @OWNR_ADDR1,
                    @OWNR_ADDR2,
                    @OWNR_EMAIL,
                    @PUR_AMT,
                    @PUR_SUP_PRC,
                    @PUR_VAT,
                    @GAIN_TAX,
                    @AGENT_PUR_CST,
                    @AGENT_PUR_CST_PAY_DT,
                    @PURACSH_RCV_YN,
                    @TXBL_RCV_YN,
                    @TXBL_ISSU_DT,
                    @FCT_CNDC_YN,
                    @PUR_DESC,
                    @TOT_PUR_FEE,
                    --@TOT_PAY_FEE,
                    --@TOT_CMRC_COST_FEE,
                    @CUST_NO,
                    --@PRSN_NO,
                    @PARK_ZON_CD,
                    @PARK_ZON_DESC,
                    @PARK_KEY_NO,
                    @REGR_ID,
                    @MODR_ID
                  )`;

    console.log("query:", query);

    attachedFiles.forEach(async (file) => {


      console.log("file:", file.name);
      console.log("file:", file.url);

      const fileRequest = pool.request();

      fileRequest.input("CAR_REG_ID", sql.VarChar, newCarRegId);
      fileRequest.input("FILE_NM", sql.VarChar, file.name);
      fileRequest.input("FILE_PATH", sql.VarChar, file.url);
      fileRequest.input("FILE_SCT_CD", sql.VarChar, 'P');
      fileRequest.input("FILE_KND_NM", sql.VarChar, 'P');
      fileRequest.input("AGENT_ID", sql.VarChar, carAgent);
      fileRequest.input("REGR_ID", sql.VarChar, usrId);
      fileRequest.input("MODR_ID", sql.VarChar, usrId);

      await fileRequest.query(`INSERT INTO CJB_FILE_INFO (
                                          AGENT_ID,
                                          FILE_SCT_CD,
                                          FILE_KND_NM,
                                          FILE_NM,
                                          FILE_PATH,
                                          CAR_REG_ID,
                                          REGR_ID,
                                          MODR_ID) VALUES (
                                          @AGENT_ID, 
                                          @FILE_SCT_CD, 
                                          @FILE_KND_NM, 
                                          @FILE_NM, 
                                          @FILE_PATH, 
                                          @CAR_REG_ID, 
                                          @REGR_ID, 
                                          @MODR_ID)`);

    });

    await request.query(query);

  } catch (err) {
    console.error("Error inserting suggest:", err);
    throw err;
  }
};



// 제시 직접 등록  - 이전코드드

/*
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


*/


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


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 상품화비 2.0
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 상품화비 등록
exports.insertCarGoodsFee = async ({ car_regid, expd_item_cd, expd_item_nm, expd_amt, expd_dt, expd_meth_cd, expd_evdc_cd, tax_sct_cd, txbl_issu_dt, rmrk, cash_recpt_rcgn_no, cash_mgmtkey, reg_dtime, regr_id, mod_dtime, modr_id, expd_sct_cd }) => {
  try {
    const request = pool.request();

    request.input("GOODS_FEE_SEQ", sql.VarChar, '');
    request.input("CAR_REG_ID", sql.VarChar, car_regid);
    request.input("EXPD_ITEM_CD", sql.VarChar, expd_item_cd); 
    request.input("EXPD_ITEM_NM", sql.VarChar, expd_item_nm);
    request.input("EXPD_SCT_CD", sql.VarChar, expd_sct_cd);
    request.input("EXPD_AMT", sql.Decimal, expd_amt);
    request.input("EXPD_DT", sql.VarChar, expd_dt);
    request.input("EXPD_METH_CD", sql.VarChar, expd_meth_cd);
    request.input("EXPD_EVDC_CD", sql.VarChar, expd_evdc_cd);
    request.input("TAX_SCT_CD", sql.VarChar, tax_sct_cd);
    request.input("TXBL_ISSU_DT", sql.VarChar, txbl_issu_dt);
    request.input("RMRK", sql.VarChar, rmrk);
    request.input("CASH_RECPT_RCGN_NO", sql.VarChar, cash_recpt_rcgn_no);
    request.input("CASH_MGMTKEY", sql.VarChar, cash_mgmtkey);
    request.input("REGR_ID", sql.VarChar, regr_id);
    request.input("MODR_ID", sql.VarChar, modr_id);

    const query = `INSERT INTO dbo.CJB_GOODS_FEE (
                          CAR_REG_ID,
                          EXPD_ITEM_CD,
                          EXPD_ITEM_NM,
                          EXPD_SCT_CD,
                          EXPD_AMT,
                          EXPD_DT,
                          EXPD_METH_CD,
                          EXPD_EVDC_CD,
                          TAX_SCT_CD,
                          TXBL_ISSU_DT,
                          RMRK,
                          CASH_RECPT_RCGN_NO,
                          CASH_MGMTKEY,
                          REG_DTIME,
                          REGR_ID,
                          MOD_DTIME,
                          MODR_ID
                  ) VALUES (
                          @CAR_REG_ID,
                          @EXPD_ITEM_CD,
                          @EXPD_ITEM_NM,
                          @EXPD_SCT_CD,
                          @EXPD_AMT,
                          @EXPD_DT,
                          @EXPD_METH_CD,
                          @EXPD_EVDC_CD,
                          @TAX_SCT_CD,
                          @TXBL_ISSU_DT,
                          @RMRK,
                          @CASH_RECPT_RCGN_NO,
                          @CASH_MGMTKEY,
                          getdate(),
                          @REGR_ID,
                          getdate(),
                          @MODR_ID
                  );`;

    await request.query(query);

  } catch (err) {
    console.error("Error inserting car goods fee:", err);
    throw err;
  }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


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