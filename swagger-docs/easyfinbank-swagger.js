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

