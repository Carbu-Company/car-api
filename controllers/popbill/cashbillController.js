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

  static async revokeRegistIssue(req, res) {
    try {
      const {
        CorpNum,
        MgtKey,
        OrgConfirmNum,
        OrgTradeDate,
        SMSSendYN,
        Memo,
        IsPartCancel,
        CancelType,
        SupplyCost,
        Tax,
        ServiceFee,
        TotalAmount,
        UserID,
        EmailSubject,
        TradeDT,
      } = req.body;

      // RevokeRegistIssue 호출
      CashbillService.revokeRegistIssue(
              CorpNum || '',
              MgtKey || '',
              OrgConfirmNum || '',
              OrgTradeDate || '',
              SMSSendYN || false,
              Memo || '',
              UserID || '',
              IsPartCancel || false,
              CancelType || 1,
              SupplyCost || '',
              Tax || '',
              ServiceFee || '',
              TotalAmount || '',
              EmailSubject || '',
              TradeDT || '',
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '취소 현금영수증 발행 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: '취소 현금영수증 발행 실패',
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
  static async getInfo(req, res) {
    try {
      const { CorpNum, MgtKey, UserID } = req.body;

      // 필수 파라미터 확인
      if (!CorpNum || !MgtKey) {
        return res.status(400).json({
          success: false,
          message: '필수 파라미터(CorpNum, MgtKey)가 누락되었습니다.',
        });
      }

      // 팝빌 API 호출
      CashbillService.getInfo(
              CorpNum,
              MgtKey,
              UserID || '', // UserID는 선택적이므로 기본값으로 빈 문자열 전달
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '현금영수증 상태 확인 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: '현금영수증 상태 확인 실패',
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
