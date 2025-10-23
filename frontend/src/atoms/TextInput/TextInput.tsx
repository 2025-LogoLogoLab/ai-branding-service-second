// src/atoms/TextInput/TextInput.tsx
// 어디서: Atom 레벨 입력창
// 무엇을: 기존 기능은 그대로 두고, className 전달만 추가
// 결과: 상위 컴포넌트(molecule)가 스타일을 덧씌울 수 있음

import React from 'react';
import styles from './TextInput.module.css';

export type TextInputProps = {
  value: string | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;          // 'text', 'email', 'password' 등
  name?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  minLength?: number;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onInvalid?: (e: React.FormEvent<HTMLInputElement>) => void;
  onInput?: (e: React.FormEvent<HTMLInputElement>) => void;
  ariaInvalid?: boolean;
  className?: string;     // 🔹 추가: 외부에서 스타일 덮어쓸 수 있도록
};

export function TextInput({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  name,
  id,
  disabled = false,
  required,
  minLength,
  min,
  max,
  step,
  pattern,
  onBlur,
  onInvalid,
  onInput,
  ariaInvalid,
  className,
}: TextInputProps) {
  return (
    <input
      className={`${styles.input} ${className ?? ''}`} // 🔹 추가
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      name={name}
      id={id}
      disabled={disabled}
      required={required}
      minLength={minLength}
      min={min}
      max={max}
      step={step}
      pattern={pattern}
      onBlur={onBlur}
      onInvalid={onInvalid}
      onInput={onInput}
      aria-invalid={ariaInvalid}
    />
  );
}

// ---
// src/atoms/TextInput/TextInput.tsx
// import React from 'react';
// import styles from './TextInput.module.css';

// export type TextInputProps = {
//     value: string | number | undefined;
//     onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//     placeholder?: string;
//     type?: string;          // 'text', 'email', 'password' 등 input 창 타입 지정
//     name?: string;      // 혹시 몰라 추가
//     id?: string;        // 혹시 몰라 추가
//     disabled?: boolean;
// };

// export function TextInput({     // 입력창 원자
//     value,
//     onChange,
//     placeholder = '',
//     type = 'text',
//     name,
//     id,
//     disabled = false,
// }: TextInputProps ){
//     return (
//       <input
//           className={styles.input}
//           value={value}
//           onChange={onChange}
//           placeholder={placeholder}
//           type={type}
//           name={name}
//           id={id}
//           disabled={disabled}
//       />
//     );
// };

// ---
