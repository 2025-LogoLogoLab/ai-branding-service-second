// src/pages/Deliverables.tsx
// 마이페이지 > 내 산출물 진입 시 노출되는 메인 페이지.
// - 좌측 사이드바(DeliverablesSidebar)에서 카테고리 토글을 제어하면
//   선택된 항목에 맞춰 우측 콘텐츠 영역이 갱신된다.
// - 제공된 시안에 따라 총 4개의 뷰(전체/로고/브랜딩 전략/컬러 가이드)를
//   라우터 레벨에서 개별 페이지로 구성하되, 실제 렌더링 로직은 하나의
//   DeliverablesPage 컴포넌트가 담당한다.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import s from "./DeliverablesPage.module.css";

import DeliverablesSidebar, {
    type DeliverableCategory,
    type DeliverableSelection,
} from "../organisms/DeliverablesSidebar/DeliverablesSidebar";
import DeliverableSection from "../organisms/DeliverableSection/DeliverableSection";
import Pagination from "../molecules/Pagination/Pagination";
import { LogoCard } from "../organisms/LogoCard/LogoCard";
import BrandStrategyDeliverableCard from "../organisms/BrandStrategyDeliverableCard/BrandStrategyDeliverableCard";
import ColorGuideDeliverableCard from "../organisms/ColorGuideDeliverableCard/ColorGuideDeliverableCard";
import { DeliverableDetailModal } from "../organisms/DeliverableDetailModal/DeliverableDetailModal";

import {
    deleteLogo,
    fetchLogoPage,
    type LogoListItem,
} from "../custom_api/logo";
import {
    deleteBranding,
    fetchBrandStrategyPage,
    type BrandStrategyListItem,
} from "../custom_api/branding";
import {
    deleteColorGuide,
    fetchColorGuidePage,
    type ColorGuideListItem,
} from "../custom_api/colorguide";
import type { PaginatedResponse } from "../custom_api/types";
import { copyImageToClipboard } from "../utils/clipboard";
import { ensureDataUrl } from "../utils/image";
import type { ProductToolbarProps } from "../molecules/ProductToolbar/ProductToolbar";
import {
    asBrandStrategyListItem,
    asColorGuideListItem,
    asLogoListItem,
    previewToBrandDetail,
    previewToColorGuideDetail,
    previewToLogoDetail,
    useDeliverableDetail,
} from "../utils/deliverableDetail";
import { fetchAssetsByTag, type AssetSummary } from "../custom_api/assets";
// 페이지별 기본 페이지 크기(시안에서는 3열 그리드이므로 9개 단위가 자연스러움)
const PAGE_SIZE = 3;

// 각 카테고리 전용 라우트 매핑
const CATEGORY_PATH: Record<DeliverableCategory, string> = {
    logo: "/deliverables/logo",
    branding: "/deliverables/branding",
    colorGuide: "/deliverables/color-guide",
};

type DeliverablesMode = "all" | DeliverableCategory;

type FetchState<T> = {
    loading: boolean;
    error: string | null;
    data: PaginatedResponse<T> | null;
};

type ActionState = {
    deletingId: number | null;
    copyingId: number | null;
    downloadingId: number | null;
};

const initialFetchState = <T,>(): FetchState<T> => ({
    loading: false,
    error: null,
    data: null,
});

const initialActionState: ActionState = {
    deletingId: null,
    copyingId: null,
    downloadingId: null,
};

export type DeliverablesSidebarBridge = {
    selections: DeliverableSelection;
    onToggle: (category: DeliverableCategory) => void;
    onExclusiveSelect?: (category: DeliverableCategory) => void;
};

type DeliverablesPageProps = {
    mode: DeliverablesMode;
    variant?: DeliverablesVariant;
    renderSidebar?: boolean;
    onSidebarPropsChange?: (props: DeliverablesSidebarBridge) => void;
    className?: string;
    disableExclusiveRouting?: boolean;
};

// mode 값에 따라 기본 체크 상태를 구성
const createSelection = (mode: DeliverablesMode): DeliverableSelection => ({
    logo: mode === "all" || mode === "logo",
    branding: mode === "all" || mode === "branding",
    colorGuide: mode === "all" || mode === "colorGuide",
});

function usePaginatedLoader<T>(
    enabled: boolean,
    page: number,
    requester: (args: { page: number; size: number; signal: AbortSignal }) => Promise<PaginatedResponse<T>>,
    deps: unknown[],
) {
    const [state, setState] = useState<FetchState<T>>(initialFetchState);

    useEffect(() => {
        if (!enabled) {
            // 선택 해제 시 로딩 상태를 강제로 리셋 (이전 데이터는 유지해 빠른 복귀 지원)
            setState((prev) => ({ ...prev, loading: false }));
            return;
        }

        const controller = new AbortController();
        setState((prev) => ({ ...prev, loading: true, error: null }));

        requester({ page, size: PAGE_SIZE, signal: controller.signal })
            .then((payload) => {
                if (controller.signal.aborted) return;
                setState({
                    loading: false,
                    error: null,
                    data: payload,
                });
            })
            .catch((err) => {
                if (controller.signal.aborted) return;
                const message = err instanceof Error ? err.message : "데이터를 불러오는 중 오류가 발생했습니다.";
                setState({
                    loading: false,
                    error: message,
                    data: null,
                });
            });

        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, page, ...deps]);

    return [state, setState] as const;
}

type DeliverablesVariant = "default" | "blueprint";

function DeliverablesPage({
    mode,
    variant = "default",
    renderSidebar = true,
    onSidebarPropsChange,
    className,
    disableExclusiveRouting = false,
}: DeliverablesPageProps) {
    const navigate = useNavigate();
    const isBlueprint = variant === "blueprint";

    // 체크 상태 및 페이지 인덱스
    const [selections, setSelections] = useState<DeliverableSelection>(() => createSelection(mode));

    const [logoPage, setLogoPage] = useState(0);
    const [brandingPage, setBrandingPage] = useState(0);
    const [colorGuidePage, setColorGuidePage] = useState(0);
    const [tagQuery, setTagQuery] = useState("");
    const [tagResults, setTagResults] = useState<AssetSummary[]>([]);
    const [tagLoading, setTagLoading] = useState(false);
    const [tagError, setTagError] = useState<string | null>(null);
    const [tagApplied, setTagApplied] = useState<string | null>(null);
    const [isTagModalOpen, setTagModalOpen] = useState(false);

    // refetch 트리거용 nonce
    const [logoNonce, setLogoNonce] = useState(0);
    const [brandingNonce, setBrandingNonce] = useState(0);
    const [colorGuideNonce, setColorGuideNonce] = useState(0);

    // 액션 상태 (삭제/다운로드/복사 진행 여부)
    const [logoActions, setLogoActions] = useState<ActionState>(initialActionState);
    const [brandingActions, setBrandingActions] = useState<ActionState>(initialActionState);
    const [colorGuideActions, setColorGuideActions] = useState<ActionState>(initialActionState);
    const {
        detailState,
        openDetail,
        closeDetail,
        closeIfTarget,
        loadDetail,
        detailLogoPreview,
        detailBrandPreview,
        detailColorPreview,
        detailLogoData,
        detailBrandData,
        detailColorData,
    } = useDeliverableDetail();

    // mode가 변경되면 기본 선택 및 페이지 초기화
    useEffect(() => {
        setSelections(createSelection(mode));
        setLogoPage(0);
        setBrandingPage(0);
        setColorGuidePage(0);
        setLogoNonce((v) => v + 1);
        setBrandingNonce((v) => v + 1);
        setColorGuideNonce((v) => v + 1);
    }, [mode]);

    // 공통 데이터 로더 훅 사용
    const [logoState] = usePaginatedLoader<LogoListItem>(
        selections.logo,
        logoPage,
        ({ page, size, signal }) => fetchLogoPage({ page, size, 
            filter: "mine" 
        }, 
            { signal }),
        [logoNonce],
    );
    const [brandingState] = usePaginatedLoader<BrandStrategyListItem>(
        selections.branding,
        brandingPage,
        ({ page, size, signal }) => fetchBrandStrategyPage({ page, size, 
            filter: "mine" 
        }, 
            { signal }),
        [brandingNonce],
    );
    const [colorGuideState] = usePaginatedLoader<ColorGuideListItem>(
        selections.colorGuide,
        colorGuidePage,
        ({ page, size, signal }) => fetchColorGuidePage({ page, size, 
            filter: "mine" 
        }, 
            { signal }),
        [colorGuideNonce],
    );

    const activeCount = useMemo(
        () => Object.values(selections).filter(Boolean).length,
        [selections],
    );

    const ensureAtLeastOne = (next: DeliverableSelection, current: DeliverableSelection) => {
        if (Object.values(next).some(Boolean)) {
            return next;
        }
        alert("최소 한 개 이상의 카테고리는 선택되어 있어야 합니다.");
        return current;
    };

    const resetPageFor = useCallback((category: DeliverableCategory) => {
        if (category === "logo") setLogoPage(0);
        if (category === "branding") setBrandingPage(0);
        if (category === "colorGuide") setColorGuidePage(0);
    }, []);

    const bumpNonce = useCallback((category: DeliverableCategory) => {
        if (category === "logo") setLogoNonce((v) => v + 1);
        if (category === "branding") setBrandingNonce((v) => v + 1);
        if (category === "colorGuide") setColorGuideNonce((v) => v + 1);
    }, []);

    // 사이드바 토글 동작
    const handleToggle = useCallback((category: DeliverableCategory) => {
        setSelections((prev) => {
            const next: DeliverableSelection = { ...prev, [category]: !prev[category] };
            const coerced = ensureAtLeastOne(next, prev);
            // 새로 켜지는 경우 페이지 인덱스를 초기화
            if (!prev[category] && coerced[category]) {
                resetPageFor(category);
                bumpNonce(category);
            }
            return coerced;
        });
    }, [bumpNonce, resetPageFor]);

    // "단독 보기" 버튼 → 해당 전용 라우트 이동
    const handleExclusiveSelect = useCallback((category: DeliverableCategory) => {
        setSelections({
            logo: category === "logo",
            branding: category === "branding",
            colorGuide: category === "colorGuide",
        });
        setLogoPage(0);
        setBrandingPage(0);
        setColorGuidePage(0);
        setLogoNonce((v) => v + 1);
        setBrandingNonce((v) => v + 1);
        setColorGuideNonce((v) => v + 1);
        if (!disableExclusiveRouting) {
            navigate(CATEGORY_PATH[category]);
        }
    }, [disableExclusiveRouting, navigate]);

    const sidebarBridge = useMemo<DeliverablesSidebarBridge>(
        () => ({
            selections,
            onToggle: handleToggle,
            onExclusiveSelect: handleExclusiveSelect,
        }),
        [handleExclusiveSelect, handleToggle, selections],
    );

    useEffect(() => {
        onSidebarPropsChange?.(sidebarBridge);
    }, [onSidebarPropsChange, sidebarBridge]);

    // 공통 다운로드 유틸
    const downloadBinary = async (input: string, filename: string) => {
        const source = ensureDataUrl(input);
        try {
            if (source.startsWith("data:")) {
                const link = document.createElement("a");
                link.href = source;
                link.download = filename;
                link.click();
                return;
            }
            const response = await fetch(source);
            if (!response.ok) throw new Error("파일 다운로드에 실패했습니다.");
            const blob = await response.blob();
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (err) {
            const message = err instanceof Error ? err.message : "파일을 저장하지 못했습니다.";
            if (!source.startsWith("data:")) {
                alert(`이미지를 다운로드할 수 없습니다. 원격 저장소에서 CORS를 허용하지 않아 브라우저가 요청을 차단했습니다.\n(${message})`);
            } else {
                alert(message);
            }
        }
    };

    const copyToClipboard = async (text: string, fallbackMessage: string) => {
        if (!navigator.clipboard) {
            alert("클립보드 API를 사용할 수 없습니다.");
            return false;
        }
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error(err);
            alert(fallbackMessage);
            return false;
        }
    };

    // -----------------------------
    // 로고 카드 액션
    // -----------------------------
    const handleLogoDelete = async (id: number) => {
        setLogoActions((prev) => ({ ...prev, deletingId: id }));
        try {
            await deleteLogo(id);
            bumpNonce("logo");
            closeIfTarget("logo", id);
        } catch (err) {
            const message = err instanceof Error ? err.message : "로고 삭제에 실패했습니다.";
            alert(message);
        } finally {
            setLogoActions((prev) => ({ ...prev, deletingId: null }));
        }
    };

    const handleLogoDownload = async (item: LogoListItem) => {
        setLogoActions((prev) => ({ ...prev, downloadingId: item.id }));
        await downloadBinary(item.imageUrl, `logo-${item.id}.png`);
        setLogoActions((prev) => ({ ...prev, downloadingId: null }));
    };

    const handleLogoCopy = async (item: LogoListItem) => {
        setLogoActions((prev) => ({ ...prev, copyingId: item.id }));
        const normalized = ensureDataUrl(item.imageUrl);
        try {
            await copyImageToClipboard(normalized);
            alert("로고 이미지가 클립보드에 복사되었습니다.");
        } catch (err) {
            const message = err instanceof Error ? err.message : "로고 이미지를 복사하지 못했습니다.";
            if (!normalized.startsWith("data:")) {
                alert(`${message}\n원격 이미지가 CORS를 허용하지 않을 경우 복사가 차단될 수 있습니다.`);
            } else {
                alert(message);
            }
        } finally {
            setLogoActions((prev) => ({ ...prev, copyingId: null }));
        }
    };

    // -----------------------------
    // 브랜딩 전략 카드 액션
    // -----------------------------
    const handleBrandingDelete = async (id: number) => {
        setBrandingActions((prev) => ({ ...prev, deletingId: id }));
        try {
            await deleteBranding({ id });
            bumpNonce("branding");
            closeIfTarget("branding", id);
        } catch (err) {
            const message = err instanceof Error ? err.message : "브랜딩 전략 삭제에 실패했습니다.";
            alert(message);
        } finally {
            setBrandingActions((prev) => ({ ...prev, deletingId: null }));
        }
    };

    const handleBrandingCopy = async (item: BrandStrategyListItem) => {
        setBrandingActions((prev) => ({ ...prev, copyingId: item.id }));
        const text = item.markdown ?? item.summaryKo ?? item.briefKo;
        const ok = await copyToClipboard(text, "브랜딩 전략 복사에 실패했습니다.");
        if (ok) alert("브랜딩 전략이 클립보드에 복사되었습니다.");
        setBrandingActions((prev) => ({ ...prev, copyingId: null }));
    };

    const handleBrandingDownload = async (item: BrandStrategyListItem) => {
        setBrandingActions((prev) => ({ ...prev, downloadingId: item.id }));
        const text = item.markdown ?? item.summaryKo ?? item.briefKo;
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `branding-${item.id}.txt`;
        link.click();
        URL.revokeObjectURL(link.href);
        setBrandingActions((prev) => ({ ...prev, downloadingId: null }));
    };

    // -----------------------------
    // 컬러 가이드 카드 액션
    // -----------------------------
    const handleColorGuideDelete = async (id: number) => {
        setColorGuideActions((prev) => ({ ...prev, deletingId: id }));
        try {
            await deleteColorGuide(id);
            bumpNonce("colorGuide");
            closeIfTarget("colorGuide", id);
        } catch (err) {
            const message = err instanceof Error ? err.message : "컬러 가이드 삭제에 실패했습니다.";
            alert(message);
        } finally {
            setColorGuideActions((prev) => ({ ...prev, deletingId: null }));
        }
    };

    const handleColorGuideCopy = async (item: ColorGuideListItem) => {
        setColorGuideActions((prev) => ({ ...prev, copyingId: item.id }));
        const summary = [
            `Main: ${item.mainHex ?? "-"}`,
            `Sub: ${item.subHex ?? "-"}`,
            `Point: ${item.pointHex ?? "-"}`,
            `Background: ${item.backgroundHex ?? "-"}`,
        ].join("\n");
        const ok = await copyToClipboard(summary, "컬러 가이드 복사에 실패했습니다.");
        if (ok) alert("컬러 가이드 정보가 클립보드에 복사되었습니다.");
        setColorGuideActions((prev) => ({ ...prev, copyingId: null }));
    };

    const handleColorGuideDownload = async (item: ColorGuideListItem) => {
        setColorGuideActions((prev) => ({ ...prev, downloadingId: item.id }));
        const summary = [
            item.briefKo,
            `Main: ${item.mainHex ?? "-"}`,
            `Sub: ${item.subHex ?? "-"}`,
            `Point: ${item.pointHex ?? "-"}`,
            `Background: ${item.backgroundHex ?? "-"}`,
        ].join("\n");
        const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `color-guide-${item.id}.txt`;
        link.click();
        URL.revokeObjectURL(link.href);
        setColorGuideActions((prev) => ({ ...prev, downloadingId: null }));
    };

    const renderStatus = (message: string, variant: "info" | "error" = "info") => (
        <div className={`${s.status} ${variant === "error" ? s.error : ""}`}>
            {message}
        </div>
    );

    let detailToolbarProps: ProductToolbarProps | undefined;

    if (detailState.open && detailState.type === "logo" && detailLogoPreview) {
        const listItem = asLogoListItem(detailLogoData, detailLogoPreview);
        detailToolbarProps = {
            id: listItem.id,
            onDelete: handleLogoDelete,
            onDownload: (_id) => { void handleLogoDownload(listItem); },
            onCopy: (_id) => { void handleLogoCopy(listItem); },
            isDeleting: logoActions.deletingId === listItem.id,
            isDownloading: logoActions.downloadingId === listItem.id,
            isCopying: logoActions.copyingId === listItem.id,
        };
    } else if (detailState.open && detailState.type === "branding" && detailBrandPreview) {
        const listItem = asBrandStrategyListItem(detailBrandData, detailBrandPreview);
        detailToolbarProps = {
            id: listItem.id,
            onDelete: handleBrandingDelete,
            onDownload: (_id) => { void handleBrandingDownload(listItem); },
            onCopy: (_id) => { void handleBrandingCopy(listItem); },
            isDeleting: brandingActions.deletingId === listItem.id,
            isDownloading: brandingActions.downloadingId === listItem.id,
            isCopying: brandingActions.copyingId === listItem.id,
        };
    } else if (detailState.open && detailState.type === "colorGuide" && detailColorPreview) {
        const listItem = asColorGuideListItem(detailColorData, detailColorPreview);
        detailToolbarProps = {
            id: listItem.id,
            onDelete: handleColorGuideDelete,
            onDownload: (_id) => { void handleColorGuideDownload(listItem); },
            onCopy: (_id) => { void handleColorGuideCopy(listItem); },
            isDeleting: colorGuideActions.deletingId === listItem.id,
            isDownloading: colorGuideActions.downloadingId === listItem.id,
            isCopying: colorGuideActions.copyingId === listItem.id,
        };
    }

    const detailLogoForModal = detailState.open && detailState.type === "logo"
        ? (detailLogoData ?? (detailLogoPreview ? previewToLogoDetail(detailLogoPreview) : undefined))
        : undefined;
    const detailBrandForModal = detailState.open && detailState.type === "branding"
        ? (detailBrandData ?? (detailBrandPreview ? previewToBrandDetail(detailBrandPreview) : undefined))
        : undefined;
    const detailColorForModal = detailState.open && detailState.type === "colorGuide"
        ? (detailColorData ?? (detailColorPreview ? previewToColorGuideDetail(detailColorPreview) : undefined))
        : undefined;

    const pageClassName = [
        s.page,
        isBlueprint ? s.pageBlueprint : "",
        className ?? "",
    ].join(" ").trim();

    const layoutClassName = [
        s.layout,
        renderSidebar ? "" : s.layoutNoSidebar,
    ].join(" ").trim();

    const handleTagSearch = useCallback(async () => {
        const trimmed = tagQuery.trim();
        if (!trimmed) {
            setTagError("검색할 태그를 입력해주세요.");
            return;
        }
        setTagLoading(true);
        setTagError(null);
        try {
            const assets = await fetchAssetsByTag(trimmed);
            setTagResults(assets);
            setTagApplied(trimmed);
            setTagModalOpen(false);
        } catch (err) {
            const message = err instanceof Error ? err.message : "태그별 산출물을 불러오지 못했습니다.";
            setTagError(message);
            setTagResults([]);
        } finally {
            setTagLoading(false);
        }
    }, [tagQuery]);

    const resetTagSearch = () => {
        setTagResults([]);
        setTagApplied(null);
        setTagError(null);
        setTagQuery("");
    };

    const isTagSearchActive = Boolean(tagApplied);

    const tagLogoItems: LogoListItem[] = useMemo(
        () =>
            tagResults
                .filter((asset) => asset.assetType === "LOGO")
                .map((asset) => ({
                    id: asset.id,
                    prompt: asset.title,
                    imageUrl: asset.thumbnailUrl ?? "",
                    createdAt: asset.createdAt ?? "",
                })),
        [tagResults],
    );

    const tagBrandingItems: BrandStrategyListItem[] = useMemo(
        () =>
            tagResults
                .filter((asset) => asset.assetType === "BRAND_STRATEGY")
                .map((asset) => ({
                    id: asset.id,
                    briefKo: asset.title,
                    summaryKo: asset.title,
                    markdown: asset.title,
                    createdAt: asset.createdAt ?? "",
                })),
        [tagResults],
    );

    const tagColorGuideItems: ColorGuideListItem[] = useMemo(
        () =>
            tagResults
                .filter((asset) => asset.assetType === "COLOR_GUIDE")
                .map((asset) => ({
                    id: asset.id,
                    briefKo: asset.title,
                    style: undefined,
                    mainHex: undefined,
                    subHex: undefined,
                    pointHex: undefined,
                    backgroundHex: undefined,
                    mainDescription: undefined,
                    subDescription: undefined,
                    pointDescription: undefined,
                    backgroundDescription: undefined,
                    createdAt: asset.createdAt ?? "",
                })),
        [tagResults],
    );

    const tagDisplay = tagApplied
        ? (tagApplied.startsWith("#") ? tagApplied : `#${tagApplied}`)
        : null;

    return (
        <div className={pageClassName}>
            <div className={layoutClassName}>
                {renderSidebar && (
                    <DeliverablesSidebar
                        selections={selections}
                        onToggle={handleToggle}
                        onExclusiveSelect={handleExclusiveSelect}
                    />
                )}

                <div className={s.sections}>
                    <div className={s.headerBar}>
                        <div className={s.headerTitle}>{tagDisplay ? `${tagDisplay} 태그로 검색한 결과` : "전체 조회"}</div>
                        <div className={s.headerActions}>
                            {tagApplied && (
                                <button type="button" className={s.secondaryButton} onClick={resetTagSearch}>
                                    전체 조회로 돌아가기
                                </button>
                            )}
                            <button type="button" className={s.primaryButton} onClick={() => setTagModalOpen(true)}>
                                태그로 검색하기
                            </button>
                        </div>
                    </div>

                    {selections.logo && (
                        <DeliverableSection title="로고 산출물" variant={variant}>
                            {!isTagSearchActive && logoState.error && renderStatus(logoState.error, "error")}
                            {!isTagSearchActive && !logoState.loading && !logoState.error && !logoState.data?.content.length && renderStatus("저장된 로고 산출물이 없습니다.")}
                            {!isTagSearchActive && logoState.loading && renderStatus("로고 산출물을 불러오는 중입니다...")}

                            {isTagSearchActive && tagError && renderStatus(tagError, "error")}
                            {isTagSearchActive && !tagError && !tagLogoItems.length && renderStatus("검색 결과가 없습니다.")}

                            {(!isTagSearchActive && !!logoState.data?.content.length) || (isTagSearchActive && tagLogoItems.length > 0) ? (
                                <div className={s.logoGrid}>
                                    {(isTagSearchActive ? tagLogoItems : logoState.data?.content ?? []).map((item) => {
                                        const imageData = ensureDataUrl(item.imageUrl);
                                        return (
                                            <LogoCard
                                                key={item.id}
                                                id={item.id}
                                                logoBase64={imageData}
                                                onDelete={() => handleLogoDelete(item.id)}
                                                onCopy={() => handleLogoCopy(item)}
                                                onDownload={() => handleLogoDownload(item)}
                                                isDownloading={logoActions.downloadingId === item.id}
                                                isCopying={logoActions.copyingId === item.id}
                                                isDeleting={logoActions.deletingId === item.id}
                                                onSelect={(_id) => openDetail({ type: "logo", item })}
                                            />
                                        );
                                    })}
                                </div>
                            ) : null}

                            {!isTagSearchActive && logoState.data && (
                                <Pagination
                                    page={logoState.data.page}
                                    totalPages={logoState.data.totalPages}
                                    onChange={(next) => setLogoPage(next)}
                                />
                            )}
                        </DeliverableSection>
                    )}

                    {selections.branding && (
                        <DeliverableSection title="브랜딩 전략 산출물" variant={variant}>
                            {!isTagSearchActive && brandingState.error && renderStatus(brandingState.error, "error")}
                            {!isTagSearchActive && !brandingState.loading && !brandingState.error && !brandingState.data?.content.length && renderStatus("브랜딩 전략 산출물이 없습니다.")}
                            {!isTagSearchActive && brandingState.loading && renderStatus("브랜딩 전략을 불러오는 중입니다...")}

                            {isTagSearchActive && tagError && renderStatus(tagError, "error")}
                            {isTagSearchActive && !tagError && !tagBrandingItems.length && renderStatus("검색 결과가 없습니다.")}

                            {(!isTagSearchActive && !!brandingState.data?.content.length) || (isTagSearchActive && tagBrandingItems.length > 0) ? (
                                <div className={s.brandGrid}>
                                    {(isTagSearchActive ? tagBrandingItems : brandingState.data?.content ?? []).map((item) => (
                                        <BrandStrategyDeliverableCard
                                            key={item.id}
                                            item={item}
                                            variant={variant}
                                            onDelete={() => handleBrandingDelete(item.id)}
                                            onCopy={() => handleBrandingCopy(item)}
                                            onDownload={() => handleBrandingDownload(item)}
                                            isCopying={brandingActions.copyingId === item.id}
                                            isDownloading={brandingActions.downloadingId === item.id}
                                            isDeleting={brandingActions.deletingId === item.id}
                                            onSelect={(_id) => openDetail({ type: "branding", item })}
                                        />
                                    ))}
                                </div>
                            ) : null}

                            {!isTagSearchActive && brandingState.data && (
                                <Pagination
                                    page={brandingState.data.page}
                                    totalPages={brandingState.data.totalPages}
                                    onChange={(next) => setBrandingPage(next)}
                                />
                            )}
                        </DeliverableSection>
                    )}

                    {selections.colorGuide && (
                        <DeliverableSection title="컬러 가이드 산출물" variant={variant}>
                            {!isTagSearchActive && colorGuideState.error && renderStatus(colorGuideState.error, "error")}
                            {!isTagSearchActive && !colorGuideState.loading && !colorGuideState.error && !colorGuideState.data?.content.length && renderStatus("컬러 가이드 산출물이 없습니다.")}
                            {!isTagSearchActive && colorGuideState.loading && renderStatus("컬러 가이드를 불러오는 중입니다...")}

                            {isTagSearchActive && tagError && renderStatus(tagError, "error")}
                            {isTagSearchActive && !tagError && !tagColorGuideItems.length && renderStatus("검색 결과가 없습니다.")}

                            {(!isTagSearchActive && !!colorGuideState.data?.content.length) || (isTagSearchActive && tagColorGuideItems.length > 0) ? (
                                <div className={s.colorGrid}>
                                    {(isTagSearchActive ? tagColorGuideItems : colorGuideState.data?.content ?? []).map((item) => (
                                        <ColorGuideDeliverableCard
                                            key={item.id}
                                            item={item}
                                            variant={variant}
                                            onDelete={() => handleColorGuideDelete(item.id)}
                                            onCopy={() => handleColorGuideCopy(item)}
                                            onDownload={() => handleColorGuideDownload(item)}
                                            isCopying={colorGuideActions.copyingId === item.id}
                                            isDownloading={colorGuideActions.downloadingId === item.id}
                                            isDeleting={colorGuideActions.deletingId === item.id}
                                            onSelect={(_id) => openDetail({ type: "colorGuide", item })}
                                        />
                                    ))}
                                </div>
                            ) : null}

                            {!isTagSearchActive && colorGuideState.data && (
                                <Pagination
                                    page={colorGuideState.data.page}
                                    totalPages={colorGuideState.data.totalPages}
                                    onChange={(next) => setColorGuidePage(next)}
                                />
                            )}
                        </DeliverableSection>
                    )}

                    {activeCount === 0 && renderStatus("표시할 산출물을 선택해주세요.")}
                </div>
            </div>

            {detailState.open && detailState.type === "logo" && (
                <DeliverableDetailModal
                    type="logo"
                    variant={variant}
                    data={detailLogoForModal}
                    loading={detailState.loading}
                    error={detailState.error ?? undefined}
                    onClose={closeDetail}
                    onRetry={
                        detailState.error && detailState.id != null
                            ? () => loadDetail("logo", detailState.id!)
                            : undefined
                    }
                    toolbarProps={detailToolbarProps}
                />
            )}

            {detailState.open && detailState.type === "branding" && (
                <DeliverableDetailModal
                    type="branding"
                    variant={variant}
                    data={detailBrandForModal}
                    loading={detailState.loading}
                    error={detailState.error ?? undefined}
                    onClose={closeDetail}
                    onRetry={
                        detailState.error && detailState.id != null
                            ? () => loadDetail("branding", detailState.id!)
                            : undefined
                    }
                    toolbarProps={detailToolbarProps}
                />
            )}

            {detailState.open && detailState.type === "colorGuide" && (
                <DeliverableDetailModal
                    type="colorGuide"
                    variant={variant}
                    data={detailColorForModal}
                    loading={detailState.loading}
                    error={detailState.error ?? undefined}
                    onClose={closeDetail}
                    onRetry={
                        detailState.error && detailState.id != null
                            ? () => loadDetail("colorGuide", detailState.id!)
                            : undefined
                    }
                    toolbarProps={detailToolbarProps}
                />
            )}

            {isTagModalOpen && (
                <div className={s.tagModalOverlay} role="dialog" aria-modal="true" aria-label="태그 검색">
                    <div className={s.tagModal} onClick={(event) => event.stopPropagation()}>
                        <header className={s.tagModalHeader}>
                            <h3>태그 검색</h3>
                            <button type="button" className={s.tagModalClose} onClick={() => setTagModalOpen(false)} aria-label="닫기">
                                ×
                            </button>
                        </header>
                        <div className={s.tagModalBody}>
                            <input
                                type="text"
                                className={s.tagInput}
                                placeholder="검색할 태그를 입력하세요"
                                value={tagQuery}
                                onChange={(event) => setTagQuery(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        void handleTagSearch();
                                    }
                                }}
                            />
                            <div className={s.tagModalActions}>
                                <button
                                    type="button"
                                    className={s.primaryButton}
                                    onClick={() => void handleTagSearch()}
                                    disabled={tagLoading}
                                >
                                    {tagLoading ? "검색 중…" : "태그로 검색하기"}
                                </button>
                                <button type="button" className={s.secondaryButton} onClick={() => setTagModalOpen(false)}>
                                    닫기
                                </button>
                            </div>
                            {tagError && <div className={`${s.status} ${s.error}`}>{tagError}</div>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// 라우팅 전용 래퍼 컴포넌트들
type StandaloneDeliverablesProps = Omit<DeliverablesPageProps, "mode">;

export default function DeliverablesAllPage(props: StandaloneDeliverablesProps = {}) {
    return <DeliverablesPage mode="all" {...props} />;
}

export function DeliverablesBlueprintPreviewPage(props: StandaloneDeliverablesProps = {}) {
    return <DeliverablesPage mode="all" variant="blueprint" {...props} />;
}

export function DeliverablesLogoPage(props: StandaloneDeliverablesProps = {}) {
    return <DeliverablesPage mode="logo" {...props} />;
}

export function DeliverablesBrandingPage(props: StandaloneDeliverablesProps = {}) {
    return <DeliverablesPage mode="branding" {...props} />;
}

export function DeliverablesColorGuidePage(props: StandaloneDeliverablesProps = {}) {
    return <DeliverablesPage mode="colorGuide" {...props} />;
}
