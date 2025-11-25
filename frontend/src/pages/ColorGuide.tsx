// src/pages/ColorGuide.tsx

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelectionStore } from '../context/selectionStore';
import { generateColorGuide, saveColorGuide,  type colorGuideGenResponse } from '../custom_api/colorguide';
import PromptComposer from '../organisms/PromptComposer/PromptComposer';
import { MarkdownMessage } from '../atoms/MarkdownMessage/MarkdownMessage';
import LoadingMessage from '../organisms/LoadingMessage/LoadingMessage';
import ColorGuideResult from '../organisms/ColorGuideResult/ColorGuideResult';
import { TextButton } from '../atoms/TextButton/TextButton';
import { useAuth } from '../context/AuthContext';


// 컬러 가이드 생성 페이지
function ColorGuide(){

    const navigate = useNavigate();

    const [promptText, setPropmt] = useState<string>('');
    const [style, setStyle] = useState<string>('');
    const [imageUrl, setImg] = useState<string>('');
    const [brandingMarkdown, setBrandingMarkdown] = useState<string>('');
    const location = useLocation();
    const { state: selection, setColorGuide, clearColorGuide } = useSelectionStore();
    const [error, setError] = useState<string | null>(null);
    const [colorGuideGenResult, setColorGuideGenResult] = useState<colorGuideGenResponse|null>(null);
    const [lastPrompt, setLastPrompt] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [isCopying, setIsCopying] = useState(false);
    const { user } = useAuth();
    const isAdmin = user?.role === "ADMIN";

    useEffect( () => {
        setStyle('');
        const incomingLogo = (location.state as any)?.selectedLogoBase64 as string | undefined;
        const incomingBranding = (location.state as any)?.selectedBrandingMarkdown as string | undefined;
        // 우선순위: store → location.state
        setImg(selection.logoBase64 ?? incomingLogo ?? '');
        setBrandingMarkdown(selection.brandingMarkdown ?? incomingBranding ?? '');
    },[location.state, selection.logoBase64, selection.brandingMarkdown])
    
    // 컬러 가이드 생성 처리 함수
    const handleColorGuideGeneration = async () => {
        if (!promptText ) {
            setError('컬러 가이드 설명은 필수 입력 항목입니다.');
            return;
        }

        try {
            setError(null);
            setLoading(true);
            clearColorGuide();
            const combined = brandingMarkdown
                ? `${promptText}\n\n[Branding Strategy]\n${brandingMarkdown}`
                : promptText;
            // UI에는 사용자 입력만 노출하고, 생성 요청에만 브랜딩 전략 본문을 포함한다.
            setLastPrompt(promptText);
            const res = await generateColorGuide(
                {
                    briefKo: combined,
                    style,
                    imageUrl,
                },
                { isAdmin },
            );
            setColorGuideGenResult(res);

        } catch (err) {
            console.log(err);
            setError('컬러 가이드 생성 오류 발생');
        } finally {
            setLoading(false);
        }
    };

    const handleColorGuideDelete = async () => {
        // 생성된 컬러 가이드 삭제 함수. 프론트에서만 삭제해도 상관 없을 듯? 백에서도 지워야하려나?
        console.log('color guide delete');
        setColorGuideGenResult(null);
        clearColorGuide();
    }

    const handleColorGuideSave = async () => {
        // 컬러 가이드 저장 함수
        
        const colorGuideToSave = colorGuideGenResult;

        if ( !colorGuideToSave ){
            alert('저장할 컬러 가이드 없음');
            return;
        }
        try {
            const result = await saveColorGuide(
                {
                    briefKo: promptText,
                    guide: colorGuideGenResult,
                    imageUrl: imageUrl || selection.logoBase64 || undefined,
                },
                { isAdmin },
            );
            console.log(result);
            alert('컬러 가이드가 저장되었습니다.');

        }
        catch (err){
            console.log(err);
            setError('컬러 가이드 저장 오류 발생.');
        }
        
    }

    const handleColorGuideCopy = async () => {
        if (!colorGuideGenResult) {
            alert('복사할 컬러 가이드가 없습니다.');
            return;
        }
        if (typeof navigator === 'undefined' || !navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
            alert('클립보드 기능을 사용할 수 없습니다.');
            return;
        }
        try {
            setIsCopying(true);
            await navigator.clipboard.writeText(JSON.stringify(colorGuideGenResult, null, 2));
        } catch (err) {
            console.error(err);
            alert('컬러 가이드 복사에 실패했습니다. 브라우저 설정을 확인해주세요.');
        } finally {
            setIsCopying(false);
        }
    };

    const goToBrandingWithContext = () => {
        if (!colorGuideGenResult) {
            alert('먼저 컬러 가이드를 생성해주세요.');
            return;
        }

        if (colorGuideGenResult) {
            setColorGuide(colorGuideGenResult);
        }
        navigate('/branding', {
            state: {
                selectedLogoBase64: selection.logoBase64 ?? imageUrl ?? '',
                selectedColorGuide: colorGuideGenResult,
            },
        });
    };

    // 안내 메시지: 프롬프트 입력/생성 전 단계에서만 표시
    const showPrePromptNotice = !colorGuideGenResult && !loading;
    const hasLogoContext = Boolean(selection.logoBase64 || imageUrl);
    const linkedSources: string[] = [];
    if (hasLogoContext) linkedSources.push('로고');
    if (selection.brandingMarkdown || brandingMarkdown) linkedSources.push('브랜딩 전략');
    const isLinkedFlow = linkedSources.length > 0;
    const targetLabel = '컬러 가이드';
    const colorGuideLinkedNotice = `선택하신 ${linkedSources.join(', ')} 정보를 바탕으로 ${targetLabel}를 생성합니다. \n원하는 내용을 자세하게 지시하실수록 더 좋은 결과물을 받을 수 있습니다.`;
    const colorGuideStandaloneNotice = `원하는 내용을 자세하게 지시하실수록 더 좋은 결과물을 받을 수 있습니다. \n좀 더 일관적인 결과를 원하신다면 로고를 먼저 생성해 두세요. \n그러면 그 로고에 맞춘 ${targetLabel}를 만들 수 있습니다.`;

    return(
        <div style={{ padding: '12px 16px', display: 'grid', gap: 16 }}>
            {/* 상단 프롬프트 말풍선 */}
            <h2 style={{ margin: 0 }}>
                {hasLogoContext ? '로고를 기반으로 컬러 가이드 작성' : '컬러 가이드 생성'}
            </h2>
            <div style={{ borderBottom: '1px solid var(--color-divider-border)', margin: '4px 0 8px' }} />
            {showPrePromptNotice && (
                <>
                    <div
                        style={{
                            padding: '12px 14px',
                            borderRadius: '12px',
                            color: '#1f2937',
                            lineHeight: 1.6,
                            whiteSpace: 'pre-wrap',
                        }}
                    >
                        {isLinkedFlow ? colorGuideLinkedNotice : colorGuideStandaloneNotice}
                    </div>
                    <div style={{ borderTop: '1px solid var(--color-divider-border)', margin: '8px 0 12px' }} />
                </>
            )}
            {lastPrompt && <MarkdownMessage content={lastPrompt} isUser />}

            {/* 결과 표시 */}
            {loading && <LoadingMessage />}
            {colorGuideGenResult && (
                <ColorGuideResult
                    guide={colorGuideGenResult}
                    id={0}
                    onDelete={handleColorGuideDelete}
                    onSave={handleColorGuideSave}
                    onCopy={() => handleColorGuideCopy()}
                    isCopying={isCopying}
                />
            )}

            {/* 추가 기능 버튼 제거 */}

            {/* 하단 입력 */}
            {!colorGuideGenResult && (
                <PromptComposer
                    value={promptText}
                    placeholder="메시지를 입력하세요."
                    onChange={(e) => setPropmt(e.target.value)}
                    onSubmit={handleColorGuideGeneration}
                    disabled={loading}
                />
            )}

            {/* 에러 배너 */}
            {error && (
                <div role="alert" style={{ color: 'var(--color-font-critical)' }}>{error}</div>
            )}
        </div>
    );
}

export default ColorGuide
