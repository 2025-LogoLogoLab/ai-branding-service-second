// 파일: src/examples/DemoLogoTypeSidebar.tsx 

import { useState } from 'react';
import { LogoTypeSidebar } from '../organisms/LogoTypeSidebar/LogoTypeSidebar';
import type { LogoType } from '../types/logoTypes';

// 데모용 사이드바 예제 컴포넌트
export function DemoLogoTypeSidebar() {
    const [selected, setSelected] = useState<LogoType>('TEXT');
    const [all, setAll] = useState(false);

    return (
        <div style={{ display: 'flex', gap: 16 }}>
            <LogoTypeSidebar
                selected={selected}
                showAll={all}
                onSelect={(type) => {
                    setSelected(type);
                }}
            />
            <div>
                <button onClick={() => setAll((v) => !v)}>
                    {all ? '일반 보기' : '전체보기'}
                </button>
            </div>
        </div>
    );
};