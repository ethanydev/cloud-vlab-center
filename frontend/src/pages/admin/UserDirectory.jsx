import React, { useState } from 'react';
import styled from 'styled-components';

export default function UserDirectory() {
  // 💡 Admin 데이터를 빼고, 가상 실습실을 이용하는 일반 학생들로만 명단을 구성했습니다.
  const [users, setUsers] = useState([
    { id: 1, name: '김철수', dept: '컴퓨터공학과', studentId: '2021212836', role: 'Student', activeResources: 2, status: '정상', lastLogin: '2026-05-19' },
    { id: 2, name: '이영희', dept: '컴퓨터공학과', studentId: '2022145099', role: 'Student', activeResources: 0, status: '정상', lastLogin: '2026-05-18' },
    { id: 3, name: '박민수', dept: '컴퓨터공학과', studentId: '2020112423', role: 'Student', activeResources: 1, status: '이용정지', lastLogin: '2026-05-14' },
    { id: 4, name: '정태양', dept: '컴퓨터공학과', studentId: '2023152044', role: 'Student', activeResources: 3, status: '정상', lastLogin: '2026-05-22' }
  ]);

  // 체크박스 선택 관리를 위한 ID 배열 상태
  const [selectedIds, setSelectedIds] = useState([]);

  // --- [계산된 상태 항목들 (대시보드 카드용)] ---
  const totalUsers = users.length;
  const activeRentalUsers = users.filter(u => u.activeResources > 0).length;
  const suspendedUsers = users.filter(u => u.status === '이용정지').length;

  // --- [이벤트 핸들러 함수들] ---
  
  // 개별 행 체크박스 토글
  const handleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // 전체 선택 체크박스 토글
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(users.map(u => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  // 선택된 사용자들 일괄 '이용정지' 처리
  const handleBulkSuspend = () => {
    if (selectedIds.length === 0) {
      alert('변경할 사용자를 한 명 이상 선택해 주세요.');
      return;
    }
    if (window.confirm(`선택한 ${selectedIds.length}명의 사용자를 이용정지 처리하시겠습니까?`)) {
      setUsers(prev => prev.map(user => 
        selectedIds.includes(user.id) ? { ...user, status: '이용정지' } : user
      ));
      setSelectedIds([]); // 처리 후 체크박스 초기화
    }
  };

  // 선택된 사용자들 일괄 '정상 복구' 처리
  const handleBulkActivate = () => {
    if (selectedIds.length === 0) {
      alert('변경할 사용자를 한 명 이상 선택해 주세요.');
      return;
    }
    if (window.confirm(`선택한 ${selectedIds.length}명의 계정을 정상 상태로 복구하시겠습니까?`)) {
      setUsers(prev => prev.map(user => 
        selectedIds.includes(user.id) ? { ...user, status: '정상' } : user
      ));
      setSelectedIds([]);
    }
  };

  return (
    <div className="content-section" style={{ fontFamily: 'sans-serif' }}>
      
      {/* 상단 타이틀 구역 */}
      <h2>사용자 관리</h2>
      <p className="section-desc">등록된 학생 목록을 조회하고 실습 권한과 제재 상태를 관리합니다.</p>
      
      {/* 상단 미니 대시보드 카드 섹션 */}
      <SummaryCardsWrapper>
        <SummaryCard>
          <CardTitle>총 등록 학생</CardTitle>
          <CardValue style={{ color: '#1e293b' }}>{totalUsers}명</CardValue>
        </SummaryCard>
        <SummaryCard>
          <CardTitle>현재 자원 대여 학생</CardTitle>
          <CardValue style={{ color: '#2563eb' }}>{activeRentalUsers}명</CardValue>
        </SummaryCard>
        <SummaryCard>
          <CardTitle>이용 정지 계정</CardTitle>
          <CardValue style={{ color: '#ef4444' }}>{suspendedUsers}개</CardValue>
        </SummaryCard>
      </SummaryCardsWrapper>

      {/* 관리자용 일괄 액션 컨트롤 바 */}
      <ControlBarWrapper>
        <ButtonGroup>
          <ActionBtn className="suspend-btn" onClick={handleBulkSuspend}>선택 이용정지</ActionBtn>
          <ActionBtn className="activate-btn" onClick={handleBulkActivate}>선택 정상복구</ActionBtn>
        </ButtonGroup>
        <SelectedInfoText>
          {selectedIds.length > 0 ? `${selectedIds.length}명 선택됨` : '목록을 선택해 일괄 제어 가능'}
        </SelectedInfoText>
      </ControlBarWrapper>

      {/* 목록 테이블 구역 */}
      <div className="table-wrapper" style={{ marginTop: '12px' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '50px', textAlign: 'center' }}>
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll}
                  checked={selectedIds.length === users.length && users.length > 0}
                />
              </th>
              <th>이름</th>
              <th>학과</th>
              <th>학번 / ID</th>
              <th>권한</th>
              <th>대여 중인 자원 수</th>
              <th>계정 상태</th>
              <th>최근 접속일</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ backgroundColor: selectedIds.includes(user.id) ? '#f8fafc' : 'transparent' }}>
                <td style={{ textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(user.id)}
                    onChange={() => handleSelectRow(user.id)}
                  />
                </td>
                <td style={{ fontWeight: '600', color: '#1e293b' }}>{user.name}</td>
                <td>{user.dept}</td>
                <td style={{ color: '#64748b' }}>{user.studentId}</td>
                <td>
                  <RoleBadge>👤 Student</RoleBadge>
                </td>
                <td style={{ textAlign: 'center', fontWeight: 'bold', color: user.activeResources > 0 ? '#2563eb' : '#94a3b8' }}>
                  {user.activeResources} 개
                </td>
                <td>
                  <StatusBadge status={user.status}>
                    {user.status}
                  </StatusBadge>
                </td>
                <td>{user.lastLogin}</td>
              </tr>
            ))}
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

  &.suspend-btn {
    background-color: #fee2e2;
    color: #ef4444;
    &:hover { background-color: #fca5a5; }
  }
  &.activate-btn {
    background-color: #dbeafe;
    color: #2563eb;
    &:hover { background-color: #bfdbfe; }
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
  background-color: ${props => props.status === '정상' ? '#dcfce7' : '#fee2e2'};
  color: ${props => props.status === '정상' ? '#15803d' : '#b91c1c'};
`;