import api from "./axios";

// 예약 신청
export const createReservation = async (
  resource_id,
  start_time,
  end_time,
  purpose,
  os_preset = null
) => {
  const res = await api.post("/api/reservations", {
    resource_id,
    start_time,
    end_time,
    purpose,
    os_preset,
  });
  return res.data;
};

// Docker OS 프리셋 목록 조회
export const getContainerPresets = async () => {
  const res = await api.get("/api/containers/presets");
  return res.data;
};

// 내 예약 목록 조회
export const getMyReservations = async () => {
  const res = await api.get("/api/reservations/me");
  return res.data;
};

// 예약 상세 조회
export const getReservationById = async (id) => {
  const res = await api.get(`/api/reservations/${id}`);
  return res.data;
};

// 예약 취소
export const cancelReservation = async (id) => {
  const res = await api.patch(`/api/reservations/${id}/cancel`);
  return res.data;
};

// 사용 시작
export const startReservation = async (id) => {
  const res = await api.patch(`/api/reservations/${id}/start`);
  return res.data;
};

// 사용 완료
export const endReservation = async (id) => {
  const res = await api.patch(`/api/reservations/${id}/end`);
  return res.data;
};

// 전체 예약 목록 조회 - 관리자
export const getReservations = async () => {
  const res = await api.get("/api/reservations");
  return res.data;
};

// 예약 승인 - 관리자
export const approveReservation = async (id) => {
  const res = await api.patch(`/api/reservations/${id}/approve`);
  return res.data;
};

// 예약 거절 - 관리자
export const rejectReservation = async (id, cancel_reason = "") => {
  const res = await api.patch(`/api/reservations/${id}/reject`, {
    cancel_reason,
  });
  return res.data;
};