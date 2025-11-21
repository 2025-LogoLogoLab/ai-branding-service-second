const basePath = import.meta.env.VITE_API_BASE_URL;

const tagEndpoint = `${basePath}/tags`;

const JSON_HEADERS = {
    "Content-Type": "application/json",
};

export type TagRecord = {
    id?: number;
    name: string;
};

export type TagAttachTarget = "logo" | "branding" | "colorGuide";

const TARGET_PATH: Record<TagAttachTarget, string> = {
    logo: "logo",
    branding: "brand-strategy",
    colorGuide: "color-guide",
};

const normalizeTag = (raw: unknown): TagRecord => {
    if (typeof raw === "string") {
        return {
            id: 0,
            name: raw,
        };
    }
    if (typeof raw === "number") {
        return {
            id: raw,
            name: String(raw),
        };
    }
    if (raw && typeof raw === "object") {
        const record = raw as Record<string, unknown>;
        const id = Number(record.id);
        const nameValue = typeof record.name === "string" ? record.name : "";
        return {
            id: Number.isFinite(id) ? id : 0,
            name: nameValue,
        };
    }
    return { id: 0, name: "" };
};

const ensureTagList = (payload: unknown): TagRecord[] => {
    if (Array.isArray(payload)) {
        return payload.map(normalizeTag).filter((tag) => Boolean(tag.name));
    }
    if (payload && typeof payload === "object") {
        const record = payload as Record<string, unknown>;
        if (Array.isArray(record.tags)) {
            return record.tags.map(normalizeTag).filter((tag) => Boolean(tag.name));
        }
        if (Array.isArray(record.tagList)) {
            return record.tagList.map(normalizeTag).filter((tag) => Boolean(tag.name));
        }
        if (Array.isArray(record.data)) {
            return record.data.map(normalizeTag).filter((tag) => Boolean(tag.name));
        }
    }
    return [];
};

export async function fetchTagList(): Promise<TagRecord[]> {
    const response = await fetch(tagEndpoint, {
        method: "GET",
        credentials: "include",
    });

    const raw = await response.text();
    let payload: unknown = null;
    try {
        payload = raw ? JSON.parse(raw) : null;
    } catch (err) {
        console.warn("[tags] fetchTagList JSON parse error", err);
        payload = raw;
    }
    console.log("[tags] fetchTagList response", payload);

    if (!response.ok) {
        throw new Error("태그 목록을 불러오지 못했습니다. " + response.status);
    }

    const tags = ensureTagList(payload ?? []);
    return tags;
}

const toTargetPath = (targetType: TagAttachTarget): string => TARGET_PATH[targetType] ?? targetType;

const postTagNames = async (targetType: TagAttachTarget, targetId: number, tagNames: string[]): Promise<void> => {
    const requestBody = { tagNames };
    console.log("[tags] postTagNames request", {
        targetType,
        targetId,
        body: requestBody,
    });

    const response = await fetch(`${basePath}/${toTargetPath(targetType)}/${targetId}/tags`, {
        method: "POST",
        headers: JSON_HEADERS,
        credentials: "include",
        body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log("[tags] postTagNames response", {
        status: response.status,
        ok: response.ok,
        body: responseText || "(empty)",
    });

    if (!response.ok) {
        throw new Error("태그를 갱신하지 못했습니다. " + response.status);
    }
};

export async function addTag(
    targetType: TagAttachTarget,
    targetId: number,
    tag: TagRecord,
    existingTags: TagRecord[] = [],
): Promise<TagRecord[]> {
    const tagName = tag.name.trim();
    if (!tagName) {
        throw new Error("추가할 태그 이름을 입력해주세요.");
    }
    if (!targetId) {
        throw new Error("태그를 추가할 산출물 정보를 찾을 수 없습니다.");
    }
    if (existingTags.length >= 5) {
        throw new Error("태그는 최대 5개까지 추가할 수 있습니다.");
    }
    if (existingTags.some((item) => item.name === tagName)) {
        return existingTags;
    }

    const nextTags = [...existingTags, { ...tag, name: tagName }];
    const tagNames = Array.from(new Set(nextTags.map((item) => item.name.trim()).filter(Boolean)));
    await postTagNames(targetType, targetId, tagNames);
    return nextTags;
}

export async function deleteTag(
    targetType: TagAttachTarget,
    targetId: number,
    tag: TagRecord,
    existingTags: TagRecord[] = [],
): Promise<TagRecord[]> {
    if (!targetId) {
        throw new Error("태그를 삭제할 산출물 정보를 찾을 수 없습니다.");
    }

    const filtered = existingTags.filter((item) => item.id !== tag.id && item.name !== tag.name);
    const tagNames = Array.from(new Set(filtered.map((item) => item.name.trim()).filter(Boolean)));

    await postTagNames(targetType, targetId, tagNames);
    return filtered;
}
