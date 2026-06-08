const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

// 학생 + 관리자 접근 가능
router.post("/", verifyToken, reservationController.createReservation);
router.get("/me", verifyToken, reservationController.getMyReservations);
router.get("/:id", verifyToken, reservationController.getReservationById);
router.patch("/:id/cancel", verifyToken, reservationController.cancelReservation);
router.patch("/:id/start", verifyToken, reservationController.startReservation);
router.patch("/:id/end", verifyToken, reservationController.endReservation);

// 관리자만 접근 가능
router.get("/", verifyToken, verifyAdmin, reservationController.getAllReservations);
router.patch("/:id/approve", verifyToken, verifyAdmin, reservationController.approveReservation);
router.patch("/:id/reject", verifyToken, verifyAdmin, reservationController.rejectReservation);

module.exports = router;