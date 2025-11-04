import styles from "./DeliverableDetailModal.module.css";
import { ProductToolbar, type ProductToolbarProps } from "../../molecules/ProductToolbar/ProductToolbar";
import ColorGuideStrip from "../ColorGuideStrip/ColorGuideStrip";
import type { LogoDetail } from "../../custom_api/logo";
import type { BrandStrategyDetail } from "../../custom_api/branding";
import type { ColorGuideDetail, palette } from "../../custom_api/colorguide";
import { ensureDataUrl } from "../../utils/image";
import { Fragment } from "react";
import { LOGO_STYLES } from "../../types/logoStyles";

type Variant = "default" | "blueprint";

type BaseDetailProps = {
    variant?: Variant;
    onClose: () => void;
    toolbarProps?: ProductToolbarProps;
    loading?: boolean;
    error?: string | null;
    onRetry?: () => void;
};

type LogoDetailProps = BaseDetailProps & {
    type: "logo";
    data?: LogoDetail | null;
};

type BrandStrategyDetailProps = BaseDetailProps & {
    type: "branding";
    data?: BrandStrategyDetail | null;
};

type ColorGuideDetailProps = BaseDetailProps & {
    type: "colorGuide";
    data?: ColorGuideDetail | null;
};

export type DeliverableDetailModalProps =
    | LogoDetailProps
    | BrandStrategyDetailProps
    | ColorGuideDetailProps;

const LABELS: Record<keyof ColorGuideDetail["guide"], string> = {
    main: "MAIN",
    sub: "SUB",
    point: "POINT",
    background: "BACKGROUND",
};

const formatDate = (value?: string) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
};

const renderStatus = (message: string, isError = false, onRetry?: () => void) => (
    <div className={`${styles.status} ${isError ? styles.statusError : ""}`}>
        <p>{message}</p>
        {onRetry && (
            <button type="button" className={styles.retryButton} onClick={onRetry}>
                다시 시도
            </button>
        )}
    </div>
);

const renderTagsSection = (tags?: Array<{ id?: number; name: string }>) => (
    <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Tags</h3>
        {tags && tags.length > 0 ? (
            <div className={styles.tagGroup}>
                {tags.map((tag) => (
                    <span className={styles.tag} key={tag.id ?? tag.name}>{tag.name}</span>
                ))}
            </div>
        ) : (
            <p className={styles.textBlock}>등록된 태그가 없습니다.</p>
        )}
    </section>
);

const STYLE_LABEL_MAP = new Map<string, string>(
    LOGO_STYLES.map(({ key, label }) => [key.toLowerCase(), label]),
);

const EXTRA_STYLE_LABELS: Record<string, string> = {
    minimal: "미니멀",
    modern: "모던",
    classic: "클래식",
    elegant: "엘레강트",
};

Object.entries(EXTRA_STYLE_LABELS).forEach(([key, value]) => {
    STYLE_LABEL_MAP.set(key, value);
});

const sanitizeStyleKey = (input?: string | null) => {
    if (!input) return undefined;
    const lower = input.split(",")[0]?.split(/negative_prompt/i)[0]?.trim();
    if (!lower) return undefined;
    return lower;
};

const translateStyle = (style?: string | null) => {
    const sanitized = sanitizeStyleKey(style);
    if (!sanitized) return undefined;
    const lower = sanitized.toLowerCase();
    return STYLE_LABEL_MAP.get(lower) ?? sanitized;
};

export function DeliverableDetailModal(props: DeliverableDetailModalProps) {
    const { variant = "default", onClose, toolbarProps, loading, error, onRetry } = props;
    const isBlueprint = variant === "blueprint";

    const renderContent = () => {
        if (loading) return renderStatus("상세 정보를 불러오는 중입니다…");
        if (error) return renderStatus(error, true, onRetry);

        switch (props.type) {
            case "logo":
                return props.data ? renderLogoDetail(props.data) : renderStatus("표시할 로고 정보가 없습니다.", true, onRetry);
            case "branding":
                return props.data ? renderBrandingDetail(props.data) : renderStatus("표시할 브랜딩 전략이 없습니다.", true, onRetry);
            case "colorGuide":
                return props.data ? renderColorGuideDetail(props.data) : renderStatus("표시할 컬러 가이드가 없습니다.", true, onRetry);
            default:
                return null;
        }
    };

    const renderLogoDetail = (detail: LogoDetail) => {
        const resolvedImage = ensureDataUrl(detail.imageUrl);
        const promptSegments = (detail.prompt ?? "")
            .split(/\r?\n/)
            .flatMap((line) => line.split(","))
            .map((segment) => segment.trim())
            .filter(Boolean);

        let extractedStyle: string | undefined = detail.style;

        const cleanedSegments = promptSegments.filter((segment) => {
            const lower = segment.toLowerCase();
            if (lower.startsWith("style:") || lower.startsWith("스타일:")) {
                if (!extractedStyle) {
                    extractedStyle = segment.split(":").slice(1).join(":").trim();
                }
                return false;
            }
            if (lower.startsWith("negative_prompt") || lower.startsWith("negative prompt")) {
                return false;
            }
            if (segment.startsWith("텍스트 표기법")) {
                return false;
            }
            return true;
        });

        const displayPrompt = cleanedSegments.join(", ").trim();
        const displayStyle = translateStyle(detail.style ?? extractedStyle);

        return (
            <Fragment>
                <div className={styles.metadata}>
                    {detail.createdAt && <span>생성일 {formatDate(detail.createdAt)}</span>}
                    {detail.updatedAt && <span>수정일 {formatDate(detail.updatedAt)}</span>}
                    {displayStyle && <span>스타일 {displayStyle}</span>}
                </div>

                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Prompt</h3>
                    <p className={styles.textBlock}>{displayPrompt || "프롬프트 정보가 없습니다."}</p>
                </section>

                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Generated Logo</h3>
                    <div className={styles.imageWrapper}>
                        {resolvedImage ? (
                            <img src={resolvedImage} alt="생성된 로고 이미지" className={styles.image} />
                        ) : (
                            renderStatus("이미지 경로가 제공되지 않았습니다.", true)
                        )}
                    </div>
                </section>

                {renderTagsSection(detail.tags)}
            </Fragment>
        );
    };

    const renderBrandingDetail = (detail: BrandStrategyDetail) => (
        <Fragment>
            <div className={styles.metadata}>
                {detail.createdAt && <span>생성일 {formatDate(detail.createdAt)}</span>}
                {detail.updatedAt && <span>수정일 {formatDate(detail.updatedAt)}</span>}
                {translateStyle(detail.style) && <span>스타일 {translateStyle(detail.style)}</span>}
            </div>

            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Prompt</h3>
                <p className={styles.textBlock}>{detail.briefKo || "입력된 브리프 정보가 없습니다."}</p>
            </section>

            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Branding Strategy</h3>
                <pre className={styles.markdownBlock}>
                    {detail.markdown || "브랜딩 전략 본문이 비어 있습니다."}
                </pre>
            </section>

            {renderTagsSection(detail.tags)}
        </Fragment>
    );

    const renderColorGuideDetail = (detail: ColorGuideDetail) => (
        <Fragment>
            <div className={styles.metadata}>
                {detail.createdAt && <span>생성일 {formatDate(detail.createdAt)}</span>}
                {detail.updatedAt && <span>수정일 {formatDate(detail.updatedAt)}</span>}
                {translateStyle(detail.style) && <span>스타일 {translateStyle(detail.style)}</span>}
            </div>

            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Prompt</h3>
                <p className={styles.textBlock}>{detail.briefKo || "컬러 가이드 프롬프트가 없습니다."}</p>
            </section>

            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Color Guide</h3>
                <ColorGuideStrip guide={detail.guide} />
                <div className={styles.paletteDetails}>
                    {(Object.keys(detail.guide) as Array<keyof ColorGuideDetail["guide"]>).map((key) => {
                        const swatch = detail.guide[key] as palette;
                        return (
                            <div className={styles.paletteRow} key={key}>
                                <div
                                    className={styles.swatch}
                                    style={{ backgroundColor: swatch.hex || "#e2e8f0" }}
                                    aria-label={`${LABELS[key]} 색상 미리보기`}
                                />
                                <div className={styles.swatchInfo}>
                                    <div className={styles.hex}>
                                        {LABELS[key]} · {swatch.hex || "미입력"}
                                    </div>
                                    <p className={styles.textBlock}>{swatch.description || "설명이 제공되지 않았습니다."}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {renderTagsSection(detail.tags)}
        </Fragment>
    );

    return (
        <div className={styles.overlay} role="presentation" onClick={onClose}>
            <div
                className={[
                    styles.container,
                    isBlueprint ? styles.containerBlueprint : "",
                ].join(" ").trim()}
                role="dialog"
                aria-modal="true"
                onClick={(event) => event.stopPropagation()}
            >
                <header className={styles.header}>
                    <div className={styles.titleBlock}>
                        <h2 className={styles.title}>
                            {props.type === "logo" && "로고 상세 보기"}
                            {props.type === "branding" && "브랜딩 전략 상세 보기"}
                            {props.type === "colorGuide" && "컬러 가이드 상세 보기"}
                        </h2>
                    </div>
                    <button type="button" className={styles.closeButton} onClick={onClose} aria-label="닫기">
                        ×
                    </button>
                </header>

                <div className={styles.body}>{renderContent()}</div>

                <footer className={styles.footer}>
                    <div />
                    {toolbarProps && (
                        <div className={styles.toolbarWrapper} onClick={(event) => event.stopPropagation()}>
                            <ProductToolbar {...toolbarProps} />
                        </div>
                    )}
                </footer>
            </div>
        </div>
    );
}
