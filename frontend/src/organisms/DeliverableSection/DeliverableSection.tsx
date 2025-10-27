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
};

export default function DeliverableSection({
    title,
    description,
    children,
    footer,
}: DeliverableSectionProps) {
    const headingId = `${title.replace(/\s+/g, "-").toLowerCase()}-heading`;

    return (
        <section className={styles.section} aria-labelledby={headingId}>
            <header className={styles.header}>
                <div className={styles.titleBar}>
                    <span className={styles.accent} aria-hidden="true" />
                    <h3 className={styles.title} id={headingId}>
                        {title}
                    </h3>
                </div>
                {description && <p className={styles.description}>{description}</p>}
            </header>

            <div className={styles.content}>{children}</div>

            {footer && <div className={styles.footer}>{footer}</div>}
        </section>
    );
}
