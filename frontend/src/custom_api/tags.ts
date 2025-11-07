import type { HttpMethod } from "./types";

export type TagRecord = {
    id: number;
    name: string;
};

export type TagApiConfig = {
    url?: string;
    method?: HttpMethod;
};

export type TagApiSettings = {
    list: TagApiConfig;
    add: TagApiConfig;
    create: TagApiConfig;
    delete: TagApiConfig;
};

export const FALLBACK_TAGS: TagRecord[] = [
    { id: 101, name: "패션" },
    { id: 102, name: "브랜딩" },
    { id: 103, name: "SNS" },
    { id: 104, name: "스타트업" },
    { id: 105, name: "이벤트" },
];

const JSON_HEADERS = {
    "Content-Type": "application/json",
};

async function requestWithConfig<T>(
    config: TagApiConfig,
    init?: RequestInit,
): Promise<T | null> {
    if (!config.url || !config.method) return null;

    console.info("[tag API] remote request:", config.method, config.url);
    const response = await fetch(config.url, {
        method: config.method,
        headers: {
            ...JSON_HEADERS,
            ...(init?.headers ?? {}),
        },
        credentials: "include",
        ...init,
    });

    if (!response.ok) {
        throw new Error(`Tag API request failed (${response.status})`);
    }

    if (response.status === 204) return null;

    return (await response.json()) as T;
}

export async function fetchTagList(config: TagApiConfig): Promise<TagRecord[]> {
    try {
        const remote = await requestWithConfig<{ tagList: TagRecord[] }>(config);
        if (!remote) {
            console.info("[tag API] fetchTagList fallback: using local tags");
        }
        return remote?.tagList ?? FALLBACK_TAGS;
    } catch (error) {
        console.warn("[tag API] fetchTagList fallback:", error);
        return FALLBACK_TAGS;
    }
}

export async function addTag(config: TagApiConfig, tag: TagRecord): Promise<TagRecord> {
    try {
        const remote = await requestWithConfig<TagRecord>(config, {
            body: JSON.stringify({ tag }),
        });
        if (!remote) {
            console.info("[tag API] addTag fallback: using provided tag");
            return tag;
        }
        return remote;
    } catch (error) {
        console.warn("[tag API] addTag fallback:", error);
        return tag;
    }
}

export async function createTag(config: TagApiConfig, newTag: TagRecord): Promise<TagRecord> {
    try {
        const remote = await requestWithConfig<TagRecord>(config, {
            body: JSON.stringify({ newTag }),
        });
        if (!remote) {
            console.info("[tag API] createTag fallback: using provided newTag");
        }
        return remote ?? newTag;
    } catch (error) {
        console.warn("[tag API] createTag fallback:", error);
        return newTag;
    }
}

export async function deleteTag(config: TagApiConfig, tag: TagRecord): Promise<boolean> {
    try {
        const remote = await requestWithConfig(config, {
            body: JSON.stringify({ tagToDelete: tag }),
        });
        if (!remote) {
            console.info("[tag API] deleteTag fallback: assuming success");
        }
        return true;
    } catch (error) {
        console.warn("[tag API] deleteTag fallback:", error);
        return true;
    }
}
