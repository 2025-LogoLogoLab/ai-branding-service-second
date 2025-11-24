import { useCallback, useEffect, useState } from "react";
import styles from "./Admin.module.css";
import AdminUserCreateForm from "../molecules/AdminUserCreateForm/AdminUserCreateForm";
import AdminUserList from "../molecules/AdminUserList/AdminUserList";
import AdminUserDetailModal from "../molecules/AdminUserDetailModal/AdminUserDetailModal";
import {
    createAdminUser,
    deleteAdminUser,
    fetchAdminUsers,
    getAdminUser,
    updateAdminUser,
    type AdminUserCreateRequest,
    type AdminUserRecord,
    type AdminUserUpdateRequest,
} from "../custom_api/adminUsers";

// 관리자용 회원 관리 대시보드 페이지.
// - 좌측: 신규 회원 생성 카드
// - 우측: 페이징되는 회원 리스트 + 행 클릭/버튼으로 상세 모달
// - 모달에서 수정/삭제 후 리스트 즉시 재조회
function Admin() {
    const [users, setUsers] = useState<AdminUserRecord[]>([]);
    const [page, setPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [listLoading, setListLoading] = useState(false);
    const [listError, setListError] = useState<string | null>(null);

    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    const loadUsers = useCallback(
        async (pageIndex: number) => {
            setListLoading(true);
            setListError(null);
            try {
                const res = await fetchAdminUsers({ page: pageIndex, size: pageSize });
                const safeTotalPages = Math.max(1, res.totalPages || 0);
                setUsers(res.content ?? []);
                setTotalElements(res.totalElements ?? res.content?.length ?? 0);
                setTotalPages(safeTotalPages);
            } catch (err) {
                const message = err instanceof Error ? err.message : "회원 목록을 불러오지 못했습니다.";
                setListError(message);
            } finally {
                setListLoading(false);
            }
        },
        [pageSize],
    );

    useEffect(() => {
        loadUsers(page);
    }, [page, loadUsers]);

    const handleCreateUser = async (payload: AdminUserCreateRequest) => {
        setCreateLoading(true);
        setCreateError(null);
        try {
            await createAdminUser(payload);
            setPage(0);
            await loadUsers(0);
        } catch (err) {
            const message = err instanceof Error ? err.message : "신규 회원 생성에 실패했습니다.";
            setCreateError(message);
            throw err;
        } finally {
            setCreateLoading(false);
        }
    };

    const handleOpenDetail = async (userId: number) => {
        setDetailOpen(true);
        setSelectedId(userId);
        setSelectedUser(null);
        setDetailLoading(true);
        setDetailError(null);
        try {
            const data = await getAdminUser(userId);
            setSelectedUser(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : "회원 정보를 불러올 수 없습니다.";
            setDetailError(message);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleSaveDetail = async (payload: AdminUserUpdateRequest) => {
        if (selectedId == null) return;
        setSaving(true);
        setDetailError(null);
        try {
            const updated = await updateAdminUser(selectedId, payload);
            setSelectedUser(updated);
            await loadUsers(page);
        } catch (err) {
            const message = err instanceof Error ? err.message : "회원 정보 수정에 실패했습니다.";
            setDetailError(message);
            throw err;
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteUser = async () => {
        if (selectedId == null) return;
        setDeleting(true);
        setDetailError(null);
        try {
            await deleteAdminUser(selectedId);
            const nextPage = page > 0 && users.length <= 1 ? page - 1 : page;
            setDetailOpen(false);
            setSelectedUser(null);
            setSelectedId(null);
            setPage(nextPage);
            await loadUsers(nextPage);
        } catch (err) {
            const message = err instanceof Error ? err.message : "회원 삭제에 실패했습니다.";
            setDetailError(message);
            throw err;
        } finally {
            setDeleting(false);
        }
    };

    const handleCloseModal = () => {
        setDetailOpen(false);
        setDetailError(null);
    };

    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <h1 className={styles.title}>관리자 회원 관리</h1>
                <p className={styles.description}>
                    신규 회원 생성, 목록 조회, 상세 정보 수정과 삭제를 한 화면에서 처리합니다. 변경 사항은 즉시 서버에 반영되며,
                    페이지네이션으로 대량 데이터를 빠르게 탐색할 수 있습니다.
                </p>
            </section>

            <div className={styles.sections}>
                <div className={styles.stack}>
                    <AdminUserCreateForm onSubmit={handleCreateUser} loading={createLoading} error={createError} />
                </div>
                <AdminUserList
                    users={users}
                    loading={listLoading}
                    error={listError}
                    page={page}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    onPageChange={setPage}
                    onSelect={handleOpenDetail}
                />
            </div>

            <AdminUserDetailModal
                open={detailOpen}
                user={selectedUser}
                loading={detailLoading}
                error={detailError}
                saving={saving}
                deleting={deleting}
                onClose={handleCloseModal}
                onSave={handleSaveDetail}
                onDelete={handleDeleteUser}
                onRetry={selectedId ? () => handleOpenDetail(selectedId) : undefined}
            />
        </div>
    );
}

export default Admin;
