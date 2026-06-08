import React, { useEffect, useState } from "react";
import {
  getMyProfile,
  updateMyProfile,
  deleteMyAccount,
} from "../../api/users";

function EditProfile({ onMovePage, onLogout }) {
  const [formData, setFormData] = useState({
    name: "",
    student_id: "",
    email: "",
    role: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data = await getMyProfile();

        setFormData({
          name: data.name || "",
          student_id: data.student_id || "",
          email: data.email || "",
          role: data.role || "",
        });
      } catch (error) {
        console.error("개인정보 조회 실패", error);
        setErrorMessage(
          error.response?.data?.message ||
            "개인정보를 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getRoleText = (role) => {
    if (role === "admin") {
      return "관리자";
    }

    return "학생 사용자";
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setErrorMessage("이름을 입력해주세요.");
      return;
    }

    if (!formData.email.trim()) {
      setErrorMessage("이메일을 입력해주세요.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      await updateMyProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
      });

      alert("개인정보가 수정되었습니다.");
      onMovePage("mypage");
    } catch (error) {
      console.error("개인정보 수정 실패", error);
      setErrorMessage(
        error.response?.data?.message ||
          "개인정보 수정에 실패했습니다."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleWithdraw = async () => {
    const isConfirmed = window.confirm(
      "정말 회원탈퇴를 진행하시겠습니까?\n탈퇴 후에는 계정과 예약 정보를 확인할 수 없습니다."
    );

    if (!isConfirmed) {
      return;
    }

    try {
      setWithdrawing(true);
      setErrorMessage("");

      await deleteMyAccount();

      alert("회원탈퇴가 완료되었습니다.");
      onLogout();
    } catch (error) {
      console.error("회원탈퇴 실패", error);
      setErrorMessage(
        error.response?.data?.message ||
          "회원탈퇴 처리에 실패했습니다."
      );
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <>
        <section className="page-header">
          <div>
            <h1>개인정보 수정</h1>
            <p>계정 정보를 불러오는 중입니다.</p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="page-header">
        <div>
          <h1>개인정보 수정</h1>
          <p>계정에 등록된 기본 정보를 확인하고 수정하세요.</p>
        </div>
      </section>

      {errorMessage && (
        <p style={{ color: "#dc2626", marginBottom: "20px" }}>
          {errorMessage}
        </p>
      )}

      <section className="edit-profile-layout">
        <form className="edit-profile-card" onSubmit={handleSave}>
          <div className="card-header">
            <h2>기본 정보</h2>
            <p>이름과 이메일을 수정할 수 있습니다.</p>
          </div>

          <div className="form-grid edit-profile-form">
            <div className="form-group">
              <label htmlFor="name">이름</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="student_id">학번</label>
              <input
                id="student_id"
                name="student_id"
                type="text"
                value={formData.student_id}
                disabled
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">권한</label>
              <input
                id="role"
                name="role"
                type="text"
                value={getRoleText(formData.role)}
                disabled
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">이메일</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => onMovePage("mypage")}
              disabled={saving || withdrawing}
            >
              취소
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving || withdrawing}
            >
              {saving ? "저장 중..." : "변경사항 저장"}
            </button>
          </div>
        </form>

        <div className="withdraw-card">
          <div>
            <h2>회원 탈퇴</h2>
            <p>
              회원탈퇴 시 계정 정보와 예약 이용 내역을 더 이상 확인할 수
              없습니다. 탈퇴 전에 진행 중인 예약이 없는지 확인해주세요.
            </p>
          </div>

          <button
            type="button"
            className="withdraw-button"
            onClick={handleWithdraw}
            disabled={saving || withdrawing}
          >
            {withdrawing ? "처리 중..." : "회원 탈퇴"}
          </button>
        </div>
      </section>
    </>
  );
}

export default EditProfile;