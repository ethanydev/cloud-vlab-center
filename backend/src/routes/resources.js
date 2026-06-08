const express = require("express");
const router = express.Router();
const resourceController = require("../controllers/resourceController");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

// 학생 + 관리자 접근 가능
router.get("/", verifyToken, resourceController.getResources);
router.get("/:id", verifyToken, resourceController.getResourceById);

// 관리자만 접근 가능
router.post("/", verifyToken, verifyAdmin, resourceController.createResource);
router.patch("/:id", verifyToken, verifyAdmin, resourceController.updateResource);
router.patch("/:id/status", verifyToken, verifyAdmin, resourceController.updateResourceStatus);

module.exports = router;