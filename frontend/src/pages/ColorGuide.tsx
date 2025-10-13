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
            const res = await generateColorGuide({ briefKo: combined, style, imageUrl});
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
            const result = await saveColorGuide( { briefKo:promptText, guide:colorGuideGenResult} );
            console.log(result);

        }
        catch (err){
            console.log(err);
            setError('컬러 가이드 저장 오류 발생.');
        }
        
    }

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

    return(
        <div style={{ padding: '12px 16px', display: 'grid', gap: 16 }}>
            {/* 상단 프롬프트 말풍선 */}
            <h2 style={{ margin: 0 }}>로고를 기반으로 컬러 가이드 작성</h2>
            {lastPrompt && <MarkdownMessage content={lastPrompt} isUser />}

            {/* 결과 표시 */}
            {loading && <LoadingMessage />}
            {colorGuideGenResult && (
                <ColorGuideResult
                    guide={colorGuideGenResult}
                    id={0}
                    onDelete={handleColorGuideDelete}
                    onSave={handleColorGuideSave}
                />
            )}

            {colorGuideGenResult && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
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
