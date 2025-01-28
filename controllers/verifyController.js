const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY || "your-secret-key";

exports.verifyAuth = (req, res) => {
  const token = req.cookies?.authToken;

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized: No token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return res.status(200).json({ success: true, exp: decoded.exp }); // `exp` 추가
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
