// src/utils/color.ts

// #RGB, #RRGGBB 허용
export function isValidHex(hex: string): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex.trim());
}

// #RGB -> #RRGGBB 로 확장 + 대문자 정규화
export function normalizeHex(hex: string): string {
  const h = hex.trim();
  if (!isValidHex(h)) return '#000000';
  if (h.length === 4) {
    // #abc -> #aabbcc
    const r = h[1], g = h[2], b = h[3];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return h.toUpperCase();
}

// 가독성을 위한 대비 텍스트 색상 선택 (WCAG 근사)
export function getContrastText(hex: string): '#000000' | '#FFFFFF' {
  const n = normalizeHex(hex);
  const r = parseInt(n.slice(1, 3), 16);
  const g = parseInt(n.slice(3, 5), 16);
  const b = parseInt(n.slice(5, 7), 16);

  // 상대 휘도 계산(가중치)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.57 ? '#000000' : '#FFFFFF';
}
