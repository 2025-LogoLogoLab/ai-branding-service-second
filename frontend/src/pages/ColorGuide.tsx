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
            setLastPrompt(combined);
            const res = await generateColorGuide({ briefKo: combined, style, imageUrl}, { isAdmin });
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
            const result = await saveColorGuide( { briefKo:promptText, guide:colorGuideGenResult}, { isAdmin } );
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
    const isLinkedFlow = Boolean(selection.logoBase64 || imageUrl || selection.brandingMarkdown);
    const colorGuideLinkedNotice =
        "컬러 가이드 - 연계 시 설명: 로고나 브랜딩 정보를 함께 전달하면 핵심 톤앤매너를 더 정확히 반영한 팔레트를 제안합니다. (예시 문구 길이를 늘려둔 상태)";
    const colorGuideStandaloneNotice =
        "컬러 가이드 - 단독 시 설명: 브랜드의 감성, 분위기, 활용 채널을 구체적으로 적어주면 색상 제안이 더 정밀해집니다. (예시 문구 길이를 늘려둔 상태)";

    const hasLogoContext = Boolean(selection.logoBase64 || imageUrl);

    return(
        <div style={{ padding: '12px 16px', display: 'grid', gap: 16 }}>
            {/* 상단 프롬프트 말풍선 */}
            <h2 style={{ margin: 0 }}>
                {hasLogoContext ? '로고를 기반으로 컬러 가이드 작성' : '컬러 가이드 생성'}
            </h2>
            <div style={{ borderBottom: '1px solid var(--color-divider-border)', margin: '4px 0 8px' }} />
            {showPrePromptNotice && (
                <div
                    style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: '#eef2ff',
                        color: '#1f2937',
                        lineHeight: 1.6,
                    }}
                >
                    {isLinkedFlow ? colorGuideLinkedNotice : colorGuideStandaloneNotice}
                </div>
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

            {colorGuideGenResult && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '50px 0' }}>
                    {selection.brandingMarkdown ? (
                        <TextButton
                            label="추가기능"
                            onClick={() => alert('추가기능 준비 중입니다.')}
                            variant="outlined"
                        />
                    ) : (
                        <TextButton
                            label="이 컬러 가이드로 브랜딩 전략 생성하기"
                            onClick={goToBrandingWithContext}
                            variant="blue"
                        />
                    )}
                </div>
            )}

            {/* 하단 입력 */}
            {!colorGuideGenResult && (
                <PromptComposer
                    value={promptText}
                    placeholder="색상 조합을 입력하세요..."
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
