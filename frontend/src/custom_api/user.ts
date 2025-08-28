// src/custom_api/user.ts
// 일반 유저의 유저 정보 처리에 사용되는 api 클라이언트와 type들 정의

const basePath = import.meta.env.VITE_API_BASE_URL;

const userInfoEndPoint = basePath + '/users/me'    // 유저 정보 불러오는 api 엔드 포인트
const userModifyEndPoint = basePath + '/users/me'    // 유저 정보 불러오는 api 엔드 포인트
const userDeleteEndPoint = basePath + '/users/me'  // 유저 탈퇴 api 엔드 포인트

// 유저 정보 요청은 JWT 토큰을 통해 이루어짐. type 불필요.

// 유저 정보 수정 요청을 위한 type
export type UserModifyRequest = {
    profileImageData: string | null;
    nickname: string;
    emailNoti: boolean;
    smsNoti: boolean;
    newsLetter: boolean;
    email: string;
    phone: string;
};

export type UserInfoResponse = {   // 유저 정보 응답용 type.
    profileImageData: string | null;
    nickname: string;
    emailNoti: boolean;
    smsNoti: boolean;
    newsLetter: boolean;
    email: string;
    phone: string;
    // role: 'admin' | 'user';
};

export type userModifyResponse = UserInfoResponse;   // 유저 정보 응답용 type.

// 회원 탈퇴 요청은 JWT 토큰으로 이루어짐. 타입 불필요.

export type DeleteMyAccoutResponse = {  // 회원 탈퇴 요청 응답 type
    message: '회원 탈퇴가 완료되었습니다.' | null;     // 회원 탈퇴 완료 메시지
}


export async function fetchUserInfo( ): Promise<UserInfoResponse> {
    // JWT 토큰에 맞는 유저 정보 요청하는 함수.

    const result = await fetch(userInfoEndPoint, {
        method: 'GET',
        // headers: {
        //     // 'Content-Type': 'application/json',      // 요청 바디 없음.
        //     // 'Authorization': `Bearer ${token}`,      // JWT 쿠키로 관리.
        // },
        credentials: 'include'
    });

    // 오류 처리
    if (!result.ok) {
        throw new Error(`HTTP ${result.status}`);
    }
    
    return result.json();
}

export async function modifyUserInfo({ 
    profileImageData,
    nickname,
    emailNoti = false,
    smsNoti = false,
    newsLetter = false,
    email,
    phone,    
} 
    : UserModifyRequest )
: Promise<userModifyResponse> 
{
    // 유저 정보 수정 요청하는 클라이언트

    console.log("유저 정보 수정 요청 시작");    
    const res = await fetch(userModifyEndPoint, {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json', 
            // 'Authorization': `Bearer ${token}`   // JWT 쿠키로 관리
        },
        credentials: 'include',
        body: JSON.stringify({ 
            profileImageData, 
            nickname,
            emailNoti,
            smsNoti,
            newsLetter,
            email,
            phone,
        }),
    });

    if (!res.ok) {  // 에러처리
        console.log("유저 정보 수정 요청 오류");    
        throw new Error(`HTTP ${res.status}`);
    }

    console.log("유저 정보 수정 요청 성공");    
    return res.json();
}

export async function deleteMyAccount( ): Promise<DeleteMyAccoutResponse> {
    // 개인 회원 탈퇴 요청

    console.log("유저 탈퇴 요청 시작");    
    const res = await fetch( userDeleteEndPoint, {
        method: 'DELETE',
        // headers:{
        //     // 'Content-Type': 'application/json',      // JWT 쿠키로 관리할거.
        //     'Authorization': `Bearer ${token}`,
        // },
        credentials: 'include',
    });

    if ( !res.ok ) {
        console.log("유저 탈퇴 요청 오류");    
        throw new Error('회원 탈퇴 실패 ' + res.status);
    }

    console.log("유저 탈퇴 요청 성공");    
    return res.json();
}