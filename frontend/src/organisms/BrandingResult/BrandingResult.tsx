// src/organisms/BrandingResult/BrandingResult.tsx
import { MarkdownMessage } from "../../atoms/MarkdownMessage/MarkdownMessage";
import styles from "./BrandingResult.module.css";
import { ProductToolbar } from "../../molecules/ProductToolbar/ProductToolbar";

export type BrandingResultProps = {
  userPrompt?: string;       // optional: show user's last prompt bubble
  markdown: string;          // branding strategy as markdown
  id?: number;               // optional id for toolbar callbacks
  onDelete?: (id: number) => void;
  onSave?: (id: number) => void;
  onDownload?: (id: number) => void;
  onTag?: (id: number) => void;
  onInsertToProject?: (id: number) => void;
};

export default function BrandingResult({
  userPrompt,
  markdown,
  id = 0,
  onDelete,
  onSave,
  onDownload,
  onTag,
  onInsertToProject,
}: BrandingResultProps) {
  return (
    <div className={styles.wrap}>
      {userPrompt && (
        <div className={styles.userRow}>
          <MarkdownMessage content={userPrompt} isUser />
        </div>
      )}

      <div className={styles.headerRow}>
        <div className={styles.title}>Branding Strategy</div>
      </div>

      <div className={styles.panel}>
        <div className={styles.messageGroup}>
          <MarkdownMessage content={markdown} className={styles.bubble} />
          <div className={styles.panelToolbar}>
            <ProductToolbar
              id={id}
              onDelete={onDelete}
              onSave={onSave}
              onDownload={onDownload}
              onTag={onTag}
              onInsertToProject={onInsertToProject}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
