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
    fetchLogoDetail,
    type LogoListItem,
    type LogoDetail,
} from "../custom_api/logo";
import {
    deleteBranding,
    fetchBrandStrategyPage,
    fetchBrandStrategyDetail,
    type BrandStrategyListItem,
    type BrandStrategyDetail,
} from "../custom_api/branding";
import {
    deleteColorGuide,
    fetchColorGuidePage,
    fetchColorGuideDetail,
    type ColorGuideListItem,
    type ColorGuideDetail,
} from "../custom_api/colorguide";
import type { PaginatedResponse } from "../custom_api/types";
import { copyImageToClipboard } from "../utils/clipboard";
import { ensureDataUrl } from "../utils/image";
import type { ProductToolbarProps } from "../molecules/ProductToolbar/ProductToolbar";
// 태그 API 패널용
import type { TagApiSettings } from "../custom_api/tags";
import type { HttpMethod } from "../custom_api/types";
import { TagApiSettingsPanel } from "../components/TagApiSettingsPanel/TagApiSettingsPanel";

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

type DetailType = "logo" | "branding" | "colorGuide";

type DetailState =
    | { open: false }
    | {
        open: true;
        type: DetailType;
        id: number;
        loading: boolean;
        error: string | null;
        preview: LogoListItem | BrandStrategyListItem | ColorGuideListItem;
        data?: LogoDetail | BrandStrategyDetail | ColorGuideDetail;
    };

type DetailPreview =
    | { type: "logo"; item: LogoListItem }
    | { type: "branding"; item: BrandStrategyListItem }
    | { type: "colorGuide"; item: ColorGuideListItem };

const asLogoListItem = (detail?: LogoDetail, fallback?: LogoListItem): LogoListItem => ({
    id: detail?.id ?? fallback?.id ?? 0,
    prompt: detail?.prompt ?? fallback?.prompt ?? "",
    imageUrl: detail?.imageUrl ?? fallback?.imageUrl ?? "",
    createdAt: detail?.createdAt ?? fallback?.createdAt ?? "",
});

const asBrandStrategyListItem = (
    detail?: BrandStrategyDetail,
    fallback?: BrandStrategyListItem,
): BrandStrategyListItem => ({
    id: detail?.id ?? fallback?.id ?? 0,
    briefKo: detail?.briefKo ?? fallback?.briefKo ?? "",
    style: detail?.style ?? fallback?.style,
    mainHex: fallback?.mainHex,
    pointHex: fallback?.pointHex,
    summaryKo: detail?.summaryKo ?? fallback?.summaryKo,
    markdown: detail?.markdown ?? fallback?.markdown,
    createdAt: detail?.createdAt ?? fallback?.createdAt ?? "",
});

const asColorGuideListItem = (
    detail?: ColorGuideDetail,
    fallback?: ColorGuideListItem,
): ColorGuideListItem => ({
    id: detail?.id ?? fallback?.id ?? 0,
    briefKo: detail?.briefKo ?? fallback?.briefKo ?? "",
    style: detail?.style ?? fallback?.style,
    mainHex: detail?.guide?.main.hex ?? fallback?.mainHex,
    subHex: detail?.guide?.sub.hex ?? fallback?.subHex,
    pointHex: detail?.guide?.point.hex ?? fallback?.pointHex,
    backgroundHex: detail?.guide?.background.hex ?? fallback?.backgroundHex,
    mainDescription: detail?.guide?.main.description ?? fallback?.mainDescription,
    subDescription: detail?.guide?.sub.description ?? fallback?.subDescription,
    pointDescription: detail?.guide?.point.description ?? fallback?.pointDescription,
    backgroundDescription: detail?.guide?.background.description ?? fallback?.backgroundDescription,
    createdAt: detail?.createdAt ?? fallback?.createdAt ?? "",
});

const previewToLogoDetail = (preview: LogoListItem): LogoDetail => ({
    id: preview.id,
    prompt: preview.prompt,
    imageUrl: preview.imageUrl,
    createdAt: preview.createdAt,
});

const previewToBrandDetail = (preview: BrandStrategyListItem): BrandStrategyDetail => ({
    id: preview.id,
    briefKo: preview.briefKo,
    style: preview.style,
    caseType: undefined,
    markdown: preview.markdown ?? preview.summaryKo ?? preview.briefKo,
    summaryKo: preview.summaryKo,
    createdAt: preview.createdAt,
});

const previewToColorGuideDetail = (preview: ColorGuideListItem): ColorGuideDetail => ({
    id: preview.id,
    briefKo: preview.briefKo,
    style: preview.style,
    guide: {
        main: { hex: preview.mainHex ?? "", description: preview.mainDescription ?? "" },
        sub: { hex: preview.subHex ?? "", description: preview.subDescription ?? "" },
        point: { hex: preview.pointHex ?? "", description: preview.pointDescription ?? "" },
        background: { hex: preview.backgroundHex ?? "", description: preview.backgroundDescription ?? "" },
    },
    createdAt: preview.createdAt,
});

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

    // 태그 API 패널용
    const [tagApiSettings, setTagApiSettings] = useState<TagApiSettings>({
        list: { method: "GET", url: "" },
        add: { method: "POST", url: "" },
        create: { method: "POST", url: "" },
        delete: { method: "DELETE", url: "" },
    });
    const [logoPage, setLogoPage] = useState(0);
    const [brandingPage, setBrandingPage] = useState(0);
    const [colorGuidePage, setColorGuidePage] = useState(0);

    // refetch 트리거용 nonce
    const [logoNonce, setLogoNonce] = useState(0);
    const [brandingNonce, setBrandingNonce] = useState(0);
    const [colorGuideNonce, setColorGuideNonce] = useState(0);

    // 액션 상태 (삭제/다운로드/복사 진행 여부)
    const [logoActions, setLogoActions] = useState<ActionState>(initialActionState);
    const [brandingActions, setBrandingActions] = useState<ActionState>(initialActionState);
    const [colorGuideActions, setColorGuideActions] = useState<ActionState>(initialActionState);
    const [detailState, setDetailState] = useState<DetailState>({ open: false });

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

    const loadDetail = useCallback(async (type: DetailType, id: number) => {
        try {
            let data: LogoDetail | BrandStrategyDetail | ColorGuideDetail;
            if (type === "logo") {
                data = await fetchLogoDetail(id);
            } else if (type === "branding") {
                data = await fetchBrandStrategyDetail(id);
            } else {
                data = await fetchColorGuideDetail(id);
            }
            setDetailState((prev) => {
                if (prev.open && prev.type === type && prev.id === id) {
                    return { ...prev, loading: false, error: null, data };
                }
                return prev;
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : "상세 정보를 불러오지 못했습니다.";
            setDetailState((prev) => {
                if (prev.open && prev.type === type && prev.id === id) {
                    return { ...prev, loading: false, error: message };
                }
                return prev;
            });
        }
    }, []);

    const openDetail = useCallback(
        (payload: DetailPreview) => {
            setDetailState({
                open: true,
                type: payload.type,
                id: payload.item.id,
                loading: true,
                error: null,
                preview: payload.item,
                data: undefined,
            });
            void loadDetail(payload.type, payload.item.id);
        },
        [loadDetail],
    );

    const closeDetail = useCallback(() => {
        setDetailState({ open: false });
    }, []);

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

    // 태그 패널 상태 관리
    const handleTagConfigChange = (section: keyof TagApiSettings, field: "url" | "method", value: string) => {
        setTagApiSettings((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: field === "method" ? (value as HttpMethod) : value,
            },
        }));
    };

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
            setDetailState((prev) => (prev.open && prev.type === "logo" && prev.id === id ? { open: false } : prev));
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
            setDetailState((prev) => (prev.open && prev.type === "branding" && prev.id === id ? { open: false } : prev));
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
            setDetailState((prev) => (prev.open && prev.type === "colorGuide" && prev.id === id ? { open: false } : prev));
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

    const detailLogoPreview = detailState.open && detailState.type === "logo"
        ? (detailState.preview as LogoListItem)
        : undefined;
    const detailBrandPreview = detailState.open && detailState.type === "branding"
        ? (detailState.preview as BrandStrategyListItem)
        : undefined;
    const detailColorPreview = detailState.open && detailState.type === "colorGuide"
        ? (detailState.preview as ColorGuideListItem)
        : undefined;

    const detailLogoData = detailState.open && detailState.type === "logo"
        ? (detailState.data as LogoDetail | undefined)
        : undefined;
    const detailBrandData = detailState.open && detailState.type === "branding"
        ? (detailState.data as BrandStrategyDetail | undefined)
        : undefined;
    const detailColorData = detailState.open && detailState.type === "colorGuide"
        ? (detailState.data as ColorGuideDetail | undefined)
        : undefined;

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
                    {selections.logo && (
                        <DeliverableSection title="로고 산출물" variant={variant}>
                            {logoState.error && renderStatus(logoState.error, "error")}
                            {!logoState.loading && !logoState.error && !logoState.data?.content.length && renderStatus("저장된 로고 산출물이 없습니다.")}
                            {logoState.loading && renderStatus("로고 산출물을 불러오는 중입니다...")}

                            {!!logoState.data?.content.length && (
                                <div className={s.logoGrid}>
                                    {logoState.data.content.map((item) => {
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
                            )}

                            {logoState.data && logoState.data.totalPages > 1 && (
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
                            {brandingState.error && renderStatus(brandingState.error, "error")}
                            {!brandingState.loading && !brandingState.error && !brandingState.data?.content.length && renderStatus("브랜딩 전략 산출물이 없습니다.")}
                            {brandingState.loading && renderStatus("브랜딩 전략을 불러오는 중입니다...")}

                            {!!brandingState.data?.content.length && (
                                <div className={s.brandGrid}>
                                    {brandingState.data.content.map((item) => (
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
                            )}

                            {brandingState.data && brandingState.data.totalPages > 1 && (
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
                            {colorGuideState.error && renderStatus(colorGuideState.error, "error")}
                            {!colorGuideState.loading && !colorGuideState.error && !colorGuideState.data?.content.length && renderStatus("컬러 가이드 산출물이 없습니다.")}
                            {colorGuideState.loading && renderStatus("컬러 가이드를 불러오는 중입니다...")}

                            {!!colorGuideState.data?.content.length && (
                                <div className={s.colorGrid}>
                                    {colorGuideState.data.content.map((item) => (
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
                            )}

                            {colorGuideState.data && colorGuideState.data.totalPages > 1 && (
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

            <TagApiSettingsPanel settings={tagApiSettings} onChange={handleTagConfigChange} />


            {detailState.open && detailState.type === "logo" && (
                <DeliverableDetailModal
                    type="logo"
                    variant={variant}
                    data={detailLogoForModal}
                    loading={detailState.loading}
                    error={detailState.error ?? undefined}
                    onClose={closeDetail}
                    onRetry={detailState.error ? () => loadDetail("logo", detailState.id) : undefined}
                    toolbarProps={detailToolbarProps}
                    // 태그 API 패널용
                    tagApiSettings={tagApiSettings}
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
                    onRetry={detailState.error ? () => loadDetail("branding", detailState.id) : undefined}
                    toolbarProps={detailToolbarProps}
                    // 태그 API 패널용
                    tagApiSettings={tagApiSettings}
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
                    onRetry={detailState.error ? () => loadDetail("colorGuide", detailState.id) : undefined}
                    toolbarProps={detailToolbarProps}
                    // 태그 API 패널용
                    tagApiSettings={tagApiSettings}
                />
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
