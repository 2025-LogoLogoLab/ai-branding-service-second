import type { ProjectRecord } from "./project";
import type { HttpMethod } from "./types";

export type ProjectApiConfig = {
    url?: string;
    method?: HttpMethod;
};

export type ProjectApiSettings = {
    list: ProjectApiConfig;
    detail: ProjectApiConfig;
    create: ProjectApiConfig;
    update: ProjectApiConfig;
    delete: ProjectApiConfig;
};

export const DEFAULT_PROJECT_API_SETTINGS: ProjectApiSettings = {
    list: { method: "GET", url: "" },
    detail: { method: "GET", url: "" },
    create: { method: "POST", url: "" },
    update: { method: "PATCH", url: "" },
    delete: { method: "DELETE", url: "" },
};

export const DEMO_PROJECTS: ProjectRecord[] = [
    {
        id: 9101,
        name: "봄 캠페인 패키지",
        logoIds: [1, 2, 3],
        brandStrategyIds: [11],
        colorGuideIds: [31],
        createdAt: "2024-03-02T10:00:00.000Z",
        updatedAt: "2024-04-05T09:15:00.000Z",
    },
    {
        id: 9102,
        name: "가을 리브랜딩",
        logoIds: [5],
        brandStrategyIds: [22, 23],
        colorGuideIds: [40, 41],
        createdAt: "2024-08-17T12:30:00.000Z",
        updatedAt: "2024-09-01T08:00:00.000Z",
    },
];

export const isProjectApiConfigured = (settings: ProjectApiSettings): boolean =>
    Object.values(settings).every((config) => Boolean(config.url?.trim()) && Boolean(config.method));
