const popbill = require('popbill');

// Popbill 설정
popbill.config({
  LinkID: 'AIBIZCOKR',
  SecretKey: '5H7KtOtKlIZC3KJR495egMgEYNDe0oAciZeGbYdnU2I=',
  IsTest: true,
  IPRestrictOnOff: true,
  UseStaticIP: false,
  UseLocalTimeYN: true,
  defaultErrorHandler: function (Error) {
    console.log('Error Occur : [' + Error.code + '] ' + Error.message);
  }
});

// CashbillService 생성
const CashbillService = new popbill.CashbillService();
const TaxinvoiceService = new popbill.TaxinvoiceService();
const EasyFinBankService = new popbill.EasyFinBankService();
const KakaoService = new popbill.KakaoService();

module.exports = { popbill, CashbillService, TaxinvoiceService, EasyFinBankService, KakaoService };
