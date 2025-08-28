// src/atoms/IconButton/IconButton.tsx
// import styles from './IconButton.module.css';

// export type IconButtonProps = {
//     iconSrc: string;                // 아이콘 이미지 경로 (src)
//     alt?: string;                   // 접근성을 위한 이미지 설명
//     onClick: () => void;            // 클릭 시 동작
//     size?: number;                  // 아이콘 크기 (기본값 24)
// };

// export function IconButton({
//     iconSrc: icon,
//     alt = '',
//     onClick,
//     size = 24,
// }: IconButtonProps) {
//     return (
//         <button
//             onClick={onClick}
//             className={styles.button}
//             aria-label={alt}        // 접근성 위한 레이블
//         >
//             <img src={icon} alt={alt} width={size} height={size} />
//         </button>
//     );
// }

// src/atoms/IconButton/IconButton.tsx
import styles from './IconButton.module.css';

// IconButtonProps는 아이콘 버튼이 받을 수 있는 모든 속성을 정의합니다.
export type IconButtonProps = {
    iconSrc: string;              // 아이콘 이미지의 경로 또는 URL
    alt: string;                  // 접근성 및 이미지 대체 텍스트
    onClick?: () => void;         // 클릭 시 실행할 함수 (선택)
    size?: number;                // 아이콘 크기 (기본값 24)
    disabled?: boolean;           // 버튼 비활성화 여부
    tooltip?: string;             // 버튼 위에 마우스를 올렸을 때 보여줄 텍스트 (title 속성)
    variant?: 'default' | 'danger' | 'success' | 'ghost'; 
    // 버튼 스타일을 구분하기 위한 값. 상황에 따라 다른 색/느낌 적용 가능
};

export function IconButton ({
    iconSrc,
    alt,
    onClick,
    size = 24,
    disabled = false,
    tooltip,
    variant = 'default'
} : IconButtonProps ) {
    return (
        <button
            // 버튼에 여러 스타일 클래스 적용: 기본 스타일 + variant 스타일 + 비활성화 시 추가 스타일
            className={`${styles.iconButton} ${styles[variant]} ${disabled ? styles.disabled : ''}`}
            onClick={onClick}
            disabled={disabled}  // 실제로 HTML 버튼의 비활성화 속성도 적용
            title={tooltip}      // 마우스 오버 시 툴팁 텍스트로 사용됨
        >
            {/* 아이콘 이미지 표시. 크기는 props로 조절 가능 */}
            <img src={iconSrc} alt={alt} width={size} height={size} />
        </button>
    );
};
