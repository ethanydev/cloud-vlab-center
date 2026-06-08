import React from 'react';
import styled from 'styled-components';

// 반드시 export default로 컴포넌트를 내보내야 App.jsx에서 에러가 안 납니다!
export default function Home() {
  return (
    <HomeWrapper>
      <h2>🎉 로그인에 성공하셨습니다!</h2>
      <p>학과 가상 실습실 예약 및 제어 센터 메인 화면입니다.</p>
    </HomeWrapper>
  );
}

const HomeWrapper = styled.div`
  text-align: center;
  padding: 40px;
  
  h2 {
    font-size: 24px;
    color: #1e293b;
    margin-bottom: 12px;
  }
  
  p {
    font-size: 15px;
    color: #64748b;
  }
`;