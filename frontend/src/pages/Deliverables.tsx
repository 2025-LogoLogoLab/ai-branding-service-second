// src/pages/Deliverables.tsx
// 마이페이지 > 산출물 관리 진입 시 노출되는 메인 페이지.
// - 좌측 사이드바(DeliverablesSidebar)에서 카테고리 토글을 제어하면
//   선택된 항목에 맞춰 우측 콘텐츠 영역이 갱신된다.
// - 제공된 시안에 따라 총 4개의 뷰(전체/로고/브랜딩 전략/컬러 가이드)를
//   라우터 레벨에서 개별 페이지로 구성하되, 실제 렌더링 로직은 하나의
//   DeliverablesPage 컴포넌트가 담당한다.

import { useEffect, useMemo, useState } from "react";
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

function DeliverablesPage({ mode }: { mode: DeliverablesMode }) {
    const navigate = useNavigate();

    // 체크 상태 및 페이지 인덱스
    const [selections, setSelections] = useState<DeliverableSelection>(() => createSelection(mode));
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

    const resetPageFor = (category: DeliverableCategory) => {
        if (category === "logo") setLogoPage(0);
        if (category === "branding") setBrandingPage(0);
        if (category === "colorGuide") setColorGuidePage(0);
    };

    const bumpNonce = (category: DeliverableCategory) => {
        if (category === "logo") setLogoNonce((v) => v + 1);
        if (category === "branding") setBrandingNonce((v) => v + 1);
        if (category === "colorGuide") setColorGuideNonce((v) => v + 1);
    };

    // 사이드바 토글 동작
    const handleToggle = (category: DeliverableCategory) => {
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
    };

    // "단독 보기" 버튼 → 해당 전용 라우트 이동
    const handleExclusiveSelect = (category: DeliverableCategory) => {
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
        navigate(CATEGORY_PATH[category]);
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

    return (
        <div className={s.page}>
            <div className={s.layout}>
                <DeliverablesSidebar
                    selections={selections}
                    onToggle={handleToggle}
                    onExclusiveSelect={handleExclusiveSelect}
                />

                <div className={s.sections}>
                    {selections.logo && (
                        <DeliverableSection title="로고 산출물">
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
                        <DeliverableSection title="브랜딩 전략 산출물">
                            {brandingState.error && renderStatus(brandingState.error, "error")}
                            {!brandingState.loading && !brandingState.error && !brandingState.data?.content.length && renderStatus("브랜딩 전략 산출물이 없습니다.")}
                            {brandingState.loading && renderStatus("브랜딩 전략을 불러오는 중입니다...")}

                            {!!brandingState.data?.content.length && (
                                <div className={s.brandGrid}>
                                    {brandingState.data.content.map((item) => (
                                        <BrandStrategyDeliverableCard
                                            key={item.id}
                                            item={item}
                                            onDelete={() => handleBrandingDelete(item.id)}
                                            onCopy={() => handleBrandingCopy(item)}
                                            onDownload={() => handleBrandingDownload(item)}
                                            isCopying={brandingActions.copyingId === item.id}
                                            isDownloading={brandingActions.downloadingId === item.id}
                                            isDeleting={brandingActions.deletingId === item.id}
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
                        <DeliverableSection title="컬러 가이드 산출물">
                            {colorGuideState.error && renderStatus(colorGuideState.error, "error")}
                            {!colorGuideState.loading && !colorGuideState.error && !colorGuideState.data?.content.length && renderStatus("컬러 가이드 산출물이 없습니다.")}
                            {colorGuideState.loading && renderStatus("컬러 가이드를 불러오는 중입니다...")}

                            {!!colorGuideState.data?.content.length && (
                                <div className={s.colorGrid}>
                                    {colorGuideState.data.content.map((item) => (
                                        <ColorGuideDeliverableCard
                                            key={item.id}
                                            item={item}
                                            onDelete={() => handleColorGuideDelete(item.id)}
                                            onCopy={() => handleColorGuideCopy(item)}
                                            onDownload={() => handleColorGuideDownload(item)}
                                            isCopying={colorGuideActions.copyingId === item.id}
                                            isDownloading={colorGuideActions.downloadingId === item.id}
                                            isDeleting={colorGuideActions.deletingId === item.id}
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
        </div>
    );
}

// 라우팅 전용 래퍼 컴포넌트들
export default function DeliverablesAllPage() {
    return <DeliverablesPage mode="all" />;
}

export function DeliverablesLogoPage() {
    return <DeliverablesPage mode="logo" />;
}

export function DeliverablesBrandingPage() {
    return <DeliverablesPage mode="branding" />;
}

export function DeliverablesColorGuidePage() {
    return <DeliverablesPage mode="colorGuide" />;
}
