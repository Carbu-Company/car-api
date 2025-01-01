const { CashbillService } = require('../../config/popbill');

class CashbillController {
  static async registIssue(req, res) {
    try {
      const { CorpNum, Cashbill, Memo, UserID, EmailSubject } = req.body;

      // Cashbill 발행
      CashbillService.registIssue(
              CorpNum,
              Cashbill,
              Memo,
              UserID,
              EmailSubject,
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '현금영수증 발행 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: '현금영수증 발행 실패',
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

module.exports = CashbillController;
