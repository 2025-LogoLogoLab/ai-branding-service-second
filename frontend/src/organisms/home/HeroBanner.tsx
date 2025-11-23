// frontend/src/organisms/home/HeroBanner.tsx
// 홈 히어로 영역을 렌더링하는 배너 컴포넌트
import type { ReactNode } from "react";
import styles from "./HeroBanner.module.css";
import { TextButton } from "../../atoms/TextButton/TextButton";

export type HeroAction = {
  label: string;
  onClick?: () => void;
};

type HeroBannerProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  helperText?: string;
  primaryAction?: HeroAction;
  secondaryAction?: HeroAction;
  footnote?: ReactNode;
};

/**
 * HeroBanner
 * - 대형 히어로 영역: 헤더/설명/CTA/보조 안내를 상위에서 주입된 데이터로 렌더링
 * - 재사용을 위해 텍스트/액션을 모두 props로 받고, 스타일만 이 컴포넌트가 책임짐
 */
export default function HeroBanner({
  eyebrow,
  title,
  description,
  helperText,
  primaryAction,
  secondaryAction,
  footnote,
}: HeroBannerProps) {
  return (
    <section className={styles.wrap}>
      <div className={styles.inner}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
        <div className={styles.actions}>
          {primaryAction?.onClick && (
            <TextButton
              label={primaryAction.label}
              variant="blue"
              onClick={primaryAction.onClick}
              className={styles.primary}
            />
          )}
          {secondaryAction?.onClick && (
            <button
              type="button"
              className={styles.secondary}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
        {helperText && <p className={styles.helper}>{helperText}</p>}
      </div>
      {footnote && <div className={styles.footnote}>{footnote}</div>}
    </section>
  );
}
