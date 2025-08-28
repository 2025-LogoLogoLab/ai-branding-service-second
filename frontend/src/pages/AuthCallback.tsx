import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { SocialProvider } from "../custom_api/auth";
import { useAuth } from "../context/AuthContext";
import { useRef } from "react";

function AuthCallback() {

    const navigate = useNavigate();
    const { socialLogin } = useAuth();
    const isFlight = useRef(false);     // 소셜 로그인 실행중인지 확인용
    
    useEffect(() => {
        
        if(isFlight.current){   // 이미 실행중이면 리턴
            return;
        }
        
        async function loginWithSocial() {
            // 파라메터들 추출
            const params = new URLSearchParams(window.location.search);
            
            // code 와 provider 추출
            const code = params.get('code');
            const provider = params.get('provider') as SocialProvider | null;
            console.log("code : " + code, "\tprovider : " + provider);
            
            // 요청 오류 처리
            if (!code || (provider !== 'kakao' && provider !== 'naver')) {
                alert('잘못된 요청입니다.');
                navigate('/login');
                return;
            }
            
            // AuthContext의 소셜 로그인 호출.
            await socialLogin( code, provider );
            navigate('/');
            
        }
        
        
        isFlight.current = true;
        loginWithSocial();

    }, []);

    return (
        <p>소셜 로그인 시도 중...</p>
    );
}

export default AuthCallback
