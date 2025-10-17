import ColorGuideStrip from '../../../ColorGuideStrip/ColorGuideStrip';
import type { colorGuideGenResponse } from '../../../../custom_api/colorguide';

/**
 * Deprecated: 기존 오토핏 행 레이아웃 미리보기
 * 유지 목적: 실험용 레이아웃 비교를 위해 보관
 */
export type AutoFitRowPreviewProps = {
  guide: colorGuideGenResponse;
  className?: string;
};

export function AutoFitRowPreview({ guide, className }: AutoFitRowPreviewProps) {
  return (
    <div className={className} aria-label="colorguide-deprecated-row">
      <ColorGuideStrip guide={guide} />
    </div>
  );
}

