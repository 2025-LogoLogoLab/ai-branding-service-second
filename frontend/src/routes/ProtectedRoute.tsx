// src/components/ProtectedRoute.tsx

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef } from 'react';

////////////////////////////////////////////////////////////////////////////////
// ProtectedRoute 컴포넌트
// 1) 어디서 제공    : React Router v6
// 2) 어떤 기능      : 로그인 여부 및 권한 검사 후 하위 라우트 렌더링 또는 리다이렉트
// 3) 왜 사용하는지  : 라우트 단위로 접근 제어를 일관성 있게 적용하기 위해
////////////////////////////////////////////////////////////////////////////////
type Props = {
    requireRoles?: string[];    // 검사할 권한 목록 (예: ['admin'])
    redirectPath?: string;      // 미인증 시 리다이렉트할 경로
};

export function ProtectedRoute({
    requireRoles,
    redirectPath = '/login',
}: Props) {
    const { user, loading } = useAuth();    // 전역 인증, 권한 상태 불러오기

    //───────────────────────────────────────────────────────────────────────────
    // 1) 로딩 중 처리
    //    - user 프로필 복원 또는 로그인 처리 중인 경우
    //    - 스피너나 로딩 메시지 표시
    //───────────────────────────────────────────────────────────────────────────
    if (loading) {
        return <p>로딩 중…</p>;
    }

    //───────────────────────────────────────────────────────────────────────────
    // 2) 인증 필요 검사
    //    - user가 null이면 로그인 화면으로 리다이렉트
    //───────────────────────────────────────────────────────────────────────────
    if (!user) {
        return (
            <RedirectWithAlert to={redirectPath} message='로그인해야 사용할 수 있는 페이지 입니다.'/>
        );
    }

    //───────────────────────────────────────────────────────────────────────────
    // 3) 권한 검사
    //    - requireRoles가 설정된 경우, user.roles에 포함되어 있는지 확인
    //    - 권한 없으면 권한 부족 페이지로 이동
    //───────────────────────────────────────────────────────────────────────────
    if (requireRoles) {
        // role 표기(ADMIN/admin 등) 편차를 허용하기 위해 소문자로 비교.
        const normalizedRole = (user.role ?? "").toString().toLowerCase();
        const hasRole = requireRoles.some((role) => {
            const candidate = role.toLowerCase();
            return normalizedRole === candidate || normalizedRole.includes(candidate);
        });
        if (!hasRole) {
            return <RedirectWithAlert to='/unauthorized' message='관리자만 사용할 수 있는 페이지입니다.'/>
        }
    }

    //───────────────────────────────────────────────────────────────────────────
    // 4) 모든 검사 통과 시, 중첩 라우트 렌더링
    //───────────────────────────────────────────────────────────────────────────
    return <Outlet />;
}


// 별도 컴포넌트로 분리해서 alert을 useEffect 안에서 한 번만 실행
// function RedirectWithAlert({ to, message }: { to: string; message: string }) {
//     const location = useLocation();
//     const alerted = new Set<string>(); 

//   useEffect(() => {
//     if ( !alerted.has(message) ){       // 한번만 수행하게 하려고...
//         alert(message);
//         alerted.add(message);
//     }

//     return() => {
//         // 가장 먼저 실행할 코드...
//     }

//   }, [message]);

//   return <Navigate to={to} state={{ from: location }} replace />;
// }

function RedirectWithAlert({ to, message }: { to: string; message: string }) {
    const location = useLocation();
    const shownRef = useRef(false);

    useEffect(() => {
        if (!shownRef.current) {
            alert(message);
            shownRef.current = true;
        }
    }, [message]);

    return <Navigate to={to} state={{ from: location }} replace />;
}
