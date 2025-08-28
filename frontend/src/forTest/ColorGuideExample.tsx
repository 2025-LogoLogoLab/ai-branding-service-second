// src/forTest/ColorGuideExample.tsx
import ColorGuideStrip from '../organisms/ColorGuideStrip/ColorGuideStrip';
import type {colorGuide} from '../custom_api/colorguide';

const sample: colorGuide = {
  main:       { hex: '#1E90FF', description: '브랜드의 주 색상. 기본 버튼/링크에 사용.' },
  sub:        { hex: '#87CEFA', description: '보조 색상. 카드/배경 강조에 사용.' },
  point:      { hex: '#FF4500', description: '포인트 색상. CTA/강조 텍스트에 사용.' },
  background: { hex: '#F8FAFC', description: '배경 색상. 페이지 바탕 톤.' },
};

export default function ColorGuideExample() {
  return (
    <div style={{ padding: 24 }}>
      <h2>AI Color Guide</h2>
      <ColorGuideStrip
        guide={sample}
        labels={{ main: 'Main', sub: 'Sub', point: 'Point', background: 'Background' }}
      />
    </div>
  );
}
