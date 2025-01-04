const { EasyFinBankService } = require('../../config/popbill');

class EasyFinBankController {
  // 계좌 등록
  static async registBankAccount(req, res) {
    try {
      const { CorpNum, BankAccountInfo, UserID } = req.body;

      // EasyFinBankService.registBankAccount 호출
      EasyFinBankService.registBankAccount(
              CorpNum,
              BankAccountInfo,
              UserID,
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '계좌 등록 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: '계좌 등록 실패',
                  error: {
                    code: error.code,
                    message: error.message,
                  },
                });
              }
      );
    } catch (err) {
      res.status(500).json({
        success: false,
        message: '서버 오류 발생',
        error: err.message,
      });
    }
  }

  // 계좌 정보 수정
  static async updateBankAccount(req, res) {
    try {
      const { CorpNum, BankCode, AccountNumber, BankAccountInfo, UserID } = req.body;

      // EasyFinBankService.updateBankAccount 호출
      EasyFinBankService.updateBankAccount(
              CorpNum,
              BankCode,
              AccountNumber,
              BankAccountInfo,
              UserID,
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '계좌 정보 수정 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: '계좌 정보 수정 실패',
                  error: {
                    code: error.code,
                    message: error.message,
                  },
                });
              }
      );
    } catch (err) {
      res.status(500).json({
        success: false,
        message: '서버 오류 발생',
        error: err.message,
      });
    }
  }
}

module.exports = EasyFinBankController;
