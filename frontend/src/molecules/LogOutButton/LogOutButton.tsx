// src/molecules/LogOutButton/LogOutButton.tsx

import { useNavigate } from "react-router-dom";
import { TextButton } from "../../atoms/TextButton/TextButton";
import { useAuth } from "../../context/AuthContext";

function LogOutButton(){

    const { user, logout }= useAuth();  // 전역 권한 상태 불러오기
    const navigate = useNavigate(); 

    const handleLogOut = async () => {
        try {
            await logout();     // 로그아웃 수행
            navigate('/');      // 홈 페이지로 리다이렉트
        }

        catch (err) {
            console.log("로그아웃 버튼 오류 발생" + err);
        }

    }

    return (    // 권한이 없는 경우 (로그인 하지 않은 경우 보여주지 않음.) 나중에 아이콘 버튼으로 변경할 가능성 존재.
        user && (<TextButton label="로그아웃" onClick={handleLogOut} variant="orange"></TextButton>)
    );

}

export default LogOutButton;