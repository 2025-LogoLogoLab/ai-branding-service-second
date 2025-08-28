// src/atoms/MarkdownMessage/MarkdownMessage.tsx
import ReactMarkdown from 'react-markdown';
import styles from './MarkdownMessage.module.css';

export type MarkdownMessageProps = {
    content: string;         // 마크다운으로 구성된 응답 텍스트
    isUser?: boolean;        // 사용자 메시지 여부 (기본값: false → 시스템 응답)
};

export function MarkdownMessage({
    content,
    isUser = false,
}: MarkdownMessageProps) {
    return (
        <div
            className={ // 유저가 작성한 내용인지, 서버 응답인지 따라 스타일 변경
                isUser ? styles.userMessage : styles.systemMessage
            }
        >
            {/* 실제 마크다운 텍스트를 렌더링 */}
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    );
}
