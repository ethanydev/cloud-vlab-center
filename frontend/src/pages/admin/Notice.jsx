import React, { useState } from 'react';

export default function Notice() {
  // 1. 초기 데이터를 1, 2, 3 순서대로 배열해 두어 화면 위에서부터 1, 2, 3 순으로 나오게 합니다.
  const initialNotices = [
    { id: 1, title: '2026학년도 1학기 가상 실습실 이용 수칙 안내', author: '관리자', date: '2026-03-02', views: 142 },
    { id: 2, title: '[긴급] 내부 백본 스위치 교체 작업으로 인한 서비스 일시 중단 안내', author: '관리자', date: '2026-04-15', views: 89 },
    { id: 3, title: 'AI 융합 전용 GPU 노드(Server-A-01) 리소스 확충 안내', author: '관리자', date: '2026-05-10', views: 204 }
  ];

  // --- 상태(State) 관리 ---
  const [notices, setNotices] = useState(initialNotices);
  const [viewMode, setViewMode] = useState('list'); // 'list'(목록) | 'create'(쓰기) | 'edit'(수정)
  
  // 공지 쓰기 및 수정용 입력 폼 상태
  const [formData, setFormData] = useState({ title: '' });
  const [editingId, setEditingId] = useState(null); // 현재 수정 중인 공지글의 ID

  // --- 기능 핸들러 함수 ---

  // 폼 입력값 변경
  const handleInputChange = (e) => {
    setFormData({ title: e.target.value });
  };

  // [공지 등록] 처리
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('공지사항 제목을 입력해 주세요.');
      return;
    }

    // 새 글 번호는 현재 있는 id 중 가장 큰 값에 +1을 해줍니다.
    const nextId = notices.length > 0 ? Math.max(...notices.map(n => n.id)) + 1 : 1;

    const newNotice = {
      id: nextId,
      title: formData.title,
      author: '관리자',
      date: new Date().toISOString().split('T')[0],
      views: 0
    };

    // [수정 포인트] 위에서 아래로 1, 2, 3, 4 순서가 유지되도록 기존 리스트의 '맨 뒤'에 새 글을 붙입니다.
    setNotices(prev => [...prev, newNotice]); 
    
    setFormData({ title: '' });
    setViewMode('list');
    alert('새로운 공지사항이 등록되었습니다.');
  };

  // [공지 수정] 버튼 클릭 시 수정 폼 화면으로 전환
  const handleEditClick = (notice) => {
    setEditingId(notice.id);
    setFormData({ title: notice.title });
    setViewMode('edit');
  };

  // [공지 수정 완료] 처리
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('공지사항 제목을 입력해 주세요.');
      return;
    }

    setNotices(prev =>
      prev.map(item =>
        item.id === editingId ? { ...item, title: formData.title } : item
      )
    );
    setEditingId(null);
    setFormData({ title: '' });
    setViewMode('list');
    alert('공지사항이 성공적으로 수정되었습니다.');
  };

  // [공지 삭제] 처리
  const handleDeleteNotice = (id) => {
    if (window.confirm('정말 이 공지사항을 완전히 삭제하시겠습니까?')) {
      setNotices(prev => prev.filter(item => item.id !== id));
      alert('공지사항이 삭제되었습니다.');
    }
  };


  return (
    <div style={{ padding: '40px 30px', fontFamily: 'sans-serif', backgroundColor: '#fff', minHeight: '100vh' }}>
      
      {/* ------------------ A. 공지사항 목록 보기 화면 (viewMode === 'list') ------------------ */}
      {viewMode === 'list' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a1f36', marginBottom: '6px' }}>공지사항 관리</h2>
              <p style={{ color: '#8792a2', fontSize: '14px' }}>학생들에게 공지할 시스템 공지사항을 관리합니다.</p>
            </div>
            <button
              onClick={() => {
                setFormData({ title: '' });
                setViewMode('create');
              }}
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

          {/* 테이블 영역 */}
          <div style={{ border: '1px solid #edf2f7', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #edf2f7' }}>
                  <th style={{ padding: '14px 20px', color: '#4a5568', fontWeight: '600', width: '60px', textAlign: 'center' }}>번호</th>
                  <th style={{ padding: '14px 20px', color: '#4a5568', fontWeight: '600' }}>제목</th>
                  <th style={{ padding: '14px 20px', color: '#4a5568', fontWeight: '600', width: '100px' }}>작성자</th>
                  <th style={{ padding: '14px 20px', color: '#4a5568', fontWeight: '600', width: '120px' }}>등록일</th>
                  <th style={{ padding: '14px 20px', color: '#4a5568', fontWeight: '600', width: '80px', textAlign: 'center' }}>조회수</th>
                  <th style={{ padding: '14px 20px', color: '#4a5568', fontWeight: '600', width: '150px', textAlign: 'center' }}>관리 제어</th>
                </tr>
              </thead>
              <tbody>
                {notices.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#a0aec0' }}>
                      등록된 공지사항이 없습니다.
                    </td>
                  </tr>
                ) : (
                  notices.map((notice) => (
                    <tr key={notice.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                      <td style={{ padding: '16px 20px', color: '#718096', textAlign: 'center' }}>{notice.id}</td>
                      <td style={{ padding: '16px 20px', color: '#2d3748', fontWeight: '500' }}>{notice.title}</td>
                      <td style={{ padding: '16px 20px', color: '#4a5568' }}>{notice.author}</td>
                      <td style={{ padding: '16px 20px', color: '#718096' }}>{notice.date}</td>
                      <td style={{ padding: '16px 20px', color: '#718096', textAlign: 'center' }}>{notice.views}</td>
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
                            onClick={() => handleDeleteNotice(notice.id)}
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

      {/* ------------------ B. 공지사항 쓰기 화면 (viewMode === 'create') ------------------ */}
      {viewMode === 'create' && (
        <form onSubmit={handleFormSubmit}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a1f36', marginBottom: '6px' }}>공지사항 관리</h2>
              <p style={{ color: '#8792a2', fontSize: '14px' }}>학생들에게 공지할 시스템 공지사항을 관리합니다.</p>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('list')}
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

          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1f36', marginBottom: '25px' }}>신규 공지 작성</h3>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2d3748', marginBottom: '8px' }}>
              공지사항 제목
            </label>
            <input
              type="text"
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

          <button
            type="submit"
            style={{
              backgroundColor: '#1a56db',
              color: '#fff',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            등록 완료
          </button>
        </form>
      )}

      {/* ------------------ C. 공지사항 수정 화면 (viewMode === 'edit') ------------------ */}
      {viewMode === 'edit' && (
        <form onSubmit={handleEditSubmit}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a1f36', marginBottom: '6px' }}>공지사항 관리</h2>
              <p style={{ color: '#8792a2', fontSize: '14px' }}>학생들에게 공지할 시스템 공지사항을 관리합니다.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setFormData({ title: '' });
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

          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1f36', marginBottom: '25px' }}>공지사항 내용 수정</h3>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2d3748', marginBottom: '8px' }}>
              공지사항 제목 수정
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={handleInputChange}
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

          <button
            type="submit"
            style={{
              backgroundColor: '#1a56db',
              color: '#fff',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            수정 완료
          </button>
        </form>
      )}

    </div>
  );
}