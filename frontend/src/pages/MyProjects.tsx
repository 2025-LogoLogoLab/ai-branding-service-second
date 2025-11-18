
// src/pages/MyProjects.tsx
// 내 프로젝트 페이지: 프로젝트 목록/상세/생성 UI

import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
    type ReactNode,
} from "react";
import styles from "./MyProjects.module.css";
import iconDelete from "../assets/icons/icon_delete.png";
import iconPlus from "../assets/icons/icon_plus.png";
import {
    createProject,
    deleteProject,
    fetchProjectDetail,
    fetchProjectList,
    updateProject,
    type ProjectRecord,
} from "../custom_api/project";
import { ProjectApiSettingsPanel } from "../components/ProjectApiSettingsPanel/ProjectApiSettingsPanel";
import {
    DEFAULT_PROJECT_API_SETTINGS,
    DEMO_PROJECTS,
    type ProjectApiSettings,
    isProjectApiConfigured,
} from "../custom_api/projectSettings";
import {
    deleteLogo,
    fetchLogoDetail,
    fetchLogoPage,
    type LogoDetail,
    type LogoListItem,
} from "../custom_api/logo";
import {
    deleteBranding,
    fetchBrandStrategyDetail,
    fetchBrandStrategyPage,
    type BrandStrategyDetail,
    type BrandStrategyListItem,
} from "../custom_api/branding";
import {
    deleteColorGuide,
    fetchColorGuideDetail,
    fetchColorGuidePage,
    type ColorGuideDetail,
    type ColorGuideListItem,
} from "../custom_api/colorguide";
import { LogoCard } from "../organisms/LogoCard/LogoCard";
import BrandStrategyDeliverableCard from "../organisms/BrandStrategyDeliverableCard/BrandStrategyDeliverableCard";
import ColorGuideDeliverableCard from "../organisms/ColorGuideDeliverableCard/ColorGuideDeliverableCard";
import Pagination from "../molecules/Pagination/Pagination";
import { ensureDataUrl } from "../utils/image";
import { copyImageToClipboard } from "../utils/clipboard";
import type { HttpMethod, PaginatedResponse } from "../custom_api/types";
import { DeliverableDetailModal } from "../organisms/DeliverableDetailModal/DeliverableDetailModal";
import type { ProductToolbarProps } from "../molecules/ProductToolbar/ProductToolbar";
import { TextButton } from "../atoms/TextButton/TextButton";
import {
    asBrandStrategyListItem,
    asColorGuideListItem,
    asLogoListItem,
    previewToBrandDetail,
    previewToColorGuideDetail,
    previewToLogoDetail,
    useDeliverableDetail,
} from "../utils/deliverableDetail";

type ProjectAssetType = "logo" | "branding" | "colorGuide";

type AssetPageState<T> = {
    loading: boolean;
    error: string | null;
    data: PaginatedResponse<T> | null;
};

const createAssetPageState = <T,>(): AssetPageState<T> => ({
    loading: false,
    error: null,
    data: null,
});

type ActionState = {
    deletingId: number | null;
    copyingId: number | null;
    downloadingId: number | null;
};

const initialActionState: ActionState = {
    deletingId: null,
    copyingId: null,
    downloadingId: null,
};

const ASSET_LABEL: Record<ProjectAssetType, string> = {
    logo: "로고",
    branding: "브랜딩 전략",
    colorGuide: "컬러 가이드",
};

const PROJECT_LIST_PAGE_SIZE = 10; // 프로젝트 목록 표의 페이지 크기
const PROJECT_ASSET_PAGE_SIZE = 3; // 프로젝트 상세 모달에서 한 번에 보여줄 산출물 수

type ProjectPageInfo = {
    page: number;
    totalPages: number;
    totalElements: number;
};

const createEmptyAssetPage = <T,>(): PaginatedResponse<T> => ({
    content: [],
    page: 0,
    size: PROJECT_ASSET_PAGE_SIZE,
    totalElements: 0,
    totalPages: 1,
    last: true,
});

const buildMockPaginatedAsset = <T,>(items: T[], requestedPage: number): PaginatedResponse<T> => {
    const totalElements = items.length;
    const size = PROJECT_ASSET_PAGE_SIZE;
    const totalPages = Math.max(1, Math.ceil(totalElements / size));
    const page = Math.min(Math.max(requestedPage, 0), totalPages - 1);
    const sliceStart = page * size;
    const content = items.slice(sliceStart, sliceStart + size);
    return {
        content,
        page,
        size,
        totalElements,
        totalPages,
        last: page >= totalPages - 1,
    };
};

const formatDateTime = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const createMockProjectRecord = (name: string): ProjectRecord => ({
    id: Date.now(),
    name,
    logoIds: [],
    brandStrategyIds: [],
    colorGuideIds: [],
    logoCount: 0,
    brandCount: 0,
    colorGuideCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
});

const dedupeIds = (ids?: number[]): number[] =>
    Array.from(new Set((ids ?? []).filter((value): value is number => typeof value === "number" && Number.isFinite(value))));

async function fetchListItemsByIds<TDetail, TList>(
    ids: number[],
    loader: (id: number, options: { signal?: AbortSignal }) => Promise<TDetail>,
    mapper: (detail: TDetail) => TList,
    signal: AbortSignal,
): Promise<TList[]> {
    if (ids.length === 0) return [];
    const results = await Promise.all(ids.map((id) => loader(id, { signal }).then(mapper)));
    return results;
}

const mapLogoDetailToListItem = (detail: LogoDetail): LogoListItem => ({
    id: detail.id,
    prompt: detail.prompt ?? "",
    imageUrl: detail.imageUrl ?? "",
    createdAt: detail.createdAt ?? "",
});

const mapBrandStrategyDetailToListItem = (detail: BrandStrategyDetail): BrandStrategyListItem => ({
    id: detail.id,
    briefKo: detail.briefKo ?? "",
    style: detail.style ?? undefined,
    summaryKo: detail.summaryKo ?? undefined,
    markdown: detail.markdown ?? "",
    createdAt: detail.createdAt ?? "",
});

const mapColorGuideDetailToListItem = (detail: ColorGuideDetail): ColorGuideListItem => ({
    id: detail.id,
    briefKo: detail.briefKo ?? "",
    style: detail.style ?? undefined,
    mainHex: detail.guide.main.hex,
    subHex: detail.guide.sub.hex,
    pointHex: detail.guide.point.hex,
    backgroundHex: detail.guide.background.hex,
    mainDescription: detail.guide.main.description,
    subDescription: detail.guide.sub.description,
    pointDescription: detail.guide.point.description,
    backgroundDescription: detail.guide.background.description,
    createdAt: detail.createdAt ?? "",
});

type MyProjectsVariant = "page" | "embedded";

type MyProjectsProps = {
    variant?: MyProjectsVariant;
    showSettingsPanel?: boolean;
};

const cx = (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(" ").trim();

// === Component: MyProjects ===
// 내 프로젝트 전체 화면을 구성하며 목록, 설정 패널, 상세/생성 모달까지 모두 오케스트레이션한다.
export default function MyProjects({ variant = "page", showSettingsPanel }: MyProjectsProps) {
    const [projects, setProjects] = useState<ProjectRecord[]>([]); // 목록 테이블 데이터
    const [projectPage, setProjectPage] = useState(0); // 현재 목록 페이지 인덱스
    const [projectPageInfo, setProjectPageInfo] = useState<ProjectPageInfo>({
        page: 0,
        totalPages: 1,
        totalElements: 0,
    }); // 서버가 알려주는 페이지네이션 메타
    const [projectListNonce, setProjectListNonce] = useState(0); // 강제 재로드 트리거
    const [mockProjects, setMockProjects] = useState<ProjectRecord[]>(DEMO_PROJECTS); // mock 모드 전용 프로젝트 원본
    const [loading, setLoading] = useState(true); // 목록 fetch 진행 여부
    const [error, setError] = useState<string | null>(null); // 목록 fetch 에러 메시지
    const [detailId, setDetailId] = useState<number | null>(null); // 상세 모달에 띄울 프로젝트 ID
    const [createOpen, setCreateOpen] = useState(false); // 생성 모달 오픈 여부
    const [projectApiSettings, setProjectApiSettings] = useState<ProjectApiSettings>(DEFAULT_PROJECT_API_SETTINGS); // API 설정 패널 상태

    const useMockApi = useMemo(() => !isProjectApiConfigured(projectApiSettings), [projectApiSettings]); // API URL/메서드가 비어 있을 때 mock 데이터 사용

    useEffect(() => {
        if (useMockApi) {
            setMockProjects(DEMO_PROJECTS);
        }
        setProjectPage(0);
    }, [useMockApi]);
    // API 설정 패널 입력 핸들러
    const handleProjectApiConfigChange = (section: keyof ProjectApiSettings, field: "url" | "method", value: string) => {
        setProjectApiSettings((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: field === "method" ? (value as HttpMethod) : value,
            },
        }));
    };

    // 프로젝트 목록 fetch (혹은 mock 데이터 사용)
    useEffect(() => {
        const controller = new AbortController();
        setError(null);

        if (useMockApi) {
            const totalElements = mockProjects.length;
            const totalPages = Math.max(1, Math.ceil(totalElements / PROJECT_LIST_PAGE_SIZE));
            const effectivePage = Math.min(Math.max(projectPage, 0), totalPages - 1);
            if (effectivePage !== projectPage) {
                setProjectPage(effectivePage);
            }
            const sliceStart = effectivePage * PROJECT_LIST_PAGE_SIZE;
            const pageItems = mockProjects.slice(sliceStart, sliceStart + PROJECT_LIST_PAGE_SIZE);
            setProjects(pageItems);
            setProjectPageInfo({
                page: effectivePage,
                totalPages,
                totalElements,
            });
            setLoading(false);
            return () => controller.abort();
        }

        setLoading(true);
        console.info("[project API] fetch project list start", { page: projectPage, size: PROJECT_LIST_PAGE_SIZE });
        fetchProjectList({ page: projectPage, size: PROJECT_LIST_PAGE_SIZE }, { signal: controller.signal })
            .then((response) => {
                if (controller.signal.aborted) return;
                console.info("[project API] fetch project list success", response);
                const totalPages = Math.max(response.totalPages, 1);
                const normalizedPage = Math.min(Math.max(response.page, 0), totalPages - 1);
                const totalElements =
                    typeof response.totalElements === "number" ? response.totalElements : response.content.length;
                setProjects(response.content);
                setProjectPageInfo({
                    page: normalizedPage,
                    totalPages,
                    totalElements,
                });
                if (normalizedPage !== projectPage) {
                    setProjectPage(normalizedPage);
                }
                setLoading(false);
            })
            .catch((err) => {
                if (controller.signal.aborted) return;
                console.warn("[project API] fetch project list error", err);
                setError(err instanceof Error ? err.message : "프로젝트 목록을 불러오지 못했습니다.");
                setLoading(false);
            });

        return () => controller.abort();
    }, [useMockApi, projectPage, projectListNonce, mockProjects]);

    const selectedProject = useMemo(() => {
        const source = useMockApi ? mockProjects : projects;
        return source.find((item) => item.id === detailId);
    }, [projects, mockProjects, detailId, useMockApi]); // 상세 모달에 넘길 현재 선택 프로젝트

    // 새 프로젝트 생성 결과 반영 (mock 모드에서는 즉시 데이터 추가)
    const handleProjectCreated = (project: ProjectRecord) => {
        if (useMockApi) {
            setMockProjects((prev) => [project, ...prev]);
        } else {
            setProjectListNonce((prev) => prev + 1);
        }
        setProjectPage(0);
    };

    // 상세 모달에서 수정된 프로젝트를 목록에 반영
    const handleProjectUpdated = (project: ProjectRecord) => {
        setProjects((prev) => prev.map((item) => (item.id === project.id ? project : item)));
        if (useMockApi) {
            setMockProjects((prev) => prev.map((item) => (item.id === project.id ? project : item)));
        }
    };

    // 프로젝트 삭제 후 목록/모달 동기화
    const handleProjectDeleted = (projectId: number) => {
        setProjects((prev) => prev.filter((item) => item.id !== projectId));
        setDetailId((prev) => (prev === projectId ? null : prev));
        if (useMockApi) {
            setMockProjects((prev) => prev.filter((item) => item.id !== projectId));
        } else {
            setProjectListNonce((prev) => prev + 1);
        }
    };

    const isPageVariant = variant === "page";
    const shouldShowSettings = showSettingsPanel ?? isPageVariant;
    const pageClass = cx(styles.page, !isPageVariant && styles.pageEmbedded);
    const containerClass = cx(styles.container, variant === "embedded" && styles.containerEmbedded);
    const panelClass = cx(styles.panel, variant === "embedded" && styles.panelEmbedded);

    return (
        <div className={pageClass}>
            <div className={containerClass}>
                {isPageVariant && (
                    <header className={styles.header}>
                        <div className={styles.headerTexts}>
                            <h1 className={styles.title}>내 프로젝트</h1>
                            <p className={styles.description}>
                                프로젝트는 산출물을 분류하는 디렉터리와 유사하게 동작합니다. 생성일과 수정일을 확인하고,
                                상세 보기에서 로고·브랜딩 전략·컬러 가이드를 자유롭게 편집할 수 있습니다.
                            </p>
                        </div>
                        <div className={styles.actions}>
                            <p className={styles.projectHint}>
                                로고·브랜딩 전략·컬러 가이드를 프로젝트별로 묶어 한 번에 확인할 수 있어요.
                            </p>
                    <TextButton
                        label="새 프로젝트"
                        variant="outlined"
                        onClick={() => setCreateOpen(true)}
                        className={styles.createProjectButton}
                    />
                        </div>
                    </header>
                )}

                <section className={panelClass}>
                    {!isPageVariant && (
                        <div className={styles.panelToolbar}>
                            <p className={styles.projectHint}>
                                연관된 작업물을 폴더처럼 묶어두고 필요할 때 바로 찾아보세요.
                            </p>
                            <TextButton
                                label="새 프로젝트"
                                variant="outlined"
                                onClick={() => setCreateOpen(true)}
                                className={styles.createProjectButton}
                            />
                        </div>
                    )}
                    {loading && <p className={styles.status}>프로젝트를 불러오는 중입니다…</p>}
                    {error && <p className={`${styles.status} ${styles.statusError}`}>{error}</p>}

                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th scope="col" className={styles.projectNameHead}>프로젝트 이름</th>
                                    <th scope="col">로고</th>
                                    <th scope="col">브랜딩 전략</th>
                                    <th scope="col">컬러 가이드</th>
                                    <th scope="col">생성일</th>
                                    <th scope="col">수정일</th>
                                    <th scope="col" className={styles.colActions}>
                                        작업
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map((project) => (
                                    <tr key={project.id}>
                                        <td className={styles.projectNameCell}>{project.name}</td>
                                <td>{project.logoCount ?? project.logoIds?.length ?? 0}</td>
                                <td>{project.brandCount ?? project.brandStrategyIds?.length ?? 0}</td>
                                <td>{project.colorGuideCount ?? project.colorGuideIds?.length ?? 0}</td>
                                        <td>{formatDateTime(project.createdAt)}</td>
                                        <td>{formatDateTime(project.updatedAt)}</td>
                                        <td className={styles.rowActions}>
                                            <button
                                                type="button"
                                                className={styles.detailButton}
                                                onClick={() => setDetailId(project.id)}
                                            >
                                                상세 보기
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {!loading && projects.length === 0 && (
                                    <tr
                                        className={`${styles.tablePlaceholderRow} ${
                                            error ? styles.tablePlaceholderError : ""
                                        }`}
                                    >
                                        <td colSpan={7}>
                                            {error
                                                ? "프로젝트 정보를 불러오지 못했습니다."
                                                : "아직 생성된 프로젝트가 없습니다."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {!loading && !error && (
                        <div className={styles.tablePagination}>
                            <Pagination
                                page={projectPageInfo.page}
                                totalPages={projectPageInfo.totalPages}
                                onChange={(next) => setProjectPage(next)}
                            />
                        </div>
                    )}
                </section>

                {shouldShowSettings && (
                    <>
                        <ProjectApiSettingsPanel
                            settings={projectApiSettings}
                            onChange={handleProjectApiConfigChange}
                        />
                        {useMockApi && (
                            <p className={styles.apiNotice}>
                                API 설정이 완료되지 않아 예시 프로젝트 데이터가 표시됩니다.
                            </p>
                        )}
                    </>
                )}
            </div>

            {detailId != null && (
                <ProjectDetailModal
                    projectId={detailId}
                    initialProject={selectedProject}
                    onClose={() => setDetailId(null)}
                    onUpdated={handleProjectUpdated}
                    onDeleted={handleProjectDeleted}
                    useMockApi={useMockApi}
                />
            )}

            {createOpen && (
                <ProjectCreateModal
                    existingNames={(useMockApi ? mockProjects : projects).map((item) => item.name)}
                    onClose={() => setCreateOpen(false)}
                    onCreated={handleProjectCreated}
                    useMockApi={useMockApi}
                />
            )}
        </div>
    );
}
// === End Component: MyProjects ===
type ProjectDetailModalProps = {
    projectId: number;
    initialProject?: ProjectRecord;
    onClose: () => void;
    onUpdated: (project: ProjectRecord) => void;
    onDeleted: (projectId: number) => void;
    useMockApi: boolean;
};
// === Component: ProjectDetailModal ===
// 프로젝트 상세 모달 UI: 기본 정보 편집, 산출물 카드, 삭제/추가 모달 트리거를 담당한다.
function ProjectDetailModal({
    projectId,
    initialProject,
    onClose,
    onUpdated,
    onDeleted,
    useMockApi,
}: ProjectDetailModalProps) {
    const [project, setProject] = useState<ProjectRecord | null>(initialProject ?? null); // 모달에 표시할 프로젝트 데이터
    const [loading, setLoading] = useState(!initialProject); // 상세 로딩 여부
    const [error, setError] = useState<string | null>(null); // 상세 로딩 실패 메시지
    const [nameValue, setNameValue] = useState(initialProject?.name ?? ""); // 제목 입력 상태
    const [savingName, setSavingName] = useState(false); // 제목 저장 중 여부
    const [formError, setFormError] = useState<string | null>(null); // 이름 입력 오류 메시지
    const [assetError, setAssetError] = useState<string | null>(null); // 산출물 조작 관련 오류 메시지
    const [assetUpdating, setAssetUpdating] = useState(false); // attach/detach 요청 진행 여부
    const [pickerType, setPickerType] = useState<ProjectAssetType | null>(null); // 어떤 산출물 추가 모달을 띄울지
    const [deletePending, setDeletePending] = useState(false); // 삭제 진행 여부
    const [isTitleEditing, setIsTitleEditing] = useState(false);
    const [isAssetEditing, setIsAssetEditing] = useState(false);

    const [assetRefreshToken, setAssetRefreshToken] = useState(0); // 산출물 목록 재조회 트리거
    const [logoAssets, setLogoAssets] = useState<AssetPageState<LogoListItem>>(createAssetPageState); // 포함된 로고 카드 상태
    const [brandingAssets, setBrandingAssets] = useState<AssetPageState<BrandStrategyListItem>>(createAssetPageState); // 포함된 브랜딩 카드 상태
    const [colorAssets, setColorAssets] = useState<AssetPageState<ColorGuideListItem>>(createAssetPageState); // 포함된 컬러 카드 상태
    const [logoPage, setLogoPage] = useState(0);
    const [brandingPage, setBrandingPage] = useState(0);
    const [colorPage, setColorPage] = useState(0);
    const [logoActions, setLogoActions] = useState<ActionState>(initialActionState); // 로고 카드 액션 로딩 상태
    const [brandingActions, setBrandingActions] = useState<ActionState>(initialActionState); // 브랜딩 카드 액션 로딩
    const [colorActions, setColorActions] = useState<ActionState>(initialActionState); // 컬러 카드 액션 로딩
    // 산출물 상세 모달 상태/핸들러 (Deliverables 페이지와 동일 훅)
    const {
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
    } = useDeliverableDetail();

    // 초기 prop으로 받은 project를 상태에 동기화
    useEffect(() => {
        if (!initialProject || project) return;
        setProject(initialProject);
        setNameValue(initialProject.name);
    }, [initialProject, project]);

    // 모달 대상이 바뀌면 편집 상태/픽커를 리셋
    useEffect(() => {
        setIsTitleEditing(false);
        setIsAssetEditing(false);
        setPickerType(null);
        setLogoPage(0);
        setBrandingPage(0);
        setColorPage(0);
    }, [projectId]);

    // 상세 정보 fetch (mock 모드 포함)
    useEffect(() => {
        if (useMockApi) {
            if (initialProject) {
                console.info("[project API] mock detail data", initialProject);
                setProject(initialProject);
                setNameValue(initialProject.name);
                setError(null);
            } else {
                setError("프로젝트 정보를 불러올 수 없습니다.");
            }
            setLoading(false);
            setAssetRefreshToken((token) => token + 1);
            return;
        }

        const controller = new AbortController();
        setLoading(true);
        setError(null);
        console.info("[project API] fetch project detail start", projectId);
        fetchProjectDetail(projectId, { signal: controller.signal })
            .then((record) => {
                if (controller.signal.aborted) return;
                console.info("[project API] fetch project detail success", record);
                setProject(record);
                setNameValue(record.name);
                setLoading(false);
                setAssetRefreshToken((token) => token + 1);
            })
            .catch((err) => {
                if (controller.signal.aborted) return;
                console.warn("[project API] fetch project detail error", err);
                setError(err instanceof Error ? err.message : "프로젝트 정보를 불러오지 못했습니다.");
                setLoading(false);
            });

        return () => controller.abort();
    }, [projectId, initialProject, useMockApi]);

    // 포함된 로고 목록을 프로젝트 ID + 페이지 기준으로 로드
    useEffect(() => {
        if (!project) return;
        const controller = new AbortController();
        const targetIds = dedupeIds(project.logoIds);

        if (useMockApi) {
            if (targetIds.length === 0) {
                setLogoAssets({ loading: false, error: null, data: createEmptyAssetPage() });
                setLogoPage(0);
                return () => controller.abort();
            }
            console.info("[project API] mock mode active – fetching logo assets via detail API", targetIds);
            setLogoAssets((prev) => ({ ...prev, loading: true, error: null }));
            fetchListItemsByIds(targetIds, fetchLogoDetail, mapLogoDetailToListItem, controller.signal)
                .then((items) => {
                    if (controller.signal.aborted) return;
                    const paginated = buildMockPaginatedAsset(items, logoPage);
                    setLogoAssets({ loading: false, error: null, data: paginated });
                    if (paginated.page !== logoPage) {
                        setLogoPage(paginated.page);
                    }
                })
                .catch((err) => {
                    if (controller.signal.aborted) return;
                    setLogoAssets((prev) => ({
                        ...prev,
                        loading: false,
                        error: err instanceof Error ? err.message : "로고 정보를 불러오지 못했습니다.",
                    }));
                });
            return () => controller.abort();
        }

        setLogoAssets((prev) => ({ ...prev, loading: true, error: null }));
        fetchLogoPage(
            { projectId: project.id, page: logoPage, size: PROJECT_ASSET_PAGE_SIZE, filter: "mine" },
            { signal: controller.signal },
        )
            .then((payload) => {
                if (controller.signal.aborted) return;
                const excluded = new Set(project.logoIds);
                const filteredContent = payload.content.filter((item) => !excluded.has(item.id));
                const filteredTotal = Math.max(payload.totalElements - excluded.size, 0);
                const filteredPages = Math.max(1, Math.ceil(filteredTotal / Math.max(payload.size, 1)));
                const adjustedPage = Math.min(payload.page, filteredPages - 1);
                const adjusted: PaginatedResponse<LogoListItem> = {
                    ...payload,
                    content: filteredContent,
                    totalElements: filteredTotal,
                    totalPages: filteredPages,
                    page: adjustedPage,
                    last: adjustedPage >= filteredPages - 1,
                };
                if (adjustedPage !== payload.page || adjusted.content.length === 0) {
                    setLogoPage((prev) => (prev !== adjustedPage ? adjustedPage : prev));
                }
                setLogoAssets({ loading: false, error: null, data: adjusted });
            })
            .catch((err) => {
                if (controller.signal.aborted) return;
                setLogoAssets((prev) => ({
                    ...prev,
                    loading: false,
                    error: err instanceof Error ? err.message : "로고 정보를 불러오지 못했습니다.",
                }));
            });

        return () => controller.abort();
    }, [project, assetRefreshToken, useMockApi, logoPage]);

    // 포함된 브랜딩 전략을 프로젝트 ID + 페이지 기준으로 로드
    useEffect(() => {
        if (!project) return;
        const controller = new AbortController();
        const targetIds = dedupeIds(project.brandStrategyIds);

        if (useMockApi) {
            if (targetIds.length === 0) {
                setBrandingAssets({ loading: false, error: null, data: createEmptyAssetPage() });
                setBrandingPage(0);
                return () => controller.abort();
            }
            console.info("[project API] mock mode active – fetching branding assets via detail API", targetIds);
            setBrandingAssets((prev) => ({ ...prev, loading: true, error: null }));
            fetchListItemsByIds(targetIds, fetchBrandStrategyDetail, mapBrandStrategyDetailToListItem, controller.signal)
                .then((items) => {
                    if (controller.signal.aborted) return;
                    const paginated = buildMockPaginatedAsset(items, brandingPage);
                    setBrandingAssets({ loading: false, error: null, data: paginated });
                    if (paginated.page !== brandingPage) {
                        setBrandingPage(paginated.page);
                    }
                })
                .catch((err) => {
                    if (controller.signal.aborted) return;
                    setBrandingAssets((prev) => ({
                        ...prev,
                        loading: false,
                        error: err instanceof Error ? err.message : "브랜딩 전략을 불러오지 못했습니다.",
                    }));
                });
            return () => controller.abort();
        }

        if (targetIds.length === 0) {
            setBrandingAssets({ loading: false, error: null, data: createEmptyAssetPage() });
            setBrandingPage(0);
            return () => controller.abort();
        }

        setBrandingAssets((prev) => ({ ...prev, loading: true, error: null }));
        fetchBrandStrategyPage(
            { projectId: project.id, page: brandingPage, size: PROJECT_ASSET_PAGE_SIZE, filter: "mine" },
            { signal: controller.signal },
        )
            .then((payload) => {
                if (controller.signal.aborted) return;
                setBrandingAssets({ loading: false, error: null, data: payload });
                if (payload.page !== brandingPage) {
                    setBrandingPage(payload.page);
                }
            })
            .catch((err) => {
                if (controller.signal.aborted) return;
                setBrandingAssets((prev) => ({
                    ...prev,
                    loading: false,
                    error: err instanceof Error ? err.message : "브랜딩 전략을 불러오지 못했습니다.",
                }));
            });

        return () => controller.abort();
    }, [project, assetRefreshToken, useMockApi, brandingPage]);

    // 포함된 컬러 가이드를 프로젝트 ID + 페이지 기준으로 로드
    useEffect(() => {
        if (!project) return;
        const controller = new AbortController();
        const targetIds = dedupeIds(project.colorGuideIds);

        if (useMockApi) {
            if (targetIds.length === 0) {
                setColorAssets({ loading: false, error: null, data: createEmptyAssetPage() });
                setColorPage(0);
                return () => controller.abort();
            }
            console.info("[project API] mock mode active – fetching color guide assets via detail API", targetIds);
            setColorAssets((prev) => ({ ...prev, loading: true, error: null }));
            fetchListItemsByIds(targetIds, fetchColorGuideDetail, mapColorGuideDetailToListItem, controller.signal)
                .then((items) => {
                    if (controller.signal.aborted) return;
                    const paginated = buildMockPaginatedAsset(items, colorPage);
                    setColorAssets({ loading: false, error: null, data: paginated });
                    if (paginated.page !== colorPage) {
                        setColorPage(paginated.page);
                    }
                })
                .catch((err) => {
                    if (controller.signal.aborted) return;
                    setColorAssets((prev) => ({
                        ...prev,
                        loading: false,
                        error: err instanceof Error ? err.message : "컬러 가이드를 불러오지 못했습니다.",
                    }));
                });
            return () => controller.abort();
        }

        if (targetIds.length === 0) {
            setColorAssets({ loading: false, error: null, data: createEmptyAssetPage() });
            setColorPage(0);
            return () => controller.abort();
        }

        setColorAssets((prev) => ({ ...prev, loading: true, error: null }));
        fetchColorGuidePage(
            { projectId: project.id, page: colorPage, size: PROJECT_ASSET_PAGE_SIZE, filter: "mine" },
            { signal: controller.signal },
        )
            .then((payload) => {
                if (controller.signal.aborted) return;
                setColorAssets({ loading: false, error: null, data: payload });
                if (payload.page !== colorPage) {
                    setColorPage(payload.page);
                }
            })
            .catch((err) => {
                if (controller.signal.aborted) return;
                setColorAssets((prev) => ({
                    ...prev,
                    loading: false,
                    error: err instanceof Error ? err.message : "컬러 가이드를 불러오지 못했습니다.",
                }));
            });

        return () => controller.abort();
    }, [project, assetRefreshToken, useMockApi, colorPage]);

    // 산출물 API를 다시 호출하도록 토큰 증가
    const refreshAssets = () => {
        setAssetRefreshToken((token) => token + 1);
    };
    // 제목 수정 모드 토글
    const handleStartTitleEdit = () => {
        setIsTitleEditing(true);
    };
    const handleFinishTitleEdit = async () => {
        const saved = await persistNameChange();
        if (!saved) return;
        setIsTitleEditing(false);
    };

    // 산출물 수정 모드 토글
    const handleStartAssetEdit = () => {
        setIsAssetEditing(true);
    };
    const handleFinishAssetEdit = () => {
        setIsAssetEditing(false);
        setPickerType(null);
        setAssetError(null);
    };

    // 편집 중일 때만 산출물 추가 모달 오픈
    const handleOpenPicker = (type: ProjectAssetType) => {
        if (!project || !isAssetEditing || assetUpdating) return;
        setPickerType(type);
    };

    // API 호출 성공 전에 즉시 카드에서 제거하기 위해 프로젝트 상태를 선반영
    const removeAssetReference = (type: ProjectAssetType, assetId: number) => {
        setProject((prev) => {
            if (!prev) return prev;
            const key: "logoIds" | "brandStrategyIds" | "colorGuideIds" =
                type === "logo" ? "logoIds" : type === "branding" ? "brandStrategyIds" : "colorGuideIds";
            if (!prev[key].includes(assetId)) return prev;
            const next: ProjectRecord = {
                ...prev,
                [key]: prev[key].filter((value) => value !== assetId),
            };
            onUpdated(next);
            return next;
        });
    };

    // data URL 또는 원격 이미지 다운로드 유틸
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
                alert(
                    `이미지를 다운로드할 수 없습니다. 원격 저장소에서 CORS를 허용하지 않아 브라우저가 요청을 차단했습니다.\n(${message})`,
                );
            } else {
                alert(message);
            }
        }
    };

    // 텍스트 클립보드 복사 유틸 (실패 시 안내)
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

    // 로고 삭제 후 프로젝트 상태/모달 정리
    const handleLogoDelete = async (id: number) => {
        setLogoActions((prev) => ({ ...prev, deletingId: id }));
        try {
            if (!useMockApi) {
                await deleteLogo(id);
            } else {
                console.info("[project API] mock delete logo", id);
            }
            removeAssetReference("logo", id);
            closeIfTarget("logo", id);
            refreshAssets();
        } catch (err) {
            const message = err instanceof Error ? err.message : "로고 삭제에 실패했습니다.";
            alert(message);
        } finally {
            setLogoActions((prev) => ({ ...prev, deletingId: null }));
        }
    };

    // 로고 카드 다운로드
    const handleLogoDownload = async (item: LogoListItem) => {
        setLogoActions((prev) => ({ ...prev, downloadingId: item.id }));
        await downloadBinary(item.imageUrl, `logo-${item.id}.png`);
        setLogoActions((prev) => ({ ...prev, downloadingId: null }));
    };

    // 로고 이미지를 클립보드로 복사
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

    // 브랜딩 전략 삭제
    const handleBrandingDelete = async (id: number) => {
        setBrandingActions((prev) => ({ ...prev, deletingId: id }));
        try {
            if (!useMockApi) {
                await deleteBranding({ id });
            } else {
                console.info("[project API] mock delete branding", id);
            }
            removeAssetReference("branding", id);
            closeIfTarget("branding", id);
            refreshAssets();
        } catch (err) {
            const message = err instanceof Error ? err.message : "브랜딩 전략 삭제에 실패했습니다.";
            alert(message);
        } finally {
            setBrandingActions((prev) => ({ ...prev, deletingId: null }));
        }
    };

    // 브랜딩 전략 마크다운 복사
    const handleBrandingCopy = async (item: BrandStrategyListItem) => {
        setBrandingActions((prev) => ({ ...prev, copyingId: item.id }));
        const text = item.markdown ?? item.summaryKo ?? item.briefKo;
        const ok = await copyToClipboard(text, "브랜딩 전략 복사에 실패했습니다.");
        if (ok) alert("브랜딩 전략이 클립보드에 복사되었습니다.");
        setBrandingActions((prev) => ({ ...prev, copyingId: null }));
    };

    // 브랜딩 전략 텍스트 파일 다운로드
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

    // 컬러 가이드 삭제
    const handleColorGuideDelete = async (id: number) => {
        setColorActions((prev) => ({ ...prev, deletingId: id }));
        try {
            if (!useMockApi) {
                await deleteColorGuide(id);
            } else {
                console.info("[project API] mock delete color guide", id);
            }
            removeAssetReference("colorGuide", id);
            closeIfTarget("colorGuide", id);
            refreshAssets();
        } catch (err) {
            const message = err instanceof Error ? err.message : "컬러 가이드 삭제에 실패했습니다.";
            alert(message);
        } finally {
            setColorActions((prev) => ({ ...prev, deletingId: null }));
        }
    };

    // 컬러 가이드 HEX 요약을 클립보드로 복사
    const handleColorGuideCopy = async (item: ColorGuideListItem) => {
        setColorActions((prev) => ({ ...prev, copyingId: item.id }));
        const summary = [
            `Main: ${item.mainHex ?? "-"}`,
            `Sub: ${item.subHex ?? "-"}`,
            `Point: ${item.pointHex ?? "-"}`,
            `Background: ${item.backgroundHex ?? "-"}`,
        ].join("\n");
        const ok = await copyToClipboard(summary, "컬러 가이드 복사에 실패했습니다.");
        if (ok) alert("컬러 가이드 정보가 클립보드에 복사되었습니다.");
        setColorActions((prev) => ({ ...prev, copyingId: null }));
    };

    // 컬러 가이드 요약 텍스트 다운로드
    const handleColorGuideDownload = async (item: ColorGuideListItem) => {
        setColorActions((prev) => ({ ...prev, downloadingId: item.id }));
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
        setColorActions((prev) => ({ ...prev, downloadingId: null }));
    };

    // updateProject 호출용 payload builder
    const buildUpdatePayload = (draft: Partial<ProjectRecord>) => ({
        name: draft.name ?? project?.name ?? "",
        logoIds: draft.logoIds ?? project?.logoIds ?? [],
        brandStrategyIds: draft.brandStrategyIds ?? project?.brandStrategyIds ?? [],
        colorGuideIds: draft.colorGuideIds ?? project?.colorGuideIds ?? [],
    });
    // 프로젝트 제목을 실제 API에 반영 (변경 사항 저장 시 함께 호출)
    const persistNameChange = async (): Promise<boolean> => {
        if (!project) return true;
        const nextName = nameValue.trim();
        if (!nextName) {
            setFormError("프로젝트 이름을 입력해주세요.");
            return false;
        }
        if (nextName === project.name) {
            setFormError(null);
            return true;
        }
        setSavingName(true);
        setFormError(null);
        try {
            if (useMockApi) {
                const updated: ProjectRecord = {
                    ...project,
                    name: nextName,
                    updatedAt: new Date().toISOString(),
                };
                console.info("[project API] mock rename", updated);
                setProject(updated);
                setNameValue(updated.name);
                onUpdated(updated);
                return true;
            }
            const updated = await updateProject(project.id, buildUpdatePayload({ name: nextName }));
            setProject(updated);
            setNameValue(updated.name);
            onUpdated(updated);
            return true;
        } catch (err) {
            setFormError(err instanceof Error ? err.message : "프로젝트 이름 수정 중 오류가 발생했습니다.");
            return false;
        } finally {
            setSavingName(false);
        }
    };

    // 산출물 attach/detach 공통 루틴
    const mutateAssets = async (type: ProjectAssetType, assetId: number, action: "attach" | "detach") => {
        if (!project) return;
        if (!isAssetEditing) {
            setAssetError("프로젝트 수정 모드에서만 산출물을 변경할 수 있습니다.");
            return;
        }
        if (action === "detach") {
            const label = ASSET_LABEL[type];
            const confirmed = window.confirm(`${label}을(를) 프로젝트에서 제외하면 즉시 적용됩니다. 계속할까요?`);
            if (!confirmed) return;
        }
        const key =
            type === "logo"
                ? "logoIds"
                : type === "branding"
                    ? "brandStrategyIds"
                    : "colorGuideIds";
        const current = project[key];
        const hasId = current.includes(assetId);

        if (action === "attach" && hasId) return;
        if (action === "detach" && !hasId) return;

        const nextIds =
            action === "attach"
                ? [...current, assetId]
                : current.filter((id) => id !== assetId);

        setAssetUpdating(true);
        setAssetError(null);

        try {
            if (useMockApi) {
                const updated: ProjectRecord = {
                    ...project,
                    [key]: nextIds,
                    updatedAt: new Date().toISOString(),
                };
                console.info("[project API] mock asset update", type, nextIds);
                setProject(updated);
                onUpdated(updated);
                if (action === "detach") {
                    closeIfTarget(type, assetId);
                }
                setAssetUpdating(false);
                return;
            }
            const updated = await updateProject(project.id, buildUpdatePayload({ [key]: nextIds }));
            setProject(updated);
            onUpdated(updated);
            if (action === "detach") {
                closeIfTarget(type, assetId);
            }
            refreshAssets();
        } catch (err) {
            setAssetError(err instanceof Error ? err.message : "프로젝트 산출물 갱신 중 오류가 발생했습니다.");
        } finally {
            setAssetUpdating(false);
        }
    };

    const logoItems = logoAssets.data?.content ?? [];
    const brandingItems = brandingAssets.data?.content ?? [];
    const colorItems = colorAssets.data?.content ?? [];

    // 프로젝트 삭제 처리
    const handleDeleteProject = async () => {
        if (!project) return;
        const confirmed = window.confirm("프로젝트를 삭제하면 연결된 정보가 모두 사라집니다. 계속 진행할까요?");
        if (!confirmed) return;
        setDeletePending(true);
        try {
            if (!useMockApi) {
                await deleteProject(project.id);
            } else {
                console.info("[project API] mock delete project", project.id);
            }
            onDeleted(project.id);
            onClose();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : "프로젝트 삭제 중 오류가 발생했습니다.");
        } finally {
            setDeletePending(false);
        }
    };

    let detailToolbarProps: ProductToolbarProps | undefined;
    if (detailState.open && detailState.type === "logo" && detailLogoPreview) {
        const listItem = asLogoListItem(detailLogoData, detailLogoPreview);
        detailToolbarProps = {
            id: listItem.id,
            onDelete: handleLogoDelete,
            onDownload: (_id) => {
                void handleLogoDownload(listItem);
            },
            onCopy: (_id) => {
                void handleLogoCopy(listItem);
            },
            isDeleting: logoActions.deletingId === listItem.id,
            isDownloading: logoActions.downloadingId === listItem.id,
            isCopying: logoActions.copyingId === listItem.id,
        };
    } else if (detailState.open && detailState.type === "branding" && detailBrandPreview) {
        const listItem = asBrandStrategyListItem(detailBrandData, detailBrandPreview);
        detailToolbarProps = {
            id: listItem.id,
            onDelete: handleBrandingDelete,
            onDownload: (_id) => {
                void handleBrandingDownload(listItem);
            },
            onCopy: (_id) => {
                void handleBrandingCopy(listItem);
            },
            isDeleting: brandingActions.deletingId === listItem.id,
            isDownloading: brandingActions.downloadingId === listItem.id,
            isCopying: brandingActions.copyingId === listItem.id,
        };
    } else if (detailState.open && detailState.type === "colorGuide" && detailColorPreview) {
        const listItem = asColorGuideListItem(detailColorData, detailColorPreview);
        detailToolbarProps = {
            id: listItem.id,
            onDelete: handleColorGuideDelete,
            onDownload: (_id) => {
                void handleColorGuideDownload(listItem);
            },
            onCopy: (_id) => {
                void handleColorGuideCopy(listItem);
            },
            isDeleting: colorActions.deletingId === listItem.id,
            isDownloading: colorActions.downloadingId === listItem.id,
            isCopying: colorActions.copyingId === listItem.id,
        };
    }

    const detailLogoForModal =
        detailState.open && detailState.type === "logo"
            ? detailLogoData ?? (detailLogoPreview ? previewToLogoDetail(detailLogoPreview) : undefined)
            : undefined;
    const detailBrandForModal =
        detailState.open && detailState.type === "branding"
            ? detailBrandData ?? (detailBrandPreview ? previewToBrandDetail(detailBrandPreview) : undefined)
            : undefined;
    const detailColorForModal =
        detailState.open && detailState.type === "colorGuide"
            ? detailColorData ?? (detailColorPreview ? previewToColorGuideDetail(detailColorPreview) : undefined)
            : undefined;

    return (
        <div
            className={styles.overlay}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
            role="dialog"
            aria-modal="true"
            aria-label="프로젝트 상세"
        >
            <div
                className={`${styles.modal} ${styles.modalLarge}`}
                onClick={(event) => event.stopPropagation()}
            >
                <header className={styles.modalHeader}>
                    <div>
                        <h2 className={styles.modalTitle}>프로젝트 상세 보기</h2>
                    </div>
                    <div className={styles.modalHeaderActions}>
                        <div className={styles.editControls}>
                            {!isAssetEditing ? (
                                <TextButton
                                    label="프로젝트 수정"
                                    variant="outlined"
                                    onClick={handleStartAssetEdit}
                                    className={styles.editModeButton}
                                />
                            ) : (
                                <TextButton
                                    label="수정 완료"
                                    variant="outlined"
                                    onClick={handleFinishAssetEdit}
                                    className={styles.editModeButton}
                                />
                            )}
                        </div>
                        <button
                            type="button"
                            className={styles.iconButton}
                            onClick={handleDeleteProject}
                            disabled={deletePending}
                            aria-label="프로젝트 삭제"
                        >
                            {deletePending ? <span className={styles.iconButtonSpinner} /> : <img src={iconDelete} alt="" />}
                        </button>
                        <button
                            type="button"
                            className={styles.closeButton}
                            onClick={onClose}
                            aria-label="닫기"
                        >
                            ×
                        </button>
                    </div>
                </header>
                <div className={styles.modalBody}>
                    {loading && <p className={styles.status}>프로젝트 정보를 불러오는 중입니다…</p>}
                    {error && <p className={`${styles.status} ${styles.statusError}`}>{error}</p>}
                    {formError && <p className={`${styles.status} ${styles.statusError}`}>{formError}</p>}
                    {assetError && <p className={`${styles.status} ${styles.statusError}`}>{assetError}</p>}

                    {project && (
                        <>
                            <section className={styles.metaSection}>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>생성일</span>
                                    <span className={styles.metaValue}>{formatDateTime(project.createdAt)}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>수정일</span>
                                    <span className={styles.metaValue}>{formatDateTime(project.updatedAt)}</span>
                                </div>
                            </section>
                            <section className={styles.fieldGroup}>
                                <label className={styles.fieldLabel} htmlFor="project-name">
                                    프로젝트 제목
                                </label>
                                <div className={styles.nameRow}>
                                    <input
                                        id="project-name"
                                        className={`${styles.textInput} ${styles.projectNameInput}`}
                                        value={nameValue}
                                        onChange={(event) => setNameValue(event.target.value)}
                                        placeholder="프로젝트 이름을 입력하세요"
                                        disabled={!isTitleEditing}
                                    />
                                    {!isTitleEditing ? (
                                        <TextButton
                                            label="프로젝트 제목 변경"
                                            variant="outlined"
                                            onClick={handleStartTitleEdit}
                                            className={styles.editModeButton}
                                        />
                                    ) : (
                                        <TextButton
                                            label={savingName ? "저장 중…" : "프로젝트 제목 저장"}
                                            variant="outlined"
                                            onClick={() => void handleFinishTitleEdit()}
                                            disabled={savingName}
                                            className={styles.editModeButton}
                                        />
                                    )}
                                </div>
                                {isTitleEditing && <p className={styles.editHint}>제목 변경은 즉시 적용됩니다.</p>}
                            </section>
                            <ProjectAssetSection
                                title="포함된 로고"
                                loading={logoAssets.loading}
                                error={logoAssets.error}
                                emptyMessage="현재 프로젝트에 포함된 로고가 없습니다."
                                onAddClick={() => handleOpenPicker("logo")}
                                actionLabel="로고 추가"
                                disabled={assetUpdating}
                                showAction={isAssetEditing}
                                footer={
                                    logoAssets.data && (
                                        <Pagination
                                            page={logoPage}
                                            totalPages={Math.max(logoAssets.data.totalPages, 1)}
                                            onChange={setLogoPage}
                                        />
                                    )
                                }
                            >
                                {logoItems.length > 0 && (
                                    <div className={styles.assetGrid}>
                                        {logoItems.map((item) => (
                                            <div key={item.id} className={styles.assetWrapper}>
                                                <LogoCard
                                                    id={item.id}
                                                    logoBase64={ensureDataUrl(item.imageUrl)}
                                                    onDelete={() => handleLogoDelete(item.id)}
                                                    onCopy={() => handleLogoCopy(item)}
                                                    onDownload={() => handleLogoDownload(item)}
                                                    isDeleting={logoActions.deletingId === item.id}
                                                    isCopying={logoActions.copyingId === item.id}
                                                    isDownloading={logoActions.downloadingId === item.id}
                                                    onSelect={(_id) => openDetail({ type: "logo", item })}
                                                />
                                                {isAssetEditing && (
                                                    <button
                                                        type="button"
                                                        className={styles.assetActionButton}
                                                        onClick={() => mutateAssets("logo", item.id, "detach")}
                                                        disabled={assetUpdating}
                                                    >
                                                        프로젝트에서 제외
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ProjectAssetSection>

                            <ProjectAssetSection
                                title="포함된 브랜딩 전략"
                                loading={brandingAssets.loading}
                                error={brandingAssets.error}
                                emptyMessage="현재 프로젝트에 포함된 브랜딩 전략이 없습니다."
                                onAddClick={() => handleOpenPicker("branding")}
                                actionLabel="브랜딩 전략 추가"
                                disabled={assetUpdating}
                                showAction={isAssetEditing}
                                footer={
                                    brandingAssets.data && (
                                        <Pagination
                                            page={brandingPage}
                                            totalPages={Math.max(brandingAssets.data.totalPages, 1)}
                                            onChange={setBrandingPage}
                                        />
                                    )
                                }
                            >
                                {brandingItems.length > 0 && (
                                    <div className={styles.assetGrid}>
                                        {brandingItems.map((item) => (
                                            <div key={item.id} className={styles.assetWrapper}>
                                                <BrandStrategyDeliverableCard
                                                    item={item}
                                                    onDelete={() => handleBrandingDelete(item.id)}
                                                    onCopy={() => handleBrandingCopy(item)}
                                                    onDownload={() => handleBrandingDownload(item)}
                                                    isDeleting={brandingActions.deletingId === item.id}
                                                    isCopying={brandingActions.copyingId === item.id}
                                                    isDownloading={brandingActions.downloadingId === item.id}
                                                    onSelect={(_id) => openDetail({ type: "branding", item })}
                                                />
                                                {isAssetEditing && (
                                                    <button
                                                        type="button"
                                                        className={styles.assetActionButton}
                                                        onClick={() => mutateAssets("branding", item.id, "detach")}
                                                        disabled={assetUpdating}
                                                    >
                                                        프로젝트에서 제외
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ProjectAssetSection>

                            <ProjectAssetSection
                                title="포함된 컬러 가이드"
                                loading={colorAssets.loading}
                                error={colorAssets.error}
                                emptyMessage="현재 프로젝트에 포함된 컬러 가이드가 없습니다."
                                onAddClick={() => handleOpenPicker("colorGuide")}
                                actionLabel="컬러 가이드 추가"
                                disabled={assetUpdating}
                                showAction={isAssetEditing}
                                footer={
                                    colorAssets.data && (
                                        <Pagination
                                            page={colorPage}
                                            totalPages={Math.max(colorAssets.data.totalPages, 1)}
                                            onChange={setColorPage}
                                        />
                                    )
                                }
                            >
                                {colorItems.length > 0 && (
                                    <div className={styles.assetGrid}>
                                        {colorItems.map((item) => (
                                            <div key={item.id} className={styles.assetWrapper}>
                                                <ColorGuideDeliverableCard
                                                    item={item}
                                                    onDelete={() => handleColorGuideDelete(item.id)}
                                                    onCopy={() => handleColorGuideCopy(item)}
                                                    onDownload={() => handleColorGuideDownload(item)}
                                                    isDeleting={colorActions.deletingId === item.id}
                                                    isCopying={colorActions.copyingId === item.id}
                                                    isDownloading={colorActions.downloadingId === item.id}
                                                    onSelect={(_id) => openDetail({ type: "colorGuide", item })}
                                                />
                                                {isAssetEditing && (
                                                    <button
                                                        type="button"
                                                        className={styles.assetActionButton}
                                                        onClick={() => mutateAssets("colorGuide", item.id, "detach")}
                                                        disabled={assetUpdating}
                                                    >
                                                        프로젝트에서 제외
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ProjectAssetSection>
                        </>
                    )}
                </div>
            </div>

            {pickerType && project && (
                <ProjectAssetPickerModal
                    type={pickerType}
                    excludedIds={
                        pickerType === "logo"
                            ? project.logoIds
                            : pickerType === "branding"
                                ? project.brandStrategyIds
                                : project.colorGuideIds
                    }
                    onClose={() => setPickerType(null)}
                    onAttach={(assetId) => mutateAssets(pickerType, assetId, "attach")}
                    disabled={assetUpdating}
                />
            )}
            {detailState.open && detailState.type === "logo" && detailLogoPreview && (
                <DeliverableDetailModal
                    type="logo"
                    data={detailLogoForModal}
                    loading={detailState.loading}
                    error={detailState.error ?? undefined}
                    toolbarProps={detailToolbarProps}
                    onClose={closeDetail}
                    onRetry={
                        detailState.error && detailState.id != null
                            ? () => loadDetail("logo", detailState.id!)
                            : undefined
                    }
                />
            )}
            {detailState.open && detailState.type === "branding" && detailBrandPreview && (
                <DeliverableDetailModal
                    type="branding"
                    data={detailBrandForModal}
                    loading={detailState.loading}
                    error={detailState.error ?? undefined}
                    toolbarProps={detailToolbarProps}
                    onClose={closeDetail}
                    onRetry={
                        detailState.error && detailState.id != null
                            ? () => loadDetail("branding", detailState.id!)
                            : undefined
                    }
                />
            )}
            {detailState.open && detailState.type === "colorGuide" && detailColorPreview && (
                <DeliverableDetailModal
                    type="colorGuide"
                    data={detailColorForModal}
                    loading={detailState.loading}
                    error={detailState.error ?? undefined}
                    toolbarProps={detailToolbarProps}
                    onClose={closeDetail}
                    onRetry={
                        detailState.error && detailState.id != null
                            ? () => loadDetail("colorGuide", detailState.id!)
                            : undefined
                    }
                />
            )}
        </div>
    );
}
// === End Component: ProjectDetailModal ===
type ProjectAssetSectionProps = {
    title: string;
    loading: boolean;
    error: string | null;
    emptyMessage: string;
    onAddClick?: () => void;
    children: ReactNode;
    actionLabel?: string;
    disabled?: boolean;
    showAction?: boolean;
    footer?: ReactNode;
};
// === Component: ProjectAssetSection ===
// 프로젝트 상세 패널에서 로고/브랜딩/컬러 블록을 묶고 상단 액션 버튼을 출력하는 래퍼 영역이다.
function ProjectAssetSection({
    title,
    loading,
    error,
    emptyMessage,
    onAddClick,
    children,
    actionLabel,
    disabled,
    showAction,
    footer,
}: ProjectAssetSectionProps) {
    const canShowAction = Boolean(showAction && actionLabel && onAddClick);
    return (
        <section className={styles.assetSection}>
            <header className={styles.assetHeader}>
                <h3 className={styles.assetTitle}>{title}</h3>
                {canShowAction && (
                    <button
                        type="button"
                        className={`${styles.detailButton} ${styles.assetAddButton}`}
                        onClick={onAddClick}
                        disabled={disabled}
                    >
                        <span className={styles.actionButtonContent}>
                            <img src={iconPlus} alt="" className={styles.actionButtonIcon} />
                            {actionLabel}
                        </span>
                    </button>
                )}
            </header>
            {loading && <p className={styles.assetStatus}>산출물을 불러오는 중입니다…</p>}
            {error && <p className={`${styles.assetStatus} ${styles.statusError}`}>{error}</p>}
            {!loading && !error && children}
            {!loading && !error && !children && (
                <p className={styles.assetEmpty}>{emptyMessage}</p>
            )}
            {!loading && !error && footer && <div className={styles.assetFooter}>{footer}</div>}
        </section>
    );
}
// === End Component: ProjectAssetSection ===
type ProjectCreateModalProps = {
    existingNames: string[];
    onClose: () => void;
    onCreated: (project: ProjectRecord) => void;
    useMockApi: boolean;
};
// === Component: ProjectCreateModal ===
// 새 프로젝트 생성 모달 UI: 이름 입력 및 API/mocked 생성 요청을 핸들링한다.
function ProjectCreateModal({ existingNames, onClose, onCreated, useMockApi }: ProjectCreateModalProps) {
    const [name, setName] = useState(""); // 입력된 프로젝트 이름
    const [error, setError] = useState<string | null>(null); // 검증/요청 에러 메시지
    const [pending, setPending] = useState(false); // 생성 요청 진행 여부

    const normalizedNames = useMemo(
        () => existingNames.map((value) => value.trim().toLowerCase()),
        [existingNames],
    ); // 중복 검사용 소문자/trim 이름 목록

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) {
            setError("프로젝트 제목을 입력해주세요.");
            return;
        }
        if (normalizedNames.includes(trimmed.toLowerCase())) {
            setError("동일한 프로젝트 이름이 이미 존재합니다.");
            return;
        }
        setPending(true);
        setError(null);
        try {
            const project = useMockApi
                ? createMockProjectRecord(trimmed)
                : await createProject({ name: trimmed, logoIds: [], brandStrategyIds: [], colorGuideIds: [] });
            console.info("[project API] project create", project);
            onCreated(project);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "프로젝트 생성 중 오류가 발생했습니다.");
        } finally {
            setPending(false);
        }
    };

    return (
        <div
            className={styles.overlay}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
            role="dialog"
            aria-modal="true"
            aria-label="새 프로젝트 만들기"
        >
            <div
                className={`${styles.modal} ${styles.modalNarrow}`}
                onClick={(event) => event.stopPropagation()}
            >
                <header className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>새 프로젝트 만들기</h2>
                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="닫기"
                    >
                        ×
                    </button>
                </header>
                <form className={styles.modalBody} onSubmit={handleSubmit}>
                    <label className={styles.fieldLabel} htmlFor="new-project-name">
                        프로젝트 제목
                    </label>
                    <input
                        id="new-project-name"
                        className={styles.textInput}
                        placeholder="예: 패키지 리뉴얼 캠페인"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                    {error && <p className={`${styles.status} ${styles.statusError}`}>{error}</p>}
                    <div className={styles.modalFooter}>
                        <button
                            type="submit"
                            className={styles.primaryButton}
                            disabled={pending}
                        >
                            {pending ? "생성 중…" : "프로젝트 생성"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
// === End Component: ProjectCreateModal ===
type ProjectAssetPickerModalProps = {
    type: ProjectAssetType;
    excludedIds: number[];
    onClose: () => void;
    onAttach: (assetId: number) => Promise<void> | void;
    disabled?: boolean;
};
// === Component: ProjectAssetPickerModal ===
// 프로젝트에 산출물을 추가할 때 쓰는 선택 모달 UI와 페이징 리스트를 담당한다.
function ProjectAssetPickerModal({
    type,
    excludedIds,
    onClose,
    onAttach,
    disabled,
}: ProjectAssetPickerModalProps) {
    const [page, setPage] = useState(0); // 현재 선택 목록 페이지
    const [loading, setLoading] = useState(true); // 목록 로딩 여부
    const [error, setError] = useState<string | null>(null); // 목록 로딩 에러
    const [items, setItems] = useState<(LogoListItem | BrandStrategyListItem | ColorGuideListItem)[]>([]); // 렌더링할 산출물 목록
    const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
    const [attachingId, setAttachingId] = useState<number | null>(null); // 추가 버튼 로딩 상태
    const excludedSet = useMemo(() => new Set(excludedIds), [excludedIds]); // 현재 프로젝트에 이미 포함된 산출물 ID 집합

    // 모달 타입이 바뀌면 페이지를 리셋
    useEffect(() => {
        setPage(0);
    }, [type]);

    // 산출물 목록 fetch (현재 프로젝트에 없는 항목만 필터)
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);

        const commonParams = { page, size: 6, filter: "mine" as const };

        const request = type === "logo"
            ? fetchLogoPage(commonParams, { signal: controller.signal })
            : type === "branding"
                ? fetchBrandStrategyPage(commonParams, { signal: controller.signal })
                : fetchColorGuidePage(commonParams, { signal: controller.signal });

        request
            .then((payload) => {
                if (controller.signal.aborted) return;
                // 현재 프로젝트에 이미 포함된 산출물은 목록에 보여주지 않는다.
                const filtered = payload.content.filter((item) => !excludedSet.has(item.id));
                setItems(filtered);
                setTotalPages(Math.max(payload.totalPages, 1));
                setLoading(false);
            })
            .catch((err) => {
                if (controller.signal.aborted) return;
                setError(err instanceof Error ? err.message : "산출물 목록을 불러오지 못했습니다.");
                setLoading(false);
            });

        return () => controller.abort();
    }, [type, page, excludedSet]);

    // 카드 클릭/버튼으로 프로젝트에 산출물 추가
    const handleAttach = async (id: number) => {
        if (excludedSet.has(id) || disabled) return;
        setAttachingId(id);
        try {
            await onAttach(id);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "프로젝트에 추가하지 못했습니다.");
        } finally {
            setAttachingId(null);
        }
    };

    const title = `${ASSET_LABEL[type]} 추가`;

    return (
        <div
            className={styles.overlay}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            <div
                className={`${styles.modal} ${styles.modalMedium}`}
                onClick={(event) => event.stopPropagation()}
            >
                <header className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>{title}</h2>
                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="닫기"
                    >
                        ×
                    </button>
                </header>
                <div className={styles.modalBody}>
                    {loading && <p className={styles.status}>산출물 목록을 불러오는 중입니다…</p>}
                    {error && <p className={`${styles.status} ${styles.statusError}`}>{error}</p>}
                    {!loading && !error && items.length === 0 && (
                        <p className={styles.assetEmpty}>추가할 수 있는 산출물이 없습니다.</p>
                    )}
                    {!loading && !error && items.length > 0 && (
                        <div className={styles.assetGrid}>
                            {items.map((item) => {
                                const id = item.id;
                                const disabledButton = disabled || attachingId === id;
                                const commonButton = (
                                    <button
                                        type="button"
                                        className={styles.primaryButton}
                                        onClick={() => handleAttach(id)}
                                        disabled={disabledButton}
                                    >
                                        {attachingId === id ? "추가 중…" : "프로젝트에 추가"}
                                    </button>
                                );
                                if (type === "logo") {
                                    const logo = item as LogoListItem;
                                    return (
                                        <div key={id} className={styles.assetWrapper}>
                                            <LogoCard
                                                id={logo.id}
                                                logoBase64={ensureDataUrl(logo.imageUrl)}
                                                onSelect={() => handleAttach(logo.id)}
                                            />
                                            {commonButton}
                                        </div>
                                    );
                                }
                                if (type === "branding") {
                                    const branding = item as BrandStrategyListItem;
                                    return (
                                        <div key={id} className={styles.assetWrapper}>
                                            <BrandStrategyDeliverableCard
                                                item={branding}
                                                onSelect={() => handleAttach(branding.id)}
                                            />
                                            {commonButton}
                                        </div>
                                    );
                                }
                                const colorGuide = item as ColorGuideListItem;
                                return (
                                    <div key={id} className={styles.assetWrapper}>
                                        <ColorGuideDeliverableCard
                                            item={colorGuide}
                                            onSelect={() => handleAttach(colorGuide.id)}
                                        />
                                        {commonButton}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {!loading && !error && (
                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            onChange={(next) => setPage(next)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
// === End Component: ProjectAssetPickerModal ===
