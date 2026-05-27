import React, { useState } from 'react';
import styled from 'styled-components';

export default function Configuration() {
  // 1. 현재 활성화된 탭 상태 ('기본 설정'이 기본값)
  const [activeTab, setActiveTab] = useState('기본 설정');

  // 2. 기본 설정 폼 데이터 상태 관리 (와이어프레임 스위치 상태 완벽 동기화)
  const [basicSettings, setBasicSettings] = useState({
    sessionTimeout: '7일',
    maxReservation: 4,
    preventDuplicate: true, // 중복 예약 방지 스위치 상태
    auditLogs: true,
    adminAlerts: true,
    reservationPeriod: false // 예약 기간 스위치 상태
  });

  const tabs = ['기본 설정', '알림 설정', '백업 설정'];

  // 토글 스위치 변경 핸들러
  const handleToggle = (field) => {
    setBasicSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert(`[${activeTab}] 변경 사항이 시스템에 성공적으로 반영되었습니다.`);
  };

  return (
    <div style={{ padding: '40px 30px', fontFamily: 'sans-serif', backgroundColor: '#fff', minHeight: '100vh' }}>
      
      {/* 헤더 영역 */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a1f36', marginBottom: '6px' }}> 시스템 설정</h2>
        <p style={{ color: '#8792a2', fontSize: '14px' }}>가상 실습실 통합 운영 규칙 및 보안 정책을 관리합니다.</p>
      </div>

      {/* 와이어프레임 기반 상단 탭 버튼바 */}
      <TabMenuContainer>
        {tabs.map(tab => (
          <TabButton 
            key={tab} 
            active={activeTab === tab} 
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </TabButton>
        ))}
      </TabMenuContainer>

      {/* 탭 내용 구역 */}
      <div style={{ maxWidth: '600px', marginTop: '30px' }}>
        
        {/* --- [A] 기본 설정 탭 --- */}
        {activeTab === '기본 설정' && (
          <form onSubmit={handleSave}>
            <FormRow>
              <LabelArea>
                <label>세션 타임아웃</label>
              </LabelArea>
              <InputArea>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <StyledInput 
                    type="text" 
                    value={basicSettings.sessionTimeout} 
                    onChange={(e) => setBasicSettings({...basicSettings, sessionTimeout: e.target.value})}
                  />
                  <SubInfo>(7일 이후 자동 로그아웃)</SubInfo>
                </div>
              </InputArea>
            </FormRow>

            <FormRow>
              <LabelArea>
                <label>예약 최대 기간</label>
              </LabelArea>
              <InputArea>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <StyledInput 
                    type="number" 
                    value={basicSettings.maxReservation} 
                    onChange={(e) => setBasicSettings({...basicSettings, maxReservation: e.target.value})}
                  />
                  <span>시간</span>
                </div>
              </InputArea>
            </FormRow>

            {/* 중복 예약 방지: 와이어프레임에 맞춰 토글 스위치 타입으로 변경 */}
            <FormRow>
              <LabelArea>
                <label>중복 예약 방지</label>
              </LabelArea>
              <InputArea>
                <ToggleWrapper onClick={() => handleToggle('preventDuplicate')} active={basicSettings.preventDuplicate}>
                  <ToggleCircle active={basicSettings.preventDuplicate} />
                  <ToggleText active={basicSettings.preventDuplicate}>{basicSettings.preventDuplicate ? '활성화' : '비활성화'}</ToggleText>
                </ToggleWrapper>
              </InputArea>
            </FormRow>

            <FormRow>
              <LabelArea>
                <label>감사 로그</label>
              </LabelArea>
              <InputArea>
                <ToggleWrapper onClick={() => handleToggle('auditLogs')} active={basicSettings.auditLogs}>
                  <ToggleCircle active={basicSettings.auditLogs} />
                  <ToggleText active={basicSettings.auditLogs}>{basicSettings.auditLogs ? '활성화' : '비활성화'}</ToggleText>
                </ToggleWrapper>
              </InputArea>
            </FormRow>

            <FormRow>
              <LabelArea>
                <label>관리자 알림</label>
              </LabelArea>
              <InputArea>
                <ToggleWrapper onClick={() => handleToggle('adminAlerts')} active={basicSettings.adminAlerts}>
                  <ToggleCircle active={basicSettings.adminAlerts} />
                  <ToggleText active={basicSettings.adminAlerts}>{basicSettings.adminAlerts ? '활성화' : '비활성화'}</ToggleText>
                </ToggleWrapper>
              </InputArea>
            </FormRow>

            {/* 기타 설정 ➡️ 와이어프레임 텍스트 '예약 기간'으로 전면 수정 및 가이드 추가 */}
            <FormRow>
              <LabelArea>
                <label>예약 기간</label>
              </LabelArea>
              <InputArea>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ToggleWrapper onClick={() => handleToggle('reservationPeriod')} active={basicSettings.reservationPeriod}>
                    <ToggleCircle active={basicSettings.reservationPeriod} />
                    <ToggleText active={basicSettings.reservationPeriod}>{basicSettings.reservationPeriod ? '활성화' : '비활성화'}</ToggleText>
                  </ToggleWrapper>
                  {!basicSettings.reservationPeriod && <SubInfo>(예약 가능 일자 제한)</SubInfo>}
                </div>
              </InputArea>
            </FormRow>

            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <SaveButton type="submit">저장</SaveButton>
            </div>
          </form>
        )}

        {/* --- [B] 알림 설정 탭 --- */}
        {activeTab === '알림 설정' && (
          <PlaceholderView>📢 알림 수신 채널 및 메시지 템플릿 설정 화면입니다.</PlaceholderView>
        )}

        {/* --- [C] 백업 설정 탭 --- */}
        {activeTab === '백업 설정' && (
          <PlaceholderView>💾 데이터 자동 백업 및 복구 정책 설정 화면입니다.</PlaceholderView>
        )}

      </div>
    </div>
  );
}

// --- Styled Components (디자인 정의) ---

const TabMenuContainer = styled.div`
  display: flex;
  background-color: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
  width: fit-content;
`;

const TabButton = styled.button`
  border: none;
  padding: 8px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${props => props.active ? '#ffffff' : 'transparent'};
  color: ${props => props.active ? '#1e40af' : '#64748b'};
  box-shadow: ${props => props.active ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'};
`;

const FormRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
`;

const LabelArea = styled.div`
  flex: 0.4;
  label {
    font-size: 14px;
    font-weight: 600;
    color: #334155;
  }
`;

const InputArea = styled.div`
  flex: 0.6;
`;

const StyledInput = styled.input`
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
  outline: none;
  &:focus { border-color: #2563eb; }
`;

const SubInfo = styled.span`
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
`;

const ToggleWrapper = styled.div`
  width: 140px;
  height: 34px;
  background-color: ${props => props.active ? '#eff6ff' : '#f1f5f9'};
  border: 1px solid ${props => props.active ? '#bfdbfe' : '#e2e8f0'};
  border-radius: 20px;
  display: flex;
  align-items: center;
  padding: 0 4px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
`;

const ToggleCircle = styled.div`
  width: 26px;
  height: 26px;
  background-color: ${props => props.active ? '#2563eb' : '#94a3b8'};
  border-radius: 50%;
  transition: all 0.3s;
  transform: ${props => props.active ? 'translateX(102px)' : 'translateX(0)'};
`;

const ToggleText = styled.span`
  position: absolute;
  left: ${props => props.active ? '20px' : '50px'};
  font-size: 12px;
  font-weight: 700;
  color: ${props => props.active ? '#1e40af' : '#64748b'};
  transition: all 0.3s;
`;

const SaveButton = styled.button`
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 12px 60px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
  &:hover { background-color: #1d4ed8; }
`;

const PlaceholderView = styled.div`
  padding: 60px;
  background-color: #f8fafc;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  color: #94a3b8;
  text-align: center;
  font-size: 14px;
`;