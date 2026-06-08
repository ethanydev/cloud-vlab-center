import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  getReservations,
  approveReservation,
  rejectReservation,
  endReservation,
} from '../../api/reservations';

const STATUS_LABELS = {
  waiting: '대기중',
  reserved: '예약됨',
  using: '사용중',
  cancelled: '취소됨',
  completed: '완료',
};

export default function Reservation() {
  const tabs = ['전체 예약', '승인/예약 대기', '사용중', '취소된 예약', '완료'];

  const [activeTab, setActiveTab] = useState('전체 예약');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getStatusLabel = (status) => {
    return STATUS_LABELS[status] || status || '-';
  };

  const formatReservationTime = (startTime, endTime) => {
    if (!startTime || !endTime) return '-';

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return '-';
    }

    const date = start.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const startText = start.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const endText = end.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return `${date} ${startText} ~ ${endText}`;
  };

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getReservations();
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('관리자 예약 목록 조회 실패:', err);
      setError(
        err.response?.data?.message ||
        '예약 목록을 불러오지 못했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveReservation(id);
      alert('예약이 승인되어 [예약됨] 상태로 변경되었습니다.');
      await loadReservations();
    } catch (err) {
      console.error('예약 승인 실패:', err);
      alert(
        err.response?.data?.message ||
        '예약 승인 처리에 실패했습니다.'
      );
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt(
      '거절 사유를 입력해 주세요.',
      '관리자에 의해 거절되었습니다.'
    );

    if (reason === null) {
      return;
    }

    try {
      await rejectReservation(id, reason.trim());
      alert('예약이 거절되어 [취소됨] 상태로 변경되었습니다.');
      await loadReservations();
    } catch (err) {
      console.error('예약 거절 실패:', err);
      alert(
        err.response?.data?.message ||
        '예약 거절 처리에 실패했습니다.'
      );
    }
  };

  const handleForceEnd = async (id) => {
    const confirmed = window.confirm(
      '사용 중인 예약을 강제 회수하여 완료 처리하시겠습니까?'
    );

    if (!confirmed) {
      return;
    }

    try {
      await endReservation(id);
      alert('사용 중인 예약이 [완료] 상태로 변경되었습니다.');
      await loadReservations();
    } catch (err) {
      console.error('강제 회수 실패:', err);
      alert(
        err.response?.data?.message ||
        '강제 회수 처리에 실패했습니다.'
      );
    }
  };

  const filteredReservations = reservations.filter((item) => {
    if (activeTab === '전체 예약') return true;
    if (activeTab === '승인/예약 대기') {
      return item.status === 'waiting' || item.status === 'reserved';
    }
    if (activeTab === '사용중') return item.status === 'using';
    if (activeTab === '취소된 예약') return item.status === 'cancelled';
    if (activeTab === '완료') return item.status === 'completed';
    return true;
  });

  const getTabCount = (tab) => {
    if (tab === '전체 예약') return reservations.length;
    if (tab === '승인/예약 대기') {
      return reservations.filter(
        (item) => item.status === 'waiting' || item.status === 'reserved'
      ).length;
    }
    if (tab === '사용중') {
      return reservations.filter((item) => item.status === 'using').length;
    }
    if (tab === '취소된 예약') {
      return reservations.filter((item) => item.status === 'cancelled').length;
    }
    if (tab === '완료') {
      return reservations.filter((item) => item.status === 'completed').length;
    }
    return 0;
  };

  return (
    <Container>
      <PageHeader>
        <TitleArea>
          <PageTitle>📅 예약 관리 제어 센터</PageTitle>
          <PageSubtitle>
            학생들의 실습실 예약 승인/거절 및 이용 상태를 실시간으로 관제합니다.
          </PageSubtitle>
        </TitleArea>

        <SystemNoticeCard>
          <NoticeBadge>오토 스케줄 활성화</NoticeBadge>
          <NoticeText>
            종료 시간이 도래하면 시스템이 자동으로
            <strong> [사용종료 ➡️ 완료]</strong> 처리를 수행합니다.
          </NoticeText>
        </SystemNoticeCard>
      </PageHeader>

      <TabButtonGroup>
        {tabs.map((tab) => (
          <TabButton
            key={tab}
            active={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            <TabCount>{getTabCount(tab)}</TabCount>
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
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#64748b',
                  }}
                >
                  예약 목록을 불러오는 중입니다.
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#ef4444',
                  }}
                >
                  {error}
                </td>
              </tr>
            ) : filteredReservations.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#94a3b8',
                  }}
                >
                  해당 상태의 예약 내역이 존재하지 않습니다.
                </td>
              </tr>
            ) : (
              filteredReservations.map((reservation) => {
                const statusLabel = getStatusLabel(reservation.status);

                return (
                  <tr key={reservation._id}>
                    <td>
                      <strong>{reservation.user_id?.name || '-'}</strong>
                    </td>

                    <td style={{ color: '#64748b' }}>
                      {reservation.user_id?.student_id || '-'}
                    </td>

                    <td>
                      {reservation.os_preset
                        ? `[Docker] ${reservation.os_preset}`
                        : reservation.resource_id?.name || '-'}
                    </td>

                    <td>
                      <SeatBadge>
                        {reservation.os_preset
                          ? '컨테이너'
                          : reservation.resource_id?.lab_id || '-'}
                      </SeatBadge>
                    </td>

                    <td>
                      {formatReservationTime(
                        reservation.start_time,
                        reservation.end_time
                      )}
                    </td>

                    <td>
                      <StatusBadge status={statusLabel}>
                        {statusLabel}
                      </StatusBadge>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      {reservation.status === 'waiting' && (
                        <ActionGroup>
                          <ApproveBtn
                            onClick={() => handleApprove(reservation._id)}
                          >
                            승인
                          </ApproveBtn>

                          <RejectBtn
                            onClick={() => handleReject(reservation._id)}
                          >
                            거절
                          </RejectBtn>
                        </ActionGroup>
                      )}

                      {reservation.status === 'reserved' && (
                        <ActionGroup>
                          <SystemText color="#15803d">
                            실습 시작 대기 중
                          </SystemText>
                        </ActionGroup>
                      )}

                      {reservation.status === 'using' && (
                        <ActionGroup>
                          <EarlyCloseBtn
                            onClick={() => handleForceEnd(reservation._id)}
                          >
                            강제 회수
                          </EarlyCloseBtn>
                        </ActionGroup>
                      )}

                      {reservation.status === 'cancelled' && (
                        <SystemText color="#ef4444">
                          거절/취소 처리됨
                        </SystemText>
                      )}

                      {reservation.status === 'completed' && (
                        <SystemText color="#64748b">
                          자동 종료 완료
                        </SystemText>
                      )}
                    </td>
                  </tr>
                );
              })
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