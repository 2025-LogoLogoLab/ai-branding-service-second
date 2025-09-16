// src/components/LogoForm.tsx

import { TextArea } from "../atoms/TextArea/TextArea";
import { TextButton } from "../atoms/TextButton/TextButton";
// import { TextInput } from "../atoms/TextInput/TextInput";

// 부모에서 받아올 Props 타입 지정
type LogoFormProps = {
    promptText: string;
    error: string | null;
    onPromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSubmit: () => void;
    // style: string;
    // onStyleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    // negative_prompt: string;
    // onNegPromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    // numImages: number;
    // onNumImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isLoading: boolean;
}

// 로고 폼 컴포넌트
function LogoForm({
    promptText: prompt,
    error,
    onPromptChange,
    onSubmit,
    // style,
    // onStyleChange,
    // negative_prompt,
    // onNegPromptChange,
    // numImages,
    // onNumImageChange,
    isLoading
}: LogoFormProps){
    return(
        <div style={styles.container}>
            <h1>로고 생성</h1> 
            {/* 에러 메시지 */}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {isLoading && <p style={{ color: 'orange' }}>로고 생성중...</p>}
            {/* <TextInput value={style} onChange={onStyleChange} placeholder="스타일" type="text"></TextInput> */}
            {/* <TextInput value={numImages} onChange={onNumImageChange} placeholder="로고 연속 생성 수" type="number"></TextInput> */}
            {/* <TextArea value={negative_prompt} onChange={onNegPromptChange} placeholder="로고에서 제외할 내용"/> */}
            <TextArea value={prompt} onChange={onPromptChange} placeholder="로고 설명" />   
            <TextButton label='로고 생성'onClick={onSubmit} variant="orange"/>
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

export default LogoForm