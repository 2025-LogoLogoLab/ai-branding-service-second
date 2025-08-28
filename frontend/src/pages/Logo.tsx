// src/pages/Logo.tsx

import LogoForm from '../organisms/LogoForm';
import { useState } from 'react';
import { generateLogo, saveLogo } from '../custom_api/logo';
// import type { LogoGenResponse } from '../custom_api/logo';
import { LogoCard } from '../organisms/LogoCard/LogoCard';
import { TextButton } from '../atoms/TextButton/TextButton';


// 로고 생성 페이지
function Logo(){

    const [promptText, setPropmt] = useState<string>('');
    const [negativ_prompt, setNegrtivePrompt] = useState<string>('');
    const [style, setStyle] = useState<string>('');
    const [numImages, setNumImages] = useState<number>(1);
    const [error, setError] = useState<string | null>(null);
    const [logoResult, setLogoResult] = useState<string[]|null>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    // 로고 생성 처리 함수
    const handleLogoGenaration = async () => {
        if (!promptText ) {
            setError('로고 설명은 필수 입력 항목입니다.');
            return;
        }

        try {

            const negP = negativ_prompt? negativ_prompt : "no watermark";
            const numI = Math.max(numImages ?? 1, 1);   // 값이 없거나 음수 나오는 경우 방지
            setIsLoading(true);            
            const res = await generateLogo({ prompt: promptText, style, 
                negative_prompt:negP, 
                num_images:numI 
            });

            // setLogoUrl(res.imageUrl);
            setLogoResult(res.images);
            alert('로고 생성 성공!');
            setIsLoading(false);
        } catch (err) {
            console.log(err);
            setIsLoading(false);
            setError('로고 생성에 실패했습니다.');
        }
    };

    const handleLogoDelete = async (id : number) => {
        // 생성된 로고 삭제 함수. 프론트에서만 삭제해도 상관 없을 듯? 백에서도 지워야하려나?
        console.log('logo delete');
        if (logoResult == null){
            alert('로고 없음.');
            return;
        }
        // const temp = logoResult.toSpliced(id, 1);
        const next = [...logoResult?.slice(0, id), ...logoResult?.slice(id + 1)];
        setLogoResult(next);
    }

    const handleLogoSave = async (id : number) => {
        // 로고 저장 함수
        
        if( logoResult == null ){
            alert('저장할 로고 없음');
            return;
        }

        const imageData = logoResult[id];

        if ( !promptText || !imageData ){
            alert('저장할 로고 없음');
            return;
        }

        const prompt = `style: ${style}, negative_prompt: ${negativ_prompt}, ` + promptText;

        const result = await saveLogo( { prompt:prompt, base64: imageData } );
        result;

    }

    return(
        <div>
            <LogoForm 
                promptText={promptText}
                error={error}
                onPromptChange={(e) => setPropmt(e.target.value)}
                onSubmit={handleLogoGenaration}
                style={style}
                onStyleChange={(e) => setStyle(e.target.value)}
                negative_prompt={negativ_prompt}
                onNegPromptChange={(e) => setNegrtivePrompt(e.target.value)}
                numImages={numImages}
                onNumImageChange={(e) => setNumImages(e.target.valueAsNumber)}
                isLoading={isLoading}
            />
            {
                logoResult?.map((logo, id) => (
                <div>
                    <LogoCard 
                        key={id}    // React에서 사용하기 위한 key... 이렇게 쓰면 사실 비추.
                        id={id}     // 수정 필요.? 어떤 수정?
                        logoBase64={logo} 
                        onDelete={(id) => handleLogoDelete(id)}
                        onSave={(id)=> handleLogoSave(id)}
                    />
                    <TextButton label='이 로고를 기반으로 브랜딩 전략 생성하기' onClick={() => console.log('브랜딩 전략 생성')} variant='orange'></TextButton>
                    <TextButton label='이 로고를 기반으로 컬러 가이드 생성하기' onClick={() => console.log('컬러 가이드 생성')} variant='orange'></TextButton>
                </div>
                ) )
            }
        </div>
    );
}

export default Logo