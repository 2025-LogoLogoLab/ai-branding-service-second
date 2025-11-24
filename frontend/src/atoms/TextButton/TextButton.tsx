// src/atoms/TextButton/TextButton.tsx
// frontend/src/atoms/TextButton/TextButton.tsx
// 버튼 스타일 변형을 제공하는 텍스트 버튼 아톰
import type React from "react";
import styles from "./TextButton.module.css";

export type ButtonProps = {
    label: string;                         // 버튼 내용
    onClick: (event?: React.MouseEvent<HTMLButtonElement>) => void; // 클릭 핸들러
    variant?: "white" | "orange" | "outlined" | "card" | "blue" | "headerLink" | "headerPrimary";
    disabled?: boolean;                    // 비활성화 여부
    type?: "button" | "submit" | "reset";  // 버튼 타입
    className?: string;                    // 추가 커스텀 스타일
};

export function TextButton({
    label,
    onClick,
    variant = "white",
    disabled = false,
    type = "button",
    className,
}: ButtonProps) {
    const classes = [
        styles.base,
        styles[variant],
        disabled ? styles.disabled : "",
        className ?? "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            type={type}
            onClick={(event) => onClick?.(event)}
            className={classes}
            disabled={disabled}
            aria-disabled={disabled}
        >
            {label}
        </button>
    );
}
