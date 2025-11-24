// frontend/src/organisms/home/ContentStrip.tsx
// 좌측 헤더·우측 본문으로 구성된 간단 정보 섹션 컴포넌트
import styles from "./ContentStrip.module.css";
import { TextButton } from "../../atoms/TextButton/TextButton";

type ContentStripProps = {
  eyebrow?: string;
  title: string;
  description: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  align?: "left" | "center" | "right";
};

/**
 * ContentStrip
 * - 좌측 헤더/우측 본문으로 나뉜 단순 정보 섹션
 * - 텍스트와 CTA를 상위에서 주입받아 여러 번 재사용 가능
 */
export default function ContentStrip({
  eyebrow,
  title,
  description,
  ctaLabel,
  onCtaClick,
  align = "left",
}: ContentStripProps) {
  return (
    <section className={styles.strip} data-align={align}>
      <div className={styles.header}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h2 className={styles.title}>{title}</h2>
      </div>
      <div className={styles.body}>
        <p className={styles.description}>{description}</p>
        {ctaLabel && onCtaClick && (
          <TextButton
            label={ctaLabel}
            variant="blue"
            onClick={onCtaClick}
            className={styles.cta}
          />
        )}
      </div>
    </section>
  );
}
