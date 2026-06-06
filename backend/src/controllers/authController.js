const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 회원가입
exports.register = async (req, res) => {
  try {
    const { name, student_id, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "이름을 입력해주세요." });
    }
    if (!student_id || !student_id.trim()) {
      return res.status(400).json({ message: "학번을 입력해주세요." });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "이메일을 입력해주세요." });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "비밀번호는 6자 이상이어야 합니다." });
    }

    const existing = await User.findOne({ student_id: student_id.trim() });
    if (existing) {
      return res.status(400).json({ message: "이미 존재하는 학번입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: name.trim(),
      student_id: student_id.trim(),
      email: email.trim(),
      password: hashedPassword,
    });

    res.status(201).json({ message: "회원가입 완료" });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 로그인
exports.login = async (req, res) => {
  try {
    const { student_id, password } = req.body;

    if (!student_id || !password) {
      return res.status(400).json({ message: "학번과 비밀번호를 입력해주세요." });
    }

    const user = await User.findOne({ student_id: student_id.trim() }).lean();
    if (!user) return res.status(404).json({ message: "존재하지 않는 사용자" });

    if (!user.is_active)
      return res.status(403).json({ message: "비활성화된 계정" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "비밀번호 불일치" });

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES },
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES },
    );

    await User.findOneAndUpdate(
      { student_id },
      { refresh_token: refreshToken }
    );

    res.json({ accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 토큰 재발급
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: "토큰 없음" });

    const user = await User.findOne({ refresh_token: refreshToken }).lean();
    if (!user) return res.status(403).json({ message: "유효하지 않은 토큰" });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES },
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: "토큰 만료 또는 오류", error: err.message });
  }
};

// 로그아웃
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await User.findOneAndUpdate(
      { refresh_token: refreshToken },
      { refresh_token: null },
    );
    res.json({ message: "로그아웃 완료" });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};