import React, { useEffect, useState } from 'react';
import {
  getResources,
  createResource,
  updateResourceStatus,
} from '../../api/resources';

export default function ResourceManager() {
  // --- 1. State(상태) 관리 ---
  const [resources, setResources] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' 또는 'create'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // 기존 등록 폼 디자인 유지
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    spec: ''
  });

  // --- 2. 실제 자원 목록 조회 ---
  const loadResources = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getResources();
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('자원 목록 조회 실패:', err);
      setError(
        err.response?.data?.message ||
        '자원 목록을 불러오지 못했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  // --- 3. 기능 핸들러 함수 ---

  // 입력 필드 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 신규 자원 실제 등록 처리
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.type.trim()) {
      alert('자원 명칭과 자원 분류를 입력해 주세요.');
      return;
    }

  const newResource = {
    name: formData.name.trim(),
    lab_id: formData.type.trim(),
    spec: {
      description: formData.spec.trim()
    },
    status: 'active',
    operating_hours: {
      days: ['mon', 'tue', 'wed', 'thu', 'fri'],
      start_time: '09:00',
      end_time: '22:00',
      max_concurrent: 1
    },
    equipment: []
  };
    try {
      setSaving(true);

      await createResource(newResource);

      alert('신규 자원이 등록되었습니다.');
      setFormData({ name: '', type: '', spec: '' });
      setViewMode('list');
      await loadResources();
    } catch (err) {
      console.error('자원 등록 실패:', err);
      alert(
        err.response?.data?.message ||
        '자원 등록에 실패했습니다.'
      );
    } finally {
      setSaving(false);
    }
  };

  // 삭제 버튼: 실제 DB 삭제 대신 retired 처리
  const handleDeleteResource = async (resource) => {
    const confirmed = window.confirm(
      `${resource.name} 자원을 삭제하시겠습니까?\n삭제 처리된 자원은 목록과 학생 예약 신청 화면에서 제외됩니다.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await updateResourceStatus(resource._id, 'retired');

      alert('자원이 삭제 처리되었습니다.');
      await loadResources();
    } catch (err) {
      console.error('자원 삭제 처리 실패:', err);
      alert(
        err.response?.data?.message ||
        '자원 삭제 처리에 실패했습니다.'
      );
    }
  };

  // 상태값 화면 표시
  const getStatusText = (status) => {
    if (status === 'active') return 'Online';
    if (status === 'maintenance') return 'Maintenance';
    if (status === 'retired') return 'Retired';
    return '-';
  };

  // 상태(Status)별 텍스트 색상 지정
  const getStatusColor = (status) => {
    if (status === 'active') return '#2b8a3e';
    if (status === 'maintenance') return '#e67e22';
    if (status === 'retired') return '#e53e3e';
    return '#666';
  };

  // 실제 DB의 spec 객체를 기존 한 줄 표시 형태로 변환
  const formatSpec = (spec) => {
    if (!spec) return '-';

    if (typeof spec === 'string') {
      return spec;
    }

    const detailedSpec = [
      spec.gpu,
      spec.cpu,
      spec.memory,
      spec.storage
    ].filter(Boolean);

    if (detailedSpec.length > 0) {
      return detailedSpec.join(' / ');
    }

    return spec.description || '-';
  };

  // --- 4. 렌더링 영역 (기존 화면 구조 유지) ---
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
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{ padding: '40px', textAlign: 'center', color: '#8792a2' }}
                    >
                      자원 목록을 불러오는 중입니다.
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{ padding: '40px', textAlign: 'center', color: '#e53e3e' }}
                    >
                      {error}
                    </td>
                  </tr>
                ) : resources.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{ padding: '40px', textAlign: 'center', color: '#8792a2' }}
                    >
                      등록된 자원이 없습니다.
                    </td>
                  </tr>
                ) : (
                  resources.map((resource) => (
                    <tr key={resource._id} style={{ borderBottom: '1px solid #edf2f7' }}>
                      <td style={{ padding: '16px 20px', color: '#2d3748', fontWeight: '500' }}>
                        {resource.name || '-'}
                      </td>

                      <td style={{ padding: '16px 20px', color: '#718096' }}>
                        {resource.lab_id || '-'}
                      </td>

                      <td style={{ padding: '16px 20px', color: '#718096' }}>
                        {formatSpec(resource.spec)}
                      </td>

                      <td style={{ padding: '16px 20px', color: getStatusColor(resource.status), fontWeight: '600' }}>
                        {getStatusText(resource.status)}
                      </td>

                      <td style={{ padding: '16px 20px', color: '#2d3748' }}>
                        -
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteResource(resource)}
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
                  ))
                )}
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
              placeholder="예: GPU Server B"
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
              placeholder="예: IT-505"
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
              placeholder="예: RTX 4090 / Intel Xeon / 128GB DDR4 / 2TB NVMe SSD"
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
            disabled={saving}
            style={{
              backgroundColor: saving ? '#94a3b8' : '#1a56db',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
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

    </div>
  );
}