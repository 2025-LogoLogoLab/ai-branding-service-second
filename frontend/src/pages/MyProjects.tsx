
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
import { fetchLogoPage, type LogoListItem } from "../custom_api/logo";
import { fetchBrandStrategyPage, type BrandStrategyListItem } from "../custom_api/branding";
import { fetchColorGuidePage, type ColorGuideListItem } from "../custom_api/colorguide";
import { LogoCard } from "../organisms/LogoCard/LogoCard";
import BrandStrategyDeliverableCard from "../organisms/BrandStrategyDeliverableCard/BrandStrategyDeliverableCard";
import ColorGuideDeliverableCard from "../organisms/ColorGuideDeliverableCard/ColorGuideDeliverableCard";
import Pagination from "../molecules/Pagination/Pagination";
import { ensureDataUrl } from "../utils/image";
import type { HttpMethod } from "../custom_api/types";

type ProjectAssetType = "logo" | "branding" | "colorGuide";

type AssetState<T> = {
    loading: boolean;
    error: string | null;
    items: T[];
};

const createAssetState = <T,>(): AssetState<T> => ({
    loading: false,
    error: null,
    items: [],
});

const ASSET_LABEL: Record<ProjectAssetType, string> = {
    logo: "로고",
    branding: "브랜딩 전략",
    colorGuide: "컬러 가이드",
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
});

type MyProjectsVariant = "page" | "embedded";

type MyProjectsProps = {
    variant?: MyProjectsVariant;
    showSettingsPanel?: boolean;
};

const cx = (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(" ").trim();

export default function MyProjects({ variant = "page", showSettingsPanel }: MyProjectsProps) {
    const [projects, setProjects] = useState<ProjectRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [detailId, setDetailId] = useState<number | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [projectApiSettings, setProjectApiSettings] = useState<ProjectApiSettings>(DEFAULT_PROJECT_API_SETTINGS);

    const useMockApi = useMemo(() => !isProjectApiConfigured(projectApiSettings), [projectApiSettings]);
    const handleProjectApiConfigChange = (section: keyof ProjectApiSettings, field: "url" | "method", value: string) => {
        setProjectApiSettings((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: field === "method" ? (value as HttpMethod) : value,
            },
        }));
    };

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);

        if (useMockApi) {
            console.info("[project API] mock mode active: using demo project list", DEMO_PROJECTS);
            setProjects(DEMO_PROJECTS);
            setLoading(false);
            return () => controller.abort();
        }

        console.info("[project API] fetch project list start");
        fetchProjectList({ signal: controller.signal })
            .then((list) => {
                if (controller.signal.aborted) return;
                console.info("[project API] fetch project list success", list);
                setProjects(list);
                setLoading(false);
            })
            .catch((err) => {
                if (controller.signal.aborted) return;
                console.warn("[project API] fetch project list error", err);
                setError(err instanceof Error ? err.message : "프로젝트 목록을 불러오지 못했습니다.");
                setLoading(false);
            });

        return () => controller.abort();
    }, [useMockApi]);

    const selectedProject = useMemo(
        () => projects.find((item) => item.id === detailId),
        [projects, detailId],
    );

    const handleProjectCreated = (project: ProjectRecord) => {
        setProjects((prev) => [project, ...prev]);
    };

    const handleProjectUpdated = (project: ProjectRecord) => {
        setProjects((prev) => prev.map((item) => (item.id === project.id ? project : item)));
    };

    const handleProjectDeleted = (projectId: number) => {
        setProjects((prev) => prev.filter((item) => item.id !== projectId));
        setDetailId((prev) => (prev === projectId ? null : prev));
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
                            <button
                                type="button"
                                className={styles.createButton}
                                onClick={() => setCreateOpen(true)}
                            >
                                <img src={iconPlus} alt="" className={styles.createIcon} />
                                새 프로젝트
                            </button>
                        </div>
                    </header>
                )}

                <section className={panelClass}>
                    {!isPageVariant && (
                        <div className={styles.panelToolbar}>
                            <p className={styles.projectHint}>
                                연관된 작업물을 폴더처럼 묶어두고 필요할 때 바로 찾아보세요.
                            </p>
                            <button
                                type="button"
                                className={styles.createButton}
                                onClick={() => setCreateOpen(true)}
                            >
                                <img src={iconPlus} alt="" className={styles.createIcon} />
                                새 프로젝트
                            </button>
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
                                        <td>{project.logoIds?.length ?? 0}</td>
                                        <td>{project.brandStrategyIds?.length ?? 0}</td>
                                        <td>{project.colorGuideIds?.length ?? 0}</td>
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
                    existingNames={projects.map((item) => item.name)}
                    onClose={() => setCreateOpen(false)}
                    onCreated={handleProjectCreated}
                    useMockApi={useMockApi}
                />
            )}
        </div>
    );
}
type ProjectDetailModalProps = {
    projectId: number;
    initialProject?: ProjectRecord;
    onClose: () => void;
    onUpdated: (project: ProjectRecord) => void;
    onDeleted: (projectId: number) => void;
    useMockApi: boolean;
};

function ProjectDetailModal({
    projectId,
    initialProject,
    onClose,
    onUpdated,
    onDeleted,
    useMockApi,
}: ProjectDetailModalProps) {
    const [project, setProject] = useState<ProjectRecord | null>(initialProject ?? null);
    const [loading, setLoading] = useState(!initialProject);
    const [error, setError] = useState<string | null>(null);
    const [nameValue, setNameValue] = useState(initialProject?.name ?? "");
    const [savingName, setSavingName] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [assetError, setAssetError] = useState<string | null>(null);
    const [assetUpdating, setAssetUpdating] = useState(false);
    const [pickerType, setPickerType] = useState<ProjectAssetType | null>(null);
    const [deletePending, setDeletePending] = useState(false);

    const [assetRefreshToken, setAssetRefreshToken] = useState(0);
    const [logoAssets, setLogoAssets] = useState<AssetState<LogoListItem>>(createAssetState);
    const [brandingAssets, setBrandingAssets] = useState<AssetState<BrandStrategyListItem>>(createAssetState);
    const [colorAssets, setColorAssets] = useState<AssetState<ColorGuideListItem>>(createAssetState);

    useEffect(() => {
        if (!initialProject || project) return;
        setProject(initialProject);
        setNameValue(initialProject.name);
    }, [initialProject, project]);

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

    useEffect(() => {
        if (!project) return;
        if (useMockApi) {
            console.info("[project API] mock logo assets: returning empty array");
            setLogoAssets({ loading: false, error: null, items: [] });
            return;
        }
        const controller = new AbortController();
        setLogoAssets((prev) => ({ ...prev, loading: true, error: null }));
        fetchLogoPage({ projectId: project.id, page: 0, size: 12 }, { signal: controller.signal })
            .then((payload) => {
                if (controller.signal.aborted) return;
                setLogoAssets({ loading: false, error: null, items: payload.content });
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
    }, [project, assetRefreshToken, useMockApi]);

    useEffect(() => {
        if (!project) return;
        if (useMockApi) {
            console.info("[project API] mock branding assets: returning empty array");
            setBrandingAssets({ loading: false, error: null, items: [] });
            return;
        }
        const controller = new AbortController();
        setBrandingAssets((prev) => ({ ...prev, loading: true, error: null }));
        fetchBrandStrategyPage({ projectId: project.id, page: 0, size: 12 }, { signal: controller.signal })
            .then((payload) => {
                if (controller.signal.aborted) return;
                setBrandingAssets({ loading: false, error: null, items: payload.content });
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
    }, [project, assetRefreshToken, useMockApi]);

    useEffect(() => {
        if (!project) return;
        if (useMockApi) {
            console.info("[project API] mock color guide assets: returning empty array");
            setColorAssets({ loading: false, error: null, items: [] });
            return;
        }
        const controller = new AbortController();
        setColorAssets((prev) => ({ ...prev, loading: true, error: null }));
        fetchColorGuidePage({ projectId: project.id, page: 0, size: 12 }, { signal: controller.signal })
            .then((payload) => {
                if (controller.signal.aborted) return;
                setColorAssets({ loading: false, error: null, items: payload.content });
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
    }, [project, assetRefreshToken, useMockApi]);

    const refreshAssets = () => {
        setAssetRefreshToken((token) => token + 1);
    };

    const buildUpdatePayload = (draft: Partial<ProjectRecord>) => ({
        name: draft.name ?? project?.name ?? "",
        logoIds: draft.logoIds ?? project?.logoIds ?? [],
        brandStrategyIds: draft.brandStrategyIds ?? project?.brandStrategyIds ?? [],
        colorGuideIds: draft.colorGuideIds ?? project?.colorGuideIds ?? [],
    });
    const handleRename = async () => {
        if (!project) return;
        const nextName = nameValue.trim();
        if (!nextName || nextName === project.name) {
            setFormError(nextName ? null : "프로젝트 이름을 입력해주세요.");
            return;
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
                setSavingName(false);
                return;
            }
            const updated = await updateProject(project.id, buildUpdatePayload({ name: nextName }));
            setProject(updated);
            setNameValue(updated.name);
            onUpdated(updated);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : "프로젝트 이름 수정 중 오류가 발생했습니다.");
        } finally {
            setSavingName(false);
        }
    };

    const mutateAssets = async (type: ProjectAssetType, assetId: number, action: "attach" | "detach") => {
        if (!project) return;
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
                setAssetUpdating(false);
                return;
            }
            const updated = await updateProject(project.id, buildUpdatePayload({ [key]: nextIds }));
            setProject(updated);
            onUpdated(updated);
            refreshAssets();
        } catch (err) {
            setAssetError(err instanceof Error ? err.message : "프로젝트 산출물 갱신 중 오류가 발생했습니다.");
        } finally {
            setAssetUpdating(false);
        }
    };

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
                        <h2 className={styles.modalTitle}>{project?.name ?? "프로젝트 상세"}</h2>
                        {project && (
                            <p className={styles.modalSubtitle}>프로젝트 ID #{project.id}</p>
                        )}
                    </div>
                    <div className={styles.modalHeaderActions}>
                        <button
                            type="button"
                            className={styles.dangerButton}
                            onClick={handleDeleteProject}
                            disabled={deletePending}
                        >
                            {deletePending ? "삭제 중…" : "프로젝트 삭제"}
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
                            <section className={styles.fieldGroup}>
                                <label className={styles.fieldLabel} htmlFor="project-name">
                                    프로젝트 제목
                                </label>
                                <div className={styles.nameRow}>
                                    <input
                                        id="project-name"
                                        className={styles.textInput}
                                        value={nameValue}
                                        onChange={(event) => setNameValue(event.target.value)}
                                        placeholder="프로젝트 이름을 입력하세요"
                                    />
                                    <button
                                        type="button"
                                        className={styles.primaryButton}
                                        onClick={handleRename}
                                        disabled={savingName}
                                    >
                                        {savingName ? "저장 중…" : "이름 저장"}
                                    </button>
                                </div>
                            </section>

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
                            <ProjectAssetSection
                                title="포함된 로고"
                                loading={logoAssets.loading}
                                error={logoAssets.error}
                                emptyMessage="현재 프로젝트에 포함된 로고가 없습니다."
                                onAddClick={() => setPickerType("logo")}
                                actionLabel="+ 로고 추가"
                                disabled={assetUpdating}
                            >
                                {logoAssets.items.length > 0 && (
                                    <div className={styles.assetGrid}>
                                        {logoAssets.items.map((item) => (
                                            <div key={item.id} className={styles.assetWrapper}>
                                                <LogoCard
                                                    id={item.id}
                                                    logoBase64={ensureDataUrl(item.imageUrl)}
                                                />
                                                <button
                                                    type="button"
                                                    className={styles.assetActionButton}
                                                    onClick={() => mutateAssets("logo", item.id, "detach")}
                                                    disabled={assetUpdating}
                                                >
                                                    프로젝트에서 제외
                                                </button>
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
                                onAddClick={() => setPickerType("branding")}
                                actionLabel="+ 브랜딩 전략 추가"
                                disabled={assetUpdating}
                            >
                                {brandingAssets.items.length > 0 && (
                                    <div className={styles.assetGrid}>
                                        {brandingAssets.items.map((item) => (
                                            <div key={item.id} className={styles.assetWrapper}>
                                                <BrandStrategyDeliverableCard item={item} />
                                                <button
                                                    type="button"
                                                    className={styles.assetActionButton}
                                                    onClick={() => mutateAssets("branding", item.id, "detach")}
                                                    disabled={assetUpdating}
                                                >
                                                    프로젝트에서 제외
                                                </button>
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
                                onAddClick={() => setPickerType("colorGuide")}
                                actionLabel="+ 컬러 가이드 추가"
                                disabled={assetUpdating}
                            >
                                {colorAssets.items.length > 0 && (
                                    <div className={styles.assetGrid}>
                                        {colorAssets.items.map((item) => (
                                            <div key={item.id} className={styles.assetWrapper}>
                                                <ColorGuideDeliverableCard item={item} />
                                                <button
                                                    type="button"
                                                    className={styles.assetActionButton}
                                                    onClick={() => mutateAssets("colorGuide", item.id, "detach")}
                                                    disabled={assetUpdating}
                                                >
                                                    프로젝트에서 제외
                                                </button>
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
        </div>
    );
}
type ProjectAssetSectionProps = {
    title: string;
    loading: boolean;
    error: string | null;
    emptyMessage: string;
    onAddClick: () => void;
    children: ReactNode;
    actionLabel: string;
    disabled?: boolean;
};

function ProjectAssetSection({
    title,
    loading,
    error,
    emptyMessage,
    onAddClick,
    children,
    actionLabel,
    disabled,
}: ProjectAssetSectionProps) {
    return (
        <section className={styles.assetSection}>
            <header className={styles.assetHeader}>
                <h3 className={styles.assetTitle}>{title}</h3>
                <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={onAddClick}
                    disabled={disabled}
                >
                    {actionLabel}
                </button>
            </header>
            {loading && <p className={styles.assetStatus}>산출물을 불러오는 중입니다…</p>}
            {error && <p className={`${styles.assetStatus} ${styles.statusError}`}>{error}</p>}
            {!loading && !error && children}
            {!loading && !error && !children && (
                <p className={styles.assetEmpty}>{emptyMessage}</p>
            )}
        </section>
    );
}
type ProjectCreateModalProps = {
    existingNames: string[];
    onClose: () => void;
    onCreated: (project: ProjectRecord) => void;
    useMockApi: boolean;
};

function ProjectCreateModal({ existingNames, onClose, onCreated, useMockApi }: ProjectCreateModalProps) {
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    const normalizedNames = useMemo(
        () => existingNames.map((value) => value.trim().toLowerCase()),
        [existingNames],
    );

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
type ProjectAssetPickerModalProps = {
    type: ProjectAssetType;
    excludedIds: number[];
    onClose: () => void;
    onAttach: (assetId: number) => Promise<void> | void;
    disabled?: boolean;
};

function ProjectAssetPickerModal({
    type,
    excludedIds,
    onClose,
    onAttach,
    disabled,
}: ProjectAssetPickerModalProps) {
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [items, setItems] = useState<(LogoListItem | BrandStrategyListItem | ColorGuideListItem)[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [attachingId, setAttachingId] = useState<number | null>(null);

    useEffect(() => {
        setPage(0);
    }, [type]);

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
                setItems(payload.content);
                setTotalPages(Math.max(payload.totalPages, 1));
                setLoading(false);
            })
            .catch((err) => {
                if (controller.signal.aborted) return;
                setError(err instanceof Error ? err.message : "산출물 목록을 불러오지 못했습니다.");
                setLoading(false);
            });

        return () => controller.abort();
    }, [type, page]);

    const excludedSet = useMemo(() => new Set(excludedIds), [excludedIds]);

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
    const swatchKeys: Array<"mainHex" | "subHex" | "pointHex" | "backgroundHex"> = [
        "mainHex",
        "subHex",
        "pointHex",
        "backgroundHex",
    ];

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
                        <div className={styles.pickerGrid}>
                            {items.map((item) => {
                                const id = item.id;
                                const disabledButton = excludedSet.has(id) || disabled || attachingId === id;
                                return (
                                    <article key={id} className={styles.pickerCard}>
                                        {type === "logo" && (
                                            <div className={styles.pickerThumb}>
                                                <img
                                                    src={ensureDataUrl((item as LogoListItem).imageUrl)}
                                                    alt="로고 미리보기"
                                                />
                                            </div>
                                        )}
                                        {type === "branding" && (
                                            <div className={styles.pickerTextBlock}>
                                                <p className={styles.pickerPrompt}>
                                                    {(item as BrandStrategyListItem).briefKo}
                                                </p>
                                                <p className={styles.pickerBodyText}>
                                                    {(item as BrandStrategyListItem).summaryKo ??
                                                        "요약 정보가 제공되지 않았습니다."}
                                                </p>
                                            </div>
                                        )}
                                        {type === "colorGuide" && (
                                            <div className={styles.pickerPalette}>
                                                {swatchKeys.map((key) => (
                                                    <span
                                                        key={key}
                                                        className={styles.pickerSwatch}
                                                        style={{
                                                            backgroundColor: (item as ColorGuideListItem)[key] ?? "#e5e7eb",
                                                        }}
                                                    />
                                                ))}
                                                <p className={styles.pickerBodyText}>
                                                    {(item as ColorGuideListItem).briefKo}
                                                </p>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            className={styles.primaryButton}
                                            onClick={() => handleAttach(id)}
                                            disabled={disabledButton}
                                        >
                                            {excludedSet.has(id)
                                                ? "이미 포함됨"
                                                : attachingId === id
                                                    ? "추가 중…"
                                                    : "프로젝트에 추가"}
                                        </button>
                                    </article>
                                );
                            })}
                        </div>
                    )}

                    {!loading && !error && totalPages > 1 && (
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
