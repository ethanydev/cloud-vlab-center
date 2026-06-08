const webpush = require("web-push");
const PushSubscription = require("../models/PushSubscription");

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * 특정 사용자에게 푸시 알림 전송
 * @param {string} userId
 * @param {{ title: string, body: string, icon?: string, data?: object }} payload
 */
async function sendToUser(userId, payload) {
  const subscriptions = await PushSubscription.find({ user_id: userId });

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          JSON.stringify(payload)
        );
      } catch (err) {
        // 410 Gone: 구독이 만료됨 → DB에서 삭제
        if (err.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: sub._id });
        }
        throw err;
      }
    })
  );

  const failed = results.filter((r) => r.status === "rejected").length;
  if (failed > 0) {
    console.warn(`[Push] ${failed}/${subscriptions.length} 알림 전송 실패 (userId=${userId})`);
  }
}

module.exports = { sendToUser };
