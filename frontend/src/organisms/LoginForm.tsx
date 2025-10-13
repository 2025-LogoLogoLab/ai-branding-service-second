// src/components/LoginForm.tsx
// 로그인 기능에 필요한 핵심적인 UI 표출, 사용자의 입력 이벤트를 상위로 전달.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { SocialProvider } from '../custom_api/auth';
import { TextInput } from '../atoms/TextInput/TextInput';
import styles from './LoginForm.module.css';

type social = SocialProvider | null;

type LoginFormProps = {    // Props 타입 지정
    email: string;
    password: string;
    error: string | null;
    onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    onNaverLogin: (provider: social) => void;
    onKakaoLogin: (provider: social) => void;
};

function LoginForm({
    email,
    password,
    error,
    onEmailChange,
    onPasswordChange,
    onSubmit,
    onNaverLogin,
    onKakaoLogin,
}: LoginFormProps) {
    const navigate = useNavigate();
    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>다시 오신 것을 환영합니다</h1>
                    <p className={styles.subtitle}>로그인해서 더 많은 기능을 사용해보세요</p>
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.form}>
                    <TextInput
                        type="email"
                        value={email}
                        onChange={onEmailChange}
                        placeholder="이메일 주소"
                        className={styles.input}
                    />
                    <TextInput
                        type="password"
                        value={password}
                        onChange={onPasswordChange}
                        placeholder="비밀번호"
                        className={styles.input}
                    />
                    <button type="button" className={styles.primaryButton} onClick={onSubmit}>
                        로그인 하기
                    </button>
                </div>

                <div className={styles.divider}>
                    <span className={styles.dividerLine} aria-hidden="true" />
                    <span className={styles.dividerText}>or continue with</span>
                    <span className={styles.dividerLine} aria-hidden="true" />
                </div>

                <div className={styles.socialList}>
                    <button
                        type="button"
                        className={styles.socialButton}
                        onClick={() => onKakaoLogin('kakao')}
                    >
                        <span className={`${styles.socialIcon} ${styles.kakao}`} aria-hidden="true">K</span>
                        Kakao
                    </button>
                    <button
                        type="button"
                        className={styles.socialButton}
                        onClick={() => onNaverLogin('naver')}
                    >
                        <span className={`${styles.socialIcon} ${styles.naver}`} aria-hidden="true">N</span>
                        Naver
                    </button>
                </div>

                <div className={styles.signupFooter}>
                    <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={() => navigate('/signUp')}
                    >
                        회원가입
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LoginForm;
