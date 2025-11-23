// frontend/src/organisms/home/PreviewCard.tsx
// 스크린샷 없이 UI 느낌을 보여주는 프리뷰 카드 컴포넌트
import styles from "./PreviewCard.module.css";

type PreviewCardProps = {
  title?: string;
  badge?: string;
  chipLabel?: string;
  accent?: "softBlue" | "softGray";
};

/**
 * PreviewCard
 * - 실제 이미지가 없어도 UI 느낌을 전달하는 가짜 카드
 * - 색상/텍스트를 상위에서 주입받아 FeatureSplit에서 재사용
 */
export default function PreviewCard({
  title,
  badge,
  chipLabel,
  accent = "softBlue",
}: PreviewCardProps) {
  return (
    <div className={styles.card} data-accent={accent}>
      <div className={styles.header}>
        {badge && <span className={styles.badge}>{badge}</span>}
        {title && <span className={styles.title}>{title}</span>}
      </div>
      <div className={styles.surface}>
        <div className={styles.block} />
        <div className={styles.row}>
          {chipLabel && <span className={styles.chip}>{chipLabel}</span>}
          <span className={styles.muted} />
        </div>
      </div>
    </div>
  );
}
