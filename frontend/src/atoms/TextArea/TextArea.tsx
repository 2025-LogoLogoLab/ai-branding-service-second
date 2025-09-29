import React, { useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import styles from "./TextArea.module.css";

export type TextAreaProps = {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    name?: string;
    id?: string;
    disabled?: boolean;
    onSubmit?: () => void; // Enter 단독 입력 시 호출될 콜백 함수
};

/**
 * 자동 높이 조절 + Enter 전송 기능을 포함한 TextArea 컴포넌트
 * - ChatGPT 스타일: 입력이 늘면 영역이 아래로 계속 커짐(내부 스크롤바 없음)
 */
export function TextArea({
    value,
    onChange,
    placeholder = "",
    name,
    id,
    disabled = false,
    onSubmit
}: TextAreaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // value가 바뀔 때마다 내용 높이에 맞춰 자동 리사이즈
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;

        // 레이아웃 계산 전 높이를 초기화 → 실제 scrollHeight 측정
        requestAnimationFrame(() => {
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`; // ✅ 제한 없이 커짐
        });
    }, [value]);

    // Enter(단독) 제출, Shift+Enter 줄바꿈
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (disabled) return;
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit?.();
        }
    };

    return (
        <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            name={name}
            id={id}
            disabled={disabled}
            rows={1}
            aria-disabled={disabled}
            aria-label={placeholder || "입력"}
        />
    );
}
