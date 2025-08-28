// src/pages/Branding.tsx

import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { generateColorGuide, saveColorGuide,  type colorGuideGenResponse } from '../custom_api/colorguide';
// import ColorGuideCard from '../organisms/ColorGuideCard/ColorGuideCard';
import ColorGuideForm from '../organisms/ColorGuideForm';
// import ColorGuideExample from '../forTest/ColorGuideExample';
import ColorGuideStrip from '../organisms/ColorGuideStrip/ColorGuideStrip';
import { TextButton } from '../atoms/TextButton/TextButton';


// 컬러 가이드 생성 페이지
function ColorGuide(){

    // const navigate = useNavigate();

    const [promptText, setPropmt] = useState<string>('');
    const [style, setStyle] = useState<string>('');
    const [imageUrl, setImg] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [colorGuideGenResult, setColorGuideGenResult] = useState<colorGuideGenResponse|null>();

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
            const res = await generateColorGuide({ briefKo: promptText, style, imageUrl});

            setColorGuideGenResult(res);
            alert('컬러 가이드 생성 성공!');

        } catch (err) {
            console.log(err);
            setError('컬러 가이드 생성 오류 발생');
        }
    };

    const handleColorGuideDelete = async () => {
        // 생성된 컬러 가이드 삭제 함수. 프론트에서만 삭제해도 상관 없을 듯? 백에서도 지워야하려나?
        console.log('color guide delete');
        setColorGuideGenResult(null);
    }

    const handleColorGuideSave = async () => {
        // 컬러 가이드 저장 함수
        // const token = localStorage.getItem('token');

        // if ( !token ) {
        //     alert('로그인 필요!');
        //     navigate('/login');
        //     return;
        // }
        
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
        <div>
            <ColorGuideForm 
                promptText={promptText}
                error={error}
                onPromptChange={(e) => setPropmt(e.target.value)}
                onSubmit={handleColorGuideGeneration}
            />
            {/* {
                colorGuideGenResult && (
                <ColorGuideCard 
                    colorGuideNum={colorGuideGenResult.colorGuideNum} 
                    promptText={colorGuideGenResult.promptText}
                    data={colorGuideGenResult.data} 
                    onDelete={handleColorGuideDelete}
                    onSave={handleColorGuideSave}
                />)
            } */}
            {
                colorGuideGenResult && (
                    <div>
                        <ColorGuideStrip guide={colorGuideGenResult}/>
                        <TextButton label='저장' onClick={handleColorGuideSave} variant='orange'></TextButton>
                        <TextButton label='삭제' onClick={handleColorGuideDelete} variant='orange'></TextButton>
                    </div>
                )
            }            
        </div>
    );
}

export default ColorGuide