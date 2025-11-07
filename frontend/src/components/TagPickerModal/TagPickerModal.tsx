import { useEffect, useMemo, useState } from "react";
import styles from "./TagPickerModal.module.css";
import type { TagApiSettings, TagRecord } from "../../custom_api/tags";
import { fetchTagList, createTag } from "../../custom_api/tags";

export type TagPickerModalProps = {
    open: boolean;
    onClose: () => void;
    settings: TagApiSettings;
    onAttach: (tag: TagRecord) => Promise<void> | void;
    existingTags: TagRecord[];
};

export function TagPickerModal({ open, onClose, settings, onAttach, existingTags }: TagPickerModalProps) {
    const [tagList, setTagList] = useState<TagRecord[]>([]);
    const [searchValue, setSearchValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (!open) {
            setSearchValue("");
            setTagList([]);
            setError(null);
            return;
        }
        setLoading(true);
        fetchTagList(settings.list)
            .then((list) => setTagList(list))
            .catch((err) => {
                console.error(err);
                setError("태그 목록을 불러오지 못했습니다.");
            })
            .finally(() => setLoading(false));
    }, [open, settings.list]);

    const filteredTags = useMemo(() => {
        const query = searchValue.trim().toLowerCase();
        if (!query) return tagList;
        return tagList.filter((tag) => tag.name.toLowerCase().includes(query));
    }, [searchValue, tagList]);

    const handleAttach = async (tag: TagRecord) => {
        try {
            await onAttach(tag);
            onClose();
        } catch (err) {
            console.error(err);
            alert("태그 추가 중 오류가 발생했습니다.");
        }
    };

    const handleCreate = async () => {
        const name = searchValue.trim();
        if (!name) return;
        setCreating(true);
        try {
            const newTag = await createTag(settings.create, { id: -1, name });
            await handleAttach(newTag);
        } catch (err) {
            console.error(err);
            alert("새 태그 생성에 실패했습니다.");
        } finally {
            setCreating(false);
        }
    };

    if (!open) return null;

    const noResults = filteredTags.length === 0;

    return (
        <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-label="태그 선택"
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    event.stopPropagation();
                    onClose();
                } else {
                    event.stopPropagation();
                }
            }}
        >
            <div
                className={styles.modal}
                onClick={(event) => event.stopPropagation()}
            >
                <header className={styles.header}>
                    <h3>태그 선택</h3>
                    <button type="button" onClick={onClose} aria-label="닫기">×</button>
                </header>
                <div className={styles.body}>
                    <input
                        className={styles.searchInput}
                        type="text"
                        placeholder="태그를 검색하세요"
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                    />
                    {loading && <div className={styles.status}>태그 목록을 불러오는 중…</div>}
                    {error && <div className={styles.error}>{error}</div>}
                    {!loading && !error && (
                        <ul className={styles.tagList} role="list">
                            {filteredTags.map((tag) => (
                                <li key={tag.id}>
                                    <button
                                        type="button"
                                        className={styles.tagOption}
                                        onClick={() => handleAttach(tag)}
                                        disabled={existingTags.some((item) => item.id === tag.id)}
                                    >
                                        #{tag.name}
                                        {existingTags.some((item) => item.id === tag.id) && <span>이미 추가됨</span>}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                    {noResults && !loading && !error && (
                        <div className={styles.emptyState}>
                            <p>검색 결과가 없습니다.</p>
                            <button type="button" className={styles.createButton} onClick={handleCreate} disabled={creating}>
                                + "{searchValue.trim() || "새 태그"}" 추가하기
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
