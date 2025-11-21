// src/organisms/layout/GlobalHeader/GlobalHeader.tsx
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import styles from "./GlobalHeader.module.css";
import brandImage from "../../../assets/designs/LogoLogoLabHeader.png";
import { useAuth } from "../../../context/AuthContext";
import { TextButton } from "../../../atoms/TextButton/TextButton";

/**
 * GlobalHeader
 * - 앱 전역 상단 헤더 컴포넌트
 * - 좌측 브랜드, 중앙 네비게이션, 우측 인증 버튼 영역으로 구성
 * - 라우팅은 react-router-dom의 Link를 사용하며, 실제 드롭다운 등 인터랙션은 추후 확장
 */
export default function GlobalHeader() {
  // 드롭다운 및 모바일 메뉴 상태
  const [mobileOpen, setMobileOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const featuresRef = useRef<HTMLDivElement | null>(null);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (featuresRef.current && !featuresRef.current.contains(e.target as Node)) {
        setFeaturesOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // 라우팅 시 자동 닫히도록 history 변경 감지(간단: 클릭 시 닫기)
  const closeAll = () => {
    setFeaturesOpen(false);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    try {
      closeAll();
      await logout();
      navigate("/");
    } catch (err) {
      console.error("로그아웃 실패", err);
    }
  };

  const handleNavigate = (path: string) => {
    closeAll();
    navigate(path);
  };

  return (
    <div className={styles.bar} role="banner">
      {/* 좌측: 브랜드 로고/텍스트 */}
      <div className={styles.brandArea}>
        <button
          className={styles.menuToggler}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(v => !v)}
        >
          {/* 햄버거 아이콘(순수 CSS) */}
          <span/>
          <span/>
          <span/>
        </button>
        <Link to="/" className={styles.brand} aria-label="LogoLogoLab home" onClick={closeAll}>
          <img src={brandImage} alt="LogoLogoLab" className={styles.brandImage} />
        </Link>
      </div>

      {/* 중앙: 기본 내비게이션 */}
      <nav className={styles.navWrap} aria-label="Primary">
        <div className={styles.nav} data-open={mobileOpen || undefined}>
          {/* Features 드롭다운 - 클릭 토글 방식으로 사용자가 여유 있게 이동 가능 */}
          <div
            className={styles.dropdown}
            ref={featuresRef}
          >
            <button
              className={styles.navItem}
              aria-haspopup="menu"
              aria-expanded={featuresOpen}
              onClick={() => setFeaturesOpen(v => !v)}
            >
              Features ▾
            </button>
            {featuresOpen && (
              <div className={styles.dropdownPanel} role="menu">
                <Link to="/logo" role="menuitem" className={styles.dropdownItem} onClick={closeAll}>Logo Generator</Link>
                <Link to="/branding" role="menuitem" className={styles.dropdownItem} onClick={closeAll}>Branding</Link>
                <Link to="/colorGuide" role="menuitem" className={styles.dropdownItem} onClick={closeAll}>Color Guide</Link>
              </div>
            )}
          </div>

        </div>
      </nav>

      {/* 우측: 액션/인증 영역 */}
      <div className={styles.authArea}>
        {user ? (
          <>
            <TextButton
              label="Log out"
              variant="headerLink"
              onClick={handleLogout}
            />
            <TextButton
              label="My Page"
              variant="headerPrimary"
              onClick={() => handleNavigate("/myPage")}
            />
          </>
        ) : (
          <>
            <TextButton
              label="Log in"
              variant="headerLink"
              onClick={() => handleNavigate("/login")}
            />
            <TextButton
              label="Try it Free"
              variant="headerPrimary"
              onClick={() => handleNavigate("/logo")}
            />
          </>
        )}
      </div>
    </div>
  );
}
