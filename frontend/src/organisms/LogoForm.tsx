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

export type TextNotationOption = "romanized" | "translated";

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
    onTextNotationChange: (value: TextNotationOption) => void;

    // (선택) 문구 오버라이드 — 기본값은 컴포넌트 내부에서 관리
    title?: string;            // 기본: "Logo를 생성해보세요."
    promptLabel?: string;      // 기본: "로고 설명"
    submitLabel?: string;      // 기본: "로고 생성"
    className?: string;        // 외부에서 추가 스타일이 필요할 때

    showTextFields?: boolean;  // 기본: true — 텍스트 입력이 필요한 타입만 true 유지
    textNotation?: TextNotationOption;
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
    onTextNotationChange,
    title = "Logo를 생성해보세요.",
    promptLabel = "로고 설명",
    submitLabel = "로고 생성",
    className,
    showTextFields = true,
    textNotation = "romanized"
}: LogoFormProps) {
    // 버튼 활성 조건: 공백을 제외한 입력이 있을 때만 허용
    const hasBusinessName = businessName.trim().length > 0;
    const hasPrompt = value.trim().length > 0;
    const canSubmit =
        (!showTextFields || hasBusinessName) &&
        hasPrompt &&
        width.trim().length > 0 &&
        height.trim().length > 0 &&
        !loading &&
        !sizeError &&
        (!showTextFields || !businessNameError) &&
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

    const handleNotationSelect = (nextValue: TextNotationOption) => {
        if (loading || nextValue === textNotation) return;
        onTextNotationChange(nextValue);
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

    const promptDescriptionText = showTextFields
        ? "만들고 싶은 로고의 분위기와 원하는 요소를 구체적으로 적어주세요. 선택한 텍스트 표기법과 함께 작성하면 모델이 더 정확한 이미지를 생성하는 데 도움이 됩니다."
        : "만들고 싶은 로고의 분위기와 원하는 요소를 구체적으로 적어주세요. 텍스트 대신 표현하고 싶은 아이콘이나 심볼을 자세히 설명할수록 모델이 더 정확한 이미지를 생성하는 데 도움이 됩니다.";

    return (
        <section
            className={`${styles.card} ${className ?? ""}`}
            aria-label="로고 생성 폼"
            aria-busy={loading}
        >
            <header className={styles.header}>
                <h2 className={styles.title}>{title}</h2>
            </header>

            {showTextFields && (
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h3 id={businessNameHeadingId} className={styles.sectionTitle}>
                            로고에 들어갈 텍스트
                        </h3>
                        <p id={businessNameHintId} className={styles.sectionDescription}>
                            로고에 그대로 들어가길 원하는 문구를 입력해 주세요. 작성한 텍스트가 디자인에 반영됩니다.
                            <span className={styles.required}>(필수 입력)</span>
                        </p>
                    </div>
                    <TextInput
                        id={businessNameId}
                        value={businessName}
                        onChange={handleBusinessNameChange}
                        placeholder="로고에 들어갈 텍스트를 입력해 주세요."
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
                        <p id={businessNameErrorId} className={styles.inlineError}>
                            {businessNameError}
                        </p>
                    )}

                    <div className={styles.toggleContainer} role="radiogroup" aria-labelledby="logoTextNotationLabel">
                        <div className={styles.toggleHeader}>
                            <span id="logoTextNotationLabel" className={styles.toggleLabel}>
                                텍스트 표기법
                            </span>
                            <p className={styles.toggleDescription}>
                                문구를 로마자 표기로 둘지, 번역한 텍스트로 표현할지 선택해 주세요.
                            </p>
                        </div>
                        <div className={styles.toggleGroup}>
                            <button
                                type="button"
                                role="radio"
                                aria-checked={textNotation === "romanized"}
                                className={`${styles.toggleButton} ${
                                    textNotation === "romanized" ? styles.toggleButtonActive : ""
                                }`}
                                onClick={() => handleNotationSelect("romanized")}
                                disabled={loading}
                            >
                                로마자 표기
                            </button>
                            <button
                                type="button"
                                role="radio"
                                aria-checked={textNotation === "translated"}
                                className={`${styles.toggleButton} ${
                                    textNotation === "translated" ? styles.toggleButtonActive : ""
                                }`}
                                onClick={() => handleNotationSelect("translated")}
                                disabled={loading}
                            >
                                번역
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                        {promptDescriptionText} <span className={styles.required}>(필수 입력)</span>
                    </p>
                </div>
                <TextArea
                    id="logoPrompt"
                    value={value}
                    onChange={onChange}
                    placeholder="어떤 로고를 만들고 싶은지 구체적으로 설명해 주세요."
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
