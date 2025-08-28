// src/components/UserInfoForm.tsx

import LabeledCheckBox from "../molecules/LabeledCheckBox/LabeledCheckBox";

// 부모에서 받아올 Props 타입 지정
type UserInfoFormProps = {
    profileImageData: string | null;
    nickname: string;
    emailNoti: boolean;
    smsNoti: boolean;
    newsLetter: boolean;
    email: string;
    phone: string;
    error: string | null;
    onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onNickNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    onDelete: () => void;
    setChecked: (name: string, checked: boolean) => void;
}

// 회원가입 폼 컴포넌트
function UserInfoForm({
    profileImageData,
    nickname,
    emailNoti,
    smsNoti,
    newsLetter,
    email,
    phone,
    error,
    onEmailChange,
    onNickNameChange,
    onPhoneChange,
    onSubmit,
    onDelete,
    setChecked,
}: UserInfoFormProps){

    return(
        <div style={styles.container}>
            <h1>유저 정보</h1> 
            {/* 에러 메시지 */}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {profileImageData ? <p style={{ color: 'red' }}>{profileImageData}</p> : <p style={{color : 'red'}}>프로필없음</p>}      
            <LabeledCheckBox label='이메일 알림' name="emailNoti" checked={emailNoti} onChange={setChecked}></LabeledCheckBox>
            <LabeledCheckBox label='SMS 알림' name="smsNoti" checked={smsNoti} onChange={setChecked}></LabeledCheckBox>
            <LabeledCheckBox label='뉴스레터 구독' name="newsLetter" checked={newsLetter} onChange={setChecked}></LabeledCheckBox>
            <input name="nickname" type="text" value={nickname} onChange={onNickNameChange} placeholder="닉네임" />   
            <input name="email" type="email" value={email} onChange={onEmailChange} placeholder="이메일" />
            <input name="phone" type="tel" value={phone} onChange={onPhoneChange} placeholder="전화번호" />
            <button onClick={onSubmit}>저장하기</button>
            <button onClick={onDelete}>탈퇴하기</button>
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

export default UserInfoForm