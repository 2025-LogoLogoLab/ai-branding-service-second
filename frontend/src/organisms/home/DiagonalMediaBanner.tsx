// frontend/src/organisms/home/DiagonalMediaBanner.tsx
// 사선 패턴 배경 위에 텍스트와 미디어 슬롯을 배치하는 배너 컴포넌트
import type { ReactNode } from "react";
import styles from "./DiagonalMediaBanner.module.css";
import { TextButton } from "../../atoms/TextButton/TextButton";

type DiagonalMediaBannerProps = {
  title: string;
  description?: string;
  overlayText?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  mediaSlot?: ReactNode;
  muted?: boolean;
};

/**
 * DiagonalMediaBanner
 * - 사선 패턴 배경 위에 텍스트/CTA와 임베드 영역을 제공하는 배너
 * - 실제 미디어가 없으면 overlayText만 출력하도록 구성
 */
export default function DiagonalMediaBanner({
  title,
  description,
  overlayText,
  ctaLabel,
  onCtaClick,
  mediaSlot,
  muted = false,
}: DiagonalMediaBannerProps) {
  return (
    <section className={styles.banner} data-muted={muted || undefined}>
      <div className={styles.inner}>
        <div className={styles.textCol}>
          <h3 className={styles.title}>{title}</h3>
          {description && <p className={styles.description}>{description}</p>}
          {ctaLabel && onCtaClick && (
            <TextButton
              label={ctaLabel}
              variant="outlined"
              onClick={onCtaClick}
              className={styles.cta}
            />
          )}
        </div>
        <div className={styles.mediaCol}>
          <div className={styles.media}>
            {mediaSlot ?? <span className={styles.overlay}>{overlayText}</span>}
          </div>
        </div>
      </div>
    </section>
  );
}
