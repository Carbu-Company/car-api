/**
 * @swagger
 * /api/popbill/v1/taxinvoice/registIssue:
 *   post:
 *     summary: 세금계산서 - 즉시 발행
 *     description: 세금계산서 데이터를 팝빌에 저장하고 즉시 발행(전자서명)하여 "발행완료" 상태로 처리합니다.
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
 *               Taxinvoice:
 *                 type: object
 *                 description: 세금계산서 객체 정보
 *                 required:
 *                   - issueType
 *                   - taxType
 *                   - chargeDirection
 *                   - writeDate
 *                   - purposeType
 *                   - supplyCostTotal
 *                   - taxTotal
 *                   - totalAmount
 *                   - invoicerCorpNum
 *                   - invoicerCorpName
 *                   - invoicerCEOName
 *                   - invoiceeCorpNum
 *                   - invoiceeCorpName
 *                   - invoiceeCEOName
 *                 properties:
 *                   issueType:
 *                     type: string
 *                     description: 발행형태 (정발행/역발행/위수탁 중 택1)
 *                     enum: ["정발행", "역발행", "위수탁"]
 *                     example: "정발행"
 *                   taxType:
 *                     type: string
 *                     description: 과세형태 (과세/영세/면세 중 택1)
 *                     enum: ["과세", "영세", "면세"]
 *                     example: "과세"
 *                   chargeDirection:
 *                     type: string
 *                     description: |
 *                       과금방향 (정과금/역과금 중 택1)
 *                       - 정발행, 위수탁: 정과금 가능
 *                       - 역발행: 정과금 또는 역과금 모두 가능
 *                     enum: ["정과금", "역과금"]
 *                     example: "정과금"
 *                   serialNum:
 *                     type: string
 *                     maxLength: 30
 *                     description: 일련번호
 *                     example: "SN20250101"
 *                   kwon:
 *                     type: number
 *                     maxLength: 4
 *                     description: 책번호 "권" 항목 (정수만 입력 가능)
 *                     example: 1
 *                   ho:
 *                     type: number
 *                     maxLength: 4
 *                     description: 책번호 "호" 항목 (정수만 입력 가능)
 *                     example: 15
 *                   writeDate:
 *                     type: string
 *                     description: 작성일자 (형식 yyyyMMdd)
 *                     example: "20250104"
 *                     pattern: "^\\d{8}$"
 *                   purposeType:
 *                     type: string
 *                     description: 영수/청구 구분 (영수/청구/없음 중 택1)
 *                     enum: ["영수", "청구", "없음"]
 *                     example: "영수"
 *                   supplyCostTotal:
 *                     type: string
 *                     maxLength: 18
 *                     description: 공급가액 합계 (정수만 입력 가능, 소수점 자동 절사)
 *                     example: "150000"
 *                   taxTotal:
 *                     type: string
 *                     maxLength: 18
 *                     description: 세액 합계 (정수만 입력 가능, 소수점 자동 절사)
 *                     example: "15000"
 *                   totalAmount:
 *                     type: string
 *                     maxLength: 18
 *                     description: 합계금액 (정수만 입력 가능, 소수점 자동 절사)
 *                     example: "165000"
 *                   invoicerMgtKey:
 *                     type: string
 *                     maxLength: 24
 *                     description: |
 *                       공급자 문서번호
 *                       - 영문 대소문자, 숫자, 특수문자('-', '_')만 입력 가능
 *                       - 정발행시 필수
 *                     pattern: "^[a-zA-Z0-9-_]+$"
 *                     example: "INV-20250110-001"
 *                   invoicerCorpNum:
 *                     type: string
 *                     maxLength: 10
 *                     description: 공급자 사업자번호 ('-' 제외)
 *                     example: "1448122074"
 *                   invoicerTaxRegID:
 *                     type: string
 *                     maxLength: 4
 *                     description: 공급자 종사업장 식별번호 (4자리 숫자)
 *                     pattern: "^\\d{4}$"
 *                     example: "0001"
 *                   invoicerCorpName:
 *                     type: string
 *                     maxLength: 200
 *                     description: 공급자 상호
 *                     example: "공급자 주식회사"
 *                   invoicerCEOName:
 *                     type: string
 *                     maxLength: 100
 *                     description: 공급자 대표자 성명
 *                     example: "홍길동"
 *                   invoicerAddr:
 *                     type: string
 *                     maxLength: 300
 *                     description: 공급자 주소
 *                     example: "서울특별시 중구 을지로 100"
 *                   invoicerBizType:
 *                     type: string
 *                     maxLength: 100
 *                     description: 공급자 업태
 *                     example: "도소매"
 *                   invoicerBizClass:
 *                     type: string
 *                     maxLength: 100
 *                     description: 공급자 종목
 *                     example: "컴퓨터, 전자제품"
 *                   invoicerContactName:
 *                     type: string
 *                     maxLength: 100
 *                     description: 공급자 담당자 성명
 *                     example: "김담당"
 *                   invoicerDeptName:
 *                     type: string
 *                     maxLength: 100
 *                     description: 공급자 담당자 부서명
 *                     example: "영업팀"
 *                   invoicerTEL:
 *                     type: string
 *                     maxLength: 20
 *                     description: 공급자 담당자 연락처
 *                     example: "02-123-4567"
 *                   invoicerHP:
 *                     type: string
 *                     maxLength: 20
 *                     description: 공급자 담당자 휴대폰
 *                     example: "010-9999-8888"
 *                   invoicerEmail:
 *                     type: string
 *                     maxLength: 100
 *                     description: 공급자 담당자 이메일
 *                     example: "invoicer@example.com"
 *                   invoicerSMSSendYN:
 *                     type: boolean
 *                     description: |
 *                       공급자 알림문자 전송여부
 *                       - true: 전송
 *                       - false: 미전송 (기본값)
 *                     example: false
 *                   invoiceeType:
 *                     type: string
 *                     description: 공급받는자 구분 (사업자/개인/외국인 중 택1)
 *                     enum: ["사업자", "개인", "외국인"]
 *                     example: "사업자"
 *                   invoiceeCorpNum:
 *                     type: string
 *                     maxLength: 13
 *                     description: |
 *                       공급받는자 등록번호 ('-' 제외)
 *                       - 사업자: 사업자번호
 *                       - 개인: 주민등록번호
 *                       - 외국인: "9999999999999"
 *                     example: "1448122074"
 *                   invoiceeTaxRegID:
 *                     type: string
 *                     maxLength: 4
 *                     description: 공급받는자 종사업장 식별번호 (4자리 숫자)
 *                     pattern: "^\\d{4}$"
 *                     example: "0002"
 *                   invoiceeCorpName:
 *                     type: string
 *                     maxLength: 200
 *                     description: 공급받는자 상호
 *                     example: "공급받는자 주식회사"
 *                   invoiceeCEOName:
 *                     type: string
 *                     maxLength: 100
 *                     description: 공급받는자 대표자 성명
 *                     example: "김철수"
 *                   invoiceeAddr:
 *                     type: string
 *                     maxLength: 300
 *                     description: 공급받는자 주소
 *                     example: "부산광역시 해운대구 센텀남대로 45"
 *                   detailList:
 *                     type: array
 *                     maxItems: 99
 *                     description: 품목 상세정보 (최대 99개)
 *                     items:
 *                       type: object
 *                       properties:
 *                         serialNum:
 *                           type: integer
 *                           description: 품목 일련번호
 *                           example: 1
 *                         itemName:
 *                           type: string
 *                           description: 품목명
 *                           example: "노트북"
 *                         qty:
 *                           type: string
 *                           description: 수량
 *                           example: "5"
 *                         unitCost:
 *                           type: string
 *                           description: 단가
 *                           example: "300000"
 *                         supplyCost:
 *                           type: string
 *                           description: 공급가액
 *                           example: "1500000"
 *                         tax:
 *                           type: string
 *                           description: 세액
 *                           example: "15000"
 *                   addContactList:
 *                     type: array
 *                     maxItems: 5
 *                     description: 공급받는자 추가담당자 정보 (최대 5명)
 *                     items:
 *                       type: object
 *                       properties:
 *                         serialNum:
 *                           type: integer
 *                           description: 일련번호
 *                           example: 1
 *                         contactName:
 *                           type: string
 *                           maxLength: 100
 *                           description: 담당자명
 *                           example: "박지원"
 *                         email:
 *                           type: string
 *                           maxLength: 100
 *                           description: 이메일
 *                           example: "support@example.com"
 *                   businessLicenseYN:
 *                     type: boolean
 *                     description: |
 *                       팝빌에 등록된 사업자등록증 첨부 여부
 *                       - true: 첨부
 *                       - false: 미첨부 (기본값)
 *                     example: false
 *                   bankBookYN:
 *                     type: boolean
 *                     description: |
 *                       팝빌에 등록된 통장사본 첨부 여부
 *                       - true: 첨부
 *                       - false: 미첨부 (기본값)
 *                     example: false
 *                   memo:
 *                     type: string
 *                     maxLength: 200
 *                     description: 메모
 *                     example: "거래명세서 동봉하였습니다."
 *                   emailSubject:
 *                     type: string
 *                     maxLength: 300
 *                     description: 발행 안내 메일 제목
 *                     example: "세금계산서 발행 안내"
 *               forceIssue:
 *                 type: boolean
 *                 description: 지연발행 강제여부
 *                 example: false
 *               memo:
 *                 type: string
 *                 maxLength: 200
 *                 description: 메모
 *                 example: "즉시 발행 요청드립니다."
 *               UserID:
 *                 type: string
 *                 description: 팝빌회원 아이디
 *                 example: "winexsoft"
 *     responses:
 *       200:
 *         description: 세금계산서 즉시 발행 성공
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
 *                   example: "세금계산서 즉시 발행 성공"
 *                 data:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       description: 처리 코드
 *                       example: 1
 *                     message:
 *                       type: string
 *                       description: 처리 메시지
 *                       example: "발행이 완료되었습니다."
 *                     invoiceKey:
 *                       type: string
 *                       description: 세금계산서 키
 *                       example: "019123456789012345"
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
 *         description: 서버 오류 또는 발행 실패
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
 *                   example: "세금계산서 즉시 발행 실패"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       description: 팝빌 에러 코드
 *                       example: -110
 *                     message:
 *                       type: string
 *                       description: 팝빌 에러 메시지
 *                       example: "발행 실패: 유효하지 않은 데이터 형식입니다."
 */


/**
 * @swagger
 * /api/popbill/v1/taxinvoice/cancelIssue:
 *   post:
 *     summary: 세금계산서 - 발행 취소
 *     description: 국세청 전송 이전 "발행완료" 상태의 전자세금계산서를 "발행취소"하고 국세청 신고대상에서 제외합니다.
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
 *               KeyType:
 *                 type: string
 *                 description: 세금계산서 유형 (SELL 매출, BUY 매입, TRUSTEE 위수탁)
 *                 enum: ["SELL", "BUY", "TRUSTEE"]
 *                 example: "SELL"
 *               MgtKey:
 *                 type: string
 *                 description: 파트너가 할당한 문서번호 (최대 24자리)
 *                 example: "INV-20250110-001"
 *               Memo:
 *                 type: string
 *                 maxLength: 200
 *                 description: 세금계산서 상태 이력을 관리하기 위한 메모
 *                 example: "발행 오류로 취소 요청"
 *               UserID:
 *                 type: string
 *                 description: 팝빌회원 아이디
 *                 example: "winexsoft"
 *     responses:
 *       200:
 *         description: 세금계산서 발행 취소 성공
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
 *                   example: "세금계산서 발행 취소 성공"
 *                 data:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       description: 처리 코드
 *                       example: 1
 *                     message:
 *                       type: string
 *                       description: 처리 메시지
 *                       example: "발행 취소가 완료되었습니다."
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
 *         description: 서버 오류 또는 취소 실패
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
 *                   example: "세금계산서 발행 취소 실패"
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
 *                       example: "인증서가 만료되었습니다."
 */
