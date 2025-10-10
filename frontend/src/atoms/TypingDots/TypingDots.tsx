// src/atoms/TypingDots/TypingDots.tsx
import styles from './TypingDots.module.css';

export default function TypingDots() {
  return (
    <span className={styles.wrap} aria-label="생성 중">
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
    </span>
  );
}

