// src/pages/Login.tsx
// 역할 : 로그인 관련 로직 호출 + 로그인에 필요한 UI 컴포넌트 불러오기

import { useEffect, useState } from 'react';
import LoginForm from '../organisms/LoginForm';
import type { SocialProvider, } from '../custom_api/auth';
import { getKakaoAuthUrl, getNaverAuthUrl } from '../custom_api/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// CSRF 방지용 랜덤 문자열. naver 쓰려면 필수로 필요함. 여기서만 사용.
function generateRandomState() {
    return Math.random().toString(36).substring(2, 15);
}

// 로그인 페이지 객체
function Login() {
    const navigate = useNavigate(); // 로그인 후 리다이렉트 위해서
    const location = useLocation();

    // 전역 Context.
    const { user, loading, error, login } = useAuth();

    const [email, setEmail] = useState('');
    // const [provider, setProvider] = useState<social>(null);
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);
    
    useEffect(()=>{
        
        if( user ) {
            // 이미 로그인 된 상황 처리
            console.log(location + "이미 로그인 되어 있음." + user);
            // alert(location + "이미 로그인 되어 있음." + user);
            navigate("/");
        }

        if (error) {
            // 에러 발생 처리
            console.log(" 로그인 실패 : " + error);
            navigate('/login');
        }

    }, [error])

    if (loading) {
        return (
            <div> 로그인 중 입니다.. </div>
        );
    }

    const handleLogin = async () => {   // 일반 로그인 핸들링 로직
        
        if (!email || !password) {
            setLocalError('이메일과 비밀번호를 입력해주세요.');
            return;
        }

        login({ email, password });  // login 클라이언트 호출

        // alert('로그인 성공! ' + user?.role);
        navigate("/"); // 메인 페이지로

    };

    const handleSocialLogin = (provider: SocialProvider) => {
        // 소셜 로그인 핸들링 함수. 어떤 소셜 로그인인지 보고 필요한 url로 이동 시킴.

        const state = generateRandomState();

        if (provider === 'kakao') {
            window.location.href = getKakaoAuthUrl();         // 카카오 로그인 url로 이동
        } else {
            window.location.href = getNaverAuthUrl(state);    // 네이버 로그인 url로 이동
        }
    };

    const handleAdminLogin = () => {
        // 관리자 로그인 로직. 아마도 백엔드에서 role 구분으로 끝나지 않을까 싶음.
    };

    return (
        <LoginForm      // 로그인 Form UI 객체
            email={email}
            password={password}
            error={localError}
            onEmailChange={(e) => setEmail(e.target.value)}
            onPasswordChange={(e) => setPassword(e.target.value)}
            onSubmit={handleLogin}
            onNaverLogin={handleSocialLogin}
            onKakaoLogin={handleSocialLogin}
            onAdminLogin={handleAdminLogin}
        />
    );
}

export default Login