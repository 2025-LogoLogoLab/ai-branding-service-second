// src/utils/image.ts
// 이미지 문자열 관련 공용 유틸리티

const PROTOCOL_PATTERN = /^[a-z]+:\/\//i;

/**
 * 서버가 base64 문자열만 내려줄 때 data URL 스킴을 덧붙여준다.
 * 이미 data URL이거나(http/https 등) 프로토콜을 포함하는 경우 그대로 반환한다.
 */
export function ensureDataUrl(data: string, mime = "image/png"): string {
    if (!data) {
        return `data:${mime};base64,`;
    }
    if (data.startsWith("data:") || PROTOCOL_PATTERN.test(data)) {
        return data;
    }
    return `data:${mime};base64,${data}`;
}
