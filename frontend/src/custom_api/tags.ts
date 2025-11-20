const basePath = import.meta.env.VITE_API_BASE_URL;

const tagEndpoint = `${basePath}/tags`;
const tagGenerateEndpoint = `${tagEndpoint}/generate`;
const tagAttachEndpoint = `${tagEndpoint}/attach`;
const tagDetachEndpoint = `${tagEndpoint}/detach`;

const JSON_HEADERS = {
    "Content-Type": "application/json",
};

export type TagRecord = {
    id: number;
    name: string;
};

export type TagAttachTarget = "logo" | "branding" | "colorGuide";

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

    if (!response.ok) {
        throw new Error("태그 목록을 불러오지 못했습니다. " + response.status);
    }

    const payload = await response.json();
    const tags = ensureTagList(payload);
    return tags;
}

export async function createTag(name: string): Promise<TagRecord> {
    const trimmed = name.trim();
    if (!trimmed) {
        throw new Error("태그 이름을 입력해주세요.");
    }

    const response = await fetch(tagGenerateEndpoint, {
        method: "POST",
        headers: JSON_HEADERS,
        credentials: "include",
        body: JSON.stringify({ id: -1, name: trimmed }),
    });

    if (!response.ok) {
        throw new Error("태그를 생성하지 못했습니다. " + response.status);
    }

    const payload = await response.json();
    const [created] = ensureTagList(payload);
    return created ?? normalizeTag(payload);
}

export async function addTag(targetType: TagAttachTarget, targetId: number, tag: TagRecord): Promise<TagRecord[]> {
    if (!targetId) {
        throw new Error("태그를 추가할 산출물 정보를 찾을 수 없습니다.");
    }

    const response = await fetch(tagAttachEndpoint, {
        method: "POST",
        headers: JSON_HEADERS,
        credentials: "include",
        body: JSON.stringify({
            targetType,
            targetId,
            tagId: tag.id,
            name: tag.name,
        }),
    });

    if (!response.ok) {
        throw new Error("태그를 추가하지 못했습니다. " + response.status);
    }

    const payload = await response.json();
    const tags = ensureTagList(payload);
    return tags.length > 0 ? tags : [normalizeTag(tag)];
}

export async function deleteTag(targetType: TagAttachTarget, targetId: number, tag: TagRecord): Promise<TagRecord[]> {
    if (!targetId) {
        throw new Error("태그를 삭제할 산출물 정보를 찾을 수 없습니다.");
    }

    const response = await fetch(tagDetachEndpoint, {
        method: "POST",
        headers: JSON_HEADERS,
        credentials: "include",
        body: JSON.stringify({
            targetType,
            targetId,
            tagId: tag.id,
            name: tag.name,
        }),
    });

    if (!response.ok) {
        throw new Error("태그를 삭제하지 못했습니다. " + response.status);
    }

    const payload = await response.json();
    return ensureTagList(payload);
}
