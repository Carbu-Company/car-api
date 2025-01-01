/**
 * @swagger
 * /api/popbill/v1/registIssue:
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
 *                 example: "1234567890"
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
 *                     example: "1234567890"
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
 *                 example: "testUser"
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