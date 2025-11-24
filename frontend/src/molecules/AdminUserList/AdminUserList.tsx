import styles from "./AdminUserList.module.css";
import { Pagination } from "../Pagination/Pagination";
import type { AdminUserRecord } from "../../custom_api/adminUsers";
import { TextButton } from "../../atoms/TextButton/TextButton";

// 회원 목록 테이블.
// 행 전체 클릭 시 상세 열기, 행 내부 버튼은 이벤트 전파를 막아 독립 동작.
type AdminUserListProps = {
    users: AdminUserRecord[];
    loading?: boolean;
    error?: string | null;
    page: number;
    totalPages: number;
    totalElements: number;
    onSelect: (userId: number) => void;
    onPageChange: (page: number) => void;
};

const renderRoleBadge = (role: AdminUserRecord["role"]) => {
    const tone = role === "ADMIN" ? styles.badgeAdmin : styles.badgeUser;
    return <span className={`${styles.badge} ${tone}`}>{role}</span>;
};

export default function AdminUserList({
    users,
    loading = false,
    error,
    page,
    totalPages,
    totalElements,
    onSelect,
    onPageChange,
}: AdminUserListProps) {
    return (
        <section className={styles.card} aria-label="회원 목록">
            <header className={styles.header}>
                <div>
                    <p className={styles.kicker}>Directory</p>
                    <h2 className={styles.title}>전체 회원 목록</h2>
                    <p className={styles.subtitle}>회원 행을 클릭하거나 상세 보기 버튼을 눌러 정보를 확인하세요.</p>
                </div>
                <div className={styles.counts}>
                    <span className={styles.countValue}>{totalElements}</span>
                    <span className={styles.countLabel}>총 회원수</span>
                </div>
            </header>

            {loading && <div className={styles.state}>목록을 불러오는 중입니다…</div>}
            {error && !loading && (
                <div className={`${styles.state} ${styles.stateError}`} role="alert">
                    {error}
                </div>
            )}

            {!loading && !error && users.length === 0 && (
                <div className={styles.state}>등록된 회원이 없습니다.</div>
            )}

            {!loading && !error && users.length > 0 && (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th scope="col">ID</th>
                                <th scope="col">닉네임</th>
                                <th scope="col">이메일</th>
                                <th scope="col">역할</th>
                                <th scope="col">연락처</th>
                                <th scope="col">알림</th>
                                <th scope="col">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} onClick={() => onSelect(user.id)}>
                                    <td className={styles.idCell}>{user.id}</td>
                                    <td className={styles.mainCell}>
                                        <span className={styles.nickname}>{user.nickname || "—"}</span>
                                        {user.provider && <span className={styles.meta}>{user.provider}</span>}
                                    </td>
                                    <td>{user.email}</td>
                                    <td>{renderRoleBadge(user.role)}</td>
                                    <td className={styles.metaCell}>{user.phone || "—"}</td>
                                    <td className={styles.metaCell}>
                                        <span className={styles.meta}>
                                            이메일 {user.emailNoti ? "ON" : "OFF"} / SMS {user.smsNoti ? "ON" : "OFF"}
                                        </span>
                                    </td>
                                    <td>
                                        <TextButton
                                            label="상세 보기"
                                            variant="outlined"
                                            onClick={(event) => {
                                                event?.stopPropagation();
                                                onSelect(user.id);
                                            }}
                                            className={styles.rowButton}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className={styles.footer}>
                <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
            </div>
        </section>
    );
}
