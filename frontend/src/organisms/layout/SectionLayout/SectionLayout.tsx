import React from "react";
import { useLocation } from "react-router-dom";
import styles from "./SectionLayout.module.css";

/**
 * SectionLayout
 * - 좌측: 섹션 전용 사이드바(섹션마다 다름)
 * - 우측: 섹션의 실제 페이지 콘텐츠(children)
 * - 헤더/푸터는 전역(AppShell 등)에서 담당한다고 가정
 *
 */
export type SectionLayoutProps = {
    sidebar: React.ReactNode;       // 좌측 사이드바 컴포넌트
    children: React.ReactNode;      // 우측 콘텐츠(해당 페이지)
    maxWidth?: number;              // 컨테이너 최대 폭 (기본 1200)
};

export default function SectionLayout({
    sidebar,
    children,
    maxWidth = 1200
}: SectionLayoutProps) {
    const location = useLocation();
    const hasSelectedLogo = Boolean((location.state as any)?.selectedLogoBase64);
    return (
        <div
            className={styles.wrap}
            style={{ ["--mw" as any]: `${maxWidth}px` }}
        >
            <div className={styles.container}>
                <aside
                    className={styles.sidebar}
                    aria-label="Section sidebar"
                    style={
                        hasSelectedLogo ? { width: "fit-content" } : undefined
                    }
                >
                    {sidebar}
                </aside>

                <section className={styles.content} aria-label="Section content">
                    {children}
                </section>
            </div>
        </div>
    );
}
