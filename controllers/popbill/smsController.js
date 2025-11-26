const { MessageService } = require('../../config/popbill');

class SmsController {
 
  // 발신번호 등록여부 확인
  static async checkSenderNumber(req, res) {
    try {
      const {
        CorpNum,
        SenderNumber,
        UserID,
      } = req.body;

      // TaxinvoiceService.registIssue 호출
      MessageService.checkSenderNumber(
              CorpNum,
              SenderNumber,
              UserID,
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '발신번호 등록여부 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: '발신번호 등록여부 실패',
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

  // 발신번호 등록 팝업 URL
  static async getSenderNumberMgtURL(req, res) {
    try {
      const { CorpNum, UserID } = req.body;

      // MessageService.GetSenderNumberMgtURL 호출
      MessageService.getSenderNumberMgtURL (
              CorpNum,
              UserID,
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '발신번호 관리 팝업 URL 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: '발신번호 관리 팝업 URL 실패',
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

  // 발신번호 목록 확인

  /**
   * 발신번호 목록 조회  (3가지 케이스)
   *   "CorpNum": "5258103621",
   *   "UserID": "AIBZCOKR",
   * 
   *   "CorpNum": "5258103621",
   *   "UserID": "AIBZCOKR",
   * 
   *   "CorpNum": "1448122074",
   *   "UserID": "winesoft99"
   */
  static async getSenderNumberList(req, res) {
    try {
      const { CorpNum, UserID } = req.body;

      // MessageService.GetSenderNumberList 호출
      MessageService.getSenderNumberList(
              CorpNum,
              UserID,
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '발신번호 목록 조회 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: '발신번호 목록 조회 실패',
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

  // SMS 단문 전송
  static async sendSMS(req, res) {
    try {
      const {
        CorpNum, 
        Sender, 
        Receiver, 
        ReceiverName,
        Contents, 
        reserveDT,
        adsYN,
        SenderName,
        requestNum,
        UserID
      } = req.body;

      // 기본 항목을 그대로 전달... 빈 문자열이라도.
      MessageService.sendSMS(
              CorpNum,
              Sender,
              Receiver,
              ReceiverName,
              Contents,
              reserveDT,
              adsYN,
              SenderName,
              requestNum,
              UserID,
              (result) => {
                res.status(200).json({
                  success: true,
                  message: 'SMS 단문 전송 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: 'SMS 단문 전송 실패',
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

module.exports = SmsController;
