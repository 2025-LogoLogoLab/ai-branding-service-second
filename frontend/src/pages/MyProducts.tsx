// src/pages/MyProducts.tsx
// import BrandingList from "../forTest/BrandingList";
import ColorGuideList from "../forTest/ColorGuideList";
import LogoList from "../forTest/LogoList";

function MyProducts() {
    return (
      <div>
        <h1> My Products</h1>
        <h2> 로고 산출물 모음 </h2>
        <LogoList />
        {/* <h2> 브랜딩 전략 산출물 모음</h2>
        <BrandingList /> */}
        <h2> 컬러 가이드 산출물 모음</h2>
        <ColorGuideList />
      </div>
    );
}

export default MyProducts
