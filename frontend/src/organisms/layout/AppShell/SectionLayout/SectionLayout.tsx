// src/organisms/layout/SectionLayout/SectionLayout.tsx
import { Outlet } from "react-router-dom";
import styles from "./SectionLayout.module.css";

export type SectionLayoutProps = {
    /** 섹션 전용 좌측 사이드바(섹션마다 다른 컴포넌트) */
    sidebar: React.ReactNode;
    /** 선택: 본문 최대 폭(1200px 등). 기본은 1200px */
    maxWidth?: number;
};

/**
 * SectionLayout
 * - 좌측: 섹션 전용 사이드바
 * - 우측: 섹션 내부 페이지(Outlet)
 * - 헤더/푸터는 AppShell이 담당
 */
export default function SectionLayout({ sidebar, maxWidth = 1200 }: SectionLayoutProps) {
    return (
        <div className={styles.wrap} style={{ ["--mw" as any]: `${maxWidth}px` }}>
            <div className={styles.container}>
                <aside className={styles.sidebar} aria-label="Section sidebar">
                    {sidebar}
                </aside>

                <section className={styles.content} aria-label="Section content">
                    <Outlet />
                </section>
            </div>
        </div>
    );
}
