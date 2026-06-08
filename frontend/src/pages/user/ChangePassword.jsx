import React, { useState } from "react";
import { changePassword } from "../../api/users";

function ChangePassword({ onMovePage }) {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.newPassword || !formData.confirmPassword) {
      setErrorMessage("모든 비밀번호 항목을 입력해주세요.");
      return;
    }

    if (formData.newPassword.length < 8) {
      setErrorMessage("새 비밀번호는 8자 이상으로 입력해주세요.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");

      await changePassword(formData.newPassword);

      alert("비밀번호가 변경되었습니다.");
      onMovePage("mypage");
    } catch (error) {
      console.error("비밀번호 변경 실패", error);
      setErrorMessage(
        error.response?.data?.message ||
          "비밀번호 변경에 실패했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="page-header">
        <div>
          <h1>비밀번호 변경</h1>
          <p>계정 보안을 위해 새로운 비밀번호를 설정하세요.</p>
        </div>
      </section>

      <section className="password-layout">
        <form className="edit-profile-card" onSubmit={handleSubmit}>
          <div className="card-header">
            <h2>비밀번호 변경</h2>
            <p>새롭게 사용할 비밀번호를 입력하세요.</p>
          </div>

          {errorMessage && (
            <p style={{ color: "#dc2626", marginBottom: "20px" }}>
              {errorMessage}
            </p>
          )}

          <div className="password-form">
            <div className="form-group">
              <label htmlFor="newPassword">새 비밀번호</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="새 비밀번호를 입력하세요."
                value={formData.newPassword}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">새 비밀번호 확인</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="새 비밀번호를 다시 입력하세요."
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="password-guide">
            <strong>비밀번호 설정 안내</strong>
            <p>
              비밀번호는 8자 이상으로 입력하고, 안전한 비밀번호를 사용해주세요.
            </p>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => onMovePage("mypage")}
              disabled={submitting}
            >
              취소
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={submitting}
            >
              {submitting ? "변경 중..." : "비밀번호 변경"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

export default ChangePassword;