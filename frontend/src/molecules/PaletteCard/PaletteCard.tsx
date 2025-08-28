// src/molecules/PaletteCard/PaletteCard.tsx
import React from 'react';
import type { palette } from '../../custom_api/colorguide';
import { getContrastText, isValidHex, normalizeHex } from '../../utils/color';
import styles from './PaletteCard.module.css';

type PaletteCardProps = {
  label: string;     // 'main' | 'sub' | 'point' | 'background' 등 표시용
  palette: palette;
};

const PaletteCard: React.FC<PaletteCardProps> = React.memo(({ label, palette }) => {
  const valid = isValidHex(palette.hex);
  const hex = normalizeHex(palette.hex);
  const textColor = getContrastText(hex);

  return (
    <div className={styles.card} aria-label={`${label} color`}>
      <div
        className={`${styles.swatch} ${!valid ? styles.invalid : ''}`}
        style={{ backgroundColor: valid ? hex : '#FFFFFF', color: textColor }}
        role="img"
        aria-label={`${label} swatch ${hex}`}
        title={valid ? hex : `Invalid HEX: ${palette.hex}`}
      >
        {/* HEX 표시 */}
        <span className={styles.hex}>{hex}</span>
      </div>

      <div className={styles.meta}>
        <div className={styles.label}>{label}</div>
        <p className={styles.desc}>{palette.description}</p>
      </div>
    </div>
  );
});

export default PaletteCard;
