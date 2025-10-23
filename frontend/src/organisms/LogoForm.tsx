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
import { TextInput } from "../atoms/TextInput/TextInput";

export type LogoFormProps = {
    // 폼 데이터(상위 보관): 프롬프트 문자열
    value: string;
    businessName: string;
    width: string;
    height: string;
    sizeError: string | null;
    businessNameError: string | null;
    promptError: string | null;

    // 에러 메시지(없으면 null)
    error: string | null;

    // 로딩 여부(제출 중)
    loading: boolean;

    // 이벤트 핸들러
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSubmit: () => void;
    onBusinessNameChange: (value: string) => void;
    onWidthChange: (value: string) => void;
    onHeightChange: (value: string) => void;

    // (선택) 문구 오버라이드 — 기본값은 컴포넌트 내부에서 관리
    title?: string;            // 기본: "Logo를 생성해보세요."
    promptLabel?: string;      // 기본: "로고 설명"
    submitLabel?: string;      // 기본: "로고 생성"
    className?: string;        // 외부에서 추가 스타일이 필요할 때
};

export default function LogoForm({
    value,
    businessName,
    width,
    height,
    sizeError,
    businessNameError,
    promptError,
    error,
    loading,
    onChange,
    onSubmit,
    onBusinessNameChange,
    onWidthChange,
    onHeightChange,
    title = "Logo를 생성해보세요.",
    promptLabel = "사업체 및 로고 설명",
    submitLabel = "로고 생성",
    className
}: LogoFormProps) {
    // 버튼 활성 조건: 공백을 제외한 입력이 있을 때만 허용
    const canSubmit =
        businessName.trim().length > 0 &&
        value.trim().length > 0 &&
        width.trim().length > 0 &&
        height.trim().length > 0 &&
        !loading &&
        !sizeError &&
        !businessNameError &&
        !promptError;

    const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onBusinessNameChange(e.target.value);
    };

    const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onWidthChange(e.target.value);
    };

    const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onHeightChange(e.target.value);
    };

    const businessNameHeadingId = "logoBusinessNameHeading";
    const businessNameId = "logoBusinessName";
    const businessNameHintId = `${businessNameId}-hint`;
    const businessNameErrorId = "logoBusinessNameError";
    const sizeHeadingId = "logoSizeHeading";
    const sizeDescriptionId = `${sizeHeadingId}-desc`;
    const sizeErrorId = "logoSizeError";
    const promptHeadingId = "logoPromptHeading";
    const promptDescriptionId = `${promptHeadingId}-desc`;
    const promptErrorId = "logoPromptError";
    const widthId = "logoWidth";
    const heightId = "logoHeight";

    const businessInputClass = [
        styles.fullWidthInput,
        businessNameError ? styles.errorField : ""
    ].join(" ").trim();

    const widthInputClass = [
        styles.fullWidthInput,
        sizeError ? styles.errorField : ""
    ].join(" ").trim();

    const heightInputClass = [
        styles.fullWidthInput,
        sizeError ? styles.errorField : ""
    ].join(" ").trim();

    const promptTextAreaClass = [
        styles.textArea,
        promptError ? styles.errorField : ""
    ].join(" ").trim();

    return (
        <section
            className={`${styles.card} ${className ?? ""}`}
            aria-label="로고 생성 폼"
            aria-busy={loading}
        >
            <header className={styles.header}>
                <h2 className={styles.title}>{title}</h2>
            </header>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3 id={businessNameHeadingId} className={styles.sectionTitle}>사업체 이름</h3>
                    <p id={businessNameHintId} className={styles.sectionDescription}>
                        사업체 이름을 한글로 작성해 주세요. 생성된 로고 이미지를 사용할 때에는
                        이름이 영문으로 표기되도록 조정됩니다. <span className={styles.required}>(필수 입력)</span>
                    </p>
                </div>
                <TextInput
                    id={businessNameId}
                    value={businessName}
                    onChange={handleBusinessNameChange}
                    placeholder="사업체 이름"
                    disabled={loading}
                    className={businessInputClass}
                    ariaInvalid={Boolean(businessNameError)}
                    required
                    aria-labelledby={businessNameHeadingId}
                    aria-describedby={
                        businessNameError
                            ? `${businessNameHintId} ${businessNameErrorId}`
                            : businessNameHintId
                    }
                />
                {businessNameError && (
                    <p id={businessNameErrorId} className={styles.inlineError}>{businessNameError}</p>
                )}
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3 id={sizeHeadingId} className={styles.sectionTitle}>로고 이미지 사이즈 지정</h3>
                    <p id={sizeDescriptionId} className={styles.sectionDescription}>
                        생성하실 이미지의 사이즈를 설계해주세요. 기본값은 1024×1024이며, 최소 1024 픽셀부터
                        2048 픽셀까지 설정 가능합니다.
                    </p>
                </div>
                <div className={styles.sizeGrid}>
                    <div className={styles.sizeField}>
                        <label className={styles.inputLabel} htmlFor={widthId}>
                            너비
                        </label>
                        <TextInput
                            id={widthId}
                            value={width}
                            onChange={handleWidthChange}
                            placeholder="최소 값 1024 최대 값 2048"
                            type="number"
                            min={1024}
                            max={2048}
                            step={1}
                            disabled={loading}
                            className={widthInputClass}
                            ariaInvalid={Boolean(sizeError)}
                            required
                            aria-labelledby={sizeHeadingId}
                            aria-describedby={
                                sizeError
                                    ? `${sizeDescriptionId} ${sizeErrorId}`
                                    : sizeDescriptionId
                            }
                        />
                    </div>
                    <div className={styles.sizeField}>
                        <label className={styles.inputLabel} htmlFor={heightId}>
                            높이
                        </label>
                        <TextInput
                            id={heightId}
                            value={height}
                            onChange={handleHeightChange}
                            placeholder="최소 값 1024 최대 값 2048"
                            type="number"
                            min={1024}
                            max={2048}
                            step={1}
                            disabled={loading}
                            className={heightInputClass}
                            ariaInvalid={Boolean(sizeError)}
                            required
                            aria-labelledby={sizeHeadingId}
                            aria-describedby={
                                sizeError
                                    ? `${sizeDescriptionId} ${sizeErrorId}`
                                    : sizeDescriptionId
                            }
                        />
                    </div>
                </div>
                {sizeError && (
                    <p id={sizeErrorId} className={styles.inlineError}>
                        {sizeError}
                    </p>
                )}
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3 id={promptHeadingId} className={styles.sectionTitle}>{promptLabel}</h3>
                    <p id={promptDescriptionId} className={styles.sectionDescription}>
                        사업체와 만들고 싶은 로고에 대한 자세한 설명을 적어주세요. 설명이 자세할수록
                        모델이 명확한 이미지를 생성하는 데 도움이 됩니다. <span className={styles.required}>(필수 입력)</span>
                    </p>
                </div>
                <TextArea
                    id="logoPrompt"
                    value={value}
                    onChange={onChange}
                    placeholder="어떤 로고를 만들고 싶은지 설명을 적어주세요."
                    onSubmit={onSubmit}
                    disabled={loading}
                    className={promptTextAreaClass}
                    ariaInvalid={Boolean(promptError)}
                    ariaLabelledBy={promptHeadingId}
                    ariaDescribedBy={
                        promptError
                            ? `${promptDescriptionId} ${promptErrorId}`
                            : promptDescriptionId
                    }
                    required
                />
                {promptError && (
                    <p id={promptErrorId} className={styles.inlineError}>
                        {promptError}
                    </p>
                )}
            </div>

            {error && <p className={styles.error}>{error}</p>}

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
