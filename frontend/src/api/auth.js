import api from "./axios";

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