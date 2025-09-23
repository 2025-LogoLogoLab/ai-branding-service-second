// ---------------------------------
// 파일: src/types/logoStyles.ts
// ---------------------------------
export type LogoStyleKey =| 'cute'| 'futuristic'| 'luxury'| 'tattoo'| 'watercolor'| 'vintage'| 'cartoon'| 'simple';

// 화면 표기용 한글 라벨. key는 내부 로직의 식별자, label은 사용자에게 보이는 텍스트
export const LOGO_STYLES: ReadonlyArray<{ key: LogoStyleKey; label: string }> = [
    { key: 'cute', label: '큐트' },
    { key: 'futuristic', label: '퓨처리스틱' },
    { key: 'luxury', label: '럭셔리' },
    { key: 'tattoo', label: '타투' },
    { key: 'watercolor', label: '수채화' },
    { key: 'vintage', label: '빈티지' },
    { key: 'cartoon', label: '카툰' },
    { key: 'simple', label: '심플' },
] as const;