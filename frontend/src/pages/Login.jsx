import React from 'react';
import styled from 'styled-components';

export default function Login({ 
  role, setRole, 
  loginEmail, setLoginEmail, 
  loginPassword, setLoginPassword, 
  handleLogin, setStep 
}) {
  return (
    <Form onSubmit={handleLogin}>
      <FormHeader>
        <h2>로그인</h2>
        <p>계정에 로그인하여 서비스를 이용하세요.</p>
      </FormHeader>

      <TabContainer>
        <TabButton 
          type="button" 
          $active={role === 'student'} 
          onClick={() => { setRole('student'); setLoginEmail(''); setLoginPassword(''); }}
        >
          학생
        </TabButton>
        <TabButton 
          type="button" 
          $active={role === 'admin'} 
          onClick={() => { setRole('admin'); setLoginEmail(''); setLoginPassword(''); }}
        >
          관리자
        </TabButton>
      </TabContainer>

      <InputGroup>
        <label>{role === 'admin' ? '관리자 아이디' : '학번'}</label>
        <input 
          type="text" 
          
          placeholder={role === 'admin' ? '관리자 아이디 입력' : '학번을 입력하세요'} 
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          required
        />
      </InputGroup>

      <InputGroup>
        <label>비밀번호</label>
        <input 
          type="password" 
          /* '비밀번호를 입력'으로 문구 수정 완료 */
          placeholder="비밀번호를 입력" 
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          required
        />
      </InputGroup>

      <PrimaryButton type="submit">로그인</PrimaryButton>
      
      {/* 학생(사용자)일 때만 회원가입 링크가 보이도록 논리 구조 분리 */}
      {role === 'student' ? (
        <FooterLinkRow>
          계정이 없으신가요? <span onClick={() => setStep('emailAuth')}>회원가입</span>
        </FooterLinkRow>
      ) : (
        <AdminNoticeRow>
          ※ 관리자 계정은 신규 등록이 불가능합니다.
        </AdminNoticeRow>
      )}
    </Form>
  );
}

/* ================= 스타일 컴포넌트 정의 ================= */
const Form = styled.form` width: 100%; display: flex; flex-direction: column; `;
const FormHeader = styled.div` margin-bottom: 30px; h2 { font-size: 26px; font-weight: 700; color: #1e293b; margin-bottom: 8px; } p { font-size: 14px; color: #64748b; } `;
const TabContainer = styled.div` display: flex; background: #f1f5f9; padding: 4px; border-radius: 10px; margin-bottom: 24px; `;
const TabButton = styled.button`
  flex: 1; border: none; padding: 10px 0; font-size: 14px; font-weight: 600; border-radius: 8px; cursor: pointer; transition: all 0.2s ease;
  background: ${props => props.$active ? '#ffffff' : 'transparent'};
  color: ${props => props.$active ? '#1d4ed8' : '#64748b'};
  box-shadow: ${props => props.$active ? '0 2px 6px rgba(0,0,0,0.05)' : 'none'};
`;
const InputGroup = styled.div`
  display: flex; flex-direction: column; margin-bottom: 20px;
  label { font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 8px; }
  input {
    height: 48px; padding: 0 16px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; outline: none; transition: border 0.2s; background: #ffffff;
    &:focus { border-color: #2563eb; }
  }
`;
const PrimaryButton = styled.button` height: 48px; background: #1d4ed8; color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 10px; &:hover { background: #1e40af; } `;
const FooterLinkRow = styled.div` margin-top: 24px; font-size: 13px; color: #64748b; text-align: center; span { color: #1d4ed8; font-weight: 600; cursor: pointer; margin-left: 6px; text-decoration: underline; } `;
const AdminNoticeRow = styled.div` margin-top: 24px; font-size: 12px; color: #94a3b8; text-align: center; font-style: italic; `;