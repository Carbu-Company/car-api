const { HTTaxinvoiceService } = require('../../config/popbill');

class HtTaxinvoiceController {
  static async requestJob(req, res) {
    try {
      const { CorpNum, Type, DType, SDate, EDate, UserID } = req.body;

      // 작업 요청
      HTTaxinvoiceService.requestJob(
              CorpNum,
              Type,
              DType,
              SDate,
              EDate,
              UserID,
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '수집 요청 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: '수집 요청 실패',
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

  static async GetJobState (req, res) {
    try {
      const {
        CorpNum,
        JobID,
        UserID
      } = req.body;

      // RevokeRegistIssue 호출
      HTTaxinvoiceService.GetJobState(
              CorpNum || '',
              JobID || '',
              UserID || '',
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '수집 상태 조회 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: '수집 상태 조회 실패',
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

  static async Search (req, res) {
    try {
      const { CorpNum, JobID, TaxRegID, Order, serID } = req.body;

      // 필수 파라미터 확인
      if (!CorpNum || !JobID) {
        return res.status(400).json({
          success: false,
          message: '필수 파라미터(CorpNum, JobID)가 누락되었습니다.',
        });
      }

      // 팝빌 API 호출
      HTTaxinvoiceService.Search(
              CorpNum,
              JobID,
              TaxRegID,
              Order,
              serID,
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '수집 결과 조회 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: '수집 결과 조회 실패',
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

  static async GetPopUpURL  (req, res) {
    try {
      const { CorpNum, NTSConfirmNum, UserID } = req.body;

      // 필수 파라미터 확인
      if (!CorpNum || !NTSConfirmNum) {
        return res.status(400).json({
          success: false,
          message: '필수 파라미터(CorpNum, NTSConfirmNum)가 누락되었습니다.',
        });
      }

      // 팝빌 API 호출
      HTTaxinvoiceService.GetPopUpURL(
              CorpNum,
              NTSConfirmNum,
              UserID,
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '전자세금계산서 보기 팝업 URL 확인 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: '전자세금계산서 보기 팝업 URL 확인 실패',
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

  
  static async GetTaxinvoice (req, res) {
    try {
      const { CorpNum, NTSConfirmNum, UserID } = req.body;

      // 필수 파라미터 확인
      if (!CorpNum || !NTSConfirmNum) {
        return res.status(400).json({
          success: false,
          message: '필수 파라미터(CorpNum, NTSConfirmNum)가 누락되었습니다.',
        });
      }

      // 팝빌 API 호출
      HTTaxinvoiceService.GetTaxinvoice(
              CorpNum,
              NTSConfirmNum,
              UserID,
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '수집 상세 확인 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: '수집 상세 확인 실패',
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


module.exports = HtTaxinvoiceController;
