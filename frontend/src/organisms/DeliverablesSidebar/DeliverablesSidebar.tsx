// src/organisms/DeliverablesSidebar/DeliverablesSidebar.tsx
// 내 산출물 페이지 전용 사이드바
// - 좌측에서 노출되는 카테고리 토글(체크박스) 목록을 구현한다.
// - 각 항목은 아이콘 + 라벨 + 체크 상태로 구성되어 있으며
//   클릭 시 onToggle 콜백을 호출한다.

import styles from "./DeliverablesSidebar.module.css";
import iconProducts from "../../assets/icons/icon_products.png";
import iconLogo from "../../assets/icons/icon_logo_generation.png";
import iconStrategy from "../../assets/icons/icon_strategy.png";
import iconColor from "../../assets/icons/icon_color_guide.png";

export type DeliverableCategory = "logo" | "branding" | "colorGuide";

export type DeliverableSelection = Record<DeliverableCategory, boolean>;

export type DeliverablesSidebarProps = {
    selections: DeliverableSelection;                  // 현재 체크 상태
    onToggle: (category: DeliverableCategory) => void; // 체크 토글 콜백
    onExclusiveSelect?: (category: DeliverableCategory) => void; // 해당 항목만 표시하도록 요청할 때 사용
    showTitle?: boolean;
};

const OPTION_META: Array<{
    id: DeliverableCategory;
    label: string;
    icon: string;
}> = [
    { id: "logo", label: "로고", icon: iconLogo },
    { id: "branding", label: "브랜딩 전략", icon: iconStrategy },
    { id: "colorGuide", label: "컬러 가이드", icon: iconColor },
];

export default function DeliverablesSidebar({
    selections,
    onToggle,
    onExclusiveSelect,
    showTitle = true,
}: DeliverablesSidebarProps) {
    return (
        <aside className={styles.sidebar} aria-label="산출물 카테고리 선택">
            {showTitle && (
                <h2 className={styles.title}>
                    <img src={iconProducts} alt="" aria-hidden="true" className={styles.titleIcon} />
                    내 산출물
                </h2>
            )}
            <ul className={styles.list} role="list">
                {OPTION_META.map(({ id, label, icon }) => {
                    const checked = selections[id];
                    return (
                        <li key={id} role="listitem">
                            <button
                                type="button"
                                className={`${styles.option} ${checked ? styles.selected : ""}`}
                                onClick={() => onToggle(id)}
                                aria-pressed={checked}
                            >
                                <span className={styles.left}>
                                    <span className={styles.iconWrap}>
                                        <img src={icon} alt="" aria-hidden="true" />
                                    </span>
                                    <span className={styles.label}>{label}</span>
                                </span>
                                <input
                                    type="checkbox"
                                    className={styles.checkbox}
                                    readOnly
                                    checked={checked}
                                    aria-label={`${label} 표시 여부`}
                                />
                            </button>

                            <button
                                type="button"
                                className={styles.onlyButton}
                                onClick={() => onExclusiveSelect?.(id)}
                            >
                                단독 보기
                            </button>
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
}
