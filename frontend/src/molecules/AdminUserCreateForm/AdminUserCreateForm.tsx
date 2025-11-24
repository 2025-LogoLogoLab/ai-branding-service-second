import { useMemo, useState } from "react";
import styles from "./AdminUserCreateForm.module.css";
import { TextInput } from "../../atoms/TextInput/TextInput";
import { TextButton } from "../../atoms/TextButton/TextButton";
import type { AdminUserCreateRequest, AdminUserRole } from "../../custom_api/adminUsers";

type AdminUserCreateFormProps = {
    onSubmit: (payload: AdminUserCreateRequest) => Promise<void>;
    loading?: boolean;
    error?: string | null;
};

const initialForm: AdminUserCreateRequest = {
    email: "",
    password: "",
    nickname: "",
    role: "USER",
};

export default function AdminUserCreateForm({ onSubmit, loading = false, error }: AdminUserCreateFormProps) {
    const [form, setForm] = useState<AdminUserCreateRequest>(initialForm);
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!form.email.trim() || !form.password.trim() || !form.nickname.trim()) {
            setLocalError("이메일, 비밀번호, 닉네임은 필수입니다.");
            return;
        }

        setLocalError(null);

        try {
            await onSubmit(form);
            setForm(initialForm);
        } catch (err) {
            const message = err instanceof Error ? err.message : "회원 생성에 실패했습니다.";
            setLocalError(message);
        }
    };

    const roleOptions = useMemo(
        () =>
            [
                { value: "USER", label: "USER" },
                { value: "ADMIN", label: "ADMIN" },
            ] as Array<{ value: AdminUserRole; label: string }>,
        [],
    );

    return (
        <section className={styles.card} aria-label="새로운 회원 생성">
            <header className={styles.header}>
                <div>
                    <p className={styles.kicker}>Admin Tools</p>
                    <h2 className={styles.title}>새 회원 생성</h2>
                    <p className={styles.subtitle}>관리 권한을 가진 운영자가 신규 계정을 직접 발급할 수 있습니다.</p>
                </div>
                <TextButton
                    label={loading ? "생성 중..." : "생성하기"}
                    variant="blue"
                    onClick={handleSubmit}
                    disabled={loading}
                    className={styles.submitButton}
                />
            </header>

            <div className={styles.grid}>
                <label className={styles.field}>
                    <span className={styles.label}>이메일</span>
                    <TextInput
                        value={form.email}
                        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="example@domain.com"
                        type="email"
                        required
                        className={styles.input}
                    />
                </label>

                <label className={styles.field}>
                    <span className={styles.label}>비밀번호</span>
                    <TextInput
                        value={form.password}
                        onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                        placeholder="비밀번호를 입력하세요"
                        type="password"
                        required
                        className={styles.input}
                    />
                </label>

                <label className={styles.field}>
                    <span className={styles.label}>닉네임</span>
                    <TextInput
                        value={form.nickname}
                        onChange={(e) => setForm((prev) => ({ ...prev, nickname: e.target.value }))}
                        placeholder="표시될 닉네임"
                        required
                        className={styles.input}
                    />
                </label>

                <label className={styles.field}>
                    <span className={styles.label}>역할</span>
                    <select
                        value={form.role}
                        onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as AdminUserRole }))}
                        className={styles.select}
                        aria-label="역할 선택"
                    >
                        {roleOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {(localError || error) && (
                <p role="alert" className={styles.error}>
                    {localError || error}
                </p>
            )}
        </section>
    );
}
