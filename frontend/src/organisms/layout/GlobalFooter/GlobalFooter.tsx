// src/organisms/layout/GlobalFooter/GlobalFooter.tsx
import { Link } from "react-router-dom";
import styles from "./GlobalFooter.module.css";

/**
 * GlobalFooter
 * - 앱 전역 하단 푸터 컴포넌트
 * - 좌측 브랜드 및 간단 소개, 우측 여러 컬럼의 퀵 링크 섹션
 * - 실제 링크 URL은 추후 정책/페이지에 맞게 연결
 */
export default function GlobalFooter() {
  return (
    <div className={styles.wrap} role="contentinfo">
      <div className={styles.topRow}>
        <div className={styles.brandCol}>
          <Link to="/" className={styles.brand} aria-label="LogoLogoLab home">
            <span className={styles.spark}>✷</span>
            <span className={styles.brandText}>LogoLogoLab</span>
          </Link>
          <div className={styles.socials}>
            {/* 실제 아이콘 자산이 생기면 교체 */}
            <a href="#" aria-label="Instagram">Instagram</a>
            <a href="#" aria-label="Twitter">Twitter</a>
            <a href="#" aria-label="LinkedIn">LinkedIn</a>
          </div>
        </div>

        <div className={styles.linksGrid}>
          <div>
            <div className={styles.head}>Company</div>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Press</a>
          </div>
          <div>
            <div className={styles.head}>Resources</div>
            <a href="#">Blog</a>
            <a href="#">Help Center</a>
            <a href="#">Contact Support</a>
          </div>
            <div>
              <div className={styles.head}>Legal</div>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
            <div>
              <div className={styles.head}>Follow Us</div>
              <a href="#">Instagram</a>
              <a href="#">Twitter</a>
              <a href="#">LinkedIn</a>
            </div>
        </div>
      </div>
      <div className={styles.bottomRow}>
        <small>© {new Date().getFullYear()} LogoLogoLab. All rights reserved.</small>
      </div>
    </div>
  );
}

