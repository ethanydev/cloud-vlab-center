import api from "./axios";

// access token 안에 들어 있는 사용자 role 읽기
export const getRoleFromAccessToken = (accessToken) => {
  try {
    const payload = accessToken.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(
      Math.ceil(base64.length / 4) * 4,
      "="
    );

    const decodedPayload = JSON.parse(atob(paddedBase64));
    return decodedPayload.role;
  } catch (err) {
    console.error("토큰 role 확인 실패:", err);
    return null;
  }
};

// 로그인
export const login = async (student_id, password) => {
  const res = await api.post("/api/auth/login", { student_id, password });

  localStorage.setItem("accessToken", res.data.accessToken);
  localStorage.setItem("refreshToken", res.data.refreshToken);

  return res.data;
};

// 로그아웃
export const logout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  await api.post("/api/auth/logout", { refreshToken });

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

// 이메일 인증 코드 발송
export const sendEmailCode = async (email) => {
  const res = await api.post("/api/auth/send-email", {
    email: email.trim(),
  });

  return res.data;
};

// 이메일 인증 코드 검증
export const verifyEmailCode = async (email, code) => {
  const res = await api.post("/api/auth/verify-email", {
    email: email.trim(),
    code: code.trim(),
  });

  return res.data;
};

// 회원가입
export const register = async (name, student_id, email, password) => {
  const res = await api.post("/api/auth/register", {
    name,
    student_id,
    email,
    password,
  });

  return res.data;
};