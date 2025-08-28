// src/components/SignUpForm.tsx
// 회원 가입 위한 입력 UI + 사용자의 입력 이벤트 상위 컴포넌트에 전달

import { TextButton } from "../atoms/TextButton/TextButton";
import { TextInput } from "../atoms/TextInput/TextInput";

type SignUpFormProps = {
    // 부모에서 받아올 Props 타입 지정
    email: string;
    password: string;
    passwordConfirm: string;
    nickname: string;
    error: string | null;
    onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPasswordConfirmChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onNickNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
}

function SignUpForm({
    // 회원가입 폼 컴포넌트 정의
    email,
    password,
    passwordConfirm,
    nickname,
    error,
    onEmailChange,
    onPasswordChange,
    onPasswordConfirmChange,
    onNickNameChange,
    onSubmit
}: SignUpFormProps){
    return(
        <div style={styles.container}>
            <h1>회원가입</h1> 
            {/* 에러 메시지 */}
            {error && <p style={{ color: 'red' }}>{error}</p>}      
            <TextInput type="email" value={email} onChange={onEmailChange} placeholder="이메일" />
            <TextInput type="password" value={password} onChange={onPasswordChange} placeholder="비밀번호" />   
            <TextInput type="password" value={passwordConfirm} onChange={onPasswordConfirmChange} placeholder="비밀번호 확인" />   
            <TextInput type="text" value={nickname} onChange={onNickNameChange} placeholder="닉네임" />   
            
            <TextButton label='회원가입' onClick={onSubmit} variant="outlined"></TextButton>
            {/* 카카오로 계속하기 네이버로 계속하기 버튼을 여기도 추가할지는 미정. 비밀번호 찾기 혹은 초기화 기능 구현할건지도 미정. */}
        </div>
    );
}

// JS 객체로 스타일 넘기기
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

export default SignUpForm