import api from "./axios";

// 사용자 목록 조회
export const getUsers = async () => {
  const res = await api.get("/api/users");
  return res.data;
};

// 사용자 상세 조회
export const getUser = async (id) => {
  const res = await api.get(`/api/users/${id}`);
  return res.data;
};

// 내 정보 조회
export const getMyProfile = async () => {
  const res = await api.get("/api/users/me");
  return res.data;
};

// 내 정보 수정
export const updateMyProfile = async (profile) => {
  const res = await api.patch("/api/users/me", profile);
  return res.data;
};

// 비밀번호 변경
export const changePassword = async (new_password) => {
  const res = await api.patch("/api/users/me", {
    password: new_password,
  });
  return res.data;
};

// 회원 탈퇴
export const deleteMyAccount = async () => {
  const res = await api.delete("/api/users/me");
  return res.data;
};

// 사용자 상태 변경 - 관리자
export const updateUserStatus = async (id, is_active) => {
  const res = await api.patch(`/api/users/${id}`, {
    is_active,
  });
  return res.data;
};