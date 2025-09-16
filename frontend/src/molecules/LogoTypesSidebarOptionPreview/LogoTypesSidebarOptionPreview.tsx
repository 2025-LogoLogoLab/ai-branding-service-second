// ---------------------------------
// 파일: src/molecules/LogoTypesSidebarOptionPreview/LogoTypesSidebarOptionPreview.tsx
// ---------------------------------
import styles from './LogoTypesSidebarOptionPreview.module.css';
import { LogoExampleBox } from '../../atoms/LogoExampleBox/LogoExampleBox';
import type { LogoType } from '../../types/logoTypes';

export type LogoTypesSidebarOptionPreviewProps = {
    label: string;
    type: LogoType;
};

// 로고 타입 이름과 예시 박스를 함께 보여주는 Molecule 컴포넌트
export function LogoTypesSidebarOptionPreview ({ label, type } : LogoTypesSidebarOptionPreviewProps) {
    return (
        <div className={styles.card} aria-label={label}>
            {/* <div className={styles.header}>{label}</div> */}
            <LogoExampleBox type={type} />
        </div>
    );
};