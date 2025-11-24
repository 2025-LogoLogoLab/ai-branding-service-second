// 역할(페이지 컨테이너):
// src/pages/Logo.tsx
// - 좌: 로고 타입 사이드바 / 중: 로고 스타일 사이드바 / 우: 로고 생성 폼 + 결과
// - 타입/스타일 "전체보기"는 서로 배타적으로 동작
// - 전체보기 중에는 폼 자체를 숨겨 겹침/가림 문제를 원천 차단
//
// 코드 스타일:
// - 들여쓰기 4칸
// - 상세 주석
//
// 의존성:
// - LogoForm: 내부에서 타이틀/라벨/버튼 문구를 자체 관리
// - TextArea/TextButton: 각각 전용 모듈 CSS 사용
// - 페이지 레이아웃은 Grid (max-content, max-content, 1fr)로 구성

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import s from "./LogoPage.module.css";

import { LogoTypeSidebar } from "../organisms/LogoTypeSidebar/LogoTypeSidebar";
import { LogoStyleSidebar } from "../organisms/LogoStyleSidebar/LogoStyleSidebar";
import type { LogoType } from "../types/logoTypes";
import { LOGO_TYPES } from "../types/logoTypes";
import type { LogoStyleKey } from "../types/logoStyles";
import { LOGO_STYLES } from "../types/logoStyles";

import LogoForm from "../organisms/LogoForm";
import type { TextNotationOption } from "../organisms/LogoForm";
import { LogoCard } from "../organisms/LogoCard/LogoCard";
import { TextButton } from "../atoms/TextButton/TextButton";

import { generateLogo, saveLogo } from "../custom_api/logo";
import { useSelectionStore } from "../context/selectionStore";
import { ensureDataUrl } from "../utils/image";
import { LogoExampleBox } from "../atoms/LogoExampleBox/LogoExampleBox";
import { LogoStyleExampleBox } from "../atoms/LogoStyleExampleBox/LogoStyleExampleBox";

const NUM_IMAGES_DEFAULT = 2; // 생성 이미지 개수(정책상 현재 2장 고정)

export default function Logo() {
    // -----------------------------
    // 선택 상태
    // -----------------------------
    const [type, setType] = useState<LogoType>("TEXT");
    const [style, setStyle] = useState<LogoStyleKey>("cute");

    // -----------------------------
    // 전체보기(상호 배타)
    // -----------------------------
    const [showAllType, setShowAllType] = useState(false);
    const [showAllStyle, setShowAllStyle] = useState(false);

    // -----------------------------
    // 폼 상태
    // -----------------------------
    const [businessName, setBusinessName] = useState("");
    const [promptText, setPrompt] = useState("");
    const [negativ_prompt, setNegativePrompt] = useState("no watermark");
    const [imageWidth, setImageWidth] = useState("1024");
    const [imageHeight, setImageHeight] = useState("1024");
    const [sizeError, setSizeError] = useState<string | null>(null);
    const [businessNameError, setBusinessNameError] = useState<string | null>(null);
    const [promptError, setPromptError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [downloadingLogoId, setDownloadingLogoId] = useState<number | null>(null);
    const [copyingLogoId, setCopyingLogoId] = useState<number | null>(null);
    const [textNotation, setTextNotation] = useState<TextNotationOption>("romanized");

    // -----------------------------
    // 결과 상태
    // -----------------------------
    const [logoResult, setLogoResult] = useState<string[] | null>(null);
    const [selectPurpose, setSelectPurpose] = useState<null | "branding" | "colorGuide">(null);
    const navigate = useNavigate();
    const { setLogo } = useSelectionStore();

    // 최초 기본값
    useEffect(() => {
        setNegativePrompt("no watermark");
        setStyle("cute");
        setType("TEXT");
    }, []);

    // 전체보기 토글(서로 배타)
    const toggleAll = (which: "type" | "style") => {
        if (which === "type") {
            setShowAllType((prev) => {
                const next = !prev;
                if (next) setShowAllStyle(false);
                return next;
            });
        } else {
            setShowAllStyle((prev) => {
                const next = !prev;
                if (next) setShowAllType(false);
                return next;
            });
        }
    };

    // 타입/스타일 중 하나라도 전체보기가 켜져 있으면 폼 숨김
    const isAnyAllOpen = showAllType || showAllStyle;
    const containerClass = [
        s.container,
        !isAnyAllOpen && showAllStyle ? s.styleExpanded : "",
        isAnyAllOpen ? s.allMode : ""
    ].join(" ").trim();

    const LOGO_DOWNLOAD_ERROR = "로고 다운로드에 실패했습니다.";
    const LOGO_COPY_ERROR = "클립보드 복사에 실패했습니다. 브라우저 설정을 확인해주세요.";

    const clearErrorMessage = (message: string) => {
        setError((prev) => (prev === message ? null : prev));
    };

    // -----------------------------
    // 로고 생성
    // -----------------------------
    const validateSize = (widthValue: string, heightValue: string): string | null => {
        if (!widthValue.trim() || !heightValue.trim()) {
            return "로고 이미지의 너비와 높이를 입력해주세요.";
        }

        const widthNumber = Number(widthValue);
        const heightNumber = Number(heightValue);

        if (Number.isNaN(widthNumber) || Number.isNaN(heightNumber)) {
            return "로고 이미지의 크기는 숫자로 입력해주세요.";
        }

        if (!Number.isInteger(widthNumber) || !Number.isInteger(heightNumber)) {
            return "로고 이미지는 정수 픽셀 값만 사용할 수 있습니다.";
        }

        if (
            widthNumber < 1024 ||
            widthNumber > 2048 ||
            heightNumber < 1024 ||
            heightNumber > 2048
        ) {
            return "로고 이미지는 1024~2048 픽셀 범위만 입력할 수 있습니다.";
        }

        return null;
    };

    const shouldShowTextInputs = type === "TEXT" || type === "COMBO";
    const notationLabelMap: Record<TextNotationOption, string> = {
        romanized: "로마자 표기",
        translated: "번역"
    };

    useEffect(() => {
        if (!shouldShowTextInputs) {
            setBusinessNameError(null);
        }
    }, [shouldShowTextInputs]);

    const handleBusinessNameChange = (nextValue: string) => {
        setBusinessName(nextValue);
        if (businessNameError && nextValue.trim()) {
            setBusinessNameError(null);
        }
    };

    const handlePromptFieldChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const nextValue = e.target.value;
        setPrompt(nextValue);
        if (promptError && nextValue.trim()) {
            setPromptError(null);
        }
    };

    const handleTextNotationChange = (value: TextNotationOption) => {
        setTextNotation(value);
    };

    const handleWidthChange = (nextValue: string) => {
        setImageWidth(nextValue);
        const message = validateSize(nextValue, imageHeight);
        setSizeError(message);
    };

    const handleHeightChange = (nextValue: string) => {
        setImageHeight(nextValue);
        const message = validateSize(imageWidth, nextValue);
        setSizeError(message);
    };

    const handleLogoDownload = async (id: number) => {
        if (!logoResult) return;
        const imageData = logoResult[id];
        if (!imageData) return;

        setDownloadingLogoId(id);
        try {
            const dataUrl = ensureDataUrl(imageData);
            const anchor = document.createElement("a");
            anchor.href = dataUrl;
            anchor.download = `generated-logo-${Date.now()}-${id}.png`;
            anchor.rel = "noopener";
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            clearErrorMessage(LOGO_DOWNLOAD_ERROR);
        } catch (downloadError) {
            console.error(downloadError);
            setError(LOGO_DOWNLOAD_ERROR);
        } finally {
            setDownloadingLogoId(null);
        }
    };

    const handleLogoCopy = async (id: number) => {
        if (!logoResult) return;
        const imageData = logoResult[id];
        if (!imageData) return;

        if (typeof navigator === "undefined" || !navigator.clipboard) {
            setError(LOGO_COPY_ERROR);
            return;
        }

        const dataUrl = ensureDataUrl(imageData);
        const clipboard = navigator.clipboard;
        const clipboardItemCtor = (window as typeof window & { ClipboardItem?: typeof ClipboardItem }).ClipboardItem;

        setCopyingLogoId(id);
        try {
            if (clipboard && typeof clipboard.write === "function" && clipboardItemCtor) {
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                const item = new clipboardItemCtor({ [blob.type]: blob });
                await clipboard.write([item]);
            } else if (clipboard && typeof clipboard.writeText === "function") {
                await clipboard.writeText(dataUrl);
            } else {
                throw new Error("Clipboard API not supported");
            }
            clearErrorMessage(LOGO_COPY_ERROR);
        } catch (copyError) {
            console.error(copyError);
            setError(LOGO_COPY_ERROR);
        } finally {
            setCopyingLogoId(null);
        }
    };

    const handleLogoGenaration = async () => {
        setError(null);

        const trimmedBusinessName = businessName.trim();
        const trimmedPrompt = promptText.trim();

        let hasError = false;

        if (shouldShowTextInputs) {
            if (!trimmedBusinessName) {
                setBusinessNameError("로고에 들어갈 텍스트는 필수 입력 항목입니다.");
                hasError = true;
            } else {
                setBusinessNameError(null);
            }
        }

        if (!trimmedPrompt) {
            setPromptError("로고 설명은 필수 입력 항목입니다.");
            hasError = true;
        } else {
            setPromptError(null);
        }

        const sizeValidation = validateSize(imageWidth, imageHeight);
        if (sizeValidation) {
            setSizeError(sizeValidation);
            hasError = true;
        } else {
            setSizeError(null);
        }

        if (hasError) {
            return;
        }

        const widthValue = Number.parseInt(imageWidth, 10);
        const heightValue = Number.parseInt(imageHeight, 10);

        const promptSegments: string[] = [];

        if (shouldShowTextInputs && trimmedBusinessName) {
            promptSegments.push(`로고 텍스트: ${trimmedBusinessName}`);
        }

        promptSegments.push(trimmedPrompt);

        if (shouldShowTextInputs && trimmedBusinessName) {
            promptSegments.push(`텍스트 표기법: ${notationLabelMap[textNotation]}`);
        }

        const composedPrompt = promptSegments
            .filter(Boolean)
            .join("\n");

        try {
            setIsLoading(true);

            const res = await generateLogo({
                prompt: composedPrompt,
                style,
                negative_prompt: negativ_prompt || "no watermark",
                type,
                num_images: NUM_IMAGES_DEFAULT,
                width: widthValue,
                height: heightValue
            });

            setLogoResult(res.images);
            setSelectPurpose(null); // 새로 생성 시 선택 모드 초기화
        } catch (e) {
            console.error(e);
            setError("로고 생성에 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    // 로고 삭제(클라이언트 상태만)
    const handleLogoDelete = (id: number) => {
        if (!logoResult) return;
        const next = [...logoResult.slice(0, id), ...logoResult.slice(id + 1)];
        setLogoResult(next.length ? next : null);
    };

    // 로고 저장(API 호출)
    const handleLogoSave = async (id: number) => {
        if (!logoResult) return;

        const imageData = logoResult[id];
        if (!promptText || !imageData) return;

        // 메타 정보 포함
        const prompt = `style: ${style}, negative_prompt: ${negativ_prompt}, ${promptText}`;
        await saveLogo({ prompt, base64: imageData });
        alert("로고가 저장되었습니다.");
    };

    // 결과 섹션 제목(필요 시 사용)
    const resultTitle = useMemo(() => "생성된 로고", []);

    const handleSelectLogo = (logoBase64: string) => {
        if (!selectPurpose) return;
        setLogo(logoBase64);
        if (selectPurpose === "branding") {
            navigate("/branding");
        } else if (selectPurpose === "colorGuide") {
            navigate("/colorGuide");
        }
    };

    const renderTypeAllView = () => (
        <section className={s.allContent} aria-label="로고 타입 예시 전체보기">
            <div className={s.allHeader}>로고 타입 예시 전체보기</div>
            <div className={s.allGrid}>
                {LOGO_TYPES.map(({ key }) => (
                    <button
                        key={key}
                        type="button"
                        className={s.allCardBtn}
                        onClick={() => {
                            setType(key);
                            setShowAllType(false);
                        }}
                    >
                        <LogoExampleBox type={key} />
                    </button>
                ))}
            </div>
            <div className={s.allActions}>
                <TextButton label="닫기" onClick={() => setShowAllType(false)} />
            </div>
        </section>
    );

    const renderStyleAllView = () => (
        <section className={s.allContent} aria-label="로고 스타일 예시 전체보기">
            <div className={s.allHeader}>스타일 전체 예시 보기</div>
            <div className={s.allGrid}>
                {LOGO_STYLES.map(({ key, label }) => (
                    <button
                        key={key}
                        type="button"
                        className={s.allCardBtn}
                        onClick={() => {
                            setStyle(key);
                            setShowAllStyle(false);
                        }}
                    >
                        <LogoStyleExampleBox styleKey={key} label={label} />
                    </button>
                ))}
            </div>
            <div className={s.allActions}>
                <TextButton label="닫기" onClick={() => setShowAllStyle(false)} />
            </div>
        </section>
    );

    return (
        <div className={s.page}>

            {/* 본문: [타입] [스타일] [폼/결과] */}
            <div className={containerClass}>
                {/* 좌측: 전체보기일 때는 다른 사이드바만 표시, 일반 모드에서는 둘 다 표시 */}
                {(!isAnyAllOpen || showAllStyle) && (
                    <section
                        className={s.col}
                        aria-label="로고 타입 선택"
                        aria-expanded={showAllType}
                    >
                        <LogoTypeSidebar
                            selected={type}
                            showAll={false}
                            onSelect={(t) => setType(t)}
                            onShowAll={() => toggleAll("type")}
                            onPickFromAll={(t) => {
                                setType(t);
                                setShowAllType(false);
                            }}
                        />
                    </section>
                )}

                {(!isAnyAllOpen || showAllType) && (
                    <section
                        className={s.col}
                        aria-label="로고 스타일 선택"
                        aria-expanded={showAllStyle}
                    >
                        <LogoStyleSidebar
                            selected={style}
                            showAll={false}
                            onSelect={(k) => setStyle(k)}
                            onShowAll={() => toggleAll("style")}
                            onPickFromAll={(k) => {
                                setStyle(k);
                                setShowAllStyle(false);
                            }}
                        />
                    </section>
                )}

                {/* 우: 메인 영역 */}
                <main className={s.main} aria-label="로고 생성 영역" aria-busy={isLoading}>
                    {isAnyAllOpen ? (
                        <>
                            {showAllType && renderTypeAllView()}
                            {showAllStyle && renderStyleAllView()}
                        </>
                    ) : (
                        <>
                            {!logoResult && (
                                <LogoForm
                                    businessName={businessName}
                                    width={imageWidth}
                                    height={imageHeight}
                                    sizeError={sizeError}
                                    businessNameError={businessNameError}
                                    promptError={promptError}
                                    value={promptText}
                                    error={error}
                                    loading={isLoading}
                                    showTextFields={shouldShowTextInputs}
                                    textNotation={textNotation}
                                    onBusinessNameChange={handleBusinessNameChange}
                                    onWidthChange={handleWidthChange}
                                    onHeightChange={handleHeightChange}
                                    onChange={handlePromptFieldChange}
                                    onTextNotationChange={handleTextNotationChange}
                                    onSubmit={handleLogoGenaration}
                                    // 필요 시 title/promptLabel/submitLabel prop으로 오버라이드 가능
                                />
                            )}

                            {/* 결과 그리드: 폼과 독립적으로 표시 */}
                            {logoResult && !selectPurpose && (
                                <>
                                    <h3 className={s.resultTitle}>{resultTitle}</h3>
                                    <ul className={s.grid} role="list">
                                        {logoResult.map((logo, id) => (
                                            <li className={s.card} key={`logo-${id}`}>
                                                <LogoCard
                                                    id={id}
                                                    logoBase64={logo}
                                                    onDelete={handleLogoDelete}
                                                    onSave={handleLogoSave}
                                                    onDownload={handleLogoDownload}
                                                    onCopy={handleLogoCopy}
                                                    isDownloading={downloadingLogoId === id}
                                                    isCopying={copyingLogoId === id}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                    <div className={s.cardActions}>
                                        <TextButton
                                            label="이 로고를 기반으로 브랜딩 전략 생성하기"
                                            onClick={() => setSelectPurpose("branding")}
                                            variant="blue"
                                        />
                                        <TextButton
                                            label="이 로고를 기반으로 컬러 가이드 생성하기"
                                            onClick={() => setSelectPurpose("colorGuide")}
                                            variant="blue"
                                        />
                                    </div>
                                </>
                            )}

                            {logoResult && selectPurpose && (
                                <>
                                    <h3 className={s.resultTitle}>
                                        {selectPurpose === "branding"
                                            ? "브랜딩 전략 생성을 위해 가장 마음에 드는 로고를 선택해주세요."
                                            : "컬러 가이드 생성을 위해 사용할 로고를 선택해주세요."}
                                    </h3>
                                    <ul className={s.grid} role="list">
                                        {logoResult.map((logo, id) => (
                                            <li className={s.card} key={`select-logo-${id}`}>
                                                <LogoCard id={id} logoBase64={logo} />
                                                <div className={s.cardActions}>
                                                    <TextButton
                                                        label="선택 하기"
                                                        onClick={() => handleSelectLogo(logo)}
                                                        variant="blue"
                                                    />
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className={s.cardActions}>
                                        <TextButton
                                            label="취소"
                                            onClick={() => setSelectPurpose(null)}
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </main>
            </div>

        </div>
    );
}
