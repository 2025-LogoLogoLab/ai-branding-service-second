// src/atoms/TextInput/TextInput.tsx
import React from 'react';
import styles from './TextInput.module.css';

export type TextInputProps = {
    value: string | number | undefined;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;          // 'text', 'email', 'password' 등 input 창 타입 지정
    name?: string;      // 혹시 몰라 추가
    id?: string;        // 혹시 몰라 추가
    disabled?: boolean;
};

export function TextInput({     // 입력창 원자
    value,
    onChange,
    placeholder = '',
    type = 'text',
    name,
    id,
    disabled = false,
}: TextInputProps ){
    return (
      <input
          className={styles.input}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          name={name}
          id={id}
          disabled={disabled}
      />
    );
};

