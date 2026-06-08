const jwt = require("jsonwebtoken");

// 토큰 검증
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer 토큰"에서 토큰만 추출

  if (!token) return res.status(401).json({ message: "토큰 없음" });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; // { id, role } 저장
    next();
  } catch (err) {
    return res.status(403).json({ message: "토큰 만료 또는 유효하지 않음" });
  }
};

// 관리자 전용
exports.verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "관리자 권한 필요" });
  }
  next();
};
