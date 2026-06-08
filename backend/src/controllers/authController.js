const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const EmailVerification = require("../models/EmailVerification");
const { sendVerificationEmail } = require("../utils/mailer");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 회원가입
exports.register = async (req, res) => {
  try {
    const { name, student_id, email, password } = req.body;

    // 1. 입력값 검증
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

    const trimmedName = name.trim();
    const trimmedStudentId = student_id.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // 2. 이메일 인증 완료 여부 확인
    const verified = await EmailVerification.findOne({
      email: trimmedEmail,
      verified: true,
    });

    if (!verified) {
      return res.status(400).json({ message: "이메일 인증이 완료되지 않았습니다." });
    }

    // 3. 학번 중복 확인
    const existingByStudentId = await User.findOne({ student_id: trimmedStudentId });
    if (existingByStudentId) {
      return res.status(400).json({ message: "이미 존재하는 학번입니다." });
    }

    // 4. 이메일 중복 확인 (버그 수정: 기존에 없던 검사)
    const existingByEmail = await User.findOne({ email: trimmedEmail });
    if (existingByEmail) {
      return res.status(400).json({ message: "이미 사용 중인 이메일입니다." });
    }

    // 5. 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. 사용자 생성
    await User.create({
      name: trimmedName,
      student_id: trimmedStudentId,
      email: trimmedEmail,
      password: hashedPassword,
    });

    // 7. 회원가입 완료 후 이메일 인증 기록 삭제
    await EmailVerification.deleteMany({ email: trimmedEmail });

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

    const trimmedStudentId = student_id.trim();

    const user = await User.findOne({ student_id: trimmedStudentId }).lean();

    if (!user) {
      return res.status(404).json({ message: "존재하지 않는 사용자" });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: "비활성화된 계정" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "비밀번호 불일치" });
    }

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES }
    );

    await User.findOneAndUpdate(
      { student_id: trimmedStudentId },
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

    if (!refreshToken) {
      return res.status(401).json({ message: "토큰 없음" });
    }

    const user = await User.findOne({ refresh_token: refreshToken }).lean();

    if (!user) {
      return res.status(403).json({ message: "유효하지 않은 토큰" });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
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
      { refresh_token: null }
    );

    res.json({ message: "로그아웃 완료" });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 이메일 인증 코드 발송
exports.sendEmailCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "이메일을 입력해주세요." });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // 이메일 형식 검증 (버그 수정: 기존에 없던 검사)
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(400).json({ message: "올바른 이메일 형식이 아닙니다." });
    }

    // 기존 인증 코드 삭제
    await EmailVerification.deleteMany({ email: trimmedEmail });

    // 6자리 랜덤 인증 코드 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 5분 후 만료
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 인증 정보 저장
    await EmailVerification.create({
      email: trimmedEmail,
      code,
      verified: false,
      expiresAt,
    });

    // 이메일 발송 (버그 수정: 발송 실패 시 DB 레코드 삭제)
    try {
      await sendVerificationEmail(trimmedEmail, code);
    } catch (emailErr) {
      await EmailVerification.deleteMany({ email: trimmedEmail });
      return res.status(500).json({ message: "이메일 발송에 실패했습니다. 다시 시도해주세요." });
    }

    res.json({ message: "인증 코드가 발송되었습니다." });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 이메일 인증 코드 검증
exports.verifyEmailCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "이메일을 입력해주세요." });
    }

    if (!code || !code.trim()) {
      return res.status(400).json({ message: "인증 코드를 입력해주세요." });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCode = code.trim();

    const record = await EmailVerification.findOne({ email: trimmedEmail });

    if (!record) {
      return res.status(400).json({ message: "인증 코드를 먼저 요청해주세요." });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: "인증 코드가 만료되었습니다." });
    }

    if (record.code !== trimmedCode) {
      return res.status(400).json({ message: "인증 코드가 올바르지 않습니다." });
    }

    record.verified = true;
    await record.save();

    res.json({ message: "이메일 인증이 완료되었습니다." });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};
