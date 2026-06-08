const express = require("express");
const router = express.Router();
const issueController = require("../controllers/issueController");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

// 학생
router.post("/", verifyToken, issueController.createIssue);
router.get("/me", verifyToken, issueController.getMyIssues);

// 관리자
router.get("/", verifyToken, verifyAdmin, issueController.getAllIssues);
router.patch("/:id/status", verifyToken, verifyAdmin, issueController.updateIssueStatus);
router.delete("/:id", verifyToken, verifyAdmin, issueController.deleteIssue);

module.exports = router;