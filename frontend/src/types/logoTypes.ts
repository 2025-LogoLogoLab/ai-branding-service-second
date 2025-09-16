// ---------------------------------
// 파일: src/types/logoTypes.ts
// ---------------------------------
export type LogoType = 'TEXT' | 'ICON' | 'COMBO' ;

export const LOGO_TYPES: ReadonlyArray<{ key: LogoType; label: string }> = [
    { key: 'TEXT', label: '텍스트만 있는 로고' },
    { key: 'ICON', label: '그림만 있는 로고' },
    { key: 'COMBO', label: '그림 + 텍스트' },
] as const;