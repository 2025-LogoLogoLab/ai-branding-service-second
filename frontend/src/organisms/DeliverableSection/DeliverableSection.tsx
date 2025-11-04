// src/organisms/DeliverableSection/DeliverableSection.tsx
// 산출물 관리 페이지에서 각 카테고리 영역을 감싸는 공용 섹션 컴포넌트
// - 타이틀 / 부가설명 / 카드 그리드 / 하단 슬롯(페이지네이션 등)을 지원한다.

import styles from "./DeliverableSection.module.css";
import type { ReactNode } from "react";

export type DeliverableSectionProps = {
    title: string;                 // 섹션 제목
    description?: string;          // 부제나 안내 문구
    children: ReactNode;           // 카드 목록 등 실제 콘텐츠
    footer?: ReactNode;            // 페이지네이션 등 하단에 추가할 요소
    variant?: "default" | "blueprint";
};

export default function DeliverableSection({
    title,
    description,
    children,
    footer,
    variant = "default",
}: DeliverableSectionProps) {
    const headingId = `${title.replace(/\s+/g, "-").toLowerCase()}-heading`;
    const isBlueprint = variant === "blueprint";

    return (
        <section
            className={[
                styles.section,
                isBlueprint ? styles.sectionBlueprint : "",
            ].join(" ").trim()}
            aria-labelledby={headingId}
        >
            <header className={styles.header}>
                <div className={styles.titleBar}>
                    <span
                        className={[
                            styles.accent,
                            isBlueprint ? styles.accentBlueprint : "",
                        ].join(" ").trim()}
                        aria-hidden="true"
                    />
                    <h3
                        className={[
                            styles.title,
                            isBlueprint ? styles.titleBlueprint : "",
                        ].join(" ").trim()}
                        id={headingId}
                    >
                        {title}
                    </h3>
                </div>
                {description && (
                    <p
                        className={[
                            styles.description,
                            isBlueprint ? styles.descriptionBlueprint : "",
                        ].join(" ").trim()}
                    >
                        {description}
                    </p>
                )}
            </header>

            <div className={styles.content}>{children}</div>

            {footer && <div className={styles.footer}>{footer}</div>}
        </section>
    );
}
