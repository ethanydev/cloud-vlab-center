const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

// 이메일 인증
router.post("/send-email", authController.sendEmailCode);
router.post("/verify-email", authController.verifyEmailCode);

module.exports = router;