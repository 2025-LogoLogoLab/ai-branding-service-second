// frontend/src/organisms/home/FeatureSplit.tsx
// 텍스트와 시각화 프리뷰를 좌우로 배치하는 기능 섹션 컴포넌트
import styles from "./FeatureSplit.module.css";
import { TextButton } from "../../atoms/TextButton/TextButton";
import PreviewCard from "./PreviewCard";

type FeatureSplitProps = {
  eyebrow?: string;
  title: string;
  description: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  image?: {
    title?: string;
    badge?: string;
    chipLabel?: string;
    accent?: "softBlue" | "softGray";
  };
  imagePosition?: "left" | "right";
};

/**
 * FeatureSplit
 * - 좌/우로 헤더+설명과 시각화(이미지/프리뷰 카드)를 배치하는 섹션
 * - imagePosition으로 순서를 제어하며, 텍스트/CTA/프리뷰 내용을 모두 상위에서 주입받음
 */
export default function FeatureSplit({
  eyebrow,
  title,
  description,
  ctaLabel,
  onCtaClick,
  image,
  imagePosition = "right",
}: FeatureSplitProps) {
  return (
    <section className={styles.split} data-reverse={imagePosition === "left" || undefined}>
      <div className={styles.textCol}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        {ctaLabel && onCtaClick && (
          <TextButton
            label={ctaLabel}
            variant="outlined"
            onClick={onCtaClick}
            className={styles.cta}
          />
        )}
      </div>
      <div className={styles.visualCol} aria-hidden={!image}>
        {image && (
          <PreviewCard
            title={image.title}
            badge={image.badge}
            chipLabel={image.chipLabel}
            accent={image.accent}
          />
        )}
      </div>
    </section>
  );
}
