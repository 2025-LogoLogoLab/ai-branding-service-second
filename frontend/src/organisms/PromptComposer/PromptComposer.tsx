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
  // 옵션: 아이콘 표시 토글 — 개발 중 쉽게 숨기거나 보이게 할 수 있음
  showAttach?: boolean;   // 기본값 false (현재는 숨김 상태가 기본)
  showMic?: boolean;      // 기본값 false
};

export default function PromptComposer({
  value,
  placeholder = "메시지를 입력하세요...",
  disabled,
  onChange,
  onSubmit,
  className,
  showAttach = false,
  showMic = false,
}: PromptComposerProps) {
  return (
    <div className={`${styles.wrap} ${className ?? ""}`}> 
      <div className={styles.inner}>
        {/* 첨부 아이콘 — 개발 중 토글(showAttach)로 표시/숨김 */}
        {showAttach && (
          <button className={styles.iconBtn} type="button" title="첨부" disabled>
            <PaperclipIcon />
            {/** 로컬 아이콘 사용 예시 (주석 해제하여 사용)
             * import attachPng from '../../assets/icons/attach.png';
             * <img src={attachPng} alt="첨부" className={styles.iconImg} />
             */}
          </button>
        )}

        <div className={styles.inputWrap}>
          <TextArea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            onSubmit={onSubmit}
            disabled={!!disabled}
            variant="bare"
          />
        </div>

        {/* 음성 아이콘 — 개발 중 토글(showMic)로 표시/숨김 */}
        {showMic && (
          <button className={styles.iconBtn} type="button" title="음성 입력" disabled>
            <MicIcon />
            {/** 로컬 아이콘 사용 예시 (주석 해제하여 사용)
             * import micPng from '../../assets/icons/mic.png';
             * <img src={micPng} alt="음성 입력" className={styles.iconImg} />
             */}
          </button>
        )}

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

