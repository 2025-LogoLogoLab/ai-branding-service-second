import styles from "./DeliverableDetailModal.module.css";
import { ProductToolbar, type ProductToolbarProps } from "../../molecules/ProductToolbar/ProductToolbar";
import type { LogoDetail } from "../../custom_api/logo";
import { updateBrandStrategy, type BrandStrategyDetail } from "../../custom_api/branding";
import type { ColorGuideDetail, palette } from "../../custom_api/colorguide";
import { ensureDataUrl } from "../../utils/image";
import { Fragment, useEffect, useState } from "react";
import { LOGO_STYLES } from "../../types/logoStyles";
import ReactMarkdown from "react-markdown";
import iconPlus from "../../assets/icons/icon_plus.png";
import type { TagRecord, TagAttachTarget } from "../../custom_api/tags";
import { addTag, deleteTag } from "../../custom_api/tags";
import { TagPickerModal } from "../../components/TagPickerModal/TagPickerModal";

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

const renderTagsSection = (
    tags?: Array<{ id?: number; name: string }>,
    onAddTag?: () => void,
    onRemoveTag?: (tag: TagRecord) => void,
) => (
    <section className={styles.section}>
        <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Tags</h3>
            {(tags?.length ?? 0) < 5 && (
                <button type="button" className={styles.tagAddButton} onClick={onAddTag}>
                    <img src={iconPlus} alt="태그 추가" />
                </button>
            )}
        </div>
        {tags && tags.length > 0 ? (
            <div className={styles.tagGroup}>
                {tags.map((tag) => (
                    <span className={styles.tag} key={tag.id ?? tag.name}>
                        #{tag.name}
                        <button
                            type="button"
                            className={styles.tagRemoveButton}
                            onClick={() => onRemoveTag?.({ id: tag.id ?? -1, name: tag.name })}
                            aria-label={`${tag.name} 태그 삭제`}
                        >
                            ×
                        </button>
                    </span>
                ))}
            </div>
        ) : (
            <div className={styles.promptBlock}>등록된 태그가 없습니다. 태그는 최대 5개까지 부여 가능합니다.</div>
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
    const [localTags, setLocalTags] = useState<TagRecord[]>(
        ((props.data as { tags?: TagRecord[] } | null | undefined)?.tags) ?? [],
    );
    const [isTagPickerOpen, setTagPickerOpen] = useState(false);
    const [brandingDetail, setBrandingDetail] = useState<BrandStrategyDetail | null>(
        props.type === "branding" ? ((props.data as BrandStrategyDetail | null | undefined) ?? null) : null,
    );
    const [brandingBodyDraft, setBrandingBodyDraft] = useState("");
    const [brandingEditing, setBrandingEditing] = useState(false);
    const [brandingSaving, setBrandingSaving] = useState(false);
    const [brandingEditError, setBrandingEditError] = useState<string | null>(null);

    useEffect(() => {
        setLocalTags(((props.data as { tags?: TagRecord[] } | null | undefined)?.tags) ?? []);
    }, [props.data?.id, props.type]);

    useEffect(() => {
        if (props.type === "branding") {
            const nextDetail = (props.data as BrandStrategyDetail | null | undefined) ?? null;
            setBrandingDetail(nextDetail);
            setBrandingBodyDraft(nextDetail?.markdown ?? "");
            setBrandingEditing(false);
            setBrandingEditError(null);
        } else {
            setBrandingDetail(null);
            setBrandingEditing(false);
            setBrandingEditError(null);
        }
    }, [props.type, props.data]);

    const maxTagsReached = localTags.length >= 5;

    const resolveTargetId = (): number | undefined => {
        const direct = (props.data as { id?: number } | null | undefined)?.id;
        if (typeof direct === "number" && Number.isFinite(direct)) {
            return direct;
        }
        if (props.type === "branding") {
            const brandingId = brandingDetail?.id;
            if (typeof brandingId === "number" && Number.isFinite(brandingId)) {
                return brandingId;
            }
        }
        return undefined;
    };

    const handleAttachTag = async (tag: TagRecord) => {
        if (localTags.some((item) => item.id === tag.id)) {
            alert("이미 추가된 태그입니다.");
            return;
        }
        if (maxTagsReached) {
            alert("태그는 최대 5개까지 추가할 수 있습니다.");
            return;
        }
        const targetId = resolveTargetId();
        if (targetId == null) {
            alert("산출물 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
            return;
        }
        try {
            const updated = await addTag(props.type as TagAttachTarget, targetId, tag);
            if (updated.length > 0) {
                setLocalTags(updated);
            } else {
                setLocalTags((prev) => [...prev, tag]);
            }
        } catch (err) {
            console.error(err);
            alert("태그 추가에 실패했습니다.");
            throw err;
        }
    };

    const handleRemoveTag = async (tag: TagRecord) => {
        const targetId = resolveTargetId();
        if (targetId == null) {
            alert("산출물 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
            return;
        }
        try {
            const updated = await deleteTag(props.type as TagAttachTarget, targetId, tag);
            if (updated.length > 0) {
                setLocalTags(updated);
            } else {
                setLocalTags((prev) => prev.filter((item) => item.id !== tag.id));
            }
        } catch (err) {
            console.error(err);
            alert("태그 삭제에 실패했습니다.");
        }
    };

    const renderContent = () => {
        if (loading) return renderStatus("상세 정보를 불러오는 중입니다…");
        if (error) return renderStatus(error, true, onRetry);

        switch (props.type) {
            case "logo":
                return props.data ? renderLogoDetail(props.data) : renderStatus("표시할 로고 정보가 없습니다.", true, onRetry);
            case "branding":
                return (brandingDetail ?? props.data)
                    ? renderBrandingDetail((brandingDetail ?? props.data) as BrandStrategyDetail)
                    : renderStatus("표시할 브랜딩 전략이 없습니다.", true, onRetry);
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
                    <div className={styles.promptBlock}>{displayPrompt || "프롬프트 정보가 없습니다."}</div>
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

                {renderTagsSection(localTags, () => setTagPickerOpen(true), handleRemoveTag)}
            </Fragment>
        );
    };

    const handleBrandingEditStart = () => {
        setBrandingEditing(true);
        setBrandingBodyDraft((brandingDetail ?? (props.data as BrandStrategyDetail | null | undefined))?.markdown ?? "");
        setBrandingEditError(null);
    };

    const handleBrandingEditCancel = () => {
        const current = brandingDetail ?? (props.data as BrandStrategyDetail | null | undefined);
        setBrandingBodyDraft(current?.markdown ?? "");
        setBrandingEditing(false);
        setBrandingEditError(null);
    };

    const handleBrandingSave = async () => {
        const current = brandingDetail ?? (props.data as BrandStrategyDetail | null | undefined);
        if (!current) return;
        const nextBody = brandingBodyDraft.trim();
        if (!nextBody) {
            setBrandingEditError("브랜딩 전략 본문을 입력해주세요.");
            return;
        }
        setBrandingSaving(true);
        setBrandingEditError(null);
        try {
            const updated = await updateBrandStrategy(current.id, {
                markdown: nextBody,
            });
            setBrandingDetail(updated);
            setBrandingBodyDraft(updated.markdown ?? "");
            setBrandingEditing(false);
            setLocalTags(Array.isArray(updated.tags) ? updated.tags : []);
        } catch (err) {
            setBrandingEditError(err instanceof Error ? err.message : "브랜딩 전략 수정에 실패했습니다.");
        } finally {
            setBrandingSaving(false);
        }
    };

    const renderBrandingDetail = (detail: BrandStrategyDetail) => {
        const activeDetail = brandingDetail ?? detail;
        return (
            <Fragment>
                <div className={styles.metadataRow}>
                    <div className={styles.metadata}>
                        {activeDetail.createdAt && <span>생성일 {formatDate(activeDetail.createdAt)}</span>}
                        {activeDetail.updatedAt && <span>수정일 {formatDate(activeDetail.updatedAt)}</span>}
                        {translateStyle(activeDetail.style) && <span>스타일 {translateStyle(activeDetail.style)}</span>}
                    </div>
                    <div className={styles.brandingEditActions}>
                        {brandingEditing ? (
                            <>
                                <button
                                    type="button"
                                    className={styles.brandingEditPrimary}
                                    onClick={handleBrandingSave}
                                    disabled={brandingSaving}
                                >
                                    {brandingSaving ? "저장 중…" : "저장"}
                                </button>
                                <button
                                    type="button"
                                    className={styles.brandingEditButton}
                                    onClick={handleBrandingEditCancel}
                                    disabled={brandingSaving}
                                >
                                    취소
                                </button>
                            </>
                        ) : (
                            <button type="button" className={styles.brandingEditButton} onClick={handleBrandingEditStart}>
                                수정
                            </button>
                        )}
                    </div>
                </div>

                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Prompt</h3>
                    <div className={styles.promptBlock}>
                        {activeDetail.briefKo || "입력된 브리프 정보가 없습니다."}
                    </div>
                </section>

                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Branding Strategy</h3>
                    {brandingEditing ? (
                        <textarea
                            className={styles.brandingTextarea}
                            value={brandingBodyDraft}
                            onChange={(event) => setBrandingBodyDraft(event.target.value)}
                            placeholder="브랜딩 전략 본문을 입력하세요."
                        />
                    ) : activeDetail.markdown && activeDetail.markdown.trim() ? (
                        <div className={styles.markdownBlock}>
                            <ReactMarkdown>{normalizeMarkdown(activeDetail.markdown)}</ReactMarkdown>
                        </div>
                    ) : (
                        <div className={styles.promptBlock}>브랜딩 전략 본문이 비어 있습니다.</div>
                    )}
                    {brandingEditing && brandingEditError && (
                        <p className={styles.brandingEditError}>{brandingEditError}</p>
                    )}
                </section>

                {renderTagsSection(localTags, () => setTagPickerOpen(true), handleRemoveTag)}
            </Fragment>
        );
    };

    const renderColorGuideDetail = (detail: ColorGuideDetail) => (
        <Fragment>
            <div className={styles.metadata}>
                {detail.createdAt && <span>생성일 {formatDate(detail.createdAt)}</span>}
                {detail.updatedAt && <span>수정일 {formatDate(detail.updatedAt)}</span>}
                {translateStyle(detail.style) && <span>스타일 {translateStyle(detail.style)}</span>}
            </div>

            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Prompt</h3>
                <div className={styles.promptBlock}>{detail.briefKo || "컬러 가이드 프롬프트가 없습니다."}</div>
            </section>

            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Color Guide</h3>
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

            {renderTagsSection(localTags, () => setTagPickerOpen(true), handleRemoveTag)}
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
            {isTagPickerOpen && (
                <TagPickerModal
                    open={isTagPickerOpen}
                    onClose={() => setTagPickerOpen(false)}
                    onAttach={handleAttachTag}
                    existingTags={localTags}
                />
            )}
        </div>
    );
}


const normalizeMarkdown = (src: string): string => {
    let normalized = src;
    normalized = normalized.replace(/^(#{1,6})(?=\S)/gm, "$1 ");
    normalized = normalized.replace(/^(#{1,6} .+)(\r?\n)(?!\r?\n)/gm, "$1$2$2");
    return normalized;
};
