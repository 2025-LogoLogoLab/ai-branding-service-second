// frontend/src/pages/Home.tsx
// 랜딩 홈 페이지: 데이터 기반으로 섹션 컴포넌트를 조합해 렌더링
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HeroBanner from "../organisms/home/HeroBanner";
import ContentStrip from "../organisms/home/ContentStrip";
import FeatureSplit from "../organisms/home/FeatureSplit";
import DiagonalMediaBanner from "../organisms/home/DiagonalMediaBanner";
import styles from "./Home.module.css";

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const featureSections = useMemo(
    () => [
      {
        eyebrow: "AI Logo Generator",
        title: "높은 텍스트 구현율의 로고 생성",
        description:
          "FLUX 모델 기반으로 구축한 로고 생성기는 \n다른 서비스 대비 사용자가 표출하기를 원하는 \n텍스트를 정확하게 표현합니다.",
        ctaLabel: "로고 생성하기",
        onCtaClick: () => navigate("/logo"),
        image: { title: "로고 생성기", badge: "AI", chipLabel: "브랜드 워드", accent: "softBlue" as const },
        imagePosition: "right" as const,
      },
      {
        eyebrow: "Tailored Logo Design",
        title: "다채로운 로고 생성 옵션",
        description:
          "자유로운 해상도, 8개의 스타일, 3개의 타입을 바탕으로 \n여러분의 브랜드에 최적화 된 로고를 생성해보세요.",
        ctaLabel: "샘플 살펴보기",
        // onCtaClick: () => navigate("/branding"),
        image: { title: "AI 분석", badge: "브랜드 리서치", chipLabel: "브랜드 리서치", accent: "softGray" as const },
        imagePosition: "left" as const,
      },
      {
        eyebrow: "Brand Strategy",
        title: "브랜딩 전략",
        description:
          "사업에 맞는 가장 효율적이고 확실한 브랜드 설계를 제공합니다. \n앞서 생성한 로고 및 컬러 가이드와 일관된 전략을 제안할 수 있습니다.",
        ctaLabel: "지금 바로 추천 받기",
        onCtaClick: () => navigate("/branding"),
        image: { title: "로고 생성기", badge: "Workspace", chipLabel: "전략 메모" },
        imagePosition: "right" as const,
      },
      {
        eyebrow: "Color Guide",
        title: "컬러 가이드",
        description:
          "여러분의 브랜드 아이덴티티에 맞춰 조합한 \n팔레트와 추천 톤을 제안 받아보세요.",
        ctaLabel: "컬러 가이드 생성하기",
        onCtaClick: () => navigate("/colorGuide"),
        image: { title: "팔레트 제안", badge: "Guide", chipLabel: "브랜드 컬러", accent: "softBlue" as const },
        imagePosition: "left" as const,
      },
      {
        eyebrow: "Membership",
        title: "다양한 회원용 기능",
        description:
          user? "프로젝트 및 태그를 기반으로 \n작업물들을 효율적으로 관리하세요." : "지금 로고로고랩의 회원이 되시면 \n작업물들을 보다 효율적으로 관리할 수 있습니다.",
        ctaLabel: "살펴보기",
        onCtaClick: () => navigate(user ? "/myPage" : "/signUp"),
        image: { title: "워크플로우", badge: "Team", chipLabel: "작업 승인", accent: "softGray" as const },
        imagePosition: "right" as const,
      },
    ],
    [navigate, user]
  );

  return (
    <div className={styles.page}>
      <div className={styles.section}>
        <HeroBanner
          eyebrow="브랜드 관리, 한 번에"
          title={"까다로운 브랜딩, \n로고로고랩과 함께라면 간편합니다."}
          description={"AI 기반 로고, 브랜딩 도구로 발빠르게 아이디어를 시각화하고, 작업물까지 한 곳에서 관리하세요."}
          // helperText="사용 방법이 궁금하다면? 가이드를 확인하세요."
          primaryAction={{ label: "무료로 시작하기", onClick: () => navigate("/logo") }}
          secondaryAction={{
            label: user ? "내 산출물 보기" : "가입하고 계속하기",
            onClick: () => navigate(user ? "/myPage?section=products" : "/signUp"),
          }}
          // footnote={
          //   <>
          //     <span>잠깐, 지금까지 만든 결과물들이 궁금한가요?</span>
          //     <button
          //       type="button"
          //       className={styles.inlineLink}
          //       onClick={() => navigate("/myPage?section=products")}
          //     >
          //       산출물 바로 확인
          //     </button>
          //   </>
          // }
        />
      </div>

      <div className={styles.section}>
        <ContentStrip
          eyebrow="AI 기반 워크플로우"
          title="AI 기반의 빠르고 일관성 있는 브랜딩 솔루션"
          description={"인공지능의 힘을 활용하여 일관성 있는 브랜드 아이덴티티를 클릭 한번으로 완성하세요. \n로고로고랩에서는 여러분에게 특화된 결과물을 무료로 빠르게 확인할 수 있습니다."}
          ctaLabel="무료로 시작하기"
          // onCtaClick={() => navigate("/logo")}
        />
      </div>

      <div className={`${styles.section} ${styles.featureStack}`}>
        {featureSections.map(section => (
          <FeatureSplit key={section.title} {...section} />
        ))}
      </div>

      <div className={styles.section}>
        <DiagonalMediaBanner
          title="준비 중인 임베드 영역"
          description="영상 또는 이미지가 삽입될 예정인 영역을 미리 마련했습니다. 시연 영상, 데모 샘플, 고객 사례 등을 자유롭게 꽂아 사용할 수 있습니다."
          overlayText="다음 업데이트에서 만나보세요"
          ctaLabel="지금 가입하기"
          onCtaClick={() => navigate(user ? "/logo" : "/signUp")}
          muted
        />
      </div>
    </div>
  );
}

export default Home;
