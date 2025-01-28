const { login } = require("../models/loginModel"); // login 함수 가져오기

exports.loginController = async (req, res, next) => {
  try {
    const { loginId, loginPass } = req.body;

    if (!loginId || !loginPass) {
      return res.status(400).json({ success: false, message: "Missing loginId or loginPass" });
    }

    // login 함수 호출
    const loginResult = await login({ loginId, loginPass });

    if (loginResult.success) {
      // 성공 응답: loginResult 데이터만 반환
      res.status(200).json({
        success: true,
        user: loginResult.user, // 사용자 정보
        message: "Login successful",
      });
    } else {
      res.status(401).json({ success: false, message: loginResult.message });
    }
  } catch (err) {
    console.error("Error in loginController:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
