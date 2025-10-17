// src/atoms/TextButton/TextButton.tsx
import styles from "./TextButton.module.css";

export type ButtonProps = {
    label: string;                         // 버튼 내용
    onClick: () => void;                   // 클릭 핸들러
    variant?: "white" | "orange" | "outlined" | "card" | "blue" | "headerLink" | "headerPrimary";
    disabled?: boolean;                    // 비활성화 여부
    type?: "button" | "submit" | "reset";  // 버튼 타입
};

export function TextButton({
    label,
    onClick,
    variant = "white",
    disabled = false,
    type = "button"
}: ButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`${styles.base} ${styles[variant]} ${disabled ? styles.disabled : ""}`}
            disabled={disabled}
            aria-disabled={disabled}
        >
            {label}
        </button>
    );
}
