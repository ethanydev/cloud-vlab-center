import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [stats, setStats] = useState({ currentUser: 24, activeContainers: 12, pendingReservations: 5 });
  const [resources, setResources] = useState({ cpu: 75, gpu: 40, memory: 90 });

  useEffect(() => {
    // API 연동용 훅 자리
  }, []);

  return (
    <div className="content-section">
      <h2>대시보드</h2>
      <p className="section-desc">실습실 자원 및 사용자 이용 현황 요약입니다.</p>
      
      <div className="dashboard-grid">
        <div className="status-card">
          <h3>현재 사용자</h3>
          <p className="card-value">{stats.currentUser} 명</p>
        </div>
        <div className="status-card">
          <h3>활성 컨테이너</h3>
          <p className="card-value">{stats.activeContainers} 개</p>
        </div>
        <div className="status-card">
          <h3>대기 중인 예약</h3>
          <p className="card-value red-text">{stats.pendingReservations} 건</p>
        </div>
      </div>

      <div className="chart-section" style={{ marginTop: '30px' }}>
        <h3>실시간 자원 사용률</h3>
        <div className="progress-group" style={{ marginTop: '15px' }}>
          <div className="progress-label"><span>CPU Core (12 Unit)</span><span>{resources.cpu}%</span></div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${resources.cpu}%`, background: '#2563eb' }}></div></div>
        </div>
        <div className="progress-group" style={{ marginTop: '15px' }}>
          <div className="progress-label"><span>GPU (5 Unit)</span><span>{resources.gpu}%</span></div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${resources.gpu}%`, background: '#10b981' }}></div></div>
        </div>
        <div className="progress-group" style={{ marginTop: '15px' }}>
          <div className="progress-label"><span>Memory (128GB)</span><span>{resources.memory}%</span></div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${resources.memory}%`, background: '#f59e0b' }}></div></div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;