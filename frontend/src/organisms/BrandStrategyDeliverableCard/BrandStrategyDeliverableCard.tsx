// src/organisms/BrandStrategyDeliverableCard/BrandStrategyDeliverableCard.tsx
// 산출물 관리 페이지에서 브랜딩 전략 아이템을 카드 형태로 표시하는 컴포넌트.
// - Prompt(briefKo)와 본문(summary/markdown)을 간단히 노출
// - 하단에는 ProductToolbar를 재사용하여 공통 액션을 제공

import styles from "./BrandStrategyDeliverableCard.module.css";
import { ProductToolbar } from "../../molecules/ProductToolbar/ProductToolbar";
import type { BrandStrategyListItem } from "../../custom_api/branding";

export type BrandStrategyDeliverableCardProps = {
    item: BrandStrategyListItem;
    onDelete?: (id: number) => void;
    onSave?: (id: number) => void;
    onDownload?: (id: number) => void;
    onCopy?: (id: number) => void;
    onTag?: (id: number) => void;
    onInsertToProject?: (id: number) => void;
    isCopying?: boolean;
    isDownloading?: boolean;
    isDeleting?: boolean;
};

function normalizeStrategyText(item: BrandStrategyListItem): string {
    // markdown 필드가 있다면 그대로 활용하고, 없으면 summary → brief 순으로 대체
    if (item.markdown) return item.markdown;
    if (item.summaryKo) return item.summaryKo;
    return item.briefKo;
}

export default function BrandStrategyDeliverableCard({
    item,
    onDelete,
    onSave,
    onDownload,
    onCopy,
    onTag,
    onInsertToProject,
    isCopying,
    isDownloading,
    isDeleting,
}: BrandStrategyDeliverableCardProps) {
    const strategyText = normalizeStrategyText(item);

    return (
        <article className={styles.card}>
            <header className={styles.header}>
                <div className={styles.meta}>
                    <span className={styles.label}>Prompt</span>
                    <p className={styles.prompt}>{item.briefKo || "입력된 프롬프트가 없습니다."}</p>
                </div>

                <dl className={styles.badges}>
                    {item.style && (
                        <div>
                            <dt className={styles.badgeLabel}>Style</dt>
                            <dd className={styles.badgeValue}>{item.style}</dd>
                        </div>
                    )}
                    {item.createdAt && (
                        <div>
                            <dt className={styles.badgeLabel}>Created</dt>
                            <dd className={styles.badgeValue}>{new Date(item.createdAt).toLocaleString()}</dd>
                        </div>
                    )}
                </dl>
            </header>

            <section className={styles.body}>
                <h4 className={styles.sectionTitle}>Branding Strategy</h4>
                <p className={styles.content}>{strategyText}</p>
            </section>

            <footer className={styles.footer}>
                <ProductToolbar
                    id={item.id}
                    onDelete={onDelete}
                    onSave={onSave}
                    onDownload={onDownload}
                    onCopy={onCopy}
                    onTag={onTag}
                    onInsertToProject={onInsertToProject}
                    isCopying={isCopying}
                    isDownloading={isDownloading}
                    isDeleting={isDeleting}
                />
            </footer>
        </article>
    );
}
