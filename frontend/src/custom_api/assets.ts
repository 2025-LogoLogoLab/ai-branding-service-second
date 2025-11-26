const basePath = import.meta.env.VITE_API_BASE_URL;

export type AssetType = "LOGO" | "BRAND_STRATEGY" | "COLOR_GUIDE";

export type AssetSummary = {
    id: number;
    assetType: AssetType;
    title: string;
    thumbnailUrl?: string | null;
    createdAt?: string | null;
};

export type AssetPage = {
    content: AssetSummary[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
};

type FetchAssetsByTagParams = {
    tag: string;
    page?: number;
    size?: number;
    signal?: AbortSignal;
};

export async function fetchAssetsByTag({
    tag,
    page = 0,
    size = 10,
    signal,
}: FetchAssetsByTagParams): Promise<AssetPage> {
    const trimmed = tag.trim();
    if (!trimmed) {
        throw new Error("검색할 태그를 입력해주세요.");
    }

    const url = new URL(`${basePath}/my-assets`);
    url.searchParams.set("tag", trimmed);
    url.searchParams.set("page", String(page));
    url.searchParams.set("size", String(size));

    console.log("[assets] fetchAssetsByTag request", { url: url.toString(), tag, page, size });

    const response = await fetch(url.toString(), {
        method: "GET",
        credentials: "include",
        signal,
    });

    const raw = await response.text();
    let payload: unknown = null;
    try {
        payload = raw ? JSON.parse(raw) : null;
    } catch (err) {
        console.warn("[assets] fetchAssetsByTag JSON parse error", err);
        payload = raw;
    }
    console.log("[assets] fetchAssetsByTag response", payload);

    if (!response.ok) {
        throw new Error("태그별 산출물을 불러오지 못했습니다. " + response.status);
    }

    // 새 스펙: 페이징 객체 형태
    const data = (payload ?? {}) as Partial<AssetPage>;
    const content = Array.isArray(data.content) ? data.content : [];

    return {
        content: content
            .map((item) => ({
                id: Number(item?.id) || 0,
                assetType: (item as any)?.assetType as AssetType,
                title: typeof (item as any)?.title === "string" ? (item as any).title : "",
                thumbnailUrl: (item as any)?.thumbnailUrl ?? null,
                createdAt: typeof (item as any)?.createdAt === "string" ? (item as any).createdAt : null,
            }))
            .filter((item) => item.id > 0 && Boolean(item.assetType)),
        page: Number(data.page) || 0,
        size: Number(data.size) || size,
        totalElements: Number(data.totalElements) || content.length,
        totalPages: Number(data.totalPages) || 1,
        last: Boolean(data.last),
    };
}
