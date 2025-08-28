// src/pages/SignUp.tsx

import SignUpForm from '../organisms/SignUpForm';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../custom_api/signup';


// 회원 가입 페이지
function SignUp(){

    const navigate = useNavigate();

    // 회원 가입에 필요한 상태들
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [nickname, setNickName] = useState('');
    const [error, setError] = useState<string | null>(null);

    // 회원 가입 처리 함수
    const handleSignIn = async () => {
        
        if (!email || !password || !passwordConfirm || !nickname) {     // 필수 입력칸 확인
            setError('이메일과 비밀번호, 닉네임은 필수 입력 항목입니다.');
            return;
        } else if ( password !== passwordConfirm ) {    // 비밀번호 확인 제대로 들어왔나 확인
            setError('비밀번호와 비밀번호 확인 필드의 값이 다릅니다.');
            return;
        }

        try {
            const signupResult = await signup({email, password, nickname});
            signupResult;
            // localStorage.setItem('token', signupResult.accessToken); // 로컬에 JWT 토큰 저장.
            // localStorage.setItem('id', signupResult.id); // 로컬에 사용자 id 저장. 여긴 나중에 수정해야할 듯
            // localStorage.setItem('nickname', signupResult.nickname); // 로컬에 사용자 닉네임 저장. 여긴 나중에 수정해야할 듯
            alert('회원가입 성공!');
            navigate('/login'); // 회원 가입 성공 시 로그인 페이지로... 이것도 그냥 로그인이랑 같이 처리해버릴까?
        } catch (err) {
            setError('회원가입 실패. 정보를 다시 확인해주세요.' + err);
        }
    };

    return(
        <SignUpForm     // 회원 가입 폼
            email={email}
            password={password}
            passwordConfirm={passwordConfirm}
            nickname={nickname}
            error={error}
            onEmailChange={(e) => setEmail(e.target.value)}
            onPasswordChange={(e) => setPassword(e.target.value)}
            onPasswordConfirmChange={(e) => setPasswordConfirm(e.target.value)}
            onNickNameChange={(e) => setNickName(e.target.value)}
            onSubmit={handleSignIn}                
        />
    );
}

export default SignUp