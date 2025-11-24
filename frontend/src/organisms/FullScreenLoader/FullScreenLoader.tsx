// src/organisms/FullScreenLoader/FullScreenLoader.tsx
// 로그인/데이터 로딩 시 전체 화면을 덮는 로딩 UI 컴포넌트

import TypingDots from "../../atoms/TypingDots/TypingDots";
import styles from "./FullScreenLoader.module.css";

export type FullScreenLoaderProps = {
    message?: string;
    subtext?: string;
};

export function FullScreenLoader({ message = "로딩 중입니다…", subtext }: FullScreenLoaderProps) {
    return (
        <div className={styles.overlay} role="alert" aria-live="polite">
            <div className={styles.card}>
                <div className={styles.spinner} aria-hidden="true" />
                <div className={styles.texts}>
                    <div className={styles.title}>{message}</div>
                    {subtext && <div className={styles.subtitle}>{subtext}</div>}
                    {!subtext && <TypingDots />}
                </div>
            </div>
        </div>
    );
}

export default FullScreenLoader;
