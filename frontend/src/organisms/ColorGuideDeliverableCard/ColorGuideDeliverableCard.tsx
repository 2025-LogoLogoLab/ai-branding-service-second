// src/organisms/ColorGuideDeliverableCard/ColorGuideDeliverableCard.tsx
// 산출물 관리 페이지에서 컬러 가이드를 카드 형태로 노출
// - briefKo를 Prompt로 보여주고, ColorGuideStrip을 이용해 팔레트를 시각화한다.

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
}: ColorGuideDeliverableCardProps) {
    const palette = buildGuide(item);

    return (
        <article className={styles.card}>
            <header className={styles.header}>
                <div>
                    <span className={styles.label}>Prompt</span>
                    <p className={styles.prompt}>{item.briefKo || "컬러 가이드 생성 프롬프트가 없습니다."}</p>
                </div>
                {item.style && (
                    <div className={styles.style}>
                        <span className={styles.badgeLabel}>Style</span>
                        <span className={styles.badgeValue}>{item.style}</span>
                    </div>
                )}
            </header>

            <section className={styles.body}>
                <h4 className={styles.sectionTitle}>Color Guide</h4>
                <ColorGuideStrip guide={palette} />
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
