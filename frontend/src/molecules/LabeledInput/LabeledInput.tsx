// src/molecules/LabeledInput/LabeledInput.tsx
import styles from './LabeledInput.module.css';
import { TextInput } from '../../atoms/TextInput/TextInput';
import type { TextInputProps } from '../../atoms/TextInput/TextInput';

export type LabeledInputProps = {
    label: string; // 입력 필드의 라벨 텍스트
    labelFor?: string; // 연결된 input의 id (옵션)
} & TextInputProps; // TextInput에서 쓰는 props를 모두 상속

export function LabeledInput({
    label,
    labelFor,
    ...inputProps
}: LabeledInputProps) {
    return (
        <div className={styles.wrapper}>
            {/* 라벨과 연결된 input이 연동되도록 htmlFor 속성 지정 */}
            <label htmlFor={labelFor} className={styles.label}>
                {label}
            </label>
            {/* TextInput 재사용 */}
            <TextInput id={labelFor} {...inputProps} />
        </div>
    );
}
