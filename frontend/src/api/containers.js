import api from "./axios";

// 현재 실행 중인 컨테이너 목록 조회
export const getContainers = async () => {
  const res = await api.get("/api/containers");
  return res.data;
};

// 사용 가능한 프리셋 목록 조회
export const getPresets = async () => {
  const res = await api.get("/api/containers/presets");
  return res.data;
};

// 프리셋으로 컨테이너 생성 + 시작
export const runContainer = async (presetName) => {
  const res = await api.post(`/api/containers/run/${presetName}`);
  return res.data;
};

// 컨테이너 중지 + 삭제
export const killContainer = async (dockerContainerId) => {
  const res = await api.post(`/api/containers/kill/${dockerContainerId}`);
  return res.data;
};
