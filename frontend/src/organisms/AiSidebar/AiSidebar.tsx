import { NavLink } from "react-router-dom";
import styles from "./AiSidebar.module.css";

/**
 * AI 스튜디오 공용 사이드바
 * - 좌측 고정 사이드바에서 3가지 모드(로고 / 브랜딩 전략 / 컬러 가이드)를 전환
 * - 아이콘은 프로젝트 제공 PNG를 사용 (src/assets/icons)
 * - 라우팅: React Router NavLink 의 isActive 로 활성 상태 스타일링
 */

// ⚠️ 경로 주의: 현재 파일 위치가 src/organisms/ai/AiSidebar 일 때, assets 는 ../../../assets
import iconLogo from "../../../assets/icons/icon_logo_generation.png";
import iconStrategy from "../../../assets/icons/icon_strategy.png";
import iconColor from "../../../assets/icons/icon_color_guide.png";

export default function AiSidebar() {
    return (
        <nav className={styles.sidebar} aria-label="AI studio navigation">
            <ul className={styles.list} role="list">
                {/* AI 로고 생성 */}
                <li>
                    <NavLink
                        to="/app/ai/logo"
                        className={({ isActive }) =>
                            `${styles.item} ${isActive ? styles.active : ""}`
                        }
                        aria-label="AI 로고 생성"
                    >
                        <img className={styles.icon} src={iconLogo} alt="" aria-hidden="true" />
                        <span className={styles.label}>AI 로고 생성</span>
                    </NavLink>
                </li>

                {/* 브랜딩 전략 생성 */}
                <li>
                    <NavLink
                        to="/app/ai/branding"
                        className={({ isActive }) =>
                            `${styles.item} ${isActive ? styles.active : ""}`
                        }
                        aria-label="브랜딩 전략 생성"
                    >
                        <img className={styles.icon} src={iconStrategy} alt="" aria-hidden="true" />
                        <span className={styles.label}>브랜딩 전략 생성</span>
                    </NavLink>
                </li>

                {/* 컬러가이드 생성 */}
                <li>
                    <NavLink
                        to="/app/ai/colors"
                        className={({ isActive }) =>
                            `${styles.item} ${isActive ? styles.active : ""}`
                        }
                        aria-label="컬러가이드 생성"
                    >
                        <img className={styles.icon} src={iconColor} alt="" aria-hidden="true" />
                        <span className={styles.label}>컬러가이드 생성</span>
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
}
