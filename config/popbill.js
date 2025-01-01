const popbill = require('popbill');

// Popbill 설정
popbill.config({
  LinkID: 'WINEX',
  SecretKey: '8yoJ8CNqjR+6yGi40m8oYStb2ohgqazAX4EdXvLign4=',
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

module.exports = { popbill, CashbillService };
