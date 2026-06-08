import React, { useEffect, useState } from "react";
import { getMyProfile } from "../../api/users";
import { getMyReservations } from "../../api/reservations";
import { getMyIssues } from "../../api/issues";

function MyPage({ onLogout, onMovePage, notificationEnabled, onNotificationToggle }) {
  const [profile, setProfile] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchMyPageData = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const [profileData, reservationData, issueData] = await Promise.all([
          getMyProfile(),
          getMyReservations(),
          getMyIssues(),
        ]);

        setProfile(profileData);
        setReservations(
          Array.isArray(reservationData) ? reservationData : []
        );
        setIssues(Array.isArray(issueData) ? issueData : []);
      } catch (error) {
        console.error("마이페이지 정보 조회 실패", error);
        setErrorMessage(
          error.response?.data?.message ||
            "마이페이지 정보를 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyPageData();
  }, []);

  const formatCreatedAt = (createdAt) => {
    if (!createdAt) {
      return "-";
    }

    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getRoleText = (role) => {
    if (role === "admin") {
      return "관리자";
    }

    return "학생 사용자";
  };

  const getAvatarText = () => {
    if (!profile?.name) {
      return "U";
    }

    return profile.name.slice(0, 1);
  };

  const completedCount = reservations.filter(
    (reservation) => reservation.status === "completed"
  ).length;

  const usingCount = reservations.filter(
    (reservation) => reservation.status === "using"
  ).length;

  if (loading) {
    return (
      <>
        <section className="page-header">
          <div>
            <h1>마이페이지</h1>
            <p>내 계정 정보를 불러오는 중입니다.</p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="page-header">
        <div>
          <h1>마이페이지</h1>
          <p>내 계정 정보와 예약 이용 현황을 확인하세요.</p>
        </div>
      </section>

      {errorMessage && (
        <p style={{ color: "#dc2626", marginBottom: "20px" }}>
          {errorMessage}
        </p>
      )}

      <section className="mypage-layout">
        <div className="profile-card">
          <div className="profile-avatar">{getAvatarText()}</div>

          <h2>{profile?.name || "-"}</h2>
          <p>{profile?.student_id || "-"}</p>

          <div className="profile-info-list">
            <div>
              <strong>이메일</strong>
              <p>{profile?.email || "-"}</p>
            </div>

            <div>
              <strong>권한</strong>
              <p>{getRoleText(profile?.role)}</p>
            </div>

            <div>
              <strong>가입일</strong>
              <p>{formatCreatedAt(profile?.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="mypage-content">
          <div className="mypage-card">
            <div className="card-header">
              <h2>이용 요약</h2>
              <p>최근 자원 예약 및 사용 현황입니다.</p>
            </div>

            <div className="mypage-stats">
              <div>
                <p>전체 예약</p>
                <strong>{reservations.length}</strong>
              </div>

              <div>
                <p>사용 완료</p>
                <strong>{completedCount}</strong>
              </div>

              <div>
                <p>사용 중</p>
                <strong>{usingCount}</strong>
              </div>

              <div>
                <p>등록 이슈</p>
                <strong>{issues.length}</strong>
              </div>
            </div>
          </div>

          <div className="mypage-card">
            <div className="card-header">
              <h2>계정 관리</h2>
              <p>비밀번호 변경, 알림 설정, 로그아웃을 할 수 있습니다.</p>
            </div>

            <div className="setting-list">
              <button
                type="button"
                onClick={() => onMovePage("editProfile")}
              >
                개인 정보 수정
              </button>

              <button
                type="button"
                onClick={() => onMovePage("changePassword")}
              >
                비밀번호 변경
              </button>

              <div className="notification-setting-item">
                <span>브라우저 알림</span>

                <button
                  type="button"
                  className={`notification-toggle ${
                    notificationEnabled ? "enabled" : ""
                  }`}
                  onClick={onNotificationToggle}
                  aria-label="브라우저 알림 설정 변경"
                  aria-pressed={notificationEnabled}
                >
                  <span className="toggle-label">
                    {notificationEnabled ? "ON" : "OFF"}
                  </span>
                  <span className="toggle-circle"></span>
                </button>
              </div>

              <button
                type="button"
                className="danger-setting"
                onClick={onLogout}
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default MyPage;