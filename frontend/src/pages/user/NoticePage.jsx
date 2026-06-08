import React, { useEffect, useState } from "react";
import { getNotices } from "../../api/notices";

function NoticePage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data = await getNotices();
        setNotices(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("공지사항 목록 조회 실패", error);
        setErrorMessage(
          error.response?.data?.message ||
            "공지사항을 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  const formatDate = (dateValue) => {
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

  const getNoticeType = (notice) => {
    return notice.is_urgent ? "긴급" : "안내";
  };

  const latestNoticeDate =
    notices.length > 0 ? formatDate(notices[0].createdAt) : "-";

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>공지사항</h1>
        <p>관리자가 등록한 실습실 운영 안내와 중요 공지를 확인하세요.</p>
      </div>

      <div className="notice-layout">
        <section className="content-card notice-summary-card">
          <h2>공지 요약</h2>
          <p className="card-description">
            현재 학생 사용자에게 표시되는 공지사항 목록입니다.
          </p>

          <div className="notice-summary-list">
            <div>
              <span>전체 공지</span>
              <strong>{notices.length}</strong>
            </div>
            <div>
              <span>중요 공지</span>
              <strong>
                {notices.filter((notice) => notice.is_urgent).length}
              </strong>
            </div>
            <div>
              <span>최근 등록</span>
              <strong>{latestNoticeDate}</strong>
            </div>
          </div>
        </section>

        <section className="notice-list">
          {loading ? (
            <article className="content-card notice-card">
              <p>공지사항을 불러오는 중입니다.</p>
            </article>
          ) : errorMessage ? (
            <article className="content-card notice-card">
              <p style={{ color: "#dc2626" }}>{errorMessage}</p>
            </article>
          ) : notices.length === 0 ? (
            <article className="content-card notice-card">
              <p>등록된 공지사항이 없습니다.</p>
            </article>
          ) : (
            notices.map((notice) => (
              <article
                key={notice._id}
                className={`content-card notice-card ${
                  notice.is_urgent ? "important" : ""
                }`}
              >
                <div className="notice-card-header">
                  <div>
                    <div className="notice-meta">
                      <span className="notice-type">
                        {getNoticeType(notice)}
                      </span>
                      <span>{formatDate(notice.createdAt)}</span>

                      {notice.is_urgent && (
                        <span className="notice-important">중요</span>
                      )}
                    </div>

                    <h2>{notice.title}</h2>
                  </div>
                </div>

                <p>{notice.content}</p>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

export default NoticePage;