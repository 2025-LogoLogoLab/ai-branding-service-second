import styles from './SelectedBrandingSidebar.module.css';
import { MarkdownMessage } from '../../../atoms/MarkdownMessage/MarkdownMessage';
import { ProductToolbar } from '../../../molecules/ProductToolbar/ProductToolbar';
import { useSelectionStore } from '../../../context/selectionStore';
import { useCallback, useState } from 'react';

export type SelectedBrandingSidebarProps = {
  markdown: string;
  onDelete?: () => void;
  onSave?: () => void;
  onCopy?: () => void;
};

export default function SelectedBrandingSidebar({ markdown, onDelete, onSave, onCopy }: SelectedBrandingSidebarProps) {
  const { clearBranding } = useSelectionStore();
  const [isCopying, setIsCopying] = useState(false);

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
      await navigator.clipboard.writeText(markdown);
    } catch (error) {
      console.error(error);
      window.alert?.('클립보드 복사에 실패했습니다. 브라우저 설정을 확인해주세요.');
    } finally {
      setIsCopying(false);
    }
  }, [onCopy, markdown]);

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
          onCopy={() => resolvedCopy()}
          isCopying={isCopying}
          size={20}
        />
      </div>
    </div>
  );
}
