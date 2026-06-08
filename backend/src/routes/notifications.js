const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const PushSubscription = require("../models/PushSubscription");

// VAPID 공개 키 제공 (프론트에서 구독 시 필요)
router.get("/vapid-public-key", (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// 구독 등록
router.post("/subscribe", verifyToken, async (req, res) => {
  const { endpoint, keys } = req.body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ message: "잘못된 구독 정보입니다." });
  }

  await PushSubscription.findOneAndUpdate(
    { endpoint },
    { user_id: req.user.id, endpoint, keys },
    { upsert: true, new: true }
  );

  res.json({ message: "푸시 알림 구독 완료" });
});

// 구독 해제
router.post("/unsubscribe", verifyToken, async (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) return res.status(400).json({ message: "endpoint가 필요합니다." });

  await PushSubscription.deleteOne({ endpoint, user_id: req.user.id });
  res.json({ message: "푸시 알림 구독 해제 완료" });
});

module.exports = router;
