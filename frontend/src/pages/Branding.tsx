// src/pages/Branding.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateBranding, saveBranding, type BrandingResponse } from '../custom_api/branding';
import BrandingCard from '../organisms/BrandingCard/BrandingCard';
import BrandingForm from '../organisms/BrandingForm';


// 브랜딩 전략 생성 페이지
function Branding(){

    const navigate = useNavigate();

    const [promptText, setPropmt] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [brandingResult, setBrandingResult] = useState<BrandingResponse|null>();

    useEffect( () => {  // 테스트용
        setBrandingResult({ brandingNum:10, promptText:'브랜딩 전략 프롬프트 예시', data:'브랜딩 전략 내용 예시' })
    },[])
    
    // 브랜딩 전략 생성 처리 함수
    const handleBrandingGeneration = async () => {
        if (!promptText ) {
            setError('브랜딩 전략 설명은 필수 입력 항목입니다.');
            return;
        }

        try {
            const res = await generateBranding({ promptText});

            setBrandingResult(res);
            alert('브랜딩 전략 생성 성공!');

        } catch (err) {
            console.log(err);
            setError('브랜딩 전략 생성 오류 발생');
        }
    };

    const handleBrandingDelete = async () => {
        // 생성된 브랜딩 전략 삭제 함수. 프론트에서만 삭제해도 상관 없을 듯? 백에서도 지워야하려나?
        console.log('branding delete');
        setBrandingResult(null);
    }

    const handleBrandingSave = async () => {
        // 브랜딩 전략 저장 함수
        const token = localStorage.getItem('token');

        if ( !token ) {
            alert('로그인 필요!');
            navigate('/login');
            return;
        }
        
        const brandingNum = brandingResult?.brandingNum;
        const promptText = brandingResult?.promptText;
        const data = brandingResult?.data;

        if ( !brandingNum || !promptText || !data){
            alert('저장할 브랜딩 전략 없음');
            return;
        }
        try {
            const result = await saveBranding( { brandingNum, promptText, data});
            console.log(result);

            // if ( result === true ) {
            //     alert('브랜딩 전략 저장 성공');
            // }
            // else {
            //     alert('브랜딩 전략 저장 실패');
            // }
        }
        catch (err){
            console.log(err);
            setError('브랜딩 전략 삭제 오류 발생.');
        }
        
    }

    return(
        <div>
            <BrandingForm 
                promptText={promptText}
                error={error}
                onPromptChange={(e) => setPropmt(e.target.value)}
                onSubmit={handleBrandingGeneration}
            />
            {
                brandingResult && (
                <BrandingCard 
                    brandingNum={brandingResult.brandingNum} 
                    promptText={brandingResult.promptText}
                    data={brandingResult.data} 
                    onDelete={handleBrandingDelete}
                    onSave={handleBrandingSave}
                />)
            }
        </div>
    );
}

export default Branding