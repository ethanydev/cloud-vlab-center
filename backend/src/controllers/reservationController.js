const Reservation = require("../models/Reservation");
const User = require("../models/User");
const Resource = require("../models/Resource");

async function validateReservation(resource_id, start_time, end_time, exclude_id = null) {
  const resource = await Resource.findById(resource_id);
  if (!resource) {
    return { valid: false, status: 404, message: "존재하지 않는 리소스입니다." };
  }
  if (resource.status === "maintenance") {
    return { valid: false, status: 400, message: "현재 점검 중인 시설입니다." };
  }
  if (resource.status === "retired") {
    return { valid: false, status: 400, message: "사용 불가능한 시설입니다." };
  }

  const { operating_hours } = resource;
  if (operating_hours) {
    const startDate = new Date(start_time);
    const endDate = new Date(end_time);

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const startDay = dayNames[startDate.getDay()];
    const endDay = dayNames[endDate.getDay()];

    if (
      !operating_hours.days.includes(startDay) ||
      !operating_hours.days.includes(endDay)
    ) {
      return { valid: false, status: 400, message: "운영일이 아닙니다." };
    }

    const toMinutes = (timeStr) => {
      const [h, m] = timeStr.split(":").map(Number);
      return h * 60 + m;
    };

    const opStart = toMinutes(operating_hours.start_time);
    const opEnd = toMinutes(operating_hours.end_time);
    const resStart = startDate.getHours() * 60 + startDate.getMinutes();
    const resEnd = endDate.getHours() * 60 + endDate.getMinutes();

    if (resStart < opStart || resEnd > opEnd) {
      return {
        valid: false,
        status: 400,
        message: `운영 시간(${operating_hours.start_time}~${operating_hours.end_time}) 외 예약은 불가합니다.`,
      };
    }
  }

  const conflictQuery = {
    resource_id,
    // ✅ 변경: pending→waiting, confirmed→reserved, active→using
    status: { $in: ["waiting", "reserved", "using"] },
    $or: [{ start_time: { $lt: end_time }, end_time: { $gt: start_time } }],
  };

  if (exclude_id) {
    conflictQuery._id = { $ne: exclude_id };
  }

  const conflicts = await Reservation.find(conflictQuery);

  const exactDuplicate = conflicts.find(
    (r) =>
      r.start_time.getTime() === new Date(start_time).getTime() &&
      r.end_time.getTime() === new Date(end_time).getTime()
  );
  if (exactDuplicate) {
    return { valid: false, status: 409, message: "이미 동일한 예약이 존재합니다." };
  }

  const maxConcurrent = operating_hours?.max_concurrent ?? 1;
  if (conflicts.length >= maxConcurrent) {
    return {
      valid: false,
      status: 409,
      message: `해당 시간대 최대 동시 예약 수(${maxConcurrent}개)를 초과했습니다.`,
    };
  }

  return { valid: true };
}

// 예약 신청
exports.createReservation = async (req, res) => {
  try {
    const { resource_id, start_time, end_time, purpose } = req.body;
    const user_id = req.user.id;

    const validation = await validateReservation(resource_id, start_time, end_time);
    if (!validation.valid) {
      return res.status(validation.status).json({ message: validation.message });
    }

    const user = await User.findById(user_id);
    if (user.current_reservations >= user.max_reservations) {
      return res.status(400).json({ message: "예약 가능 횟수를 초과했습니다." });
    }

    const reservation = await Reservation.create({
      user_id,
      resource_id,
      start_time,
      end_time,
      purpose,
      // default: "waiting" (Reservation.js에서 설정됨)
    });

    await User.findByIdAndUpdate(user_id, {
      $inc: { current_reservations: 1 },
    });

    res.status(201).json({ message: "예약 신청 완료", reservation });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 내 예약 목록 조회
exports.getMyReservations = async (req, res) => {
  try {
    const user_id = req.user.id;
    const reservations = await Reservation.find({ user_id })
      .populate("resource_id", "name lab_id")
      .sort({ createdAt: -1 });

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 특정 예약 상세 조회
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate("user_id", "name student_id")
      .populate("resource_id", "name lab_id")
      .populate("approved_by", "name");

    if (!reservation) {
      return res.status(404).json({ message: "예약을 찾을 수 없습니다." });
    }

    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 예약 취소 (사용자)
exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "예약을 찾을 수 없습니다." });
    }

    if (reservation.user_id.toString() !== req.user.id) {
      return res.status(403).json({ message: "본인 예약만 취소할 수 있습니다." });
    }

    // ✅ 변경: rejected 제거 (이제 cancelled 하나로 통합)
    if (reservation.status === "cancelled") {
      return res.status(400).json({ message: "이미 취소된 예약입니다." });
    }

    // ✅ 추가: 완료된 예약은 취소 불가
    if (reservation.status === "completed") {
      return res.status(400).json({ message: "이미 완료된 예약은 취소할 수 없습니다." });
    }

    reservation.status = "cancelled";
    await reservation.save();

    await User.findByIdAndUpdate(reservation.user_id, {
      $inc: { current_reservations: -1 },
    });

    res.json({ message: "예약이 취소되었습니다.", reservation });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 전체 예약 조회 (관리자)
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("user_id", "name student_id")
      .populate("resource_id", "name lab_id")
      .sort({ createdAt: -1 });

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 예약 승인 (관리자)
exports.approveReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "예약을 찾을 수 없습니다." });
    }

    // ✅ 변경: "pending" → "waiting"
    if (reservation.status !== "waiting") {
      return res.status(400).json({ message: "대기 중인 예약만 승인할 수 있습니다." });
    }

    // ✅ 변경: "confirmed" → "reserved"
    reservation.status = "reserved";
    reservation.approved_by = req.user.id;
    await reservation.save();

    res.json({ message: "예약이 승인되었습니다.", reservation });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 예약 거절 (관리자)
exports.rejectReservation = async (req, res) => {
  try {
    // ✅ 변경: reject_reason → cancel_reason
    const { cancel_reason } = req.body;
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "예약을 찾을 수 없습니다." });
    }

    // ✅ 변경: "pending" → "waiting"
    if (reservation.status !== "waiting") {
      return res.status(400).json({ message: "대기 중인 예약만 거절할 수 있습니다." });
    }

    // ✅ 변경: "rejected" → "cancelled", reject_reason → cancel_reason
    reservation.status = "cancelled";
    reservation.cancel_reason = cancel_reason || "관리자에 의해 거절되었습니다.";
    await reservation.save();

    await User.findByIdAndUpdate(reservation.user_id, {
      $inc: { current_reservations: -1 },
    });

    res.json({ message: "예약이 거절되었습니다.", reservation });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 실제 사용 시작
exports.startReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "예약을 찾을 수 없습니다." });
    }

    // ✅ 변경: "confirmed" → "reserved"
    if (reservation.status !== "reserved") {
      return res.status(400).json({ message: "승인된 예약만 시작할 수 있습니다." });
    }

    // ✅ 변경: "active" → "using"
    reservation.status = "using";
    reservation.actual_start_time = new Date();
    await reservation.save();

    res.json({ message: "사용이 시작되었습니다.", reservation });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 실제 사용 종료
exports.endReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "예약을 찾을 수 없습니다." });
    }

    // ✅ 변경: "active" → "using"
    if (reservation.status !== "using") {
      return res.status(400).json({ message: "사용 중인 예약만 종료할 수 있습니다." });
    }

    // ✅ 변경: "confirmed" → "completed" (기존 버그 수정!)
    reservation.status = "completed";
    reservation.actual_end_time = new Date();
    await reservation.save();

    await User.findByIdAndUpdate(reservation.user_id, {
      $inc: { current_reservations: -1 },
    });

    res.json({ message: "사용이 종료되었습니다.", reservation });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};