import React from "react";

function NoticeCard({ notice, onClick }) {
  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).replace(/ /g, "");
  };

  return (
    <div
      className="notice-card-item"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className="notice-card-left">
        {notice.is_urgent && (
          <span className="notice-preview-badge urgent">긴급</span>
        )}
        {!notice.is_urgent && (
          <span className="notice-preview-badge">공지</span>
        )}
        <strong className="notice-card-title">{notice.title}</strong>
      </div>
      <span className="notice-card-date">{formatDate(notice.createdAt)}</span>
    </div>
  );
}

export default NoticeCard;
