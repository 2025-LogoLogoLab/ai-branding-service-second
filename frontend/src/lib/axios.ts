
// src/lib/axios.ts
import axios, { AxiosError } from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL as string;

export const api = axios.create({
    baseURL,
    withCredentials: true, // 쿠키 기반 JWT 인증
  timeout: 5 * 60 * 1000, // allow logo generation to run up to 5 minutes
});

// 에러 메시지 변환기
export function toUserMessage(e: unknown): string {
    if (!axios.isAxiosError(e)) return "알 수 없는 오류가 발생했습니다.";
    if (e.code === "ERR_CANCELED") return "요청이 취소되었습니다.";
    if (e.code === "ECONNABORTED") return "요청 시간이 초과되었습니다.";
    
    const data = e.response?.data as any;
    if (data && typeof data === "object" && typeof data.message === "string") {
        return data.message;
    }
    if (typeof e.response?.data === "string") {
        return e.response.data;
    }
  return e.message || "요청 처리 중 오류가 발생했습니다.";
}

// 응답 인터셉터
api.interceptors.response.use(
    (res) => res,
  (err: AxiosError) => Promise.reject(err)
);

export default api;

// 구 버전
// import axios from "axios"

// const baseUrl = import.meta.env.VITE_API_BASE_URL as string;

// export const api = axios.create({
//     baseURL: baseUrl,
//     withCredentials: true,
//     timeout: 15_000,
// });
