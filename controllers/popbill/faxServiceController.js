const { FaxService } = require('../../config/popbill');

class FaxServiceController {
  // 즉시 발행
  static async checkSenderNumber(req, res) {
    try {
      const {
        CorpNum,
        SenderNumber,
        UserID,
      } = req.body;

      // TaxinvoiceService.registIssue 호출
      FaxService.checkSenderNumber(
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

  // 발신번호 관리 팝업 URL 조회
  static async getSenderNumberMgtURL(req, res) {
    try {
      const { CorpNum, UserID } = req.body;

      // FaxService.getSenderNumberMgtURL 호출
      FaxService.getSenderNumberMgtURL (
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

  // 발신번호 목록 조회
  static async getSenderNumberList(req, res) {
    try {
      const { CorpNum, UserID } = req.body;

      // FaxService.getSenderNumberList 호출
      FaxService.getSenderNumberList(
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
                  message: '인증서 등록 팝업 URL 실패',
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

  
  // FAX 발송
  static async sendFAX(req, res) {
    try {
      const { CorpNum, Sender, Receiver, ReceiverName, FilePaths, SenderName, Title, RequestNum, UserID } = req.body;

      // FaxService.sendFAX 호출
      FaxService.sendFax(
              CorpNum,
              Sender,
              Receiver,
              ReceiverName,
              FilePaths,
              SenderName,
              Title,
              RequestNum,
              UserID,
              (result) => {
                res.status(200).json({
                  success: true,
                  message: 'FAX 발송 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: 'FAX 발송 실패',
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

module.exports = FaxServiceController;
