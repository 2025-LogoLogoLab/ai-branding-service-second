// src/organisms/LogoTypeSidebar/LogoTypeSidebar.tsx
import styles from './LogoTypeSidebar.module.css';
import { LOGO_TYPES, type LogoType } from '../../types/logoTypes';
import { SidebarOptionItem } from '../../atoms/SidebarOptionItem/SidebarOptionItem';
import { LogoTypesSidebarOptionPreview } from '../../molecules/LogoTypesSidebarOptionPreview/LogoTypesSidebarOptionPreview';
import { useMemo } from 'react';

export type LogoTypeSidebarProps = {
    selected?: LogoType;        // 현재 선택된 타입 (옵셔널)
    showAll?: boolean;          // true일 때 전체보기 모드
    onSelect?: (type: LogoType) => void;
    onShowAll?: () => void;
};

export function LogoTypeSidebar({ selected, showAll, onSelect, onShowAll }: LogoTypeSidebarProps) {
    // 정렬: 전체보기면 그대로, 아니면 선택항목을 최상단으로
    const ordered = useMemo(() => {
        if (showAll) return LOGO_TYPES;
        if (!selected) return LOGO_TYPES;
        const sel = LOGO_TYPES.find(o => o.key === selected);
        if (!sel) return LOGO_TYPES;
        return [sel, ...LOGO_TYPES.filter(o => o.key !== selected)];
    }, [selected, showAll]);

    return (
        <aside className={styles.sidebar} aria-label="로고 타입 사이드바">
            {showAll ? (
                // 👉 전체보기 모드일 때 큰 제목 표시
                <div className={styles.allHeader}>로고 타입 예시 전체보기</div>
            ) : (
                // 👉 일반 모드에서만 pill 렌더링
                selected && (
                    <div className={styles.actions}>
                        <SidebarOptionItem
                            label={LOGO_TYPES.find(o => o.key === selected)?.label ?? ''}
                            active
                            onClick={() => onSelect?.(selected)}
                        />
                    </div>
                )
            )}

            {/* 리스트 렌더링 */}
            {showAll ? (
                <div className={styles.list}>
                    {ordered.map(({ key, label }) => (
                        <LogoTypesSidebarOptionPreview key={key} label={label} type={key} />
                    ))}
                </div>
            ) : (
                <div className={styles.list}>
                    {ordered.map(({ key, label }, idx) =>
                        idx === 0 ? (
                            <LogoTypesSidebarOptionPreview key={key} label={label} type={key} />
                        ) : (
                            <SidebarOptionItem key={key} label={label} onClick={() => onSelect?.(key)} />
                        )
                    )}
                </div>
            )}

            {!showAll && (
                <button className={styles.allBtn} type="button" onClick={onShowAll}>
                    로고 타입 전체 예시 보기
                </button>
            )}
        </aside>
    );
}
