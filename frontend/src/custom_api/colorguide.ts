// src/custom_api/colorguide.ts

const basePath = import.meta.env.VITE_API_BASE_URL;

const colorguideGenEndPoint = basePath + '/color-guide/generate';
const colorguideStoreEndPoint = basePath + '/color-guide/save';
const colorguideDeleteEndPoint = basePath + '/colorguide';
const fetchAllColorguideEndPoint = basePath + '/color-guide/generate';

// const navigate = useNavigate();

export type palette = {       // 컬러 가이드에서 사용하는 컬러 타입.
    hex: string;            // 16진수 RGB 코드
    description: string;    // 해당 색상에 대한 AI의 설명
}

export type colorGuideRequest = {   // 컬러 가이드 생성 요청 타입
    briefKo:string;             // 설명
    style:string;               // 스타일 : 로고랑 연관?
    imageUrl?:string;           // 로고 이미지. base64
}

export type colorGuideDeleteRequest = { // 컬러 가이드 삭제 요청 타입
    colorGuideNum:number;
}

export type colorGuideResponse = {    // 컬러 가이드 생성 응답 타입
    colorGuideNum:number;
    promptText:string;
    data:string;
    tag?:[ string, string, string, string, string ]
}


export type colorGuide = {  // 새로운 컬러가이드 생성 타입.
    main:palette;           // 메인 색상
    sub:palette;            // sub 색상
    point:palette;          // 포인트 색상
    background:palette;     // 배경 색상    
}

export type colorGuideGenResponse = colorGuide;

// export type colorGuideStoreRequest = { // 컬러 가이드 저장 요청 타입
//     colorGuideNum?:number;
//     promptText:string;
//     data:string;    
//     tag?:[ string, string, string, string, string ]
// }

export type colorGuideStoreRequest = { // 컬러 가이드 저장 요청 타입
    briefKo:string;
    guide:colorGuideGenResponse;
}

export async function generateColorGuide( { briefKo: promptText, style, imageUrl }: colorGuideRequest ): Promise<colorGuideGenResponse> {
    // 컬러 가이드 생성 클라이언트

    console.log("컬러 가이드 생성 요청 시작");    
    // const token = localStorage.getItem('token');
    // if ( !token ){
    //     console.log('토큰 없음');
    //     // navigate('/login');
    // }                                                // JWT 토큰은 쿠키로 관리.

    const result = await fetch(colorguideGenEndPoint, {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${token}`,            // JWT 토큰은 쿠키로 관리.
        },
        credentials: 'include',
        body: JSON.stringify({briefKo:promptText, style, imageUrl})
    });

    if( !result.ok ){
        console.log("컬러 가이드 생성 요청 오류");    
        throw new Error('컬러 가이드 생성 실패');
    }

    console.log("컬러 가이드 생성 요청 성공");    
    return result.json();

}

export async function deleteColorGuide( colorGuideNum:number ) {
    // 컬러 가이드 삭제 클라이언트. 리턴 타입 모름.
    console.log("컬러 가이드 삭제 요청 시작");    

    // const token = localStorage.getItem('token');
    // if ( !token ){
    //     console.log('토큰 없음');
    //     // navigate('/login');
    // }                                                // JWT 토큰은 쿠키로 관리.

    const result = await fetch(colorguideDeleteEndPoint, {
        method: 'DELETE',
        headers:{
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${token}`,            // JWT 토큰은 쿠키로 관리.
        },
        credentials: 'include',
        body: JSON.stringify(colorGuideNum)
    });

    if( !result.ok ){
        console.log("컬러 가이드 삭제 요청 오류");    
        throw new Error('컬러 가이드 삭제 실패');
    }

    console.log("컬러 가이드 삭제 요청 성공");    
    return result.json();

}


export async function saveColorGuide({ briefKo, guide}: colorGuideStoreRequest) {
    // 컬러 가이드 저장 클라이언트. 리턴 타입 모름.
    console.log("컬러 가이드 저장 요청 시작");    

    // const token = localStorage.getItem('token');
    // if ( !token ){
    //     console.log('토큰 없음');
    //     // navigate('/login');
    // }                                                // JWT 토큰은 쿠키로 관리.

    const result = await fetch(colorguideStoreEndPoint, {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${token}`,            // JWT 토큰은 쿠키로 관리.
        },
        credentials: 'include',
        body: JSON.stringify( {briefKo, guide} ),
    });

    if( !result.ok ){
        console.log("컬러 가이드 저장 요청 오류");    
        throw new Error('컬러 가이드 저장 실패');
    }

    console.log("컬러 가이드 저장 요청 성공");    
    return result.json();    
}

export async function fetchAllColorGuide(): Promise<colorGuideResponse[]> {
    // 전체 컬러 가이드 가져오는 함수. 
    console.log("컬러 가이드 전체 가져오기 요청 시작");    

    // const token = localStorage.getItem('token');
    // if ( !token ){
    //     console.log('토큰 없음');
    //     // navigate('/login');
    // }                                                // JWT 토큰은 쿠키로 관리.

    const result = await fetch(fetchAllColorguideEndPoint, {
        method: 'GET',
        headers:{
            // 'Authorization': `Bearer ${token}`,            // JWT 토큰은 쿠키로 관리.
        },
        credentials: 'include',
    });

    if( !result.ok ){
        console.log("컬러 가이드 전체 가져오기 요청 오류");    
        throw new Error('컬러 가이드 전체 불러오기 실패');
    }

    console.log("컬러 가이드 전체 가져오기 요청 성공");    
    return result.json();    
}