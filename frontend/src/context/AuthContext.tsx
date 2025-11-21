// src/context/AuthContext.tsx
// 인증 상태와 권한을 전역으로 관리하기 위한 React Context. Redux Toolkit은 나중에 사용. 아예 사용 안 할수도.

import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from 'react';
import {
    login as apiLogin,
    socialLogin as apiSocialLogin,
    logOut as apiLogOut,
    type SocialProvider,
    type LoginResponse,
    type LoginRequest,
    type SocailLoginResponse,
    checkAuth as getAuth,
} from '../custom_api/auth';

////////////////////////////////////////////////////////////////////////////////
// 1) Context 타입 정의
//    - 어디서 제공    : 이 파일 내에서 선언
//    - 어떤 기능      : AuthContext가 제공할 상태와 메서드의 형태를 명시
//    - 왜 사용하는지  : 타입스크립트로 안전하게 Context를 사용하기 위해
////////////////////////////////////////////////////////////////////////////////
type AuthContextType = {
    user: LoginResponse | SocailLoginResponse |null;                                 // 로그인된 사용자 정보
    loading: boolean;                                           // 요청 처리 중 플래그
    error: string | null;                                       // 에러 메시지
    login: ({email, password} : LoginRequest) => Promise<void>;        // 일반 로그인 메서드
    socialLogin: (code: string, provider: SocialProvider) => Promise<void>; // 소셜 로그인 메서드
    logout: () => Promise<void>;                                // 로그아웃 메서드
};

////////////////////////////////////////////////////////////////////////////////
// 2) Context 생성
//    - 어디서 제공    : React.createContext
//    - 어떤 기능      : AuthContext.Provider를 통해 하위 컴포넌트에 값 전달
//    - 왜 사용하는지  : 전역 인증 상태를 어디서든 접근·수정할 수 있도록
////////////////////////////////////////////////////////////////////////////////
const AuthContext = createContext<AuthContextType | undefined>(undefined);

////////////////////////////////////////////////////////////////////////////////
// 3) Provider 컴포넌트
//    - 어디서 제공    : 이 파일 내에서 선언
//    - 어떤 기능      : 인증 상태 관리(useState) 및 API 호출(useEffect, 메서드) 수행
//    - 왜 사용하는지  : 애플리케이션 전역에서 로그인 상태와 권한을 공유하기 위해
////////////////////////////////////////////////////////////////////////////////
export function AuthProvider({ children }: { children: ReactNode }) {

    // 공유할 Context 들
    const [user, setUser] = useState<LoginResponse | SocailLoginResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    //───────────────────────────────────────────────────────────────────────────
    // 초기 마운트 시 프로필 자동 복원
    // - 어디서 사용    : 페이지 처음 렌더링 될 때
    // - 어떤 기능      : 서버에 남아있는 세션/쿠키로 프로필 확인
    // - 왜 사용하는지  : 새로고침 후에도 로그인 상태를 유지하기 위해
    //───────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        
        // TODO : async 로 profile 불러와서 user에 권한 세팅하기.
        async function fetchAuth( ){
            setLoading(true);
            try {
                const temp = await getAuth();
                const role = { role : temp.role };
                setUser( role );
                console.log("fetch auth로 컨텍스트에 받아온 유저  : " + temp.role);
            }
            catch (err) {
                console.log(err);
                // 인증되지 않은 경우(401/403)는 에러로 취급하지 않고 사용자만 없다고 표기
                const message = err instanceof Error ? err.message : String(err);
                if (message.includes("401") || message.includes("403")) {
                    setUser(null);
                    setError(null);
                } else {
                    setError(message);
                }
            }
            finally{
                setLoading(false);
            }
        }
        
        fetchAuth();    
    }, []);
    
    useEffect(() => {

        console.log("유저 변경 확인1 : ", user);
        console.log("유저 변경 확인2 : ", user?.role);
        
    }, [user]);
    
    //───────────────────────────────────────────────────────────────────────────
    // 일반 로그인 함수
    // - 어디서 제공    : custom_api/auth.login()
    // - 어떤 기능      : 이메일/비밀번호 인증 후 HttpOnly 쿠키 발급 및 사용자 정보 반환
    // - 왜 사용하는지  : 로그인 시 서버-클라이언트 간 인증 세션을 생성하기 위해
    //───────────────────────────────────────────────────────────────────────────
    const login = async ({email, password} : LoginRequest) => {
        setLoading(true);
        setError(null);
        try {
            const res: LoginResponse = await apiLogin({ email, password });
            setUser(res);
        } catch (e: any) {
            setError(e.message || '로그인에 실패했습니다.');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    //───────────────────────────────────────────────────────────────────────────
    // 소셜 로그인 함수
    // - 어디서 제공    : custom_api/auth.socialLogin()
    // - 어떤 기능      : OAuth 코드 교환 후 HttpOnly 쿠키 발급 및 사용자 정보 반환
    // - 왜 사용하는지  : 소셜 계정 연동 로그인 흐름을 처리하기 위해
    //───────────────────────────────────────────────────────────────────────────
    const socialLogin = async (code: string, provider: SocialProvider) => {
        setLoading(true);
        setError(null);
        try {
            const res: SocailLoginResponse = await apiSocialLogin(code, provider);
            setUser(res);
            // res;
        } catch (e: any) {
            setError(e.message || '소셜 로그인에 실패했습니다.');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    //───────────────────────────────────────────────────────────────────────────
    // 로그아웃 함수
    // - 어디서 제공    : custom_api/auth.logOut()
    // - 어떤 기능      : 서버에 로그아웃 요청하여 쿠키 만료 및 클라이언트 세션 제거
    // - 왜 사용하는지  : 명시적 로그아웃 시 클라이언트와 서버 세션을 해제하기 위해
    //───────────────────────────────────────────────────────────────────────────
    const logout = async () => {
        setLoading(true);
        try {
            await apiLogOut();
        } catch(err) {
            // 로그아웃 실패해도 클라이언트 상태만 초기화
            console.log(err);
        } finally {
            setUser(null);
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, socialLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

////////////////////////////////////////////////////////////////////////////////
// 4) Context 사용 커스텀 훅
//    - 어디서 제공    : React.useContext
//    - 어떤 기능      : AuthContext를 손쉽게 사용하도록 래핑
//    - 왜 사용하는지  : 컴포넌트에서 가져온 값이 undefined일 경우 에러를 던져 안정성 확보
////////////////////////////////////////////////////////////////////////////////
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('AuthProvider로 컴포넌트를 감싸주세요.');
    }
    return ctx;
}
