const popbill = require("popbill");

// Popbill 설정
popbill.config({
  LinkID: "AIBIZCOKR",
  SecretKey: "5H7KtOtKlIZC3KJR495egMgEYNDe0oAciZeGbYdnU2I=",
  IsTest: true,
  IPRestrictOnOff: true,
  UseStaticIP: false,
  UseLocalTimeYN: true,
  defaultErrorHandler: function (Error) {
    console.log("Error Occur : [" + Error.code + "] " + Error.message);
  },
});

// CashbillService 생성
const CashbillService = new popbill.CashbillService(); // 현금영수증
const TaxinvoiceService = new popbill.TaxinvoiceService(); // 전자세금계산서
const EasyFinBankService = new popbill.EasyFinBankService(); // 계좌조회
const KakaoService = new popbill.KakaoService(); // 카카오톡
const BizInfoCheckService = new popbill.BizInfoCheckService(); // 기업정보조회
const AccountCheckService = new popbill.AccountCheckService(); // 계좌조회
const ClosedownService = new popbill.ClosedownService(); // 연동회원
// SMS 기능은 MessageService를 통해 사용 가능합니다
//const StatementService = new popbill.StatementService();  // 전자세금계산서 명세서
const MessageService = new popbill.MessageService(); // 메시지
const HTTaxinvoiceService = new popbill.HTTaxinvoiceService(); // 전자세금계산서 홈텍
const HTCashbillService = new popbill.HTCashbillService(); // 현금영수증 홈텍
const FaxService = new popbill.FaxService(); // FAX

module.exports = {
  popbill,
  CashbillService,
  TaxinvoiceService,
  EasyFinBankService,
  KakaoService,
  BizInfoCheckService,
  AccountCheckService,
  ClosedownService,
  FaxService,
  MessageService,
  HTTaxinvoiceService,
  HTCashbillService,
};
