const jwt = require("jsonwebtoken"); // JWT 라이브러리
const { login } = require("../models/loginModel"); // login 함수 가져오기

// 비밀 키와 토큰 만료 시간 설정 (환경 변수로 설정 권장)
const SECRET_KEY = "your-secret-key";
const TOKEN_EXPIRATION = "1h"; // 토큰 유효 기간: 1시간

exports.loginController = async (req, res, next) => {
  try {
    const { loginId, loginPass } = req.body;

    if (!loginId || !loginPass) {
      return res.status(400).json({ success: false, message: "Missing loginId or loginPass" });
    }

    const loginResult = await login({ loginId, loginPass }); // login 함수 호출

    if (loginResult.success) {
      // JWT 토큰 발급
      const token = jwt.sign(
              { id: loginResult.user.id, role: loginResult.user.role }, // payload: 사용자 정보
              SECRET_KEY, // 비밀 키
              { expiresIn: TOKEN_EXPIRATION } // 토큰 만료 시간
      );

      // 쿠키 설정
      res.cookie("authToken", token, {
        httpOnly: true, // 클라이언트 JS에서 접근 불가
        secure: true,
        maxAge: 3600 * 1000, // 쿠키 만료 시간: 1시간 (밀리초 단위)
        sameSite: 'none',
        path: "/", // 모든 경로에서 쿠키 사용 가능
      });

      // 성공 응답: 토큰 포함
      res.status(200).json({
        success: true,
        user: loginResult.user, // 사용자 정보
        token, // 응답 본문에 토큰 추가
      });
    } else {
      res.status(401).json({ success: false, message: loginResult.message });
    }
  } catch (err) {
    console.error("Error in loginController:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
