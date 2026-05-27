import React, { useState } from 'react';
import styled from 'styled-components';

// 임시 도커 컨테이너 데이터
const INITIAL_CONTAINERS = [
  { id: 'c1', name: 'mariadb-server', image: 'mariadb:10.5', status: 'running', uptime: 'Up 3 days' },
  { id: 'c2', name: 'nodejs-backend', image: 'node:18-alpine', status: 'running', uptime: 'Up 3 days' },
  { id: 'c3', name: 'react-frontend', image: 'nginx:alpine', status: 'running', uptime: 'Up 5 hours' },
  { id: 'c4', name: 'grafana-monitor', image: 'grafana/grafana:latest', status: 'running', uptime: 'Up 3 days' },
  { id: 'c5', name: 'prometheus-core', image: 'prom/prometheus', status: 'exited', uptime: 'Exited (1) 2 hours ago' },
];

export default function DockerControl() {
  const [containers, setContainers] = useState(INITIAL_CONTAINERS);

  // 💡 그라파나 대시보드로 이동하는 핸들러
  const handleOpenGrafana = () => {
    // 실제 그라파나 포트인 3000번 주소나 외부 도메인 URL을 여기에 넣으시면 됩니다.
    // 지금은 테스트용 주소이며, 나중에 AWS EC2 퍼블릭 IP나 도메인 주소로 변경하세요!
    const grafanaUrl = 'http://localhost:3000'; 
    
    // 새 창(새 탭)으로 그라파나 페이지 열기
    window.open(grafanaUrl, '_blank', 'noopener,noreferrer');
  };

  // 컨테이너 제어 토글 핸들러 (임시)
  const toggleContainer = (id) => {
    setContainers(prev => prev.map(c => {
      if (c.id === id) {
        const isRunning = c.status === 'running';
        return {
          ...c,
          status: isRunning ? 'exited' : 'running',
          uptime: isRunning ? 'Exited just now' : 'Up less than a minute'
        };
      }
      return c;
    }));
  };

  return (
    <Container>
      {/* 상단 헤더 및 기능 설명 */}
      <PageHeader>
        <TitleArea>
          <PageTitle> Docker 가상 컨테이너 제어 시스템</PageTitle>
          <PageSubtitle>가상 실습 환경을 제공하는 각 학과 서버 컨테이너의 상태를 실시간 제어합니다.</PageSubtitle>
        </TitleArea>

        {/* 💡 와이어프레임에 명시된 [그라파나 설정 -> 버튼 이동] 컴포넌트 구역 */}
        <GrafanaLinkCard>
          <GrafanaHeader>
            <GrafanaLogo></GrafanaLogo>
            <div>
              <GrafanaTitle>Grafana 모니터링</GrafanaTitle>
              <GrafanaDesc>상세한 서버 자원 사용량 그래픽 관측</GrafanaDesc>
            </div>
          </GrafanaHeader>
          {/* 클릭 시 handleOpenGrafana 함수 실행 */}
          <GrafanaButton onClick={handleOpenGrafana}>
            그라파나 대시보드 열기 ↗
          </GrafanaButton>
        </GrafanaLinkCard>
      </PageHeader>

      {/* 컨테이너 실시간 현황 섹션 */}
      <SectionTitle> 컨테이너 런타임 인스턴스 목록</SectionTitle>
      <TableContainer>
        <MainTable>
          <thead>
            <tr>
              <th>컨테이너 명칭</th>
              <th>베이스 이미지</th>
              <th>작동 상태</th>
              <th>Uptime (구동 시간)</th>
              <th style={{ textAlign: 'center' }}>전원 명령</th>
            </tr>
          </thead>
          <tbody>
            {containers.map(container => (
              <tr key={container.id}>
                <td><strong>{container.name}</strong></td>
                <td><ImageCode>`{container.image}`</ImageCode></td>
                <td>
                  <StatusBadge isRunning={container.status === 'running'}>
                    {container.status === 'running' ? '● Running' : '○ Exited'}
                  </StatusBadge>
                </td>
                <td style={{ color: '#64748b', fontSize: '13px' }}>{container.uptime}</td>
                <td style={{ textAlign: 'center' }}>
                  <ControlActionBtn 
                    isRunning={container.status === 'running'} 
                    onClick={() => toggleContainer(container.id)}
                  >
                    {container.status === 'running' ? ' STOP' : ' START'}
                  </ControlActionBtn>
                </td>
              </tr>
            ))}
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

const PageHeader = styled.div` display: flex; justify-content: space-between; align-items: center; background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; `;
const TitleArea = styled.div` display: flex; flex-direction: column; gap: 4px; `;
const PageTitle = styled.h2` font-size: 22px; font-weight: 700; color: #1e293b; margin: 0; `;
const PageSubtitle = styled.p` font-size: 14px; color: #64748b; margin: 0; `;

/* 💡 와이어프레임 전용 그라파나 링크 카드 스타일링 */
const GrafanaLinkCard = styled.div` display: flex; align-items: center; gap: 24px; background: #1e2028; border: 1px solid #2f3542; padding: 16px 20px; border-radius: 10px; color: white; `;
const GrafanaHeader = styled.div` display: flex; align-items: center; gap: 12px; `;
const GrafanaLogo = styled.div` font-size: 24px; background: rgba(255, 255, 255, 0.08); padding: 6px; border-radius: 6px; `;
const GrafanaTitle = styled.h4` font-size: 15px; font-weight: 700; margin: 0; color: #f47525; /* 그라파나 브랜드 컬러 톤 */ `;
const GrafanaDesc = styled.p` font-size: 12px; color: #94a3b8; margin: 2px 0 0 0; `;
const GrafanaButton = styled.button` background: #f47525; color: white; border: none; padding: 10px 16px; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer; transition: background 0.15s ease-in-out; &:hover { background: #e06313; } `;

const SectionTitle = styled.h3` font-size: 16px; font-weight: 700; color: #334155; margin: 8px 0 0 0; `;

const TableContainer = styled.div` background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); overflow: hidden; border: 1px solid #e2e8f0; `;
const MainTable = styled.table` width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; th { background: #f8fafc; padding: 16px; color: #475569; font-weight: 600; border-bottom: 1px solid #e2e8f0; } td { padding: 16px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; } tr:last-child td { border-bottom: none; } `;

const ImageCode = styled.code` background: #f1f5f9; color: #0f172a; padding: 2px 6px; border-radius: 4px; font-family: 'Fira Code', Consolas, monospace; font-size: 13px; `;

const StatusBadge = styled.span` display: inline-block; padding: 4px 8px; border-radius: 20px; font-size: 12px; font-weight: 700; background-color: ${props => props.isRunning ? '#e0f2fe' : '#f1f5f9'}; color: ${props => props.isRunning ? '#0369a1' : '#64748b'}; `;

const ControlActionBtn = styled.button` border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.1s ease-in-out; background-color: ${props => props.isRunning ? '#fee2e2' : '#dcfce7'}; color: ${props => props.isRunning ? '#ef4444' : '#15803d'}; &:hover { opacity: 0.85; } `;