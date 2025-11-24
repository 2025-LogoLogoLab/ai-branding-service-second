// src/organisms/ColorGuideDeliverableCard/ColorGuideDeliverableCard.tsx
// 내 산출물 페이지에서 컬러 가이드를 카드 형태로 노출
// - briefKo를 Prompt로 보여주고, ColorGuideStrip을 이용해 팔레트를 시각화한다.

import type { KeyboardEvent } from "react";
import styles from "./ColorGuideDeliverableCard.module.css";
import { ProductToolbar } from "../../molecules/ProductToolbar/ProductToolbar";
import ColorGuideStrip from "../ColorGuideStrip/ColorGuideStrip";
import type { colorGuide } from "../../custom_api/colorguide";
import type { ColorGuideListItem } from "../../custom_api/colorguide";

export type ColorGuideDeliverableCardProps = {
    item: ColorGuideListItem;
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

function buildGuide(item: ColorGuideListItem): colorGuide {
    // API가 HEX만 제공하더라도 최소한의 설명을 붙여서 카드가 비어보이지 않도록 한다.
    const fallback = "설명이 제공되지 않았습니다.";
    return {
        main: {
            hex: item.mainHex ?? "#000000",
            description: item.mainDescription ?? fallback,
        },
        sub: {
            hex: item.subHex ?? "#4b5563",
            description: item.subDescription ?? fallback,
        },
        point: {
            hex: item.pointHex ?? "#1f2937",
            description: item.pointDescription ?? fallback,
        },
        background: {
            hex: item.backgroundHex ?? "#f3f4f6",
            description: item.backgroundDescription ?? fallback,
        },
    };
}

export default function ColorGuideDeliverableCard({
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
}: ColorGuideDeliverableCardProps) {
    const palette = buildGuide(item);
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
            aria-label={onSelect ? "컬러 가이드 상세 보기" : undefined}
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
                        {item.briefKo || "컬러 가이드 생성 프롬프트가 없습니다."}
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
                    Color Guide
                </h4>
                <ColorGuideStrip guide={palette} />
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
