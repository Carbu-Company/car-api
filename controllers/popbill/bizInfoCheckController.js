const { BizInfoCheckService } = require('../../config/popbill');

class BizInfoCheckController {
  static async JoinMember(req, res) {
    try {
      const { JoinForm } = req.body;

      console.log(JoinForm);

      // 연동회원 가입
      BizInfoCheckService.joinMember(
              JoinForm,
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '연동회원 가입 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: '연동회원 가입 실패',
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

  static async QuitMember (req, res) {
    try {
      const {
        CorpNum,
        QuitReason,
        UserID,
      } = req.body;

      // RevokeRegistIssue 호출
      BizInfoCheckService.QuitMember(
              CorpNum || '',
              QuitReason || '',
              UserID || '',
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '연동회원 탈퇴 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: '연동회원 탈퇴 실패',
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

  static async GetCorpInfo (req, res) {
    try {
      const { CorpNum, UserID } = req.body;

      // 필수 파라미터 확인
      if (!CorpNum) {
        return res.status(400).json({
          success: false,
          message: '필수 파라미터(CorpNum)가 누락되었습니다.',
        });
      }

      // 팝빌 API 호출
      BizInfoCheckService.getCorpInfo(
              CorpNum,
              UserID || '', // UserID는 선택적이므로 기본값으로 빈 문자열 전달
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '회사정보 확인 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: '회사정보 확인 실패',
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


module.exports = BizInfoCheckController;
