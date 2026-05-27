import React, { useState } from 'react';

export default function ResourceManager() {
  // --- 1. 초기 상태 정의 (새로고침 시 리셋되는 기준 데이터) ---
  const initialResources = [
    { id: 1, name: 'Server-A-01', type: 'GPU Server', spec: 'RTX 4090 / 64GB', status: 'Online', usage: '45%' },
    { id: 2, name: 'Server-A-02', type: 'CPU Server', spec: 'Xeon Gold / 128GB', status: 'Online', usage: '82%' },
    { id: 3, name: 'Storage-01', type: 'NAS', spec: '10TB Raid-5', status: 'Maintenance', usage: '15%' }
  ];

  // --- 2. State(상태) 관리 ---
  const [resources, setResources] = useState(initialResources);
  const [viewMode, setViewMode] = useState('list'); // 'list' 또는 'create'

  // 입력 폼 상태 변수들
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    spec: ''
  });

  // --- 3. 기능 핸들러 함수 ---
  
  // 입력 필드 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 신규 자원 임시 등록 처리
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('자원 명칭을 입력해 주세요.');
      return;
    }

    const newResource = {
      id: Date.now(), // 고유 ID 대용
      name: formData.name,
      type: formData.type || 'GPU Server', // 미입력 시 기본값
      spec: formData.spec || 'RTX 5090 / 128GB', // 미입력 시 기본값
      status: 'Online',
      usage: '0%'
    };

    // 목록에 추가하고, 입력 폼 초기화 후 다시 목록 화면으로 복귀
    setResources(prev => [...prev, newResource]);
    setFormData({ name: '', type: '', spec: '' });
    setViewMode('list');
  };

  // 임시 자원 삭제
  const handleDeleteResource = (id) => {
    if (window.confirm("정말 이 자원을 삭제하시겠습니까?")) {
      setResources(prev => prev.filter(item => item.id !== id));
    }
  };

  // 상태(Status)별 텍스트 색상 지정
  const getStatusColor = (status) => {
    if (status === 'Online') return '#2b8a3e';
    if (status === 'Maintenance') return '#e67e22';
    return '#666';
  };

  // --- 4. 렌더링 영역 (화면 모드 분기 처리) ---
  return (
    <div style={{ padding: '40px 30px', fontFamily: 'sans-serif', backgroundColor: '#fff', minHeight: '100vh' }}>
      
      {/* ------------------ A. 목록 보기 화면 (viewMode === 'list') ------------------ */}
      {viewMode === 'list' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a1f36', marginBottom: '6px' }}>자원 관리</h2>
              <p style={{ color: '#8792a2', fontSize: '14px' }}>실습실 서버 노드 및 장비를 관리합니다.</p>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('create')}
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
              + 신규 자원 등록
            </button>
          </div>

          <div style={{ border: '1px solid #edf2f7', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #edf2f7' }}>
                  <th style={{ padding: '14px 20px', color: '#4a5568', fontWeight: '600' }}>노드 이름</th>
                  <th style={{ padding: '14px 20px', color: '#4a5568', fontWeight: '600' }}>자원 분류</th>
                  <th style={{ padding: '14px 20px', color: '#4a5568', fontWeight: '600' }}>스펙</th>
                  <th style={{ padding: '14px 20px', color: '#4a5568', fontWeight: '600' }}>상태</th>
                  <th style={{ padding: '14px 20px', color: '#4a5568', fontWeight: '600' }}>사용률</th>
                  <th style={{ padding: '14px 20px', color: '#4a5568', fontWeight: '600', textAlign: 'center' }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((resource) => (
                  <tr key={resource.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                    <td style={{ padding: '16px 20px', color: '#2d3748', fontWeight: '500' }}>{resource.name}</td>
                    <td style={{ padding: '16px 20px', color: '#718096' }}>{resource.type}</td>
                    <td style={{ padding: '16px 20px', color: '#718096' }}>{resource.spec}</td>
                    <td style={{ padding: '16px 20px', color: getStatusColor(resource.status), fontWeight: '600' }}>{resource.status}</td>
                    <td style={{ padding: '16px 20px', color: '#2d3748' }}>{resource.usage}</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteResource(resource.id)}
                        style={{
                          padding: '5px 12px',
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ------------------ B. 신규 자원 등록 폼 화면 (viewMode === 'create') ------------------ */}
      {viewMode === 'create' && (
        <form onSubmit={handleFormSubmit}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a1f36', marginBottom: '6px' }}>자원 관리</h2>
              <p style={{ color: '#8792a2', fontSize: '14px' }}>실습실 서버 노드 및 장비를 관리합니다.</p>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                backgroundColor: '#475569',
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

          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1f36', marginBottom: '25px' }}>신규 자원 등록</h3>

          {/* 자원 명칭 입력 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2d3748', marginBottom: '8px' }}>
              자원 명칭
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="예: Server-A-03"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #edf2f7',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* 자원 분류 입력 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2d3748', marginBottom: '8px' }}>
              자원 분류
            </label>
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              placeholder="GPU Server / CPU Server / NAS 등"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #edf2f7',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* 상세 스펙 입력 */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2d3748', marginBottom: '8px' }}>
              상태 / 상세 스펙
            </label>
            <input
              type="text"
              name="spec"
              value={formData.spec}
              onChange={handleInputChange}
              placeholder="예: RTX 5090 / 128GB"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #edf2f7',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* 등록 완료 버튼 */}
          <button
            type="submit"
            style={{
              backgroundColor: '#1a56db',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
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

    </div>
  );
}