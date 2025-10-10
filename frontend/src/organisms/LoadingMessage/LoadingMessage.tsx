// src/organisms/LoadingMessage/LoadingMessage.tsx
import TypingDots from '../../atoms/TypingDots/TypingDots';
import msgStyles from '../../atoms/MarkdownMessage/MarkdownMessage.module.css';

export type LoadingMessageProps = {
  label?: string; // screen reader hint
};

export default function LoadingMessage({ label = '생성 중' }: LoadingMessageProps) {
  // Reuse the system bubble style for consistency with AI messages
  return (
    <div className={msgStyles.systemMessage} aria-live="polite" aria-label={label}>
      <TypingDots />
    </div>
  );
}

