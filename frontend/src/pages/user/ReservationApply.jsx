import React, { useEffect, useState } from "react";
import { getResources } from "../../api/resources";
import { createReservation, getContainerPresets } from "../../api/reservations";

const DEFAULT_PRESETS = [
  { name: "alpine-shell",  description: "Alpine 기본 쉘 환경" },
  { name: "jupyter",       description: "Jupyter Notebook" },
  { name: "postgres-lab",  description: "PostgreSQL 실습 DB" },
  { name: "ubuntu",        description: "Ubuntu 22.04 실습 환경" },
  { name: "centos",        description: "CentOS Stream 9 실습 환경" },
  { name: "rockylinux",    description: "Rocky Linux 9 실습 환경" },
  { name: "kalilinux",     description: "Kali Linux 실습 환경" },
];

function ReservationApply({ onMovePage }) {
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [presets, setPresets] = useState(DEFAULT_PRESETS);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    resource_id: "",
    date: "",
    start_time: "09:00",
    end_time: "10:00",
    purpose: "",
    os_preset: "",
  });

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoadingResources(true);
        setErrorMessage("");

        const data = await getResources();
        setResources(data);

        if (data.length > 0) {
          setForm((prev) => ({ ...prev, resource_id: data[0]._id }));
        }
      } catch (error) {
        console.error("자원 목록 조회 실패", error);
        setErrorMessage(
          error.response?.data?.message || "자원 목록을 불러오지 못했습니다."
        );
      } finally {
        setLoadingResources(false);
      }
    };

    const fetchPresets = async () => {
      try {
        const data = await getContainerPresets();
        setPresets(data.data?.presets || []);
      } catch (error) {
        console.error("프리셋 목록 조회 실패", error);
      }
    };

    fetchResources();
    fetchPresets();
  }, []);

  // 드롭다운 표시값: 하드웨어 자원은 _id, Docker 프리셋은 "preset:{name}"
  const combinedSelectValue = form.os_preset
    ? `preset:${form.os_preset}`
    : form.resource_id;

  const handleResourceSelect = (event) => {
    const value = event.target.value;
    if (value.startsWith("preset:")) {
      const presetName = value.slice(7);
      setForm((prev) => ({
        ...prev,
        // Docker 컨테이너는 서버 위에서 동작하므로 첫 번째 하드웨어 자원을 기본값으로 사용
        resource_id: resources.length > 0 ? resources[0]._id : prev.resource_id,
        os_preset: presetName,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        resource_id: value,
        os_preset: "",
      }));
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const formatResourceOption = (resource) => {
    const details = [
      resource.spec?.gpu,
      resource.spec?.cpu,
      resource.spec?.memory,
      resource.spec?.storage,
    ].filter(Boolean);

    const specText =
      details.length > 0
        ? details.join(" / ")
        : resource.spec?.description || "사양 정보 없음";

    return `${resource.name} / ${resource.lab_id} / ${specText}`;
  };

  const handleSubmit = async () => {
    if (!form.resource_id) {
      setErrorMessage("예약할 자원을 선택해주세요.");
      return;
    }

    if (!form.date) {
      setErrorMessage("예약 날짜를 선택해주세요.");
      return;
    }

    if (!form.purpose.trim()) {
      setErrorMessage("사용 목적을 입력해주세요.");
      return;
    }

    if (form.start_time >= form.end_time) {
      setErrorMessage("종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }

    const startTime = new Date(`${form.date}T${form.start_time}:00`).toISOString();
    const endTime = new Date(`${form.date}T${form.end_time}:00`).toISOString();

    try {
      setSubmitting(true);
      setErrorMessage("");

      await createReservation(
        form.resource_id,
        startTime,
        endTime,
        form.purpose.trim(),
        form.os_preset || null
      );

      alert("예약 신청이 완료되었습니다.");
      onMovePage("reservations");
    } catch (error) {
      console.error("예약 신청 실패", error);
      setErrorMessage(
        error.response?.data?.message || "예약 신청에 실패했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="page-header">
        <div>
          <h1>예약 신청</h1>
          <p>사용할 자원과 시간을 선택하여 예약을 신청하세요.</p>
        </div>
      </section>

      <section className="form-card">
        <div className="form-grid">
          <div className="form-group full">
            <label>자원 선택</label>
            <select
              value={combinedSelectValue}
              onChange={handleResourceSelect}
              disabled={loadingResources || resources.length === 0}
            >
              {loadingResources && (
                <option value="">자원 목록을 불러오는 중입니다.</option>
              )}

              {!loadingResources && resources.length === 0 && (
                <option value="">예약 가능한 자원이 없습니다.</option>
              )}

              {!loadingResources && (
                <optgroup label="실습 서버">
                  {resources.map((resource) => (
                    <option key={resource._id} value={resource._id}>
                      {formatResourceOption(resource)}
                    </option>
                  ))}
                </optgroup>
              )}

              {!loadingResources && presets.length > 0 && (
                <optgroup label="Docker 컨테이너">
                  {presets.map((preset) => (
                    <option key={preset.name} value={`preset:${preset.name}`}>
                      {preset.name}
                      {preset.description ? ` — ${preset.description}` : ""}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div className="form-group full">
            <label>날짜</label>
            <input
              type="date"
              name="date"
              value={form.date}
              min={new Date().toISOString().split("T")[0]}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>시작 시간</label>
            <input
              type="time"
              name="start_time"
              value={form.start_time}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>종료 시간</label>
            <input
              type="time"
              name="end_time"
              value={form.end_time}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full">
            <label>사용 목적</label>
            <textarea
              name="purpose"
              placeholder="사용 목적을 입력하세요."
              value={form.purpose}
              onChange={handleChange}
            />
          </div>
        </div>

        {errorMessage && (
          <p style={{ color: "#dc2626", marginTop: "16px" }}>
            {errorMessage}
          </p>
        )}

        <div className="form-actions">
          <button
            className="cancel-button"
            onClick={() => onMovePage("weekly")}
            disabled={submitting}
          >
            취소
          </button>

          <button
            className="primary-button"
            onClick={handleSubmit}
            disabled={submitting || loadingResources || resources.length === 0}
          >
            {submitting ? "신청 중..." : "예약 신청"}
          </button>
        </div>
      </section>
    </>
  );
}

export default ReservationApply;
