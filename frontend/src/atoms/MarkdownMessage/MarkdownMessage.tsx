// src/atoms/MarkdownMessage/MarkdownMessage.tsx
import ReactMarkdown from 'react-markdown';
import styles from './MarkdownMessage.module.css';

export type MarkdownMessageProps = {
    content: string;         // 마크다운으로 구성된 응답 텍스트
    isUser?: boolean;        // 사용자 메시지 여부 (기본값: false → 시스템 응답)
    className?: string;      // 외부에서 추가 스타일 주입
};

export function MarkdownMessage({
    content,
    isUser = false,
    className,
}: MarkdownMessageProps) {
    // 일부 백엔드가 ATX 헤딩(###제목)에서 공백을 누락한 형태로 반환하는 경우가 있어
    // CommonMark 규칙에 맞도록 최소한의 정규화 작업을 수행한다.
    const normalized = normalizeMarkdown(content);
    return (
        <div
            className={[
                isUser ? styles.userMessage : styles.systemMessage,
                className ?? ''
            ].join(' ').trim()}
        >
            {/* 실제 마크다운 텍스트를 렌더링 */}
            <ReactMarkdown>{normalized}</ReactMarkdown>
        </div>
    );
}

// 간단한 마크다운 정규화 유틸리티
function normalizeMarkdown(src: string): string {
    let s = src;
    // 1) ATX 헤딩: `###제목` → `### 제목` (해시 뒤에 공백 강제)
    s = s.replace(/^(#{1,6})(?=\S)/gm, '$1 ');
    // 2) 헤딩 직후에는 한 줄 공백을 보장하여 파싱 안정화
    s = s.replace(/^(#{1,6} .+)(\r?\n)(?!\r?\n)/gm, '$1$2$2');
    return s;
}
