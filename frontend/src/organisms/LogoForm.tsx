// src/components/LogoForm.tsx
// 역할:
// - 로고 생성 폼(타이틀, 라벨, 입력창, 제출 버튼)을 한 컴포넌트에서 자체 관리
// - 상위(Logo 페이지)에서는 상태와 핸들러만 주입하면 됨
//
// 특징:
// - 타이틀/라벨/버튼 문구는 내부 기본값으로 관리(필요 시 props 로 덮어쓰기)
// - TextArea 자동 높이 + Enter 제출(onSubmit) 지원
// - 버튼 disabled 처리(로딩 중이거나 입력 공백일 때)
//
// 접근성:
// - aria-* 속성으로 상태 전달
//
// 주의:
// - 배경/여백/테두리는 LogoForm.module.css 에서만 관리 (페이지 CSS와 분리)

import styles from "./LogoForm.module.css";
import { TextArea } from "../atoms/TextArea/TextArea";
import { TextButton } from "../atoms/TextButton/TextButton";

export type LogoFormProps = {
    // 폼 데이터(상위 보관): 프롬프트 문자열
    value: string;

    // 에러 메시지(없으면 null)
    error: string | null;

    // 로딩 여부(제출 중)
    loading: boolean;

    // 이벤트 핸들러
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSubmit: () => void;

    // (선택) 문구 오버라이드 — 기본값은 컴포넌트 내부에서 관리
    title?: string;            // 기본: "Logo를 생성해보세요."
    promptLabel?: string;      // 기본: "로고 설명"
    submitLabel?: string;      // 기본: "로고 생성"
    className?: string;        // 외부에서 추가 스타일이 필요할 때
};

export default function LogoForm({
    value,
    error,
    loading,
    onChange,
    onSubmit,
    title = "Logo를 생성해보세요.",
    promptLabel = "로고 설명",
    submitLabel = "로고 생성",
    className
}: LogoFormProps) {
    // 버튼 활성 조건: 공백을 제외한 입력이 있을 때만 허용
    const canSubmit = value.trim().length > 0 && !loading;

    return (
        <section
            className={`${styles.card} ${className ?? ""}`}
            aria-label="로고 생성 폼"
            aria-busy={loading}
        >
            {/* 타이틀 */}
            <h2 className={styles.title}>{title}</h2>

            {/* 라벨 */}
            <label className={styles.label} htmlFor="logoPrompt">
                {promptLabel}
            </label>

            {/* 입력창: TextArea 내부에서만 입력 배경색 토큰 사용 */}
            <TextArea
                id="logoPrompt"
                value={value}
                onChange={onChange}
                placeholder="어떤 로고를 만들고 싶은지 설명을 적어주세요."
                onSubmit={onSubmit}           // Enter(단독) 제출
                disabled={loading}
            />

            {/* 에러 메시지: 존재할 때만 표시 */}
            {error && <p className={styles.error}>{error}</p>}

            {/* 제출 버튼: 로딩/공백 입력일 때 비활성화 */}
            <div className={styles.actions}>
                <TextButton
                    label={submitLabel}
                    onClick={onSubmit}
                    variant="blue"
                    disabled={!canSubmit}
                />
            </div>
        </section>
    );
}
