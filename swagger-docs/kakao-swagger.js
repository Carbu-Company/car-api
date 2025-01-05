/**
 * @swagger
 * /api/popbill/v1/kakao/listPlusFriendID:
 *   post:
 *     summary: 카톡 - 카카오톡 채널 목록 확인
 *     description: 팝빌에 등록한 연동회원의 카카오톡 채널 목록을 확인합니다.
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
 *               UserID:
 *                 type: string
 *                 description: 팝빌회원 아이디
 *                 example: "winexsoft"
 *     responses:
 *       200:
 *         description: 카카오톡 채널 목록 조회 성공
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
 *                   example: "카카오톡 채널 목록 조회 성공"
 *                 data:
 *                   type: array
 *                   description: 카카오톡 채널 목록
 *                   items:
 *                     type: object
 *                     properties:
 *                       plusFriendID:
 *                         type: string
 *                         description: 카카오톡 채널 ID
 *                         example: "@plusfriend"
 *                       plusFriendName:
 *                         type: string
 *                         description: 카카오톡 채널 이름
 *                         example: "Plus Friend Name"
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
 *                   example: "카카오톡 채널 목록 조회 실패"
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
 * /api/popbill/v1/kakao/getPlusFriendMgtURL:
 *   post:
 *     summary: 카톡 - 카카오톡 채널 관리 팝업 URL 조회
 *     description: 카카오톡 채널을 등록하고 내역을 확인하는 관리 페이지 팝업 URL을 반환합니다. 반환된 URL은 30초 동안 유효합니다.
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
 *               UserID:
 *                 type: string
 *                 description: 팝빌회원 아이디
 *                 example: "winexsoft"
 *     responses:
 *       200:
 *         description: 카카오톡 채널 관리 팝업 URL 조회 성공
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
 *                   example: "카카오톡 채널 관리 URL 조회 성공"
 *                 data:
 *                   type: string
 *                   description: 카카오톡 채널 관리 팝업 URL
 *                   example: "https://www.popbill.com/Link?SessionID=..."
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
 *                   example: "카카오톡 채널 관리 URL 조회 실패"
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
 * /api/popbill/v1/kakao/getATSTemplateMgtURL:
 *   post:
 *     summary: 카톡 - 알림톡 템플릿 관리 팝업 URL 조회
 *     description: 알림톡 템플릿을 신청하고 승인심사 결과를 확인하며 등록 내역을 확인하는 관리 페이지 팝업 URL을 반환합니다. 반환된 URL은 30초 동안 유효합니다.
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
 *               UserID:
 *                 type: string
 *                 description: 팝빌회원 아이디
 *                 example: "winexsoft"
 *     responses:
 *       200:
 *         description: 알림톡 템플릿 관리 팝업 URL 조회 성공
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
 *                   example: "알림톡 템플릿 관리 URL 조회 성공"
 *                 data:
 *                   type: string
 *                   description: 알림톡 템플릿 관리 팝업 URL
 *                   example: "https://www.popbill.com/Link?SessionID=..."
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
 *                   example: "알림톡 템플릿 관리 URL 조회 실패"
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
 * /api/popbill/v1/kakao/sendATS_one:
 *   post:
 *     summary: 카톡 - 알림톡 단건 전송
 *     description: 승인된 템플릿의 내용을 작성하여 1건의 알림톡을 팝빌에 접수합니다. 전송 실패 시 'altSendType' 값에 따라 대체문자를 전송할 수 있습니다.
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
 *               templateCode:
 *                 type: string
 *                 description: 승인된 알림톡 템플릿 코드
 *                 example: "019021000000"
 *               Sender:
 *                 type: string
 *                 description: 발신번호 (대체문자 전송 시 필수)
 *                 example: "07012345678"
 *               content:
 *                 type: string
 *                 description: 알림톡 내용 (템플릿 내용의 변수 치환 필요, 최대 1000자)
 *                 example: "주문하신 #{상품}이 금일 발송 처리되었습니다."
 *               altSubject:
 *                 type: string
 *                 description: 대체문자 제목 (90byte 이상 메시지에만 적용)
 *                 example: "대체문자 제목"
 *               altContent:
 *                 type: string
 *                 description: 대체문자 내용
 *                 example: "주문하신 상품이 발송되었습니다."
 *               altSendType:
 *                 type: string
 *                 description: 대체문자 유형 (C 알림톡 내용, A 대체문자 내용, 기본값 미전송)
 *                 example: "A"
 *               sndDT:
 *                 type: string
 *                 description: 전송 예약일시 (형식 yyyyMMddHHmmss, 기본값 즉시 전송)
 *                 example: "20250101123000"
 *               receiver:
 *                 type: string
 *                 description: 수신번호
 *                 example: "01012345678"
 *               receiverName:
 *                 type: string
 *                 description: 수신자명
 *                 example: "홍길동"
 *               UserID:
 *                 type: string
 *                 description: 팝빌회원 아이디
 *                 example: "winexsoft"
 *               requestNum:
 *                 type: string
 *                 description: 요청번호 (파트너가 접수 단위를 식별하기 위해 사용)
 *                 example: "REQ001"
 *               btns:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     n:
 *                       type: string
 *                       description: 버튼 이름
 *                       example: "주문 상세"
 *                     t:
 *                       type: string
 *                       description: 버튼 유형 (WL 웹링크, AL 앱링크, BK 상담톡 전환, MD 메시지 전달)
 *                       example: "WL"
 *                     u1:
 *                       type: string
 *                       description: 버튼 링크1 (모바일)
 *                       example: "https://m.example.com"
 *                     u2:
 *                       type: string
 *                       description: 버튼 링크2 (PC)
 *                       example: "https://www.example.com"
 *     responses:
 *       200:
 *         description: 알림톡 단건 전송 성공
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
 *                   example: "알림톡 단건 전송 성공"
 *                 data:
 *                   type: object
 *                   description: 전송 결과 데이터
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
 *                   example: "알림톡 단건 전송 실패"
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
 * /api/popbill/v1/kakao/sendATS_multi:
 *   post:
 *     summary: 카톡 - 알림톡 대량 전송
 *     description: 승인된 템플릿의 내용을 작성하여 다수건의 알림톡을 팝빌에 접수합니다. 최대 1,000건까지 전송할 수 있으며, 실패 시 대체문자를 전송할 수 있습니다.
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
 *               templateCode:
 *                 type: string
 *                 description: 승인된 알림톡 템플릿 코드
 *                 example: "019021000000"
 *               Sender:
 *                 type: string
 *                 description: 발신번호 (대체문자 전송 시 필수)
 *                 example: "07012345678"
 *               altSendType:
 *                 type: string
 *                 description: 대체문자 유형 (C 알림톡 내용, A 대체문자 내용, 기본값 미전송)
 *                 example: "A"
 *               sndDT:
 *                 type: string
 *                 description: 전송 예약일시 (형식 yyyyMMddHHmmss, 기본값 즉시 전송)
 *                 example: "20250101123000"
 *               msgs:
 *                 type: array
 *                 description: 전송 정보 (최대 1,000건)
 *                 items:
 *                   type: object
 *                   properties:
 *                     receiver:
 *                       type: string
 *                       description: 수신번호
 *                       example: "01012345678"
 *                     receiverName:
 *                       type: string
 *                       description: 수신자명
 *                       example: "홍길동"
 *                     content:
 *                       type: string
 *                       description: 알림톡 내용 (템플릿 내용의 변수 치환 필요)
 *                       example: "주문하신 #{상품}이 금일 발송 처리되었습니다."
 *                     altSubject:
 *                       type: string
 *                       description: 대체문자 제목
 *                       example: "대체문자 제목"
 *                     altContent:
 *                       type: string
 *                       description: 대체문자 내용
 *                       example: "주문하신 상품이 발송되었습니다."
 *               UserID:
 *                 type: string
 *                 description: 팝빌회원 아이디
 *                 example: "winexsoft"
 *               requestNum:
 *                 type: string
 *                 description: 요청번호 (파트너가 접수 단위를 식별하기 위해 사용)
 *                 example: "REQ001"
 *               btns:
 *                 type: array
 *                 description: 버튼 목록 (수신자마다 동일한 버튼 사용 시)
 *                 items:
 *                   type: object
 *                   properties:
 *                     n:
 *                       type: string
 *                       description: 버튼 이름
 *                       example: "주문 상세"
 *                     t:
 *                       type: string
 *                       description: 버튼 유형 (WL 웹링크, AL 앱링크, BK 상담톡 전환, MD 메시지 전달)
 *                       example: "WL"
 *                     u1:
 *                       type: string
 *                       description: 버튼 링크1 (모바일)
 *                       example: "https://m.example.com"
 *                     u2:
 *                       type: string
 *                       description: 버튼 링크2 (PC)
 *                       example: "https://www.example.com"
 *     responses:
 *       200:
 *         description: 알림톡 대량 전송 성공
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
 *                   example: "알림톡 대량 전송 성공"
 *                 data:
 *                   type: object
 *                   description: 전송 결과 데이터
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
 *                   example: "알림톡 대량 전송 실패"
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

