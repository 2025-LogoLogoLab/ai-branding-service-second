// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * API 서버 베이스 URL
   * - .env.development 에서 VITE_API_BASE_URL 정의
   * - .env.production  에서 VITE_API_BASE_URL 정의
   */
  readonly VITE_API_BASE_URL: string;

  readonly VITE_CLIENT_ID_KAKAO: string;
  readonly VITE_CALL_BACK_KAKAO: string;
  readonly VITE_CLIENT_ID_NAVER: string;
  readonly VITE_CALL_BACK_NAVER: string;

  /** 예: feature flag */
//   readonly VITE_ENABLE_BETA: 'true' | 'false';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
