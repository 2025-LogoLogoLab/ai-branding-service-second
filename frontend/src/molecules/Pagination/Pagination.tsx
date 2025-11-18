// src/molecules/Pagination/Pagination.tsx
// 내 산출물 페이지에서 공용으로 사용하는 페이지네이션 컴포넌트
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
    // totalPages 가 0이거나 음수가 들어와도 1페이지짜리 네비게이션으로 강제 표시
    const pageCount = Math.max(1, totalPages);
    const clampedPage = Math.min(Math.max(page, 0), pageCount - 1);

    // 0-base 페이지 인덱스를 그대로 버튼 라벨에 활용하기 위해 [0..pageCount-1] 배열 생성
    const pages = Array.from({ length: pageCount }, (_, idx) => idx);

    return (
        <nav
            className={[styles.pagination, className].filter(Boolean).join(" ")}
            aria-label="결과 페이지 탐색"
        >
            {/* 왼쪽 화살표: 첫 페이지에서는 비활성화 */}
            <button
                type="button"
                className={styles.arrow}
                onClick={() => onChange(Math.max(0, clampedPage - 1))}
                disabled={clampedPage === 0}
                aria-label="이전 페이지"
            >
                ‹
            </button>

            <ul className={styles.list} role="list">
                {pages.map((idx) => (
                    <li key={idx} role="listitem">
                        {/* 페이지 번호 버튼: 현재 페이지는 스타일 강조 + aria-current */}
                        <button
                            type="button"
                            className={`${styles.pageButton} ${idx === clampedPage ? styles.active : ""}`}
                            onClick={() => onChange(idx)}
                            aria-current={idx === clampedPage ? "page" : undefined}
                        >
                            {idx + 1}
                        </button>
                    </li>
                ))}
            </ul>

            {/* 오른쪽 화살표: 마지막 페이지에서는 비활성화 */}
            <button
                type="button"
                className={styles.arrow}
                onClick={() => onChange(Math.min(pageCount - 1, clampedPage + 1))}
                disabled={clampedPage >= pageCount - 1}
                aria-label="다음 페이지"
            >
                ›
            </button>
        </nav>
    );
}

export default Pagination;
