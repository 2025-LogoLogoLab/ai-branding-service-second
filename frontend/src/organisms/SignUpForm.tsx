// src/components/SignUpForm.tsx
// 회원 가입 위한 입력 UI + 사용자의 입력 이벤트 상위 컴포넌트에 전달

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { TextInput } from "../atoms/TextInput/TextInput";
import styles from './SignUpForm.module.css';
import kakaoLoginImage from '../assets/social_login/kakao_login_medium_wide.png';
import naverIconSquare from '../assets/social_login/btnG_아이콘사각.png';

type SocialProvider = 'kakao' | 'naver';
type social = SocialProvider | null;

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
    onKakaoLogin: (provider: social) => void;
    onNaverLogin: (provider: social) => void;
    onTermsToggle: (checked: boolean) => void;
    termsAccepted: boolean;
}

type FieldKey = 'email' | 'password' | 'passwordConfirm' | 'nickname';

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
    onSubmit,
    onKakaoLogin,
    onNaverLogin,
    onTermsToggle,
    termsAccepted,
}: SignUpFormProps){
    const [fieldErrors, setFieldErrors] = useState<Record<FieldKey, string>>({
        email: '',
        password: '',
        passwordConfirm: '',
        nickname: '',
    });

    const setFieldError = (field: FieldKey, message: string) => {
        setFieldErrors((prev) =>
            prev[field] === message ? prev : { ...prev, [field]: message }
        );
    };

    const clearFieldError = (field: FieldKey) => {
        setFieldErrors((prev) => (prev[field] === '' ? prev : { ...prev, [field]: '' }));
    };

    const passwordMismatch =
        passwordConfirm.length > 0 && password.length > 0 && passwordConfirm !== password;

    useEffect(() => {
        if (passwordMismatch) {
            setFieldError('passwordConfirm', '비밀번호 확인 값이 일치하지 않습니다.');
        } else {
            clearFieldError('passwordConfirm');
        }
    }, [passwordMismatch, password, passwordConfirm]);

    const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        onSubmit();
    };

    return(
        <div className={styles.page}>
            <div className={styles.card}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>로고로고랩에 오신 것을 환영합니다</h1>
                    <p className={styles.subtitle}>계정을 생성하고 서비스를 이용하세요.</p>
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <form className={styles.form} onSubmit={handleFormSubmit} noValidate>
                    <TextInput
                        type="email"
                        value={email}
                        onChange={onEmailChange}
                        placeholder="이메일 주소"
                        required
                        ariaInvalid={Boolean(fieldErrors.email)}
                        onInvalid={(e) => {
                            e.preventDefault();
                            setFieldError('email', '올바른 이메일 주소를 입력해주세요.');
                        }}
                        onInput={() => clearFieldError('email')}
                        className={styles.input}
                    />
                    {fieldErrors.email && (
                        <span className={styles.fieldError}>{fieldErrors.email}</span>
                    )}
                    <TextInput
                        type="password"
                        value={password}
                        onChange={onPasswordChange}
                        placeholder="비밀번호"
                        required
                        minLength={8}
                        ariaInvalid={Boolean(fieldErrors.password)}
                        onInvalid={(e) => {
                            e.preventDefault();
                            const message =
                                e.currentTarget.value.length < 8
                                    ? '비밀번호는 최소 8자 이상이어야 합니다.'
                                    : '비밀번호를 입력해주세요.';
                            setFieldError('password', message);
                        }}
                        onInput={() => clearFieldError('password')}
                        className={styles.input}
                    />
                    {fieldErrors.password && (
                        <span className={styles.fieldError}>{fieldErrors.password}</span>
                    )}
                    <TextInput
                        type="password"
                        value={passwordConfirm}
                        onChange={onPasswordConfirmChange}
                        placeholder="비밀번호 확인"
                        required
                        ariaInvalid={Boolean(fieldErrors.passwordConfirm)}
                        onInvalid={(e) => {
                            e.preventDefault();
                            setFieldError('passwordConfirm', '비밀번호 확인을 입력해주세요.');
                        }}
                        onInput={() => clearFieldError('passwordConfirm')}
                        className={styles.input}
                    />
                    {fieldErrors.passwordConfirm && (
                        <span className={styles.fieldError}>{fieldErrors.passwordConfirm}</span>
                    )}
                    <TextInput
                        type="text"
                        value={nickname}
                        onChange={onNickNameChange}
                        placeholder="닉네임"
                        required
                        minLength={2}
                        ariaInvalid={Boolean(fieldErrors.nickname)}
                        onInvalid={(e) => {
                            e.preventDefault();
                            const message =
                                e.currentTarget.value.length < 2
                                    ? '닉네임은 최소 2자 이상이어야 합니다.'
                                    : '닉네임을 입력해주세요.';
                            setFieldError('nickname', message);
                        }}
                        onInput={() => clearFieldError('nickname')}
                        className={styles.input}
                    />
                    {fieldErrors.nickname && (
                        <span className={styles.fieldError}>{fieldErrors.nickname}</span>
                    )}
                    <button
                        type="submit"
                        className={styles.primaryButton}
                        disabled={!termsAccepted}
                    >
                        가입하기
                    </button>
                </form>

                <div className={styles.divider}>
                    <span className={styles.dividerLine} aria-hidden="true" />
                    <span className={styles.dividerText}>or continue with</span>
                    <span className={styles.dividerLine} aria-hidden="true" />
                </div>

                <div className={styles.socialList}>
                    <button
                        type="button"
                        className={`${styles.socialButton} ${styles.kakaoButton}`}
                        onClick={() => onKakaoLogin('kakao')}
                        aria-label="카카오로 로그인"
                    >
                        <img
                            src={kakaoLoginImage}
                            alt="카카오 로그인"
                            className={styles.kakaoImage}
                        />
                    </button>
                    <button
                        type="button"
                        className={`${styles.socialButton} ${styles.naverButton}`}
                        onClick={() => onNaverLogin('naver')}
                        aria-label="네이버로 로그인"
                    >
                        <span className={styles.naverIconWrapper}>
                            <img
                                src={naverIconSquare}
                                alt=""
                                className={styles.naverIcon}
                            />
                        </span>
                        <span className={styles.naverLabel}>네이버 로그인</span>
                    </button>
                </div>

                <label className={styles.agreementRow}>
                    <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => onTermsToggle(e.target.checked)}
                    />
                    이용 약관에 동의합니다.
                </label>

            </div>
        </div>
    );
}

export default SignUpForm
