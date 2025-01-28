const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY || "your-secret-key";

exports.verifyAuth = (req, res) => {
  const token = req.cookies?.authToken;

  // 쿠키에 토큰이 없는 경우 처리
  if (!token) {
    console.error("[VerifyAuth] No token found in cookies");
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No token provided",
    });
  }

  try {
    // JWT 검증
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log("[VerifyAuth] Token successfully verified:", decoded);

    return res.status(200).json({
      success: true,
      exp: decoded.exp, // 만료 시간 반환
      user: {
        id: decoded.id,
        role: decoded.role,
      },
    });
  } catch (err) {
    console.error("[VerifyAuth] Token verification failed:", err.message);

    // 토큰 만료 또는 기타 오류 처리
    const message =
            err.name === "TokenExpiredError"
                    ? "Token has expired"
                    : "Invalid token";

    return res.status(401).json({
      success: false,
      message,
    });
  }
};
