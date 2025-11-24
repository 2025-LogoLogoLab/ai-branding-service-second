// src/pages/UserInfo.tsx

import UserInfoForm from '../organisms/UserInfoForm';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteMyAccount, fetchUserInfo, modifyUserInfo, type UserInfoResponse } from '../custom_api/user';
import { logOut } from '../custom_api/auth';

const normalizeUserInfo = (data: UserInfoResponse): UserInfoResponse => ({
    profileImage: data.profileImage ?? null,
    nickname: data.nickname ?? '',
    emailNoti: Boolean(data.emailNoti),
    smsNoti: Boolean(data.smsNoti),
    newsLetter: Boolean(data.newsLetter),
    email: data.email ?? '',
    phone: data.phone ?? '',
});


// 회원 정보 페이지
function UserInfo(){
    const navigate = useNavigate();

    const [error, setError] = useState<string | null>(null);
    const [initialUserInfo, setInitialUserInfo] = useState<UserInfoResponse | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const [userInfo, setUserInfo] = useState<UserInfoResponse>({
        profileImage: null,
        nickname: '',
        emailNoti: false,
        smsNoti: false,
        newsLetter: false,
        email: '',
        phone: '',
    });

    const updateProfileImage = (base64: string | null) => {
        // 서버는 data URI prefix 없이 순수 base64만 기대하므로 prefix 제거
        const normalized =
            base64 && base64.startsWith("data:")
                ? base64.split(",").slice(1).join(",")
                : base64;
        setUserInfo((prev) => ({ ...prev, profileImage: normalized ?? null }));
    };

    useEffect(() => {   // 서버에서 사용자 정보 불러와서 저장해두기

        async function fetchProfile() {
            
            try {   // api 클라이언트 호출

                const userData = await fetchUserInfo();
                const normalized = normalizeUserInfo(userData);
                setUserInfo(normalized);
                setInitialUserInfo(normalized);
                setIsEditing(false);
            }
    
            catch (err) {
                setError('회원 정보 불러오기 실패');
            }
        }

        fetchProfile();

    }, []);

    // 회원 정보 수정 처리 함수
    const handleUserInfoModification = async () => {
        if ( !userInfo.nickname ) {
            setError('닉네임은 필수 입력 항목입니다.');
            return;
        }
        try {
            const res = await modifyUserInfo(userInfo);
            const normalized = normalizeUserInfo(res);
            setUserInfo(normalized);
            setInitialUserInfo(normalized);
            alert('회원 정보 수정 성공!');
            setIsEditing(false);
        } catch (err) {
            setError('회원 정보 수정 실패.');
        }
    };

    // 회원 탈퇴 처리 함수
    const handleDeleteMyAccount = async () => {

        try {

            const result = await deleteMyAccount();
            result;
            const res = await logOut();
            res;
        }
        catch( err ){
            console.log("회원 탈퇴 실패 " + err);
        }

        // 회원 탈퇴 완료 시 홈으로.
        navigate('/');
    }

    // 각 체크박스가 변경될 때 실행되는 공통 핸들러
    const handleCheckboxChange = (name: string, checked: boolean) => {
        if (!isEditing) return;
        // 기존 상태를 복사한 뒤, 해당 name의 값을 새로운 checked로 업데이트
        setUserInfo((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    // 각 체크박스가 변경될 때 실행되는 공통 핸들러
    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isEditing) return;
        // 기존 상태를 복사한 뒤, 해당 name의 값을 새로운 checked로 업데이트
        const { name, value } = e.target;
        setUserInfo((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCancel = () => {
        if (initialUserInfo) {
            setUserInfo({ ...initialUserInfo });
        }
        setError(null);
        setIsEditing(false);
    };

    const handleStartEdit = () => {
        setIsEditing(true);
        setError(null);
    };

    return(
        <UserInfoForm 
            profileImage={userInfo.profileImage}
            nickname={userInfo.nickname}
            emailNoti={userInfo.emailNoti}
            smsNoti={userInfo.smsNoti}
            newsLetter={userInfo.newsLetter}
            email={userInfo.email}
            phone={userInfo.phone}
            error={error}
            isEditing={isEditing}
            onEmailChange={(e) => handleFieldChange(e)}
            onNickNameChange={(e) => handleFieldChange(e)}
            onPhoneChange={(e) => handleFieldChange(e)}
            onSubmit={handleUserInfoModification}                
            onDelete={handleDeleteMyAccount}
            onProfileImageChange={updateProfileImage}
            setChecked={handleCheckboxChange}
            onCancel={handleCancel}
            onStartEdit={handleStartEdit}
        />
    );
}

export default UserInfo
