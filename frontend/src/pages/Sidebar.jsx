import React from 'react';
import styled from 'styled-components';
// 💡 이미지에 나온 순서대로 가장 매칭이 잘 되는 Lucide 아이콘들을 가져옵니다.
import { 
  LayoutGrid, 
  CalendarDays, 
  FileText, 
  ClipboardList, 
  MonitorPlay, 
  Bell, 
  Info, 
  UserRound 
} from 'lucide-react';

export default function Sidebar({ currentMenu, onMenuChange }) {
  // 💡 사진 속 메뉴 목록과 Lucide 아이콘 매핑
  const menuItems = [
    { id: 'dashboard', name: '대시보드', icon: <LayoutGrid size={18} /> },
    { id: 'resource', name: '자원 관리', icon: <CalendarDays size={18} /> },
    { id: 'reservation', name: '예약 관리', icon: <FileText size={18} /> },
    { id: 'issue', name: '이슈 관리', icon: <ClipboardList size={18} /> },
    { id: 'user', name: '사용자 관리', icon: <MonitorPlay size={18} /> },
    { id: 'docker', name: 'Docker 제어', icon: <Bell size={18} /> },
    { id: 'system', name: '시스템 설정', icon: <Info size={18} /> },
    { id: 'notice', name: '공지사항 관리', icon: <UserRound size={18} /> },
  ];

  return (
    <SidebarContainer>
      {/* 상단 로고 및 타이틀 영역 */}
      <LogoArea>
        <CloudIconWrapper>
          {/* 구름 모양의 메인 아이콘 */}
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42-1.03-1-2.52-2.5-3.5C11.66 6.25 9.5 7 8.5 8c-2.5 0-5 2.24-5 5A3.5 3.5 0 0 0 7 16.5h.5" />
            <path d="M7.5 16.5h10" style={{ opacity: 0.2 }} />
          </svg>
        </CloudIconWrapper>
        <TitleGroup>
          <MainTitle>가상 실습실</MainTitle>
          <SubTitle>통합 관리자 시스템</SubTitle>
        </TitleGroup>
      </LogoArea>

      <Divider />

      {/* 내비게이션 메뉴 리스트 */}
      <NavList>
        {menuItems.map((item) => (
          <NavItem key={item.id}>
            <MenuButton
              active={currentMenu === item.id}
              onClick={() => onMenuChange && onMenuChange(item.id)}
            >
              {item.icon}
              <MenuName>{item.name}</MenuName>
            </MenuButton>
          </NavItem>
        ))}
      </NavList>
    </SidebarContainer>
  );
}

/* 스타일 정의 (사진의 딥 네이비 톤과 블루 하이라이트 반영) */
const SidebarContainer = styled.div`
  width: 260px;
  height: 100vh;
  background-color: #0b1936; /* 어두운 네이비 배경색 */
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const LogoArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 4px;
  margin-bottom: 24px;
`;

const CloudIconWrapper = styled.div`
  width: 40px;
  height: 40px;
  background-color: #2563eb; /* 푸른색 사각형 아이콘 배경 */
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const MainTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.5px;
`;

const SubTitle = styled.p`
  font-size: 13px;
  color: #64748b;
  margin: 0;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #1e293b;
  margin: 0 0 24px 0;
  width: 100%;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NavItem = styled.li`
  width: 100%;
`;

const MenuButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  border-radius: 12px; /* 라운드 형태의 메뉴 바 적용 */
  background-color: ${props => props.active ? '#2563eb' : 'transparent'};
  color: ${props => props.active ? '#ffffff' : '#94a3b8'};
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  svg {
    color: ${props => props.active ? '#ffffff' : '#94a3b8'};
    transition: color 0.2s ease-in-out;
  }

  &:hover {
    background-color: ${props => props.active ? '#2563eb' : 'rgba(255, 255, 255, 0.05)'};
    color: #ffffff;
    svg {
      color: #ffffff;
    }
  }
`;

const MenuName = styled.span`
  padding-top: 1px; /* 텍스트 정렬 미세 조정 */
`;