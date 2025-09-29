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
    style?: string;
    isLoading: boolean;
}

// 로고 폼 컴포넌트
function LogoForm({
    promptText: prompt,
    error,
    onPromptChange,
    onSubmit,
    isLoading
}: LogoFormProps){
    return(
        <div style={styles.container}>
            <h1>로고 생성</h1> 
            {/* 에러 메시지 */}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {/* 전역 로딩 관련 UI가 추가되면 좋을 듯 */}
            {isLoading && <p style={{ color: "#1E3A8A" }}>로고 생성중...</p>}
            <TextArea value={prompt} onChange={onPromptChange} placeholder="로고 설명" />   
            <TextButton label='로고 생성'onClick={onSubmit} variant="blue"/>
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