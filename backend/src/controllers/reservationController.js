const Reservation = require("../models/Reservation");
const User = require("../models/User");
const Resource = require("../models/Resource");
const scheduler = require("../services/container.scheduler");

async function validateReservation(resource_id, start_time, end_time, exclude_id = null, skipOperatingHours = false) {
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
  if (operating_hours && !skipOperatingHours) {
    const startDate = new Date(start_time);
    const endDate = new Date(end_time);

    const hasDays = Array.isArray(operating_hours.days) && operating_hours.days.length > 0;
    const hasTime = operating_hours.start_time && operating_hours.end_time;

    if (hasDays) {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const startDay = dayNames[startDate.getDay()];
      const endDay = dayNames[endDate.getDay()];
      const normalizedDays = operating_hours.days.map((d) => d.toLowerCase());

      if (
        !normalizedDays.includes(startDay.toLowerCase()) ||
        !normalizedDays.includes(endDay.toLowerCase())
      ) {
        return { valid: false, status: 400, message: "운영일이 아닙니다." };
      }
    }

    if (hasTime) {
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
  }

  const conflictQuery = {
    resource_id,
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
    const { resource_id, start_time, end_time, purpose, os_preset } = req.body;
    const user_id = req.user.id;

    // 필수 필드 검증
    if (!resource_id || !start_time || !end_time || !purpose) {
      return res.status(400).json({ message: "resource_id, start_time, end_time, purpose는 필수입니다." });
    }

    const startDate = new Date(start_time);
    const endDate = new Date(end_time);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: "올바른 날짜 형식이 아닙니다." });
    }

    if (startDate >= endDate) {
      return res.status(400).json({ message: "시작 시간은 종료 시간보다 이전이어야 합니다." });
    }

    if (startDate < new Date()) {
      return res.status(400).json({ message: "과거 시간으로는 예약할 수 없습니다." });
    }

    if (purpose.trim().length === 0) {
      return res.status(400).json({ message: "사용 목적을 입력해주세요." });
    }

    const validation = await validateReservation(resource_id, start_time, end_time, null, !!os_preset);
    if (!validation.valid) {
      return res.status(validation.status).json({ message: validation.message });
    }

    // 원자적 연산으로 현재 예약 수 초과 여부 확인 및 증가 (Race Condition 방지)
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user_id,
        is_active: true,
        $expr: { $lt: ["$current_reservations", "$max_reservations"] },
      },
      { $inc: { current_reservations: 1 } },
      { new: true }
    );

    if (!updatedUser) {
      // 사용자를 찾아서 이유를 구분
      const user = await User.findById(user_id);
      if (!user || !user.is_active) {
        return res.status(403).json({ message: "비활성화된 계정입니다." });
      }
      return res.status(400).json({ message: "예약 가능 횟수를 초과했습니다." });
    }

    try {
      const reservation = await Reservation.create({
        user_id,
        resource_id,
        start_time,
        end_time,
        purpose: purpose.trim(),
        os_preset: os_preset || null,
      });

      res.status(201).json({ message: "예약 신청 완료", reservation });
    } catch (createErr) {
      // 예약 생성 실패 시 증가시킨 카운터 롤백
      await User.findByIdAndUpdate(user_id, { $inc: { current_reservations: -1 } });
      throw createErr;
    }
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 내 예약 목록 조회
exports.getMyReservations = async (req, res) => {
  try {
    const user_id = req.user.id;
    const now = new Date();

    // end_time이 지난 reserved 또는 using 예약 자동 완료 처리 + 카운터 감소
    const expiredReservations = await Reservation.find({
      user_id,
      status: { $in: ["reserved", "using"] },
      end_time: { $lt: now },
    });

    if (expiredReservations.length > 0) {
      const ids = expiredReservations.map((r) => r._id);
      await Reservation.updateMany({ _id: { $in: ids } }, { $set: { status: "completed" } });
      await User.findByIdAndUpdate(user_id, {
        $inc: { current_reservations: -expiredReservations.length },
      });

      // 실행 중인 컨테이너 비동기 정리
      for (const r of expiredReservations) {
        if (r.container_id) {
          scheduler.killReservationContainer(r._id).catch((err) =>
            require("../utils/logger").warn(
              `[Auto-expire] Container cleanup failed for reservation ${r._id}: ${err.message}`
            )
          );
        }
      }
    }

    const reservations = await Reservation.find({ user_id })
      .populate("resource_id", "name lab_id spec")
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

    if (reservation.status === "cancelled") {
      return res.status(400).json({ message: "이미 취소된 예약입니다." });
    }

    if (reservation.status === "completed") {
      return res.status(400).json({ message: "이미 완료된 예약은 취소할 수 없습니다." });
    }

    const prevStatus = reservation.status;
    reservation.status = "cancelled";
    await reservation.save();

    // 컨테이너 스케줄 취소 또는 실행 중 컨테이너 종료
    await scheduler.killReservationContainer(reservation._id);

    // waiting 또는 reserved 상태에서만 카운터 감소 (using은 endReservation에서 처리)
    if (prevStatus === "waiting" || prevStatus === "reserved") {
      await User.findByIdAndUpdate(reservation.user_id, {
        $inc: { current_reservations: -1 },
      });
    }

    res.json({ message: "예약이 취소되었습니다.", reservation });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 전체 예약 조회 (관리자) - 날짜 필터 옵션
exports.getAllReservations = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const filter = {};
    if (start_date || end_date) {
      filter.start_time = {};
      if (start_date) filter.start_time.$gte = new Date(start_date);
      if (end_date) filter.start_time.$lte = new Date(end_date);
    }

    const reservations = await Reservation.find(filter)
      .populate("user_id", "name student_id")
      .populate("resource_id", "name lab_id")
      .sort({ start_time: 1 });

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

    if (reservation.status !== "waiting") {
      return res.status(400).json({ message: "대기 중인 예약만 승인할 수 있습니다." });
    }

    reservation.status = "reserved";
    reservation.approved_by = req.user.id;
    await reservation.save();

    // os_preset이 있으면 start_time에 컨테이너 자동 생성 스케줄링
    if (reservation.os_preset) {
      scheduler.schedule(reservation._id, reservation.start_time, reservation.os_preset);
    }

    res.json({ message: "예약이 승인되었습니다.", reservation });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 예약 거절 (관리자)
exports.rejectReservation = async (req, res) => {
  try {
    const { cancel_reason } = req.body;
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "예약을 찾을 수 없습니다." });
    }

    if (reservation.status !== "waiting") {
      return res.status(400).json({ message: "대기 중인 예약만 거절할 수 있습니다." });
    }

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

    if (reservation.status !== "reserved") {
      return res.status(400).json({ message: "승인된 예약만 시작할 수 있습니다." });
    }

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

    if (reservation.status !== "using") {
      return res.status(400).json({ message: "사용 중인 예약만 종료할 수 있습니다." });
    }

    reservation.status = "completed";
    reservation.actual_end_time = new Date();
    await reservation.save();

    // 실행 중 컨테이너 종료
    await scheduler.killReservationContainer(reservation._id);

    await User.findByIdAndUpdate(reservation.user_id, {
      $inc: { current_reservations: -1 },
    });

    res.json({ message: "사용이 종료되었습니다.", reservation });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};
