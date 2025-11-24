// ---------------------------------
// 파일: src/atoms/LogoExampleBox/LogoExampleBox.tsx
// ---------------------------------
import type { LogoType } from '../../types/logoTypes';
import styles from './LogoExampleBox.module.css';
import  OnlyImage  from '../../assets/images/logo_types/OnlyImage.png';
import { Image } from '../Image/Image';
import Text from '../../assets/images/logo_types/Text.png';
import ImageAndText from '../../assets/images/logo_types/ImageAndText.png';
import { LOGO_TYPES } from '../../types/logoTypes';

export type LogoExampleBoxProps = {
    type: LogoType;
};

const labelMap: Record<LogoType, string> = LOGO_TYPES.reduce((acc, { key, label }) => {
    acc[key] = label;
    return acc;
}, {} as Record<LogoType, string>);

const descriptionMap: Record<LogoType, string> = {
    TEXT: '브랜드 이름 표현을 최우선으로 한 \n심플한 타이포 로고',
    ICON: '상징적인 심볼/아이콘만을 \n사용하는 그래픽 로고',
    COMBO: '이미지와 텍스트를 조합해 \n종합적으로 표현한 로고',
};

// 로고 타입의 예시를 시각적으로 보여주는 Atom 컴포넌트
export function LogoExampleBox ({ type } : LogoExampleBoxProps) {
    return (
        <div className={styles.box} aria-label={`예시: ${type}`}>
            {type === 'TEXT' && (
                <div className={styles.centerCol}>
                    <Image src={Text} variant='logoExpCard'/>
                    <div className={styles.title}>{labelMap.TEXT}</div>
                    <div className={styles.caption}>{descriptionMap.TEXT}</div>
                </div>
            )}

            {type === 'ICON' && (
                <div className={styles.centerCol}>
                    <Image src={OnlyImage} variant='logoExpCard'></Image>
                    <div className={styles.title}>{labelMap.ICON}</div>
                    <div className={styles.caption}>{descriptionMap.ICON}</div>
                </div>
            )}

            {type === 'COMBO' && (
                <div className={styles.centerCol}>
                    <Image src={ImageAndText} variant='logoExpCard'/>                    
                    <div className={styles.title}>{labelMap.COMBO}</div>
                    <div className={styles.caption}>{descriptionMap.COMBO}</div>
                </div>
            )}
        </div>
    );
};
