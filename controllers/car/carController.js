const carAcctModel = require("../../models/select/carAcctModel");
const carAdjModel = require("../../models/select/carAdjModel");
const carAgentModel = require("../../models/select/carAgentModel");
const carCashModel = require("../../models/select/carCashModel");
const carConcilModel = require("../../models/select/carConcilModel");
const carDashBoardModel = require("../../models/select/carDashBoardModel");
const carFaqBoardModel = require("../../models/select/carFaqBoardModel");
const carGoodsModel = require("../../models/select/carGoodsModel");
const carLoanModel = require("../../models/select/carLoanModel");
const carPurModel = require("../../models/select/carPurModel");
const carSelModel = require("../../models/select/carSelModel");
const carSystemModel = require("../../models/select/carSystemModel");
const carTaxModel = require("../../models/select/carTaxModel");
const commonModel = require("../../models/select/commonModel");
const usrReqModel = require("../../models/select/usrReqModel");

//const carInsertModel = require("../../models/insert/carInsertModel");
//const carUpdateModel = require("../../models/update/carUpdateModel");
//const carDeleteModel = require("../../models/delete/carDeleteModel");


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 제시 2.0
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 제시 차량 조회
exports.getCarPurList = async (req, res, next) => {
  try {
    //const { agentId, page, pageSize } = req.body;

    const cars = await carPurModel.getCarPurList(req.body);
    res.status(200).json(cars);
  } catch (err) {
    next(err);
  }
};

// 제시 차량 합계 조회
exports.getCarPurSummary = async (req, res, next) => {
  try {
    const cars = await carPurModel.getCarPurSummary(req.body);
    res.status(200).json(cars);
  } catch (err) {
    next(err);
  }
};

// 제시 차량 상세 조회
exports.getCarPurInfo = async (req, res, next) => {
  try {
    const { carRegId } = req.query; 

    const carPurInfo = await carPurModel.getCarPurInfo({ carRegId });
    res.status(200).json(carPurInfo);
  } catch (err) {
    next(err);
  }
};


// 제시 등록
exports.insertCarPur = async (req, res, next) => {
  try {
    await carPurModel.insertCarPur(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// 제시 수정 등록
exports.updateCarPur = async (req, res, next) => {
  try {
    await carPurModel.updateCarPur(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// 제시 삭제
exports.deleteCarPur = async (req, res, next) => {
  try {
    const { carRegId, flag_type } = req.query;

    await carPurModel.deleteCarPur({ carRegId, flag_type });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 매도 2.0
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 제시 차량 조회
exports.getCarSelList = async (req, res, next) => {
  try {
    //const { agentId, page, pageSize } = req.body;

    const cars = await carSelModel.getCarSelList(req.body);
    res.status(200).json(cars);
  } catch (err) {
    next(err);
  }
};

// 제시 차량 합계 조회
exports.getCarSelSummary = async (req, res, next) => {
  try {
    const cars = await carSelModel.getCarSelSummary(req.body);
    res.status(200).json(cars);
  } catch (err) {
    next(err);
  }
};

// 차량 판매 정보 조회
exports.getCarSelInfo = async (req, res, next) => {
  try {
    const { carRegId } = req.query;
    const carSelInfo = await carSelModel.getCarSelInfo({ carRegId });
    res.status(200).json(carSelInfo);
  } catch (err) {
    next(err);
  }
};

// 차량 판매 정보 수정
exports.updateCarSel = async (req, res, next) => {  
  try {
    await carSelModel.updateCarSel(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};


// 제시 삭제
exports.deleteCarSel = async (req, res, next) => {
  try {
    const { carRegId, flag_type } = req.query;

    await carSelModel.deleteCarSel({ carRegId, flag_type });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};


// 판매매도 고객 등록
exports.insertCarBuyCust = async (req, res, next) => {
  try {
    await carSelModel.insertCarBuyCust(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 매입 매도비
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 매입 매도비 목록 조회
exports.getBuySellFeeList = async (req, res, next) => {
  try {
    const { agentId, carNo, page, pageSize } = req.body;

    const buySellFeeList = await carSelectModel.getBuySellFeeList({ agentId, carNo, page, pageSize });
    res.status(200).json(buySellFeeList);
  } catch (err) {
    next(err);
  }
};  

// 매입 매도비 합계 조회
exports.getBuySellFeeSum = async (req, res, next) => {
  try {
    const { agentId } = req.body;

    const buySellFeeSum = await carSelectModel.getBuySellFeeSum({ agentId });
    res.status(200).json(buySellFeeSum);
  } catch (err) {
    next(err);
  }
};

// 매입 매도비 상세
exports.getBuySellFeeDetail = async (req, res, next) => {
  try {
    const { carRegId } = req.query; 

    const buySellFeeDetail = await carSelectModel.getBuySellFeeDetail({ carRegId });
    res.status(200).json(buySellFeeDetail);
  } catch (err) {
    next(err);
  }
};

// 매입비 항목 관리 (제시-매입정보)
exports.getBuyInfoList = async (req, res, next) => {
  try {
    const { fee_car_regid } = req.query;

    const buyInfoList = await carSelectModel.getBuyInfoList({ fee_car_regid });
    res.status(200).json(buyInfoList);
  } catch (err) {
    next(err);
  }
};

exports.getTaxCashNoList = async (req, res, next) => {
  try {
    const { agentId } = req.query;

    const taxCashNoList = await carDashBoardModel.getTaxCashNoList({ agentId });
    res.status(200).json(taxCashNoList);
  } catch (err) {
    next(err);
  }
};

exports.getInventoryFinanceStatus = async (req, res, next) => {
  try {
    const { agentId } = req.query;  

    const inventoryFinanceStatus = await carDashBoardModel.getInventoryFinanceStatus({ agentId });
    res.status(200).json(inventoryFinanceStatus);
  } catch (err) {
    next(err);
  }
};

exports.getCarLoanInfo = async (req, res, next) => {
  try {
    const { carRegId } = req.query;  

    const carLoanInfo = await carDashBoardModel.getCarLoanInfo({ carRegId });
    res.status(200).json(carLoanInfo);
  } catch (err) {
    next(err);
  }
};

exports.getSalesPurchaseSummary = async (req, res, next) => {
  try {
    const { agentId } = req.query;

    const salesPurchaseSummary = await carDashBoardModel.getSalesPurchaseSummary({ agentId });
    res.status(200).json(salesPurchaseSummary);
  } catch (err) {
    next(err);
  }
};




exports.getInquiryStatus = async (req, res, next) => {
  try {
    const { agentId } = req.query;

    const inquiryStatus = await carDashBoardModel.getInquiryStatus({ agentId });
    res.status(200).json(inquiryStatus);
  } catch (err) {
    next(err);
  }
};

exports.getNoticeStatus = async (req, res, next) => {
  try {
    const { agentId } = req.query;

    const noticeStatus = await carDashBoardModel.getNoticeStatus({ agentId });
    res.status(200).json(noticeStatus);
  } catch (err) {
    next(err);
  }
};

exports.getFaqList = async (req, res, next) => {
  try {
    const faqBoard = await carFaqBoardModel.getFaqList(req.body);
    res.status(200).json(faqBoard);
  } catch (err) {
    next(err);
  }
};

exports.getFaqDetail = async (req, res, next) => {
  try {
    const { faqNo } = req.query;

    const faqBoard = await carFaqBoardModel.getFaqDetail({ faqNo });
    res.status(200).json(faqBoard);
  } catch (err) {
    next(err);
  }
};


// faq 등록
exports.insertFaqBoard = async (req, res, next) => {
  try {
    await carFaqBoardModel.insertFaqBoard(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// faq 수정
exports.updateFaqBoard = async (req, res, next) => {
  try {
    await carFaqBoardModel.updateFaqBoard(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// 댓글 등록
exports.insertRplBoard = async (req, res, next) => {
  try {
    await carFaqBoardModel.insertRplBoard(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// 댓글 수정
exports.updateRplBoard = async (req, res, next) => {
  try {
    await carFaqBoardModel.updateRplBoard(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};


// 매입비 항목 관리 (제시-매입정보)
exports.getBuyFeeList = async (req, res, next) => {
  try {
    const { fee_car_regid } = req.query;

    const buyFeeList = await carSelectModel.getBuyFeeList({ fee_car_regid });
    res.status(200).json(buyFeeList);
  } catch (err) {
    next(err);
  }
};

// 매입비 항목 등록
exports.insertBuyFee = async (req, res, next) => {
  try {
    const { fee_car_regid, fee_kind, fee_agent, fee_no, fee_title, fee_cond, fee_rate, fee_amt, fee_inamt, fee_indate, fee_indesc } = req.body;  

    await carInsertModel.insertBuyFee({ fee_car_regid, fee_kind, fee_agent, fee_no, fee_title, fee_cond, fee_rate, fee_amt, fee_inamt, fee_indate, fee_indesc });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// 매입비 항목 수정
exports.updateBuyFee = async (req, res, next) => {
  try {
    const { fee_seqno, fee_no, fee_title, fee_cond, fee_rate, fee_amt, fee_inamt, fee_indate, fee_indesc } = req.body;  

    await carUpdateModel.updateBuyFee({ fee_seqno, fee_no, fee_title, fee_cond, fee_rate, fee_amt, fee_inamt, fee_indate, fee_indesc });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// 매도비 항목 관리 (제시-매도정보)
exports.getSellInfoList = async (req, res, next) => {
  try {
    const { fee_car_regid } = req.query;

    const sellInfoList = await carSelectModel.getSellInfoList({ fee_car_regid });
    res.status(200).json(sellInfoList);
  } catch (err) {
    next(err);
  }
};

// 매도비 항목 관리 (제시-매도정보)
exports.getSellFeeList = async (req, res, next) => {
  try {
    const { fee_car_regid } = req.query;

    const sellFeeList = await carSelectModel.getSellFeeList({ fee_car_regid });
    res.status(200).json(sellFeeList);
  } catch (err) {
    next(err);
  }
};

// 매도비 항목 등록
exports.insertSellFee = async (req, res, next) => {
  try {
    const { fee_car_regid, fee_kind, fee_agent, fee_no, fee_title, fee_cond, fee_rate, fee_amt, fee_inamt, fee_indate, fee_indesc } = req.body; 

    await carInsertModel.insertSellFee({ fee_car_regid, fee_kind, fee_agent, fee_no, fee_title, fee_cond, fee_rate, fee_amt, fee_inamt, fee_indate, fee_indesc });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};



// 매입비 합계 변경
exports.updateBuyFeeSum = async (req, res, next) => {
  try {
    const { fee_car_regid, buy_total_fee,  buy_real_fee} = req.body;

    await carUpdateModel.updateBuyFeeSum({ fee_car_regid, buy_total_fee,  buy_real_fee});
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};




///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 상품화비 2.0
///////////////////////////////////////////////////////////////////////////////////////////////////////////////


// 상품화비 목록 조회
exports.getGoodsFeeList = async (req, res, next) => {
  try {
    const goodsFeeList = await carGoodsModel.getGoodsFeeList(req.body);
    res.status(200).json(goodsFeeList);
  } catch (err) {
    next(err);
  }
};



// 상품화비 목록 조회
exports.getGoodsFeeCarSumList = async (req, res, next) => {
  try {
    const goodsFeeCarSumList = await carGoodsModel.getGoodsFeeCarSumList(req.body);
    res.status(200).json(goodsFeeCarSumList);
  } catch (err) {
    next(err);
  }
};


// 상품화비 상세 조회
exports.getCarGoodsInfo = async (req, res, next) => {
  try {
    const { carRegId } = req.query;

    const carGoodsInfo = await carGoodsModel.getCarGoodsInfo({ carRegId });
    res.status(200).json(carGoodsInfo);
  } catch (err) {
    next(err);
  }
};

//  상품화비 상세 리스트 조회
exports.getGoodsFeeDetail = async (req, res, next) => {
  try {
    const { goodsFeeSeq } = req.query;

    const goodsFeeDetail = await carGoodsModel.getGoodsFeeDetail({ goodsFeeSeq });
    res.status(200).json(goodsFeeDetail);
  } catch (err) {
    next(err);
  }
};


//  상품화비 상세 리스트 조회
exports.getGoodsFeeCarSummary = async (req, res, next) => {
  try {
    const goodsFeeCarSummary = await carGoodsModel.getGoodsFeeCarSummary(req.body);
    res.status(200).json(goodsFeeCarSummary);
  } catch (err) {
    next(err);
  }
};


// 상품화비용 지출 내역 저장
exports.insertGoodsFee = async (req, res, next) => {
  try {
    const {   carRegId,         // 차량 등록 ID
      expdItemCd,       // 지출 항목 코드
      expdItemNm,       // 지출 항목 명
      expdSctCd,        // 지출 구분 코드
      expdAmt,          // 지출 금액
      expdSupPrc,       // 지출 공급가
      expdVat,          // 지출 부가세
      expdDt,           // 지출 일자
      expdMethCd,       // 지출 방식 코드
      expdEvdcCd,       // 지출 증빙 코드
      taxSctCd,         // 세금 구분 코드
      txblIssuDt,       // 세금계산서 발행 일자
      rmrk,             // 비고
      adjInclusYn,      // 정산 포함 여부
      cashRecptRcgnNo,  // 현금 영수증 식별 번호
      cashMgmtkey,      // 현금 관리키
      delYn,            // 삭제여부
      regDtime,         // 등록 일시
      regrId,           // 등록자 ID
      modDtime,         // 수정 일시
      modrId            // 수정자 ID
      } = req.body;  

    await carGoodsModel.insertGoodsFee({ carRegId, expdItemCd, expdItemNm, expdSctCd, expdAmt, expdSupPrc, expdVat, expdDt, expdMethCd, expdEvdcCd, taxSctCd, txblIssuDt, rmrk, adjInclusYn, cashRecptRcgnNo, cashMgmtkey, delYn, regDtime, regrId, modDtime, modrId });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};  

exports.updateGoodsFee = async (req, res, next) => {
  try {
    const { 
      goodsFeeSeq,      // 상품화비 순번
      carRegId,         // 차량 등록 ID
      expdItemCd,       // 지출 항목 코드
      expdItemNm,       // 지출 항목 명
      expdSctCd,        // 지출 구분 코드
      expdAmt,          // 지출 금액
      expdSupPrc,       // 지출 공급가
      expdVat,          // 지출 부가세
      expdDt,           // 지출 일자
      expdMethCd,       // 지출 방식 코드
      expdEvdcCd,       // 지출 증빙 코드
      taxSctCd,         // 세금 구분 코드
      txblIssuDt,       // 세금계산서 발행 일자
      rmrk,             // 비고
      adjInclusYn,      // 정산 포함 여부
      cashRecptRcgnNo,  // 현금 영수증 식별 번호
      cashMgmtkey,      // 현금 관리키
      delYn,            // 삭제여부
      regDtime,         // 등록 일시
      regrId,           // 등록자 ID
      modDtime,         // 수정 일시
      modrId            // 수정자 ID
      } = req.body;  

    await carGoodsModel.updateGoodsFee({ goodsFeeSeq, carRegId, expdItemCd, expdItemNm, expdSctCd, expdAmt, expdSupPrc, expdVat, expdDt, expdMethCd, expdEvdcCd, taxSctCd, txblIssuDt, rmrk, adjInclusYn, cashRecptRcgnNo, cashMgmtkey, delYn, regDtime, regrId, modDtime, modrId });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};  


exports.deleteAllGoodsFee = async (req, res, next) => {
  try {
    const { carRegId, usrId } = req.query;
    await carGoodsModel.deleteAllGoodsFee({ carRegId, usrId });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.deleteGoodsFee = async (req, res, next) => {
  try {
    const { goodsFeeSeq, usrId } = req.query;
    await carGoodsModel.deleteGoodsFee({ goodsFeeSeq, usrId });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 재고금융 2.0
///////////////////////////////////////////////////////////////////////////////////////////////////////////////


// 재고금융 등록/리스트 조회
exports.getCarLoanSumList = async (req, res, next) => {
  try {
    const carLoanSumList = await carLoanModel.getCarLoanSumList(req.body);
    res.status(200).json(carLoanSumList);
  } catch (err) {
    next(err);
  }
};


// 이자납입리스트 조회
exports.getCarLoanList = async (req, res, next) => {
  try {
    const carLoanList = await carLoanModel.getCarLoanList(req.body);
    res.status(200).json(carLoanList);
  } catch (err) {
    next(err);
  }
};


// 캐피탈사별 이용현황 조회
exports.getCarLoanSummary = async (req, res, next) => {
  try {
    const carLoanSummary = await carLoanModel.getCarLoanSummary(req.body);
    res.status(200).json(carLoanSummary);
  } catch (err) {
    next(err);
  }
};


// 차량 대출 정보 조회
exports.getCarLoanInfo = async (req, res, next) => {
  try {
    const { carRegId } = req.query;
    const carLoanInfo = await carLoanModel.getCarLoanInfo({ carRegId });
    res.status(200).json(carLoanInfo);
  } catch (err) {
    next(err);
  }
};

// 재고금융 등록
exports.insertCarLoan = async (req, res, next) => {
  try {
    const carLoanData = req.body;
    
    await carLoanModel.insertCarLoan(carLoanData);
    
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// 재고금융 수정 등록
exports.updateCarLoan = async (req, res, next) => {
  try {
    await carLoanModel.updateCarLoan(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// 재고금융 삭제
exports.deleteCarLoan = async (req, res, next) => {
  try { 
    const { carRegId, flag_type } = req.query;

    await carLoanModel.deleteCarLoan({ carRegId, flag_type });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};


// 재고금융 등록
exports.insertAgentLoanCorp = async (req, res, next) => {
  try {
    const agentLoanCorpData = req.body;
    
    await carLoanModel.insertAgentLoanCorp(agentLoanCorpData);
    
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// 재고금융 수정 등록
exports.updateAgentLoanCorp = async (req, res, next) => {
  try {
    await carLoanModel.updateAgentLoanCorp(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// 재고금융 삭제
exports.deleteAgentLoanCorp = async (req, res, next) => {
  try { 
    const { agentId, loan_corp_cd, flag_type } = req.query;

    await carLoanModel.deleteAgentLoanCorp({ agentId, loan_corp_cd, flag_type });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 계좌 2.0
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 계좌 목록 조회
exports.getCarAcctList = async (req, res, next) => {
  try {
    const carAcctList = await carAcctModel.getCarAcctList(req.body);
    res.status(200).json(carAcctList);
  } catch (err) {
    next(err);
  }
};

// 계좌정보 합계 조회
exports.getCarAcctSummary = async (req, res, next) => {
  try {
    const carAcctSummary = await carAcctModel.getCarAcctSummary(req.body);
    res.status(200).json(carAcctSummary);
  } catch (err) {
    next(err);
  }
};

// 계좌정보 상세 조회
exports.getCarAcctDetail = async (req, res, next) => {
  try {
    const { acctDtlSeq } = req.query;


    console.log('*********acctDtlSeq:', acctDtlSeq);
    const carAcctDetail = await carAcctModel.getCarAcctDetail({ acctDtlSeq });
    res.status(200).json(carAcctDetail);
  } catch (err) {
    next(err);
  }
};

// 계좌정보 목록 조회
exports.getAgentAcctList = async (req, res, next) => {
  try {
    const { agentId } = req.query;
    const agentAcctList = await carAcctModel.getAgentAcctList({ agentId });
    res.status(200).json(agentAcctList);
  } catch (err) {
    next(err);
  }
};


// 계좌정보 상세 저장
exports.insertCarAcctDetail = async (req, res, next) => {
  try {
    await carAcctModel.insertCarAcctDetail(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};


// 계좌정보 상세 수정
exports.updateCarAcctDetail = async (req, res, next) => {
  try {
    await carAcctModel.updateCarAcctDetail(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};


// 계좌정보 상세 삭제
exports.deleteCarAcctDetail = async (req, res, next) => {
  try {
    await carAcctModel.deleteCarAcctDetail(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 정산 2.0
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 정산 목록 조회
exports.getCarAdjList = async (req, res, next) => {
  try {
    const carAdjList = await carAdjModel.getCarAdjList(req.body);
    res.status(200).json(carAdjList);
  } catch (err) {
    next(err);
  }
};


// 정산 합계 조회
exports.getCarAdjSummary = async (req, res, next) => {
  try {
    const carAdjSummary = await carAdjModel.getCarAdjSummary(req.body);
    res.status(200).json(carAdjSummary);
  } catch (err) {
    next(err);
  }
};

// 정산 상세 조회
exports.getCarAdjInfo = async (req, res, next) => {
  try {
    const { carRegId } = req.query;
    const carAdjDetail = await carAdjModel.getCarAdjInfo({ carRegId });
    res.status(200).json(carAdjDetail);
  } catch (err) {
    next(err);
  }
};

// 정산 상세 목록 조회
exports.getCarAdjDtlList = async (req, res, next) => {
  try {
    const { carRegId } = req.query;
    const carAdjDtlList = await carAdjModel.getCarAdjDtlList({ carRegId });
    res.status(200).json(carAdjDtlList);
  } catch (err) {
    next(err);
  }
};

// 정산 저장 (정산 상세 포함)
exports.insertCarAdj = async (req, res, next) => {
  try {
    await carAdjModel.insertCarAdj(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// 정산 수정 (정산 상세 포함)
exports.updateCarAdj = async (req, res, next) => {
  try {
    await carAdjModel.updateCarAdj(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// 정산 삭제
exports.deleteCarAdj = async (req, res, next) => {
  try {
    const { carRegId } = req.query;
    await carAdjModel.deleteCarAdj({ carRegId });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// 정산 상세 삭제
exports.deleteCarAdjDtl = async (req, res, next) => {
  try {
    const { carRegId, sctCd, seq } = req.query;
    await carAdjModel.deleteCarAdjDtl({ carRegId, sctCd, seq });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 상사 2.0
/////////////////////////////////////////////////////////////////////////////////////////////////////////////// 


// 상사 목록 조회
exports.getCarAgentList = async (req, res, next) => {
  try {
    const carAgentList = await carAgentModel.getCarAgentList(req.body);
    res.status(200).json(carAgentList);
  } catch (err) {
    next(err);
  }
};


// 상사 합계 조회
exports.getCarAgentSummary = async (req, res, next) => {
  try {
    const carAgentSummary = await carAgentModel.getCarAgentSummary(req.body);
    res.status(200).json(carAgentSummary);
  } catch (err) {
    next(err);
  }
};

// 상사 상세 조회
exports.getCarAgentInfo = async (req, res, next) => {
  try {
    const { agentId } = req.query;
    const carAgentInfo = await carAgentModel.getCarAgentInfo({ agentId });
    res.status(200).json(carAgentInfo);
  } catch (err) {
    next(err);
  }
};


// 상사 저장
exports.insertCarAgent = async (req, res, next) => {
  try {
    await carAgentModel.insertCarAgent(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// 상사 수정
exports.updateCarAgent = async (req, res, next) => {
  try {
    await carAgentModel.updateCarAgent(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// 상사 삭제
exports.deleteCarAgent = async (req, res, next) => {
  try {
    const { agentId } = req.query;
    await carAgentModel.deleteCarAgent({ agentId });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 알선 2.0
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 알선 목록 조회
exports.getCarConcilList = async (req, res, next) => {
  try {
    const carConcilList = await carConcilModel.getCarConcilList(req.body);
    res.status(200).json(carConcilList);
  } catch (err) {
    next(err);
  }
};
  
// 알선 합계 조회
exports.getCarConcilSummary = async (req, res, next) => {
  try {
    const carConcilSummary = await carConcilModel.getCarConcilSummary(req.body);
    res.status(200).json(carConcilSummary);
  } catch (err) {
    next(err);
  }
};

// 알선 판매 등록
exports.insertCarConcil = async (req, res, next) => {
  try {
    await carConcilModel.insertCarConcil(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// 알선 판매 상세 조회
exports.getCarConcilInfo = async (req, res, next) => {
  try {
    const { carRegId } = req.query;
    const carConcilInfo = await carConcilModel.getCarConcilInfo({ carRegId });
    res.status(200).json(carConcilInfo);
  } catch (err) {
    next(err);
  }
};

// 알선 판매 수정
exports.updateCarConcil = async (req, res, next) => {
  try {
    await carConcilModel.updateCarConcil(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 전자세금계산서 2.0
/////////////////////////////////////////////////////////////////////////////////////////////////////////////// 

// 전자세금계산서 목록 조회 
exports.getCarTaxList = async (req, res, next) => {
  try {
    const carTaxList = await carTaxModel.getCarTaxList(req.body);
    res.status(200).json(carTaxList);
  } catch (err) {
    next(err);
  }
};

// 전자세금계산서 합계 조회
exports.getCarTaxSummary = async (req, res, next) => {
  try {
    const carTaxSummary = await carTaxModel.getCarTaxSummary(req.body);
    res.status(200).json(carTaxSummary);
  } catch (err) {
    next(err);
  }
};

// 전자세금계산서 상세 조회
exports.getCarTaxInfo = async (req, res, next) => {
  try {
    const { carRegId } = req.query;  
    const carTaxDetail = await carTaxModel.getCarTaxInfo({ carRegId });
    res.status(200).json(carTaxDetail);
  } catch (err) {
    next(err);
  }
};


// 전자세금계산서 항목 상세 조회
exports.getCarTaxItemInfo = async (req, res, next) => {
  try {
    const { taxMgmtkey } = req.query;
    const carTaxItemInfo = await carTaxModel.getCarTaxItemInfo({ taxMgmtkey });
    res.status(200).json(carTaxItemInfo);
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 현금영수증 2.0
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 현금영수증 목록 조회
exports.getCarCashList = async (req, res, next) => {
  try {
    const carCashList = await carCashModel.getCarCashList(req.body);
    res.status(200).json(carCashList);
  } catch (err) {
    next(err);
  }
};
  
// 현금영수증 합계 조회
exports.getCarCashSummary = async (req, res, next) => {
  try {
    const carCashSummary = await carCashModel.getCarCashSummary(req.body);
    res.status(200).json(carCashSummary);
  } catch (err) {
    next(err);
  }
};

// 현금영수증 상세 조회
exports.getCarCashInfo = async (req, res, next) => {
  try {
    const { carRegId } = req.query;  
    const carCashDetail = await carCashModel.getCarCashInfo({ carRegId });
    res.status(200).json(carCashDetail);
  } catch (err) {
    next(err);
  }
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 시제(계좌)
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 계좌정보 등록
exports.insertAccountInfo = async (req, res, next) => {
  try {
    const { agentId, bankCode, accountNumber, memo, accountName } = req.body;

    await carInsertModel.insertAccountInfo({ agentId, bankCode, accountNumber, memo, accountName });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};


// 계좌정보 수정
exports.updateAccountInfo = async (req, res, next) => {
  try {
    const { agentId, bankCode, accountNumber, memo, accountName } = req.body;

    await carUpdateModel.updateAccountInfo({ agentId, bankCode, accountNumber, memo, accountName });
    res.status(200).json({ success: true });
  } catch (err) { 
    next(err);
  }
};

// 계좌정보 조회
exports.getAccountInfo = async (req, res, next) => {
  try {
    const { agentId } = req.query;

    const accountInfo = await carSelectModel.getAccountInfo({ agentId });
    res.status(200).json(accountInfo);
  } catch (err) {
    next(err);
  }
};

// 시재(계좌입출금내역) 관리
exports.getAssetList = async (req, res, next) => {
  try {
    const { agentId, accountNumber, startDate, endDate } = req.body;

    const assetList = await carSelectModel.getAssetList({ agentId, accountNumber, startDate, endDate });
    res.status(200).json(assetList);
  } catch (err) {
    next(err);
  }
};

// 시재 합계 조회
exports.getAssetSum = async (req, res, next) => {
  try {
    const { agentId, accountNumber, startDate, endDate } = req.body;

    const assetSum = await carSelectModel.getAssetSum({ agentId, accountNumber, startDate, endDate });
    res.status(200).json(assetSum);
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 환경 설정
///////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
// 재고금융
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 재고금융 목록 조회
exports.getFinanceList = async (req, res, next) => {
  try {
    const { agentId } = req.body;

    const financeList = await carSelectModel.getFinanceList({ agentId });
    res.status(200).json(financeList);
  } catch (err) {
    next(err);
  }
};

// 재고금융 합계 조회
exports.getFinanceSum = async (req, res, next) => {
  try {
    const { agentId } = req.body;      

    const financeSum = await carSelectModel.getFinanceSum({ agentId });
    res.status(200).json(financeSum);
  } catch (err) {
    next(err);
  }
};


// 재고금융 상세 조회
exports.getFinanceDetail = async (req, res, next) => {
  try {
    const { carRegid } = req.query; 

    const financeDetail = await carSelectModel.getFinanceDetail({ carRegid });
    res.status(200).json(financeDetail);
  } catch (err) {
    next(err);
  }
};


// 재고금융 차량 상세 조회
exports.getFinanceDetailCarInfo = async (req, res, next) => {
  try {
    const { carRegid } = req.query;

    const financeDetailCarInfo = await carSelectModel.getFinanceDetailCarInfo({ carRegid });
    res.status(200).json(financeDetailCarInfo);
  } catch (err) {
    next(err);
  }
};

// 재고금융 차량 상세 목록 조회
exports.getFinanceDetailList = async (req, res, next) => {
  try {
    const { carRegid } = req.query;

    const financeDetailCarList = await carSelectModel.getFinanceDetailList({ carRegid });
    res.status(200).json(financeDetailCarList);
  } catch (err) {
    next(err);
  }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
// 운영현황 - 매출관리
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 매출관리 목록 조회
exports.getSystemSalesList = async (req, res, next) => {
  try  {
    const { agentId, page, pageSize } = req.body;

    const systemSalesList = await carSelectModel.getSystemSalesList({ agentId, page, pageSize });
    res.status(200).json(systemSalesList);
  } catch (err) {
    next(err);
  }
};

// 매출관리 합계 조회
exports.getSystemSalesSum = async (req, res, next) => {
  try {
    const { agentId } = req.body;  

    const systemSalesSum = await carSelectModel.getSystemSalesSum({ agentId });
    res.status(200).json(systemSalesSum);
  } catch (err) {
    next(err);
  }
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
// 운영현황 - 매입관리
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 매입관리 목록 조회
exports.getSystemPurchaseList = async (req, res, next) => {
  try {
    const { agentId } = req.body;

    const systemPurchaseList = await carSelectModel.getSystemPurchaseList({ agentId });
    res.status(200).json(systemPurchaseList);
  } catch (err) {
    next(err);
  }
};

// 매입관리 합계 조회
exports.getSystemPurchaseSum = async (req, res, next) => {
  try {
    const { agentId } = req.body;

    const systemPurchaseSum = await carSelectModel.getSystemPurchaseSum({ agentId });
    res.status(200).json(systemPurchaseSum);
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 운영현황 - 원천징수
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 원천징수 목록 조회
exports.getSystemWithholdingList = async (req, res, next) => {
  try {
    const { agentId } = req.body;

    const systemWithholdingList = await carSelectModel.getSystemWithholdingList({ agentId });
    res.status(200).json(systemWithholdingList);
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 운영현황 - 정산내역
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 정산내역 목록 조회
exports.getSystemSettleList = async (req, res, next) => {
  try {
    const { agentId } = req.body;

    const systemSettleList = await carSelectModel.getSystemSettleList({ agentId });
    res.status(200).json(systemSettleList);
  } catch (err) {
    next(err);
  }
};

// 정산내역 합계 조회
exports.getSystemSettleSum = async (req, res, next) => {    
  try {
    const { agentId } = req.body;

    const systemSettleSum = await carSelectModel.getSystemSettleSum({ agentId });
    res.status(200).json(systemSettleSum);
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 운영현황 - 종합내역
/////////////////////////////////////////////////////////////////////////////////////////////////////////////// 

// 종합내역 딜러 조회
exports.getSystemOverallDealerList = async (req, res, next) => {
  try {
    const { agentId } = req.body;  

    const systemOverallDealerList = await carSelectModel.getSystemOverallDealerList({ agentId });
    res.status(200).json(systemOverallDealerList);
  } catch (err) {
    next(err);
  }
};

// 종합내역 딜러 실적 목록 조회
exports.getSystemOverallDealerSumList = async (req, res, next) => {
  try {
    const { agentId } = req.body;  

    const systemOverallDealerSumList = await carSelectModel.getSystemOverallDealerSumList({ agentId });
    res.status(200).json(systemOverallDealerSumList);
  } catch (err) {
    next(err);
  }
};

// 종합내역 현 제시 목록 조회
exports.getSystemOverallSuggestionList = async (req, res, next) => {
  try {
    const { agentId } = req.body;  

    const systemOverallSuggestionList = await carSelectModel.getSystemOverallSuggestionList({ agentId });
    res.status(200).json(systemOverallSuggestionList);
  } catch (err) {
    next(err);
  }
};

// 종합내역 매입매도비 목록 조회
exports.getSystemOverallBuySellList = async (req, res, next) => {
  try {
    const { agentId } = req.body;    

    const systemOverallBuySellList = await carSelectModel.getSystemOverallBuySellList({ agentId });
    res.status(200).json(systemOverallBuySellList);
  } catch (err) {
    next(err);
  }
};

// 종합내역 상품화비 목록 조회
exports.getSystemOverallGoodsFeeList = async (req, res, next) => {
  try {
    const { agentId } = req.body;  

    const systemOverallGoodsFeeList = await carSelectModel.getSystemOverallGoodsFeeList({ agentId });
    res.status(200).json(systemOverallGoodsFeeList);
  } catch (err) {
    next(err);
  }
};

// 종합내역 재고금융 목록 조회
exports.getSystemOverallFinanceList = async (req, res, next) => {
  try {
    const { agentId } = req.body;  

    const systemOverallFinanceList = await carSelectModel.getSystemOverallFinanceList({ agentId });
    res.status(200).json(systemOverallFinanceList);
  } catch (err) {
    next(err);
  }
};

// 종합내역 매도현황 목록 조회
exports.getSystemOverallSellList = async (req, res, next) => {
  try {
    const { agentId } = req.body;  

    const systemOverallSellList = await carSelectModel.getSystemOverallSellList({ agentId });
    res.status(200).json(systemOverallSellList);
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 운영현황 - 월별 현황  
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 월별 현황 목록 조회
exports.getSystemMonthlyList = async (req, res, next) => {
  try {
    const { agentId } = req.body;

    const systemMonthlyList = await carSelectModel.getSystemMonthlyList({ agentId });
    res.status(200).json(systemMonthlyList);
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 운영현황 - 예상부가세  
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 예상부가세 매출 현황 목록 조회
exports.getSystemVatSalesList = async (req, res, next) => {
  try {
    const { agentId } = req.body;

    const systemVatSalesList = await carSelectModel.getSystemVatSalesList({ agentId });
    res.status(200).json(systemVatSalesList);
  } catch (err) {
    next(err);
  }
};

// 예상부가세 매입 현황 목록 조회
exports.getSystemVatPurchaseList = async (req, res, next) => {
  try {
    const { agentId } = req.body;  

    const systemVatPurchaseList = await carSelectModel.getSystemVatPurchaseList({ agentId });
    res.status(200).json(systemVatPurchaseList);
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 현금영수증 발행
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 현금영수증 발행 목록 조회
exports.getCashBillList = async (req, res, next) => {
  try {
    const { agentId } = req.body;
    const cashBillList = await carSelectModel.getCashBillList({ agentId });

    res.status(200).json(cashBillList);
  } catch (err) {
    next(err);
  }
};


// 현금영수증 발행 사전 데이터 조회 - 총거래금액, 공급가액, 부가세
exports.getCashBillAmount = async (req, res, next) => {
  try {
    const { costSeq } = req.query;
    const cashBillAmount = await carSelectModel.getCashBillAmount({
      costSeq,
    });
    res.status(200).json(cashBillAmount);
  } catch (err) {
    next(err);
  }
};



///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 현금영수증 발행 리스트 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 현금영수증 발행 리스트 조회
exports.getReceiptIssueList = async (req, res, next) => {
  try {
    const { agentId } = req.body;
    const receiptIssueList = await carSelectModel.getReceiptIssueList({ agentId });

    res.status(200).json(receiptIssueList);
  } catch (err) {
    next(err);
  }
};


// 현금영수증 발행 리스트 합계 조회
exports.getReceiptIssueSummary = async (req, res, next) => {
  try {
    const { agentId } = req.body;
    const receiptIssueSummary = await carSelectModel.getReceiptIssueSummary({ agentId });

    res.status(200).json(receiptIssueSummary);
  } catch (err) {
    next(err);
  }
};



///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 전자세금계산서 발행 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 전자세금계산서 발행 목록 조회
exports.getTaxInvoiceList = async (req, res, next) => {
  try {
    const { agentId } = req.body;
    const taxInvoiceList = await carSelectModel.getTaxInvoiceList({ agentId });

    res.status(200).json(taxInvoiceList);
  } catch (err) {
    next(err);
  }
};


// 전자세금계산서 발행 사전 데이터 조회 - 총거래금액, 공급가액, 부가세
exports.getTaxInvoiceAmount = async (req, res, next) => {
  try {
    const { eInvoiceSeq } = req.query;
    const taxInvoiceAmount = await carSelectModel.getTaxInvoiceAmount({
      eInvoiceSeq,
    });
    res.status(200).json(taxInvoiceAmount);
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 전자세금계산서 발행 리스트 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 전자세금계산서 발행 리스트 조회
exports.getTaxIssueList = async (req, res, next) => {
  try {
    const { agentId } = req.body;
    const taxIssueList = await carSelectModel.getTaxIssueList({ agentId });

    res.status(200).json(taxIssueList);
  } catch (err) {
    next(err);
  }
};


// 전자세금계산서 발행 리스트 합계 조회
exports.getTaxIssueSummary = async (req, res, next) => {
  try {
    const { agentId } = req.body;
    const taxIssueSummary = await carSelectModel.getTaxIssueSummary({ agentId });

    res.status(200).json(taxIssueSummary);
  } catch (err) {
    next(err);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 매도 리스트
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 매도 리스트 조회
exports.getSellList = async (req, res, next) => {
  try {
    const { agentId, page, pageSize } = req.body;

    const sellList = await carSelectModel.getSellList({ agentId, page, pageSize });

    res.status(200).json(sellList);
  } catch (err) {
    next(err);
  }
};

// 매도 종합 합계 조회
exports.getSellSum = async (req, res, next) => {
  try {
    const { agentId } = req.body;      

    const sellSum = await carSelectModel.getSellSum({ agentId });
    res.status(200).json(sellSum);
  } catch (err) {
    next(err);
  }
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 매도 상세 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 매도 리스트 상세 목록 조회
exports.getSellDetail = async (req, res, next) => {
  try {
    const { sell_car_regid } = req.query;     

    const sellDetail = await carSelectModel.getSellDetail({ sell_car_regid });
    res.status(200).json(sellDetail);
  } catch (err) {
    next(err);
  }
};  

// 매도비 조회
exports.getSellFee = async (req, res, next) => {
  try {
    const { sell_car_regid } = req.query;  

    const sellFee = await carSelectModel.getSellFee({ sell_car_regid });
    res.status(200).json(sellFee);
  } catch (err) {
    next(err);
  }
};

// 재고금융이자 조회
exports.getFinanceInterest = async (req, res, next) => {
  try {
    const { sell_car_regid } = req.query;  

    const financeInterest = await carSelectModel.getFinanceInterest({ sell_car_regid });
    res.status(200).json(financeInterest);
  } catch (err) {
    next(err);
  }
};

// 매출증빙 목록 조회
exports.getSellProofList = async (req, res, next) => {
  try {
    const { sell_car_regid } = req.query; 

    const sellProofList = await carSelectModel.getSellProofList({ sell_car_regid });
    res.status(200).json(sellProofList);
  } catch (err) {
    next(err);
  }
};

// 매도 취소 변경
exports.updateSellCancel = async (req, res, next) => {
  try {
    const { sell_car_regid } = req.body;  

    const updateSellCancel = await carUpdateModel.updateSellCancel({ sell_car_regid });
    res.status(200).json(updateSellCancel);
  } catch (err) {
    next(err);
  }
};  


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 정산 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 매입매도비 상세 조회
exports.getBuyDetail = async (req, res, next) => {
  try {
    const { sell_car_regid } = req.query; 

    const buyDetail = await carSelectModel.getBuyDetail({ sell_car_regid });
    res.status(200).json(buyDetail);
  } catch (err) {
    next(err);
  }
};  

// 정산 매입 정보 조회
exports.getSettlementPurchaseInfo = async (req, res, next) => {
  try {
    const { carRegid } = req.query;

    const settlementPurchaseInfo = await carSelectModel.getSettlementPurchaseInfo({ carRegid });
    res.status(200).json(settlementPurchaseInfo);
  } catch (err) {
    next(err);
  }
};  

// 정산 매입매도비 합계 조회
exports.getSettlementPurchaseFee = async (req, res, next) => {
  try {
    const { carRegid } = req.query;

    const settlementPurchaseInfo = await carSelectModel.getSettlementPurchaseFee({ carRegid });
    res.status(200).json(settlementPurchaseInfo);
  } catch (err) {
    next(err);
  }
};  


// 정산 매도비 조회
exports.getSettlementPurchaseFeeDiff = async (req, res, next) => {
  try {
    const { carRegid } = req.query; 

    const settlementPurchaseFeeDiff = await carSelectModel.getSettlementPurchaseFeeDiff({ carRegid });
    res.status(200).json(settlementPurchaseFeeDiff);
  } catch (err) {
    next(err);
  }
};  

// 정산 매입매도비 1% 조회
exports.getSettlementPurchaseFeeOnePercent = async (req, res, next) => {
  try {
    const { carRegid } = req.query; 

    const settlementPurchaseFeeOnePercent = await carSelectModel.getSettlementPurchaseFeeOnePercent({ carRegid });
    res.status(200).json(settlementPurchaseFeeOnePercent);
  } catch (err) {
    next(err);
  }
};  

// 정산 상품화비(부가세 공제건만 가져옴)
exports.getSettlementGoodsFee = async (req, res, next) => {
  try {
    const { carRegid, goodsDealsang, goodsTaxgubn } = req.query; 

    const settlementGoodsFee = await carSelectModel.getSettlementGoodsFee({ carRegid, goodsDealsang, goodsTaxgubn });
    res.status(200).json(settlementGoodsFee);
  } catch (err) {
    next(err);
  }
};  


// 정산 상품화비(부가세 공제건만 가져옴)
exports.getSettlementGoodsDealFee = async (req, res, next) => {
  try {
    const { carRegid } = req.query; 

    const settlementGoodsDealFee = await carSelectModel.getSettlementGoodsDealFee({ carRegid });
    res.status(200).json(settlementGoodsDealFee);
  } catch (err) {
    next(err);
  }
};  

// 정산 상품화비 합계 조회
exports.getSettlementGoodsFeeSum = async (req, res, next) => {
  try {
    const { carRegid } = req.query; 

    const settlementGoodsFeeSum = await carSelectModel.getSettlementGoodsFeeSum({ carRegid });
    res.status(200).json(settlementGoodsFeeSum);
  } catch (err) {
    next(err);
  }
};  

// 정산 매도비 조회
exports.getSettlementSellFee = async (req, res, next) => {
  try {
    const { carRegid } = req.query;  

    const settlementSellFee = await carSelectModel.getSettlementSellFee({ carRegid });
    res.status(200).json(settlementSellFee);
  } catch (err) {
    next(err);
  }
};  

// 정산 수수료 표준 금액 조회
exports.getSettlementSellFeeStandard = async (req, res, next) => {
  try {
    const { carRegid } = req.query;  

    const settlementSellFeeStandard = await carSelectModel.getSettlementSellFeeStandard({ carRegid });
    res.status(200).json(settlementSellFeeStandard);
  } catch (err) {
    next(err);
  }
};  

// 매도 상세 조회
exports.getSoldDetail = async (req, res, next) => {
  try {
    const { carRegid } = req.query;   

    const soldDetail = await carSelectModel.getSoldDetail({ carRegid });
    res.status(200).json(soldDetail);
  } catch (err) {
    next(err);
  }
};  

// 정산 재고금융 존재 여부
exports.getSettlementStockFinanceExist = async (req, res, next) => {
  try {
    const { carRegid } = req.query;   

    const settlementStockFinanceExist = await carSelectModel.getSettlementStockFinanceExist({ carRegid });
    res.status(200).json(settlementStockFinanceExist);
  } catch (err) {
    next(err);
  }
};  

// 정산 이자 수익 계산
exports.getSettlementInterestRevenue = async (req, res, next) => {
  try {
    const { carRegid } = req.query;   

    const settlementInterestRevenue = await carSelectModel.getSettlementInterestRevenue({ carRegid });
    res.status(200).json(settlementInterestRevenue);
  } catch (err) {
    next(err);
  }
};  

// 재고금융 합계 조회
exports.getSettlementInterestRevenueSum = async (req, res, next) => {
  try {
    const { carRegid } = req.query;   

    const settlementInterestRevenueSum = await carSelectModel.getSettlementInterestRevenueSum({ carRegid });
    res.status(200).json(settlementInterestRevenueSum);
  } catch (err) {
    next(err);
  }
};  

// 매도 미납 총 합계
exports.getSettlementSellMinapSum = async (req, res, next) => {
  try {
    const { carRegid } = req.query;    

    const settlementSellMinapSum = await carSelectModel.getSettlementSellMinapSum({ carRegid });
    res.status(200).json(settlementSellMinapSum);
  } catch (err) {
    next(err);
  }
};  

// 정산 매입,매도,재고금융 명칭 가져오기
exports.getSettlementStockFinanceName = async (req, res, next) => {
  try {
    const { carRegid } = req.query;   

    const settlementStockFinanceName = await carSelectModel.getSettlementStockFinanceName({ carRegid });
    res.status(200).json(settlementStockFinanceName);
  } catch (err) {
    next(err);
  }
};  

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 환경설정
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 상사 정보 관리
exports.getCompanyInfo = async (req, res, next) => {
  try {
    const { agentId } = req.body;
    const companyInfo = await carSelectModel.getCompanyInfo({ agentId });
    res.status(200).json(companyInfo);
  } catch (err) { 
    next(err);
  }
};  



// 상사 조합 딜러 관리
exports.getCompanySangsaDealer = async (req, res, next) => {
  try {
    const { sangsaCode } = req.body;
    const companySangsaDealer = await carSelectModel.getCompanySangsaDealer({ sangsaCode });
    res.status(200).json(companySangsaDealer);
  } catch (err) {
    next(err);
  }
};  


// 상사 딜러 관리
exports.getCompanyDealer = async (req, res, next) => {
  try {
    const { agentId } = req.body;
    const companyDealer = await carSelectModel.getCompanyDealer({ agentId });
    res.status(200).json(companyDealer);
  } catch (err) {
    next(err);
  }
};  


// 매입비 설정 조회
exports.getPurchaseCost = async (req, res, next) => {
  try {
    const { agentId } = req.body;
    const purchaseCost = await carSelectModel.getPurchaseCost({ agentId });
    res.status(200).json(purchaseCost);
  } catch (err) {
    next(err);
  }
};  


// 매도비 설정 합계 조회
exports.getSellCostSummary = async (req, res, next) => {
  try {
    const { agentId } = req.body;
    const sellCostSummary = await carSelectModel.getSellCostSummary({ agentId });  
    res.status(200).json(sellCostSummary);
  } catch (err) {
    next(err);
  }
};


// 상사지출항목설정 조회  
exports.getCompanyExpense = async (req, res, next) => {
  try {
    const { agentId } = req.body;
    const companyExpense = await carSelectModel.getCompanyExpense({ agentId });
    res.status(200).json(companyExpense);
  } catch (err) {
    next(err);
  }
};  


// 상사수입항목설정 조회
exports.getCompanyIncome = async (req, res, next) => {
  try {
    const { agentId } = req.body;
    const companyIncome = await carSelectModel.getCompanyIncome({ agentId });  
    res.status(200).json(companyIncome);
  } catch (err) {
    next(err);
  }
};  


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 공통
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Mgt 키 조회
exports.getMgtKey = async (req, res, next) => {
  try {
    const { agentId } = req.query;
    const mgtKey = await commonModel.getMgtKey({ agentId });
    res.status(200).json(mgtKey); 
  } catch (err) {
    next(err);
  }
};

// 딜러 조회
exports.getDealerList = async (req, res, next) => {
  try {
    const { agentId } = req.query;
    const dealerList = await commonModel.getDealerList({ agentId });
    res.status(200).json(dealerList);
  } catch (err) {
    next(err);
  }
};


// 상사 대출 업체 대출 한도
exports.getCompanyLoanLimit = async (req, res, next) => {
  try {
    const { agentId } = req.query;
    const companyLoanLimit = await commonModel.getCompanyLoanLimit({ agentId });
    res.status(200).json(companyLoanLimit);
  } catch (err) {
    next(err);
  }
};

// 공통코드 조회
exports.getCDList = async (req, res, next) => {
  try {
    const { grpCD } = req.query;
    const cdList = await commonModel.getCDList({ grpCD });
    res.status(200).json(cdList);
  } catch (err) {
    next(err);
  }
};


// 공통코드 전체 조회
exports.getCDAllList = async (req, res, next) => {
  try {
    const { grpCD } = req.query;
    const cdList = await commonModel.getCDAllList({ grpCD });
    res.status(200).json(cdList);
  } catch (err) {
    next(err);
  }
};


// 공통코드 등록
exports.insertCommCd = async (req, res, next) => {
  try {
    await commonModel.insertCommCd(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// 공통코드 수정
exports.updateCommCd = async (req, res, next) => {
  try {
    await commonModel.updateCommCd(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};


// 고객 목록 조회
exports.getCustomerList = async (req, res, next) => {
  try {
    const { agentId, custNm } = req.query;
    const customerList = await commonModel.getCustomerList({ agentId, custNm });
    res.status(200).json(customerList);
  } catch (err) {
    next(err);
  }
};


// 상사정보관리 조회
exports.getAgentInfo = async (req, res, next) => {
  try {
    const { agentId } = req.query;
    const agentInfo = await carAgentModel.getAgentInfo({ agentId });
    res.status(200).json(agentInfo);
  } catch (err) {
    next(err);
  }
};

// 사용 요청 등록
exports.insertUserRequest = async (req, res, next) => {
  try {
    await usrReqModel.insertUserRequest(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// 사용자 등록
exports.registerUser = async (req, res, next) => {
  try {
    await usrReqModel.registerUser(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// 상사 코드 확인
exports.checkSangsaCode = async (req, res, next) => {
  try {
    const { sangsaCode } = req.query;
    const result = await usrReqModel.checkSangsaCode({ sangsaCode });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// 시스템 사용 요청 조회
exports.getSystemUseRequest = async (req, res, next) => {
  try {
    const result = await usrReqModel.getSystemUseRequest(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// 인증번호 조회
exports.getPhoneAuthNumber = async (req, res, next) => {
  try {
    const result = await usrReqModel.getPhoneAuthNumber(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// 인증번호 확인
exports.checkPhoneAuthNumber = async (req, res, next) => {
  try {
    const result = await usrReqModel.checkPhoneAuthNumber(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};