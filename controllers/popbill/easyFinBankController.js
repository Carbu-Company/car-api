const { EasyFinBankService } = require('../../config/popbill');

class EasyFinBankController {
  // 계좌 등록
  static async registBankAccount(req, res) {
    try {
      const { CorpNum, BankAccountInfo, UserID } = req.body;

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
      const { CorpNum, BankCode, AccountNumber, UpdateEasyFinBankAccountForm, UserID } = req.body;

      EasyFinBankService.updateBankAccount(
              CorpNum,
              BankCode,
              AccountNumber,
              UpdateEasyFinBankAccountForm,
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

  // 거래 내역 조회
  static async search(req, res) {
    try {
      const {
        CorpNum,
        JobID,
        TradeType = [],
        SearchString = '',
        Page = 1,
        PerPage = 500,
        Order = 'D',
        UserID,
      } = req.body;

      EasyFinBankService.search(
              CorpNum,
              JobID,
              TradeType,
              SearchString,
              Page,
              PerPage,
              Order,
              UserID,
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '거래 내역 조회 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: '거래 내역 조회 실패',
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

  // 계좌 거래내역 수집 요청
  static async requestJob(req, res) {
    try {
      const { CorpNum, BankCode, AccountNumber, SDate, EDate, UserID } = req.body;

      EasyFinBankService.requestJob(
              CorpNum,
              BankCode,
              AccountNumber,
              SDate,
              EDate,
              UserID,
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '거래내역 수집 요청 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: '거래내역 수집 요청 실패',
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

  // 계좌정보 목록 조회
  static async listBankAccount (req, res) {
    try {
      const { CorpNum, UserID } = req.body;

      EasyFinBankService.listBankAccount (
              CorpNum,
              UserID,
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '계좌정보 목록 조회 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: '계좌정보 목록 조회 실패',
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
