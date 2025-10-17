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
import SelectedLogoSidebar from "../SelectedLogoSidebar/SelectedLogoSidebar";
import SelectedBrandingSidebar from "../SelectedBrandingSidebar/SelectedBrandingSidebar";
import SelectedColorGuideSidebar from "../SelectedColorGuideSidebar/SelectedColorGuideSidebar";
import { useSelectionStore } from "../../../context/selectionStore";

export default function AiSidebar() {
    const { state } = useSelectionStore();
    const selectedLogoBase64 = state.logoBase64;
    const selectedBrandingMarkdown = state.brandingMarkdown;
    const selectedColorGuide = state.colorGuide;

    // 현재 페이지가 '/logo' 인지 여부 (→ 컴팩트 모드 전환 트리거)
    const logoPageActive = Boolean(useMatch("/logo"));
    const promoteLogo = !logoPageActive;

    const sidebarClass = `${styles.sidebar} ${selectedLogoBase64 ? styles.compact : (logoPageActive ? styles.compact : "")}`;
    const iconsNav = (
        <nav
            className={sidebarClass}
            aria-label="AI studio navigation"
        >
            <ul className={styles.list} role="list">
                <li>
                    <NavLink
                        to="/logo"
                        className={({ isActive }) =>
                            [styles.item, isActive ? styles.active : "", promoteLogo ? styles.promote : ""].join(" ").trim()
                        }
                        aria-label="AI 로고 생성"
                    >
                        <img className={styles.icon} src={iconLogo} alt="" aria-hidden="true" />
                        <span className={styles.label}>AI 로고 생성</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/branding"
                        className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ""}`}
                        aria-label="브랜딩 전략 생성"
                    >
                        <img className={styles.icon} src={iconStrategy} alt="" aria-hidden="true" />
                        <span className={styles.label}>브랜딩 전략 생성</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/colorGuide"
                        className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ""}`}
                        aria-label="컬러가이드 생성"
                    >
                        <img className={styles.icon} src={iconColor} alt="" aria-hidden="true" />
                        <span className={styles.label}>컬러가이드 생성</span>
                    </NavLink>
                </li>
            </ul>
        </nav>
    );

    if (selectedLogoBase64 || selectedBrandingMarkdown || selectedColorGuide) {
        // 선택된 로고가 있으면 왼쪽 작은 툴바 + 큰 프리뷰 조합으로 노출
        return (
            <div className={styles.withSelected}>
                {iconsNav}
                <div style={{ display: 'grid', gap: 16, 
                    // position: "sticky", 
                    // top: 64 
                    }}>
                    {selectedLogoBase64 && <SelectedLogoSidebar base64={selectedLogoBase64} />}
                    {selectedBrandingMarkdown && (
                        <SelectedBrandingSidebar markdown={selectedBrandingMarkdown} />
                    )}
                    {selectedColorGuide && (
                        <SelectedColorGuideSidebar guide={selectedColorGuide} />
                    )}
                </div>
            </div>
        );
    }

    // 선택된 로고가 없으면 기존 사이드바(상태에 따라 컴팩트 적용)
    return iconsNav;
}
