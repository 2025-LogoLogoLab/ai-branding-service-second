// ---------------------------------
// 파일: src/atoms/LogoStyleExampleBox/LogoStyleExampleBox.tsx
// ---------------------------------
import React from 'react';
import styles from './LogoStyleExampleBox.module.css';
import type { LogoStyleKey } from '../../types/logoStyles';
// 예시 이미지: 사용자가 제공한 디렉터리 구조에 맞춰 정적 임포트
import imgCartoon from '../../assets/images/logo_styles/cartoon.png';
import imgCute from '../../assets/images/logo_styles/cute.png';
import imgFuturistic from '../../assets/images/logo_styles/futuristic.png';
import imgLuxury from '../../assets/images/logo_styles/luxury.png';
import imgSimple from '../../assets/images/logo_styles/simple.png';
import imgTattoo from '../../assets/images/logo_styles/tattoo.png';
import imgVintage from '../../assets/images/logo_styles/vintage.png';
import imgWatercolor from '../../assets/images/logo_styles/watercolor.png';
import { Image } from '../Image/Image';

export type LogoStyleExampleBoxProps = {
    // 표시할 스타일 키 (8개 중 하나)
    styleKey: LogoStyleKey;
    // 예시 하단 캡션을 표시할지 여부
    showCaption?: boolean;
    // 접근성/테스트를 위한 추가 클래스명 (선택)
    className?: string;
    //스타일 한글 라벨 전달받기
    label?: string; 
};

// 스타일 예시 이미지를 매핑하는 헬퍼 객체
const imageMap: Record<LogoStyleKey, string> = {
    cartoon: imgCartoon,
    cute: imgCute,
    futuristic: imgFuturistic,
    luxury: imgLuxury,
    simple: imgSimple,
    tattoo: imgTattoo,
    vintage: imgVintage,
    watercolor: imgWatercolor,
};

// 스타일별 설명 문구 매핑
const styleDescriptionMap: Record<LogoStyleKey, string> = {
    cute: '귀여운 느낌의 \n발랄하고 친근한 디자인',
    simple: '군더더기 없는 선과 \n현대적 폰트가 적용된 디자인',
    vintage: '바랜 질감과 \n클래식한 복고 감성',
    luxury: '프리미엄 감성을 살린 \n고급스러운 로고',
    tattoo: '굵은 블랙 라인의 \n올드스쿨 타투 스타일.',
    cartoon: '귀여운 동물 캐릭터를 \n담은 미니멀한 디자인',
    futuristic: '메탈릭하고 홀로그래픽한 \n효과로 미래적 분위기를 주는 디자인',
    watercolor: '수채화 터치와 파스텔 색감의 \n자연스러운 로고',
};

export const LogoStyleExampleBox: React.FC<LogoStyleExampleBoxProps> = ({ styleKey, showCaption = true, className, label}) => {
    const src = imageMap[styleKey];
    const description = styleDescriptionMap[styleKey] ?? '스타일 예시';

    return (
        // .box: 예시 카드를 감싸는 컨테이너 (고정 높이 + 중앙 정렬)
        <div className={`${styles.box} ${className ?? ''}`} aria-label={`스타일 예시: ${styleKey}`}>
            {/* .imageWrap: 이미지 비율을 보존하고 가운데 정렬하기 위한 래퍼 */}
            <div className={styles.imageWrap}>
                <Image
                    src={src}
                    alt={`${styleKey} 스타일 예시 이미지`}
                    variant={'logoStyleCard'}
                />
                {/* 스타일 이름 굵은 글씨로 추가 */}
                {label && <div className={styles.title}>{label}</div>}
                {/* .caption: 예시 하단 설명 텍스트 (옵션) */}
                {showCaption && <div className={styles.caption}>{description}</div>}
            </div>
        </div>
    );
};
