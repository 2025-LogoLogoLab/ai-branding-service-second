// src/custom_api/branding.ts

const basePath = import.meta.env.VITE_API_BASE_URL;

const brandingGenEndPoint = basePath + '/brand-strategy/generate';
const brandingStoreEndPoint = basePath + '/brand-strategy/save';
const brandingDeleteEndPoint = basePath + '/brand-strategy/delete';
const fetchAllBrandingEndPoint = basePath + '/brand-strategies';
// const brandingTagEndPoint = '/api/branding';
// const brandingProjectEndPoint = '/api/branding';

// const navigate = useNavigate();

export type BradingRquest = {   // 브랜딩 전략 생성 요청 타입
    promptText:string;
}

export type BradingDeleteRquest = { // 브랜딩 전략 삭제 요청 타입
    brandingNum:number;
}

export type BrandingResponse = {    // 브랜딩 전략 생성 응답 타입
    brandingNum:number;
    promptText:string;
    data:string;
    tag?:[ string, string, string, string, string ]
}

export type BrandigStroeRequest = { // 브랜딩 전략 저장 요청 타입
    brandingNum?:number;
    promptText:string;
    data:string;    
    tag?:[ string, string, string, string, string ]
}

export async function generateBranding( { promptText }: BradingRquest ): Promise<BrandingResponse> {
    // 브랜딩 전략 생성 클라이언트

    console.log("브랜딩 전략 생성 요청 시작");    

    const result = await fetch(brandingGenEndPoint, {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${token}`,            // JWT 토큰은 쿠키로 관리.
        },
        credentials: 'include',
        body: JSON.stringify(promptText)
    });

    if( !result.ok ){
        console.log("브랜딩 전략 생성 요청 오류");    
        throw new Error('브랜딩 전략 생성 실패');
    }

    console.log("브랜딩 전략 생성 요청 성공");        
    return result.json();

}

export async function deleteBranding( brandingNum:number ) {
    // 브랜딩 전략 삭제 클라이언트. 리턴 타입 모름.

    console.log("브랜딩 전략 삭제 요청 시작");    

    const result = await fetch(brandingDeleteEndPoint, {
        method: 'DELETE',
        headers:{
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${token}`,            // JWT 토큰은 쿠키로 관리.
        },
        credentials: 'include',
        body: JSON.stringify(brandingNum)
    });

    if( !result.ok ){
        console.log("브랜딩 전략 삭제 요청 오류");    
        throw new Error('브랜딩 전략 삭제 실패');
    }

    console.log("브랜딩 전략 삭제 요청 성공");    
    return result.json();

}


export async function saveBranding({
    brandingNum,
    promptText,
    data,
    tag,
}: BrandigStroeRequest) {
    // 브랜딩 전락 저장 클라이언트. 리턴 타입 모름.

    console.log("브랜딩 전략 저장 요청 시작");    

    const result = await fetch(brandingStoreEndPoint, {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${token}`,            // JWT 토큰은 쿠키로 관리.
        },
        credentials: 'include',
        body: JSON.stringify( {brandingNum, promptText, data, tag} ),
    });

    if( !result.ok ){
        console.log("브랜딩 전략 저장 요청 오류");    
        throw new Error('브랜딩 전략 저장 실패');
    }

    console.log("브랜딩 전략 저장 요청 성공");    
    return result.json();    
}

export async function fetchAllBranding(): Promise<BrandingResponse[]> {
    // 전체 브랜딩 전략 가져오는 함수. 

    console.log("브랜딩 전략 전체 가져오기 요청 시작");    

    const result = await fetch(fetchAllBrandingEndPoint, {
        method: 'GET',
        // headers:{
        //     // 'Authorization': `Bearer ${token}`,            // JWT 토큰은 쿠키로 관리.
        // },
        credentials: 'include',
    });

    if( !result.ok ){
        console.log("브랜딩 전략 전체 가져오기 요청 오류");    
        throw new Error('브랜딩 전략 전체 불러오기 실패');
    }

    console.log("브랜딩 전략 전체 가져오기 요청 완료");    
    return result.json();    
}