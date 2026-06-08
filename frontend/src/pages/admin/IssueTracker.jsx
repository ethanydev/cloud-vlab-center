import React, { useEffect, useState } from 'react';
import { getIssues, updateIssueStatus } from '../../api/issues';

export default function IssueTracker() {
  const [issues, setIssues] = useState([]);
  const [activeTab, setActiveTab] = useState('전체 이슈');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const tabs = ['전체 이슈', '대기중', '처리중', '조치완료'];

  const loadIssues = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getIssues();
      setIssues(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('관리자 이슈 목록 조회 실패:', err);
      setError(
        err.response?.data?.message ||
        '이슈 목록을 불러오지 못했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const getStatusLabel = (status) => {
    if (status === 'waiting') return '대기중';
    if (status === 'in_progress') return '처리중';
    if (status === 'resolved') return '조치완료';
    return '-';
  };

  const getStatusValue = (label) => {
    if (label === '대기중') return 'waiting';
    if (label === '처리중') return 'in_progress';
    if (label === '조치완료') return 'resolved';
    return '';
  };

  const handleStatusChange = async (issue) => {
    let nextStatus = '';
    let message = '';

    if (issue.status === 'waiting') {
      nextStatus = 'in_progress';
      message = '이슈가 접수되어 [처리중] 상태로 변경되었습니다.';
    } else if (issue.status === 'in_progress') {
      nextStatus = 'resolved';
      message = '이슈가 조치 완료되어 [조치완료] 상태로 변경되었습니다.';
    } else {
      return;
    }

    try {
      await updateIssueStatus(issue._id, nextStatus);
      alert(message);
      await loadIssues();
    } catch (err) {
      console.error('이슈 상태 변경 실패:', err);
      alert(
        err.response?.data?.message ||
        '이슈 상태 변경에 실패했습니다.'
      );
    }
  };

  const filteredIssues = issues.filter((issue) => {
    if (activeTab === '전체 이슈') return true;
    return issue.status === getStatusValue(activeTab);
  });

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'waiting':
        return { backgroundColor: '#fee2e2', color: '#ef4444' };
      case 'in_progress':
        return { backgroundColor: '#fef3c7', color: '#d97706' };
      case 'resolved':
        return { backgroundColor: '#dcfce7', color: '#15803d' };
      default:
        return { backgroundColor: '#f1f5f9', color: '#64748b' };
    }
  };

  const formatTicketId = (id) => {
    if (!id) return '-';
    return `#ISS-${id.slice(-6).toUpperCase()}`;
  };

  const formatDateTime = (dateValue) => {
    if (!dateValue) return '-';

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div style={{ padding: '40px 30px', fontFamily: 'sans-serif', backgroundColor: '#fff', minHeight: '100vh' }}>
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a1f36', marginBottom: '6px' }}>
          이슈 및 장애 관리
        </h2>
        <p style={{ color: '#8792a2', fontSize: '14px' }}>
          시스템 내부 오류 및 유저 신고 접수 내역입니다.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #edf2f7', marginBottom: '20px', paddingBottom: '1px' }}>
        {tabs.map((tab) => (
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
              <th style={{ padding: '14px 20px', color: '#4a5568', fontWeight: '600' }}>신고자</th>
              <th style={{ padding: '14px 20px', color: '#4a5568', fontWeight: '600' }}>내용</th>
              <th style={{ padding: '14px 20px', color: '#4a5568', fontWeight: '600' }}>등록일</th>
              <th style={{ padding: '14px 20px', color: '#4a5568', fontWeight: '600', textAlign: 'center' }}>상태 / 관리</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#8792a2' }}>
                  이슈 목록을 불러오는 중입니다.
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#e53e3e' }}>
                  {error}
                </td>
              </tr>
            ) : filteredIssues.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#a0aec0' }}>
                  해당 상태의 이슈 티켓이 존재하지 않습니다.
                </td>
              </tr>
            ) : (
              filteredIssues.map((issue) => (
                <tr key={issue._id} style={{ borderBottom: '1px solid #edf2f7' }}>
                  <td style={{ padding: '16px 20px', fontWeight: '500', color: '#1a56db' }}>
                    {formatTicketId(issue._id)}
                  </td>

                  <td style={{ padding: '16px 20px', color: '#4a5568' }}>
                    <strong>{issue.created_by?.name || '-'}</strong>
                    <div style={{ marginTop: '4px', color: '#718096', fontSize: '12px' }}>
                      {issue.created_by?.student_id || '-'}
                    </div>
                  </td>

                  <td style={{ padding: '16px 20px', color: '#2d3748' }}>
                    <strong>{issue.title || '-'}</strong>
                    <div style={{ marginTop: '4px', color: '#718096', fontSize: '13px' }}>
                      {issue.content || '-'}
                    </div>
                  </td>

                  <td style={{ padding: '16px 20px', color: '#718096' }}>
                    {formatDateTime(issue.createdAt)}
                  </td>

                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          ...getStatusBadgeStyle(issue.status)
                        }}
                      >
                        {getStatusLabel(issue.status)}
                      </span>

                      {issue.status !== 'resolved' && (
                        <button
                          onClick={() => handleStatusChange(issue)}
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
                          {issue.status === 'waiting' ? '접수' : '해결'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}