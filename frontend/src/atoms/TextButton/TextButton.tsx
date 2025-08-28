// src/atoms/TextButton/TextButton.tsx
// 버튼 내부 내용이 TEXT로 된 버튼
import styles from './TextButton.module.css';

export type ButtonProps = {
    label: string;        // 버튼 내용 
    onClick: () => void;    // 버튼 클릭 시 실행할 동작
    variant?: 'white' | 'orange' | 'outlined' | 'card';   // Text 버튼 종류 지정 (CSS 클래스 지정용)
};

export function TextButton( { label, onClick, variant = 'white' } : ButtonProps ) {
    
    return(
        <button onClick={onClick} className={`${styles.base} ${styles[variant]}`} type="button">
            {label}
        </button>
    );
}

