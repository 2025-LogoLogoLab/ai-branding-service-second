// src/organisms/layout/AppShell/AppShell.tsx
import { Outlet } from "react-router-dom";
import styles from "./AppShell.module.css";
import GlobalHeader from "../GlobalHeader/GlobalHeader";
import GlobalFooter from "../GlobalFooter/GlobalFooter";

/**
 * AppShell
 * - 전역 헤더/푸터를 고정으로 렌더링하고, 가운데에 섹션/페이지를 꽂아 넣는 전역 셸
 * - 모든 페이지는 반드시 이 셸 아래에 중첩 라우팅되도록 구성
 */
export default function AppShell() {
    return (
        <div className={styles.page}>
            {/* 전역 헤더: 모든 페이지 상단에 고정 표시 */}
            <header className={styles.header} aria-label="Global header">
                <div className={styles.headerInner}>
                    <GlobalHeader />
                </div>
            </header>

            {/* 본문: 하위 레이아웃/페이지가 들어올 자리 */}
            <main className={styles.main} aria-label="Content">
                <Outlet />
            </main>

            {/* 전역 푸터: 모든 페이지 하단에 표시 */}
            <footer className={styles.footer} aria-label="Global footer">
                <div className={styles.footerInner}>
                    <GlobalFooter />
                </div>
            </footer>
        </div>
    );
}
