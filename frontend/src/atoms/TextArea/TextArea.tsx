// src/atoms/TextArea/TextArea.tsx
import React, { useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import styles from './TextArea.module.css';

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
 * - ChatGPT 스타일 입력창처럼 작동
 * - 키보드 입력 이벤트와 textarea 높이 조절 모두 처리
 */
export function TextArea({
    value,
    onChange,
    placeholder = '',
    name,
    id,
    disabled = false,
    onSubmit,
}: TextAreaProps) {
    // DOM에 직접 접근하기 위한 ref 설정
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    /**
     * 자동 높이 조절 로직 (value가 변경될 때마다 실행)
     * - textarea의 scrollHeight를 기준으로 높이를 늘림
     * - `requestAnimationFrame()`을 사용해 브라우저 페인팅 타이밍에 맞춰 안전하게 높이 변경
     *   → 높이 깜빡임이나 누락 방지
     */
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        requestAnimationFrame(() => {
            textarea.style.height = 'auto'; // 높이 초기화
            textarea.style.height = `${textarea.scrollHeight}px`; // scrollHeight에 맞게 자동 확장
        });
    }, [value]); // value가 바뀔 때마다 실행됨 (입력 변화, props 변화 포함)

    /**
     * 키보드 입력 처리
     * - Shift+Enter: 줄바꿈 허용 (기본 동작 유지)
     * - Enter 단독: 제출 (onSubmit 호출)
     * - disabled 상태일 경우 아무 동작도 하지 않음 (방어 처리)
     */
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (disabled) return; // 비활성 상태에서는 아무 동작도 하지 않음

        // 단독 Enter 입력 (줄바꿈 아님)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // 기본 줄바꿈 동작 차단
            if (onSubmit) onSubmit(); // 제출 핸들러 호출
        }
        // Shift + Enter는 줄바꿈이므로 따로 처리하지 않고 기본 동작 유지
    };

    return (
        <textarea
            ref={textareaRef}             // DOM에 직접 접근할 수 있도록 ref 연결
            className={styles.textarea}  // 외부 스타일 클래스 적용
            value={value}                // 현재 입력된 값
            onChange={onChange}          // 입력 변경 이벤트 핸들러
            onKeyDown={handleKeyDown}    // 키보드 이벤트 핸들러 (Enter 제출)
            placeholder={placeholder}
            name={name}
            id={id}
            disabled={disabled}
            rows={1}                     // 기본 1줄부터 시작 (자동 확장)
        />
    );
}
