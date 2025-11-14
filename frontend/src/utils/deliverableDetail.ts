import { useCallback, useState } from "react";
import {
    fetchLogoDetail,
    type LogoDetail,
    type LogoListItem,
} from "../custom_api/logo";
import {
    fetchBrandStrategyDetail,
    type BrandStrategyDetail,
    type BrandStrategyListItem,
} from "../custom_api/branding";
import {
    fetchColorGuideDetail,
    type ColorGuideDetail,
    type ColorGuideListItem,
} from "../custom_api/colorguide";

export type DetailType = "logo" | "branding" | "colorGuide";

export type DetailState = {
    open: boolean;
    type?: DetailType;
    id?: number;
    loading?: boolean;
    error?: string | null;
    preview?: LogoListItem | BrandStrategyListItem | ColorGuideListItem;
    data?: LogoDetail | BrandStrategyDetail | ColorGuideDetail;
};

export type DetailPreview =
    | { type: "logo"; item: LogoListItem }
    | { type: "branding"; item: BrandStrategyListItem }
    | { type: "colorGuide"; item: ColorGuideListItem };

export const asLogoListItem = (detail?: LogoDetail, fallback?: LogoListItem): LogoListItem => ({
    id: detail?.id ?? fallback?.id ?? 0,
    prompt: detail?.prompt ?? fallback?.prompt ?? "",
    imageUrl: detail?.imageUrl ?? fallback?.imageUrl ?? "",
    createdAt: detail?.createdAt ?? fallback?.createdAt ?? "",
});

export const asBrandStrategyListItem = (
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

export const asColorGuideListItem = (
    detail?: ColorGuideDetail,
    fallback?: ColorGuideListItem,
): ColorGuideListItem => ({
    id: detail?.id ?? fallback?.id ?? 0,
    briefKo: detail?.briefKo ?? fallback?.briefKo ?? "",
    style: detail?.style ?? fallback?.style,
    mainHex: detail?.guide.main.hex ?? fallback?.mainHex,
    subHex: detail?.guide.sub.hex ?? fallback?.subHex,
    pointHex: detail?.guide.point.hex ?? fallback?.pointHex,
    backgroundHex: detail?.guide.background.hex ?? fallback?.backgroundHex,
    mainDescription: detail?.guide.main.description ?? fallback?.mainDescription,
    subDescription: detail?.guide.sub.description ?? fallback?.subDescription,
    pointDescription: detail?.guide.point.description ?? fallback?.pointDescription,
    backgroundDescription: detail?.guide.background.description ?? fallback?.backgroundDescription,
    createdAt: detail?.createdAt ?? fallback?.createdAt ?? "",
});

export const previewToLogoDetail = (preview: LogoListItem): LogoDetail => ({
    id: preview.id,
    prompt: preview.prompt,
    imageUrl: preview.imageUrl,
    createdAt: preview.createdAt,
});

export const previewToBrandDetail = (preview: BrandStrategyListItem): BrandStrategyDetail => ({
    id: preview.id,
    briefKo: preview.briefKo,
    markdown: preview.markdown ?? preview.summaryKo ?? "",
    summaryKo: preview.summaryKo,
    style: preview.style,
    createdAt: preview.createdAt,
});

export const previewToColorGuideDetail = (preview: ColorGuideListItem): ColorGuideDetail => ({
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

export function useDeliverableDetail() {
    const [detailState, setDetailState] = useState<DetailState>({ open: false });

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

    const closeIfTarget = useCallback((type: DetailType, id: number) => {
        setDetailState((prev) => (prev.open && prev.type === type && prev.id === id ? { open: false } : prev));
    }, []);

    const detailLogoPreview =
        detailState.open && detailState.type === "logo" ? (detailState.preview as LogoListItem) : undefined;
    const detailBrandPreview =
        detailState.open && detailState.type === "branding" ? (detailState.preview as BrandStrategyListItem) : undefined;
    const detailColorPreview =
        detailState.open && detailState.type === "colorGuide"
            ? (detailState.preview as ColorGuideListItem)
            : undefined;

    const detailLogoData =
        detailState.open && detailState.type === "logo" ? (detailState.data as LogoDetail | undefined) : undefined;
    const detailBrandData =
        detailState.open && detailState.type === "branding"
            ? (detailState.data as BrandStrategyDetail | undefined)
            : undefined;
    const detailColorData =
        detailState.open && detailState.type === "colorGuide"
            ? (detailState.data as ColorGuideDetail | undefined)
            : undefined;

    return {
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
    };
}
