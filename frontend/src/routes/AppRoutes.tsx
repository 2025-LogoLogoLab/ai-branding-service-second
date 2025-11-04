// src/routes/AppRoutes.tsx
// 라우팅이랑 App.tsx를 분리.
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import SignUp from '../pages/SignUp'
import MyPage from '../pages/MyPage'
import NotFound from '../pages/NotFound'
import AuthCallback from '../pages/AuthCallback'
import Logo from '../pages/Logo'
import Branding from '../pages/Branding'
import ColorGuide from '../pages/ColorGuide'
import DeliverablesAllPage, {
  DeliverablesBlueprintPreviewPage,
  DeliverablesBrandingPage,
  DeliverablesColorGuidePage,
  DeliverablesLogoPage,
} from '../pages/Deliverables'
import { ProtectedRoute } from './ProtectedRoute'
import Admin from '../pages/Admin'
import UnAuth from '../pages/UnAuth'
import SectionLayout from '../organisms/layout/SectionLayout/SectionLayout'
import AppShell from '../organisms/layout/AppShell/AppShell'
import AiSidebar from '../organisms/ai/AiSidebar/AiSidebar'
// import Tester from '../forTest/UItestPage'

const AppRoutes = () => {
  return (
    <Routes>
      {/* 전역 앱 셸: 헤더/푸터 공통 적용 */}
      <Route path="/" element={<AppShell />}>
        {/* 전체 공개 페이지 */}
        {/* <Route index element={<Tester />} /> */}
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="signUp" element={<SignUp />} />

        {/* AI 섹션: 좌측 사이드바 + 우측 페이지 조합 */}
        <Route
          path="logo"
          element={
            <SectionLayout sidebar={<AiSidebar />}>
              <Logo />
            </SectionLayout>
          }
        />
        <Route
          path="branding"
          element={
            <SectionLayout sidebar={<AiSidebar />}>
              <Branding />
            </SectionLayout>
          }
        />
        <Route
          path="colorGuide"
          element={
            <SectionLayout sidebar={<AiSidebar />}>
              <ColorGuide />
            </SectionLayout>
          }
        />

        {/* OAuth 콜백 및 권한 관련 */}
        <Route path="oauth/callback" element={<AuthCallback />} />
        <Route path="unauthorized" element={<UnAuth />} />

        {/* 로그인 된 사용자만 공개하는 페이지 */}
        <Route element={<ProtectedRoute />}>
          <Route path="myPage" element={<MyPage />} />
          <Route path="myProducts" element={<DeliverablesAllPage />} />
          <Route path="deliverables" element={<DeliverablesAllPage />} />
          <Route path="deliverables/logo" element={<DeliverablesLogoPage />} />
          <Route path="deliverables/branding" element={<DeliverablesBrandingPage />} />
          <Route path="deliverables/color-guide" element={<DeliverablesColorGuidePage />} />
          <Route path="deliverables/blueprint-preview" element={<DeliverablesBlueprintPreviewPage />} />
        </Route>

        {/* 관리자만 공개하는 페이지 */}
        <Route element={<ProtectedRoute requireRoles={["admin"]} />}>
          <Route path="admin" element={<Admin />} />
        </Route>

        {/* 기타 잘못 들어온 페이지 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
