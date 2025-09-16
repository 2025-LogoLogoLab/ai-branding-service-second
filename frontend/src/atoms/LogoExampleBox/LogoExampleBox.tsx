// ---------------------------------
// 파일: src/atoms/LogoExampleBox/LogoExampleBox.tsx
// ---------------------------------
import type { LogoType } from '../../types/logoTypes';
import styles from './LogoExampleBox.module.css';

export type LogoExampleBoxProps = {
    type: LogoType;
};

// 로고 타입의 예시를 시각적으로 보여주는 Atom 컴포넌트
export function LogoExampleBox ({ type } : LogoExampleBoxProps) {
    return (
        <div className={styles.box} aria-label={`예시: ${type}`}>
            {type === 'TEXT' && (
                <div className={styles.centerCol}>
                    <div className={styles.bigWord}>LOGO</div>
                    <div className={styles.caption}>타입 예시</div>
                </div>
            )}

            {type === 'ICON' && (
                <div className={styles.centerCol}>
                    <div className={styles.iconCircle} />
                    <div className={styles.caption}>그림만 있는 로고</div>
                </div>
            )}

            {type === 'COMBO' && (
                <div className={styles.centerCol}>
                    <div className={styles.comboRow}>
                        <div className={styles.iconSquare} />
                        <div className={styles.comboText}>COMPANY LOGO</div>
                    </div>
                    <div className={styles.caption}>그림과 텍스트가 함께 있는 로고</div>
                </div>
            )}
        </div>
    );
};