const express = require("express");
const router = express.Router();
const noticeController = require("../controllers/noticeController");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

// 학생 + 관리자
router.get("/", verifyToken, noticeController.getAllNotices);
router.get("/:id", verifyToken, noticeController.getNoticeById);

// 관리자만
router.post("/", verifyToken, verifyAdmin, noticeController.createNotice);
router.patch("/:id", verifyToken, verifyAdmin, noticeController.updateNotice);
router.delete("/:id", verifyToken, verifyAdmin, noticeController.deleteNotice);

module.exports = router;