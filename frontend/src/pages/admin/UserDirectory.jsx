import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getUsers, updateUserStatus } from '../../api/users';

export default function UserDirectory() {
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getUsers();

      const studentUsers = Array.isArray(data)
        ? data.filter((user) => user.role === 'student')
        : [];

      setUsers(studentUsers);
    } catch (err) {
      console.error('사용자 목록 조회 실패:', err);
      setError(
        err.response?.data?.message ||
        '사용자 목록을 불러오지 못했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const totalUsers = users.length;
  const activeRentalUsers = users.filter(
    (user) => (user.current_reservations || 0) > 0
  ).length;
  const suspendedUsers = users.filter(
    (user) => !user.is_active
  ).length;

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(users.map((user) => user._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkStatusChange = async (isActive) => {
    if (selectedIds.length === 0) {
      alert('변경할 사용자를 한 명 이상 선택해 주세요.');
      return;
    }

    const actionText = isActive ? '정상복구' : '이용정지';

    if (
      !window.confirm(
        `선택한 ${selectedIds.length}명의 사용자를 ${actionText} 처리하시겠습니까?`
      )
    ) {
      return;
    }

    try {
      setProcessing(true);

      await Promise.all(
        selectedIds.map((id) => updateUserStatus(id, isActive))
      );

      alert(`선택한 사용자가 ${actionText} 처리되었습니다.`);
      setSelectedIds([]);
      await loadUsers();
    } catch (err) {
      console.error('사용자 상태 변경 실패:', err);
      alert(
        err.response?.data?.message ||
        '사용자 상태 변경에 실패했습니다.'
      );
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '-';

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return date
      .toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .replace(/ /g, '');
  };

  return (
    <div className="content-section" style={{ fontFamily: 'sans-serif' }}>
      <h2>사용자 관리</h2>
      <p className="section-desc">
        등록된 학생 목록을 조회하고 실습 권한과 제재 상태를 관리합니다.
      </p>

      <SummaryCardsWrapper>
        <SummaryCard>
          <CardTitle>총 등록 학생</CardTitle>
          <CardValue style={{ color: '#1e293b' }}>
            {totalUsers}명
          </CardValue>
        </SummaryCard>

        <SummaryCard>
          <CardTitle>현재 자원 대여 학생</CardTitle>
          <CardValue style={{ color: '#2563eb' }}>
            {activeRentalUsers}명
          </CardValue>
        </SummaryCard>

        <SummaryCard>
          <CardTitle>이용 정지 계정</CardTitle>
          <CardValue style={{ color: '#ef4444' }}>
            {suspendedUsers}개
          </CardValue>
        </SummaryCard>
      </SummaryCardsWrapper>

      <ControlBarWrapper>
        <ButtonGroup>
          <ActionBtn
            className="suspend-btn"
            onClick={() => handleBulkStatusChange(false)}
            disabled={processing}
          >
            선택 이용정지
          </ActionBtn>

          <ActionBtn
            className="activate-btn"
            onClick={() => handleBulkStatusChange(true)}
            disabled={processing}
          >
            선택 정상복구
          </ActionBtn>
        </ButtonGroup>

        <SelectedInfoText>
          {processing
            ? '처리 중입니다.'
            : selectedIds.length > 0
              ? `${selectedIds.length}명 선택됨`
              : '목록을 선택해 일괄 제어 가능'}
        </SelectedInfoText>
      </ControlBarWrapper>

      <div className="table-wrapper" style={{ marginTop: '12px' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '50px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    selectedIds.length === users.length && users.length > 0
                  }
                />
              </th>
              <th>이름</th>
              <th>이메일</th>
              <th>학번 / ID</th>
              <th>권한</th>
              <th>현재 예약 수</th>
              <th>계정 상태</th>
              <th>가입일</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#64748b',
                  }}
                >
                  사용자 목록을 불러오는 중입니다.
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#ef4444',
                  }}
                >
                  {error}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#94a3b8',
                  }}
                >
                  등록된 학생 사용자가 없습니다.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const statusText = user.is_active ? '정상' : '이용정지';
                const activeReservations = user.current_reservations || 0;

                return (
                  <tr
                    key={user._id}
                    style={{
                      backgroundColor: selectedIds.includes(user._id)
                        ? '#f8fafc'
                        : 'transparent',
                    }}
                  >
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(user._id)}
                        onChange={() => handleSelectRow(user._id)}
                      />
                    </td>

                    <td style={{ fontWeight: '600', color: '#1e293b' }}>
                      {user.name || '-'}
                    </td>

                    <td>{user.email || '-'}</td>

                    <td style={{ color: '#64748b' }}>
                      {user.student_id || '-'}
                    </td>

                    <td>
                      <RoleBadge>👤 Student</RoleBadge>
                    </td>

                    <td
                      style={{
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color:
                          activeReservations > 0 ? '#2563eb' : '#94a3b8',
                      }}
                    >
                      {activeReservations} 개
                    </td>

                    <td>
                      <StatusBadge status={statusText}>
                        {statusText}
                      </StatusBadge>
                    </td>

                    <td>{formatDate(user.createdAt)}</td>
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

/* ==========================================================================
   STYLING COMPONENTS
   ========================================================================== */

const SummaryCardsWrapper = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 24px;
  margin-bottom: 24px;
`;

const SummaryCard = styled.div`
  flex: 1;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
`;

const CardTitle = styled.h4`
  margin: 0 0 6px 0;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
`;

const CardValue = styled.p`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
`;

const ControlBarWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8fafc;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionBtn = styled.button`
  border: none;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.15s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.suspend-btn {
    background-color: #fee2e2;
    color: #ef4444;

    &:hover:not(:disabled) {
      background-color: #fca5a5;
    }
  }

  &.activate-btn {
    background-color: #dbeafe;
    color: #2563eb;

    &:hover:not(:disabled) {
      background-color: #bfdbfe;
    }
  }
`;

const SelectedInfoText = styled.span`
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
`;

const RoleBadge = styled.span`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background-color: #f1f5f9;
  color: #475569;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${(props) =>
    props.status === '정상' ? '#dcfce7' : '#fee2e2'};
  color: ${(props) =>
    props.status === '정상' ? '#15803d' : '#b91c1c'};
`;