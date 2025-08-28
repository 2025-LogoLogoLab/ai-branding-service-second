// src/components/custom_api/auth.tsx
/*
    로그인 관련 api 클라이언트 모음
*/

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const endPointLogin = baseUrl + '/login';
const endPointSocialLogin = baseUrl + '/login/social';
const logOutEndPoint = baseUrl + '/logout'

// export type SocailLoginResponse = {
//     provider: string;
//     code: string;
// }


// 로그인 요청 폼
export type LoginRequest = {
    email: string;
    password: string;
}

export type LoginResponse = {
    // accessToken: string; // HttpOnly + Secure 쿠키 사용 할 거라 이제 안 쓸 듯.
    // id: string;          // 이건 지워도 될지도?
    role: 'ADMIN' | 'USER';
    // email?: string;
    // nickname?: string;
    // profilePic?: string | null;
}

export type SocailLoginResponse = LoginResponse;
// 로그아웃 응답 폼.
// export type LogOutResponse = {
//     message: string;        // 어떤 메시지들이 올지는 다시 결정해봐야할 것 같음.
// }

// 소셜 로그인 종류 지정
export type SocialProvider = 'kakao' | 'naver' | null;

// 소셜 로그인 url 리턴하는 객체
export const socialAuthConfig = {
  kakao: {
    // clientId: encodeURIComponent(import.meta.env.VITE_CLIENT_ID_KAKAO),
    clientId: import.meta.env.VITE_CLIENT_ID_KAKAO,
    // redirectUri: encodeURIComponent(import.meta.env.VITE_CALL_BACK_KAKAO),
    redirectUri: import.meta.env.VITE_CALL_BACK_KAKAO,
    getAuthUrl: function () {
        return `https://kauth.kakao.com/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&response_type=code`;
    },
  },
  naver: {
    clientId: import.meta.env.VITE_CLIENT_ID_NAVER,
    redirectUri: encodeURIComponent(import.meta.env.VITE_CALL_BACK_NAVER),
    getAuthUrl: function (state: string) {
        return `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${this.clientId}&redirect_uri=${this.redirectUri}&state=${encodeURIComponent(state)}`;
    }
  },
};

// 일반, 관리자 로그인 api 클라이언트
export async function login( {email, password}: LoginRequest ): Promise<LoginResponse>{
    
    // return { role: 'user' };    // 테스트용
    console.log("백엔드에 일반 로그인 요청 시작");    

    const result = await fetch(endPointLogin, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',     // JWT 토큰을 쿠키로 관리
        body: JSON.stringify({email, password}),
    });

    if ( !result.ok ) {
        console.log("백엔드에 일반 로그인 요청 오류");    
        throw new Error('로그인 실패');
    }

    console.log("백엔드에 일반 로그인 요청 성공");    
    return result.json();
    
}

// 테스트용
// export async function login( {email, password}: LoginRequest ): Promise<LoginResponse>{

//     email; 
//     password;
//     const result:LoginResponse = { role:'user' };

//     return result;
    
// }

// 소셜 로그인 api 클라이언트
export async function socialLogin( code:string, provider:SocialProvider ): Promise<SocailLoginResponse>{

    console.log("백엔드에 소셜 로그인 요청 시작");    

    const result = await fetch(endPointSocialLogin, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
        },
        credentials: 'include',     // JWT 토큰을 쿠키로 관리
        body: JSON.stringify({provider, code}),
    });


    if ( !result.ok ){
        console.log("백엔드에 소셜 로그인 요청 오류");    
        throw new Error('소셜 로그인 실패');
    }

    const data = await result.json();
    console.log("백엔드에 소셜 로그인 요청 성공" + data.role);
    return data;
}

// 로그아웃 요청 클라이언트
// export async function logOut( token : LogOutResponse ) : Promise<LogOutResponse> {
// export async function logOut( ) : Promise<LogOutResponse> {
export async function logOut(){

    console.log("백엔드에 로그아웃 요청 시작");    
    const result = await fetch( logOutEndPoint, {
        method: 'POST',
        // headers: {
        //     'Authorization': `Bearer ${token}`
        // },                           // JWT 토큰을 쿠키에 넣을 것이므로 헤더 생략 가능.
        credentials: 'include',     // JWT 토큰을 쿠키로 관리
    });

    if ( !result.ok ) {
        console.log("백엔드에 로그아웃 요청 오류" + result);    
        throw new Error("로그아웃 실패" + result.status);
    }

    // const data: LogOutResponse = await result.json();
    
    console.log("백엔드에 로그아웃 요청 성공" + result);    
    // return data;
}