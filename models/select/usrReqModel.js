const sql = require("mssql");
const pool = require("../../config/db");


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 시스템 사용 요청 조회
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 시스템 사용 요청 조회
exports.getSystemUseRequest = async ({ agentId }) => {
  try {
    const request = pool.request();
    request.input("CAR_AGENT", sql.VarChar, agentId);  

    const query = `SELECT DBO.SMJ_FN_MK_AGENT() as agent,
                          CONVERT(VARCHAR(10), DATEADD(DAY, 3650, GETDATE()), 21) as alive_dt,
                          COUNT(*) cnt
                     FROM SMJ_USER
                    WHERE LOGINID = 'SS';
                    `;  

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching system use request:", err);
    throw err;
  }
};

 // 조합상사코드 조회
exports.checkSangsaCode = async ({ SangsaCode }) => {
  try {
    const request = pool.request();
    request.input("SS_CODE", sql.VarChar, SangsaCode);  

    const query = `SELECT COUNT(*) CNT
                     FROM KU_SANGSA
                    WHERE SS_CODE = @SS_CODE;`;
    const result = await request.query(query);
    
    console.log("SangsaCode:", SangsaCode);
    console.log("result:", result.recordset[0].CNT);
    return result.recordset[0].CNT  ;

  } catch (err) {
    console.error("Error fetching sangsa code:", err);
    throw err;
  }
};

// 인증번호 조회
exports.getPhoneAuthNumber = async ({ representativePhone }) => {
  try {
    const request = pool.request();
    request.input("AUTH_PHONE", sql.VarChar, representativePhone);  

    const query = `SELECT FLOOR(RAND() * 9000 + 1000) AS NUM;`;
    const result = await request.query(query);
    return result.recordset[0].NUM  ;
  } catch (err) {
    console.error("Error fetching auth number:", err);
    throw err;
  }
};

// 인증번호 확인 조회
exports.checkPhoneAuthNumber = async ({ representativePhone, authNumber }) => {
  try {
    const request = pool.request();
    request.input("AUTH_PHONE", sql.VarChar, representativePhone);  
    request.input("CERT_NO", sql.Int, authNumber);

    const query = `SELECT top 1 cert_no FROM CJB_CERT_NO_REG where cell_no = @AUTH_PHONE and cert_no = @CERT_NO order by strt_dtime DESC `; 

    const result = await request.query(query);
    return result.recordset[0].cert_no;
  } catch (err) {
    console.error("Error fetching auth number:", err);
    throw err;
  }
};

// 사용 요청 등록
exports.registerUser = async ({
  AgentNm,
  AgentRegNo,
  CeoNm,
  Email,
  CombAgentCd,
  UserId,
  UserPw,
  UsrNm,
  UsrTel
}) => {
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
        const agentId = await agent_id_request.query(`SELECT AGENT_ID FROM dbo.CJB_AGENT WHERE CMBT_AGENT_CD = @CombAgentCd`);
        new_agent_id = agentId.recordset[0].AGENT_ID;
  
        console.log("agentId:", new_agent_id);
      }
      else {
        // 존재하지 않으면 agentId 값 미리 생성 하고 해당 값을 넘기기. 함수는 CJB_FN_MK_AGENT_ID()
        const agent_id_request = pool.request();
        const agentId = await agent_id_request.query(`SELECT dbo.CJB_FN_MK_AGENT_ID() as agentId`);
        new_agent_id = agentId.recordset[0].agentId;
        console.log("new_agent_id:", new_agent_id);
  
        // 상사 정보 저장 처리 함수 
        request.input("AGENT_ID", sql.VarChar, new_agent_id);
        request.input("AGENT_NM", sql.VarChar, AgentNm);
        request.input("AGENT_REG_NO", sql.VarChar, AgentRegNo);
        request.input("CEO_NM", sql.VarChar, CeoNm);
        request.input("AGRM_AGR_YN", sql.VarChar, 'Y');
        request.input("CMBT_AGENT_CD", sql.VarChar, CombAgentCd);
        request.input("AEMP_ID", sql.VarChar, UserId);   // 담당자 ID
        request.input("FIRM_YN", sql.VarChar, 'N');
        request.input("REGR_ID", sql.VarChar, 'ADMIN');
        request.input("MODR_ID", sql.VarChar, 'ADMIN');
  
        const query = `INSERT INTO dbo.CJB_AGENT (AGENT_ID
                                                   , AGENT_NM
                                                   , BRNO
                                                   , PRES_NM
                                                   , AGRM_AGR_YN
                                                   , CMBT_AGENT_CD
                                                   , AEMP_ID
                                                   , FIRM_YN
                                                   , REGR_ID
                                                   , MODR_ID) VALUES 
                                                   ( @AGENT_ID
                                                   , @AGENT_NM
                                                   , @AGENT_REG_NO
                                                   , @CEO_NM
                                                   , @AGRM_AGR_YN
                                                   , @CMBT_AGENT_CD
                                                   , @AEMP_ID
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
                                            , ADMIN_CONF_YN    -- 관리자 승인여부
                                            , SYS_ADMIN_YN     -- 시스템 관리자 여부
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
                                          , 'N'                                      -- ADMIN_CONF_YN     
                                          , 'N'                                      -- SYS_ADMIN_YN      
                                          , ''                                       -- LOGIN_IP          
                                          , NULL                                     -- LAST_LOGIN_DTIME  
                                          , 'ADMIN'                                  -- REGR_ID           
                                          , 'ADMIN'                                  -- MODR_ID          
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
      user_insert_request.input("agentId", sql.VarChar, new_agent_id); 
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
                , ADMIN_CONF_YN                --  관리자 승인여부       'N'
                , SYS_ADMIN_YN                 --  시스템 관리자 여부     'N'
                , USR_PHON                     --  사용자 전화번호       INPUT          
                , USR_EMAIL                    --  사용자 이메일         INPUT
                , USR_STRT_DT                  --  사용자 시작 일자      GETDATE()
                , USR_END_DT                   --  사용자 종료 일자     '2999-12-31'
                , AGENT_CD                     --  상사 코드            input 존재하면 agentId 값을 획득 가능함.  
                , LOGIN_IP                     --  로그인 IP      
              ) VALUES (  
                  @usr_id
                , @agentId
                , @login_id
                , @login_passwd
                , @usr_nm
                , '9'
                , 'N'
                , 'N'
                , @phone
                , @email
                , GETDATE()
                , NULL --'2999-12-31'
                , @agent_cd
                , NULL --@login_ip
                );`;
  
  
      console.log(query);
  
      await user_insert_request.query(query);
    } catch (err) {
      console.error("Error inserting register user:", err);
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
  