// src/organisms/BrandStrategyDeliverableCard/BrandStrategyDeliverableCard.tsx
// 내 산출물 페이지에서 브랜딩 전략 아이템을 카드 형태로 표시하는 컴포넌트.
// - Prompt(briefKo)와 본문(summary/markdown)을 간단히 노출
// - 하단에는 ProductToolbar를 재사용하여 공통 액션을 제공

import type { KeyboardEvent } from "react";
import styles from "./BrandStrategyDeliverableCard.module.css";
import { ProductToolbar } from "../../molecules/ProductToolbar/ProductToolbar";
import type { BrandStrategyListItem } from "../../custom_api/branding";
import ReactMarkdown from "react-markdown";

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
    variant?: "default" | "blueprint";
    onSelect?: (id: number) => void;
};

function normalizeStrategyText(item: BrandStrategyListItem): string {
    // markdown 필드가 있다면 그대로 활용하고, 없으면 summary → brief 순으로 대체
    const source = item.markdown ?? item.summaryKo ?? item.briefKo ?? "";
    // heading(\#)과 텍스트 사이 공백이 없으면 마크다운 파서가 인식하지 못하므로 강제로 공백을 삽입
    return source.replace(/(^|\n)(#+)(?!\s)/g, (_, prefix: string, hashes: string) => `${prefix}${hashes} `);
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
    variant = "default",
    onSelect,
}: BrandStrategyDeliverableCardProps) {
    const strategyText = normalizeStrategyText(item);
    const previewText =
        strategyText.length > 800
            ? `${strategyText.slice(0, 800)}\n\n…`
            : strategyText;
    const isBlueprint = variant === "blueprint";

    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (!onSelect) return;
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect(item.id);
        }
    };

    return (
        <article
            className={[
                styles.card,
                isBlueprint ? styles.cardBlueprint : "",
            ].join(" ").trim()}
            role={onSelect ? "button" : undefined}
            tabIndex={onSelect ? 0 : undefined}
            onClick={onSelect ? () => onSelect(item.id) : undefined}
            onKeyDown={handleKeyDown}
            aria-label={onSelect ? "브랜딩 전략 상세 보기" : undefined}
        >
            <header className={styles.header}>
                <div className={styles.meta}>
                    <span
                        className={[
                            styles.label,
                            isBlueprint ? styles.labelBlueprint : "",
                        ].join(" ").trim()}
                    >
                        Prompt
                    </span>
                    <p
                        className={[
                            styles.prompt,
                            isBlueprint ? styles.promptBlueprint : "",
                        ].join(" ").trim()}
                    >
                        {item.briefKo || "입력된 프롬프트가 없습니다."}
                    </p>
                </div>
            </header>

            <section className={styles.body}>
                <h4
                    className={[
                        styles.sectionTitle,
                        isBlueprint ? styles.sectionTitleBlueprint : "",
                    ].join(" ").trim()}
                >
                    Branding Strategy
                </h4>
                <div
                    className={[
                        styles.content,
                        isBlueprint ? styles.contentBlueprint : "",
                    ].join(" ").trim()}
                >
                    <ReactMarkdown>{previewText}</ReactMarkdown>
                    {strategyText.length > previewText.length && (
                        <p className={styles.truncateHint}>…</p>
                    )}
                </div>
            </section>

            <footer
                className={styles.footer}
                onClick={(event) => event.stopPropagation()}
            >
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
