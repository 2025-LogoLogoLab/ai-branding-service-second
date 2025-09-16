// src/pages/Branding.tsx
// 페이지 컴포넌트: 사용자의 입력을 받아 custom_api를 호출하고,
// 결과를 BrandingCard(오가니즘)에 전달해 렌더링한다.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// ✅ 여기서 사용하는 API는 전부 src/custom_api/branding.ts 제공본
import {
  generateBranding,      // POST /brand-strategy/generate → string(마크다운) 반환
  saveBranding,          // POST /brand-strategy/save → 저장 메타 반환
  type BrandingResponse, // string alias
} from '../custom_api/branding';

import BrandingCard from '../organisms/BrandingCard/BrandingCard';
import BrandingForm from '../organisms/BrandingForm';
import { useAuth } from '../context/AuthContext';

function Branding() {
  const navigate = useNavigate();

  // 사용자 권한 불러오기
  const { user }= useAuth();

  // 입력/상태
  const [promptText, setPropmt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | undefined>(undefined);

  // 결과(없을 수 있으므로 null 허용)
  const [brandingResult, setBrandingResult] = useState<string | undefined>(undefined);

  useEffect(() => {
    // [테스트] 초기 더미 데이터 주입
    // - 이 코드는 개발 중 화면 스켈레톤 확인용
    // - 결과: 페이지 진입 시 더미 마크다운이 표시됨
    setBrandingResult('브랜딩 전략 **내용 예시**\n- 항목1\n- 항목2');
    setBase64(undefined);
  }, []);

  // 생성: custom_api.generateBranding 호출 → string(마크다운) 수신
  // 결과: string을 BrandingVM으로 감싸서 카드에 전달
  const handleBrandingGeneration = async () => {
    if (!promptText.trim()) {
      setError('브랜딩 전략 설명은 필수 입력 항목입니다.');
      return;
    }

    try {
      setError(null);
      const markdown: BrandingResponse = await generateBranding({ briefKo: promptText });
      // 결과: UI용 뷰 모델에 담아 상태 갱신
      setBrandingResult(markdown);
      // UI 상에서 알림 필요 시 추가 가능
      // alert('브랜딩 전략 생성 성공!');
    } catch (err) {
      console.error(err);
      setError('브랜딩 전략 생성 오류 발생');
    }
  };

  // 삭제: 서버 삭제 API를 쓰지 않고, 프론트 상태만 초기화
  // 결과: 카드가 화면에서 사라짐
  const handleBrandingDelete = () => {
    // id를 이용해 여러 개 중 특정 카드만 지우도록 확장 가능
    setBrandingResult(undefined);
  };

  // 저장: custom_api.saveBranding 규약에 맞춰 요청
  // 결과: 서버가 저장 id/메타를 반환(콘솔에서 확인). 성공 시 토스트/배너 등 표시 가능
  const handleBrandingSave = async () => {
      
    if (!brandingResult) {
        alert('저장할 브랜딩 전략이 없습니다.');
        return;
    }

    if (user === null ){    // 로그인된 사용자가 아니면 저장 불가.
        alert('로그인이 필요합니다');
        navigate('/login');
        return;
    }

    try {
      const saved = await saveBranding({
        briefKo: promptText, // 생성에 사용한 텍스트
        imageUrl: base64,
        markdown: brandingResult,      // 실제 전략 마크다운
        // style, projectId 등은 추후 UI에서 입력 받으면 채워넣기
      });
      console.log('[브랜딩 전략 저장] 응답:', saved);
      alert(`브랜딩 전략 저장 완료! (id: ${saved.id})`);
    } catch (err) {
      console.error(err);
      setError('브랜딩 전략 저장 오류 발생.');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 입력 폼: onSubmit에서 generate 호출 */}
      <BrandingForm
        promptText={promptText}
        error={error}
        onPromptChange={(e) => setPropmt(e.target.value)}
        onSubmit={handleBrandingGeneration}
      />

      {/* 결과 카드: 존재할 때만 표시 */}
      {brandingResult && (
        <BrandingCard
          brandingNum={0}
          promptText={promptText}
          data={brandingResult}
          onDelete={handleBrandingDelete} // (id) => void
          onSave={handleBrandingSave}     // (id) => void
          // onDownload, onTag, onInsertToProject는 추후 연결
        />
      )}
    </div>
  );
}

export default Branding;
