// src/custom_api/types.ts
// API 클라이언트 전반에서 공통으로 사용하는 타입 모음

/**
 * 서버가 공통적으로 사용하는 페이지네이션 응답 스키마
 * - content: 실제 데이터 배열
 * - page/size: 현재 페이지 및 페이지 크기(0-base)
 * - totalElements/totalPages: 전체 데이터 수 및 총 페이지 수
 * - last: 마지막 페이지 여부
 */
export type PaginatedResponse<T> = {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
};
