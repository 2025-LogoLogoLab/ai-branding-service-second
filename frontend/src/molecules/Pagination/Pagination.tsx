// src/molecules/Pagination/Pagination.tsx
// 산출물 관리 페이지에서 공용으로 사용하는 페이지네이션 컴포넌트
// - 0-base page index를 입력받아 사용
// - 좌/우 화살표와 단순한 페이지 버튼 배열을 렌더링

import styles from "./Pagination.module.css";

export type PaginationProps = {
    page: number;                    // 현재 페이지 (0-base)
    totalPages: number;              // 전체 페이지 수
    onChange: (nextPage: number) => void;  // 페이지 전환 콜백
    className?: string;
};

export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
    if (totalPages <= 1) {
        // 페이지가 1개 이하라면 페이지네이션을 표시할 필요가 없음
        return null;
    }

    const pages = Array.from({ length: totalPages }, (_, idx) => idx);

    return (
        <nav
            className={[styles.pagination, className].filter(Boolean).join(" ")}
            aria-label="결과 페이지 탐색"
        >
            <button
                type="button"
                className={styles.arrow}
                onClick={() => onChange(Math.max(0, page - 1))}
                disabled={page === 0}
                aria-label="이전 페이지"
            >
                ‹
            </button>

            <ul className={styles.list} role="list">
                {pages.map((idx) => (
                    <li key={idx} role="listitem">
                        <button
                            type="button"
                            className={`${styles.pageButton} ${idx === page ? styles.active : ""}`}
                            onClick={() => onChange(idx)}
                            aria-current={idx === page ? "page" : undefined}
                        >
                            {idx + 1}
                        </button>
                    </li>
                ))}
            </ul>

            <button
                type="button"
                className={styles.arrow}
                onClick={() => onChange(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                aria-label="다음 페이지"
            >
                ›
            </button>
        </nav>
    );
}

export default Pagination;
