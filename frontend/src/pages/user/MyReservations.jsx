import React, { useEffect, useState } from "react";
import {
  getMyReservations,
  cancelReservation,
  getReservationById,
} from "../../api/reservations";

const PRESET_DESCRIPTIONS = {
  "alpine-shell": "Alpine (SSH, 포트 자동 배정)",
  ubuntu: "Ubuntu 22.04 (SSH, 포트 자동 배정)",
  centos: "CentOS Stream 9 (SSH, 포트 자동 배정)",
  rockylinux: "Rocky Linux 9 (SSH, 포트 자동 배정)",
  kalilinux: "Kali Linux (SSH, 포트 자동 배정)",
  jupyter: "Jupyter Notebook (포트 8888)",
  "postgres-lab": "PostgreSQL 16 (포트 5432)",
};

function MyReservations({ onUseReservation }) {
  const [activeTab, setActiveTab] = useState("예약 예정");
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedReservation, setSelectedReservation] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const tabs = ["예약 예정", "사용 중", "지난 예약", "취소된 예약"];

  const statusLabel = {
    waiting: "대기중",
    reserved: "예약됨",
    using: "사용중",
    completed: "완료",
    cancelled: "취소됨",
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getMyReservations();
      setReservations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("내 예약 목록 조회 실패", error);
      setErrorMessage("예약 내역을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id) => {
    const confirmed = window.confirm("해당 예약을 취소하시겠습니까?");

    if (!confirmed) {
      return;
    }

    try {
      await cancelReservation(id);
      alert("예약이 취소되었습니다.");
      await fetchReservations();
    } catch (error) {
      console.error("예약 취소 실패", error);
      const message =
        error.response?.data?.message || "예약 취소에 실패했습니다.";
      alert(message);
    }
  };

  const handleViewDetail = async (reservation) => {
    try {
      setSelectedReservation(reservation);
      setDetailLoading(true);
      setDetailError("");

      const data = await getReservationById(reservation._id);
      const detailResource = data.resource_id || {};

      setSelectedReservation({
        ...reservation,
        ...data,
        resource_id: {
          ...reservation.resource_id,
          ...detailResource,
          spec: detailResource.spec || reservation.resource_id?.spec,
        },
      });
    } catch (error) {
      console.error("예약 상세 조회 실패", error);
      setDetailError(
        error.response?.data?.message ||
          "예약 상세 정보를 불러오지 못했습니다."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setSelectedReservation(null);
    setDetailError("");
    setDetailLoading(false);
  };

  const formatDate = (dateTime) => {
    if (!dateTime) {
      return "-";
    }

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) {
      return "-";
    }

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatTime = (startTime, endTime) => {
    if (!startTime || !endTime) {
      return "-";
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      return "-";
    }

    const start = startDate.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const end = endDate.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return `${start} - ${end}`;
  };

  const formatSpec = (spec) => {
    if (!spec) {
      return "-";
    }

    if (typeof spec === "string") {
      return spec;
    }

    const details = [spec.gpu, spec.cpu, spec.memory, spec.storage].filter(
      Boolean
    );

    if (details.length > 0) {
      return details.join(" / ");
    }

    return spec.description || "-";
  };

  const isReservationAvailableNow = (reservation) => {
    if (!reservation || reservation.status !== "reserved") {
      return false;
    }

    const now = new Date();
    const startTime = new Date(reservation.start_time);
    const endTime = new Date(reservation.end_time);

    if (
      Number.isNaN(startTime.getTime()) ||
      Number.isNaN(endTime.getTime())
    ) {
      return false;
    }

    return now >= startTime && now < endTime;
  };

  const getReservationTab = (reservation) => {
    if (reservation.status === "waiting") {
      return "예약 예정";
    }

    if (reservation.status === "reserved") {
      if (isReservationAvailableNow(reservation)) {
        return "사용 중";
      }

      const endTime = new Date(reservation.end_time);

      if (!Number.isNaN(endTime.getTime()) && new Date() >= endTime) {
        return "지난 예약";
      }

      return "예약 예정";
    }

    if (reservation.status === "using") {
      return "사용 중";
    }

    if (reservation.status === "completed") {
      return "지난 예약";
    }

    if (reservation.status === "cancelled") {
      return "취소된 예약";
    }

    return "예약 예정";
  };

  const canEnterUsageStatus = (reservation) => {
    if (!reservation) {
      return false;
    }

    if (reservation.status === "using") {
      return true;
    }

    return isReservationAvailableNow(reservation);
  };

  const filteredReservations = reservations.filter(
    (reservation) => getReservationTab(reservation) === activeTab
  );

  const getBadgeClassName = (status) => {
    if (status === "waiting") return "status-badge pending";
    if (status === "reserved") return "status-badge reserved";
    if (status === "using") return "status-badge using";
    if (status === "completed") return "status-badge completed";
    if (status === "cancelled") return "status-badge canceled";
    return "status-badge";
  };

  return (
    <>
      <section className="page-header">
        <div>
          <h1>내 예약 현황</h1>
          <p>나의 예약 내역과 현재 사용 상태를 확인하세요.</p>
        </div>
      </section>

      <section className="reservation-card">
        <div className="reservation-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`tab-button ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <table className="reservation-table">
          <thead>
            <tr>
              <th>자원 / OS</th>
              <th>분류</th>
              <th>스펙 / 호스트</th>
              <th>날짜</th>
              <th>시간</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>

          <tbody>
            {!loading &&
              filteredReservations.map((reservation) => (
                <tr key={reservation._id}>
                  <td>
                    {reservation.os_preset
                      ? `[Docker] ${reservation.os_preset}`
                      : reservation.resource_id?.name || "-"}
                  </td>

                  <td>
                    {reservation.os_preset
                      ? "컨테이너"
                      : reservation.resource_id?.lab_id || "-"}
                  </td>

                  <td>
                    {reservation.os_preset
                      ? PRESET_DESCRIPTIONS[reservation.os_preset] ||
                        reservation.os_preset
                      : formatSpec(reservation.resource_id?.spec)}
                  </td>

                  <td>{formatDate(reservation.start_time)}</td>

                  <td>
                    {formatTime(reservation.start_time, reservation.end_time)}
                  </td>

                  <td>
                    <span className={getBadgeClassName(reservation.status)}>
                      {statusLabel[reservation.status] || reservation.status}
                    </span>
                  </td>

                  <td>
                    <div className="table-actions">
                      {canEnterUsageStatus(reservation) &&
                        typeof onUseReservation === "function" && (
                          <button
                            type="button"
                            className="primary-button usage-button"
                            onClick={() => onUseReservation(reservation._id)}
                            aria-label="실시간 사용 화면으로 이동"
                            title="실시간 사용"
                            style={{
                              minWidth: "92px",
                              padding: "8px 14px",
                              backgroundColor: "#2563eb",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: "8px",
                              fontSize: "13px",
                              fontWeight: "600",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              whiteSpace: "nowrap",
                              lineHeight: "1.2",
                            }}
                          >
                            실시간 사용
                          </button>
                        )}

                      {(reservation.status === "waiting" ||
                        (reservation.status === "reserved" &&
                          !isReservationAvailableNow(reservation))) && (
                        <button
                          type="button"
                          onClick={() => handleCancel(reservation._id)}
                        >
                          취소
                        </button>
                      )}

                      {(reservation.status === "completed" ||
                        reservation.status === "cancelled") && (
                        <button
                          type="button"
                          onClick={() => handleViewDetail(reservation)}
                        >
                          상세보기
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {loading && (
          <div className="empty-message">예약 내역을 불러오는 중입니다.</div>
        )}

        {!loading && errorMessage && (
          <div className="empty-message">{errorMessage}</div>
        )}

        {!loading && !errorMessage && filteredReservations.length === 0 && (
          <div className="empty-message">
            해당 상태의 예약 내역이 없습니다.
          </div>
        )}

        <div className="table-footer">
          <button type="button" className="page-arrow">
            ‹
          </button>
          <span>1 / 1</span>
          <button type="button" className="page-arrow">
            ›
          </button>
        </div>
      </section>

      {selectedReservation && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={closeDetailModal}
        >
          <div
            style={{
              width: "520px",
              maxWidth: "calc(100vw - 40px)",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 20px 45px rgba(15, 23, 42, 0.2)",
              padding: "28px",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "22px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    color: "#1e293b",
                  }}
                >
                  예약 상세정보
                </h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  예약 처리 내역과 상태를 확인하세요.
                </p>
              </div>

              <button
                type="button"
                onClick={closeDetailModal}
                style={{
                  border: "none",
                  backgroundColor: "transparent",
                  fontSize: "24px",
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {detailLoading ? (
              <p style={{ color: "#64748b" }}>
                상세 정보를 불러오는 중입니다.
              </p>
            ) : detailError ? (
              <p style={{ color: "#dc2626" }}>{detailError}</p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {selectedReservation.os_preset ? (
                  <>
                    <DetailRow
                      label="OS 환경"
                      value={`[Docker] ${selectedReservation.os_preset}`}
                    />

                    <DetailRow
                      label="환경 정보"
                      value={
                        PRESET_DESCRIPTIONS[selectedReservation.os_preset] ||
                        selectedReservation.os_preset
                      }
                    />

                    <DetailRow
                      label="호스트 노드"
                      value={selectedReservation.resource_id?.name || "-"}
                    />
                  </>
                ) : (
                  <>
                    <DetailRow
                      label="노드 이름"
                      value={selectedReservation.resource_id?.name || "-"}
                    />

                    <DetailRow
                      label="자원 분류"
                      value={selectedReservation.resource_id?.lab_id || "-"}
                    />

                    <DetailRow
                      label="스펙"
                      value={formatSpec(selectedReservation.resource_id?.spec)}
                    />
                  </>
                )}

                <DetailRow
                  label="예약 날짜"
                  value={formatDate(selectedReservation.start_time)}
                />

                <DetailRow
                  label="예약 시간"
                  value={formatTime(
                    selectedReservation.start_time,
                    selectedReservation.end_time
                  )}
                />

                <DetailRow
                  label="현재 상태"
                  value={
                    statusLabel[selectedReservation.status] ||
                    selectedReservation.status ||
                    "-"
                  }
                />

                <DetailRow
                  label="사용 목적"
                  value={selectedReservation.purpose || "-"}
                />

                {selectedReservation.status === "cancelled" && (
                  <DetailRow
                    label="취소 / 거절 사유"
                    value={
                      selectedReservation.cancel_reason ||
                      "등록된 사유가 없습니다."
                    }
                    emphasized
                  />
                )}

                {selectedReservation.actual_start_time && (
                  <DetailRow
                    label="실제 사용 시작"
                    value={formatDateTime(
                      selectedReservation.actual_start_time
                    )}
                  />
                )}

                {selectedReservation.actual_end_time && (
                  <DetailRow
                    label="실제 사용 종료"
                    value={formatDateTime(selectedReservation.actual_end_time)}
                  />
                )}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "26px",
              }}
            >
              <button
                type="button"
                onClick={closeDetailModal}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "8px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DetailRow({ label, value, emphasized = false }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "130px 1fr",
        gap: "12px",
        alignItems: "start",
        paddingBottom: "12px",
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      <span
        style={{
          color: "#64748b",
          fontSize: "13px",
          fontWeight: "600",
        }}
      >
        {label}
      </span>

      <span
        style={{
          color: emphasized ? "#dc2626" : "#1e293b",
          fontSize: "14px",
          fontWeight: emphasized ? "600" : "500",
          wordBreak: "break-word",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default MyReservations;
