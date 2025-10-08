// src/organisms/PromptComposer/PromptComposer.tsx
import { TextArea } from "../../atoms/TextArea/TextArea";
import styles from "./PromptComposer.module.css";

export type PromptComposerProps = {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  className?: string;
};

export default function PromptComposer({
  value,
  placeholder = "메시지를 입력하세요...",
  disabled,
  onChange,
  onSubmit,
  className,
}: PromptComposerProps) {
  return (
    <div className={`${styles.wrap} ${className ?? ""}`}> 
      <div className={styles.inner}>
        {/* 첨부 아이콘 자리 (비활성 UI) */}
        <button className={styles.iconBtn} type="button" title="첨부" disabled>
          <PaperclipIcon />
        </button>

        <TextArea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onSubmit={onSubmit}
          disabled={!!disabled}
        />

        {/* 음성 아이콘 자리 (비활성 UI) */}
        <button className={styles.iconBtn} type="button" title="음성 입력" disabled>
          <MicIcon />
        </button>

        {/* 보내기 */}
        <button className={styles.sendBtn} type="button" onClick={onSubmit} disabled={!!disabled}>
          <SendIcon />
        </button>
      </div>
    </div>
  );
}

function PaperclipIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M21 12.5L12.5 21c-2.5 2.5-6.5 2.5-9 0-2.5-2.5-2.5-6.5 0-9L12 3.5c1.7-1.7 4.3-1.7 6 0 1.7 1.7 1.7 4.3 0 6L9.5 18" stroke="#6B7280" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 14a4 4 0 004-4V6a4 4 0 10-8 0v4a4 4 0 004 4z" stroke="#6B7280" strokeWidth="1.6"/>
      <path d="M19 10v1a7 7 0 01-14 0v-1" stroke="#6B7280" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M12 17v4" stroke="#6B7280" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M22 2L11 13" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
      <path d="M22 2l-7 20-4-9-9-4 20-7z" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

