// src/components/BrandingForm.tsx

import { TextArea } from "../atoms/TextArea/TextArea";
import { TextButton } from "../atoms/TextButton/TextButton";

// 부모에서 받아올 Props 타입 지정
type ColorGuideFormProps = {
    promptText: string;
    error: string | null;
    onPromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSubmit: () => void;
}

// 컬러 가이드 폼 컴포넌트
function ColorGuideForm({
    promptText: prompt,
    error,
    onPromptChange,
    onSubmit,
}: ColorGuideFormProps){
    return(
        <div style={styles.container}>
            <h1>컬러 가이드 생성</h1> 
            {/* 에러 메시지 */}
            {error && <p style={{ color: 'red' }}>{error}</p>}      
            <TextArea value={prompt} onChange={onPromptChange} placeholder="컬러 가이드 설명" />   
            <TextButton label='컬러 가이드 생성'onClick={onSubmit} variant="orange"/>
        </div>
    );
}

// 스타일 정하기. 객체처럼 만들 수 있음.
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    height: '100vh',
  },
};

export default ColorGuideForm