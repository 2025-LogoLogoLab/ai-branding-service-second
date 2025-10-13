import styles from './SelectedBrandingSidebar.module.css';
import { MarkdownMessage } from '../../../atoms/MarkdownMessage/MarkdownMessage';
import { ProductToolbar } from '../../../molecules/ProductToolbar/ProductToolbar';
import { useSelectionStore } from '../../../context/selectionStore';
import { useCallback } from 'react';

export type SelectedBrandingSidebarProps = {
  markdown: string;
  onDelete?: () => void;
  onSave?: () => void;
};

export default function SelectedBrandingSidebar({ markdown, onDelete, onSave }: SelectedBrandingSidebarProps) {
  const { clearBranding } = useSelectionStore();

  const resolvedDelete = useCallback(() => {
    if (onDelete) {
      onDelete();
      return;
    }
    clearBranding();
  }, [onDelete, clearBranding]);

  const resolvedSave = useCallback(() => {
    if (onSave) {
      onSave();
      return;
    }
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `branding-strategy-${Date.now()}.md`;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, [onSave, markdown]);

  return (
    <div className={styles.wrap} aria-label="선택된 브랜딩 전략">
      <span className={styles.title}>선택된 브랜딩 전략</span>
      <div className={styles.box}>
        <MarkdownMessage content={markdown} variant="compact" />
      </div>
      <div className={styles.toolbarOuter}>
        <ProductToolbar
          id={1}
          onDelete={() => resolvedDelete()}
          onSave={() => resolvedSave()}
          size={20}
        />
      </div>
    </div>
  );
}
