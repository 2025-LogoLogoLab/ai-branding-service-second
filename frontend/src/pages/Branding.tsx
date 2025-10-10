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

// old card/form kept for reference but not used in new UI
import PromptComposer from '../organisms/PromptComposer/PromptComposer';
import BrandingResult from '../organisms/BrandingResult/BrandingResult';
import { MarkdownMessage } from '../atoms/MarkdownMessage/MarkdownMessage';
import LoadingMessage from '../organisms/LoadingMessage/LoadingMessage';
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
  // 마지막 사용자 프롬프트(말풍선 표시용)
  const [lastPrompt, setLastPrompt] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // 초기 진입 시에는 아무 결과도 표시하지 않습니다.
  useEffect(() => {
    setBrandingResult(undefined);
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
      setLastPrompt(promptText);
      setLoading(true);
      const markdown: BrandingResponse = await generateBranding({ briefKo: promptText });
      // 결과: UI용 뷰 모델에 담아 상태 갱신
      setBrandingResult(markdown);
      if (!markdown || !markdown.trim()) {
        setError('응답이 비어 있습니다. 잠시 후 다시 시도해 주세요.');
      }
      // UI 상에서 알림 필요 시 추가 가능
      // alert('브랜딩 전략 생성 성공!');
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : '브랜딩 전략 생성 오류 발생';
      setError(msg);
    } finally {
      setLoading(false);
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
    <div style={{ padding: '12px 16px', display: 'grid', gap: 16 }}>
      {/* 상단 프롬프트 말풍선 (있을 때만) */}
      {lastPrompt && (
        <MarkdownMessage content={lastPrompt} isUser />
      )}

      {/* 결과 패널 */}
      {loading && <LoadingMessage />}
      {brandingResult && (
        <BrandingResult
          id={0}
          userPrompt={undefined}
          markdown={brandingResult}
          onDelete={handleBrandingDelete}
          onSave={handleBrandingSave}
        />
      )}

      {/* 하단 입력 컴포저 */}
      <PromptComposer
        value={promptText}
        placeholder="메시지를 입력하세요..."
        onChange={(e) => setPropmt(e.target.value)}
        onSubmit={handleBrandingGeneration}
        disabled={loading}
      />

      {/* 에러 배너 */}
      {error && (
        <div role="alert" style={{ color: 'var(--color-font-critical)' }}>{error}</div>
      )}
    </div>
  );
}

export default Branding;
