// src/custom_api/project.ts
// 프로젝트 CRUD 및 산출물 연결 관리 전용 API 클라이언트

import type { PaginatedResponse } from "./types";

const basePath = import.meta.env.VITE_API_BASE_URL;

const projectEndpoint = `${basePath}/project`;
const projectListEndpoint = `${basePath}/my-projects`;
const projectGenerateEndpoint = `${projectEndpoint}/generate`;

export type ProjectRecord = {
    id: number;
    name: string;
    logoIds: number[];
    brandStrategyIds: number[];
    colorGuideIds: number[];
    logoCount?: number;
    brandCount?: number;
    colorGuideCount?: number;
    createdAt?: string;
    updatedAt?: string;
};

export type ProjectCreateRequest = {
    name: string;
    logoIds?: number[];
    brandStrategyIds?: number[];
    colorGuideIds?: number[];
};

export type ProjectUpdateRequest = {
    name?: string;
    logoIds?: number[];
    brandStrategyIds?: number[];
    colorGuideIds?: number[];
};

export type ProjectListParams = {
    page?: number;
    size?: number;
};

type ProjectListPayload =
    | { content?: unknown; projects?: unknown; page?: number; size?: number; totalElements?: number; totalPages?: number; last?: boolean }
    | ProjectRecord[]
    | PaginatedResponse<ProjectRecord>;

const ensureIdArray = (value: unknown): number[] => {
    if (Array.isArray(value)) {
        return value.filter((item): item is number => typeof item === "number");
    }
    return [];
};

const ensureCount = (value: unknown, fallback?: number): number | undefined => {
    const num = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(num)) return num;
    return fallback;
};

const normalizeProject = (payload: any): ProjectRecord => ({
    id: Number(payload?.id) || 0,
    name: typeof payload?.name === "string" ? payload.name : "",
    logoIds: ensureIdArray(payload?.logoIds),
    brandStrategyIds: ensureIdArray(payload?.brandStrategyIds),
    colorGuideIds: ensureIdArray(payload?.colorGuideIds),
    logoCount: ensureCount(payload?.logoCounts ?? payload?.logoCount, Array.isArray(payload?.logoIds) ? payload.logoIds.length : undefined),
    brandCount: ensureCount(payload?.brandCounts ?? payload?.brandCount, Array.isArray(payload?.brandStrategyIds) ? payload.brandStrategyIds.length : undefined),
    colorGuideCount: ensureCount(
        payload?.colorGuideCounts ?? payload?.colorCount ?? payload?.colorGuideCount,
        Array.isArray(payload?.colorGuideIds) ? payload.colorGuideIds.length : undefined,
    ),
    createdAt: payload?.createdAt ?? payload?.createAt ?? undefined,
    updatedAt: payload?.updatedAt ?? payload?.updateAt ?? undefined,
});

const toPaginatedProjects = (raw: ProjectListPayload): PaginatedResponse<ProjectRecord> => {
    const baseContent = Array.isArray(raw)
        ? raw
        : Array.isArray((raw as any)?.content)
            ? (raw as any).content
            : Array.isArray((raw as any)?.projects)
                ? (raw as any).projects
                : [];
    const content = baseContent.map(normalizeProject);

    if (Array.isArray(raw)) {
        return {
            content,
            page: 0,
            size: content.length,
            totalElements: content.length,
            totalPages: 1,
            last: true,
        };
    }

    const payload = raw as Partial<PaginatedResponse<ProjectRecord>>;
    const totalElements = typeof payload.totalElements === "number" ? payload.totalElements : content.length;
    const sizeValue = typeof payload.size === "number" ? payload.size : content.length;
    const size = sizeValue > 0 ? sizeValue : Math.max(content.length, 1);
    const totalPagesRaw =
        typeof payload.totalPages === "number" && payload.totalPages > 0
            ? payload.totalPages
            : Math.max(1, Math.ceil(totalElements / size));
    const totalPages = Math.max(1, totalPagesRaw);
    const pageValue = typeof payload.page === "number" ? payload.page : 0;
    const page = Math.min(Math.max(pageValue, 0), totalPages - 1);
    const last =
        typeof payload.last === "boolean"
            ? payload.last
            : page >= totalPages - 1 || content.length + page * Math.max(size, 1) >= totalElements;

    return {
        content,
        page,
        size,
        totalElements,
        totalPages,
        last,
    };
};

export async function fetchProjectList(
    params: ProjectListParams = {},
    options: { signal?: AbortSignal } = {},
): Promise<PaginatedResponse<ProjectRecord>> {
    console.log("프로젝트 목록 조회 요청 시작");

    const url = new URL(projectListEndpoint);
    if (params.page != null) url.searchParams.set("page", String(params.page));
    if (params.size != null) url.searchParams.set("size", String(params.size));

    const result = await fetch(url.toString(), {
        method: "GET",
        credentials: "include",
        signal: options.signal,
    });

    if (!result.ok) {
        console.log("프로젝트 목록 조회 요청 오류");
        throw new Error("프로젝트 목록 조회에 실패했습니다. " + result.status);
    }

    const payload = (await result.json()) as ProjectListPayload;
    const projects = toPaginatedProjects(payload);
    console.log("프로젝트 목록 조회 요청 성공");
    return projects;
}

export async function fetchProjectDetail(
    projectId: number,
    options: { signal?: AbortSignal } = {},
): Promise<ProjectRecord> {
    console.log("프로젝트 상세 조회 요청 시작");

    const result = await fetch(`${projectEndpoint}/${projectId}`, {
        method: "GET",
        credentials: "include",
        signal: options.signal,
    });

    if (!result.ok) {
        console.log("프로젝트 상세 조회 요청 오류");
        throw new Error("프로젝트 상세 조회에 실패했습니다. " + result.status);
    }

    const payload = await result.json();
    console.log("프로젝트 상세 조회 요청 성공");
    return normalizeProject(payload);
}

export async function createProject(body: ProjectCreateRequest): Promise<ProjectRecord> {
    console.log("프로젝트 생성 요청 시작");

    const result = await fetch(projectGenerateEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
            name: body.name,
            logoIds: body.logoIds ?? [],
            brandStrategyIds: body.brandStrategyIds ?? [],
            colorGuideIds: body.colorGuideIds ?? [],
        }),
    });

    if (!result.ok) {
        console.log("프로젝트 생성 요청 오류");
        throw new Error("프로젝트 생성에 실패했습니다. " + result.status);
    }

    const payload = await result.json();
    console.log("프로젝트 생성 요청 성공");
    return normalizeProject(payload);
}

export async function updateProject(projectId: number, body: ProjectUpdateRequest): Promise<ProjectRecord> {
    console.log("프로젝트 수정 요청 시작");
    const result = await fetch(`${projectEndpoint}/${projectId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
            name: body.name,
            logoIds: body.logoIds ?? [],
            brandStrategyIds: body.brandStrategyIds ?? [],
            colorGuideIds: body.colorGuideIds ?? [],
        }),
    });

    if (!result.ok) {
        console.log("프로젝트 수정 요청 오류");
        throw new Error("프로젝트 수정에 실패했습니다. " + result.status);
    }

    const payload = await result.json();
    console.log("프로젝트 수정 요청 성공");
    return normalizeProject(payload);
}

export async function deleteProject(projectId: number): Promise<void> {
    console.log("프로젝트 삭제 요청 시작");
    const result = await fetch(`${projectEndpoint}/${projectId}`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!result.ok) {
        console.log("프로젝트 삭제 요청 오류");
        throw new Error("프로젝트 삭제에 실패했습니다. " + result.status);
    }
    console.log("프로젝트 삭제 요청 성공");
}
