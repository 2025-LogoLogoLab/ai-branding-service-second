import { NavLink, useMatch } from "react-router-dom";
import styles from "./AiSidebar.module.css";

/**
 * AI 스튜디오 공용 사이드바
 * - 기본 상태(로고 페이지 외): 'AI 로고 생성' 항목만 10% 크게(유도 목적)
 * - 로고 페이지 활성 시(/logo): 3개 항목 크기 동일 + 텍스트 숨김(아이콘만) + 사이드바 폭 축소
 *
 * 라우팅:
 * - BrowserRouter basename("/app") 환경에서 useMatch("/logo")는 정상 동작
 * - NavLink는 isActive로 각 항목의 활성 스타일 처리
 */

// ⚠️ 경로 주의: 이 파일이 src/organisms/ai/AiSidebar/AiSidebar.tsx 라면 assets 는 ../../../assets
import iconLogo from "../../../assets/icons/icon_logo_generation.png";
import iconStrategy from "../../../assets/icons/icon_strategy.png";
import iconColor from "../../../assets/icons/icon_color_guide.png";

export default function AiSidebar() {
    // 현재 페이지가 '/logo' 인지 여부 (→ 컴팩트 모드 전환 트리거)
    const logoPageActive = Boolean(useMatch("/logo"));

    // 컴팩트 모드가 아니면(=로고 페이지가 아니면) 로고 항목만 10% Promote
    const promoteLogo = !logoPageActive;

    return (
        <nav
            className={`${styles.sidebar} ${logoPageActive ? styles.compact : ""}`}
            aria-label="AI studio navigation"
        >
            <ul className={styles.list} role="list">
                {/* AI 로고 생성 */}
                <li>
                    <NavLink
                        to="/logo"
                        className={({ isActive }) =>
                            [
                                styles.item,
                                isActive ? styles.active : "",
                                promoteLogo ? styles.promote : "" // 사용자 유인을 위해 로고 생성 메뉴만 확대
                            ].join(" ").trim()
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
                        to="/branding"
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
                        to="/colorGuide"
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
