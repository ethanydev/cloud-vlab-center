import React, { useState } from 'react';
import styled from 'styled-components';

const INITIAL_RESERVATIONS = [
  { id: 1, name: '임승재', studentId: '202612345', lab: '가상 실습실 A', bench: '03번 좌석', time: '14:00 ~ 16:00', status: '대기중' },
  { id: 2, name: '김철수', studentId: '202654321', lab: '가상 실습실 B', bench: '12번 좌석', time: '09:00 ~ 12:00', status: '사용중' },
  { id: 3, name: '이영희', studentId: '202698765', lab: '가상 실습실 A', bench: '01번 좌석', time: '13:00 ~ 15:00', status: '취소됨' },
  { id: 4, name: '박민수', studentId: '202645678', lab: '가상 실습실 C', bench: '07번 좌석', time: '10:00 ~ 12:00', status: '완료' },
  { id: 5, name: '최지우', studentId: '202611223', lab: '가상 실습실 B', bench: '05번 좌석', time: '16:00 ~ 18:00', status: '대기중' },
  { id: 6, name: '정민재', studentId: '202633445', lab: '가상 실습실 A', bench: '09번 좌석', time: '18:00 ~ 20:00', status: '사용중' },
  { id: 7, name: '홍길동', studentId: '202611111', lab: '가상 실습실 C', bench: '02번 좌석', time: '11:00 ~ 13:00', status: '예약됨' },
];

export default function Reservation() {
  const tabs = ['전체 예약', '승인/예약 대기', '사용중', '취소된 예약', '완료'];
  const [activeTab, setActiveTab] = useState('전체 예약');
  const [reservations, setReservations] = useState(INITIAL_RESERVATIONS);

  const handleApprove = (id) => {
    setReservations(prev =>
      prev.map(item => item.id === id ? { ...item, status: '예약됨' } : item)
    );
    alert('예약이 승인되어 [예약됨] 상태로 변경되었습니다.');
  };

  const handleReject = (id) => {
    setReservations(prev =>
      prev.map(item => item.id === id ? { ...item, status: '취소됨' } : item)
    );
    alert('예약이 거절되어 [취소됨] 상태로 변경되었습니다.');
  };

  const filteredReservations = reservations.filter(item => {
    if (activeTab === '전체 예약') return true;
    if (activeTab === '승인/예약 대기') return item.status === '대기중' || item.status === '예약됨';
    if (activeTab === '사용중') return item.status === '사용중';
    if (activeTab === '취소된 예약') return item.status === '취소됨';
    if (activeTab === '완료') return item.status === '완료';
    return true;
  });

  return (
    <Container>
      <PageHeader>
        <TitleArea>
          <PageTitle>📅 예약 관리 제어 센터</PageTitle>
          <PageSubtitle>학생들의 실습실 예약 승인/거절 및 이용 상태를 실시간으로 관제합니다.</PageSubtitle>
        </TitleArea>
        <SystemNoticeCard>
          <NoticeBadge>오토 스케줄 활성화</NoticeBadge>
          <NoticeText>종료 시간이 도래하면 시스템이 자동으로 <strong>[사용종료 ➡️ 완료]</strong> 처리를 수행합니다.</NoticeText>
        </SystemNoticeCard>
      </PageHeader>

      <TabButtonGroup>
        {tabs.map(tab => (
          <TabButton 
            key={tab} 
            active={activeTab === tab} 
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            <TabCount>
              {tab === '전체 예약' ? reservations.length : reservations.filter(r => {
                if (tab === '승인/예약 대기') return r.status === '대기중' || r.status === '예약됨';
                if (tab === '사용중') return r.status === '사용중';
                if (tab === '취소된 예약') return r.status === '취소됨';
                if (tab === '완료') return r.status === '완료';
                return false;
              }).length}
            </TabCount>
          </TabButton>
        ))}
      </TabButtonGroup>

      <TableContainer>
        <MainTable>
          <thead>
            <tr>
              <th>신청자</th>
              <th>학번</th>
              <th>실습실 정보</th>
              <th>지정 좌석</th>
              <th>예약 신청 시간</th>
              <th>현재 상태</th>
              <th style={{ textAlign: 'center' }}>관제 명령</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  해당 상태의 예약 내역이 존재하지 않습니다.
                </td>
              </tr>
            ) : (
              filteredReservations.map(res => (
                <tr key={res.id}>
                  <td><strong>{res.name}</strong></td>
                  <td style={{ color: '#64748b' }}>{res.studentId}</td>
                  <td>{res.lab}</td>
                  <td><SeatBadge>{res.bench}</SeatBadge></td>
                  <td>{res.time}</td>
                  <td>
                    <StatusBadge status={res.status}>
                      {res.status}
                    </StatusBadge>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {res.status === '대기중' && (
                      <ActionGroup>
                        <ApproveBtn onClick={() => handleApprove(res.id)}>승인</ApproveBtn>
                        <RejectBtn onClick={() => handleReject(res.id)}>거절</RejectBtn>
                      </ActionGroup>
                    )}
                    {/* 💡 모래시계 아이콘 제거 */}
                    {res.status === '예약됨' && (
                      <ActionGroup>
                        <SystemText color="#15803d">실습 시작 대기 중</SystemText>
                      </ActionGroup>
                    )}
                    {/* 💡 달리는 사람 아이콘 제거 */}
                    {res.status === '사용중' && (
                      <ActionGroup>
                        <EarlyCloseBtn onClick={() => {
                          setReservations(prev => prev.map(item => item.id === res.id ? { ...item, status: '완료' } : item));
                          alert('사용자가 조기 종료를 처리하여 [완료] 상태로 회수되었습니다.');
                        }}>
                          조기 반납 회수
                        </EarlyCloseBtn>
                      </ActionGroup>
                    )}
                    {res.status === '취소됨' && <SystemText color="#ef4444">거절/취소 처리됨</SystemText>}
                    {res.status === '완료' && <SystemText color="#64748b">자동 종료 완료</SystemText>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </MainTable>
      </TableContainer>
    </Container>
  );
}

/* ==========================================================================
   STYLING DEFINITIONS (Styled-components)
   ========================================================================== */
const Container = styled.div` width: 100%; display: flex; flex-direction: column; gap: 24px; `;
const PageHeader = styled.div` display: flex; justify-content: space-between; align-items: center; background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); `;
const TitleArea = styled.div` display: flex; flex-direction: column; gap: 4px; `;
const PageTitle = styled.h2` font-size: 22px; font-weight: 700; color: #1e293b; margin: 0; `;
const PageSubtitle = styled.p` font-size: 14px; color: #64748b; margin: 0; `;
const SystemNoticeCard = styled.div` display: flex; flex-direction: column; gap: 6px; background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 0 8px 8px 0; text-align: right; `;
const NoticeBadge = styled.span` font-size: 11px; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 20px; font-weight: 700; align-self: flex-end; `;
const NoticeText = styled.p` font-size: 12px; color: #334155; margin: 0; `;
const TabButtonGroup = styled.div` display: flex; gap: 8px; background: #e2e8f0; padding: 6px; border-radius: 10px; align-self: flex-start; `;
const TabButton = styled.button` display: flex; align-items: center; gap: 8px; border: none; padding: 10px 20px; font-size: 14px; font-weight: 600; border-radius: 8px; cursor: pointer; background: ${props => props.active ? 'white' : 'transparent'}; color: ${props => props.active ? '#1e293b' : '#64748b'}; box-shadow: ${props => props.active ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'}; transition: all 0.15s ease-in-out; `;
const TabCount = styled.span` font-size: 11px; background: #f1f5f9; padding: 2px 6px; border-radius: 20px; color: #475569; `;
const TableContainer = styled.div` background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); overflow: hidden; border: 1px solid #e2e8f0; `;
const MainTable = styled.table` width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; th { background: #f8fafc; padding: 16px; color: #475569; font-weight: 600; border-bottom: 1px solid #e2e8f0; } td { padding: 16px; border-bottom: 1px solid #f1f5f9; color: #334155; } tr:last-child td { border-bottom: none; } `;
const SeatBadge = styled.span` background: #f1f5f9; color: #334155; padding: 4px 8px; border-radius: 6px; font-weight: 500; font-size: 13px; border: 1px solid #e2e8f0; `;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
  
  ${props => {
    switch (props.status) {
      case '대기중': return `background-color: #fef3c7; color: #d97706;`; 
      case '예약됨': return `background-color: #dcfce7; color: #15803d;`; 
      case '사용중': return `background-color: #eff6ff; color: #2563eb;`; 
      case '취소됨': return `background-color: #fee2e2; color: #dc2626;`; 
      case '완료': return `background-color: #f1f5f9; color: #475569;`; 
      default: return `background-color: #f1f5f9; color: #334155;`;
    }
  }}
`;

const ActionGroup = styled.div` display: flex; gap: 6px; justify-content: center; `;
const ApproveBtn = styled.button` background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; &:hover { background: #1d4ed8; } `;
const RejectBtn = styled.button` background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; &:hover { background: #dc2626; } `;
const EarlyCloseBtn = styled.button` background: white; color: #334155; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; &:hover { background: #f8fafc; border-color: #94a3b8; } `;
const SystemText = styled.span` font-size: 13px; font-weight: 500; color: ${props => props.color || '#64748b'}; `;