const { MessageService } = require('../../config/popbill');

class SmsController {
 
  // SMS 단문 전송
  static async sendSMS(req, res) {
    try {
      const {
        CorpNum, 
        Sender, 
        Receiver, 
        ReceiverName, 
        Contents, 
      } = req.body;

      MessageService.sendSMS(
              CorpNum,
              Sender,
              Receiver,
              ReceiverName,
              Contents,
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
