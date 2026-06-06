import React, { useEffect, useState } from "react";
import {
  getReservationById,
  startReservation,
  endReservation,
} from "../../api/reservations";

function UsageStatus({ reservationId, onMovePage }) {
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchReservation = async () => {
    if (!reservationId) {
      setLoading(false);
      setErrorMessage("선택된 예약 정보가 없습니다.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getReservationById(reservationId);
      setReservation(data);
    } catch (error) {
      console.error("예약 상세 조회 실패", error);
      setErrorMessage(
        error.response?.data?.message || "예약 정보를 불러오지 못했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservation();
  }, [reservationId]);

  const handleStart = async () => {
    if (!reservationId) {
      return;
    }

    try {
      setActionLoading(true);
      setErrorMessage("");

      await startReservation(reservationId);
      alert("사용을 시작했습니다.");
      await fetchReservation();
    } catch (error) {
      console.error("사용 시작 실패", error);
      setErrorMessage(
        error.response?.data?.message || "사용 시작에 실패했습니다."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!reservationId) {
      return;
    }

    try {
      setActionLoading(true);
      setErrorMessage("");

      await endReservation(reservationId);
      alert("사용을 완료했습니다.");
      await fetchReservation();
    } catch (error) {
      console.error("사용 완료 실패", error);
      setErrorMessage(
        error.response?.data?.message || "사용 완료에 실패했습니다."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusText = (status) => {
    if (status === "waiting") return "대기중";
    if (status === "reserved") return "예약됨";
    if (status === "using") return "사용중";
    if (status === "completed") return "완료";
    if (status === "cancelled") return "취소됨";
    return "-";
  };

  const formatSpec = (spec) => {
    if (!spec) {
      return "-";
    }

    if (typeof spec === "string") {
      return spec;
    }

    const details = [
      spec.gpu,
      spec.cpu,
      spec.memory,
      spec.storage,
    ].filter(Boolean);

    return details.length > 0 ? details.join(" / ") : spec.description || "-";
  };

  const formatReservedTime = (startTime, endTime) => {
    if (!startTime || !endTime) {
      return "-";
    }

    const start = new Date(startTime).toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const end = new Date(endTime).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return `${start} ~ ${end}`;
  };

  const formatActualTime = (time) => {
    if (!time) {
      return "-";
    }

    return new Date(time).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>실시간 사용 관리</h1>
          <p>예약 정보를 불러오는 중입니다.</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !reservation) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>실시간 사용 관리</h1>
          <p>예약한 실습 자원의 실제 사용 상태를 관리하세요.</p>
        </div>

        <section className="content-card usage-main-card">
          <p style={{ color: "#dc2626" }}>
            {errorMessage || "예약 정보가 없습니다."}
          </p>

          <div className="usage-button-area">
            <button
              className="cancel-button"
              onClick={() => onMovePage("reservations")}
            >
              내 예약 현황으로 돌아가기
            </button>
          </div>
        </section>
      </div>
    );
  }

  const resource = reservation.resource_id;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>실시간 사용 관리</h1>
        <p>예약한 실습 자원의 실제 사용 상태를 관리하세요.</p>
      </div>

      <div className="usage-grid">
        <section className="content-card usage-main-card">
          <div className="usage-card-header">
            <div>
              <h2>현재 예약 자원</h2>
              <p>사용 시작과 사용 완료 상태를 직접 변경할 수 있습니다.</p>
            </div>
            <span className={`usage-status-badge ${reservation.status}`}>
              {getStatusText(reservation.status)}
            </span>
          </div>

          <div className="resource-info-grid">
            <div className="resource-info-item">
              <span>이름</span>
              <strong>{resource?.name || "-"}</strong>
            </div>

            <div className="resource-info-item">
              <span>노드 이름</span>
              <strong>{resource?.name || "-"}</strong>
            </div>

            <div className="resource-info-item">
              <span>자원 분류</span>
              <strong>{resource?.lab_id || "-"}</strong>
            </div>

            <div className="resource-info-item">
              <span>스펙</span>
              <strong>{formatSpec(resource?.spec)}</strong>
            </div>

            <div className="resource-info-item">
              <span>예약 시간</span>
              <strong>
                {formatReservedTime(
                  reservation.start_time,
                  reservation.end_time
                )}
              </strong>
            </div>

            <div className="resource-info-item">
              <span>현재 상태</span>
              <strong>{getStatusText(reservation.status)}</strong>
            </div>

            <div className="resource-info-item">
              <span>실제 사용 시작</span>
              <strong>{formatActualTime(reservation.actual_start_time)}</strong>
            </div>

            <div className="resource-info-item">
              <span>실제 사용 완료</span>
              <strong>{formatActualTime(reservation.actual_end_time)}</strong>
            </div>
          </div>

          {errorMessage && (
            <p style={{ color: "#dc2626", marginTop: "16px" }}>
              {errorMessage}
            </p>
          )}

          <div className="usage-button-area">
            <button
              className="cancel-button"
              onClick={() => onMovePage("reservations")}
              disabled={actionLoading}
            >
              돌아가기
            </button>

            <button
              className="primary-button"
              onClick={handleStart}
              disabled={reservation.status !== "reserved" || actionLoading}
            >
              {actionLoading ? "처리 중..." : "사용 시작"}
            </button>

            <button
              className="secondary-button"
              onClick={handleComplete}
              disabled={reservation.status !== "using" || actionLoading}
            >
              사용 완료
            </button>
          </div>
        </section>

        <section className="content-card">
          <h2>접속 정보</h2>
          {!reservation.os_preset ? (
            <p className="card-description">OS 환경이 선택되지 않은 예약입니다.</p>
          ) : !reservation.container_id ? (
            <p className="card-description">
              컨테이너 준비 중입니다. 예약 시작 시간에 자동으로 생성됩니다.
            </p>
          ) : (
            <p className="card-description">Docker 컨테이너가 실행 중입니다.</p>
          )}

          <div className="access-info-list">
            <div>
              <span>OS 환경</span>
              <strong>{reservation.os_preset || "-"}</strong>
            </div>
            <div>
              <span>IP 주소</span>
              <strong>{reservation.container_info?.host || "-"}</strong>
            </div>
            <div>
              <span>SSH 포트</span>
              <strong>
                {reservation.container_info?.ports?.[22]
                  ? reservation.container_info.ports[22]
                  : "-"}
              </strong>
            </div>
          </div>

          <div className="ssh-box">
            <span>SSH 접속 명령어</span>
            <code>
              {reservation.container_info?.ssh_command || "컨테이너 준비 중..."}
            </code>
          </div>
        </section>
      </div>
    </div>
  );
}

export default UsageStatus;