import React, { useEffect, useState } from 'react';
import { getUsers } from '../../api/users';
import { getReservations } from '../../api/reservations';
import { getContainers } from '../../api/containers';

function Dashboard() {
  const [stats, setStats] = useState({
    registeredStudents: 0,
    activeContainers: null,
    pendingReservations: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // 사용자 수와 대기 예약 수는 Docker와 관계없이 반드시 조회
        const [usersData, reservationsData] = await Promise.all([
          getUsers(),
          getReservations(),
        ]);

        const studentUsers = Array.isArray(usersData)
          ? usersData.filter((user) => user.role === 'student')
          : [];

        const reservations = Array.isArray(reservationsData)
          ? reservationsData
          : [];

        const pendingReservations = reservations.filter(
          (reservation) => reservation.status === 'waiting'
        ).length;

        // Docker 조회는 실패해도 대시보드 전체를 막지 않도록 별도 처리
        let activeContainers = null;

        try {
          const containersData = await getContainers();

          activeContainers =
            containersData?.data?.total ??
            containersData?.data?.containers?.length ??
            0;
        } catch (containerError) {
          console.error('컨테이너 현황 조회 실패:', containerError);
        }

        setStats({
          registeredStudents: studentUsers.length,
          activeContainers,
          pendingReservations,
        });
      } catch (err) {
        console.error('관리자 대시보드 기본 현황 조회 실패:', err);
        setError(
          err.response?.data?.message ||
            '대시보드 기본 정보를 불러오지 못했습니다.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="content-section">
      <h2>대시보드</h2>
      <p className="section-desc">
        실습실 자원 및 사용자 이용 현황 요약입니다.
      </p>

      {error && (
        <p style={{ color: '#dc2626', marginBottom: '20px' }}>
          {error}
        </p>
      )}

      <div className="dashboard-grid">
        <div className="status-card">
          <h3>등록 학생</h3>
          <p className="card-value">
            {loading ? '-' : `${stats.registeredStudents} 명`}
          </p>
        </div>

        <div className="status-card">
          <h3>활성 컨테이너</h3>
          <p className="card-value">
            {loading
              ? '-'
              : stats.activeContainers === null
                ? '-'
                : `${stats.activeContainers} 개`}
          </p>
        </div>

        <div className="status-card">
          <h3>대기 중인 예약</h3>
          <p className="card-value red-text">
            {loading ? '-' : `${stats.pendingReservations} 건`}
          </p>
        </div>
      </div>

      <div className="chart-section" style={{ marginTop: '30px' }}>
        <h3>실시간 자원 사용률</h3>

        <p
          style={{
            marginTop: '8px',
            marginBottom: '20px',
            color: '#64748b',
            fontSize: '13px',
          }}
        >
          상세 사용률은 모니터링 시스템 연동 후 제공됩니다.
        </p>

        <div className="progress-group" style={{ marginTop: '15px' }}>
          <div className="progress-label">
            <span>CPU Core</span>
            <span>-</span>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: '0%',
                background: '#2563eb',
              }}
            ></div>
          </div>
        </div>

        <div className="progress-group" style={{ marginTop: '15px' }}>
          <div className="progress-label">
            <span>GPU</span>
            <span>-</span>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: '0%',
                background: '#10b981',
              }}
            ></div>
          </div>
        </div>

        <div className="progress-group" style={{ marginTop: '15px' }}>
          <div className="progress-label">
            <span>Memory</span>
            <span>-</span>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: '0%',
                background: '#f59e0b',
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;