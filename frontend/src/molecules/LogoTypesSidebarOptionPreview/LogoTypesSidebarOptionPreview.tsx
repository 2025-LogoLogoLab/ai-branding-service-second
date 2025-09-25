// ---------------------------------
// 파일: src/molecules/LogoTypesSidebarOptionPreview/LogoTypesSidebarOptionPreview.tsx
// ---------------------------------
import styles from './LogoTypesSidebarOptionPreview.module.css';
import { LogoExampleBox } from '../../atoms/LogoExampleBox/LogoExampleBox';
import type { LogoType } from '../../types/logoTypes';

export type LogoTypesSidebarOptionPreviewProps = {
    label: string;  // 사용자에게 표출되는 레이블
    type: LogoType; // 실제 스타일 타입
    onClick?: () => void;
};

// 로고 타입 이름과 예시 박스를 함께 보여주는 Molecule 컴포넌트
export function LogoTypesSidebarOptionPreview ({ label, type, onClick} : LogoTypesSidebarOptionPreviewProps) {
    return (
        <button className={styles.card} aria-label={label} onClick={onClick}>
            {/* <div className={styles.header}>{label}</div> */}
            <LogoExampleBox type={type} />
        </button>
    );
};