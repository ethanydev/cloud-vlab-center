import React, { useEffect, useState } from "react";
import { getMyReservations } from "../../api/reservations";

function WeeklyReservation({ onMovePage }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const times = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
  ];

  const getMonday = (date) => {
    const target = new Date(date);
    const day = target.getDay(); // 일:0, 월:1, ... 토:6
    const diff = day === 0 ? -6 : 1 - day;

    target.setDate(target.getDate() + diff);
    target.setHours(0, 0, 0, 0);

    return target;
  };

  const today = new Date();
  const baseMonday = getMonday(today);

  const currentMonday = new Date(baseMonday);
  currentMonday.setDate(baseMonday.getDate() + weekOffset * 7);

  const weekDays = ["월", "화", "수", "목", "금"].map((dayName, index) => {
    const date = new Date(currentMonday);
    date.setDate(currentMonday.getDate() + index);
    date.setHours(0, 0, 0, 0);

    return {
      label: `${dayName} ${date.getMonth() + 1}/${date.getDate()}`,
      month: date.getMonth() + 1,
      date: date.getDate(),
      fullDate: date,
      dayIndex: index,
    };
  });

  const startMonth = weekDays[0].month;
  const startDate = weekDays[0].date;
  const endMonth = weekDays[4].month;
  const endDate = weekDays[4].date;
  const displayYear = currentMonday.getFullYear();

  useEffect(() => {
    const loadMyReservations = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyReservations();
        setReservations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("내 예약 목록 조회 실패:", err);
        setError(
          err.response?.data?.message ||
            "내 주간 예약 현황을 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMyReservations();
  }, []);

  const formatTime = (dateValue) => {
    if (!dateValue) return "-";

    const date = new Date(dateValue);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getDateKey = (dateValue) => {
    const date = new Date(dateValue);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getStatusText = (status) => {
    if (status === "waiting") return "대기중";
    if (status === "reserved") return "예약됨";
    if (status === "using") return "사용 중";
    if (status === "completed") return "완료";
    if (status === "cancelled") return "취소됨";
    return "-";
  };

  const getBlockType = (status) => {
    if (status === "using") return "using";
    if (status === "reserved") return "reserved";
    if (status === "waiting") return "purple";
    if (status === "completed") return "gray";
    if (status === "cancelled") return "gray";

    return "reserved";
  };

  const getBlockClassName = (type) => {
    if (type === "docker") return "reservation-block docker-block";
    if (type === "using") return "reservation-block using-block";
    if (type === "reserved") return "reservation-block reserved-block";
    if (type === "purple") return "reservation-block using-purple-block";
    if (type === "gray") return "reservation-block gray-block";

    return "reservation-block";
  };

  const getResourceName = (reservation) => {
    if (reservation.os_preset) {
      return `[Docker] ${reservation.os_preset}`;
    }
    return (
      reservation.resource_id?.name ||
      reservation.resource?.name ||
      reservation.resource_name ||
      "-"
    );
  };

  const convertReservationToSchedule = (reservation) => {
    const startDate = new Date(reservation.start_time);
    const endDate = new Date(reservation.end_time);

    return {
      id: reservation._id,
      dateKey: getDateKey(startDate),
      startTime: formatTime(startDate),
      title: getResourceName(reservation),
      time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
      status: getStatusText(reservation.status),
      type: reservation.os_preset ? "docker" : getBlockType(reservation.status),
    };
  };

  const currentWeekDateKeys = weekDays.map((day) => getDateKey(day.fullDate));

  const schedules = reservations
    .filter((reservation) => {
      if (!reservation.start_time) return false;

      const dateKey = getDateKey(reservation.start_time);
      return currentWeekDateKeys.includes(dateKey);
    })
    .map(convertReservationToSchedule);

  const findSchedule = (day, time) => {
    const dayKey = getDateKey(day.fullDate);

    return schedules.find(
      (schedule) => schedule.dateKey === dayKey && schedule.startTime === time
    );
  };

  const handleTodayClick = () => {
    setWeekOffset(0);
  };

  return (
    <>
      <section className="page-header schedule-header">
        <div>
          <h1>내 주간 예약 현황</h1>
          <p>이번 주 내 예약 일정을 확인하고 필요한 경우 예약을 신청하세요.</p>
        </div>

        <button className="primary-button" onClick={() => onMovePage("apply")}>
          + 예약 신청
        </button>
      </section>

      <section className="schedule-card">
        <div className="schedule-toolbar">
          <button
            className="week-button"
            onClick={() => setWeekOffset((prev) => prev - 1)}
          >
            ‹
          </button>

          <strong>
            {displayYear}년 {startMonth}월 {startDate}일 ~ {endMonth}월{" "}
            {endDate}일
          </strong>

          <button
            className="week-button"
            onClick={() => setWeekOffset((prev) => prev + 1)}
          >
            ›
          </button>

          <div className="toolbar-actions">
            <button className="sub-button" onClick={handleTodayClick}>
              오늘
            </button>
            <select className="view-select" defaultValue="주간">
              <option>주간</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#8792a2" }}>
            내 예약 현황을 불러오는 중입니다.
          </div>
        ) : error ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#e53e3e" }}>
            {error}
          </div>
        ) : (
          <>
            <div className="schedule-grid">
              <div className="time-column header-cell"></div>

              {weekDays.map((day) => (
                <div key={day.label} className="day-cell header-cell">
                  {day.label}
                </div>
              ))}

              {times.map((time) => (
                <div className="schedule-row" key={time}>
                  <div className="time-column">{time}</div>

                  {weekDays.map((day) => {
                    const schedule = findSchedule(day, time);

                    return (
                      <div key={`${day.label}-${time}`} className="schedule-cell">
                        {schedule && (
                          <div className={getBlockClassName(schedule.type)}>
                            <strong>{schedule.title}</strong>
                            <span>{schedule.time}</span>
                            <p>{schedule.status}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {schedules.length === 0 && (
              <div
                style={{
                  padding: "24px",
                  textAlign: "center",
                  color: "#8792a2",
                  borderTop: "1px solid #edf2f7",
                }}
              >
                이번 주에 등록된 내 예약이 없습니다.
              </div>
            )}
          </>
        )}

        <div className="schedule-legend">
          <span>
            <i className="legend-dot using"></i>사용 중
          </span>
          <span>
            <i className="legend-dot reserved"></i>예약됨
          </span>
          <span>
            <i className="legend-dot purple"></i>대기중
          </span>
          <span>
            <i className="legend-dot docker"></i>Docker 컨테이너
          </span>
        </div>
      </section>
    </>
  );
}

export default WeeklyReservation;