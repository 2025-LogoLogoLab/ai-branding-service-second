// src/organisms/layout/GlobalFooter/GlobalFooter.tsx
import { Link } from "react-router-dom";
import type { MouseEvent } from "react";
import styles from "./GlobalFooter.module.css";
import brandImage from "../../../assets/designs/LogoLogoLabHeader.png";
import facebookIcon from "../../../assets/icons/icon_Facebook.png";
import instagramIcon from "../../../assets/icons/icon_Instagram.png";
import twitterIcon from "../../../assets/icons/icon_Twitter.png";

/**
 * GlobalFooter
 * - 앱 전역 하단 푸터 컴포넌트
 * - 좌측 브랜드 및 간단 소개, 우측 여러 컬럼의 퀵 링크 섹션
 * - 실제 링크 URL은 추후 정책/페이지에 맞게 연결
 */
export default function GlobalFooter() {
  const handleNotImplemented = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    alert("아직 구현되지 않은 기능입니다.");
  };

  return (
    <div className={styles.wrap} role="contentinfo">
      <div className={styles.topRow}>
        <div className={styles.brandCol}>
          <Link
            to="/"
            className={styles.brand}
            aria-label="LogoLogoLab home"
            onClick={handleNotImplemented}
          >
            <img src={brandImage} alt="LogoLogoLab" className={styles.brandImage} />
          </Link>
          <div className={styles.socials}>
            <a href="#" aria-label="Facebook" className={styles.socialLink} onClick={handleNotImplemented}>
              <img src={facebookIcon} alt="" className={styles.socialIcon} />
            </a>
            <a href="#" aria-label="Instagram" className={styles.socialLink} onClick={handleNotImplemented}>
              <img src={instagramIcon} alt="" className={styles.socialIcon} />
            </a>
            <a href="#" aria-label="Twitter" className={styles.socialLink} onClick={handleNotImplemented}>
              <img src={twitterIcon} alt="" className={styles.socialIcon} />
            </a>
          </div>
        </div>

        <div className={styles.linksGrid}>
          <div>
            <div className={styles.head}>Company</div>
            <a href="#" onClick={handleNotImplemented}>About Us</a>
            <a href="#" onClick={handleNotImplemented}>Careers</a>
            <a href="#" onClick={handleNotImplemented}>Press</a>
          </div>
          <div>
            <div className={styles.head}>Resources</div>
            <a href="#" onClick={handleNotImplemented}>Blog</a>
            <a href="#" onClick={handleNotImplemented}>Help Center</a>
            <a href="#" onClick={handleNotImplemented}>Contact Support</a>
          </div>
            <div>
              <div className={styles.head}>Legal</div>
              <a href="#" onClick={handleNotImplemented}>Privacy Policy</a>
              <a href="#" onClick={handleNotImplemented}>Terms of Service</a>
            </div>
            <div>
              <div className={styles.head}>Follow Us</div>
              <a href="#" onClick={handleNotImplemented}>Instagram</a>
              <a href="#" onClick={handleNotImplemented}>Twitter</a>
              <a href="#" onClick={handleNotImplemented}>LinkedIn</a>
            </div>
        </div>
      </div>
      <div className={styles.bottomRow}>
        <small>© {new Date().getFullYear()} LogoLogoLab. All rights reserved.</small>
      </div>
    </div>
  );
}

