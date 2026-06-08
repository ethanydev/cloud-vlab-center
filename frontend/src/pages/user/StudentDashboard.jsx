import React, { useEffect, useState } from "react";
import { getNotices } from "../../api/notices";
import { getMyReservations } from "../../api/reservations";
import { getMyIssues } from "../../api/issues";
import { getResources } from "../../api/resources";

function StudentDashboard({ onMovePage }) {
  const [notices, setNotices] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [issues, setIssues] = useState([]);
  const [resources, setResources] = useState([]);

  const [loadingNotices, setLoadingNotices] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  const [noticeError, setNoticeError] = useState("");
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoadingNotices(true);
        setNoticeError("");

        const data = await getNotices();
        setNotices(Array.isArray(data) ? data.slice(0, 3) : []);
      } catch (error) {
        console.error("대시보드 공지사항 조회 실패", error);
        setNoticeError(
          error.response?.data?.message ||
            "공지사항을 불러오지 못했습니다."
        );
      } finally {
        setLoadingNotices(false);
      }
    };

    const fetchDashboardData = async () => {
      try {
        setLoadingDashboard(true);
        setDashboardError("");

        const [reservationData, issueData, resourceData] = await Promise.all([
          getMyReservations(),
          getMyIssues(),
          getResources(),
        ]);

        setReservations(
          Array.isArray(reservationData) ? reservationData : []
        );
        setIssues(Array.isArray(issueData) ? issueData : []);
        setResources(Array.isArray(resourceData) ? resourceData : []);
      } catch (error) {
        console.error("학생 대시보드 정보 조회 실패", error);
        setDashboardError(
          error.response?.data?.message ||
            "대시보드 정보를 불러오지 못했습니다."
        );
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchNotices();
    fetchDashboardData();
  }, []);

  const formatNoticeDate = (dateValue) => {
    if (!dateValue) return "-";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/ /g, "");
  };

  const formatTime = (startTime, endTime) => {
    if (!startTime || !endTime) {
      return "-";
    }

    const start = new Date(startTime).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const end = new Date(endTime).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return `${start} - ${end}`;
  };

  const statusLabel = {
    waiting: "대기중",
    reserved: "예약됨",
    using: "사용 중",
    completed: "완료",
    cancelled: "취소됨",
  };

  const getStatusBadgeClassName = (status) => {
    if (status === "waiting") return "status-badge pending";
    if (status === "reserved") return "status-badge reserved";
    if (status === "using") return "status-badge using";
    if (status === "completed") return "status-badge completed";
    if (status === "cancelled") return "status-badge canceled";
    return "status-badge";
  };

  const totalReservations = reservations.length;

  const usingCount = reservations.filter(
    (reservation) => reservation.status === "using"
  ).length;

  const scheduledCount = reservations.filter(
    (reservation) =>
      reservation.status === "waiting" ||
      reservation.status === "reserved"
  ).length;

  const completedCount = reservations.filter(
    (reservation) => reservation.status === "completed"
  ).length;

  const unresolvedIssueCount = issues.filter(
    (issue) =>
      issue.status === "waiting" ||
      issue.status === "in_progress"
  ).length;

  const availableResourceCount = resources.filter(
    (resource) => resource.status === "active"
  ).length;

  const completedRate =
    totalReservations > 0
      ? Math.round((completedCount / totalReservations) * 100)
      : 0;

  const recentReservations = [...reservations]
    .sort((a, b) => {
      const firstDate = new Date(b.createdAt || b.start_time).getTime();
      const secondDate = new Date(a.createdAt || a.start_time).getTime();

      return firstDate - secondDate;
    })
    .slice(0, 3);

  return (
    <>
      <section className="page-header">
        <div>
          <h1>대시보드</h1>
          <p>나의 예약 현황과 이용 정보를 확인하세요.</p>
        </div>
      </section>

      {dashboardError && (
        <p style={{ color: "#dc2626", marginBottom: "20px" }}>
          {dashboardError}
        </p>
      )}

      <section className="summary-grid">
        <div className="summary-card">
          <p>예약 현황</p>
          <h2>{loadingDashboard ? "-" : totalReservations}</h2>
          <span>내 전체 예약</span>
        </div>

        <div className="summary-card">
          <p>사용 중 자원</p>
          <h2>{loadingDashboard ? "-" : usingCount}</h2>
          <span>현재 사용 중</span>
        </div>

        <div className="summary-card">
          <p>미해결 이슈</p>
          <h2>{loadingDashboard ? "-" : unresolvedIssueCount}</h2>
          <span>처리 대기 및 진행 중</span>
        </div>

        <div className="summary-card">
          <p>가용 자원</p>
          <h2>{loadingDashboard ? "-" : availableResourceCount}</h2>
          <span>예약 가능</span>
        </div>
      </section>

      <section className="dashboard-content">
        <div className="dashboard-left-column">
          <div className="dashboard-card usage-card">
            <div className="card-header">
              <h2>내 예약 이용 현황</h2>
              <p>현재 내 예약 상태를 기준으로 표시됩니다.</p>
            </div>

            <div className="usage-content">
              <div
                className="usage-circle"
                style={
                  loadingDashboard
                    ? {}
                    : {
                        background: `conic-gradient(var(--color-primary) 0 ${completedRate}%, #e5e7eb ${completedRate}% 100%)`,
                      }
                }
              >
                <strong>{loadingDashboard ? "-" : `${completedRate}%`}</strong>
                <span>사용 완료율</span>
              </div>

              <div className="usage-list">
                <div>
                  <span className="dot dot-green"></span>
                  <p>예약 예정</p>
                  <strong>{loadingDashboard ? "-" : scheduledCount}</strong>
                </div>

                <div>
                  <span className="dot dot-blue"></span>
                  <p>사용 중</p>
                  <strong>{loadingDashboard ? "-" : usingCount}</strong>
                </div>

                <div>
                  <span className="dot dot-gray"></span>
                  <p>사용 완료</p>
                  <strong>{loadingDashboard ? "-" : completedCount}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-card usage-guide-card">
            <div className="card-header">
              <h2>이용 안내 수칙</h2>
              <p>실습 자원 이용 전 확인해야 할 기본 수칙입니다.</p>
            </div>

            <ul className="usage-guide-list">
              <li>예약 시간이 되면 실시간 사용 메뉴에서 사용 시작 버튼을 눌러주세요.</li>
              <li>사용이 끝난 뒤에는 반드시 사용 완료 처리를 해주세요.</li>
              <li>자원 접속에 문제가 있으면 이슈 관리 메뉴에서 내용을 등록해주세요.</li>
              <li>예약 시간 외 장시간 점유나 임의 설정 변경은 제한될 수 있습니다.</li>
            </ul>
          </div>
        </div>

        <div className="dashboard-right-column">
          <div className="dashboard-card recent-card">
            <div className="card-header">
              <h2>최근 예약</h2>
              <p>최근 등록한 예약 현황입니다.</p>
            </div>

            <div className="recent-list">
              {loadingDashboard ? (
                <div className="recent-item">
                  <div>
                    <p>예약 내역을 불러오는 중입니다.</p>
                  </div>
                </div>
              ) : recentReservations.length === 0 ? (
                <div className="recent-item">
                  <div>
                    <p>등록된 예약이 없습니다.</p>
                  </div>
                </div>
              ) : (
                recentReservations.map((reservation) => (
                  <div className="recent-item" key={reservation._id}>
                    <div>
                      <strong>
                        {reservation.os_preset
                          ? `[Docker] ${reservation.os_preset}`
                          : reservation.resource_id?.name || "-"}
                      </strong>
                      <p>
                        {formatTime(
                          reservation.start_time,
                          reservation.end_time
                        )}
                      </p>
                    </div>

                    <span
                      className={getStatusBadgeClassName(reservation.status)}
                    >
                      {statusLabel[reservation.status] || reservation.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="dashboard-card notice-preview-card">
            <div className="card-header notice-preview-header">
              <div>
                <h2>공지사항</h2>
                <p>관리자가 등록한 최신 공지입니다.</p>
              </div>

              <button
                className="small-link-button"
                onClick={() => onMovePage("notices")}
              >
                전체 보기
              </button>
            </div>

            <div className="notice-preview-list">
              {loadingNotices ? (
                <div className="notice-preview-item">
                  <div>
                    <p>공지사항을 불러오는 중입니다.</p>
                  </div>
                </div>
              ) : noticeError ? (
                <div className="notice-preview-item">
                  <div>
                    <p style={{ color: "#dc2626" }}>{noticeError}</p>
                  </div>
                </div>
              ) : notices.length === 0 ? (
                <div className="notice-preview-item">
                  <div>
                    <p>등록된 공지사항이 없습니다.</p>
                  </div>
                </div>
              ) : (
                notices.map((notice) => (
                  <div key={notice._id} className="notice-preview-item">
                    <div>
                      <strong>{notice.title}</strong>
                      <p>{formatNoticeDate(notice.createdAt)}</p>
                    </div>

                    <span
                      className={`notice-preview-badge ${
                        notice.is_urgent ? "urgent" : ""
                      }`}
                    >
                      {notice.is_urgent ? "긴급" : "공지"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default StudentDashboard;