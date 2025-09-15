// src/custom_api/branding.ts

const basePath = import.meta.env.VITE_API_BASE_URL;

const brandingGenEndPoint = basePath + '/brand-strategy/generate';  // 브랜딩 전략 생성
const brandingStoreEndPoint = basePath + '/brand-strategy/save';    // 브랜딩 전략 저장
const brandingDeleteEndPoint = basePath + '/brand-strategy/';       // 브랜딩 전략 삭제
const brandingUpdateEndPoint = basePath + '/brand-strategy/';       // 브랜딩 전략 수정
const fetchAllBrandingEndPoint = basePath + '/brand-strategies';    // 브랜딩 전략 리스트 조회
// const brandingTagEndPoint = '/api/branding';
// const brandingProjectEndPoint = '/api/branding';

// const navigate = useNavigate();

export type ISODataTime = string;   // 시간 타입
export type Cases = string;         // 브랜딩 전략을 어떤 식으로 생성했는지 나타내는 타입. 일단은 string. 나중에 백엔드한테 어떤 옵션들 있는지 봐서 타입 만들어야 할 듯.

export type BrandingRequest = {   // 브랜딩 전략 생성 요청 타입
    briefKo:string;     // 생성용 프롬프트
    style?: string;     // 스타일?
    base64?: string;    // 프롬프트 생성에 이미지 사용시 추가.
}

export type BrandingResponse = string;    // 브랜딩 전략 생성 응답 타입. 단순 마크다운 text

export type BrandingStroeRequest = { // 브랜딩 전략 저장 요청 타입
    briefKo:string;     // 생성에 사용된 텍스트
    style?:string;      // 스타일?
    imageUrl?:string;   // 로고와 같이 생성한 경우 로고를 함께 전달
    projectId?: number; // 브랜딩 전략이 포함된 프로젝트 (디렉터리와 유사)가 있는 경우
    markdown:string;    // 실제 브랜딩 전략 내용. 마크다운 텍스트
}


export type BrandingStroeResponse = {   // 브랜딩 전략 저장 요청 응답 타입
    id: number;             // 저장된 브랜딩 전략 id
    briefKo: string;        // 브랜딩 전략 생성에 사용된 요청 텍스트
    style: string;          // 스타일??
    caseType?: Cases;       // 생성 시 타입       
    sourceImage?: string;   // 생성에 사용된 이미지
    projectId?: number;     // 소속된 프로젝트가 있으면 그 아이디
    createdBy: string;      // 소유자
    createdAt: ISODataTime; // 생성 시간
    updatedAt: ISODataTime; // 수정 시간
    markdown: string;       // 실제 브랜딩 전략 내용.
}

export type BrandingDeleteRequest = { // 브랜딩 전략 삭제 요청 타입
    id:number;
}

export type AllBrandingFetchParams = {    // 브랜딩 전략 수정시 URL 파라메터로 넘길 것들
    projectId?: number;     // 프로젝트 별로 fetch할 경우 추가 됨.
    page?: number;          // 몇번째 페이지인가?
    size?: number;          // 한번에 불러올 사이즈
    filter?: 'mine' | null | undefined;     // mine 추가되어있는 경우 내것만
}

export async function generateBranding( { briefKo: briefKo, style, base64 } : BrandingRequest): Promise<BrandingResponse> {
    // 브랜딩 전략 생성 클라이언트

    console.log("브랜딩 전략 생성 요청 시작");    

    const result = await fetch(brandingGenEndPoint, {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({briefKo, style, base64})
    });

    if( !result.ok ){
        console.log("브랜딩 전략 생성 요청 오류");    
        throw new Error('브랜딩 전략 생성 실패');
    }

    console.log("브랜딩 전략 생성 요청 성공");        
    return result.json();

}

export async function deleteBranding( {id} : BrandingDeleteRequest ) {
    // 브랜딩 전략 삭제 클라이언트. 리턴 타입 모름.

    console.log("브랜딩 전략 삭제 요청 시작");    

    const result = await fetch(brandingDeleteEndPoint + id, {   // 삭제할 id 를 url에 붙여서 요청.
        method: 'DELETE',
        // headers:{        // body 없음.
        //     'Content-Type': 'application/json',
        // },
        credentials: 'include',
    });

    if( !result.ok ){
        console.log("브랜딩 전략 삭제 요청 오류");    
        throw new Error('브랜딩 전략 삭제 실패');
    }

    console.log("브랜딩 전략 삭제 요청 성공");
    return result.json();

}

export async function saveBranding({
    briefKo,        
    style,
    projectId,
    markdown
}: BrandingStroeRequest) : Promise<BrandingStroeResponse> {
    // 브랜딩 전락 저장 클라이언트.

    console.log("브랜딩 전략 저장 요청 시작");    

    const result = await fetch(brandingStoreEndPoint, {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify( {briefKo, style, projectId, markdown})
    });

    if( !result.ok ){
        console.log("브랜딩 전략 저장 요청 오류");    
        throw new Error('브랜딩 전략 저장 실패');
    }

    console.log("브랜딩 전략 저장 요청 성공");    
    return result.json();    
}

export async function fetchAllBranding( params : AllBrandingFetchParams): Promise<BrandingResponse[]> {
    // 전체 브랜딩 전략 가져오는 함수. 

    console.log("브랜딩 전략 전체 가져오기 요청 시작");    

    const url = new URL (fetchAllBrandingEndPoint);
    const qs = new URLSearchParams();

    // 파라메터들 있으면 쿼리 스트링에 붙이기.
    if (params.projectId != null) qs.set("projectId", String(params.projectId));
    if (params.page != null) qs.set("page", String(params.page));
    if (params.size != null) qs.set("size", String(params.size));
    if (params.filter) qs.set("filter", params.filter);

    url.search = qs.toString(); // 쿼리 스트링을 url에 붙이기

    const result = await fetch(url.toString(), {
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