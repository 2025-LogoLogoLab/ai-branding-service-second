import styles from './SelectedLogoSidebar.module.css';
import { ImageBase64 } from '../../../atoms/ImageBase64/ImageBase64';
import { ProductToolbar } from '../../../molecules/ProductToolbar/ProductToolbar';
import { useSelectionStore } from '../../../context/selectionStore';
import { useCallback, useState } from 'react';

export type SelectedLogoSidebarProps = {
  base64: string;
  // Optional handlers if parent wants to wire them later
  onDownload?: () => void;
  onCopy?: () => void;
};

export default function SelectedLogoSidebar({ base64, onDownload, onCopy }: SelectedLogoSidebarProps) {
  const [isCopying, setIsCopying] = useState(false);

  const resolvedDownload = useCallback(() => {
    if (onDownload) {
      onDownload();
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
  }, [onDownload, base64]);

  const resolvedCopy = useCallback(async () => {
    if (onCopy) {
      onCopy();
      return;
    }
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      window.alert?.('클립보드 기능을 사용할 수 없습니다.');
      return;
    }
    const clipboard = navigator.clipboard;
    const dataUrl = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;
    const clipboardItemCtor = (window as typeof window & { ClipboardItem?: typeof ClipboardItem }).ClipboardItem;
    try {
      setIsCopying(true);
      if (typeof clipboard.write === 'function' && clipboardItemCtor) {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const item = new clipboardItemCtor({ [blob.type]: blob });
        await clipboard.write([item]);
      } else if (typeof clipboard.writeText === 'function') {
        await clipboard.writeText(dataUrl);
      } else {
        throw new Error('Clipboard API not supported');
      }
    } catch (error) {
      console.error(error);
      window.alert?.('클립보드 복사에 실패했습니다. 브라우저 설정을 확인해주세요.');
    } finally {
      setIsCopying(false);
    }
  }, [onCopy, base64]);

  return (
    <div className={styles.wrap} aria-label="선택된 로고">
      <span className={styles.title}>선택된 로고</span>
      <div className={styles.imageBox}>
        <ImageBase64 imageData={base64} alt="선택된 로고" variant="logoImage" />
      </div>
    <div className={styles.toolbarOuter}>
      <ProductToolbar
        id={0}
        onDownload={() => resolvedDownload()}
        onCopy={() => resolvedCopy()}
        isCopying={isCopying}
        size={20}
      />
    </div>
    </div>
  );
}
