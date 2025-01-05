/**
 * @swagger
 * /api/popbill/v1/easyfinbank/registBankAccount:
 *   post:
 *     summary: 계좌 조회 - 계좌 등록
 *     description: 계좌조회 서비스를 이용할 계좌를 팝빌에 등록합니다. 계좌 등록 시 결제기간만큼 포인트가 차감됩니다.
 *     tags:
 *       - Popbill
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               CorpNum:
 *                 type: string
 *                 description: 팝빌회원 사업자번호 ('-' 제외, 10자리)
 *                 example: "1448122074"
 *               BankAccountInfo:
 *                 type: object
 *                 description: 등록할 계좌 객체 정보
 *                 properties:
 *                   BankCode:
 *                     type: string
 *                     description: 은행 기관코드 (4자리 숫자)
 *                     example: "0004"
 *                   AccountNumber:
 *                     type: string
 *                     description: 계좌번호
 *                     example: "35040204097077"
 *                   AccountPWD:
 *                     type: string
 *                     description: 계좌 비밀번호
 *                     example: "1111"
 *                   AccountType:
 *                     type: string
 *                     description: 계좌 유형 (법인 or 개인)
 *                     example: "법인"
 *                   IdentityNumber:
 *                     type: string
 *                     description: 예금주 식별정보 ('-' 제외)
 *                     example: "1448122074"
 *                   AccountName:
 *                     type: string
 *                     description: 계좌 별칭
 *                     example: "업무용 계좌"
 *                   BankID:
 *                     type: string
 *                     description: 인터넷뱅킹 아이디 (국민은행의 경우 필수)
 *                     example: "sonsj2008"
 *                   FastID:
 *                     type: string
 *                     description: 조회전용 계정 아이디 (특정 은행의 경우 필수)
 *                     example: "fastid001"
 *                   FastPWD:
 *                     type: string
 *                     description: 조회전용 계정 비밀번호 (특정 은행의 경우 필수)
 *                     example: "fastpwd1234"
 *                   UsePeriod:
 *                     type: number
 *                     description: 정액제 이용할 개월수
 *                     example: 12
 *                   Memo:
 *                     type: string
 *                     description: 메모
 *                     example: "추가 메모 내용"
 *               UserID:
 *                 type: string
 *                 description: 팝빌회원 아이디
 *                 example: "winexsoft"
 *     responses:
 *       200:
 *         description: 계좌 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "계좌 등록 성공"
 *                 data:
 *                   type: object
 *                   description: 팝빌 API 응답 데이터
 *       400:
 *         description: 필수 파라미터 누락
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "필수 파라미터가 누락되었습니다."
 *       500:
 *         description: 서버 오류 또는 등록 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "계좌 등록 실패"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       description: 팝빌 에러 코드
 *                       example: -10004003
 *                     message:
 *                       type: string
 *                       description: 팝빌 에러 메시지
 *                       example: "이미 등록된 계좌입니다."
 */


/**
 * @swagger
 * /api/popbill/v1/easyfinbank/updateBankAccount:
 *   post:
 *     summary: 계좌 조회 - 계좌 정보 수정
 *     description: 팝빌에 등록된 계좌 정보를 수정합니다.
 *     tags:
 *       - Popbill
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               CorpNum:
 *                 type: string
 *                 description: 팝빌회원 사업자번호 ('-' 제외, 10자리)
 *                 example: "1448122074"
 *               BankCode:
 *                 type: string
 *                 description: 은행 기관코드 (4자리 숫자)
 *                 example: "0004"
 *               AccountNumber:
 *                 type: string
 *                 description: 계좌번호
 *                 example: "35040204097077"
 *               BankAccountInfo:
 *                 type: object
 *                 description: 수정할 계좌 객체 정보
 *                 properties:
 *                   AccountPWD:
 *                     type: string
 *                     description: 계좌 비밀번호
 *                     example: "1111"
 *                   AccountName:
 *                     type: string
 *                     description: 계좌 별칭
 *                     example: "수정된 계좌 별칭"
 *                   BankID:
 *                     type: string
 *                     description: 인터넷뱅킹 아이디 (국민은행의 경우 필수)
 *                     example: "sonsj2008"
 *                   FastID:
 *                     type: string
 *                     description: 조회전용 계정 아이디 (특정 은행의 경우 필수 대구은행, 신한은행, 신협)
 *                     example: "fastid001"
 *                   FastPWD:
 *                     type: string
 *                     description: 조회전용 계정 비밀번호 (특정 은행의 경우 필수 대구은행, 신한은행, 신협)
 *                     example: "fastpwd1234"
 *                   Memo:
 *                     type: string
 *                     description: 메모
 *                     example: "계좌 정보 수정 요청"
 *               UserID:
 *                 type: string
 *                 description: 팝빌회원 아이디
 *                 example: "winexsoft"
 *     responses:
 *       200:
 *         description: 계좌 정보 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "계좌 정보 수정 성공"
 *                 data:
 *                   type: object
 *                   description: 팝빌 API 응답 데이터
 *       400:
 *         description: 필수 파라미터 누락
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "필수 파라미터가 누락되었습니다."
 *       500:
 *         description: 서버 오류 또는 수정 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "계좌 정보 수정 실패"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       description: 팝빌 에러 코드
 *                       example: -10004004
 *                     message:
 *                       type: string
 *                       description: 팝빌 에러 메시지
 *                       example: "수정할 계좌 정보가 유효하지 않습니다."
 */

/**
 * @swagger
 * api/popbill/v1/easyfinbank/getTransactionHistory:
 *   post:
 *     summary: 거래 조회 - 거래 내역 조회
 *     description: 작업아이디(JobID)를 활용하여 계좌 거래 내역을 조회합니다.
 *     tags:
 *       - Popbill
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               CorpNum:
 *                 type: string
 *                 description: 팝빌회원 사업자번호 ('-' 제외)
 *                 example: "1448122074"
 *               JobID:
 *                 type: string
 *                 description: 작업아이디 (RequestJob의 반환값)
 *                 example: "012345678901234567"
 *               TradeType:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [I, O]
 *                 description: 거래유형 (다중선택 가능) - I 입금, O 출금
 *                 example: ["I", "O"]
 *               SearchString:
 *                 type: string
 *                 description: 조회 검색어 (예 입금 메모)
 *                 example: "입금 메모"
 *               Page:
 *                 type: number
 *                 description: 목록 페이지번호
 *                 example: 1
 *               PerPage:
 *                 type: number
 *                 description: 페이지당 표시할 목록 건수 (최대 1,000건)
 *                 example: 500
 *               Order:
 *                 type: string
 *                 description: 정렬 방향 - D 내림차순, A 오름차순
 *                 enum: [D, A]
 *                 example: "D"
 *               UserID:
 *                 type: string
 *                 description: 팝빌회원 아이디
 *                 example: "winexsoft"
 *     responses:
 *       200:
 *         description: 성공적으로 거래 내역을 조회
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "거래 내역 조회 성공"
 *                 data:
 *                   type: object
 *                   description: 거래 내역 결과 데이터
 *                   properties:
 *                     list:
 *                       type: array
 *                       description: 거래 내역 리스트
 *                       items:
 *                         type: object
 *                     total:
 *                       type: number
 *                       description: 전체 거래 내역 수
 *                       example: 100
 *                     page:
 *                       type: number
 *                       description: 현재 페이지 번호
 *                       example: 1
 *                     perPage:
 *                       type: number
 *                       description: 페이지당 표시 건수
 *                       example: 500
 *                     order:
 *                       type: string
 *                       description: 정렬 방향
 *                       example: "D"
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "거래 내역 조회 실패"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "500"
 *                     message:
 *                       type: string
 *                       example: "서버 오류 발생"
 */

/**
 * @swagger
 * /api/popbill/v1/easyfinbank/requestJob:
 *   post:
 *     summary: 계좌 조회 - 계좌 거래내역 수집 요청
 *     description: 계좌 거래내역을 확인하기 위해 팝빌에 수집요청을 합니다. (조회기간 단위 최대 1개월, 최대 3개월 이전 내역까지 조회 가능)
 *     tags:
 *       - Popbill
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               CorpNum:
 *                 type: string
 *                 description: 팝빌회원 사업자번호 ('-' 제외)
 *                 example: "1448122074"
 *               BankCode:
 *                 type: string
 *                 description: 은행 기관코드
 *                 example: "0004"
 *               AccountNumber:
 *                 type: string
 *                 description: 계좌번호
 *                 example: "12345678901234"
 *               SDate:
 *                 type: string
 *                 description: 조회 기간의 시작일자 (yyyyMMdd)
 *                 example: "20250101"
 *               EDate:
 *                 type: string
 *                 description: 조회 기간의 종료일자 (yyyyMMdd)
 *                 example: "20250131"
 *               UserID:
 *                 type: string
 *                 description: 팝빌회원 아이디
 *                 example: "winexsoft"
 *     responses:
 *       200:
 *         description: 거래내역 수집 요청 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "거래내역 수집 요청 성공"
 *                 data:
 *                   type: object
 *                   description: 작업 아이디 및 관련 데이터
 *                   example:
 *                     jobID: "012345678901234567"
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "거래내역 수집 요청 실패"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "500"
 *                     message:
 *                       type: string
 *                       example: "서버 오류 발생"
 */

