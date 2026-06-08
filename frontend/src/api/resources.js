import api from "./axios";

// 리소스 목록 조회
export const getResources = async () => {
  const res = await api.get("/api/resources");
  return res.data;
};

// 리소스 상세 조회
export const getResource = async (id) => {
  const res = await api.get(`/api/resources/${id}`);
  return res.data;
};

// 리소스 생성
export const createResource = async (resource) => {
  const res = await api.post("/api/resources", resource);
  return res.data;
};

// 리소스 정보 수정
export const updateResource = async (id, resource) => {
  const res = await api.patch(`/api/resources/${id}`, resource);
  return res.data;
};

// 리소스 상태 변경: active / maintenance / retired
export const updateResourceStatus = async (id, status) => {
  const res = await api.patch(`/api/resources/${id}/status`, {
    status,
  });
  return res.data;
};