// ---------------------------------
// 파일: src/atoms/SidebarOptionItem/SidebarOptionItem.tsx
// ---------------------------------
import styles from './SidebarOptionItem.module.css';

export type SidebarOptionItemProps = {
    label: string;
    active?: boolean;
    onClick?: () => void;
};

// 사이드바의 개별 항목을 표시하는 Atom 컴포넌트
export function SidebarOptionItem ({ label, active, onClick } : SidebarOptionItemProps) {
    return (
        <button
            type="button"
            className={`${styles.item} ${active ? styles.active : ''}`}
            onClick={onClick}
            aria-pressed={!!active}
        >
            <span className={styles.label}>{label}</span>
        </button>
    );
};