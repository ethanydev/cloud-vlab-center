import React, { useEffect, useState } from 'react';
import {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} from '../../api/notices';

export default function Notice() {
  const [notices, setNotices] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // list | create | edit
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_urgent: false,
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadNotices = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getNotices();
      setNotices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('공지사항 목록 조회 실패:', err);
      setError(
        err.response?.data?.message ||
        '공지사항 목록을 불러오지 못했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      is_urgent: false,
    });
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreateClick = () => {
    resetForm();
    setViewMode('create');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('공지사항 제목을 입력해 주세요.');
      return;
    }

    if (!formData.content.trim()) {
      alert('공지사항 내용을 입력해 주세요.');
      return;
    }

    try {
      setSaving(true);

      await createNotice({
        title: formData.title.trim(),
        content: formData.content.trim(),
        is_urgent: formData.is_urgent,
      });

      alert('새로운 공지사항이 등록되었습니다.');
      resetForm();
      setViewMode('list');
      await loadNotices();
    } catch (err) {
      console.error('공지사항 등록 실패:', err);
      alert(
        err.response?.data?.message ||
        '공지사항 등록에 실패했습니다.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (notice) => {
    setEditingId(notice._id);
    setFormData({
      title: notice.title || '',
      content: notice.content || '',
      is_urgent: Boolean(notice.is_urgent),
    });
    setViewMode('edit');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('공지사항 제목을 입력해 주세요.');
      return;
    }

    if (!formData.content.trim()) {
      alert('공지사항 내용을 입력해 주세요.');
      return;
    }

    try {
      setSaving(true);

      await updateNotice(editingId, {
        title: formData.title.trim(),
        content: formData.content.trim(),
        is_urgent: formData.is_urgent,
      });

      alert('공지사항이 성공적으로 수정되었습니다.');
      resetForm();
      setViewMode('list');
      await loadNotices();
    } catch (err) {
      console.error('공지사항 수정 실패:', err);
      alert(
        err.response?.data?.message ||
        '공지사항 수정에 실패했습니다.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('정말 이 공지사항을 완전히 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteNotice(id);
      alert('공지사항이 삭제되었습니다.');
      await loadNotices();
    } catch (err) {
      console.error('공지사항 삭제 실패:', err);
      alert(
        err.response?.data?.message ||
        '공지사항 삭제에 실패했습니다.'
      );
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '-';

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return date.toISOString().split('T')[0];
  };

  return (
    <div style={{ padding: '40px 30px', fontFamily: 'sans-serif', backgroundColor: '#fff', minHeight: '100vh' }}>
      
      {/* ------------------ A. 공지사항 목록 보기 화면 ------------------ */}
      {viewMode === 'list' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a1f36', marginBottom: '6px' }}>
                공지사항 관리
              </h2>
              <p style={{ color: '#8792a2', fontSize: '14px' }}>
                학생들에게 공지할 시스템 공지사항을 관리합니다.
              </p>
            </div>

            <button
              onClick={handleCreateClick}
              style={{
                backgroundColor: '#1a56db',
                color: '#fff',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              + 신규 공지 등록
            </button>
          </div>

          <div style={{ border: '1px solid #edf2f7', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #edf2f7' }}>
                  <th style={{ padding: '14px 20px', color: '#4a5568', fontWeight: '600', width: '60px', textAlign: 'center' }}>
                    번호
                  </th>
                  <th style={{ padding: '14px 20px', color: '#4a5568', fontWeight: '600' }}>
                    제목
                  </th>
                  <th style={{ padding: '14px 20px', color: '#4a5568', fontWeight: '600', width: '100px' }}>
                    작성자
                  </th>
                  <th style={{ padding: '14px 20px', color: '#4a5568', fontWeight: '600', width: '120px' }}>
                    등록일
                  </th>
                  <th style={{ padding: '14px 20px', color: '#4a5568', fontWeight: '600', width: '80px', textAlign: 'center' }}>
                    조회수
                  </th>
                  <th style={{ padding: '14px 20px', color: '#4a5568', fontWeight: '600', width: '150px', textAlign: 'center' }}>
                    관리 제어
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#8792a2' }}>
                      공지사항 목록을 불러오는 중입니다.
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#e53e3e' }}>
                      {error}
                    </td>
                  </tr>
                ) : notices.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#a0aec0' }}>
                      등록된 공지사항이 없습니다.
                    </td>
                  </tr>
                ) : (
                  notices.map((notice, index) => (
                    <tr key={notice._id} style={{ borderBottom: '1px solid #edf2f7' }}>
                      <td style={{ padding: '16px 20px', color: '#718096', textAlign: 'center' }}>
                        {notices.length - index}
                      </td>

                      <td style={{ padding: '16px 20px', color: '#2d3748', fontWeight: '500' }}>
                        {notice.is_urgent && !notice.title.startsWith('[긴급]') && (
                          <span style={{ color: '#e53e3e', fontWeight: '700', marginRight: '6px' }}>
                            [긴급]
                          </span>
                        )}
                        {notice.title}
                      </td>

                      <td style={{ padding: '16px 20px', color: '#4a5568' }}>
                        {notice.created_by?.name || '관리자'}
                      </td>

                      <td style={{ padding: '16px 20px', color: '#718096' }}>
                        {formatDate(notice.createdAt)}
                      </td>

                      <td style={{ padding: '16px 20px', color: '#718096', textAlign: 'center' }}>
                        -
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleEditClick(notice)}
                            style={{
                              padding: '5px 10px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#fff',
                              color: '#2b6cb0',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '500'
                            }}
                          >
                            수정
                          </button>

                          <button
                            onClick={() => handleDeleteNotice(notice._id)}
                            style={{
                              padding: '5px 10px',
                              border: '1px solid #e2e8f0',
                              backgroundColor: '#fff',
                              color: '#e53e3e',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '500'
                            }}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ------------------ B. 공지사항 쓰기 화면 ------------------ */}
      {viewMode === 'create' && (
        <form onSubmit={handleFormSubmit}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a1f36', marginBottom: '6px' }}>
                공지사항 관리
              </h2>
              <p style={{ color: '#8792a2', fontSize: '14px' }}>
                학생들에게 공지할 시스템 공지사항을 관리합니다.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setViewMode('list');
              }}
              style={{
                backgroundColor: '#1a56db',
                color: '#fff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              목록 보기
            </button>
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1f36', marginBottom: '25px' }}>
            신규 공지 작성
          </h3>

          <NoticeFormFields
            formData={formData}
            handleInputChange={handleInputChange}
          />

          <button
            type="submit"
            disabled={saving}
            style={{
              backgroundColor: saving ? '#94a3b8' : '#1a56db',
              color: '#fff',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '6px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            {saving ? '등록 중...' : '등록 완료'}
          </button>
        </form>
      )}

      {/* ------------------ C. 공지사항 수정 화면 ------------------ */}
      {viewMode === 'edit' && (
        <form onSubmit={handleEditSubmit}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a1f36', marginBottom: '6px' }}>
                공지사항 관리
              </h2>
              <p style={{ color: '#8792a2', fontSize: '14px' }}>
                학생들에게 공지할 시스템 공지사항을 관리합니다.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setViewMode('list');
              }}
              style={{
                backgroundColor: '#718096',
                color: '#fff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              수정 취소
            </button>
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1f36', marginBottom: '25px' }}>
            공지사항 내용 수정
          </h3>

          <NoticeFormFields
            formData={formData}
            handleInputChange={handleInputChange}
          />

          <button
            type="submit"
            disabled={saving}
            style={{
              backgroundColor: saving ? '#94a3b8' : '#1a56db',
              color: '#fff',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '6px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            {saving ? '수정 중...' : '수정 완료'}
          </button>
        </form>
      )}
    </div>
  );
}

function NoticeFormFields({ formData, handleInputChange }) {
  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2d3748', marginBottom: '8px' }}>
          공지사항 제목
        </label>

        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="예: 가상 실습실 정기 점검 일정 안내"
          style={{
            width: '100%',
            padding: '14px 16px',
            border: '1px solid #edf2f7',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2d3748', marginBottom: '8px' }}>
          공지사항 내용
        </label>

        <textarea
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          placeholder="학생들에게 안내할 내용을 입력하세요."
          rows="6"
          style={{
            width: '100%',
            padding: '14px 16px',
            border: '1px solid #edf2f7',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
      </div>

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#2d3748',
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '25px',
          cursor: 'pointer'
        }}
      >
        <input
          type="checkbox"
          name="is_urgent"
          checked={formData.is_urgent}
          onChange={handleInputChange}
        />
        긴급 공지로 표시
      </label>
    </>
  );
}