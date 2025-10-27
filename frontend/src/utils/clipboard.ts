// src/utils/clipboard.ts
// 클립보드 관련 유틸 함수 모음

import { ensureDataUrl } from "./image";

/**
 * base64 data URL을 Blob으로 변환한다.
 */
function dataUrlToBlob(dataUrl: string): Blob {
    const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
    if (!match) {
        throw new Error("지원하지 않는 이미지 포맷입니다.");
    }
    const mime = match[1] || "image/png";
    const binary = atob(match[2]);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
}

/**
 * 이미지 URL(또는 data URL)을 클립보드로 복사한다.
 * - Clipboard API가 지원되지 않으면 예외를 던진다.
 * - 원격 리소스(fetch)가 CORS를 허용하지 않을 경우 복사에 실패할 수 있다.
 */
export async function copyImageToClipboard(source: string): Promise<void> {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
        throw new Error("클립보드 기능을 사용할 수 없습니다.");
    }

    const ClipboardItemCtor = (window as typeof window & { ClipboardItem?: typeof ClipboardItem }).ClipboardItem;
    if (!ClipboardItemCtor) {
        throw new Error("현재 브라우저에서는 이미지 복사를 지원하지 않습니다.");
    }

    const normalized = ensureDataUrl(source);

    let blob: Blob;
    if (normalized.startsWith("data:")) {
        blob = dataUrlToBlob(normalized);
    } else {
        const response = await fetch(normalized, { mode: "cors" });
        if (!response.ok) {
            throw new Error("이미지를 불러오지 못했습니다.");
        }
        blob = await response.blob();
    }

    await navigator.clipboard.write([new ClipboardItemCtor({ [blob.type || "image/png"]: blob })]);
}
