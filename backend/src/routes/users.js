const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

router.get("/me", verifyToken, userController.getMe);
router.patch("/me", verifyToken, userController.updateMe);
router.delete("/me", verifyToken, userController.deleteMe);
router.patch("/:id", verifyToken, verifyAdmin, userController.updateUserStatus);
router.get("/", verifyToken, verifyAdmin, userController.getAllUsers);

module.exports = router;