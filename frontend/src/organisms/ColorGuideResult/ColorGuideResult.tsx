// src/organisms/ColorGuideResult/ColorGuideResult.tsx
import ColorGuideStrip from "../ColorGuideStrip/ColorGuideStrip";
import styles from "./ColorGuideResult.module.css";
import { ProductToolbar } from "../../molecules/ProductToolbar/ProductToolbar";
import type { colorGuideGenResponse } from "../../custom_api/colorguide";

export type ColorGuideResultProps = {
  guide: colorGuideGenResponse;
  id?: number;
  onDelete?: (id: number) => void;
  onSave?: (id: number) => void;
  onDownload?: (id: number) => void;
  onCopy?: (id: number) => void;
  onTag?: (id: number) => void;
  onInsertToProject?: (id: number) => void;
  isCopying?: boolean;
};

export default function ColorGuideResult({
  guide,
  id = 0,
  onDelete,
  onSave,
  onDownload,
  onCopy,
  onTag,
  onInsertToProject,
  isCopying,
}: ColorGuideResultProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.headerRow}>
        <div className={styles.title}>Color Guide</div>
      </div>
      <div className={styles.panel}>
        <div className={styles.messageGroup}>
          <div className={styles.bubble}>
            <ColorGuideStrip guide={guide} />
            <div className={styles.panelToolbar}>
              <ProductToolbar
                id={id}
                onDelete={onDelete}
                onSave={onSave}
                onDownload={onDownload}
                onCopy={onCopy}
                onTag={onTag}
                onInsertToProject={onInsertToProject}
                isCopying={isCopying}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
