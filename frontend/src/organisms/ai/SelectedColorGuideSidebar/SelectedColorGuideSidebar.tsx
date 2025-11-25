import styles from './SelectedColorGuideSidebar.module.css';
import PaletteCard from '../../../molecules/PaletteCard/PaletteCard';
import type { colorGuideGenResponse } from '../../../custom_api/colorguide';
import { ProductToolbar } from '../../../molecules/ProductToolbar/ProductToolbar';
import { useSelectionStore } from '../../../context/selectionStore';
import { useCallback, useState } from 'react';

export type SelectedColorGuideSidebarProps = {
  guide: colorGuideGenResponse;
  onDelete?: () => void;
  onSave?: () => void;
  onCopy?: () => void;
};

export default function SelectedColorGuideSidebar({ guide, onDelete, onSave, onCopy }: SelectedColorGuideSidebarProps) {
  const { clearColorGuide } = useSelectionStore();
  const [isCopying, setIsCopying] = useState(false);

  const resolvedDelete = useCallback(() => {
    if (onDelete) {
      onDelete();
      return;
    }
    clearColorGuide();
  }, [onDelete, clearColorGuide]);

  const resolvedSave = useCallback(() => {
    if (onSave) {
      onSave();
      return;
    }
    const blob = new Blob([JSON.stringify(guide, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `color-guide-${Date.now()}.json`;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, [onSave, guide]);

  const resolvedCopy = useCallback(async () => {
    if (onCopy) {
        onCopy();
        return;
    }
    if (typeof navigator === 'undefined' || !navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
        window.alert?.('클립보드 기능을 사용할 수 없습니다.');
        return;
    }
    try {
        setIsCopying(true);
        await navigator.clipboard.writeText(JSON.stringify(guide, null, 2));
    } catch (error) {
        console.error(error);
        window.alert?.('클립보드 복사에 실패했습니다. 브라우저 설정을 확인해주세요.');
    } finally {
        setIsCopying(false);
    }
  }, [onCopy, guide]);
  const entries: Array<{ key: keyof colorGuideGenResponse; label: string }> = [
    { key: 'main', label: 'Main' },
    { key: 'sub', label: 'Sub' },
    { key: 'point', label: 'Point' },
    { key: 'background', label: 'Background' },
  ];

  return (
    <div className={styles.wrap} aria-label="선택된 컬러 가이드">
      <span className={styles.title}>선택된 컬러 가이드</span>
      <div className={styles.box}>
        <div className={styles.gridTwo} role="list">
          {entries.map(({ key, label }) => {
            const palette = guide[key];
            if (!palette) return null;
            return (
              <div key={key} className={styles.cardWrapper} role="listitem">
                <PaletteCard label={label} palette={palette} />
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.toolbarOuter}>
        <ProductToolbar
          id={2}
          onDelete={undefined}  // 삭제 버튼 제거
          onDownload={() => resolvedSave()}
          onCopy={() => resolvedCopy()}
          isCopying={isCopying}
          size={20}
        />
      </div>
    </div>
  );
}
