import styles from './SelectedLogoSidebar.module.css';
import { ImageBase64 } from '../../../atoms/ImageBase64/ImageBase64';
import { ProductToolbar } from '../../../molecules/ProductToolbar/ProductToolbar';
import { useSelectionStore } from '../../../context/selectionStore';
import { useCallback } from 'react';

export type SelectedLogoSidebarProps = {
  base64: string;
  // Optional handlers if parent wants to wire them later
  onDelete?: () => void;
  onSave?: () => void;
};

export default function SelectedLogoSidebar({ base64, onDelete, onSave }: SelectedLogoSidebarProps) {
  const { clearLogo } = useSelectionStore();

  const resolvedDelete = useCallback(() => {
    if (onDelete) {
      onDelete();
      return;
    }
    clearLogo();
  }, [onDelete, clearLogo]);

  const resolvedSave = useCallback(() => {
    if (onSave) {
      onSave();
      return;
    }
    const url = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `selected-logo-${Date.now()}.png`;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }, [onSave, base64]);

  return (
    <div className={styles.wrap} aria-label="선택된 로고">
      <span className={styles.title}>선택된 로고</span>
      <div className={styles.imageBox}>
        <ImageBase64 imageData={base64} alt="선택된 로고" variant="logoImage" />
      </div>
      <div className={styles.toolbarOuter}>
        <ProductToolbar
          id={0}
          onDelete={() => resolvedDelete()}
          onSave={() => resolvedSave()}
          size={20}
        />
      </div>
    </div>
  );
}
