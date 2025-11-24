// src/organisms/UserInfoForm.tsx
// 회원 정보 수정 페이지의 주요 UI를 구성하는 Organism

import React, { useRef } from 'react';
import styles from './UserInfoForm.module.css';
import { TextInput } from '../atoms/TextInput/TextInput';
import { TextButton } from '../atoms/TextButton/TextButton';

type UserInfoFormProps = {
    profileImage: string | null;
    nickname: string;
    emailNoti: boolean;
    smsNoti: boolean;
    newsLetter: boolean;
    email: string;
    phone: string;
    error: string | null;
    isEditing: boolean;
    onProfileImageChange: (base64: string | null) => void;
    onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onNickNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    onDelete: () => void;
    setChecked: (name: string, checked: boolean) => void;
    onCancel?: () => void;
    onStartEdit: () => void;
};

function normalizeProfileImageSrc(profileImage: string | null): string | null {
    if (!profileImage) return null;
    if (profileImage.startsWith('data:')) return profileImage;
    if (profileImage.startsWith('http://') || profileImage.startsWith('https://')) {
        return profileImage;
    }
    return `data:image/png;base64,${profileImage}`;
}

function UserInfoForm({
    profileImage,
    nickname,
    emailNoti,
    smsNoti,
    newsLetter,
    email,
    phone,
    error,
    isEditing,
    onProfileImageChange,
    onEmailChange,
    onNickNameChange,
    onPhoneChange,
    onSubmit,
    onDelete,
    setChecked,
    onCancel,
    onStartEdit,
}: UserInfoFormProps) {
    const profileImageSrc = normalizeProfileImageSrc(profileImage);
    const pageTitle = isEditing ? '회원 정보 수정' : '회원 정보';
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handlePickImage = () => {
        if (!isEditing) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            if (typeof result === "string") {
                onProfileImageChange(result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        if (!isEditing) return;
        onProfileImageChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const notificationPreferences: Array<{
        key: 'emailNoti' | 'smsNoti' | 'newsLetter';
        label: string;
        description: string;
        value: boolean;
    }> = [
        {
            key: 'emailNoti',
            label: '이메일 알림',
            description: '이메일로 알림 받기',
            value: emailNoti,
        },
        {
            key: 'smsNoti',
            label: 'SMS 알림',
            description: 'SMS로 알림 받기',
            value: smsNoti,
        },
        {
            key: 'newsLetter',
            label: '뉴스레터',
            description: '뉴스레터 받기',
            value: newsLetter,
        },
    ];

    return (
            <section className={styles.content} aria-label={pageTitle}>
                <header className={styles.header}>
                    <h1 className={styles.title}>{pageTitle}</h1>
                    <p className={styles.subtitle}>계정의 프로필과 알림 설정을 업데이트하세요.</p>
                </header>

                <div className={styles.profileCard}>
                    <div className={styles.avatarColumn}>
                        <div className={styles.avatarWrapper}>
                            {profileImageSrc ? (
                                <img
                                    src={profileImageSrc}
                                    alt="프로필 이미지"
                                    className={styles.avatarImage}
                                />
                            ) : (
                                <div className={styles.avatarPlaceholder}>NO IMG</div>
                            )}
                            <button
                                type="button"
                                className={styles.avatarEditButton}
                                aria-label="프로필 이미지 변경"
                                onClick={handlePickImage}
                                disabled={!isEditing}
                            >
                                ✎
                            </button>
                            {profileImageSrc && isEditing && (
                                <button
                                    type="button"
                                    className={styles.avatarRemoveButton}
                                    onClick={handleRemoveImage}
                                    aria-label="프로필 이미지 삭제"
                                >
                                    ×
                                </button>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                            />
                        </div>
                        <span className={styles.avatarCaption}>프로필 이미지를 업로드하거나 교체할 수 있습니다.</span>
                    </div>

                    <div className={styles.nicknameColumn}>
                        <label htmlFor="nickname" className={styles.fieldLabel}>
                            닉네임
                        </label>
                        <TextInput
                            id="nickname"
                            name="nickname"
                            value={nickname}
                            onChange={onNickNameChange}
                            placeholder="닉네임 입력"
                            disabled={!isEditing}
                            className={styles.input}
                        />
                    </div>
                </div>

                {error && (
                    <div role="alert" className={styles.errorBanner}>
                        {error}
                    </div>
                )}

                <section className={`${styles.section} ${styles.sectionDivider}`} aria-labelledby="notification-settings">
                    <div className={styles.sectionHeader}>
                        <h2 id="notification-settings" className={styles.sectionTitle}>
                            알림 설정
                        </h2>
                    </div>
                    <div className={styles.sectionBody}>
                        {notificationPreferences.map(({ key, label, description, value }) => (
                            <div className={styles.preferenceRow} key={key}>
                                <div className={styles.preferenceText}>
                                    <span className={styles.preferenceLabel}>{label}</span>
                                    <span className={styles.preferenceDescription}>{description}</span>
                                </div>
                                <label
                                    className={`${styles.toggleSwitch} ${!isEditing ? styles.toggleDisabled : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        name={key}
                                        checked={value}
                                        disabled={!isEditing}
                                        onChange={(event) => setChecked(key, event.target.checked)}
                                    />
                                    <span className={styles.switchTrack} aria-hidden="true" />
                                </label>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={`${styles.section} ${styles.sectionDivider}`} aria-labelledby="account-information">
                    <div className={styles.sectionHeader}>
                        <h2 id="account-information" className={styles.sectionTitle}>
                            계정 정보
                        </h2>
                    </div>
                    <div className={`${styles.sectionBody} ${styles.accountBody}`}>
                        <div className={styles.fieldGroup}>
                            <label htmlFor="email" className={styles.fieldLabel}>
                                이메일
                            </label>
                            <TextInput
                                id="email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={onEmailChange}
                                placeholder="이메일 입력"
                                disabled={!isEditing}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label htmlFor="phone" className={styles.fieldLabel}>
                                전화번호
                            </label>
                            <TextInput
                                id="phone"
                                name="phone"
                                type="tel"
                                value={phone}
                                onChange={onPhoneChange}
                                placeholder="전화번호 입력"
                                disabled={!isEditing}
                                className={styles.input}
                            />
                        </div>
                    </div>
                </section>

                <div className={styles.actions}>
                    {isEditing ? (
                        <>
                            <TextButton
                                label="저장"
                                onClick={onSubmit}
                                variant="outlined"
                                className={styles.primaryButton}
                            />
                            {onCancel && (
                                <TextButton
                                    label="취소"
                                    onClick={() => onCancel()}
                                    variant="outlined"
                                    className={styles.secondaryButton}
                                />
                            )}
                        </>
                    ) : (
                        <TextButton
                            label="수정"
                            onClick={onStartEdit}
                            variant="outlined"
                            className={styles.primaryButton}
                        />
                    )}
                    <TextButton
                        label="탈퇴"
                        onClick={onDelete}
                        variant="outlined"
                        className={styles.dangerButton}
                    />
                </div>
            </section>
    );
}

export default UserInfoForm;
