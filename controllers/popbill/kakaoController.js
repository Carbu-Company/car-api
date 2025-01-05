const { KakaoService } = require('../../config/popbill');

class KakaoController {
  // 카카오톡 채널 목록 확인
  static async listPlusFriendID(req, res) {
    try {
      const { CorpNum, UserID } = req.body;

      KakaoService.listPlusFriendID(
              CorpNum,
              UserID,
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '카카오톡 채널 목록 조회 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: '카카오톡 채널 목록 조회 실패',
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

  // 카카오톡 채널 관리 팝업 URL
  static async getPlusFriendMgtURL(req, res) {
    try {
      const { CorpNum, UserID } = req.body;

      KakaoService.getPlusFriendMgtURL(
              CorpNum,
              UserID,
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '카카오톡 채널 관리 URL 조회 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: '카카오톡 채널 관리 URL 조회 실패',
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

  // 알림톡 템플릿 관리 팝업 URL
  static async getATSTemplateMgtURL(req, res) {
    try {
      const { CorpNum, UserID } = req.body;

      KakaoService.getATSTemplateMgtURL(
              CorpNum,
              UserID,
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '알림톡 템플릿 관리 URL 조회 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: '알림톡 템플릿 관리 URL 조회 실패',
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

  // 알림톡 단건 전송
  static async sendATS_one(req, res) {
    try {
      const {
        CorpNum,
        templateCode,
        Sender,
        content,
        altSubject,
        altContent,
        altSendType,
        sndDT,
        receiver,
        receiverName,
        UserID,
        requestNum,
        btns,
      } = req.body;

      KakaoService.sendATS_one(
              CorpNum,
              templateCode,
              Sender,
              content,
              altSubject,
              altContent,
              altSendType,
              sndDT,
              receiver,
              receiverName,
              UserID,
              requestNum,
              btns,
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '알림톡 단건 전송 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: '알림톡 단건 전송 실패',
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

  // 알림톡 대량 전송
  static async sendATS_multi(req, res) {
    try {
      const {
        CorpNum,
        templateCode,
        Sender,
        altSendType,
        sndDT,
        msgs,
        UserID,
        requestNum,
        btns,
      } = req.body;

      KakaoService.sendATS_multi(
              CorpNum,
              templateCode,
              Sender,
              altSendType,
              sndDT,
              msgs,
              UserID,
              requestNum,
              btns,
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '알림톡 대량 전송 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: '알림톡 대량 전송 실패',
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

module.exports = KakaoController;
