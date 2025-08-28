// src/routes/AppRoutes.tsx
// 라우팅이랑 App.tsx를 분리.
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import SignUp from '../pages/SignUp'
import MyPage from '../pages/MyPage'
import NotFound from '../pages/NotFound'
import AuthCallback from '../pages/AuthCallback'
import UserInfo from '../pages/UserInfo'
import Logo from '../pages/Logo'
import MyProducts from '../pages/MyProducts'
import MyProjects from '../pages/MyProjects'
import Branding from '../pages/Branding'
import ColorGuide from '../pages/ColorGuide'
import { ProtectedRoute } from './ProtectedRoute'
import Admin from '../pages/Admin'
import UnAuth from '../pages/UnAuth'
// import Tester from '../forTest/UItestPage'

const AppRoutes = () => {
  return (
    <Routes>
      {/* 전체 공개 페이지 */}
      {/* 테스트를 위해 잠시 Home 페이지를 Tester 페이지로 대체 */}
      {/* <Route path="/" element={<Tester />} /> */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signUp" element={<SignUp />} />
      <Route path="/logo" element={<Logo />} />
      <Route path="/branding" element={<Branding />} />
      <Route path="/colorGuide" element={<ColorGuide />} />
      {/* <Route path="/auth/callback" element={<AuthCallback />} /> */}
      <Route path="/oauth/callback" element={<AuthCallback />} />
      {/* <Route path="oauth/callback?provider=naver" element={<AuthCallback />} /> */}
      <Route path='/unauthorized' element={<UnAuth/>}/>

      {/* 로그인 된 사용자만 공개하는 페이지 */}
      <Route element={<ProtectedRoute />}>
        <Route path="/myPage" element={<MyPage />} />
        <Route path="/myProducts" element={<MyProducts />} />
        <Route path="/myProjects" element={<MyProjects />} />
        <Route path="/myPage/userInfo" element={<UserInfo />} />
      </Route>
      
      
      {/* 관리자만 공개하는 페이지 */}
      <Route element={<ProtectedRoute requireRoles={['admin']} />}>
        <Route path='/admin' element={<Admin />} />
      </Route>

      {/* 기타 잘못 들어온 페이지 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
