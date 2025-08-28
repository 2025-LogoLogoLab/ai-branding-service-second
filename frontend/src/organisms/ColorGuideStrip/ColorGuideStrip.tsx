// src/components/ColorGuideStrip/ColorGuideStrip.tsx
import React from 'react';
import type { colorGuideGenResponse } from '../../custom_api/colorguide';
import PaletteCard from '../../molecules/PaletteCard/PaletteCard';
import styles from './ColorGuideStrip.module.css';

type Props = {
  guide: colorGuideGenResponse;
  order?: Array<keyof colorGuideGenResponse>; // 표시 순서 커스터마이즈
  labels?: Partial<Record<keyof colorGuideGenResponse, string>>; // 라벨 커스터마이즈
};

const ColorGuideStrip: React.FC<Props> = ({ 
  guide, 
  order = ['main', 'sub', 'point', 'background'], 
  labels 
}) => {
  return (
    <div className={styles.row} role="list">
      {order.map((key) => {
        const palette = guide[key];
        return (
          <div role="listitem" key={key}>
            <PaletteCard
              label={labels?.[key] ?? key}
              palette={palette}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ColorGuideStrip;
