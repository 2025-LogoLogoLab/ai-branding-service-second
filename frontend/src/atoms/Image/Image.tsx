// src/atoms/Image.tsx
import styles from './Image.module.css'

type ImageProps = {
    src: string;
    alt?: string;
    variant?: 'thumbnail' | 'profile' | 'banner' | 'card' | 'logo' | 'logoExpCard';
};

export function Image({ src, alt = '', variant = 'thumbnail' }: ImageProps) {
    const className = styles[variant];
    return <img src={src} alt={alt} className={className} />;
}
