// src/custom_api/project.ts
// 프로젝트 CRUD 및 산출물 연결 관리 전용 API 클라이언트

import type { PaginatedResponse } from "./types";

const basePath = import.meta.env.VITE_API_BASE_URL;

const projectEndpoint = `${basePath}/project`;
const projectGenerateEndpoint = `${projectEndpoint}/generate`;

export type ProjectRecord = {
    id: number;
    name: string;
    logoIds: number[];
    brandStrategyIds: number[];
    colorGuideIds: number[];
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

type ProjectListPayload =
    | { content?: ProjectRecord[] | unknown; projects?: ProjectRecord[] | unknown }
    | ProjectRecord[]
    | PaginatedResponse<ProjectRecord>;

const ensureIdArray = (value: unknown): number[] => {
    if (Array.isArray(value)) {
        return value.filter((item): item is number => typeof item === "number");
    }
    return [];
};

const normalizeProject = (payload: any): ProjectRecord => ({
    id: Number(payload?.id) || 0,
    name: typeof payload?.name === "string" ? payload.name : "",
    logoIds: ensureIdArray(payload?.logoIds),
    brandStrategyIds: ensureIdArray(payload?.brandStrategyIds),
    colorGuideIds: ensureIdArray(payload?.colorGuideIds),
    createdAt: payload?.createdAt ?? payload?.createAt ?? undefined,
    updatedAt: payload?.updatedAt ?? payload?.updateAt ?? undefined,
});

const mapProjectList = (raw: ProjectListPayload): ProjectRecord[] => {
    if (Array.isArray(raw)) {
        return raw.map(normalizeProject);
    }
    if ("content" in raw && Array.isArray(raw.content)) {
        return raw.content.map(normalizeProject);
    }
    if ("projects" in raw && Array.isArray(raw.projects)) {
        return raw.projects.map(normalizeProject);
    }
    return [];
};

export async function fetchProjectList(options: { signal?: AbortSignal } = {}): Promise<ProjectRecord[]> {
    console.log("프로젝트 목록 조회 요청 시작");

    const result = await fetch(projectEndpoint, {
        method: "GET",
        credentials: "include",
        signal: options.signal,
    });

    if (!result.ok) {
        console.log("프로젝트 목록 조회 요청 오류");
        throw new Error("프로젝트 목록 조회에 실패했습니다. " + result.status);
    }

    const payload = (await result.json()) as ProjectListPayload;
    const projects = mapProjectList(payload);
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
