import styles from "./TagApiSettingsPanel.module.css";
import type { TagApiSettings } from "../../custom_api/tags";
import type { HttpMethod } from "../../custom_api/types";

const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export type TagApiSettingsPanelProps = {
    settings: TagApiSettings;
    onChange: (section: keyof TagApiSettings, field: "url" | "method", value: string) => void;
};

type FieldConfig = {
    id: string;
    label: string;
    section: keyof TagApiSettings;
    field: "url" | "method";
    placeholder?: string;
    type: "text" | "select";
};

const FIELD_CONFIGS: FieldConfig[] = [
    { id: "tag-list-url", label: "1. 태그 리스트 조회 url", section: "list", field: "url", placeholder: "https://api.example.com/tags", type: "text" },
    { id: "tag-list-method", label: "2. 태그 리스트 조회 메소드", section: "list", field: "method", type: "select" },
    { id: "tag-add-url", label: "3. 산출물에 태그 추가 요청 url", section: "add", field: "url", placeholder: "https://api.example.com/tags/attach", type: "text" },
    { id: "tag-add-method", label: "4. 산출물에 태그 추가 요청 메소드", section: "add", field: "method", type: "select" },
    { id: "tag-create-url", label: "5. 새로운 태그 생성 요청 url", section: "create", field: "url", placeholder: "https://api.example.com/tags", type: "text" },
    { id: "tag-create-method", label: "6. 새로운 태그 생성 요청 메소드", section: "create", field: "method", type: "select" },
    { id: "tag-delete-url", label: "7. 태그 삭제 요청 url", section: "delete", field: "url", placeholder: "https://api.example.com/tags/:id", type: "text" },
    { id: "tag-delete-method", label: "8. 태그 삭제 요청 메소드", section: "delete", field: "method", type: "select" },
];

export function TagApiSettingsPanel({ settings, onChange }: TagApiSettingsPanelProps) {
    return (
        <section className={styles.panel} aria-label="태그 API 임시 설정">
            <h2 className={styles.title}>태그 API 설정 (백엔드 테스트용)</h2>
            <p className={styles.desc}>엔드포인트와 메소드를 입력하면 해당 값으로 요청을 보내며, 비워두면 더미 데이터를 사용합니다.</p>
            <div className={styles.grid}>
                {FIELD_CONFIGS.map(({ id, label, section, field, placeholder, type }) => (
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
                                value={settings[section][field] ?? (section === "list" ? "GET" : section === "delete" ? "DELETE" : "POST")}
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
