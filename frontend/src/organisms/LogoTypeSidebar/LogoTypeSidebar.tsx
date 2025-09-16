// ---------------------------------
// 파일: src/organisms/LogoTypeSidebar/LogoTypeSidebar.tsx
// ---------------------------------
import styles from './LogoTypeSidebar.module.css';
import { LOGO_TYPES, type LogoType } from '../../types/logoTypes';
import { SidebarOptionItem } from '../../atoms/SidebarOptionItem/SidebarOptionItem';
import { LogoTypesSidebarOptionPreview } from '../../molecules/LogoTypesSidebarOptionPreview/LogoTypesSidebarOptionPreview';
import { useMemo } from 'react';

export type LogoTypeSidebarProps = {
    selected: LogoType;      // 현재 선택된 타입
    showAll?: boolean;       // true일 때 전체보기 모드
    onSelect?: (type: LogoType) => void;
};

// 로고 타입 선택 및 예시를 표시하는 사이드바 Organism
export function LogoTypeSidebar ({ selected, showAll, onSelect } : LogoTypeSidebarProps) {
    // 표시 순서 계산: 전체보기일 때는 고정, 아니면 선택된 항목을 최상단으로
    const ordered = useMemo(() => {
        if (showAll) return LOGO_TYPES;
        const sel = LOGO_TYPES.find(o => o.key === selected)!;
        const rest = LOGO_TYPES.filter(o => o.key !== selected);
        return [sel, ...rest];
    }, [selected, showAll]);

    return (
        <aside className={styles.sidebar} aria-label="로고 타입 사이드바">
            {/* 선택된 항목을 강조 */}
            <div className={styles.actions}>
                <SidebarOptionItem
                    label={LOGO_TYPES.find(o => o.key === selected)?.label ?? ''}
                    active
                    onClick={() => onSelect?.(selected)}
                />
            </div>

            {/* 전체보기 모드일 때는 모든 예시를 렌더링 */}
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
                        ),
                    )}
                </div>
            )}

            {!showAll && (
                <button className={styles.allBtn} type="button" onClick={() => onSelect?.(selected)}>
                    로고 타입 전체 예시 보기
                </button>
            )}
        </aside>
    );
};