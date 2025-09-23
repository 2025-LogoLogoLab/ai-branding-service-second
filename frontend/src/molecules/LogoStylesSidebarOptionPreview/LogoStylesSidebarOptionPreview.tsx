// ---------------------------------
// 파일: src/molecules/LogoStylesSidebarOptionPreview/LogoStylesSidebarOptionPreview.tsx
// ---------------------------------
import React from 'react';
import styles from './LogoStylesSidebarOptionPreview.module.css';
import { LogoStyleExampleBox } from '../../atoms/LogoStyleExampleBox/LogoStyleExampleBox'; // ← 경로/이름 확인
import type { LogoStyleKey } from '../../types/logoStyles';

export type LogoStylesSidebarOptionPreviewProps = {
    // 사용자에게 보이는 스타일 라벨 (한글)
    label: string;
    // 스타일 식별자 (영문 key)
    styleKey: LogoStyleKey;
    // 클릭 시 실행할 동작(옵션) - 전체보기에서 항목 선택 용도
    onClick?: () => void;
};

// 예시 박스를 감싸는 Molecule
// - 전체보기에서는 카드 전체를 클릭 가능하도록 button으로 감쌈
export const LogoStylesSidebarOptionPreview: React.FC<LogoStylesSidebarOptionPreviewProps> = ({ label, styleKey, onClick }) => {
    return (
        <button
            type="button"
            className={styles.card}
            aria-label={`${label} 스타일 예시 선택`}
            onClick={onClick}
        >
            <LogoStyleExampleBox styleKey={styleKey} label={label} />
        </button>
    );
};
