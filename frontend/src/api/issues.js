import api from "./axios";

export const getIssues = async () => {
  const res = await api.get("/api/issues");
  return res.data;
};

export const getMyIssues = async () => {
  const res = await api.get("/api/issues/me");
  return res.data;
};

export const createIssue = async ({ title, content }) => {
  const res = await api.post("/api/issues", { title, content });
  return res.data;
};

export const updateIssueStatus = async (id, status) => {
  const res = await api.patch(`/api/issues/${id}/status`, { status });
  return res.data;
};

export const deleteIssue = async (id) => {
  const res = await api.delete(`/api/issues/${id}`);
  return res.data;
};