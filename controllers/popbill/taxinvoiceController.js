const { MgtKeyType } = require('popbill');
const { TaxinvoiceService } = require('../../config/popbill');

class TaxinvoiceController {
  // 즉시 발행
  static async registIssue(req, res) {
    try {
      const {
        CorpNum,
        Taxinvoice,
        writeSpecification = false, // 기본값 false
        forceIssue = false, // 기본값 false
        memo = '',
        emailSubject = '',
        dealInvoiceMgtKey = '',
        UserID,
      } = req.body;

      // TaxinvoiceService.registIssue 호출
      TaxinvoiceService.registIssue(
              CorpNum,
              Taxinvoice,
              writeSpecification,
              forceIssue,
              memo,
              emailSubject,
              dealInvoiceMgtKey,
              UserID,
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '세금계산서 즉시 발행 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: '세금계산서 즉시 발행 실패',
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

  // 발행 취소
  static async cancelIssue(req, res) {
    try {
      const { CorpNum, KeyType, MgtKey, Memo = '', UserID } = req.body;

      // TaxinvoiceService.cancelIssue 호출
      TaxinvoiceService.cancelIssue(
              CorpNum,
              KeyType,
              MgtKey,
              Memo,
              UserID,
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '세금계산서 발행 취소 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: '세금계산서 발행 취소 실패',
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

  // 인증서 등록 팝업 URL 조회
  static async getTaxCertURL(req, res) {
    try {
      const { CorpNum, UserID } = req.body;

      // TaxinvoiceService.getTaxCertURL 호출
      TaxinvoiceService.getTaxCertURL(
              CorpNum,
              UserID,
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '인증서 등록 팝업 URL 성공',
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

  
  // 세금계산서 인쇄 팝업 URL 조회
  static async getPrintURL(req, res) {
    try {
      const { CorpNum,  KeyType, MgtKey, UserID } = req.body; 

      // TaxinvoiceService.getPrintURL 호출
      TaxinvoiceService.getPrintURL(
              CorpNum,
              KeyType,
              MgtKey,
              UserID,
              (result) => {
                res.status(200).json({
                  success: true,
                  message: '세금계산서 인쇄 팝업 URL 성공',
                  data: result,
                });
              },
              (error) => {
                res.status(500).json({
                  success: false,
                  message: '세금계산서 인쇄 팝업 URL 실패',
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


module.exports = TaxinvoiceController;
