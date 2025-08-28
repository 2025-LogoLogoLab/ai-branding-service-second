// src/atoms/CardButton/CardButton.tsx
import styles from './CardButton.module.css';

export type CardButtonProps = {
  label: string;                  // 버튼에 표시할 텍스트
  onClick: () => void;           // 클릭 시 실행할 함수
  disabled?: boolean;            // 비활성화 여부
};

export function CardButton({ label, onClick, disabled = false }: CardButtonProps) {
  return (
    <button className={styles.cardButton} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
