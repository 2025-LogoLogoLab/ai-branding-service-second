// src/utils/logout.ts

import { logOut } from "../custom_api/auth";


export default async function handleLogOut(){
    // 로컬 스토리지에서 token 불러와 로그아웃 api 부른 뒤 메시지 내용 리턴하는 함수.

    const result = await logOut(  );
    console.log(result);

    return result;
}