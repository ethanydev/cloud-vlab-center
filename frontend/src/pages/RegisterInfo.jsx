import React, { useState } from 'react';
import styled from 'styled-components';
import { register } from '../api/auth';

export default function RegisterInfo({ setStep, email }) {
  const [dept, setDept] = useState('');
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');

  // 비밀번호 관련 상태
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedStudentId = studentId.trim();
    const trimmedEmail = email?.trim();

    if (!trimmedName || !trimmedStudentId || !password.trim() || !confirmPassword.trim()) {
      alert('이름, 학번, 비밀번호를 모두 입력해 주세요.');
      return;
    }

    if (!trimmedEmail) {
      alert('인증된 이메일 정보가 없습니다. 이메일 인증부터 다시 진행해 주세요.');
      setStep('emailAuth');
      return;
    }

    if (password.length < 6) {
      alert('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    if (password !== confirmPassword) {
      alert('회원가입 실패\n이유: 비밀번호가 서로 일치하지 않습니다.');
      return;
    }

    try {
      await register(trimmedName, trimmedStudentId, trimmedEmail, password);
      alert('회원가입이 완료되었습니다. 생성한 학번과 비밀번호로 로그인해 주세요.');
      setStep('login');
    } catch (err) {
      console.error('회원가입 실패:', err);
      alert(err.response?.data?.message || '회원가입에 실패했습니다.');
    }
  };

  return (
    <Form onSubmit={handleRegisterSubmit}>
      <FormHeader>
        <h2>회원정보 입력</h2>
        <p>실습실 이용을 위한 기본 정보를 입력해주세요.</p>
      </FormHeader>

      <InputGroup>
        <label>학과</label>
        <input
          type="text"
          placeholder="예: 컴퓨터공학과"
          value={dept}
          onChange={(e) => setDept(e.target.value)}
        />
      </InputGroup>

      <InputGroup>
        <label>학번</label>
        <input
          type="text"
          placeholder="학번 10자리를 입력하세요"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />
      </InputGroup>

      <InputGroup>
        <label>이름</label>
        <input
          type="text"
          placeholder="이름을 입력하세요"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </InputGroup>

      <InputGroup>
        <label>비밀번호 설정</label>
        <input
          type="password"
          placeholder="비밀번호 6자 이상 입력"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </InputGroup>

      <InputGroup>
        <label>비밀번호 확인</label>
        <input
          type="password"
          placeholder="비밀번호 다시 입력"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </InputGroup>

      <PrimaryButton type="submit">회원가입 완료</PrimaryButton>
    </Form>
  );
}

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const FormHeader = styled.div`
  margin-bottom: 20px;

  h2 {
    font-size: 24px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 6px;
  }

  p {
    font-size: 13px;
    color: #64748b;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 14px;

  label {
    font-size: 13px;
    font-weight: 700;
    color: #334155;
    margin-bottom: 6px;
  }

  input {
    height: 44px;
    padding: 0 16px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-size: 14px;
    outline: none;
    background: #ffffff;

    &:focus {
      border-color: #2563eb;
    }
  }
`;

const PrimaryButton = styled.button`
  height: 48px;
  background: #1d4ed8;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background: #1e40af;
  }
`;