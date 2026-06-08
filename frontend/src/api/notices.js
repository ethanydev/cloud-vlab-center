import api from "./axios";

export const getNotices = async () => {
  const res = await api.get("/api/notices");
  return res.data;
};

export const getNotice = async (id) => {
  const res = await api.get(`/api/notices/${id}`);
  return res.data;
};

export const createNotice = async ({ title, content, is_urgent = false }) => {
  const res = await api.post("/api/notices", {
    title,
    content,
    is_urgent,
  });
  return res.data;
};

export const updateNotice = async (id, { title, content, is_urgent }) => {
  const res = await api.patch(`/api/notices/${id}`, {
    title,
    content,
    is_urgent,
  });
  return res.data;
};

export const deleteNotice = async (id) => {
  const res = await api.delete(`/api/notices/${id}`);
  return res.data;
};