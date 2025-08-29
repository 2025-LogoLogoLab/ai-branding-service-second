// src/pages/Home.tsx
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import LogOutButton from "../molecules/LogOutButton/LogOutButton";
import ColorGuideExample from "../forTest/ColorGuideExample";

function Home() {
  const {user} = useAuth();
  
  useEffect(()=> {
    console.log("user : " + user?.role + "\n");  // 디버깅용. user role 출력
    console.log("api base : " + import.meta.env.VITE_API_BASE_URL + "\n");  // 디버깅용. user role 출력
    console.log("kakao 콜백 : " + import.meta.env.VITE_CALL_BACK_KAKAO + "\n");  // 디버깅용. user role 출력
    console.log("naver 콜백 : " + import.meta.env.VITE_CALL_BACK_NAVER + "\n");  // 디버깅용. user role 출력
  }, [user])
  
  return (
    <div>
      <h1> Home Page 깃허브 액션 테스트하기 자동 배포1</h1>
      <Link to={'Login'}> Login </Link><br></br>
      <Link to={'Mypage'}> My Page </Link><br></br>
      <Link to={'MyProducts'}> My Products </Link><br></br>
      <Link to={'MyProjects'}> My Projects </Link><br></br>
      <Link to={'logo'}> Logo </Link><br></br>
      <Link to={'branding'}> Branding </Link><br></br>
      <Link to={'colorGuide'}> Color Guide </Link><br></br>
      <Link to={'Admin'}> Admin </Link><br></br>
      <ColorGuideExample></ColorGuideExample>
      <LogOutButton></LogOutButton>
    </div>
  );
}


export default Home