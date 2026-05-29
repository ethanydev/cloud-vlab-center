const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/auth");

router.get("/me", verifyToken, userController.getMe);
router.patch("/me", verifyToken, userController.updateMe);
router.delete("/me", verifyToken, userController.deleteMe);

module.exports = router;