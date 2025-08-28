// src/components/LoginForm.tsx
// 로그인 기능에 필요한 핵심적인 UI 표출, 사용자의 입력 이벤트를 상위로 전달.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { SocialProvider } from '../custom_api/auth';
import { TextInput } from '../atoms/TextInput/TextInput';
import { TextButton } from '../atoms/TextButton/TextButton';

type social = SocialProvider | null;

type LoginFormProps = {    // Props 타입 지정
    email: string;
    password: string;
    error: string | null;
    onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    onNaverLogin: (provider: social) => void;
    onKakaoLogin: (provider: social) => void;
    onAdminLogin: () => void;
};

function LoginForm({
    email,
    password,
    error,
    onEmailChange,
    onPasswordChange,
    onSubmit,
    onNaverLogin,
    onKakaoLogin,
    onAdminLogin,
}: LoginFormProps) {
    const navigate = useNavigate();
    return (
        <div style={styles.container}>
            <h1>로그인</h1>

            {/* 에러 메시지 출력하는 부분 error가 null이 아니어야 수행 됨 */}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* email과 비밀번호를 입력받는 input 창 */}
            <TextInput type="email" value={email} onChange={onEmailChange} placeholder="이메일" />
            <TextInput type="password" value={password} onChange={onPasswordChange} placeholder="비밀번호" />

            {/* 각종 로그인 버튼. JWT 토큰 사용 후 관리자 로그인 버튼은 삭제할 가능성 존재 */}
            <TextButton label='회원가입' onClick={() => navigate('/signUp')} variant='orange' />
            <TextButton label='로그인' onClick={onSubmit} variant='outlined' />
            <TextButton label='네이버로 계속하기' onClick={() => onNaverLogin('naver')} variant='outlined' />
            <TextButton label='카카오로 계속하기' onClick={() => onKakaoLogin('kakao')} variant='outlined' />
            <TextButton label='관리자 로그인' onClick={onAdminLogin} variant='outlined' />
        </div>
    );
}

// 스타일을 JS 객체로 정하기.
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        height: '100vh',
    },
};

export default LoginForm;
