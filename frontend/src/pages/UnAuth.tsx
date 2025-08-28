// src/pages/UnAuth.tsx
import { Link } from "react-router-dom";

function UnAuth(){

    return(
        <div>
            <h1>권한이 없습니다.</h1>
            <Link to={'/'}> 홈으로 돌아가기 </Link>
            <Link to={'/login'}> 로그인하러 가기 </Link>
        </div>
    );
}

export default UnAuth;