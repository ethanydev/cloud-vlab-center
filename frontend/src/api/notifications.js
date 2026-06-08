import api from "./axios";

export const getVapidPublicKey = async () => {
  const res = await api.get("/api/notifications/vapid-public-key");
  return res.data.publicKey;
};

export const subscribeNotification = async (subscription) => {
  const { endpoint, keys } = subscription.toJSON();
  await api.post("/api/notifications/subscribe", { endpoint, keys });
};

export const unsubscribeNotification = async (endpoint) => {
  await api.post("/api/notifications/unsubscribe", { endpoint });
};
