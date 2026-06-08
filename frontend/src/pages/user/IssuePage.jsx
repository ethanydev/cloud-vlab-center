import React, { useEffect, useState } from "react";
import { createIssue, getMyIssues } from "../../api/issues";

function IssuePage() {
  const [issues, setIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const loadMyIssues = async () => {
    try {
      setLoadingIssues(true);
      setErrorMessage("");

      const data = await getMyIssues();
      setIssues(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("내 이슈 목록 조회 실패", error);
      setErrorMessage(
        error.response?.data?.message ||
          "이슈 목록을 불러오지 못했습니다."
      );
    } finally {
      setLoadingIssues(false);
    }
  };

  useEffect(() => {
    loadMyIssues();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!formData.content.trim()) {
      alert("설명을 입력해주세요.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");

      await createIssue({
        title: formData.title.trim(),
        content: formData.content.trim(),
      });

      alert("이슈가 등록되었습니다.");

      setFormData({
        title: "",
        content: "",
      });

      await loadMyIssues();
    } catch (error) {
      console.error("이슈 등록 실패", error);
      setErrorMessage(
        error.response?.data?.message ||
          "이슈 등록에 실패했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusLabel = (status) => {
    if (status === "waiting") return "접수";
    if (status === "in_progress") return "처리중";
    if (status === "resolved") return "해결됨";
    return "-";
  };

  const getStatusClassName = (status) => {
    if (status === "waiting") return "received";
    if (status === "in_progress") return "processing";
    if (status === "resolved") return "solved";
    return "received";
  };

  const formatDateTime = (dateValue) => {
    if (!dateValue) return "-";

    const date = new Date(dateValue);

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

  return (
    <>
      <section className="page-header">
        <div>
          <h1>이슈 관리</h1>
          <p>자원 사용 중 발생한 문제를 등록하고 처리 상태를 확인하세요.</p>
        </div>
      </section>

      <section className="issue-layout">
        <div className="issue-list-card">
          <div className="card-header">
            <h2>이슈 목록</h2>
            <p>최근 등록된 이슈입니다.</p>
          </div>

          <div className="issue-list">
            {loadingIssues ? (
              <div className="issue-item">
                <div>
                  <p>이슈 목록을 불러오는 중입니다.</p>
                </div>
              </div>
            ) : errorMessage ? (
              <div className="issue-item">
                <div>
                  <p style={{ color: "#dc2626" }}>{errorMessage}</p>
                </div>
              </div>
            ) : issues.length === 0 ? (
              <div className="issue-item">
                <div>
                  <p>등록된 이슈가 없습니다.</p>
                </div>
              </div>
            ) : (
              issues.map((issue) => (
                <div className="issue-item" key={issue._id}>
                  <div>
                    <strong>{issue.title}</strong>
                    <p>{formatDateTime(issue.createdAt)}</p>
                  </div>

                  <span
                    className={`issue-badge ${getStatusClassName(issue.status)}`}
                  >
                    {getStatusLabel(issue.status)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="issue-form-card">
          <div className="card-header">
            <h2>이슈 등록</h2>
            <p>자원 사용 중 문제를 등록해 주세요.</p>
          </div>

          <div className="form-grid issue-form-grid">
            <div className="form-group full">
              <label>제목</label>
              <input
                type="text"
                name="title"
                placeholder="예: GPU 서버 접속 오류"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full">
              <label>설명</label>
              <textarea
                name="content"
                placeholder="문제 상황을 자세히 입력해주세요."
                value={formData.content}
                onChange={handleChange}
              />
            </div>
          </div>

          {errorMessage && (
            <p style={{ color: "#dc2626", marginTop: "16px" }}>
              {errorMessage}
            </p>
          )}

          <button
            className="primary-button issue-submit-button"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "등록 중..." : "등록"}
          </button>
        </div>
      </section>
    </>
  );
}

export default IssuePage;