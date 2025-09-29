// ---------------------------------
// 파일: src/organisms/LogoStyleSidebar/LogoStyleSidebar.tsx
// ---------------------------------
import React, { useMemo } from 'react';
import styles from './LogoStyleSidebar.module.css';
import { LOGO_STYLES, type LogoStyleKey } from '../../types/logoStyles';
import { SidebarOptionItem } from '../../atoms/SidebarOptionItem/SidebarOptionItem';
import { LogoStylesSidebarOptionPreview } from '../../molecules/LogoStylesSidebarOptionPreview/LogoStylesSidebarOptionPreview';

export type LogoStyleSidebarProps = {
    // 현재 선택된 스타일 (일반 모드에서만 사용). 전체보기일 때는 undefined여도 됨
    selected?: LogoStyleKey;
    // true면 전체보기 모드로, 모든 스타일 예시를 그리드로 표시
    showAll?: boolean;
    // 항목 클릭 등으로 스타일을 선택했을 때 호출되는 콜백
    onSelect?: (styleKey: LogoStyleKey) => void;
    // "전체보기" 버튼 클릭 콜백 (상위에서 모드 토글)
    onShowAll?: () => void;
    // 전체보기에서 항목을 클릭했을 때 호출 (선택 + 전체보기 종료 같은 상위 로직을 묶어서 처리)
    onPickFromAll?: (styleKey: LogoStyleKey) => void;
    onStyleChanges?: (styleKey: LogoStyleKey) => void;

};

export const LogoStyleSidebar: React.FC<LogoStyleSidebarProps> = ({ selected, showAll, onSelect, onShowAll, onPickFromAll }) => {
    // 정렬 규칙: 전체보기면 기본 순서 유지, 일반 모드면 선택 항목을 최상단으로 올림
    const ordered = useMemo(() => {
        if (showAll) return LOGO_STYLES;
        if (!selected) return LOGO_STYLES;
        const sel = LOGO_STYLES.find(o => o.key === selected);
        if (!sel) return LOGO_STYLES;
        return [sel, ...LOGO_STYLES.filter(o => o.key !== selected)];
    }, [selected, showAll]);

    // 전체보기 모드일 때 확장 클래스를 함께 적용
    const sidebarClass = `${styles.sidebar} ${showAll ? styles.expanded : ''}`;

    return (
        <aside className={sidebarClass} aria-label="로고 스타일 사이드바">
            {/* 전체보기 모드일 때는 상단 제목 텍스트를 노출하여 맥락을 제공 */}
            {showAll ? (
                <div className={styles.allHeader}>스타일 전체 예시 보기</div>
            ) : (
                // 일반 모드에서는 선택된 스타일을 상단 pill로 강조
                selected && (
                    <div className={styles.actions}>
                        <SidebarOptionItem
                            label={LOGO_STYLES.find(o => o.key === selected)?.label ?? ''}
                            active
                            onClick={() => onSelect?.(selected)}
                        />
                    </div>
                )
            )}

            {/* 컨텐츠: 전체보기 모드(그리드) vs 일반 모드(선택 예시 + 나머지 목록) */}
            {showAll ? (
                // 전체보기: 2x4 그리드 (반응형 미디어쿼리로 1열/2열/4열 전환)
                <div className={styles.gridAll}>
                    {LOGO_STYLES.map(({ key, label }) => (
                        <LogoStylesSidebarOptionPreview key={key} label={label} styleKey={key} 
                            onClick={()=> {
                                if (onPickFromAll) {
                                    onPickFromAll(key);
                                }
                                else {
                                    // 보조 동작: onPickFromAll 미전달 시 기본 선택만 수행                                    
                                    onSelect?.(key);
                                }
                            }}
                        />
                    ))}
                </div>
            ) : (
                // 일반 보기: 최상단에 선택 예시 카드 1개, 아래로 나머지 항목 버튼들
                <div className={styles.list}>
                    {ordered.map(({ key, label }, idx) =>
                        idx === 0 ? (
                            <LogoStylesSidebarOptionPreview key={key} label={label} styleKey={key} />
                        ) : (
                            <SidebarOptionItem key={key} label={label} onClick={() => onSelect?.(key)} />
                        )
                    )}
                </div>
            )}

            {/* 일반 모드에서만 전체보기 진입 버튼 노출 */}
            {!showAll && (
                <button className={styles.allBtn} type="button" onClick={onShowAll}>
                    스타일 전체 예시 보기
                </button>
            )}
        </aside>
    );
};