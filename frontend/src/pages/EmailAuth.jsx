import React, { useState } from 'react';
import styled from 'styled-components';
import { sendEmailCode, verifyEmailCode } from '../api/auth';

export default function EmailAuth({ setStep, setVerifiedEmail }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSendCode = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      alert('올바른 이메일 주소를 입력해 주세요.');
      return;
    }

    try {
      setIsSending(true);

      const result = await sendEmailCode(trimmedEmail);

      setIsSent(true);
      alert(result.message || '인증 코드가 발송되었습니다.');
    } catch (err) {
      console.error('이메일 인증 코드 발송 실패:', err);
      alert(
        err.response?.data?.message ||
        '인증 코드 발송 중 오류가 발생했습니다.'
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedCode = code.trim();

    if (!isSent) {
      alert('먼저 인증 코드를 발송해 주세요.');
      return;
    }

    if (!trimmedCode) {
      alert('인증번호를 입력해 주세요.');
      return;
    }

    try {
      setIsVerifying(true);

      const result = await verifyEmailCode(trimmedEmail, trimmedCode);

      setVerifiedEmail(trimmedEmail);
      alert(result.message || '이메일 인증이 완료되었습니다.');
      setStep('registerInfo');
    } catch (err) {
      console.error('이메일 인증 코드 검증 실패:', err);
      alert(
        err.response?.data?.message ||
        '인증번호 확인 중 오류가 발생했습니다.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Form onSubmit={handleVerifyCode}>
      <FormHeader>
        <h2>이메일 인증</h2>
        <p>사용 가능한 이메일 주소로 인증 코드를 받아 인증해주세요.</p>
      </FormHeader>

      <RowInputGroup>
        <div className="input-box">
          <input
            type="email"
            placeholder="이메일 입력 (ex: abc@gmail.com)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSending || isVerifying}
            required
          />
        </div>

        <SendButton
          type="button"
          onClick={handleSendCode}
          disabled={isSending || isVerifying}
        >
          {isSending ? '발송중' : isSent ? '재발송' : '발송'}
        </SendButton>
      </RowInputGroup>

      <InputGroup>
        <input
          type="text"
          placeholder="인증번호 6자리 입력"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={!isSent || isVerifying}
          required
        />
      </InputGroup>

      <PrimaryButton type="submit" disabled={!isSent || isVerifying}>
        {isVerifying ? '확인중' : '인증번호 확인'}
      </PrimaryButton>

      <BackButton type="button" onClick={() => setStep('login')}>
        이전으로 돌아가기
      </BackButton>
    </Form>
  );
}

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const FormHeader = styled.div`
  margin-bottom: 30px;

  h2 {
    font-size: 26px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
    color: #64748b;
  }
`;

const RowInputGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 16px;

  .input-box {
    flex: 1;
  }

  input {
    width: 100%;
    height: 48px;
    padding: 0 16px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-size: 14px;
    outline: none;
    box-sizing: border-box;
  }

  input:disabled {
    background: #f8fafc;
    color: #64748b;
  }
`;

const SendButton = styled.button`
  width: 80px;
  height: 48px;
  background: #334155;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #1e293b;
  }

  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 24px;

  input {
    width: 100%;
    height: 48px;
    padding: 0 16px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-size: 14px;
    outline: none;
    box-sizing: border-box;
  }

  input:disabled {
    background: #f8fafc;
    color: #64748b;
  }
`;

const PrimaryButton = styled.button`
  height: 48px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #1d4ed8;
  }

  &:disabled {
    background: #93c5fd;
    cursor: not-allowed;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  margin-top: 16px;
  color: #64748b;
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
`;