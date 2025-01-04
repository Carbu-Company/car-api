/**
 * @swagger
 * /api/popbill/v1/cashbill/registIssue:
 *   post:
 *     summary: "현금영수증 - 즉시발행"
 *     description: "Popbill API를 이용해 현금영수증을 발행합니다."
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
 *                 description: "발행 회사의 사업자번호"
 *                 example: "1448122074"
 *               Cashbill:
 *                 type: object
 *                 description: "현금영수증 정보 객체"
 *                 properties:
 *                   mgtKey:
 *                     type: string
 *                     description: "현금영수증 관리번호"
 *                     example: "20250101-001"
 *                   orgConfirmNum:
 *                     type: string
 *                     description: "원본 확인번호"
 *                     example: "123456789"
 *                   orgTradeDate:
 *                     type: string
 *                     description: "원본 거래일자"
 *                     example: "20240101"
 *                   tradeDT:
 *                     type: string
 *                     description: "거래일시"
 *                     example: "20250101123000"
 *                   tradeType:
 *                     type: string
 *                     description: "거래유형"
 *                     example: "승인거래"
 *                   tradeUsage:
 *                     type: string
 *                     description: "사용용도"
 *                     example: "소득공제용"
 *                   tradeOpt:
 *                     type: string
 *                     description: "거래옵션"
 *                     example: "일반"
 *                   taxationType:
 *                     type: string
 *                     description: "과세유형"
 *                     example: "과세"
 *                   totalAmount:
 *                     type: string
 *                     description: "총금액"
 *                     example: "100000"
 *                   supplyCost:
 *                     type: string
 *                     description: "공급가액"
 *                     example: "90909"
 *                   tax:
 *                     type: string
 *                     description: "부가세"
 *                     example: "9091"
 *                   serviceFee:
 *                     type: string
 *                     description: "봉사료"
 *                     example: "0"
 *                   franchiseCorpNum:
 *                     type: string
 *                     description: "가맹점 사업자번호"
 *                     example: "1448122074"
 *                   franchiseTaxRegID:
 *                     type: string
 *                     description: "가맹점 세금 등록 ID"
 *                     example: "0001"
 *                   franchiseCorpName:
 *                     type: string
 *                     description: "가맹점 상호"
 *                     example: "가맹점 상호"
 *                   franchiseCEOName:
 *                     type: string
 *                     description: "가맹점 대표자명"
 *                     example: "홍길동"
 *                   franchiseAddr:
 *                     type: string
 *                     description: "가맹점 주소"
 *                     example: "서울특별시 중구 세종대로 110"
 *                   franchiseTEL:
 *                     type: string
 *                     description: "가맹점 전화번호"
 *                     example: "01012345678"
 *                   identityNum:
 *                     type: string
 *                     description: "신원번호"
 *                     example: "0100001234"
 *                   customerName:
 *                     type: string
 *                     description: "고객 이름"
 *                     example: "김철수"
 *                   itemName:
 *                     type: string
 *                     description: "상품명"
 *                     example: "상품명 예시"
 *                   orderNumber:
 *                     type: string
 *                     description: "주문번호"
 *                     example: "ORDER1234"
 *                   email:
 *                     type: string
 *                     description: "고객 이메일"
 *                     example: "customer@example.com"
 *                   hp:
 *                     type: string
 *                     description: "고객 휴대폰번호"
 *                     example: "01098765432"
 *                   smssendYN:
 *                     type: boolean
 *                     description: "SMS 발송 여부"
 *                     example: true
 *                   cancelType:
 *                     type: integer
 *                     description: "취소 유형"
 *                     example: 1
 *                   memo:
 *                     type: string
 *                     description: "발행 메모"
 *                     example: "현금영수증 발행 메모"
 *                   emailSubject:
 *                     type: string
 *                     description: "이메일 제목"
 *                     example: "현금영수증 발행 안내메일 제목"
 *               Memo:
 *                 type: string
 *                 description: "발행 메모"
 *                 example: "즉시 발행 테스트"
 *               UserID:
 *                 type: string
 *                 description: "Popbill 회원 아이디"
 *                 example: "winexsoft"
 *               EmailSubject:
 *                 type: string
 *                 description: "이메일 제목"
 *                 example: "발행 안내메일"
 *     responses:
 *       200:
 *         description: "발행 성공"
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
 *                   example: "현금영수증 발행 성공"
 *                 data:
 *                   type: object
 *                   example: { receiptNum: "1234567890" }
 *       500:
 *         description: "발행 실패 또는 서버 오류"
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
 *                   example: "현금영수증 발행 실패"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "500"
 *                     message:
 *                       type: string
 *                       example: "Popbill API 오류 메시지"
 */

/**
 * @swagger
 * /api/popbill/v1/cashbill/revokeRegistIssue:
 *   post:
 *     summary: 현금영수증 - 취소 발행
 *     description: 기존에 발행된 현금영수증을 취소하기 위해 팝빌 API를 호출합니다.
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
 *                 description: 팝빌 회원 사업자번호 (10자리, '-' 제외)
 *                 example: "1448122074"
 *               MgtKey:
 *                 type: string
 *                 description: 파트너가 할당한 문서번호
 *                 example: "20250101-001"
 *               OrgConfirmNum:
 *                 type: string
 *                 description: 당초 승인 현금영수증의 국세청 승인번호
 *                 example: "1448122074"
 *               OrgTradeDate:
 *                 type: string
 *                 description: 당초 승인 현금영수증의 거래일자 (yyyyMMdd)
 *                 example: "20240101"
 *               SMSSendYN:
 *                 type: boolean
 *                 description: 발행 시 알림문자 전송 여부
 *                 example: false
 *               Memo:
 *                 type: string
 *                 description: 발행 메모
 *                 example: "거래 취소로 인한 발행"
 *               IsPartCancel:
 *                 type: boolean
 *                 description: "부분 취소 여부 (true: 부분 취소, false: 전체 취소)"
 *                 example: false
 *               CancelType:
 *                 type: integer
 *                 description: "취소 사유 코드 (1: 거래취소, 2: 오류발급취소, 3: 기타)"
 *                 example: 1
 *               SupplyCost:
 *                 type: string
 *                 description: 부분 취소 공급가액 (부분 취소 시 필수)
 *                 example: "50000"
 *               Tax:
 *                 type: string
 *                 description: 부분 취소 부가세 (부분 취소 시 필수)
 *                 example: "5000"
 *               ServiceFee:
 *                 type: string
 *                 description: 부분 취소 봉사료 (부분 취소 시 필수)
 *                 example: "0"
 *               TotalAmount:
 *                 type: string
 *                 description: 부분 취소 총 거래금액 (공급가액 + 부가세 + 봉사료, 부분 취소 시 필수)
 *                 example: "55000"
 *               UserID:
 *                 type: string
 *                 description: 팝빌 회원 아이디
 *                 example: "winexsoft"
 *               EmailSubject:
 *                 type: string
 *                 description: 발행 안내 메일 제목
 *                 example: "취소 현금영수증 발행 안내"
 *               TradeDT:
 *                 type: string
 *                 description: 거래 일시 (yyyyMMddHHmmss, 전날부터 당일까지 입력 가능)
 *                 example: "20250101123000"
 *     responses:
 *       200:
 *         description: 성공적으로 취소 현금영수증이 발행됨
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
 *                   example: "취소 현금영수증 발행 성공"
 *                 data:
 *                   type: object
 *                   description: 발행 결과 데이터
 *       500:
 *         description: 발행 실패
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
 *                   example: "취소 현금영수증 발행 실패"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: -110
 *                     message:
 *                       type: string
 *                       example: "필수 값 누락"
 */

/**
 * @swagger
 * /api/popbill/v1/cashbill/getInfo:
 *   post:
 *     summary: 현금영수증 - 상태 확인
 *     description: 특정 현금영수증의 상태 및 요약 정보를 확인합니다.
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
 *                 description: 팝빌 회원 사업자번호 ('-' 제외, 10자리)
 *                 example: "1448122074"
 *               MgtKey:
 *                 type: string
 *                 description: 파트너가 할당한 문서번호
 *                 example: "20250101-001"
 *               UserID:
 *                 type: string
 *                 description: 팝빌 회원 아이디 (선택사항)
 *                 example: "winexsoft"
 *     responses:
 *       200:
 *         description: 현금영수증 상태 확인 성공
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
 *                   example: "현금영수증 상태 확인 성공"
 *                 data:
 *                   type: object
 *                   properties:
 *                     itemKey:
 *                       type: string
 *                       description: 팝빌에서 부여한 고유 키
 *                       example: "025010200352800001"
 *                     mgtKey:
 *                       type: string
 *                       description: 파트너가 할당한 문서번호
 *                       example: "20250101-001"
 *                     tradeDate:
 *                       type: string
 *                       description: 거래일자 (yyyyMMdd)
 *                       example: "20250101"
 *                     tradeDT:
 *                       type: string
 *                       description: 거래일시 (yyyyMMddHHmmss)
 *                       example: "20250101123000"
 *                     tradeType:
 *                       type: string
 *                       description: 거래 유형 (승인거래/취소거래)
 *                       example: "승인거래"
 *                     tradeUsage:
 *                       type: string
 *                       description: 거래 구분 (소득공제용/지출증빙용)
 *                       example: "소득공제용"
 *                     tradeOpt:
 *                       type: string
 *                       description: 거래 유형 옵션 (일반/도서공연/대중교통)
 *                       example: "일반"
 *                     taxationType:
 *                       type: string
 *                       description: 과세 형태 (과세/비과세)
 *                       example: "과세"
 *                     totalAmount:
 *                       type: string
 *                       description: 거래 총 금액
 *                       example: "100000"
 *                     issueDT:
 *                       type: string
 *                       description: 발행 일시 (yyyyMMddHHmmss)
 *                       example: "20250102003528"
 *                     regDT:
 *                       type: string
 *                       description: 등록 일시 (yyyyMMddHHmmss)
 *                       example: "20250102003528"
 *                     stateCode:
 *                       type: integer
 *                       description: 현금영수증 상태 코드
 *                       example: 304
 *                     stateDT:
 *                       type: string
 *                       description: 상태 변경 일시 (yyyyMMddHHmmss)
 *                       example: "20250102003528"
 *                     identityNum:
 *                       type: string
 *                       description: 식별 번호
 *                       example: "010***1234"
 *                     itemName:
 *                       type: string
 *                       description: 주문 상품명
 *                       example: "상품명 예시"
 *                     customerName:
 *                       type: string
 *                       description: 구매자 성명
 *                       example: "김철수"
 *                     confirmNum:
 *                       type: string
 *                       description: 국세청 승인번호
 *                       example: "TB0000034"
 *                     ntssendDT:
 *                       type: string
 *                       description: 국세청 전송 일시 (yyyyMMddHHmmss)
 *                       example: "20250103000000"
 *                     ntsresultDT:
 *                       type: string
 *                       description: 국세청 처리 결과 수신 일시 (yyyyMMddHHmmss)
 *                       example: "20250103091508"
 *                     ntsresultCode:
 *                       type: string
 *                       description: 국세청 처리 결과 코드
 *                       example: "0000"
 *                     ntsresultMessage:
 *                       type: string
 *                       description: 국세청 처리 결과 메시지
 *                       example: "더미승인"
 *                     printYN:
 *                       type: boolean
 *                       description: 인쇄 여부
 *                       example: false
 *                     interOPYN:
 *                       type: boolean
 *                       description: 연동 문서 여부
 *                       example: true
 *                     stateMemo:
 *                       type: string
 *                       description: 상태 메모
 *                       example: "즉시 발행 테스트"
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
 *                   example: "필수 파라미터(CorpNum, MgtKey)가 누락되었습니다."
 *       500:
 *         description: 현금영수증 상태 확인 실패
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
 *                   example: "현금영수증 상태 확인 실패"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       description: 팝빌 에러 코드
 *                       example: -110
 *                     message:
 *                       type: string
 *                       description: 에러 메시지
 *                       example: "문서번호가 존재하지 않습니다."
 */

