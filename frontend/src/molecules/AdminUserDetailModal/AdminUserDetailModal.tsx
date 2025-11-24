import { useEffect, useState } from "react";
import styles from "./AdminUserDetailModal.module.css";
import type { AdminUserRecord, AdminUserRole, AdminUserUpdateRequest } from "../../custom_api/adminUsers";
import { TextInput } from "../../atoms/TextInput/TextInput";
import { TextButton } from "../../atoms/TextButton/TextButton";

type AdminUserDetailModalProps = {
    open: boolean;
    user: AdminUserRecord | null;
    loading?: boolean;
    error?: string | null;
    saving?: boolean;
    deleting?: boolean;
    onClose: () => void;
    onSave: (payload: AdminUserUpdateRequest) => Promise<void>;
    onDelete: () => Promise<void>;
    onRetry?: () => void;
};

type Draft = {
    profileImage: string;
    nickname: string;
    phone: string;
    role: AdminUserRole;
    emailNoti: boolean;
    smsNoti: boolean;
    newsLetter: boolean;
};

const toDraft = (user: AdminUserRecord | null): Draft => ({
    profileImage: user?.profileImage ?? "",
    nickname: user?.nickname ?? "",
    phone: user?.phone ?? "",
    role: user?.role ?? "USER",
    emailNoti: user?.emailNoti ?? false,
    smsNoti: user?.smsNoti ?? false,
    newsLetter: user?.newsLetter ?? false,
});

export default function AdminUserDetailModal({
    open,
    user,
    loading = false,
    error,
    saving = false,
    deleting = false,
    onClose,
    onSave,
    onDelete,
    onRetry,
}: AdminUserDetailModalProps) {
    const [draft, setDraft] = useState<Draft>(() => toDraft(user));
    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        setDraft(toDraft(user));
        setLocalError(null);
    }, [user?.id]);

    useEffect(() => {
        const onEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        if (open) document.addEventListener("keydown", onEsc);
        return () => document.removeEventListener("keydown", onEsc);
    }, [open, onClose]);

    if (!open) return null;

    const handleSave = async () => {
        if (!user) return;
        if (!draft.nickname.trim()) {
            setLocalError("닉네임은 비워둘 수 없습니다.");
            return;
        }
        setLocalError(null);

        const payload: AdminUserUpdateRequest = {
            profileImage: draft.profileImage ? draft.profileImage : null,
            nickname: draft.nickname.trim(),
            phone: draft.phone.trim(),
            role: draft.role,
            emailNoti: draft.emailNoti,
            smsNoti: draft.smsNoti,
            newsLetter: draft.newsLetter,
        };

        try {
            await onSave(payload);
        } catch (err) {
            const message = err instanceof Error ? err.message : "회원 정보 수정에 실패했습니다.";
            setLocalError(message);
        }
    };

    const handleDelete = async () => {
        if (!user) return;
        const confirmed = window.confirm(`정말 ${user.nickname || "회원"}을 삭제하시겠습니까?`);
        if (!confirmed) return;

        try {
            await onDelete();
        } catch (err) {
            const message = err instanceof Error ? err.message : "회원 삭제에 실패했습니다.";
            setLocalError(message);
        }
    };

    return (
        <div className={styles.overlay} role="presentation" onClick={onClose}>
            <div
                className={styles.container}
                role="dialog"
                aria-modal="true"
                aria-label="회원 상세 정보"
                onClick={(event) => event.stopPropagation()}
            >
                <header className={styles.header}>
                    <div>
                        <p className={styles.kicker}>User #{user?.id ?? "…"}</p>
                        <h3 className={styles.title}>{user?.nickname || "회원 상세 보기"}</h3>
                        <p className={styles.subtitle}>{user?.email}</p>
                    </div>
                    <button type="button" className={styles.closeButton} onClick={onClose} aria-label="닫기">
                        ×
                    </button>
                </header>

                {loading && <div className={styles.state}>회원 정보를 불러오는 중입니다…</div>}
                {error && !loading && (
                    <div className={`${styles.state} ${styles.stateError}`} role="alert">
                        {error}
                        {onRetry && (
                            <button type="button" className={styles.retryButton} onClick={onRetry}>
                                다시 시도
                            </button>
                        )}
                    </div>
                )}

                {!loading && !error && (
                    <div className={styles.body}>
                        <div className={styles.columns}>
                            <label className={styles.field}>
                                <span className={styles.label}>닉네임</span>
                                <TextInput
                                    value={draft.nickname}
                                    onChange={(e) => setDraft((prev) => ({ ...prev, nickname: e.target.value }))}
                                    className={styles.input}
                                />
                            </label>
                            <label className={styles.field}>
                                <span className={styles.label}>전화번호</span>
                                <TextInput
                                    value={draft.phone}
                                    onChange={(e) => setDraft((prev) => ({ ...prev, phone: e.target.value }))}
                                    placeholder="010-1234-5678"
                                    className={styles.input}
                                />
                            </label>
                            <label className={styles.field}>
                                <span className={styles.label}>역할</span>
                                <select
                                    value={draft.role}
                                    onChange={(e) =>
                                        setDraft((prev) => ({ ...prev, role: e.target.value as AdminUserRole }))
                                    }
                                    className={styles.select}
                                >
                                    <option value="USER">USER</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </label>
                            <label className={styles.field}>
                                <span className={styles.label}>프로필 이미지 URL 또는 Base64</span>
                                <TextInput
                                    value={draft.profileImage}
                                    onChange={(e) => setDraft((prev) => ({ ...prev, profileImage: e.target.value }))}
                                    placeholder="https:// / data: 형태 모두 입력 가능"
                                    className={styles.input}
                                />
                            </label>
                        </div>

                        <div className={styles.toggles}>
                            <Toggle
                                label="이메일 알림"
                                description="이메일 수신 동의"
                                checked={draft.emailNoti}
                                onChange={(checked) => setDraft((prev) => ({ ...prev, emailNoti: checked }))}
                            />
                            <Toggle
                                label="SMS 알림"
                                description="문자 수신 동의"
                                checked={draft.smsNoti}
                                onChange={(checked) => setDraft((prev) => ({ ...prev, smsNoti: checked }))}
                            />
                            <Toggle
                                label="뉴스레터"
                                description="뉴스레터 수신 동의"
                                checked={draft.newsLetter}
                                onChange={(checked) => setDraft((prev) => ({ ...prev, newsLetter: checked }))}
                            />
                        </div>

                        {localError && (
                            <div className={`${styles.state} ${styles.stateError}`} role="alert">
                                {localError}
                            </div>
                        )}
                    </div>
                )}

                <footer className={styles.footer}>
                    <TextButton
                        label="삭제"
                        variant="outlined"
                        onClick={handleDelete}
                        disabled={deleting || loading}
                        className={styles.secondaryButton}
                    />
                    <div className={styles.footerActions}>
                        <TextButton
                            label="취소"
                            variant="white"
                            onClick={onClose}
                            className={styles.secondaryButton}
                        />
                        <TextButton
                            label={saving ? "저장 중..." : "저장"}
                            variant="blue"
                            onClick={handleSave}
                            disabled={saving || loading}
                            className={styles.primaryButton}
                        />
                    </div>
                </footer>
            </div>
        </div>
    );
}

type ToggleProps = {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
};

function Toggle({ label, description, checked, onChange }: ToggleProps) {
    return (
        <label className={styles.toggle}>
            <div className={styles.toggleText}>
                <span className={styles.toggleLabel}>{label}</span>
                {description && <span className={styles.toggleDesc}>{description}</span>}
            </div>
            <span className={styles.switch}>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => onChange(event.target.checked)}
                    aria-checked={checked}
                    aria-label={label}
                />
                <span className={styles.track} aria-hidden="true" />
            </span>
        </label>
    );
}
