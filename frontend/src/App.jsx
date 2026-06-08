import React, { useState } from 'react';
import styled from 'styled-components';
import Login from './pages/Login';
import EmailAuth from './pages/EmailAuth';
import RegisterInfo from './pages/RegisterInfo';
import Home from './pages/Home';
import StudentLayout from './pages/user/StudentLayout';
import AdminLayout from './pages/admin/AdminLayout';
import { login, logout as logoutApi, getRoleFromAccessToken } from './api/auth';

export default function App() {
  const [step, setStep] = useState('login');
  const [role, setRole] = useState('student');

  // 현재 Login.jsx에서 공통 입력값 prop 이름으로 사용 중이므로 변수명은 유지
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 이메일 인증 화면에서 입력한 이메일을 회원가입 화면으로 전달하기 위한 state
  const [verifiedEmail, setVerifiedEmail] = useState('');

  // 학생 / 관리자 실제 로그인 API 연동
  const handleLogin = async (e) => {
    e.preventDefault();

    const idLabel = role === 'admin' ? '관리자 아이디' : '학번';

    if (!loginEmail.trim() || !loginPassword.trim()) {
      alert(`${idLabel}와 비밀번호를 입력해 주세요.`);
      return;
    }

    try {
      const loginData = await login(loginEmail.trim(), loginPassword);
      const actualRole = getRoleFromAccessToken(loginData.accessToken);

      if (!actualRole) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        alert('로그인 권한 정보를 확인할 수 없습니다.');
        return;
      }

      if (actualRole !== role) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        alert(
          role === 'admin'
            ? '관리자 계정만 관리자 화면에 로그인할 수 있습니다.'
            : '학생 계정만 학생 화면에 로그인할 수 있습니다.'
        );
        return;
      }

      alert(role === 'admin' ? '관리자 로그인 성공!' : '학생 로그인 성공!');
      setStep('home');
    } catch (err) {
      console.error('로그인 실패:', err);
      alert(
        err.response?.data?.message ||
        `${idLabel} 또는 비밀번호가 올바르지 않습니다.`
      );
    }
  };

  // 실제 토큰 사용에 맞춰 로그아웃 시 저장 토큰 제거
  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error('로그아웃 API 요청 실패:', err);

      // 서버 로그아웃 요청이 실패하더라도 브라우저 토큰은 제거
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      alert('로그아웃되었습니다.');
      setStep('login');
      setLoginEmail('');
      setLoginPassword('');
      setVerifiedEmail('');
      setRole('student');
    }
  };

  if (step === 'home' && role === 'student') {
    return <StudentLayout onLogout={handleLogout} />;
  }

  if (step === 'home' && role === 'admin') {
    return <AdminLayout onLogout={handleLogout} />;
  }

  return (
    <Container>
      <Card>
        <LeftBanner>
          <IconWrapper>
            <img
              src="/img.png"
              alt="학과 로고 아이콘"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </IconWrapper>

          <BannerTitle>
            학과 가상 실습실
            <br />
            예약 및 제어 센터
          </BannerTitle>

          <BannerSub>
            스마트 학과 통합 실습 시스템으로
            <br />
            언제 어디서든 실습 환경을 관리하세요.
          </BannerSub>
        </LeftBanner>

        <RightFormSection>
          {step === 'login' && (
            <Login
              role={role}
              setRole={setRole}
              loginEmail={loginEmail}
              setLoginEmail={setLoginEmail}
              loginPassword={loginPassword}
              setLoginPassword={setLoginPassword}
              handleLogin={handleLogin}
              setStep={setStep}
            />
          )}

          {step === 'emailAuth' && (
            <EmailAuth
              setStep={setStep}
              setVerifiedEmail={setVerifiedEmail}
            />
          )}

          {step === 'registerInfo' && (
            <RegisterInfo
              setStep={setStep}
              email={verifiedEmail}
            />
          )}

          {step === 'home' && (
            <HomeContainer>
              <Home />
              <LogoutButton onClick={handleLogout}>
                로그아웃
              </LogoutButton>
            </HomeContainer>
          )}
        </RightFormSection>
      </Card>
    </Container>
  );
}

/* ================= 레이아웃 스타일 정의 ================= */

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Noto Sans KR', sans-serif;
`;

const Card = styled.div`
  display: flex;
  width: 1000px;
  height: 600px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  overflow: hidden;
`;

const LeftBanner = styled.div`
  flex: 1.1;
  background: #1d4ed8;
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;
`;

const IconWrapper = styled.div`
  width: 52px;
  height: 52px;
  background: white;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
  overflow: hidden;
  padding: 5px;
  box-sizing: border-box;
`;

const BannerTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 20px;
`;

const BannerSub = styled.p`
  font-size: 14px;
  opacity: 0.8;
  line-height: 1.6;
`;

const RightFormSection = styled.div`
  flex: 0.9;
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #ffffff;
`;

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const LogoutButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: #dc2626;
  }
`;