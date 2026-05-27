import React, { useState } from 'react';

export default function IssueTracker() {
  const initialIssues = [
    { id: '#ISS-001', category: 'Hardware', content: 'Server-02 하드웨어 팬 소음 발생 수리 요청', priority: 'High', status: '대기중' },
    { id: '#ISS-002', category: 'Network', content: '외부 가상환경 접근 지연 현상 제보', priority: 'Medium', status: '처리중' },
    { id: '#ISS-003', category: 'Software', content: 'Docker 컨테이너 생성 권한 오류', priority: 'High', status: '조치완료' },
    { id: '#ISS-004', category: 'Database', content: 'MariaDB 테스트 계정 접속 불가', priority: 'Low', status: '대기중' }
  ];

  const [issues, setIssues] = useState(initialIssues);
  const [activeTab, setActiveTab] = useState('전체 이슈');

  const tabs = ['전체 이슈', '대기중', '처리중', '조치완료'];

  const handleStatusChange = (id, currentStatus) => {
    let nextStatus = '';
    if (currentStatus === '대기중') {
      nextStatus = '처리중';
      alert(`이슈가 접수되어 [처리중] 상태로 변경되었습니다.`);
    } else if (currentStatus === '처리중') {
      nextStatus = '조치완료';
      alert(`이슈가 조치 완료되어 [조치완료] 상태로 변경되었습니다.`);
    }

    setIssues(prev =>
      prev.map(issue =>
        issue.id === id ? { ...issue, status: nextStatus } : issue
      )
    );
  };

  const filteredIssues = issues.filter(issue => {
    if (activeTab === '전체 이슈') return true;
    return issue.status === activeTab;
  });

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case '대기중': return { backgroundColor: '#fee2e2', color: '#ef4444' };
      case '처리중': return { backgroundColor: '#fef3c7', color: '#d97706' };
      case '조치완료': return { backgroundColor: '#dcfce7', color: '#15803d' };
      default: return { backgroundColor: '#f1f5f9', color: '#64748b' };
    }
  };

  /* 💡 요청하신 색상 가이드라인을 반영한 우선순위 매핑 함수 */
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High':
        // 높음: 빨간색 계열
        return { text: '높음', color: '#dc2626', backgroundColor: '#fee2e2' };
      case 'Medium':
        // 중간(보통): 노란색 계열
        return { text: '보통', color: '#b45309', backgroundColor: '#fef3c7' };
      case 'Low':
        // 낮음: 회색 계열
        return { text: '낮음', color: '#4b5563', backgroundColor: '#e5e7eb' };
      default:
        return { text: '보통', color: '#4b5563', backgroundColor: '#e5e7eb' };
    }
  };

  return (
    <div style={{ padding: '40px 30px', fontFamily: 'sans-serif', backgroundColor: '#fff', minHeight: '100vh' }}>
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a1f36', marginBottom: '6px' }}>이슈 및 장애 관리</h2>
        <p style={{ color: '#8792a2', fontSize: '14px' }}>시스템 내부 오류 및 유저 신고 접수 내역입니다.</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #edf2f7', marginBottom: '20px', paddingBottom: '1px' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '14px',
              fontWeight: activeTab === tab ? '600' : '400',
              color: activeTab === tab ? '#1a56db' : '#64748b',
              borderBottom: activeTab === tab ? '2px solid #1a56db' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-1px'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ border: '1px solid #edf2f7', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #edf2f7' }}>
              <th style={{ padding: '14px 20px', color: '#4a5568', fontWeight: '600' }}>티켓 ID</th>
              <th style={{ padding: '14px 20px', color: '#4a5568', fontWeight: '600' }}>카테고리</th>
              <th style={{ padding: '14px 20px', color: '#4a5568', fontWeight: '600' }}>내용</th>
              <th style={{ padding: '14px 20px', color: '#4a5568', fontWeight: '600' }}>우선순위</th>
              <th style={{ padding: '14px 20px', color: '#4a5568', fontWeight: '600', textAlign: 'center' }}>상태 / 관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredIssues.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#a0aec0' }}>
                  해당 상태의 이슈 티켓이 존재하지 않습니다.
                </td>
              </tr>
            ) : (
              filteredIssues.map((issue) => {
                const priorityInfo = getPriorityStyle(issue.priority);

                return (
                  <tr key={issue.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                    <td style={{ padding: '16px 20px', fontWeight: '500', color: '#1a56db' }}>{issue.id}</td>
                    <td style={{ padding: '16px 20px', color: '#4a5568' }}>{issue.category}</td>
                    <td style={{ padding: '16px 20px', color: '#2d3748' }}>{issue.content}</td>
                    <td style={{ padding: '16px 20px' }}>
                      {/* 💡 변경된 한글 우선순위 및 커스텀 색상 배지 */}
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: priorityInfo.color,
                        backgroundColor: priorityInfo.backgroundColor,
                        display: 'inline-block'
                      }}>
                        {priorityInfo.text}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyHeigh: 'center', justifyContent: 'center' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          ...getStatusBadgeStyle(issue.status)
                        }}>
                          {issue.status}
                        </span>

                        {issue.status !== '조치완료' && (
                          <button 
                            onClick={() => handleStatusChange(issue.id, issue.status)}
                            style={{
                              background: '#fff',
                              color: '#4a5568',
                              border: '1px solid #cbd5e1',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                          >
                            {issue.status === '대기중' ? '접수' : '해결'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}