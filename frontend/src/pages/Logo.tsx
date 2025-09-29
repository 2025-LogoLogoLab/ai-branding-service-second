// src/pages/Logo.tsx
// 역할(페이지 컨테이너):
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
import s from "./LogoPage.module.css";

import { LogoTypeSidebar } from "../organisms/LogoTypeSidebar/LogoTypeSidebar";
import { LogoStyleSidebar } from "../organisms/LogoStyleSidebar/LogoStyleSidebar";
import type { LogoType } from "../types/logoTypes";
import type { LogoStyleKey } from "../types/logoStyles";

import LogoForm from "../organisms/LogoForm";
import { LogoCard } from "../organisms/LogoCard/LogoCard";
import { TextButton } from "../atoms/TextButton/TextButton";

import { generateLogo, saveLogo } from "../custom_api/logo";

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
    const [promptText, setPrompt] = useState("");
    const [negativ_prompt, setNegativePrompt] = useState("no watermark");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // -----------------------------
    // 결과 상태
    // -----------------------------
    const [logoResult, setLogoResult] = useState<string[] | null>(null);

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

    // -----------------------------
    // 로고 생성
    // -----------------------------
    const handleLogoGenaration = async () => {
        if (!promptText.trim()) {
            setError("로고 설명은 필수 입력 항목입니다.");
            return;
        }

        try {
            setError(null);
            setIsLoading(true);

            const res = await generateLogo({
                prompt: promptText,
                style,
                negative_prompt: negativ_prompt || "no watermark",
                type,
                num_images: NUM_IMAGES_DEFAULT
            });

            setLogoResult(res.images);
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
        // TODO: 저장 성공/실패 UX(토스트 등) 추가 가능
    };

    // 결과 섹션 제목(필요 시 사용)
    const resultTitle = useMemo(() => "생성된 로고", []);

    return (
        <div className={s.page}>
            {/* 헤더(placeholder) */}
            <header className={s.header} aria-label="페이지 헤더">
                <div className={s.headerInner} />
            </header>

            {/* 본문: [타입] [스타일] [폼/결과] */}
            <div className={s.container}>
                {/* 좌: 타입 */}
                <section
                    className={s.col}
                    aria-label="로고 타입 선택"
                    aria-expanded={showAllType}
                >
                    <LogoTypeSidebar
                        selected={type}
                        showAll={showAllType}
                        onSelect={(t) => setType(t)}
                        onShowAll={() => toggleAll("type")}
                        onPickFromAll={(t) => {
                            setType(t);
                            setShowAllType(false);
                        }}
                    />
                </section>

                {/* 중: 스타일 */}
                <section
                    className={s.col}
                    aria-label="로고 스타일 선택"
                    aria-expanded={showAllStyle}
                >
                    <LogoStyleSidebar
                        selected={style}
                        showAll={showAllStyle}
                        onSelect={(k) => setStyle(k)}
                        onShowAll={() => toggleAll("style")}
                        onPickFromAll={(k) => {
                            setStyle(k);
                            setShowAllStyle(false);
                        }}
                    />
                </section>

                {/* 우: 폼 + 결과(폼은 전체보기일 때 숨김) */}
                <main className={s.main} aria-label="로고 생성 영역" aria-busy={isLoading}>
                    {!logoResult && !isAnyAllOpen && (
                        <LogoForm
                            value={promptText}
                            error={error}
                            loading={isLoading}
                            onChange={(e) => setPrompt(e.target.value)}
                            onSubmit={handleLogoGenaration}
                            // 필요 시 title/promptLabel/submitLabel prop으로 오버라이드 가능
                        />
                    )}

                    {/* 결과 그리드: 폼과 독립적으로 표시 */}
                    {logoResult && (
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
                                        />
                                    </li>
                                ))}
                            </ul>
                            <div className={s.cardActions}>
                                <TextButton
                                    label="이 로고를 기반으로 브랜딩 전략 생성하기"
                                    onClick={() => alert("브랜딩 전략 생성 UI 적용 필요")}
                                    variant="blue"
                                />
                                <TextButton
                                    label="이 로고를 기반으로 컬러 가이드 생성하기"
                                    onClick={() => alert("컬러 가이드 생성 UI 적용 필요")}
                                    variant="blue"
                                />
                            </div>
                        </>
                    )}
                </main>
            </div>

            {/* 푸터(placeholder) */}
            <footer className={s.footer} aria-label="페이지 푸터">
                <div className={s.footerInner} />
            </footer>
        </div>
    );
}
