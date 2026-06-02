import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { getContainers, getPresets, runContainer, killContainer } from '../../api/containers';

export default function DockerControl() {
  const [containers, setContainers] = useState([]);
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // 처리 중인 dockerContainerId 또는 presetName

  // 실행 중인 컨테이너 목록만 갱신 (액션 후 호출)
  const fetchContainers = useCallback(async () => {
    try {
      const res = await getContainers();
      setContainers(res.data.containers || []);
    } catch (err) {
      console.error('컨테이너 목록 조회 실패:', err);
    }
  }, []);

  // 초기 마운트: 컨테이너 + 프리셋 동시 로드
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [containersRes, presetsRes] = await Promise.all([
          getContainers(),
          getPresets(),
        ]);
        setContainers(containersRes.data.containers || []);
        setPresets(presetsRes.data.presets || []);
      } catch (err) {
        console.error('초기 데이터 로딩 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // 컨테이너 중지 핸들러
  const handleStop = async (dockerContainerId) => {
    setActionLoading(dockerContainerId);
    try {
      await killContainer(dockerContainerId);
      await fetchContainers();
    } catch (err) {
      console.error('컨테이너 중지 실패:', err);
      alert('컨테이너 중지에 실패했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  // 프리셋으로 컨테이너 실행 핸들러
  const handleRun = async (presetName) => {
    setActionLoading(presetName);
    try {
      await runContainer(presetName);
      await fetchContainers();
    } catch (err) {
      console.error('컨테이너 실행 실패:', err);
      alert('컨테이너 실행에 실패했습니다. 이미지 pull에 시간이 걸릴 수 있습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  // 그라파나 대시보드로 이동하는 핸들러
  const handleOpenGrafana = () => {
    const grafanaUrl = 'http://localhost:3000';
    window.open(grafanaUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Container>
      {/* 상단 헤더 및 기능 설명 */}
      <PageHeader>
        <TitleArea>
          <PageTitle> Docker 가상 컨테이너 제어 시스템</PageTitle>
          <PageSubtitle>가상 실습 환경을 제공하는 각 학과 서버 컨테이너의 상태를 실시간 제어합니다.</PageSubtitle>
        </TitleArea>

        <GrafanaLinkCard>
          <GrafanaHeader>
            <GrafanaLogo></GrafanaLogo>
            <div>
              <GrafanaTitle>Grafana 모니터링</GrafanaTitle>
              <GrafanaDesc>상세한 서버 자원 사용량 그래픽 관측</GrafanaDesc>
            </div>
          </GrafanaHeader>
          <GrafanaButton onClick={handleOpenGrafana}>
            그라파나 대시보드 열기 ↗
          </GrafanaButton>
        </GrafanaLinkCard>
      </PageHeader>

      {/* 실행 중인 컨테이너 목록 */}
      <SectionTitle> 컨테이너 런타임 인스턴스 목록</SectionTitle>
      <TableContainer>
        {loading ? (
          <LoadingMessage>컨테이너 정보를 불러오는 중...</LoadingMessage>
        ) : (
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
              {containers.length === 0 ? (
                <tr>
                  <EmptyCell colSpan={5}>실행 중인 컨테이너가 없습니다.</EmptyCell>
                </tr>
              ) : (
                containers.map(container => (
                  <tr key={container.dockerContainerId}>
                    <td><strong>{container.containerName}</strong></td>
                    <td><ImageCode>`{container.imageName}`</ImageCode></td>
                    <td>
                      <StatusBadge isRunning={true}>● Running</StatusBadge>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '13px' }}>{container.status}</td>
                    <td style={{ textAlign: 'center' }}>
                      <ControlActionBtn
                        isRunning={true}
                        disabled={actionLoading === container.dockerContainerId}
                        onClick={() => handleStop(container.dockerContainerId)}
                      >
                        {actionLoading === container.dockerContainerId ? '처리중...' : ' STOP'}
                      </ControlActionBtn>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </MainTable>
        )}
      </TableContainer>

      {/* 프리셋으로 컨테이너 실행 */}
      <SectionTitle> 프리셋으로 컨테이너 실행</SectionTitle>
      <PresetGrid>
        {presets.map(preset => (
          <PresetCard key={preset.name}>
            <PresetName>{preset.name}</PresetName>
            <PresetDesc>{preset.description}</PresetDesc>
            <PresetImage>`{preset.imageName}`</PresetImage>
            <RunButton
              disabled={actionLoading === preset.name}
              onClick={() => handleRun(preset.name)}
            >
              {actionLoading === preset.name ? '실행 중...' : '▶ 컨테이너 실행'}
            </RunButton>
          </PresetCard>
        ))}
      </PresetGrid>
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

const GrafanaLinkCard = styled.div` display: flex; align-items: center; gap: 24px; background: #1e2028; border: 1px solid #2f3542; padding: 16px 20px; border-radius: 10px; color: white; `;
const GrafanaHeader = styled.div` display: flex; align-items: center; gap: 12px; `;
const GrafanaLogo = styled.div` font-size: 24px; background: rgba(255, 255, 255, 0.08); padding: 6px; border-radius: 6px; `;
const GrafanaTitle = styled.h4` font-size: 15px; font-weight: 700; margin: 0; color: #f47525; `;
const GrafanaDesc = styled.p` font-size: 12px; color: #94a3b8; margin: 2px 0 0 0; `;
const GrafanaButton = styled.button` background: #f47525; color: white; border: none; padding: 10px 16px; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer; transition: background 0.15s ease-in-out; &:hover { background: #e06313; } `;

const SectionTitle = styled.h3` font-size: 16px; font-weight: 700; color: #334155; margin: 8px 0 0 0; `;

const TableContainer = styled.div` background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); overflow: hidden; border: 1px solid #e2e8f0; `;
const LoadingMessage = styled.div` padding: 48px; text-align: center; color: #94a3b8; font-size: 14px; `;
const MainTable = styled.table` width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; th { background: #f8fafc; padding: 16px; color: #475569; font-weight: 600; border-bottom: 1px solid #e2e8f0; } td { padding: 16px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; } tr:last-child td { border-bottom: none; } `;
const EmptyCell = styled.td` padding: 48px !important; text-align: center !important; color: #94a3b8; font-size: 14px; `;

const ImageCode = styled.code` background: #f1f5f9; color: #0f172a; padding: 2px 6px; border-radius: 4px; font-family: 'Fira Code', Consolas, monospace; font-size: 13px; `;

const StatusBadge = styled.span` display: inline-block; padding: 4px 8px; border-radius: 20px; font-size: 12px; font-weight: 700; background-color: ${props => props.isRunning ? '#e0f2fe' : '#f1f5f9'}; color: ${props => props.isRunning ? '#0369a1' : '#64748b'}; `;

const ControlActionBtn = styled.button` border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.1s ease-in-out; background-color: ${props => props.isRunning ? '#fee2e2' : '#dcfce7'}; color: ${props => props.isRunning ? '#ef4444' : '#15803d'}; &:hover { opacity: 0.85; } &:disabled { opacity: 0.5; cursor: not-allowed; } `;

/* 프리셋 섹션 스타일 */
const PresetGrid = styled.div` display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; `;

const PresetCard = styled.div` background: white; border-radius: 10px; padding: 18px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.04); display: flex; flex-direction: column; gap: 6px; `;

const PresetName = styled.h4` font-size: 14px; font-weight: 700; color: #1e293b; margin: 0; `;

const PresetDesc = styled.p` font-size: 12px; color: #64748b; margin: 0; flex: 1; `;

const PresetImage = styled.code` font-size: 11px; color: #475569; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'Fira Code', Consolas, monospace; `;

const RunButton = styled.button` margin-top: 8px; background: #dcfce7; color: #15803d; border: none; padding: 8px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.1s; &:hover { opacity: 0.85; } &:disabled { opacity: 0.5; cursor: not-allowed; } `;
