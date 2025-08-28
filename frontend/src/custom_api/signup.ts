// src/custom_api/signup.ts
// 회원 가입 api 클라이언트와 관련 type 정의
const basePath = import.meta.env.VITE_API_BASE_URL;

const signupEndPoint = basePath + '/signup'    // 회원 가입 api 엔드 포인트

export type SignUp = {  // 회원가입 요청 타입
    email: string;      // 회원 email
    password: string;   // 회원 비밀번호
    nickname: string;   // 회원 닉네임
};

// export type SignUpResponse = {  // 회원가입 응답 타입
//     message: string;
// }

export type SignUpResponse = string;

export async function signup({ email, password, nickname } : SignUp) : Promise<SignUpResponse> {
    // 일반 회원가입 요청 api 클라이언트. 소셜 회원 가입은 카카오, 네이버와 백엔드에서 처리될 것으로 예상.

    console.log("일반 회원가입 요청 시작");    
    const result = await fetch(signupEndPoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, password, nickname}),
    });

    if ( !result.ok ){
        console.log("일반 회원가입 요청 오류");    
        throw new Error('회원가입 실패');
    }

    console.log("일반 회원가입 요청 성공");    
    return result.text();
    // return result.json();
}