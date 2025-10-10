// src/pages/ColorGuide.tsx

import { useEffect, useState } from 'react';
import { generateColorGuide, saveColorGuide,  type colorGuideGenResponse } from '../custom_api/colorguide';
import PromptComposer from '../organisms/PromptComposer/PromptComposer';
import { MarkdownMessage } from '../atoms/MarkdownMessage/MarkdownMessage';
import LoadingMessage from '../organisms/LoadingMessage/LoadingMessage';
import ColorGuideResult from '../organisms/ColorGuideResult/ColorGuideResult';


// 컬러 가이드 생성 페이지
function ColorGuide(){

    // const navigate = useNavigate();

    const [promptText, setPropmt] = useState<string>('');
    const [style, setStyle] = useState<string>('');
    const [imageUrl, setImg] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [colorGuideGenResult, setColorGuideGenResult] = useState<colorGuideGenResponse|null>(null);
    const [lastPrompt, setLastPrompt] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect( () => {  // 테스트용
        // setColorGuideGenResult({ colorGuideNum:10, promptText:'컬러 가이드 프롬프트 예시', data:'컬러 가이드 내용 예시' })
        setStyle('');
        setImg('');
    },[])
    
    // 컬러 가이드 생성 처리 함수
    const handleColorGuideGeneration = async () => {
        if (!promptText ) {
            setError('컬러 가이드 설명은 필수 입력 항목입니다.');
            return;
        }

        try {
            setError(null);
            setLoading(true);
            setLastPrompt(promptText);
            const res = await generateColorGuide({ briefKo: promptText, style, imageUrl});
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

    return(
        <div style={{ padding: '12px 16px', display: 'grid', gap: 16 }}>
            {/* 상단 프롬프트 말풍선 */}
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

            {/* 하단 입력 */}
            <PromptComposer
                value={promptText}
                placeholder="색상 조합을 입력하세요..."
                onChange={(e) => setPropmt(e.target.value)}
                onSubmit={handleColorGuideGeneration}
                disabled={loading}
            />

            {/* 에러 배너 */}
            {error && (
                <div role="alert" style={{ color: 'var(--color-font-critical)' }}>{error}</div>
            )}
        </div>
    );
}

export default ColorGuide
