// src/custom_api/colorguide.ts

const basePath = import.meta.env.VITE_API_BASE_URL;

import type { PaginatedResponse } from "./types";

const colorguideGenEndPoint = basePath + '/color-guide/generate';
const colorguideStoreEndPoint = basePath + '/color-guide/save';
const colorguideDeleteEndPoint = basePath + '/color-guide';
const colorGuideDetailEndpoint = basePath + '/color-guide';
const colorGuideListEndpoint = basePath + '/color-guides';

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

    const result = await fetch(`${colorguideDeleteEndPoint}/${colorGuideNum}`, {
        method: 'DELETE',
        // headers:{
        //     'Content-Type': 'application/json',
        //     // 'Authorization': `Bearer ${token}`,            // JWT 토큰은 쿠키로 관리.
        // },
        credentials: 'include',
        // body: JSON.stringify(colorGuideNum)
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

export type ColorGuideListItem = {
    id: number;
    briefKo: string;
    style?: string;
    mainHex?: string;
    subHex?: string;
    pointHex?: string;
    backgroundHex?: string;
    mainDescription?: string;
    subDescription?: string;
    pointDescription?: string;
    backgroundDescription?: string;
    createdAt: string;
};

export type ColorGuideTag = { id: number; name: string };

export type ColorGuideDetail = {
    id: number;
    briefKo: string;
    style?: string;
    guide: colorGuide;
    caseType?: string;
    createdAt?: string;
    updatedAt?: string;
    tags?: ColorGuideTag[];
    [key: string]: unknown;
};

export type ColorGuidePageParams = {
    projectId?: number;
    page?: number;
    size?: number;
    filter?: 'mine';
};

/**
 * 페이징이 적용된 컬러 가이드 목록을 조회한다.
 */
export async function fetchColorGuidePage(
    params: ColorGuidePageParams = {},
    options: { signal?: AbortSignal } = {}
): Promise<PaginatedResponse<ColorGuideListItem>> {
    console.log("컬러 가이드 목록 페이지 조회 요청 시작");

    const url = new URL(colorGuideListEndpoint);
    const qs = new URLSearchParams();

    if (params.projectId != null) qs.set("projectId", String(params.projectId));
    if (params.page != null) qs.set("page", String(params.page));
    if (params.size != null) qs.set("size", String(params.size));
    if (params.filter) qs.set("filter", params.filter);

    url.search = qs.toString();

    const result = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
        signal: options.signal,
    });

    if (!result.ok) {
        console.log("컬러 가이드 목록 페이지 조회 오류");
        throw new Error('컬러 가이드 목록 조회 실패 ' + result.status);
    }

    console.log("컬러 가이드 목록 페이지 조회 성공");
    const payload = await result.json();
    return payload as PaginatedResponse<ColorGuideListItem>;
}

export async function fetchAllColorGuide(): Promise<ColorGuideListItem[]> {
    // 전체 컬러 가이드 가져오는 함수. 
    console.log("컬러 가이드 전체 가져오기 요청 시작");    

    const firstPage = await fetchColorGuidePage({ page: 0, size: 50, filter: 'mine' });
    return firstPage.content;
}

const normalizePalette = (input: any, fallbackHex?: string, fallbackDescription?: string): palette => ({
    hex: input?.hex ?? fallbackHex ?? "",
    description: input?.description ?? fallbackDescription ?? "",
});

export async function fetchColorGuideDetail(
    id: number,
    options: { signal?: AbortSignal } = {}
): Promise<ColorGuideDetail> {
    console.log("컬러 가이드 상세 조회 요청 시작");
    const result = await fetch(`${colorGuideDetailEndpoint}/${id}`, {
        method: "GET",
        credentials: "include",
        signal: options.signal,
    });

    if (!result.ok) {
        console.log("컬러 가이드 상세 조회 오류");
        throw new Error("컬러 가이드 상세 조회 실패 " + result.status);
    }

    const payload = await result.json();
    const guideSource = payload.guide ?? payload;
    const detail: ColorGuideDetail = {
        id: payload.id,
        briefKo: payload.briefKo ?? "",
        style: payload.style ?? undefined,
        caseType: payload.caseType ?? undefined,
        guide: {
            main: normalizePalette(guideSource.main, payload.mainHex, payload.mainDescription),
            sub: normalizePalette(guideSource.sub, payload.subHex, payload.subDescription),
            point: normalizePalette(guideSource.point, payload.pointHex, payload.pointDescription),
            background: normalizePalette(guideSource.background, payload.backgroundHex, payload.backgroundDescription),
        },
        createdAt: payload.createdAt,
        updatedAt: payload.updatedAt,
        tags: Array.isArray(payload.tags) ? payload.tags : undefined,
    };
    console.log("컬러 가이드 상세 조회 성공");
    return detail;
}
