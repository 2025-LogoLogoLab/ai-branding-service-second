// ---------------------------------
// 파일: src/forTest/DemoLogoStyleSidebar.tsx (데모 예제)
// ---------------------------------
import { useState } from 'react';
import { LogoStyleSidebar } from '../organisms/LogoStyleSidebar/LogoStyleSidebar';
import type  { LogoStyleKey } from '../types/logoStyles';

export const DemoLogoStyleSidebar: React.FC = () => {
    // 기본 선택값: 'cute' (임의). 실제 앱에서는 외부 상태/URL 파라미터 등과 연동 가능
    const [selected, setSelected] = useState<LogoStyleKey>('cute');
    const [all, setAll] = useState(false);

    return (
        <div style={{ display: 'flex', gap: 16 }}>
            <LogoStyleSidebar
                selected={selected}
                showAll={all}
                onSelect={(styleKey) => {
                    setSelected(styleKey);
                }}
                onShowAll={() => setAll(true)}
                // ✅ 전체보기에서 카드 클릭 시: 선택 적용 + 전체보기 해제
                onPickFromAll={(styleKey) => {
                    setSelected(styleKey);
                    setAll(false);
                }}
            />
        </div>
    );
};
