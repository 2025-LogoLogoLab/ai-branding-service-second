import PaletteCard from '../../../../molecules/PaletteCard/PaletteCard';
import type { colorGuideGenResponse } from '../../../../custom_api/colorguide';
import styles from './DeprecatedPreview.module.css';

/**
 * Deprecated: 4열 균등 분배 테스트 레이아웃
 */
export type FourColumnEqualPreviewProps = {
  guide: colorGuideGenResponse;
  className?: string;
};

export function FourColumnEqualPreview({ guide, className }: FourColumnEqualPreviewProps) {
  const entries: Array<{ key: keyof colorGuideGenResponse; label: string }> = [
    { key: 'main', label: 'Main' },
    { key: 'sub', label: 'Sub' },
    { key: 'point', label: 'Point' },
    { key: 'background', label: 'Background' },
  ];

  return (
    <div className={className} aria-label="colorguide-deprecated-four">
      <div className={styles.rowFourEqual}>
        {entries.map(({ key, label }) => {
          const palette = guide[key];
          if (!palette) return null;
          return (
            <div key={key} className={styles.card}>
              <PaletteCard label={label} palette={palette} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

