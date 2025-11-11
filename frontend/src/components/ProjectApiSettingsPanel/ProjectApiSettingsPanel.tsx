import styles from "../TagApiSettingsPanel/TagApiSettingsPanel.module.css";
import type { HttpMethod } from "../../custom_api/types";
import type { ProjectApiSettings } from "../../custom_api/projectSettings";

const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export type ProjectApiSettingsPanelProps = {
    settings: ProjectApiSettings;
    onChange: (section: keyof ProjectApiSettings, field: "url" | "method", value: string) => void;
};

type FieldConfig = {
    id: string;
    label: string;
    section: keyof ProjectApiSettings;
    field: "url" | "method";
    type: "text" | "select";
    placeholder?: string;
};

const FIELD_CONFIGS: FieldConfig[] = [
    { id: "project-list-url", label: "1. 프로젝트 목록 조회 url", section: "list", field: "url", type: "text", placeholder: "https://api.example.com/project" },
    { id: "project-list-method", label: "2. 프로젝트 목록 조회 메소드", section: "list", field: "method", type: "select" },
    { id: "project-detail-url", label: "3. 프로젝트 상세 조회 url", section: "detail", field: "url", type: "text", placeholder: "https://api.example.com/project/:id" },
    { id: "project-detail-method", label: "4. 프로젝트 상세 조회 메소드", section: "detail", field: "method", type: "select" },
    { id: "project-create-url", label: "5. 프로젝트 생성 요청 url", section: "create", field: "url", type: "text", placeholder: "https://api.example.com/project/generate" },
    { id: "project-create-method", label: "6. 프로젝트 생성 요청 메소드", section: "create", field: "method", type: "select" },
    { id: "project-update-url", label: "7. 프로젝트 수정 요청 url", section: "update", field: "url", type: "text", placeholder: "https://api.example.com/project/:id" },
    { id: "project-update-method", label: "8. 프로젝트 수정 요청 메소드", section: "update", field: "method", type: "select" },
    { id: "project-delete-url", label: "9. 프로젝트 삭제 요청 url", section: "delete", field: "url", type: "text", placeholder: "https://api.example.com/project/:id" },
    { id: "project-delete-method", label: "10. 프로젝트 삭제 요청 메소드", section: "delete", field: "method", type: "select" },
];

export function ProjectApiSettingsPanel({ settings, onChange }: ProjectApiSettingsPanelProps) {
    return (
        <section className={styles.panel} aria-label="프로젝트 API 임시 설정">
            <h2 className={styles.title}>프로젝트 API 설정 (백엔드 테스트용)</h2>
            <p className={styles.desc}>엔드포인트와 메소드를 입력하면 해당 정보로 요청을 시도하고, 미입력 시에는 더미 데이터를 사용합니다.</p>
            <div className={styles.grid}>
                {FIELD_CONFIGS.map(({ id, label, section, field, type, placeholder }) => (
                    <label className={styles.field} htmlFor={id} key={id}>
                        <span className={styles.label}>{label}</span>
                        {type === "text" ? (
                            <input
                                id={id}
                                type="text"
                                value={settings[section][field] ?? ""}
                                placeholder={placeholder}
                                onChange={(event) => onChange(section, field, event.target.value)}
                            />
                        ) : (
                            <select
                                id={id}
                                value={settings[section][field] ?? (field === "method" ? settings[section].method ?? HTTP_METHODS[0] : "")}
                                onChange={(event) => onChange(section, field, event.target.value)}
                            >
                                {HTTP_METHODS.map((method) => (
                                    <option key={method} value={method}>
                                        {method}
                                    </option>
                                ))}
                            </select>
                        )}
                    </label>
                ))}
            </div>
        </section>
    );
}
